# 动物叫声大全 — 前端功能规格书

> 状态：开发中；后端 OpenAPI 是唯一接口真理源。新路由先在此登记，之后才可编辑 pages.json。

## 0. 元信息

| 项       | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 功能名称 | 动物叫声大全                                                                       |
| 发布端   | H5 + 微信小程序                                                                    |
| 域       | tools 分包，游客可用                                                               |
| 页面     | /subPackages/tools/animal-sounds/index、/subPackages/tools/animal-sounds/detail    |
| 入口     | src/config/tools.ts key=animal-sounds，workspace=entertainment，requiresAuth=false |

## 1. 目标、范围与页面流

游客浏览动物/分类、搜索和筛选，双列卡片快速播放；切到单卡片 swiper 模式左右翻页并切换正反面；详情查看同动物声音样本、来源许可及科普说明。P0 含共享的单播放器及签名过期有限恢复。不申请麦克风；不自动播放、不后台播放。P1 本地收藏/最近/随机延后；P2 游戏/识别/录音/AI 明确不做。

列表 → 详情使用 uni.navigateTo；播放按钮不触发卡片跳转/翻面。切换列表/卡片保留筛选及当前动物；翻页不自动播放。页面 onHide 停播，onUnload 销毁并清理事件。请求竞争通过序号取消旧结果，分页双闸、筛选重置页码、300–500ms 搜索防抖。

## 2. API 合同（需先由后端实现并同步 Swagger/Apifox）

| 功能          | 方法与路径                                      | 鉴权 |
| ------------- | ----------------------------------------------- | ---- |
| 分类          | GET /v1/animal-sounds/categories                | 游客 |
| 动物分页筛选  | GET /v1/animal-sounds/animals                   | 游客 |
| 动物详情      | GET /v1/animal-sounds/animals/{animalId}        | 游客 |
| 动物声音分页  | GET /v1/animal-sounds/animals/{animalId}/sounds | 游客 |
| 声音类型/标签 | GET /v1/animal-sounds/sound-types、/tags        | 游客 |
| 声音来源详情  | GET /v1/animal-sounds/sounds/{soundId}          | 游客 |
| 播放签名      | GET /v1/animal-sounds/sounds/{soundId}/play-url | 游客 |

目标是使用生成的 Apifox 客户端并通过 src/services/http.ts；禁止手写 src/services/apifox/\*\*。当前本地仅有 Apifox VS Code 插件配置，私有凭证未读取、远端导入/客户端生成尚未执行，因此本分支暂以 feature-local api.ts 经 http.ts 按此处和后端 Swagger 契约实现请求适配；这是临时偏差，不代表 Apifox 已同步，联调前需在获授权的插件环境生成并替换此适配层。页面不得臆造接口或展示假数据，应显示真实空/错误状态。

## 3. 交互和状态

列表初载骨架、空态、错误/重试、图片占位、无更多；下拉刷新和触底分页。声音筛选匹配一条声音同时满足所有 tag/type。双列卡片有封面、中文英文名、声音数量、可点播放；切到 swiper 显示大封面、名称、序号、代表播放、声音入口；点击非操作区正反面切换，背面显示介绍、科学名、分类、声类入口及详情跳转。详情分组列样本名称、类型、标签、时长、播放状态、版权来源。

共享播放器 uni.createInnerAudioContext()：idle/loading/playing/paused/stopped/ended/error，存当前 sound/animal、时间、url expires、请求序号。任一时刻最多一个实例；切换声音或签名刷新时先销毁旧 context，再创建新 context，并以会话/上下文代次阻止迟到响应或事件污染当前态；播放/暂停状态由播放器操作同步更新，ended/error/timeupdate 由当前 context 监听；地址错误至多刷新签名一次；页面隐藏停播；卸载销毁；不设循环/后台模式/麦克风。

## 4. 视觉与多端

使用真实审核动物图片，统一比例、主题 token、圆角和明显大播放点击区。全使用 uni-app 组件，不用 Web 标签、裸 request、window/localStorage、px。样式用 --theme-\* 变量；图片明确 mode。3D 翻面不支持时降级为正反内容切换。播放器遵循 H5 手势策略和 MP-Weixin 媒体域名限制；开发工具 urlCheck 不代表正式域名通过。manifest 不改。真机未测试明确 NOT_RUN。

## 5. 测试/验收

测试列表/错误/搜索 debounce/请求序号/分页/模式与位置保持/翻牌/播放状态机/过期签名一次刷新/卸载清理。当前验证：`pnpm build:h5`、`pnpm build:mp-weixin` 均 PASS；`pnpm test:run` PASS（162 files/910 tests，Vitest 同时扫描 `.agents/worktrees` 和 `.pnpm-store` 副本，存在重复项）；另用 `pnpm exec vitest run --root src --config ../vitest.config.ts` 只跑当前源树，PASS（34 files/200 tests，未包含这些副本），其中播放器 6/6 PASS。`pnpm type-check` FAIL，错误集中在 memo/editor、calendar、OSS 等与本功能无关的模块，扫描输出未发现 animal-sound 路径错误。真机 iOS/Android、小程序域名、H5/MP-Weixin 真实媒体播放及弱网仍 NOT_RUN，不能把构建通过当作播放验收。docs/changelog.md 同步源改动。

## 6. 第二轮验收状态（2026-11-26）

Wikimedia 访问阻塞已定位为 macOS 系统 HTTPS 代理未传入 Node 进程；后端 CLI 现可用 --system-proxy 在单进程使用现有系统代理，且真实 Commons 查询已成功。前端功能仍使用上述临时 API 适配层，Apifox 远端同步/客户端生成尚未完成。后端 source-manifest 当前有 61 条真实来源记录、覆盖 21/30 种动物；candidate/eligible 都不代表人工审核或已发布。最近复核时 macOS HTTP/HTTPS/SOCKS 系统代理均关闭且进程代理变量未配置，因此本地后端采集不能再次访问 Commons；未尝试直连。当前只有一条原始猫嘶声 WAV 在临时目录完成下载/hash，未转码、未上传 OSS、未写入持久 MongoDB，也未在 H5/微信小程序实际播放。P0 GATE-B 未通过，收藏/最近/随机等 P1 继续 NOT_RUN；iOS/Android 真机及正式域名仍 NOT_RUN。
