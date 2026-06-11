---
description: Light-weight image scrambler mode without embedded metadata
---

# 目标

在保留现有 TomatoCipher 引擎（带 metadata、多轮、可恢复）的同时，新增一个“轻量混淆模式”，满足以下场景：

- 用户需要把“加密后”的图片保存到微信相册、OSS、社交平台等会重新编码的渠道。
- 这些渠道会移除自定义 PNG chunk / JPEG COM 段，导致 TomatoCipher 无法解密。
- 轻量模式需做到：只依赖固定算法 + 密钥即可完成加/解密，不写 metadata，仍可逆。

# 范围

1. 定义一个新的 `SimpleScrambler` 引擎，实现固定规则的置乱/还原逻辑。
2. UI 支持在“高级（TomatoCipher）”与“轻量（SimpleScrambler）”之间切换，默认轻量模式，保留现有参数面板（密钥、网格、次数）但按模式调整可见性与提示。（已在 `index.vue` 中实现模式切换、提示与控件联动）
3. 轻量模式下的加/解密流程不依赖 metadata stack，也不会尝试写 metadata；高级模式维持原行为。

# 功能设计

## 核心算法

- 仍沿用现有 `ImageContentProvider`、`SnakePathGenerator`、`CanvasRenderer`，避免重复造轮子。
- 以 `grid`（默认 12）确定块大小：对齐 `getLevelConfig` 或按图片尺寸计算 blockSize，确保兼容不同分辨率。
- 使用 `CipherFactory.createPRNG(seed)` 产生 PRNG；基于现有 `forwardPermutation / reversePermutation` 生成映射。
- `encrypt`：按 `path` 顺序抽取 block，将其映射到 `permutation` 指定位置。
- `decrypt`：使用 `reversePermutation` 做逆映射。
- 返回结果不包含 metadata / metadataHistory。

## 引擎结构

```
src/engine/simple-scrambler/
  SimpleScrambler.ts     // 主类，暴露 encrypt / decrypt
  types.ts               // SimpleScramblerOptions, Result
```

- `SimpleScrambler` 内部复用 `CipherFactory` 解析 adapter / renderer / provider / pathGenerator。
- 不依赖 `CipherContext`；直接在类中组装所需对象。
- 错误处理：参数缺失时抛出清晰异常，由调用方捕获后 toast。

## UI 调整

1. 控制卡片顶部新增模式切换（Segmented 控件或两个按钮）：
   - `兼容模式（推荐）` → SimpleScrambler
   - `高级模式（含多轮、恢复）` → TomatoCipher
   （已完成：新建 `.mode-switch`、`.mode-chip` 样式并在模板中插入模式提示文案）
2. 兼容模式：
   - 保留密钥、网格控件；“叠加次数”固定为 1 或隐藏。（已隐藏）
   - `handleCipher` 调用 `runSimpleCipher`，不检查 `metadataStack`。✅
   - 结果描述显示“可保存后导入解密，但混淆强度较低”。✅
3. 高级模式：
   - 显示全部控件、metadata 提示。✅
   - 只有在高级模式下才运行 `expectEncryptedImport`、`debugMetadataInspection` 等逻辑。✅

## 状态管理

- 新增 `cipherMode` ref（'simple' | 'advanced'）。
- `metadataStack`、`expectEncryptedImport` 只在 `advanced` 下使用。
- `handleCipher` 根据 `cipherMode` 分派到 `runSimpleCipher` / `runTomatoCipher`。
- Simple 模式需要自己的 “正在处理” 状态与错误提示。

## 兼容性策略

- Simple 模式输出格式与输入一致（靠 adapter / renderer 决定），无 metadata，天然兼容微信/OSS。
- 高级模式行为不变；文案中提醒“若保存到会压缩的渠道，建议切换到兼容模式”。

# 测试计划

1. **Simple 模式**
   - 上传 → 加密 → 立即解密，确认像素恢复。
   - 上传 → 加密 → 保存到相册 → 重新导入 → 解密，依旧能恢复。
2. **Advanced 模式**
   - 现有 metadataStack 逻辑不回归。
   - 模式切换后重新上传/导入仍能检测 metadata。
3. **模式切换**
   - 在有图 / 无图状态之间切换，验证 UI 和状态（按钮、提示、metadataStack）同步。
4. **平台覆盖**
   - 微信开发者工具、H5 至少各验证一次 simple 模式可逆。

# 风险 & TODO

- Simple 模式的 blockSize 策略若与高级模式不同，需确认不会导致明显画质劣化。
- 如果未来需要支持“简单模式多轮”，需要设计序列化方式或重新引入 metadata；当前版本仅支持单轮。
