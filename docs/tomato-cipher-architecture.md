---
summary: TomatoCipher Engine 架构设计
---

# 1. Engine 总体架构

TomatoCipher Engine 以“解耦算法与业务”为核心目标，采用分层+插件化架构。核心原则：
1. **单一入口**：页面只调用 `CipherEngine` 暴露的 `encrypt/decrypt/restore/preview` 四个方法，禁止直接触摸 Canvas 或算法。
2. **可扩展算法栈**：所有算法实现遵守统一接口，通过 `CipherFactory` 和 `CipherContext` 进行生命周期管理，可随时新增 `TomatoCipherV2`、`ComicCipherV1` 等实现。
3. **平台隔离**：平台差异在 Adapter 层解决（WeApp/H5/App），Engine 仅依赖抽象接口。
4. **渲染引擎 + Provider 抽象**：Renderer 专注绘制；`ContentProvider` 负责从图片/漫画/长图/视频帧抽象出统一的块访问接口，保证 Engine 可扩展到二维内容混淆。
5. **Metadata 驱动**：所有加密、解密与还原只依赖 `CipherMetadata`，并通过 Seed+Level+算法配置重建所有随机指令。
6. **Worker 优先**：对大图或批量任务，Engine 可下沉至 Worker 执行，避免阻塞主线程。
7. **轻量存储**：V1 只实现 `MetadataStore`（本地），未来再扩展云端存储，避免早期过度设计。

运行流程概览：

```
page -> CipherEngine (Facade)
      -> CipherContext (持有 metadata/state)
      -> CipherFactory (选择算法/renderer/adapter)
      -> CipherAlgorithm (TomatoCipherV1 ...)
      -> Renderer (CanvasRenderer)
      -> Adapter (WeApp/H5/App)
      -> Storage / Metadata / Workers
```

# 2. 算法层设计

目录：`src/engine/tomato-cipher/algorithms/`

## 2.1 接口
```ts
interface CipherAlgorithm {
  encrypt(input: CipherContext): Promise<CipherResult>
  decrypt(input: CipherContext): Promise<CipherResult>
}
```
- `CipherContext` 提供原图像数据、Renderer、Adapter、PRNG、级别等信息。
- 算法只处理“像素排列规则”，不直接读写 Canvas。

## 2.2 PathGenerator 抽象
为避免把 Engine 绑定到单一曲线，引入：
```ts
interface PathGenerator {
  generate(rows: number, cols: number): Uint32Array
}
```
内置实现：
- `HilbertPath`（空间填充保持邻域）
- `GilbertPath`
- `SnakePath`（折线扫描）
- `SpiralPath`
- `RandomPath`

`CipherContext` 可按算法或配置选择 PathGenerator，方便 A/B 对比混淆效果。

## 2.3 TomatoCipherV1 流程
1. **内容提供**：通过 `ContentProvider` 获取统一的块视图（默认 `ImageProvider`）。
2. **切块**：根据 Level 确定 `blockSize`（64/48/32/24/16）。
3. **路径生成**：调用 PathGenerator 产出块访问顺序。
4. **Seed 置换**：利用 XorShift128+ PRNG 对块索引进行可逆置换。
5. **块旋转**：依据 PRNG 序列为每个块生成 0/90/180/270 旋转。
6. **块镜像**：同序列生成水平/垂直/无镜像指令。
7. **输出**：生成 `CipherMetadata`（仅包含重建所需参数）与 Renderer 任务描述。

## 2.3 可扩展性
- 每个算法保存在独立目录：`algorithms/tomato-v1/`, `tomato-v2/`, `comic-v1/`。
- 新算法只需实现 `CipherAlgorithm` 接口并注册到 `CipherFactory`。
- 算法可声明所需 PathGenerator/ContentProvider 组合。

# 3. 渲染层设计

目录：`src/engine/tomato-cipher/renderers/`

## 3.1 CanvasRenderer
职责：
1. 根据算法生成的块映射指令，调用 Adapter 提供的 Canvas API。
2. 完成切块绘制（`drawImage`）、旋转/镜像、合成与导出。
3. 输出 `CipherResult`（包含临时文件路径、Base64、Metadata）。

约束：
- 不做任何随机决策，不依赖 Seed。
- 只接受规范化的绘制任务列表，例如：
```ts
interface RenderTask {
  sourceRect: Rect
  targetRect: Rect
  rotation: 0 | 90 | 180 | 270
  mirror: 'none' | 'horizontal' | 'vertical'
}
```
- Renderer 可替换（未来支持 WebGLRenderer、OffscreenRenderer）。

# 4. 平台适配层设计

目录：`src/engine/tomato-cipher/adapters/`
```
adapters/
  weapp/
    ImageLoader.ts
    CanvasAdapter.ts
  h5/
  app/
```

统一接口：
```ts
interface PlatformAdapter {
  loadImage(source: CipherSource): Promise<LoadedImage>
  createCanvas(dim: Size): Promise<CanvasHandle>
  exportImage(canvas: CanvasHandle, options: ExportOptions): Promise<ExportResult>
}
```

职责：
- 解决 `uni.canvasGetImageData`、`wx.createOffscreenCanvas`、`HTMLCanvasElement` 等差异。
- 提供压缩、临时文件路径、相册保存能力。
- Engine 通过依赖注入获取 Adapter，业务无需感知平台细节。

# 5. Metadata 设计

目录：`src/engine/tomato-cipher/metadata/`

## 5.1 模型
```ts
interface CipherMetadata {
  version: string
  algorithm: string
  seed: string
  level: 1 | 2 | 3 | 4 | 5
  blockSize: number
  width: number
  height: number
  pathGenerator: string
  provider: string
  timestamp: number
  seedHash?: string // 预留，V2 可存加密或摘要
  extra?: Record<string, unknown>
}
```

说明：
- 不再存储 `rotation[]` / `mirror[]`，而是依赖 PRNG（Seed+Level+Path）实时重建。Metadata 体积稳定，与图像尺寸无关。
- Metadata 与输出图片绑定，可通过独立 JSON、EXIF、自定义头信息或 Storage 记录。
- 预留 `seedHash` 字段：未来可对 Seed 做加密/摘要，保护会员或私密内容。

# 6. Storage 设计

目录：`src/engine/tomato-cipher/storage/`

## 6.1 MetadataStore（V1）
- 仅负责保存/读取 `CipherMetadata` 与最少的操作记录。
- 实现方式：`uni.setStorage`/`wx.setStorage`/`localStorage` 封装。
- 接口：
```ts
interface MetadataStore {
  save(metadata: CipherMetadata): Promise<void>
  get(id: string): Promise<CipherMetadata | null>
  list(): Promise<CipherMetadataSummary[]>
}
```

## 6.2 CloudStorageProvider（占位）
- 文档中只描述扩展点和接口，暂不实现，待核心算法稳定后再投入。

# 7. Worker 设计

目录：`src/engine/tomato-cipher/workers/`

## 7.1 encrypt.worker.ts / decrypt.worker.ts
- 接收 `WorkerMessage`（包含原图数据、Metadata、算法配置）。
- 在 Worker 内实例化 `CipherEngine` 的无 UI 版本，执行耗时操作后回传结果。
- 主线程只负责进度显示，减少卡顿。
- V1 可提供空实现 + 接口，保证编译通过，后续再落地。

# 8. 插件扩展机制（V1 预留）

- 暴露 `registerPlugin(plugin: CipherPlugin)` 接口，仅登记插件，不执行任何钩子。
- 先确保核心算法上线，后续按需实现 `before/after` 钩子、漫画模式、云端备份等扩展。
- 文档保留接口草案，供未来参考：
```ts
interface CipherPlugin {
  name: string
  supports?(algorithm: string): boolean
  beforeEncrypt?(ctx: CipherContext): void | Promise<void>
  afterEncrypt?(result: CipherResult): void | Promise<void>
  beforeDecrypt?(ctx: CipherContext): void | Promise<void>
  afterDecrypt?(result: CipherResult): void | Promise<void>
}
```

# 9. Core 层概述

## 9.1 CipherEngine.ts
- Facade，暴露 API：
```ts
interface CipherEngine {
  encrypt(options: CipherOptions): Promise<CipherResult>
  decrypt(options: CipherOptions): Promise<CipherResult>
  restore(metadata: CipherMetadata, source: CipherSource): Promise<CipherResult>
  preview(metadata: CipherMetadata): Promise<PreviewResult>
}
```
- 内部组装 `CipherContext`（包含 Adapter、Renderer、算法实例、Level、PRNG、Storage、Workers）。

## 9.2 CipherFactory.ts
- 负责选择合适的 `CipherAlgorithm`、`Renderer`、`PlatformAdapter`。支持通过配置或 Metadata 自动匹配。

## 9.3 CipherContext.ts
- 存储运行时状态：原图引用、Adapter 句柄、Renderer、PRNG 实例、Level、Metadata、插件集合等。
- 提供便捷方法（如 `getPRNGSequence`, `getRenderTasks`）。

# 10. Seed / PRNG 系统

- 实现于 `src/engine/tomato-cipher/utils/prng.ts`。
- 方案：XorShift128+。
- 接口：
```ts
class XorShift128Plus {
  constructor(seed: bigint | [bigint, bigint])
  nextUint32(): number
  nextFloat(): number
  clone(): XorShift128Plus // 用于解密时重放序列
}
```
- 所有随机决策（置换、旋转、镜像）必须通过 PRNG，确保相同 Seed 与 Level 结果一致。

# 11. Permutation 系统

- 文件：`utils/permutation.ts`
- 方法：
```ts
function forwardPermutation(n: number, prng: PRNG): Uint32Array
function reversePermutation(perm: Uint32Array): Uint32Array
```
- 要求：
  - 生成可逆排列；
  - 解密时只需构造逆排列即可恢复；
  - 测试覆盖 `forwardPermutation(reversePermutation(perm))` 恒等。

# 12. Rotation 系统

- 文件：`utils/rotation.ts`
- 内容：
  - `applyRotation(rect: Rect, rotation: Rotation, renderer: Renderer)`
  - `inverseRotation(rotation)`
- Rotation 序列仅由 PRNG（Seed + index）实时生成，不写入 Metadata；解密/还原时重放同一 PRNG 序列即可。

# 13. Mirror 系统

- 文件：`utils/mirror.ts`
- 支持 `none/horizontal/vertical`，由 PRNG 决定且不写入 Metadata，保证 Metadata 尺寸固定。
- Renderer 根据指令执行 `scale(-1,1)`/`scale(1,-1)` 等操作。

# 14. Level 系统

- 文件：`core/levels.ts`
- 定义：
```
Level1: blockSize=64
Level2: blockSize=48
Level3: blockSize=32
Level4: blockSize=24
Level5: blockSize=16
```
- Engine 规则：切换 Level 始终从原图重新生成；禁止用已加密图再次加密。

# 15. Restore 系统

- `CipherEngine.restore(metadata, source)`：根据 Metadata（含 algorithm/seed/level/path/provider）恢复所有渲染任务，调用算法 `decrypt`，Renderer 输出原图。
- `source` 可以是：
  1. Engine 输出的加密图片（本地路径、Base64、临时文件）；
  2. 外部传入的已加密图片（用户自备）。
- Metadata 丢失场景：
  - 推荐在导出时嵌入 Metadata（PNG tEXt、JPEG APP marker 或自定义 JSON 头 `__tomato__`）。
  - 若图片内置 Metadata，则 `restore(source)` 可以自动解析；无法解析时再让用户提供独立 JSON。
- 允许“本地图片 + 内嵌 Metadata”无缝还原，降低用户遗失风险。

# 16. Worker & 扩展场景

- Worker 消息格式：
```ts
interface WorkerMessage {
  type: 'encrypt' | 'decrypt'
  metadata: CipherMetadata
  options: CipherOptions
}
```
- Worker 返回：`{ success: boolean, result?: CipherResult, error?: string }`
- 未来长图/批量处理只需扩展 Worker 入口，Engine 主体无需改动。

# 17. 单元测试策略

- 使用 Vitest / Jest。
- 覆盖：
  - PRNG 序列 determinism。
  - Hilbert 路径生成正确性。
  - Permutation 正反一致。
  - Rotation/Mirror 逆操作。
  - Encrypt → Decrypt → Restore 像素一致性（使用 mock Renderer/Adapter）。
- 为性能测试准备 1080×1920 图像基准，确保 Level3 加密/解密 <1000ms（可在 Worker 中模拟）。

# 18. 性能与内存考量

- 通过分块处理与 Hilbert 遍历减少缓存 miss。
- Renderer 支持逐块绘制 + `requestAnimationFrame`/Worker，以防 UI 卡顿。
- 小程序平台提供 `WeApp2DRenderer`（基于 `canvas type="2d"`），基础库 ≥2.9 时优先使用；仅在低版本或兼容模式下回退旧版 `canvas-id` 渲染。
- 引入 `ContentProvider` 目录：
```
providers/
  ImageProvider.ts
  ComicProvider.ts
  LongImageProvider.ts
  VideoFrameProvider.ts
```
  - 统一接口：
```ts
interface ContentProvider {
  getWidth(): number
  getHeight(): number
  getBlocks(blockSize: number): Iterable<Block>
  renderBlocks(tasks: RenderTask[]): Promise<void>
}
```
  - `TomatoCipherV1` 默认使用 `ImageProvider`。
  - 漫画/视频帧/长图可通过新增 Provider 支撑，不改动 Engine/算法主体。
- Adapter 层可启用 OffscreenCanvas（H5）或 `wx.createSelectorQuery().node`（小程序）提升性能。

# 19. Demo 页面约束

- Demo 仅调用 `CipherEngine` 接口进行上传、选择 Level、查看结果。
- 所有核心逻辑封装在 Engine 内部，确保未来迁移至其他宿主无需改动。

# 20. 下一步

1. 评审本架构文档。
2. 根据目录结构创建代码骨架（core/algorithms/renderers/...）。
3. 先实现 TomatoCipherV1 + CanvasRenderer + WeApp/H5 Adapter + LocalStorageProvider。
4. 补齐单元&性能测试，再实现 Demo 验证。
