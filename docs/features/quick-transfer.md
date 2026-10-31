# 飞船 Quick Transfer V2.3 需求规格书

## 0.1 V2.3 页面分离与分享流

V2.3 将飞船从单页多状态重构为职责清晰的管理页、发送创建页、飞船码结果页和统一接收页。最终路由固定为：

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

管理页负责操作区和历史记录区：操作区只提供发送飞船和接收飞船两个入口，历史记录区提供「发送记录 / 接收记录」两个 Tab。发送与接收业务状态不得嵌入管理页；历史列表抽取为可嵌入管理页的组件，原 sent/receipt list 页面保留为兼容壳。

发送创建页复用 `QuickShipSendForm`，创建成功后将 `transferId/code/shareToken/expiresAt/claimCount/maxClaims/status` 写入 JS 内存 transient context，并使用 `redirectTo` 进入飞船码结果页。结果页负责当前飞船的分享、状态轮询、召回和终态展示；无 transient context 时只显示安全返回和历史入口，不展示空结果卡片。结果页分享固定进入 Receiver 路由，不在历史详情中重新生成分享凭证。

Receiver 页面统一承载手工六位码和 `shareToken` 分享入口：分享进入先 Inspect，用户点击接收后才 Resolve；Resolve 成功后播放 arrive 动画，点击查看内容在当前页面展开正文。`claimRequestId` 继续只在当前页面内存中复用，网络未知结果重试复用原 ID，明确失败或成功后清除。

管理页使用微信小程序右上角原生分享菜单，分享永远是工具分享：`飞船｜跨设备快速传递内容` → `/subPackages/tools/quick-transfer/index`，不携带 `shareToken`。飞船码结果页使用同一原生分享菜单，分享永远是当前飞船分享：`给你送来一艘飞船，点击接收` → `/subPackages/tools/quick-transfer/receive/index?shareToken=...`。页面不增加自定义分享按钮。动画 PNG 与分享封面常量分离，封面继续使用公开 HTTPS OSS URL。

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
  title?: string
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

标题为可选项；标题、留言、链接、文件和引用不能全部为空。前端继续校验：单文件不超过 50 MiB，最多 10 个文件，合计不超过 500 MiB；文件限制后端仍是最终校验来源。微信的 `image/fileType` 标签必须经过文件名推断为标准 MIME，0 字节文件禁止添加。

Create 后：

- 无文件：直接进入 `ready`。
- 有文件：按 `uploads[].clientFileId` 对应本地 Draft。
- Upload Queue 并发为 2，每个文件独立维护 pending/uploading/uploaded/completing/ready/error。
- 每个文件执行 OSS 直传后立即调用该文件的 Complete。
- 任一文件失败不会阻止其他文件继续上传；“重新上传失败文件”会批量重新获取失败文件 Policy，并按并发 2 重传，之后逐文件 Complete。
- Complete 只允许已完成 OSS 上传的文件参与；Complete 暂时失败只重新校验，不能把 pending/uploading 文件误当成已上传对象。
- `UPLOAD_DANGEROUS_CONTENT`、`UPLOAD_CONTENT_TYPE_MISMATCH` 等确定性错误不自动重试。

Ready 后显示飞船码、倒计时、领取进度；H5 显示复制分享链接，微信保留“复制网页链接”，分享通过小程序右上角原生分享菜单完成。ready 状态不显示“再送一艘”，只有 consumed/expired/cancelled 才显示。

## 4. Receiver

手工输入 6 位飞船码直接 `resolve({ code })`，不调用 Inspect。微信/H5 分享打开后先 `inspect({ shareToken })`，展示摘要、剩余领取次数和有效期；不提前展示正文、URL、文件名或引用标题。Inspect 成功后点击“收船”才 Resolve。

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

飞船管理首页采用轻量文字页头、操作区与历史记录区结构。不加载分享封面图片、Canvas 或粒子库；分享功能仍通过 `QUICK_SHIP_SHARE_COVER_URL` 提供微信分享封面。首页只展示“飞船 / 文本、链接、图片、文件，快速送达另一端”和“发船 / 收船”操作，不展示常驻飞船 PNG。

`src/features/quick-transfer/visual.ts` 只公开现有 OSS PNG 和两种 UI Transition 类型：`depart`、`arrive`。`QuickShipTransition` 是 fixed Overlay，仅负责一次性 CSS 动画、图片加载失败兜底和 `finished` 事件，不参与 API、上传、领取或定时器。发送按钮点击后立即播放 `depart`；Resolve 成功后播放 `arrive`，且 Arrive 通过独立方向容器水平翻转 PNG，让船头始终朝运动方向；动画结束或图片加载失败均收口 Overlay。H5 的 reduced-motion 环境关闭动画，但仍由生命周期定时器触发完成事件。

业务状态不再自动映射为常驻视觉状态。Ready、received、expired、cancelled 等状态只由业务面板展示，页面不显示悬浮飞船插画。发送内容收敛到一张“传输内容”卡，链接和文件添加按钮并排；有效期与领取次数使用跨 H5 / 微信小程序兼容的原生 `picker`；发送结果使用飞船码结果卡片，接收成功后再展开留言、链接、文件、引用内容。

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

删除发送历史只调用 `deleteQuickTransferSentRecord(sentRecordId)`，不自动召回飞船；接收方 Receipt、已领取内容和发送方飞船状态不因删除历史而改变。发送历史不展示或重新生成旧飞船码、`shareToken`、分享链接。

历史附件只通过 `postQuickTransferSentRecordsFilesAccess` 获取 Signed URL，再复用平台文件 Adapter 打开；不调用 Resolve、不调用当前飞船附件 Access、不携带 `claimToken`。`available === false` 直接显示「已过期」并禁用；永久不可用错误将本地文件标记不可用，临时错误保留重试能力。

## 12. V3.1 管理与历史卡片

管理页保留操作区与历史记录区；操作区精简为同宽的「发飞船」和「收飞船」两个入口，不重复展示说明文字或箭头，历史记录区使用同页的「发送记录 / 接收记录」两个 Tab，默认加载发送记录，切换不跳转新页面。首页采用轻量文字页头以降低首屏密度。发送创建、飞船码结果、接收和分享页面架构不变。

Sent / Receipt 历史列表继续分别负责数据加载、分页、错误和导航，但每一条记录统一使用 `QuickShipHistoryCard` 展示。卡片直接消费后端的 `displayTitle`、`primaryType`、`summary.imageCount` 和 `summary.otherFileCount`，使用现有 `uni-icons` 显示文字、图片、文件、链接、引用或混合内容图标；Sent 额外在标题行显示状态，并将领取进度合并到时间行，Receipt 不显示发送方状态。

历史 Adapter 只允许 `text/image/file/link/reference/mixed` 六种 `primaryType`。旧接口或未知类型在 Feature Adapter 层安全回退，不根据 filename 猜测图片类型；图片类型永远不显示 `preview.fileName`，普通文件可以显示有意义的 `preview.fileName`。历史列表使用本地友好时间格式，详情页继续保留完整时间格式。管理页内嵌历史列表隐藏重复大标题，独立历史路由保留页面标题。

微信游客和登录用户均可访问「我发送的」；H5 未登录仍隐藏该入口且不改变现有发送权限。列表 `onShow` 刷新，分页追加去重；下一页失败时保留已有列表并允许重试。详情缺少或包含非法 `sentRecordId` 时不请求接口，直接展示「记录参数无效」。本轮不做跨页面恢复上传、迁移接口、搜索、收藏、重发或历史分享。

## 13. V3.2 首页收敛与发送反馈

管理首页不再展示 `操作 / 我发送的 / 我收到的` 三个顶层 Tab；页面固定为 Hero、同宽的「发船 / 收船」主操作，以及历史记录区的「发送记录 / 接收记录」两个同页 Tab。进入页面默认挂载并加载发送记录，切换接收记录时仍留在当前管理页，不新开历史容器；下拉刷新和触底加载只作用于当前 Tab。主操作区与历史记录区通过标题、分隔线和留白建立明显层级，历史 Tab 不与发船/收船使用同等按钮视觉。`?tab=sent`、`?tab=received` 作为旧入口继续由首页重定向到对应独立列表，`?tab=operation` 直接留在首页；`shareToken` 和 `mode=receive` 继续重定向到 Receiver。

发送创建页的「添加链接 / 添加文件」保持 Secondary Action 层级，使用主题边界增强识别度，不改既有选择器和弹层行为。主按钮只表达发送状态：空闲时固定为「发送飞船」，创建、上传、确认阶段显示对应进行中状态；标题可留空，但标题与内容不能同时为空。只有发送进行中或存在当前处理中飞船时禁用主按钮，文件/API 错误继续独立展示。

## 14. Quick Transfer 前端体验收口

飞船码是当前 6 位数字 Code 的统一产品名称。Ready 结果卡片在飞船码右侧提供复制图标，复制内容固定为 `飞船码：583921`，不再额外展示重复的文字复制按钮。

Receiver 输入框使用文本模式并允许整段粘贴；公共解析器优先识别 `飞船码：XXXXXX`、独立的 6 位英数字 token，再处理普通输入中的空格和大小写。解析后输入框只展示归一化结果；当前提交前校验仍严格遵守后端的 6 位纯数字契约，英数字结果仅作为未来兼容预留。

H5 继续复制当前 Hash Router 下的完整 Receiver URL。微信小程序的“复制网页链接”复用 `VITE_PUBLIC_THIS_H5_URL`，生成包含 `#/subPackages/tools/quick-transfer/receive/index?shareToken=...` 的完整 H5 URL；配置缺失、本机地址或相对路径时隐藏该入口，不复制无效链接。本轮不新增游客身份归属、H5 Guest Session、后端改造或 H5 → 微信 JS-SDK 分享。

## 15. 收船文件预览与下载收口

收船成功后不自动加载文件。只有 `image/*` 文件提供“预览”操作；微信小程序先通过 `file-access` 获取 Signed URL，再用 `uni.downloadFile` 下载到页面生命周期内的本地临时文件后调用 `uni.previewImage`，图片“保存”复用同一临时文件并调用 `uni.saveImageToPhotosAlbum`。H5 图片预览使用 Signed URL 的轻量全屏遮罩，图片下载继续使用浏览器 `<a download="displayName">`。

PDF、Word、Excel、PPT、ZIP 等非图片文件不提供预览，仅提供下载；微信小程序下载到本地后调用 `uni.saveFile`，H5 使用 `displayName` 作为浏览器下载文件名。页面级缓存只保留本地文件路径和有效期相关元数据，不持久化 Signed URL；微信本地文件不会因为远端 Signed URL 过期而重复下载。开发环境区分记录 `FILE_ACCESS_FAILED`、`DOWNLOAD_FAILED`、`PREVIEW_FAILED`、`SAVE_FAILED`，日志不输出 claimToken、shareToken 或完整 Signed URL。

## 15. 入口归类与发送引用选择

飞船工具入口归入「记录」分类，保留原有 Quick Transfer 路由、分享路径和历史深链不变，仅调整工具目录分类与目录内排序。

发送创建页的新增操作并列提供「新增文件」「新增链接」「新增引用」。引用通过 `QuickShipReferencePicker` 选择，先选择业务场景再选择内容。V1 仅开放「备忘录」场景，备忘录数据分别读取「我创建的」与「分享给我的」可访问集合，并在选项前展示 `[我的]` 或 `[分享]` 来源标识；确认后转换为现有 `memoDetail` Reference，不引入新的后端 Reference 类型。

## 16. V3.x 标题、历史记录管理与兑换券分享

Quick Transfer 的 `QuickShipDraft` 正式包含可选 `title`，标题与可选的 `text` 内容语义分离。标题在发送表单中置于内容区域顶部，单行、最多 40 个字符，发送前执行 trim 与长度校验；留言、链接、文件和引用均可为空，但整艘飞船至少需要标题或一项内容。`hasQuickShipPayload(draft)` 负责统一判断该规则。Create 请求仅在标题非空时携带 trim 后的 `title`，最终展示标题以后端返回的 canonical `title` 为准，发送结果上下文、Inspect / Resolve 接收结果及 Sent / Receipt 详情均保留并展示标题。

Quick Ship 文件 Draft 同时保留平台原始 `name`、前端稳定的 `defaultDisplayName` 和用户可编辑的 `displayName`。附件首次选择时按本地日期时间、同批序号和真实扩展名生成默认名；UI 只编辑主体，扩展名锁定，清空后在失焦或提交时恢复 `defaultDisplayName`。Create 请求保留原始 `name` 并发送最终 `displayName`；Response、接收内容、历史记录和下载提示优先展示 `displayName`，旧数据继续回退到 `name`。

历史记录列表以 `title` 为记录识别信息，旧数据仅在标题为空时兼容 `displayTitle`，最终回退为「飞船」；列表卡片不再主展示内容类型图标、summary 或 preview，仅保留标题、时间、必要状态/领取进度与右下角删除热区。删除入口先通过 `uni.showModal` 二次确认，按记录 ID 管理删除中状态，成功后移除当前卡片并提示「已删除」，失败时保留记录并提示「删除失败，请重试」。发送记录删除不召回飞船，接收记录删除不撤销领取；详情页不重复增加删除按钮。列表删除均通过 Quick Transfer Feature Adapter 调用已生成的 SentRecord / Receipt 删除 API。

魔灵召唤兑换券详情页的好友分享与朋友圈分享共用动态标题：保留现有固定前缀，有有效券码时追加 `｜券码`，券码未加载或为空时回退固定前缀；分享路径、详情参数和分享图片保持不变。

## 17. 飞船品牌图片统一

飞船视觉资源分为分享封面、工具入口图与动画图：微信小程序工具分享/收船分享封面使用公开 OSS 图片 `https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/quick-ship-share.jpg`，由 `QUICK_SHIP_SHARE_COVER_URL` 提供；管理首页采用轻量文字页头，不加载分享封面；工具目录入口与飞船动画继续使用 `https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/quick-ship.png`，由 `QUICK_SHIP_IMAGE_URL` 提供。管理首页副标题突出“分享给好友”，不将使用场景限制为跨设备传递。

`ToolItem` 支持可选 `image` 字段。工具入口存在 `image` 时使用 `<image mode="aspectFit">`，否则继续使用 `icon`；飞船入口只配置共享图片，不使用 `send`、`paperplane`、`transfer`、`paperclip` 等通用图标。横向图片在既有图标容器内允许更宽展示，但不得撑高工具卡片。
