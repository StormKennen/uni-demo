# P0 移动端工具增强需求规格书（AI-Native Spec）

## 0. 元信息

| 项       | 内容                                      |
| -------- | ----------------------------------------- |
| 功能名称 | 二维码安全解析增强 / 图片隐私清理 / 文档扫描 |
| 所属域   | subPackages/tools                         |
| 发布端   | H5 + mp-weixin                            |
| 状态     | 开发中                                    |
| 关联文档 | `docs/features/000-existing-baseline.md`  |

## 1. 业务上下文与页面流

### 1.1 业务背景

用户在手机端常见的轻工具诉求是：扫码后判断内容是否安全、发图前处理敏感信息、把纸质资料快速整理成可保存/分享的图片文档。目标是在微信小程序端提供低摩擦、少权限、少广告感的原生体验，同时避开视频去水印、加密照片/视频等高审核风险能力。

### 1.2 页面流与路由

| 页面             | 路由路径（pages.json 注册位置）                      | 跳转方式         | 来源入口                      |
| ---------------- | ----------------------------------------------------- | ---------------- | ----------------------------- |
| 二维码解析增强   | `subPackages/tools/qr-parser/index`（既有）           | `uni.navigateTo` | 工具库二维码分类              |
| 图片隐私清理     | `subPackages/tools/image-privacy/index`（tools 分包） | `uni.navigateTo` | 工具库媒体分类                |
| 文档扫描         | `subPackages/tools/document-scan/index`（tools 分包） | `uni.navigateTo` | 工具库媒体分类                |

- 需要在 `src/pages.json` 中新增的路由路径：
  - `subPackages/tools/image-privacy/index`，`navigationBarTitleText: 图片隐私清理`，`navigationStyle: custom`
  - `subPackages/tools/document-scan/index`，`navigationBarTitleText: 文档扫描`，`navigationStyle: custom`
- 需要在 `src/config/tools.ts` 中注册的工具入口：
  - `image-privacy`：图片隐私清理，媒体分类，无需登录
  - `document-scan`：文档扫描，媒体分类，无需登录
- 页面返回/兜底行为：选择文件取消时不提示错误；生成失败统一 toast；保存失败提示检查相册权限。

## 2. 前后端 API 契约

本期不新增业务接口。微信小程序端涉及用户选择图片后，复用既有 `checkMediaSecurity(filePath, scene)`：

| 功能         | 方法与路径                    | 鉴权 | 调用封装                         |
| ------------ | ----------------------------- | ---- | -------------------------------- |
| 图片安全校验 | `POST /v1/security/media-check` | 可选 | `src/services/security.ts`       |

## 3. 交互约束

### 3.1 防重与防抖

- 生成按钮在处理中必须 `loading/disabled`。
- 图片选择取消不进入错误态。
- 多图扫描最多 6 张，避免小程序 canvas 过大导致崩溃。

### 3.2 状态与空态

- 二维码解析：解析成功后展示类型、风险提示、下一步操作；未解析时仅展示扫码/选图主按钮。
- 图片隐私清理：默认展示上传卡；选图后展示预览、清理选项和结果卡。
- 文档扫描：默认展示“拍照/相册选择”；选图后展示页面数量、处理模式、结果卡。

### 3.3 主题

所有页面中性背景、卡片、文字、描边使用 `--theme-*` token；按钮允许使用既有功能渐变强调。

## 4. 埋点

复用 `src/utils/tracker.ts` 的 `reportToolVisit(toolKey)`：

| 事件名 | 触发时机 | 参数 |
| ------ | -------- | ---- |
| 最近使用 | 页面 `onShow` | `qr-parser` / `image-privacy` / `document-scan` |

## 5. 条件编译与跨端兼容说明

- 二维码解析：小程序/APP 走 `uni.scanCode`；H5 保留相册图片解析能力。
- 图片隐私清理：H5 下载使用 `document.createElement('a')`，必须包在 `#ifdef H5`；小程序保存使用 `uni.saveImageToPhotosAlbum`。
- 文档扫描：本期双端均生成“文档长图”；PDF 导出不在小程序端承诺，页面提示后续可由 H5/服务端增强。
- 禁用项自查：不使用 Web 标签；不新增 npm 依赖；不新增后端接口；不使用裸 `uni.request`。

## 6. 验收清单

- [ ] H5 白天/夜间模式正常
- [ ] mp-weixin 白天/夜间模式正常
- [ ] 路由已在 `pages.json` 正确注册，无冲突
- [ ] `pnpm lint` / `pnpm type-check` 已执行并记录结果
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin` 通过
- [ ] `docs/changelog.md` 已同步更新
