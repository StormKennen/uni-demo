# 跨设备快传 Quick Transfer V1 需求规格书

## 0. 元信息

| 项目     | 内容                                           |
| -------- | ---------------------------------------------- |
| 功能名称 | 跨设备快传                                     |
| 所属域   | `subPackages/tools/quick-transfer`             |
| 发布端   | H5 + mp-weixin                                 |
| 状态     | 开发中                                         |
| 关联接口 | `src/services/apifox/NODEJSDEMO/QUICKTRANSFER` |

## 1. 产品范围与路由

临时传递文本、链接和单个文件，发送方生成一次性六位提取码，接收方无需登录即可领取。V1 不做历史记录、文件管理、多文件和 H5 匿名发送。

| 页面   | 路由路径                                 | 跳转方式         | 来源入口         |
| ------ | ---------------------------------------- | ---------------- | ---------------- |
| 快传页 | `subPackages/tools/quick-transfer/index` | `uni.navigateTo` | 文本工作区工具卡 |

- `src/pages.json` 在 `subPackages/tools` 分包注册 `quick-transfer/index`，标题为“跨设备快传”，使用 `navigationStyle: custom`。
- `src/config/tools.ts` 注册 `quick-transfer`，归属 `text` workspace，标记 `isNew: true`，不设置 `requiresAuth`，发送权限在页面内按平台和登录态判断。
- 页面 query 支持 `mode=receive&shareToken=...`；打开分享链接只切换到接收态，不自动消费。

## 2. 支持矩阵

| 场景             | 发送                   | 接收                                   |
| ---------------- | ---------------------- | -------------------------------------- |
| 微信小程序未登录 | Guest Session          | 支持，resolve 前不初始化 Guest Session |
| 微信小程序登录   | User Token             | 支持                                   |
| H5 已登录        | User Token             | 支持                                   |
| H5 未登录        | 不支持，跳转既有登录页 | 支持                                   |

微信发送沿用 `src/services/http.ts` 的 Guest Session；接收请求使用 `_skipGuestSession`，不把 `X-Anonymous-Id` 作为 Owner。

## 3. API 契约

页面业务直接调用 Apifox 生成方法，不新增 `src/services/quick-transfer.ts`：

| 功能         | 方法与路径                                   | 生成方法                               |
| ------------ | -------------------------------------------- | -------------------------------------- |
| 创建         | `POST /quick-transfers`                      | `postQuickTransfers`                   |
| 完成文件上传 | `POST /quick-transfers/:transferId/complete` | `postQuickTransfersTransferIdComplete` |
| 匿名领取     | `POST /quick-transfers/resolve`              | `postQuickTransfersResolve`            |
| 发送方状态   | `GET /quick-transfers/:transferId`           | `getQuickTransfersTransferId`          |
| 取消         | `DELETE /quick-transfers/:transferId`        | `deleteQuickTransfersTransferId`       |

生成类型中的 request/response schema 存在字符串或 `any` 缺口，业务层在 `features/quick-transfer/api.ts` 做运行时收窄，不修改生成目录。文件创建只提交 name、size、mimeType 元数据；OSS `upload.fields` 全量原样提交，成功状态严格比较 `upload.successStatus`。

## 4. 交互与状态

- 页面一级入口只有“我要发送”和“我要接收”。微信和 H5 登录用户默认发送；H5 未登录默认接收。
- 发送类型支持 text、url、file；有效期固定为 10 分钟、1 小时、24 小时，默认 10 分钟。
- 文件通过 `src/platform/file/filePicker` 选择，限制 50 MiB；文件链路为 Create → OSS POST → Complete → ready，Complete 暂时校验失败只重试 Complete，不重新上传。
- 发送成功后展示六位提取码、后端 `expiresAt` 倒计时、复制提取码、复制分享链接和取消；ready 后每 3 秒轮询发送状态，进入 consumed/expired/cancelled/deleted 后停止。
- 接收码自动过滤空格但不自动提交最后一位；shareToken 必须经过“确认领取”后才 resolve。Resolve 成功即 consumed，文件立即使用返回的 signed URL 下载；下载失败只复用当前 signed URL，不再次 resolve。
- code、shareToken、OSS fields、签名 URL 只保留在页面内存，不写入 storage、Pinia 或日志。

## 5. 跨端实现

- 选择文件统一使用 `src/platform/file`；H5 选择结果保留浏览器 `File`，微信使用临时路径。
- 微信使用 `uni.uploadFile` 直传 OSS；H5 因 `uni.chooseFile` 返回浏览器 `File`、而小程序路径上传契约不同，使用平台层 FormData/XHR fallback，页面不包含平台分支。
- H5 文件领取直接打开 signed URL，不代理和读取文件正文；微信使用 `uni.downloadFile`，图片预览，PDF/Office 尝试 `uni.openDocument`，其他类型只提示文件已准备。
- 微信具体快传分享仅放 `shareToken` 在 path query；朋友圈只分享普通工具页，不携带 transfer 凭证。

## 6. 验收清单

- [ ] 微信 Guest/User 发送 text/url/file，H5 登录用户发送 text/url/file
- [ ] 微信/H5 匿名接收，shareToken 打开不自动 resolve
- [ ] 文件 50 MiB 校验、原样 fields、动态 successStatus、Complete 重试
- [ ] 发送方倒计时、polling、cancel 及页面生命周期清理
- [ ] 文件 Resolve 后立即下载、失败复用 signed URL
- [ ] 纯逻辑测试覆盖 TTL、码、URL、文件大小、MIME、状态机、路由解析、错误映射和权限
- [ ] `pnpm lint`、`pnpm type-check`、双端构建及仓库检查完成并区分既有错误
- [ ] 微信 uploadFile/downloadFile 合法域名及生产 H5 OSS CORS 由人工配置
