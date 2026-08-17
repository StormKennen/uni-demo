# 魔灵召唤 RTA排行榜需求规格书（AI-Native Spec）

## 0. 元信息

| 项       | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 功能名称 | 魔灵召唤 RTA排行榜与人物 RTA 详情                                            |
| 所属域   | `subPackages/tools/compendium/swc`                                           |
| 发布端   | H5 + mp-weixin（双端必须）                                                   |
| 状态     | 开发中                                                                       |
| 关联文档 | `docs/architecture.md`、Apifox `NODEJSDEMO/RTA`、用户提供的 RTA 前端任务说明 |

## 1. 业务上下文与页面流

### 1.1 业务背景

在现有「魔灵召唤」综合页内新增 RTA排行榜入口。用户可按后端动态配置切换赛季、段位与联赛，按选择率、被 Ban 率、队长选取率、队伍胜率排序并无限翻页；点击已映射到本地图鉴的人物后，可查看相同筛选上下文下的 RTA 详情。

页面只展示后端已声明的能力：`positionFilter=false` 时不显示出战位置；`battleCount=null` 时不显示采集场次。缓存状态为 `stale` 时保留数据并展示非阻塞提示。

### 1.2 页面流与路由

| 页面          | 路由路径（pages.json 注册位置）               | 跳转方式         | 来源入口                        |
| ------------- | --------------------------------------------- | ---------------- | ------------------------------- |
| RTA排行榜     | `subPackages/tools/compendium/swc/rta/index`  | `uni.navigateTo` | 魔灵召唤综合页「RTA排行榜」卡片 |
| 统一人物详情  | `subPackages/tools/compendium/swc/detail`     | `uni.navigateTo` | 图鉴列表、RTA排行榜             |
| 人物 RTA 详情 | `subPackages/tools/compendium/swc/rta/detail` | 兼容保留         | 历史链接/旧入口                 |

- `src/pages.json` 的 `subPackages/tools` 分包新增：
  - `compendium/swc/rta/index`：`navigationBarTitleText` 为「RTA排行榜」，`navigationStyle` 为 `custom`，开启下拉刷新，触底距离为 `120`。
  - `compendium/swc/rta/detail`：`navigationBarTitleText` 为「人物 RTA 详情」，`navigationStyle` 为 `custom`，开启下拉刷新。
- `src/config/swc-portal.ts` 新增「RTA排行榜」综合页入口，路径为 `/subPackages/tools/compendium/swc/rta/index`。
- `src/config/tools.ts` 新增隐藏子工具 `compendium-swc-rta`，通过 `recentAliasKey: 'compendium-swc'` 归并最近使用记录，不在顶层工具目录平铺。
- 详情页缺少合法 `characterId` 或筛选参数时展示错误态并允许返回；列表中 `character=null` 的项目保留排名与统计，但不跳转详情。
- `swc/detail` 是唯一人物详情入口，默认打开「属性」；RTA排行榜跳转时携带 `tab=rta`、`season`、`tier`、`league`，并在同一页面打开 RTA Tab。
- RTA Tab 使用懒加载：普通图鉴进入详情不请求 RTA，首次打开 RTA Tab 时才请求配置与人物详情；`rta/detail` 路由暂时保留兼容，新的业务导航不再使用。

## 2. 前后端 API 契约

### 2.1 接口清单

| 功能       | 方法与路径                      | Apifox 方法                 |
| ---------- | ------------------------------- | --------------------------- |
| 配置       | `GET /compendiums/rta/config`   | `getCompendiumsRtaConfig`   |
| 人物排行榜 | `GET /compendiums/rta/monsters` | `getCompendiumsRtaMonsters` |
| 人物详情   | `GET /compendiums/rta/monster`  | `getCompendiumsRtaMonster`  |

调用方直接 import Apifox 方法；RTA 业务目录的 adapter 负责统一 normalize 与最小 ViewModel，不修改 `src/services/apifox/**`。

### 2.2 生成契约缺口

当前 Apifox 生成结果中，Config Response 为 `object`，Ranking/Detail 的 `character` 结构为空壳，`leaderRate`/`positions` 为宽类型，Detail 未生成 `filters`。标记为 `OPENAPI_SCHEMA_GAP`。页面需要的最小结构在 RTA 业务目录内补充并做运行时收敛，后续应由后端完善 Swagger 后重新生成。

### 2.3 核心口径

- Rate 原值范围为 `0~1`，仅格式化为百分比，不重新推导。
- 排行榜「场次」使用 `pickCount`；详情「实际出战」使用 `playedCount`。
- 详情请求使用本地 `characterId`，禁止使用 Swarena `monsterId`。
- `meta.fetchedAt` 展示为「数据时间」，不描述成数据源官方更新时间。
- `meta.cacheStatus='stale'` 时正常展示数据并提示「数据源暂时繁忙，当前展示缓存数据」。

## 3. 交互约束

- 初始化只请求一次 Config 和一次 Ranking；排序、筛选和分页不重复请求 Config。
- 排行榜每页 30 条。`loading`、`loadingMore`、`hasMore` 和页码集合共同防止重复翻页。
- 赛季、段位、联赛、排序字段或方向改变时，清空旧分页并只请求一次 page 1。
- 使用递增请求序号，只有最新筛选请求可覆盖当前状态；不增加前端自动重试。
- 下拉刷新重新获取 Config；当前赛季仍有效时保留，否则回落到 `defaultSeason`，随后重载第一页。
- 下一页失败时保留旧列表；首次失败展示错误态和手动重试。
- `positionFilter` 是显示出战位置入口的唯一依据；本期为 false，因此不显示。

## 4. 状态与主题

- 首屏 Loading：使用稳定的卡片骨架/加载块，不显示空白页。
- Empty：`当前筛选暂无 RTA 数据`。
- Error：`RTA 数据加载失败`，提供「重新加载」。已有列表时只展示轻提示。
- 所有背景、文字、边框和阴影使用现有 `--theme-*` token；功能强调色使用现有品牌色或基于主题可读的局部色值，兼容白天/夜间。

## 5. 跨端兼容

- 使用 uni-app `view`、`text`、`scroll-view`、`button` 与既有组件。
- 使用 `rpx`，不访问 `window`、`document`、`localStorage`，不使用 `vue-router` 或裸 `uni.request`。
- H5 与 mp-weixin 共用同一页面逻辑；RTA Tab 分享时继续指向统一人物详情并携带当前筛选上下文。

## 6. 验收清单

- [ ] 综合页展示 RTA排行榜入口，顶层工具目录不新增平铺入口
- [ ] Config 动态驱动默认赛季、赛季/段位/联赛选项与 capability
- [ ] 排行榜四类 Rate、pickCount 场次、排序、分页、刷新正确
- [ ] `character=null` 保留数据且无法进入详情
- [ ] 详情使用 `characterId`，展示四类 Rate、四类 Count 与服务端 filters
- [ ] stale 数据保持可用并展示低干扰提示
- [ ] Position 与 battleCount 不伪造
- [ ] 单次筛选最多一次 Ranking 请求，旧请求不会覆盖新状态
- [ ] `pnpm lint` / `pnpm type-check` 通过
- [ ] RTA 单元测试通过
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin` 通过
- [ ] `docs/changelog.md` 已同步更新
