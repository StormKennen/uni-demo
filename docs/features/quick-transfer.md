# 飞船 Quick Transfer V2.3 需求规格书

## 0.1 V2.3 页面分离与分享流

V2.3 将飞船从单页多状态重构为职责清晰的管理页、发送创建页、创建人票据页和统一接收页。最终路由固定为：

```text
subPackages/tools/quick-transfer/index
subPackages/tools/quick-transfer/send/create
subPackages/tools/quick-transfer/send/result
subPackages/tools/quick-transfer/receive/index
subPackages/tools/quick-transfer/sent/list
subPackages/tools/quick-transfer/sent/detail
subPackages/tools/quick-transfer/receipt/list
subPackages/tools/quick-transfer/receipt/detail
```

管理页只负责三个 Tab：操作、我发送的、我收到的。操作 Tab 只提供发送飞船和接收飞船两个入口；发送与接收业务状态不得嵌入管理页。历史列表抽取为可嵌入管理页的组件，原 sent/receipt list 页面保留为兼容壳。

发送创建页复用 `QuickShipSendForm`，创建成功后将 `transferId/code/shareToken/expiresAt/claimCount/maxClaims/status` 写入 JS 内存 transient context，并使用 `redirectTo` 进入发送票据页。票据页负责当前飞船的分享、状态轮询、召回和终态展示；无 transient context 时只显示安全返回和历史入口，不展示空票据。票据页分享固定进入 Receiver 路由，不在历史详情中重新生成分享凭证。

Receiver 页面统一承载手工六位码和 `shareToken` 分享入口：分享进入先 Inspect，用户点击接收后才 Resolve；Resolve 成功后播放 arrive 动画，点击查看内容在当前页面展开正文。`claimRequestId` 继续只在当前页面内存中复用，网络未知结果重试复用原 ID，明确失败或成功后清除。

管理页右上角分享永远是工具分享：`飞船｜跨设备快速传递内容` → `/subPackages/tools/quick-transfer/index`；票据页右上角分享永远是当前飞船分享：`给你送来一艘飞船，点击接收` → `/subPackages/tools/quick-transfer/receive/index?shareToken=...`。动画 PNG 与分享封面常量分离，封面继续使用公开 HTTPS OSS URL。

所有本轮新增页面与 Quick Transfer 组件必须同时兼容 H5 和微信小程序；微信功能范围内的 button 清除原生 `button::after` 边框，每页只保留一个强主 CTA。

# 飞船 Quick Transfer V2.1 需求规格书

## 0. 范围

飞船 V2 覆盖 V1，不兼容 `type=text/url/file` 三选一模型。每艘飞船固定包含四类内容，顺序固定为：留言、链接、文件、引用。V2 不做排序、自由布局、历史记录、收藏、文件夹或多船管理。

V2.1 在当前操作链路之上增加云端已收记录；发送/接收页面归属 `subPackages/tools/quick-transfer`，发布端为 H5 与微信小程序，当前操作路由保持：

```text
subPackages/tools/quick-transfer/index
```

V2.1 新增历史路由：

```text
subPackages/tools/quick-transfer/receipt/list
subPackages/tools/quick-transfer/receipt/detail
```

## 1. 前端模型

Sender Draft：

```ts
interface QuickShipDraft {
  text: string
  links: Array<{ localId: string; title: string; url: string }>
  files: QuickShipFileDraft[]
  references: Array<{
    localId: string
    type: string
    resourceId?: string
    params?: Record<string, unknown>
    title: string
    subtitle?: string
  }>
  expiresIn: 600 | 3600 | 86400
  maxClaims: number
}
```

文件 Draft 仅在页面内存保留本地选择结果；Create 请求只发送 `clientFileId/name/size/mimeType`，禁止发送 `localPath`、`rawFile`。

## 2. API Adapter

业务只经 `src/features/quick-transfer/api.ts` 调用已导入的 Apifox 方法，生成目录不手工编辑：

| 能力          | Apifox 方法                           |
| ------------- | ------------------------------------- |
| Create        | `postQuickTransfers`                  |
| Share Inspect | `postQuickTransfersShareInspect`      |
| Resolve       | `postQuickTransfersResolve`           |
| Sender Status | `getQuickTransfersTransferId`         |
| Cancel        | `deleteQuickTransfersTransferId`      |
| File Complete | `postQuickTransfersFilesComplete`     |
| Upload Policy | `postQuickTransfersFilesUploadPolicy` |
| File Access   | `postQuickTransfersFilesAccess`       |

Response 为字符串或包装对象时，由 Adapter 统一解析。Inspect 的正式摘要字段为 `hasText/linkCount/fileCount/referenceCount`，Adapter 暂时兼容旧别名。Resolve 请求携带本次领取操作独有的 `claimRequestId`，响应统一为：

```text
claimId
transferId
receiptId（可选）
claimToken（有附件时必有）
expiresAt（可选）
content.text
content.links[]
content.files[]
content.references[]
```

## 3. Sender

页面固定展示“留言 / 链接 / 文件 / 引用”四个区域。留言允许为空；链接仅接受 `http/https`，支持添加、修改、删除；文件一行一个，不渲染图片宫格；引用只能由业务页面带入，不在飞船页内浏览资源。

至少存在一项内容才允许发送，并在前端提前校验：单文件不超过 50 MiB，最多 10 个文件，合计不超过 500 MiB；后端仍是最终校验来源。微信的 `image/fileType` 标签必须经过文件名推断为标准 MIME，0 字节文件禁止添加。

Create 后：

- 无文件：直接进入 `ready`。
- 有文件：按 `uploads[].clientFileId` 对应本地 Draft。
- Upload Queue 并发为 2，每个文件独立维护 pending/uploading/uploaded/completing/ready/error。
- 每个文件执行 OSS 直传后立即调用该文件的 Complete。
- 任一文件失败不会阻止其他文件继续上传；“重新上传失败文件”会批量重新获取失败文件 Policy，并按并发 2 重传，之后逐文件 Complete。
- Complete 只允许已完成 OSS 上传的文件参与；Complete 暂时失败只重新校验，不能把 pending/uploading 文件误当成已上传对象。
- `UPLOAD_DANGEROUS_CONTENT`、`UPLOAD_CONTENT_TYPE_MISMATCH` 等确定性错误不自动重试。

Ready 后显示收船码、倒计时、领取进度；H5 显示复制分享链接，微信只显示复制收船码和“分享给好友”。ready 状态不显示“再送一艘”，只有 consumed/expired/cancelled 才显示。

## 4. Receiver

手工输入 6 位收船码直接 `resolve({ code })`，不调用 Inspect。微信/H5 分享打开后先 `inspect({ shareToken })`，展示摘要、剩余领取次数和有效期；不提前展示正文、URL、文件名或引用标题。Inspect 成功后点击“收船”才 Resolve。

每一次新的领取操作生成新的 `claimRequestId`，只保存在 `useQuickTransfer` 内存中，不使用 Anonymous ID、Storage 或 Pinia 持久化。网络错误、超时、响应丢失和 5xx 后的用户重试必须复用原 ID；明确业务失败或成功后清除，下一次主动领取生成新 ID。

Resolve 成功后只保存当前页面内存中的 `claimToken`、`claimId`、`receiptId` 和 `expiresAt`，先显示“船来了”，点击“查看内容”才展开内容，不重复 Resolve。无附件飞船允许缺少 `claimToken`；有附件时缺少该凭证视为 Contract Error。展开后严格按留言、链接、文件、引用顺序展示；缺少的区块隐藏。

文件不随 Resolve 自动下载。点击文件时调用 `file/access(transferId,fileId,claimToken)` 获取 Signed URL，再交给平台文件 Adapter：图片预览，PDF/Office 打开文档，其他类型下载或提示。`CLAIM_TOKEN_INVALID/EXPIRED` 不自动 Resolve，页面明确提示重新收船可能再次占用领取次数。

## 5. Reference Registry

`src/features/quick-transfer/reference/registry.ts` 是唯一打开入口。Reference 核心数据只包含 `type/resourceId/params/title/subtitle`，禁止持久化 `path/route/navigateUrl`，禁止任意 `uni.navigateTo(reference.path)`。

当前正式注册：

- `memoDetail`：打开备忘录详情。
- `summonersWarCharacter`：打开魔灵召唤人物详情。
- `rtaRanking`：打开 RTA 榜单。

未知类型显示“当前版本暂不支持打开该内容”。备忘录详情已接入“用飞船发送”，通过页面内存 transient state 把一个 Reference 带入 Sender，不把完整 JSON 放进 query。

## 6. 鉴权与生命周期

- 微信游客发送沿用 Guest Token；登录发送沿用 User Token。
- H5 未登录默认收船，主动送船显示登录 Gate；登录返回后自动刷新并关闭 Gate。
- Share Inspect 继续跳过 Guest Session；Resolve 和当前飞船文件 Access 走正常请求链路，让微信游客获得 Guest Receipt，登录用户获得 User Receipt，H5 未登录继续允许匿名领取但没有历史 Receipt。
- `claimToken`、shareToken、OSS fields、Signed URL 只保留当前页面内存。
- Sender 的 poll/countdown 在 consumed/expired/cancelled、reset、hide/unload 时清理。

## 7. 错误映射

Adapter 兼容 `error.code`、`error.data.code`、`error.data.reason`、嵌套 error 及 HTTP 状态码。至少覆盖：

```text
TRANSFER_NOT_AVAILABLE
TRANSFER_NOT_FOUND
TRANSFER_ACTIVE_QUOTA_EXCEEDED
TRANSFER_DAILY_FILE_QUOTA_EXCEEDED
TRANSFER_UPLOAD_NOT_AVAILABLE
TRANSFER_FILE_NOT_FOUND
TRANSFER_FILE_ALREADY_READY
TRANSFER_OBJECT_NOT_FOUND
UPLOAD_VERIFICATION_FAILED
UPLOAD_DANGEROUS_CONTENT
UPLOAD_CONTENT_TYPE_MISMATCH
UPLOAD_PROBE_TEMPORARILY_UNAVAILABLE
CLAIM_TOKEN_INVALID
CLAIM_TOKEN_EXPIRED
TRANSFER_CLAIM_REQUEST_ID_INVALID
QUICK_TRANSFER_RECEIPT_NOT_FOUND
QUICK_TRANSFER_RECEIPT_FILE_NOT_FOUND
QUICK_TRANSFER_RECEIPT_FILE_NOT_AVAILABLE
QUICK_TRANSFER_RECEIPT_FILE_ACCESS_TEMPORARILY_UNAVAILABLE
QUICK_TRANSFER_OSS_NOT_CONFIGURED
QUICK_TRANSFER_NOT_CONFIGURED
```

网络错误、429、上传错误、Complete 校验错误、Claim Token 失效保持独立提示，不全部降级为服务不可用。

## 8. 验收

- 纯留言、纯链接、纯文件、纯引用及四类混合发送。
- 多图片/普通文件上传、单文件重传、逐文件 Complete、Complete 重试。
- 手工 code Resolve、分享 Inspect → Resolve、Inspect 后被其他人抢先领取。
- 文件 access、图片预览、文档打开、Claim Token 失效。
- Reference 合法打开、未知类型安全提示、备忘录入口带入。
- 微信游客/登录用户、H5 未登录/登录用户。
- Resolve 幂等领取、网络重试复用 `claimRequestId`、明确失败后重新生成 ID。
- 已收飞船列表分页、空状态、详情、删除和历史附件访问；历史查看不得再次 Resolve。
- `pnpm lint`、`pnpm type-check`、Quick Transfer 测试、`pnpm build:mp-weixin`、`pnpm build:h5` 及仓库检查，并区分既有基线错误。

## 9. 飞船视觉层（UI V3）

飞船页面采用“科技海报 Hero + 上浮操作舱”结构。Hero 由 CSS 渐变、光晕和轨迹装饰组成，不使用海报图片、Canvas 或粒子库；沉浸式导航通过 `PageLayout` 的 `navOverlay`、透明背景和 `light` 导航样式实现。Hero 只展示“飞船 / 跨设备快速传递内容”和“发送 / 接收”切换，不展示常驻飞船 PNG。

`src/features/quick-transfer/visual.ts` 只公开现有 OSS PNG 和两种 UI Transition 类型：`depart`、`arrive`。`QuickShipTransition` 是 fixed Overlay，仅负责一次性 CSS 动画、图片加载失败兜底和 `finished` 事件，不参与 API、上传、领取或定时器。发送按钮点击后立即播放 `depart`；Resolve 成功后播放 `arrive`，且 Arrive 通过独立方向容器水平翻转 PNG，让船头始终朝运动方向；动画结束或图片加载失败均收口 Overlay。H5 的 reduced-motion 环境关闭动画，但仍由生命周期定时器触发完成事件。

业务状态不再自动映射为常驻视觉状态。Ready、received、expired、cancelled 等状态只由业务面板展示，页面不显示悬浮飞船插画。发送内容收敛到一张“传输内容”卡，链接和文件添加按钮并排；有效期与领取次数使用跨 H5 / 微信小程序兼容的原生 `picker`；发送结果使用收船码票据样式，接收成功后再展开留言、链接、文件、引用内容。

发送或接收处于 `creating`、`uploading`、`completing`、`inspecting`、`resolving` 时锁定 Hero 的 Mode Switch，仅降低视觉强调，不弹 Toast；Ready、consumed、expired、cancelled、received 仍允许切换。Receive 的首次领取和手工码 retry 统一经过页面 `performReceive`，只有 Resolve 成功才播放 `arrive`，失败不会自动重试或占用领取次数。

## 10. V2.1 已收飞船

Receipt List / Detail 只通过 `src/features/quick-transfer/receiptApi.ts` 调用 Apifox 生成的 Receipt API，不复用 Resolve，也不把 `claimToken` 带入历史附件访问。列表使用后端 `page/pageSize` 分页，初始每页 20 条，支持下拉刷新和触底加载更多；列表摘要只展示留言、链接、文件和引用数量，预览最多展示一至两行。

微信游客和登录用户显示“已收飞船”入口；H5 未登录隐藏入口。入口放在接收模式操作区，不扩展 Hero 的发送/接收 Tab。没有记录时显示“还没有收到飞船 / 收到的内容会出现在这里”，不使用常驻飞船 PNG。

详情页复用 `QuickShipReceivedContent` 展示正文、链接、文件和引用。Receipt 文件 `available=false` 显示“已过期”并禁用操作；`available=true` 通过 Receipt File Access 获取 Signed URL 后交给平台文件 Adapter。文件访问返回不可用错误时将本地文件标记为不可用；临时错误保留可重试状态。删除只删除已收记录，不删除发送方文件、原飞船或 OSS 对象，成功后返回列表。

Receipt List → Detail 是历史查看，不播放 `arrive`，也不调用 Resolve。

## 11. V2.2 我发送的历史

发送模式在现有发送表单/发送结果区域增加「我发送的」辅助入口；接收模式继续只展示「已收飞船」，不新增第三个 Hero Tab，也不合并两套历史页面。

新增路由：

```text
subPackages/tools/quick-transfer/sent/list
subPackages/tools/quick-transfer/sent/detail
```

发送历史通过 `src/features/quick-transfer/sentRecordApi.ts` 调用 `QUICKTRANSFERSENTRECORD` 生成层：

- `getQuickTransferSentRecords`：分页获取我发送的飞船
- `getQuickTransferSentRecordsSentRecordId`：获取发送记录详情
- `deleteQuickTransferSentRecordsSentRecordId`：删除发送历史记录
- `postQuickTransferSentRecordsFilesAccess`：访问发送历史附件

发送历史与已收飞船分属独立业务模型。列表展示 `displayTitle`、`sentAt`、`status`、`claimCount/maxClaims`、摘要和预览；详情展示状态、领取进度和归一化后的 `QuickTransferContent`。后端状态只允许落入既有 `QuickTransferStatus`，`uploading/ready/consumed/expired/cancelled/deleting/deleted` 分别映射为「上传未完成/可领取/已领完/已过期/已召回/已结束/已结束」。

召回只在详情返回 `canRecall === true` 时显示，直接复用当前 `cancelQuickTransfer(transferId)`（`DELETE /quick-transfers/:transferId`），不修改当前发送 Session，也不调用删除发送历史接口。后端返回 `TRANSFER_NOT_FOUND` 或 `TRANSFER_NOT_AVAILABLE` 时提示「飞船状态已经更新」并刷新详情。

删除发送历史只调用 `deleteQuickTransferSentRecord(sentRecordId)`，不自动召回飞船；接收方 Receipt、已领取内容和发送方飞船状态不因删除历史而改变。发送历史不展示或重新生成旧收船码、`shareToken`、分享链接。

历史附件只通过 `postQuickTransferSentRecordsFilesAccess` 获取 Signed URL，再复用平台文件 Adapter 打开；不调用 Resolve、不调用当前飞船附件 Access、不携带 `claimToken`。`available === false` 直接显示「已过期」并禁用；永久不可用错误将本地文件标记不可用，临时错误保留重试能力。

微信游客和登录用户均可访问「我发送的」；H5 未登录仍隐藏该入口且不改变现有发送权限。列表 `onShow` 刷新，分页追加去重；下一页失败时保留已有列表并允许重试。详情缺少或包含非法 `sentRecordId` 时不请求接口，直接展示「记录参数无效」。本轮不做跨页面恢复上传、迁移接口、搜索、收藏、重发或历史分享。
