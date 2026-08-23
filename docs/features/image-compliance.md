# 图片达标助手需求规格书（AI-Native Spec）

## 0. 元信息

| 项       | 内容                                             |
| -------- | ------------------------------------------------ |
| 功能名称 | 图片达标助手                                     |
| 所属域   | `subPackages/tools/image-compliance`             |
| 发布端   | H5 + mp-weixin                                   |
| 状态     | 功能实现完成，待真实接口与微信真机联调           |
| 关联文档 | Apifox `NODEJSDEMO/IMAGETOOLS` compliance 生成层 |

## 1. 业务上下文与页面流

用户选择报名照、证件照、头像或文件大小等目标规格，选择一张图片后查看原图差异，必要时调整固定比例裁剪区域，再由服务端统一处理尺寸、格式和文件大小。结果必须经过前端二次校验，只有全部指标通过时才展示“图片已达标”。

页面采用单页阶段状态：`rule -> image -> crop -> processing -> result`，一次只处理一张图片，并支持保留规则继续处理下一张。

### 1.1 路由与入口

| 页面       | 路由路径                                   | 跳转方式         | 来源入口       |
| ---------- | ------------------------------------------ | ---------------- | -------------- |
| 图片达标页 | `subPackages/tools/image-compliance/index` | `uni.navigateTo` | 图片工作区工具 |

- `src/pages.json` 在 `subPackages/tools` 分包新增 `image-compliance/index`，标题“图片达标助手”，`navigationStyle: custom`。
- `src/config/tools.ts` 注册 `image-compliance`，名称“图片达标”，描述“按尺寸、格式和文件大小一键处理”，属于 `image` workspace，不强制登录。
- 页面退出时清理 H5 Object URL 与小程序临时结果文件；页面栈不足时由 `PageLayout` 使用默认返回行为。

## 2. API 契约

| 功能       | 方法与路径                     | 鉴权                        | 调用位置                           |
| ---------- | ------------------------------ | --------------------------- | ---------------------------------- |
| 图片合规化 | `POST /image-tools/compliance` | Bearer JWT / 微信 X-Guest-Token / H5 X-Anonymous-Id | `features/image-compliance/api.ts` |

请求为 multipart/form-data：文件字段 `image`，表单字段为 `targetFormat/width/height/resizeMode/minFileSize/maxFileSize/crop`。`crop` 是 EXIF 方向修正后图片上的 0～1 normalized JSON 坐标。

公共 `http.upload` 负责 baseURL、Authorization、Token、X-Anonymous-Id、X-Guest-Token、Guest Session、401 刷新重试和统一响应错误，不在页面拼接身份请求头。

现有 Guest Session 基础设施仅在微信小程序创建 `wechat_mp` 会话；H5 未登录请求沿用全局 `X-Anonymous-Id` 身份，不额外生成 Guest Token。若服务端要求 H5 也必须携带 Guest Token，应作为全局身份体系改造单独处理。

Apifox 生成响应中的 `result` 类型不准确，业务模块以运行时收窄兼容 `result: string` 和 `result: { base64, mimeType, fileSize, width, height }`，不修改生成目录。

## 3. 交互约束

- 规则预设按常用场景、文件大小、其他分组；最近使用只保存最近 5 个规则参数，不保存图片或 Base64。
- 自定义规格支持成对宽高、JPG/PNG、最小/最大 KB、裁剪填满/完整保留。
- 原图超过 10MB 时前端直接阻止；选图后读取真实宽高、大小和格式并展示逐项差异。
- 目标宽高 + 裁剪填满时进入固定目标比例裁剪；支持拖动、双指缩放、滑杆缩放和重置。
- 请求期间按钮 loading/disabled，防止重复提交。
- 结果按格式、尺寸、文件大小二次校验；不完全达标时逐项显示失败原因，不展示达标状态。
- 已完全符合规格的原图可直接保存，不强制请求后端。

## 4. 主题与跨端

- 页面中性背景、表面、文本、描边和阴影使用 `--theme-*` token；状态色只用于通过、提醒和错误反馈。
- H5：Base64 转 Blob + Object URL，清理时 revoke；保存时触发 Blob URL 下载。
- mp-weixin：Base64 写入 `wx.env.USER_DATA_PATH` 临时文件，预览及保存使用本地路径，清理时删除临时文件。
- 文件选择统一使用 `filePicker.pickImage`；图片信息统一使用 `uni.getImageInfo` / `uni.getFileInfo`。
- 无 Web 标签、无裸 `uni.request`、无业务页面裸 `uni.uploadFile`；H5 DOM API 仅在条件编译块内使用。

## 5. 本期不做

不做批量上传、AI 人脸居中、换背景、抠图、滤镜、美颜、水印、OCR、OSS 自动上传，也不替换或重构既有图片压缩、格式转换、拼接工具。

## 6. 验收清单

- [x] 预设、自定义规格、最近使用规则已实现
- [x] 原图差异检测和 10MB 限制已实现
- [x] fixed-ratio normalized crop 已实现并覆盖边界测试
- [x] 登录与游客 multipart 请求复用公共身份体系
- [x] H5 Base64 预览、保存和 Object URL 清理已实现
- [x] mp-weixin Base64 临时文件、预览、相册保存和清理已实现
- [x] 达标与未完全达标结果文案及前端二次校验已实现
- [x] 相同规格处理下一张时清理图片状态并保留规则
- [x] 范围 ESLint、逻辑测试、路由检查、生成区边界检查与 mp-weixin 构建通过
- [x] `docs/changelog.md` 已更新

### 6.1 待真实环境验收

- [ ] 使用真实接口分别验证登录用户、微信游客及 Guest Token 过期恢复
- [ ] 验证服务端返回的 JPG/PNG Base64 在 H5 完成预览与下载
- [ ] 使用微信开发者工具或真机验证临时文件、预览、相册权限与保存
- [ ] 验证服务端无法满足文件大小区间时展示“未完全满足要求”
- [ ] 仓库既有全量 lint/type-check 错误及 H5 family-tree 构建阻断清理后，再运行完整双端质量门禁
