# 魔灵召唤 RTA 分数预测需求规格书（AI-Native Spec）

## 0. 元信息

| 项       | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 功能名称 | 魔灵召唤 RTA 分数线采集展示与赛季趋势                                              |
| 所属域   | `subPackages/tools/compendium/swc/rta`                                             |
| 发布端   | H5 + mp-weixin（双端必须）                                                         |
| 状态     | 开发中                                                                             |
| 关联文档 | 后端 `docs/rta/rta-score-forecast-frontend-guide.md`；Apifox `NODEJSDEMO/RTASCORE` |

## 1. 业务上下文与页面流

### 1.1 业务背景

在「魔灵召唤」综合页中，与 RTA 排行榜同级提供 RTA 分数线展示。用户可按后端动态发现的服务器、赛季、联赛、来源平台和目标段位查看最新采集分数线与当前赛季趋势；当前赛季优先使用已落库的 `10D`～`FINAL` 相对阶段序列，缺少阶段序列时回退到按采集日期的日趋势。历史赛季使用已落库相对序列的 `FINAL` 点展示结算分数线，不展示趋势图（此前约定不在历史页绘制相对序列），本阶段不调用预测功能，前端不自行回归或推导分数。

### 1.2 页面流与路由

| 页面       | 路由路径（pages.json 注册位置）                       | 跳转方式         | 来源入口                          |
| ---------- | ----------------------------------------------------- | ---------------- | --------------------------------- |
| 分数预测页 | `subPackages/tools/compendium/swc/rta/score-forecast` | `uni.navigateTo` | 魔灵召唤综合页「RTA分数预测」卡片 |

- `src/pages.json` 的 `tools` 分包新增上述路由；页面使用 `navigationStyle: custom`、下拉刷新和 `onReachBottomDistance: 120`。
- `src/config/swc-portal.ts` 新增与 RTA排行榜同级的「RTA分数预测」入口。
- `src/config/tools.ts` 新增隐藏子工具 `compendium-swc-rta-score-forecast`，使用 `recentAliasKey: 'compendium-swc'`，不在顶层工具目录平铺。
- 页面返回兜底为 `/subPackages/tools/compendium/swc/index`；非法或不可用筛选不发起请求并显示可重试错误态。

## 2. 前后端 API 契约（TypeScript）

所有请求直接 import `src/services/apifox/NODEJSDEMO/RTASCORE/apifox.ts`，业务 normalize 与 ViewModel 位于 `src/subPackages/tools/compendium/swc/rta/score-forecast/`，所有请求经现有 `http.ts`。

### 2.1 接口清单

| 功能         | 方法与路径                                  | 鉴权   | Apifox 方法                           |
| ------------ | ------------------------------------------- | ------ | ------------------------------------- |
| 筛选枚举     | `GET /compendiums/rta/score/options`        | public | `getRtaScoreOptions`                  |
| 能力配置     | `GET /compendiums/rta/score/config`         | public | `getRtaScoreConfig`                   |
| 当前分数线   | `GET /compendiums/rta/score/current`        | public | `getRtaScoreCurrent`                  |
| 当前赛季日趋势 | `GET /compendiums/rta/score/history`      | public | `getRtaScoreHistory`                  |
| 赛季相对曲线 | `GET /compendiums/rta/score/season-history` | public | `getRtaScoreSeasonHistory`            |
| 赛季预测     | `GET /compendiums/rta/score/forecast`       | public | `getRtaScoreForecast`（本阶段不调用） |

### 2.2 关键契约

- options 是服务器、赛季、联赛、来源平台和目标段位下拉框的唯一事实来源；不得硬编码 `cn`、赛季号或目标 key。首屏加载后复用完整筛选枚举，赛季/来源切换只读取对应 current，并用 current 返回的分数线同步目标可用性，避免筛选项逐步收窄。
- config 的 `researchDisplay.current/history` 用于打开最新研究观测的 current/history 展示；即使 Snapshot capabilities 为 false，也要请求这两个接口。`scoreForecast=false` 时不要请求 forecast。
- current 返回 `cutoffs`、`capturedAt`、`sourceUpdatedAt`、`dataQuality`；history 返回当前赛季目标与按 `capturedAt` 升序绘制的日 `points`。SWRT 的 `rank=0` 低段占位记录不会作为有效分界线返回。
- 从生成层读取的数据统一按 `response.data.data` 语义解析；`null` 分数、名次和更新时间保持为空，禁止渲染为 0 或当前请求时间。

## 3. 交互约束

- 首屏并行获取 options/config；当前分数线先返回，趋势图在其后异步加载。当前赛季读取 current，并优先读取 season-history 展示完整 `10D`～`FINAL` 阶段趋势，阶段接口不可用时回退到 history 的按日期趋势；历史赛季读取 season-history 仅取 `FINAL` 点展示分数线，不展示相对趋势。
- 服务器、赛季或联赛变化时复用 options，仅刷新对应 current/history/season-history；目标变化仅刷新对应趋势数据，且预测结果清空。已加载的 config/current/history/season-history 在同一页面会话内缓存，刷新时统一失效。
- 当前分数只接受非负整数；请求期间按钮禁用，重复点击不发请求。
- 使用递增请求版本丢弃旧筛选结果；刷新时保留可用旧数据，失败展示可重试状态。
- 支持 loading、empty、error、stale、insufficient、low-confidence、unavailable；历史数据不足时不得补零或自行预测。

## 4. 主题与跨端

- 使用 `PageLayout`、`view`、`text`、`scroll-view`、`picker`、`input`、`button`，趋势图使用跨端可用的视图柱状趋势，不依赖浏览器 DOM 或第三方图表包。
- 颜色、背景、边框和阴影使用 `--theme-*` token；尺寸使用 `rpx`。
- H5 与 mp-weixin 共用页面；不使用 `window`、`document`、`localStorage`、`vue-router` 或裸 `uni.request`。

## 5. 验收清单

- [ ] 综合页显示与 RTA 排行榜同级的 RTA 分数预测入口，顶层工具目录不平铺。
- [ ] 服务器、当前/上一赛季、联赛、目标全部由 options 动态驱动。
- [x] current、history 与历史赛季 `FINAL` 分数线按数据质量展示；当前赛季展示采集时间/赛季结束，并完整展示已采集的 `10D`～`FINAL` 阶段或按日期趋势；历史赛季明确按相对结算阶段展示；本阶段不展示历史趋势或 forecast 输入、区间、安全分和置信度。
- [ ] `expectedScore=null`、`safeScore=null`、`expectedRankRange=null` 不渲染为 0。
- [ ] 赛季切换同步 current 返回的目标可用性，旧请求不能覆盖新筛选。
- [ ] H5 / mp-weixin 白天与夜间主题可用。
- [ ] `pnpm lint`、`pnpm type-check`、`pnpm build:h5`、`pnpm build:mp-weixin` 通过。
- [ ] `docs/changelog.md` 已同步更新。
