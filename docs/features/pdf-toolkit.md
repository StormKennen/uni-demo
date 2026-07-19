# PDF 轻工具箱 需求规格书（AI-Native Spec）

> 契约以 `src/services/apifox/NODEJSDEMO/PDFTOOLKIT/**` 生成层为准，禁止臆测接口/字段。所有请求经 Apifox 生成方法（内部走 `src/services/http.ts`）。

## 0. 元信息

| 项       | 内容                                            |
| -------- | ----------------------------------------------- |
| 功能名称 | PDF 轻工具箱                                    |
| 所属域   | subPackages/tools                               |
| 发布端   | H5 + mp-weixin（双端必须）                      |
| 状态     | 开发中                                          |
| 关联文档 | Apifox 项目 7048425 / PDFTOOLKIT 生成层         |

## 1. 业务上下文与页面流

### 1.1 业务背景

用户需要在移动端完成常见的 PDF 轻量处理：图片转 PDF、多个 PDF 合并、单个 PDF 拆分、PDF 压缩。后端已实现异步任务队列（创建任务 → 轮询状态 → 拿结果 URL），前端负责选文件、上传、创建任务、轮询与结果预览。

### 1.2 页面流与路由（MUST 填写，防路由冲突）

| 页面      | 路由路径（pages.json 注册位置）                | 跳转方式         | 来源入口                      |
| --------- | ---------------------------------------------- | ---------------- | ----------------------------- |
| 工具箱主页 | `subPackages/tools/pdf-toolkit/index`（tools 分包节点） | `uni.navigateTo` | 首页工具卡（config/tools.ts） |

- 需要在 `src/pages.json` 中新增的路由路径：
  - `pdf-toolkit/index`，`style.navigationBarTitleText = "PDF 工具箱"`，`style.navigationStyle = "custom"`
- 需要在 `src/config/tools.ts` 中注册的工具入口：
  - key `pdf-toolkit`，name「PDF 工具箱」，desc「转换/合并/拆分/压缩」，icon `paperclip`，category `media`，path `/subPackages/tools/pdf-toolkit/index`，`isNew: true`
- 页面返回/兜底行为：接口报错 toast 提示，不强制跳转；轮询超时提示「任务处理超时，请稍后在历史任务中查看」。

## 2. 前后端 API 契约（TypeScript）

### 2.1 接口清单（Apifox 生成方法，禁止手写 request）

| 功能         | 方法与路径                       | 鉴权     | 调用封装（apifox 生成层）      |
| ------------ | -------------------------------- | -------- | ------------------------------ |
| 上传文件     | `POST /pdf-toolkit/files`        | 登录用户 | `postPdfToolkitFiles`          |
| 创建任务     | `POST /pdf-toolkit/tasks`        | 登录用户 | `postPdfToolkitTasks`          |
| 任务列表     | `GET /pdf-toolkit/tasks`         | 登录用户 | `getPdfToolkitTasks`           |
| 任务详情/结果 | `GET /pdf-toolkit/tasks/{taskId}` | 登录用户 | `getPdfToolkitTasksTaskId`     |

```ts
import {
  getPdfToolkitTasksTaskId,
  getPdfToolkitTasks,
  postPdfToolkitTasks,
  postPdfToolkitFiles,
} from '@/services/apifox/NODEJSDEMO/PDFTOOLKIT/apifox'
```

### 2.2 TypeScript 契约（真实类型名，来自 PDFTOOLKIT/interface.ts）

- 上传：`postPdfToolkitFilesBody = { file: string }` → `postPdfToolkitFilesRes = { fileId?, mimeType?, originalName?, size?, url? }`
- 创建任务：`postPdfToolkitTasksBody = { fileIds: string[]; type: 'images-to-pdf' | 'merge' | 'split' | 'compress'; options?: postPdfToolkitTasksBodyOptions }`
  - `postPdfToolkitTasksBodyOptions = { orientation?: 'portrait' | 'landscape'; pageSize?: 'a4' | 'auto'; quality?: 'low' | 'medium' | 'high'; splitRanges?: string }`
- 创建任务返回：`postPdfToolkitTasksRes = { taskId?; status?: 'pending' | 'processing' | 'success' | 'failed'; progress? }`
- 任务详情：`getPdfToolkitTasksTaskIdRes = { taskId?; type?; status?; progress?; result?: any; errorMessage?; message? }`
- 任务列表：`getPdfToolkitTasksRes = object`（生成层未定义结构；前端按 `{ results?, list?, tasks? }` 宽松读取并做类型收窄，不臆造新字段）。

> 上传字段说明：生成层 `postPdfToolkitFilesBody.file` 为 `string`。因 Apifox 方法经 `http.post` 以 JSON 发送，前端将所选文件读为 base64 字符串填入 `file`（不新增手写上传 service、不调用 `uni.uploadFile`）。若后端实际要求 dataURL/multipart，仅需调整页面内 `readFileAsBase64` 一处。

### 2.3 错误与权限处理

- 401：由 http.ts 统一刷新重试。
- 未登录：进入页面提示登录（复用 oss-upload 的登录拦截模式）。
- 任务 `failed`：展示 `errorMessage`。

## 3. 交互约束

### 3.1 防重与防抖（MUST）

- 「上传并创建任务」按钮请求期间 `loading` / `disabled`。
- 轮询：`每 1500ms` 一次，最多 60 次；页面 `onUnload` 清理 timer，避免泄漏。

### 3.2 状态与空态

- 文件队列空态、任务进行中（pending/processing + progress）、成功（结果 URL）、失败（errorMessage）、历史任务空态。

### 3.3 主题

- 全部颜色走 `--theme-*` token，工具入口渐变仅用于首页卡片。

## 4. 埋点

`reportToolVisit('pdf-toolkit')`（复用现有 tracker，进入页面上报）。

## 5. 条件编译与跨端兼容说明

- 图片选择：`uni.chooseImage`（双端）。
- PDF 文件选择：mp-weixin `uni.chooseMessageFile({ type: 'file' })`；H5 `uni.chooseFile`（`// #ifdef` / `// #ifndef` 区分）。
- 读文件为 base64：mp-weixin `uni.getFileSystemManager().readFile({ encoding: 'base64' })`；H5 `fetch(path) → blob → FileReader.readAsDataURL` 后截取 base64。
- 结果预览：mp-weixin `uni.downloadFile` + `uni.openDocument`；H5 打开/下载结果 URL（`window.open`，在 `#ifdef H5` 内）。
- 禁用项自查：无 `div/span/img`、无裸 `uni.request`、无 `vue-router`、无写死颜色。

## 6. 验收清单

- [ ] 图片转 PDF：选图 → 上传 → 创建任务 → 轮询 → 结果 URL
- [ ] PDF 合并/拆分/压缩：选 PDF → 创建任务 → 结果
- [ ] 轮询无 timer 泄漏（离开页面即清理）
- [ ] mp-weixin 可 openDocument；H5 可打开结果 URL
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin` 通过
- [ ] `docs/changelog.md` 已同步更新
