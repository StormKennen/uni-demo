# 长截图拼接增强 需求规格书（AI-Native Spec）

> 契约以 `src/services/apifox/NODEJSDEMO/IMAGETOOLS/**` 生成层为准，禁止臆测接口/字段。云端能力作为现有本地拼接的增强/兜底，不替代本地。

## 0. 元信息

| 项       | 内容                                     |
| -------- | ---------------------------------------- |
| 功能名称 | 图片拼接增强（聊天截图 / 遮挡 / 云端兜底） |
| 所属域   | subPackages/tools（image-stitch，已存在） |
| 发布端   | H5 + mp-weixin（双端必须）               |
| 状态     | 开发中                                   |
| 关联文档 | Apifox 项目 7048425 / IMAGETOOLS 生成层  |

## 1. 业务上下文与页面流

### 1.1 业务背景

现有 `image-stitch` 支持本地 canvas/海报拼接。增强目标：聊天截图模式（统一背景 + 遮挡敏感区），遮挡选项，以及当图片过多/本地生成失败时用云端拼接接口兜底。

### 1.2 页面流与路由

沿用现有页面 `subPackages/tools/image-stitch/index`，不新增路由。

## 2. API 契约（TypeScript，真实类型来自 IMAGETOOLS/interface.ts）

| 功能     | 方法与路径                | 鉴权     | 调用封装             |
| -------- | ------------------------- | -------- | -------------------- |
| 云端拼接 | `POST /image-tools/stitch` | 登录用户 | `postImageToolsStitch` |

```ts
import { postImageToolsStitch } from '@/services/apifox/NODEJSDEMO/IMAGETOOLS/apifox'
```

- 请求 body：`postImageToolsStitchBody = { images: any[]; mode?: string; masks?: string（JSON 数组或逗号分隔，如 ["top","bottom"]）; outputWidth?: number; gap?: number; backgroundColor?: string }`
- 返回：`postImageToolsStitchRes = { url?; fileName?; fileSize?; width?; height?; mimeType? }`

> `images` 生成层为 `any[]`。现有页面选图后已上传 OSS 并以 URL 存于 `images[].path`，故云端拼接传入这些图片 URL 数组（不新增字段、不改上传流程）。`mode`/`masks` 字段名与语义严格按生成层定义。

## 3. UI 增强

- 拼接模式选择：普通拼接 / 聊天截图 / 紧凑拼接。
- 遮挡选项（masks，可多选）：top / bottom / center / corners / avatar / nickname。
- 处理方式：本地生成 / 云端生成 / 自动（默认；本地失败或图片过多时走云端）。
- 结果区：本地结果沿用现有；云端结果展示 `url` 图片，操作保存 / 复制链接。

## 4. 本地拼接增强

- 保留现有本地 canvas/海报逻辑。
- 依 mode 调整：normal 保持现有；compact 减小 gap；chat 统一背景 + 遮挡区域。
- masks 绘制：top/bottom/center/corners 及 avatar/nickname（第一版按固定比例区域遮挡）。
- 小程序 canvas 极限：图片数量 > 8 或预计高度过高时提示改用云端生成。

## 5. 自动兜底策略

满足任一条件建议走云端：图片数量 > 8；预计导出高度过高；本地生成失败；小程序内存压力明显。提示文案：「图片较长，本地生成可能失败，是否改用云端生成？」。小程序端每次云端生成前提示会上传图片到服务器。

## 6. 条件编译与跨端兼容说明

- 复制链接 `uni.setClipboardData`；保存图片 mp-weixin `saveImageToPhotosAlbum`，H5 打开/下载 URL（`#ifdef H5`）。
- 不新增图片处理依赖；不破坏现有普通模式。

## 7. 验收清单

- [ ] 普通拼接不回归
- [ ] 聊天截图模式本地可生成遮挡长图
- [ ] 云端生成能返回 url 并展示
- [ ] 本地失败能引导云端
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin` 通过
- [ ] `docs/changelog.md` 已同步更新
