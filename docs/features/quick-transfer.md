# 飞船 Quick Transfer V2 需求规格书

## 0. 范围

飞船 V2 覆盖 V1，不兼容 `type=text/url/file` 三选一模型。每艘飞船固定包含四类内容，顺序固定为：留言、链接、文件、引用。V2 不做排序、自由布局、历史记录、收藏、文件夹或多船管理。

页面归属 `subPackages/tools/quick-transfer`，发布端为 H5 与微信小程序，路由保持：

```text
subPackages/tools/quick-transfer/index
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

Response 为字符串或包装对象时，由 Adapter 统一解析。Inspect 的正式摘要字段为 `hasText/linkCount/fileCount/referenceCount`，Adapter 暂时兼容旧别名。Resolve 统一为：

```text
transferId
claimToken（有附件时必有）
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

Resolve 成功后只保存当前页面内存中的 `claimToken`，先显示“船来了”，点击“打开飞船”才展开内容，不重复 Resolve。无附件飞船允许缺少 `claimToken`；有附件时缺少该凭证视为 Contract Error。展开后严格按留言、链接、文件、引用顺序展示；缺少的区块隐藏。

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
- Receiver 请求跳过 Guest Session，不把匿名 Owner 身份带入。
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
- `pnpm lint`、`pnpm type-check`、Quick Transfer 测试、`pnpm build:mp-weixin`、`pnpm build:h5` 及仓库检查，并区分既有基线错误。

## 9. 飞船视觉层

飞船页面统一使用 `src/features/quick-transfer/visual.ts` 中的公开 OSS PNG，并由 `QuickShipVisual` 组件负责展示。组件只处理视觉状态、CSS 动画和图片加载失败兜底，不参与 API、上传、领取或定时器。

业务状态只映射为视觉状态：送船表单为 `idle`，创建/上传/Complete 为 `loading`，Ready 首次进入为 `departing` 后转为 `traveling`，收船成功为 `arrived`，过期为 `returned`，召回为 `cancelled`。H5 的 reduced-motion 环境关闭动画；图片加载失败时隐藏视觉但不影响业务流程。
