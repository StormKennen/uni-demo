# 魔灵召唤 AI 人物评级榜需求规格书

## 0. 元信息

| 项目     | 内容                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------- |
| 功能名称 | 魔灵召唤 AI 人物评级榜                                                                                  |
| 所属域   | `subPackages/tools/compendium/swc`                                                                      |
| 发布端   | H5 + mp-weixin                                                                                          |
| 状态     | 开发中                                                                                                  |
| 关联文档 | 后端 `docs/features/029-swc-tier-ranking.md`、`research/swc-ai-rating/reports/FIRST-PARTY-AI-RATING.md` |

## 1. 业务上下文与页面流

评级榜用于展示当前数据库中已经映射到 SWC 图鉴的人物评级。第一方 `rta-ai` 是本项目自己的 RTA 综合评级；`swrt` 仅作为外部参考来源。页面不在前端计算分数，所有评级、报告日期和人物关联由后端已发布报告返回。

| 页面     | 路由                                                  | 跳转方式         | 来源入口         |
| -------- | ----------------------------------------------------- | ---------------- | ---------------- |
| AI评级榜 | `subPackages/tools/compendium/swc/tier-ranking/index` | `uni.navigateTo` | 魔灵召唤统一入口 |

需要新增的路由：

- `subPackages/tools/compendium/swc/tier-ranking/index`
- `navigationBarTitleText`: `AI评级榜`
- `navigationStyle`: `custom`
- 开启下拉刷新

需要新增的工具入口：

- `compendium-swc-tier-ranking`
- 名称：`AI评级榜`
- 路径：`/subPackages/tools/compendium/swc/tier-ranking/index`
- `recentAliasKey`: `compendium-swc`
- 不在顶层工具目录平铺，仅在魔灵召唤统一入口展示

## 2. 前后端 API 契约

复用已发布评级榜接口，页面直接调用 Apifox 生成方法：

| 功能     | 方法与路径                              | 鉴权   | 调用封装                           |
| -------- | --------------------------------------- | ------ | ---------------------------------- |
| 配置     | `GET /compendiums/tier-rankings/config` | public | `getCompendiumsTierRankingsConfig` |
| 最新榜单 | `GET /compendiums/tier-rankings/latest` | public | `getCompendiumsTierRankingsLatest` |

页面只接受 `status=published` 的后端结果。配置动态提供 `providers`、`regions`、`elements` 和 `tiers`，不得硬编码可用来源或区域；当前默认优先 `rta-ai`，不存在时回退后端返回的第一个 provider。

榜单请求参数：`compendiumId=swc`、`provider`、`region`、`elements`（逗号分隔）和 `locale=zh-CN`。报告返回后，评级档位筛选和人物关键词筛选在本地执行，避免每次切换档位都重新请求。

## 3. 交互约束

- 首屏并行加载配置和最新榜单；配置失败或榜单失败展示可重试错误态。
- 来源/区域/属性改变时清空旧结果并只请求一次最新榜单。
- 评级档位和关键词搜索只过滤当前报告，不发起请求。
- 下拉刷新重新读取配置和当前榜单，失败时保留已有结果。
- 页面支持 `onShareAppMessage`、`onShareTimeline`；分享链接携带来源、区域、属性、档位和关键词筛选。
- 点击人物进入统一人物详情页，并携带 `tab=stats`；没有 `character` 的条目保留展示但不跳转。

## 4. 页面信息层级

- 顶部：AI评级榜标题、评级口径、数据日期/赛季/版本。
- 筛选区：来源、区域、属性、评级档位、关键词。
- 榜单区：按 SSS、SS、S、A、B、C、Other 分组；每张卡展示名次、头像、属性和评级。
- 空态：显示当前筛选无结果；错误态提供重新加载。
- 视觉上优先保证榜单卡片在移动端可截图，桌面 H5 使用更宽的网格；不做营销型 Hero，不遮挡榜单内容。

## 5. 主题与跨端

- 使用 `PageLayout`、`view`、`text`、`scroll-view`、`input`、`button` 和现有 SWC 头像/属性组件。
- 所有颜色走 `--theme-*` token；尺寸使用 `rpx`，不写死 `px`。
- H5 与 mp-weixin 共用页面逻辑；不使用 `window`、`document`、`localStorage`、`vue-router` 或裸 `uni.request`。

## 6. 验收清单

- [ ] 魔灵召唤统一入口出现 AI评级榜
- [ ] H5 / mp-weixin 可打开并返回
- [ ] 来源、区域、火水风光暗、评级档位、关键词筛选有效
- [ ] 页面展示人物当前图鉴头像和属性
- [ ] 无映射人物保留展示且不可进入详情
- [ ] 分享链接可恢复筛选状态
- [ ] 白天/夜间主题可用，榜单可截图
- [ ] `pnpm lint` / `pnpm type-check` / `pnpm build:h5` 通过
- [ ] `docs/changelog.md` 已同步更新
