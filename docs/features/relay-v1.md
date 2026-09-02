# 通用接龙 Relay V1 需求规格书

## 0. 元信息

| 项目 | 内容 |
| --- | --- |
| 功能名称 | 通用接龙 Relay V1 |
| 所属域 | `subPackages/tools/relay` |
| 发布端 | H5 + mp-weixin |
| 状态 | 开发中 |
| 关联文档 | 后端 `express-mongo-docker/docs/features/relay-core-v1.md`；前端 Apifox `NODEJSDEMO/RELAYS` |

## 1. 业务上下文与页面流

Relay 是通用的“主题 + 动态字段 + 参与者 + 接龙记录 + 统计”容器，不绑定聚餐、团建、游戏或拼车场景。V1 覆盖创建、分享、游客查看、昵称、参与、修改、撤回、图片和通用数量统计。

### 1.1 页面流与路由

| 页面 | 路由路径 | 跳转方式 | 来源入口 |
| --- | --- | --- | --- |
| Relay 首页 | `/subPackages/tools/relay/index` | `uni.navigateTo` | 工具目录 |
| 创建页 | `/subPackages/tools/relay/create` | `uni.navigateTo` | Relay 首页 |
| 详情页 | `/subPackages/tools/relay/detail?id=xxx` 或 `?shareCode=xxx` | `uni.navigateTo` | 首页列表、分享链接 |
| 参与/修改页 | `/subPackages/tools/relay/submit?id=xxx` | `uni.navigateTo` | 详情页 |
| 管理页 | `/subPackages/tools/relay/manage?id=xxx` | `uni.navigateTo` | 详情页 owner 操作 |

Relay 工具入口不设置 `requiresAuth`，首页工作台和工具目录统一使用 `https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/relay-icon.jpg` 作为功能图标。创建动作使用现有登录页并通过 `redirectUrl` 回到创建页；详情分享无上一页时安全返回 Relay 首页。

## 2. 前后端 API 契约

所有业务请求直接调用 `src/services/apifox/NODEJSDEMO/RELAYS/apifox.ts`；禁止新增 Relay API wrapper，禁止修改 Apifox 生成文件。

| 功能 | 方法与路径 | 前端方法 |
| --- | --- | --- |
| 创建 | `POST /v1/relays` | `postRelays` |
| 我的接龙 | `GET /v1/relays/mine` | `getRelaysMine` |
| 分享详情 | `GET /v1/relays/shared/:shareCode` | `getRelaysSharedShareCode` |
| 详情 | `GET /v1/relays/:relayId` | `getRelaysRelayId` |
| 更新/删除/关闭/重开 | `PATCH/DELETE/POST /v1/relays/:relayId...` | `patchRelaysRelayId`、`deleteRelaysRelayId`、`postRelaysRelayIdClose`、`postRelaysRelayIdReopen` |
| 当前参与者 | `GET/POST/PATCH /v1/relays/:relayId/participants/me` | `getRelayIdParticipantsMe`、`postRelayIdParticipantsMe`、`patchRelayIdParticipantsMe` |
| 接龙记录 | `GET/POST/PATCH/DELETE /v1/relays/:relayId/entries...` | `getRelaysRelayIdEntries`、`postRelaysRelayIdEntries`、`patchRelaysEntries`、`deleteRelaysEntries` |

生成 Response 类型过宽时，Relay 业务目录通过 `unknown` normalize 为 ViewModel；详情、统计和分页均以服务端返回为准。

## 3. 交互与状态

- Relay 首页支持“我参与的 / 我创建的”，列表分页由后端返回的 `pagination` 驱动；游客仅请求 `role=participant`，不伪造本地数据。
- 分享详情只包含 `id` 或 `shareCode`，不包含 JWT、`X-Guest-Token` 或 Entry 凭证。
- 微信小程序使用现有 Guest Session；H5 公开分享可查看，参与写入若无正式登录则进入现有登录流程。
- 详情页根据后端 `permissions` 显示参与、修改、撤回、管理按钮；关闭、截止、满员只作为后端权限和状态的展示。
- 动态字段支持 `text`、`textarea`、`number`、`image`、`single_select`。数量统计根据 `statistics.aggregates[field.key]` 和字段 label 展示。
- Entry 使用后端 `sequenceNo`，不以前端数组 index 重新编号。
- Entry 提交使用客户端请求 ID 防重复提交；请求期间按钮禁用。图片上传中禁止提交，失败支持重试或删除。

## 4. Preset

- 自由接龙：`text`、`textarea`、可选 `image`，不默认聚合。
- 活动报名：`text`、`number + aggregate=sum`、`textarea`、可选 `image`。
- 晒图接龙：`text`、`textarea`、必填 `image`。

Preset 只负责构造后端动态字段，不对用户暴露 schema designer。

## 5. 图片与跨端

图片选择复用现有 `src/utils/upload` 和 OSS 签名能力；上传 OSS 后通过现有 `postFiles` 创建 File 记录，Entry 只保存 File ID 数组和展示 URL。后端规定游客不能引用 User File，因此游客图片字段提示登录后上传。

页面只使用 uni-app 标签和 `rpx`/百分比布局；平台差异通过条件编译处理。H5 分享使用 `uni.setClipboardData`，小程序详情页注册 `onShareAppMessage`。

## 6. 验收清单

- [ ] H5 白天/夜间模式：首页、创建、详情、参与、管理
- [x] mp-weixin 白天/夜间模式：分享打开、Guest Session、图片选择、预览
- [x] Relay 全部 5 个页面支持微信右上角分享，好友消息卡片统一使用 `https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/relay-share.jpg`
- [ ] 5 条 Relay 路由已注册且无既有路由改动
- [ ] `pnpm lint` / `pnpm type-check`
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin`
- [ ] `pnpm check:generated-boundary`
- [ ] `docs/changelog.md` 已同步更新
