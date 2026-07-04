# 魔灵召唤图鉴 · 人物数据缓存 + 持续加载方案（含后端接口优化建议）

> 本文档遵循 Harness 流程，仅为**方案梳理**，不含实现。落地前需人工确认。
> 涉及页面：图鉴人物列表 `src/subPackages/tools/compendium/swc/list.vue`、选人组件 `src/subPackages/tools/compendium/swc/character-picker.vue`；服务层 `src/services/compendium-lineups.ts`、`src/services/apifox/.../COMPENDIUMS`。

---

## 1. 需求梳理

用户诉求（原文）：

> 魔灵召唤图鉴人物列表，和阵容中的人物选择是同一份数据，是否可以做缓存（主要是微信小程序上使用）。是否可以持续加载，这样就不用持续点击翻页按钮了。如果需要后端接口优化，那么也整理出来。

拆解为三个目标：

- **G1 数据缓存**：图鉴列表与选人组件是同一份人物数据，希望共享缓存，重点覆盖微信小程序（冷启动/重复进入时减少请求、加快首屏、省流量）。
- **G2 持续加载**：不再需要手动点「翻页 / 加载更多」按钮，滚动即自动加载。
- **G3 后端接口优化**：如果前端缓存/持续加载依赖后端能力，整理出接口改动清单。

---

## 2. 现状盘点

### 2.1 数据来源

| 页面                 | 加载函数                                                 | 实际接口                               | 过滤/排序位置                         |
| -------------------- | -------------------------------------------------------- | -------------------------------------- | ------------------------------------- |
| 图鉴列表 `list.vue`  | `fetchCharacters`                                        | `GET /compendiums/characters`          | **服务端**（category/star/sort 传参） |
| 选人组件（普通用户） | `fetchUserCharacterOptions` → `getCompendiumsCharacters` | `GET /compendiums/characters`          | **客户端**（拉取后本地过滤/排序）     |
| 选人组件（管理员）   | `fetchAdminCharacterOptions`                             | `GET /admin/lineups/character-options` | 客户端                                |

结论：普通用户视角下，两个页面**同源**（都是 `/compendiums/characters`），确实是「同一份数据」，具备共享缓存前提；但二者**入参和过滤策略不同**，直接按 URL+参数做响应缓存无法互相命中。

### 2.2 持续加载现状

- `list.vue`：**已实现**滚动持续加载（`onReachBottom` → `fetchCharacters()`），并有 `onPullDownRefresh` 下拉刷新；模板底部是「继续加载… / 没有更多了」文案，**无翻页按钮**。→ 该页 G2 基本达成。
- `character-picker.vue`：PR #1 已改为**静默自动加载全部分页**（`loadRemainingPages` 循环 `hasNext`，`pageSize=50`），也**无按钮**。→ 该页 G2 已达成。

> 说明：用户所说「持续点击翻页按钮」的痛点，在当前分支/已合并 PR #1 后主要已解决。本方案在此基础上补齐 **数据缓存（G1）** 与 **两页数据层统一**，并顺带评估 `list.vue` 是否也接入缓存以获得秒开体验。

### 2.3 缓存现状

- 仅有**头像缓存** `src/utils/avatar-cache.ts`（PR #1）：H5 预热浏览器缓存、mp-weixin `downloadFile+saveFile` 持久化 + 300 条 LRU。
- **无人物列表数据缓存**：每次进入两页都重新请求全部分页。mp-weixin 冷启动、重复进出、弱网下体验与流量成本较高。
- `src/utils/storage.ts` 仅有裸 `get/set/removeStorageSync`，**无 TTL / 版本 / 命名空间**封装。

---

## 3. 方案设计

### 3.1 总体思路

引入一层「**图鉴人物共享数据层**」（composable + 缓存），让 `list.vue` 与 `character-picker.vue` 消费同一份规范化数据，并在 mp-weixin 上持久化缓存：

```
      ┌─────────────────────────────────────────────┐
      │  useCompendiumCharacters (共享 composable)     │
      │  - 内存缓存(单例, 当前会话)                      │
      │  - 持久化缓存(mp: storage; web: 可选)           │
      │  - 版本/TTL 失效 + 后台 revalidate             │
      └───────────────┬───────────────┬───────────────┘
                      │               │
             list.vue │               │ character-picker.vue
       (本地过滤/排序)  │               │ (本地过滤/排序，已具备)
                      └──── GET /compendiums/characters ────┘
```

关键决策：**统一为「一次性拉全量 + 客户端过滤/排序」**。人物总量属于「几百量级、低频变更」的准静态数据，非常适合全量缓存；两页都基于同一份全量集合做本地过滤/排序，天然共享缓存、天然持续加载（本地分页无需再请求）。

### 3.2 缓存分层与失效策略（G1，重点 mp-weixin）

- **L1 内存缓存**：模块级单例（`ref` + 时间戳）。同一会话内多次进出选人页/列表页零请求。
- **L2 持久化缓存（mp-weixin 主）**：`storage` 存规范化后的全量数组 + 元信息 `{ version, updatedAt, locale, compendiumCode, cachedAt }`。冷启动命中即秒开。
  - Key：`compendium:characters:{compendiumCode}:{locale}`（按图鉴 + 语言分桶）。
  - 体积控制：仅缓存**列表/选人所需精简字段**（id/name/avatar/stars/awaken/element/type + 排序键），剔除详情大字段；预估几百条 × 精简字段远小于 mp storage 单 key 上限，仍需在写入前做体积校验与降级（超限则只存内存）。
- **失效策略（三选一，建议渐进）**：
  1. **TTL**（最简，先落地）：默认 6~24h；过期即后台重拉。
  2. **SWR（stale-while-revalidate）**：命中缓存**先渲染**，同时后台静默拉最新，diff 后更新（体验最佳，推荐目标态）。
  3. **版本号校验**（需后端支持，见 §4）：带上本地 `version`/`updatedAt`，后端 `304`/空 diff 时零传输。
- **平台差异**：用 `// #ifdef MP-WEIXIN` 控制持久化写入；H5 端本就有浏览器 HTTP 缓存，L2 可选（默认只用 L1 + HTTP 缓存，避免与浏览器缓存重复）。
- **缓存工具**：新增 `src/utils/cache-store.ts`（带 TTL/版本/命名空间的通用 `getCache/setCache/invalidate`），复用现有 `storage.ts`，不引入新依赖。

### 3.3 持续加载（G2）

- 两页已无按钮。统一后：
  - **首屏快出**：命中缓存 → 立即渲染全量；未命中 → 先渲染第 1 页（50 条），再静默补齐剩余分页（沿用 picker 现有 `loadRemainingPages` 模式）。
  - **本地分页渲染**：全量在手后，滚动加载仅是「本地切片」渲染，避免一次性渲染数百节点导致 mp 卡顿（虚拟/分批渲染，`onReachBottom` 递增可见条数）。
- `list.vue` 保留服务端筛选能力？→ 见 §3.4 取舍。

### 3.4 关键取舍：`list.vue` 是否改为客户端过滤

`list.vue` 现在依赖服务端 category/star/sort 过滤，且有「家族/物种分组模式、属性 rankings」等逻辑。全量客户端化收益（秒开、与 picker 共享缓存）明显，但成本/风险：

- 需在前端复刻服务端的过滤/排序/分组语义，存在**行为不一致**风险；
- rankings/家族聚合可能依赖服务端计算，不宜前端化。

**建议采用分阶段落地**：

- **阶段一（低风险，先做）**：
  - 抽取共享数据层，**先只让 `character-picker.vue` 接入缓存**（它本就是客户端过滤，改动小、风险低），实现选人页秒开 + mp 持久化缓存。
  - `list.vue` 维持服务端过滤，但可选接入「**同源响应的分页级缓存**」（按 query 缓存每页，SWR），获得重复进入的加速，且不改其过滤语义。
- **阶段二（评估后再做）**：若确认服务端过滤/排序/分组可安全前端化，再将 `list.vue` 也切到全量共享数据层，实现两页完全共享同一缓存。此步依赖 §4 后端对齐。

### 3.5 缓存刷新入口

- 下拉刷新（两页）强制跳过缓存、拉最新并回写。
- 人物数据发生写操作（管理员编辑/新增/觉醒变更）后，主动 `invalidate` 对应 key（或依赖版本号自然失效）。

---

## 4. 后端接口优化建议（G3）

> 以下均为「可选增强」，按收益排序；前端方案在**无后端改动**下也能落地（TTL/SWR 版），但下列改动能显著提升缓存命中与传输效率。

1. **数据集版本/更新时间（最高优先）**
   - 在 `GET /compendiums/characters` 响应或新增 `GET /compendiums/characters/meta` 中返回该图鉴人物集合的 `version` 或 `updatedAt`。
   - 前端据此做**便宜的失效校验**（只拉 meta 即可判断是否需要全量刷新），是 SWR/版本号策略的关键。

2. **条件请求 / 增量**
   - 支持 `ETag` + `If-None-Match` 或 `If-Modified-Since`，未变更返回 `304`，零 body 传输（mp/弱网收益大）。
   - 进阶：`?since=<updatedAt>` 返回增量变更集，前端合并（数据量增长后再考虑）。

3. **精简字段投影**
   - 支持 `?fields=list` 或轻量视图，仅返回列表/选人所需字段（id/name/avatar/stars/awaken/element/type/排序键），减小 payload 与缓存体积。

4. **一次性全量 / 大页返回**
   - 提供 `?pageSize=all` 或较大上限（如 500），减少静默分页的往返次数（mp 下多次 round-trip 成本高）。若维持分页，请确保 `hasNext/total/page` 字段稳定一致。

5. **两个接口对齐（消除数据分叉）**
   - 让管理员选人接口 `GET /admin/lineups/character-options` 与 `GET /compendiums/characters` 的**字段结构、过滤参数（category/star/sort）、分页语义**一致；
   - 或直接让选人组件对所有角色统一走 `/compendiums/characters`，从源头保证「同一份数据」，前端缓存才能真正共享。

6. **稳定排序键**
   - 后端在人物对象上直接给出可用于本地排序的规范化 `stars`（数值）与 `sortWeight`，避免前端从 `categories/attributes` 兜底解析（当前 `normalizeCharacterPreview` 已有多源兜底，属临时兼容）。

---

## 5. 影响面与约束（Harness）

- 新增：`src/utils/cache-store.ts`（TTL/版本缓存工具）、`src/composables|hooks/useCompendiumCharacters.ts`（共享数据层）。
- 修改：`character-picker.vue`（接入共享层，阶段一）；后续 `list.vue`（阶段二）；`compendium-lineups.ts`（数据层收敛）。
- 约束遵循：请求仍走 `src/services/http.ts`；平台差异用 `// #ifdef`；持久化经 `storage.ts`；**不新增依赖**、不改 `vite.config.ts/manifest.json/.env`；改 `src/**` 时同提交 `docs/changelog.md`；仅提交到 `devin/*` 分支。

## 6. 落地顺序建议

1. 后端确认 §4.1（version/updatedAt）与 §4.5（接口对齐）是否可行 → 决定采用 TTL 还是 SWR/版本策略。
2. 前端阶段一：`cache-store.ts` + 共享数据层 + 选人页接入（mp 持久化 + SWR/TTL）。
3. 验证 mp-weixin 冷启动秒开、流量下降、静默加载与头像缓存协同。
4. 视 §3.4 评估结果推进阶段二（`list.vue` 全量共享）。

## 7. 待你确认的决策点

- **D1**：是否采纳「全量拉取 + 客户端过滤」为目标态？（影响 `list.vue` 是否阶段二改造）
- **D2**：失效策略首版选 TTL 还是 SWR？（SWR 体验更好，但建议配合 §4.1 后端 version）
- **D3**：后端是否愿意支持 §4.1 版本号 / §4.5 接口对齐？（决定缓存能否跨两页真正共享）
- **D4**：H5 端是否也要持久化缓存，还是仅依赖浏览器 HTTP 缓存？
