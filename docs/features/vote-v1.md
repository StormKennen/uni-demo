# 投票 Vote V1 前端需求规格书

## 0. 元信息

| 项目     | 内容                                         |
| -------- | -------------------------------------------- |
| 功能名称 | 投票 Vote V1                                 |
| 所属域   | `subPackages/tools/vote`                     |
| 发布端   | H5 + mp-weixin                               |
| 状态     | 开发中（真实 API 接入阶段）                  |
| 关联文档 | `src/services/apifox/NODEJSDEMO/VOTES`       |

## 1. 业务上下文与页面流

Vote 是面向微信群分享的轻量投票工具，V1 支持单选、多选、游客/登录参与、隐私可见性、结果展示、创建者关闭与公布结果。页面继续只依赖前端 Domain Contract，由业务目录中的 Repository 负责把 Apifox Vote 方法适配为领域模型。

### 1.1 页面流与路由

| 页面   | 路由路径                                | 跳转方式                            | 来源入口                         |
| ------ | --------------------------------------- | ----------------------------------- | -------------------------------- |
| 创建页 | `/subPackages/tools/vote/create`        | `uni.navigateTo`                    | 工具目录、Vote 详情页创建者入口  |
| 详情页 | `/subPackages/tools/vote/detail?id=xxx` | `uni.navigateTo` / `uni.redirectTo` | 创建成功、微信分享 |

需要在 `src/pages.json` 中新增：

- `vote/create`，自定义导航栏，标题“创建投票”。
- `vote/detail`，自定义导航栏、下拉刷新，标题“投票详情”。

需要在 `src/config/tools.ts` 中注册：

- 名称“投票”，路径 `/subPackages/tools/vote/create`，创建需要登录；详情分享与浏览支持游客；入口使用现有 uni-icons 图标。

详情页无参数或接口返回投票不存在时展示错误态；分享冷启动返回时使用 `safeBack` 的 `PageLayout` fallback 回到 `/pages/index/index`。

投票入口与接龙入口同属「记录」工作间，在 `src/config/tools.ts` 中作为相邻的一级工具注册；投票工具入口进入创建页，详情页继续通过微信分享路径直接访问。

## 2. 前后端 API 契约

### 2.1 当前阶段数据访问边界

所有 Vote HTTP 请求均通过已导入的 `src/services/apifox/NODEJSDEMO/VOTES/apifox.ts`，并且只在 `src/subPackages/tools/vote/repositories/api.ts` 中调用。`ApiVoteRepository` 将生成层的 `object` Response 通过运行时 Adapter 转换为本文 Domain Type；页面不直接依赖 Apifox DTO，也不创建 `src/services/vote.ts` wrapper。

当前接入的方法：

- `postVotes`：创建投票；客户端为无 ID 的新选项生成请求级稳定 ID。
- `getVotesVoteId`：读取详情、Viewer Capability、我的投票、可见结果。
- `getVotesVoteIdParticipants`：在拥有参与者权限时读取首屏参与成员并合并到详情。
- `postVotesVoteIdBallots` / `patchVotesVoteIdBallot`：分别提交新投票和修改已有投票。
- `patchVotesVoteId`：更新标题与说明。
- `postVotesVoteIdClose` / `postVotesVoteIdReveal`：关闭投票与手动公布结果。

创建页的截止时间为必填项，与后端 `schedule.endAt` 契约一致。

### 2.2 Domain Type

领域类型包括：`Vote`、`VoteOption`、`VoteRules`、`VoteViewer`、`VoteMyBallot`、`VoteResult`、`VoteParticipation` 与 `VoteDetail`。日期字段统一为 ISO string；权限按钮只由 `VoteViewer` 能力字段驱动。

## 3. 交互约束

- 创建标题必填，至少两个非空选项；多选最大选择数在 1 到选项数量之间。
- 创建页的截止时间为默认可见的必填项，不放在折叠的更多设置中；参与、隐私和结果展示设置作为可选项按需展开。
- 选项选择使用单选/多选语义；达到 `maxChoices` 后阻止额外选择并提示。
- 创建、提交、修改、关闭、公布结果期间按钮禁用，避免重复操作。
- 详情页覆盖 loading、ready-not-voted、ready-selecting、submitting、voted、editing、closed、waiting-reveal、revealed、error 状态。
- 结果展示使用后端/Mock 返回的 `percentage`，页面不重新计算百分比。
- 参与成员与“谁选择了什么”严格分离；只有 `canViewVoterChoices` 为真时才允许出现选择记录入口。匿名投票永不展示选择记录。

## 4. Mock 回归场景

Mock Repository 至少覆盖：单选、多选、游客投票、需要登录、公开身份、仅发起人可见、完全匿名、实时结果、投票后结果、关闭、等待公布、已公布、创建者管理。

`MockVoteRepository` 仍保留给单元测试使用，覆盖 Guest、结果可见性、匿名语义、修改投票和创建者管理；生产默认 Repository 已切换为 `ApiVoteRepository`，创建页不再展示会请求不存在的 Mock ID 的演示入口。

## 5. 跨端与分享

- 页面只使用 uni-app 标签与主题 token，不使用浏览器 API、裸 `uni.request` 或新增依赖。
- H5 与 mp-weixin 使用同一套创建/详情交互；`vote/create` 与 `vote/detail` 均显式开启微信右上角分享菜单，并注册 `onShareAppMessage` 与 `onShareTimeline`。
- 分享封面统一使用 OSS 地址 `https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/vote-share.jpg`；分享标题根据创建页填写的投票标题、详情页投票标题和投票状态动态生成。
- 分享路径只携带 Vote detail 路由和 `id`，当前不假定 `shareToken`。
- Guest 禁止参与时，提交失败由 ApiVoteRepository 映射为明确的 `LOGIN_REQUIRED`，页面通过现有登录页 `redirectUrl` 骨架回跳详情；不把所有 `canVote=false` 都当作登录问题。

## 6. 真实 API 接入完成项

- [x] Apifox VOTES 方法接入业务 Repository。
- [x] `object` Response 通过业务 Adapter 转换为 Domain Type，并兼容 camelCase / snake_case / `_id`。
- [x] 后端错误原因映射为 `VoteRepositoryError`，游客限制可回到登录页。
- [x] 创建、详情、参与者、提交、修改、关闭、公布与更新链路接入。
- [ ] H5 / mp-weixin 真机联调、登录态和 Guest Session 端到端验收。

## 7. 验收清单

- [ ] H5 白天/夜间模式：创建、详情、结果、管理、错误态
- [ ] mp-weixin 白天/夜间模式：创建、详情、结果、管理、分享
- [x] mp-weixin 构建
- [x] Domain Type 与 Api/Mock Repository 独立于生成 DTO
- [x] 路由和工具入口已注册
- [ ] `pnpm lint` / `pnpm type-check`
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin`
- [x] `docs/changelog.md` 已同步更新
