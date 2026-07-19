# 魔灵召唤聚合入口需求规格书（AI-Native Spec）

## 0. 元信息

| 项       | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| 功能名称 | 魔灵召唤聚合入口                                                     |
| 所属域   | subPackages/tools                                                    |
| 发布端   | H5 + mp-weixin（双端必须）                                           |
| 状态     | 开发中                                                               |
| 关联文档 | `docs/architecture.md`、`docs/features/000-existing-baseline.md` |

## 1. 业务上下文与页面流

### 1.1 业务背景

魔灵召唤相关能力当前以多个工具入口分散展示，用户在首页常用功能与工具库中会看到图鉴、兑换券、阵容、阵容映射等子产品入口。为了让首页与工具库更简洁，魔灵召唤需要收敛为一个统一的顶层产品入口；用户点击「魔灵召唤」后进入聚合页，再选择具体子产品。

成功标准：顶层目录只展示「魔灵召唤」主入口，进入任一魔灵召唤子产品后，首页常用功能也只记录并展示「魔灵召唤」。

### 1.2 页面流与路由

| 页面             | 路由路径（pages.json 注册位置）                         | 跳转方式         | 来源入口                         |
| ---------------- | -------------------------------------------------------- | ---------------- | -------------------------------- |
| 魔灵召唤聚合页   | `subPackages/tools/compendium/swc/index`（tools 分包节点） | `uni.navigateTo` | 首页/工具库「魔灵召唤」工具卡     |
| 魔灵召唤图鉴     | `subPackages/tools/compendium/swc/list`                  | `uni.navigateTo` | 魔灵召唤聚合页入口卡片           |
| 魔灵召唤兑换券   | `subPackages/tools/game-coupons/index?gameId=swc&compendiumId=swc` | `uni.navigateTo` | 魔灵召唤聚合页入口卡片           |
| 魔灵召唤阵容     | `subPackages/tools/compendium/swc/lineups?compendiumId=swc` | `uni.navigateTo` | 魔灵召唤聚合页入口卡片           |
| 魔灵召唤阵容映射 | `subPackages/tools/compendium/swc/lineup-mappings?compendiumId=swc` | `uni.navigateTo` | 魔灵召唤聚合页入口卡片           |

- 需要在 `src/pages.json` 中新增的路由路径：
  - `subPackages/tools` 分包新增 `compendium/swc/index`，`navigationBarTitleText` 为「魔灵召唤」，`navigationStyle` 为 `custom`。
- 需要在 `src/config/tools.ts` 中注册的工具入口：
  - `compendium-swc` 作为顶层主入口，路径指向 `subPackages/tools/compendium/swc/index`，分类归入 `entertainment`。
  - `compendium-lineups`、`compendium-lineup-mappings`、`summoners-war-coupons` 继续保留工具配置供路由与最近使用归并使用，但不在目录类页面顶层展示。
- 页面返回/兜底行为：
  - 聚合页仅承接跳转，子产品页面继续沿用既有返回行为。

## 2. 前后端 API 契约（TypeScript）

本期不新增后端接口，不修改既有 API 契约。聚合页仅展示本地静态入口配置并跳转到既有页面。

## 3. 交互约束

### 3.1 防重与防抖

本期无请求与提交行为，无需新增防重逻辑。入口点击只执行 `uni.navigateTo`。

### 3.2 状态与空态

聚合页固定展示 4 个子产品入口，不涉及 Loading / 错误态 / 空态。

### 3.3 主题

聚合页背景、卡片、文字、边框、弱提示等颜色使用现有 `--theme-*` token，兼容白天与夜间主题。

## 4. 埋点

复用 `src/utils/tracker.ts` 的最近使用记录逻辑：

| 事件名            | 触发时机                 | 参数                         |
| ----------------- | ------------------------ | ---------------------------- |
| `reportToolVisit` | 进入魔灵召唤相关子产品时 | 子产品 key，经配置归并到主入口 |

子产品访问记录通过 `recentAliasKey` 归并到 `compendium-swc`，保证首页常用功能只出现「魔灵召唤」主入口。

## 5. 条件编译与跨端兼容说明

- 聚合页使用 uni-app 基础组件 `view/text` 与 `uni-icons`，不使用 Web 标签。
- 不使用 `window/document/localStorage`、`vue-router` 或裸 `uni.request`。
- 样式使用 `rpx` 与主题 token，兼容 H5 与 mp-weixin。

## 6. 验收清单

- [ ] 首页常用功能只展示「魔灵召唤」主入口，不展示魔灵召唤子产品入口
- [ ] 工具库娱乐分类展示「魔灵召唤」主入口
- [ ] 工具库不再平铺「魔灵召唤阵容」「魔灵召唤阵容映射」「魔灵兑换券」等子入口
- [ ] 点击「魔灵召唤」进入聚合页
- [ ] 聚合页 4 个入口均可进入既有子页面
- [ ] 访问任一魔灵召唤子产品后，最近使用只记录 `compendium-swc`
- [ ] H5 白天/夜间模式正常
- [ ] mp-weixin 白天/夜间模式正常
- [ ] 路由已在 `pages.json` 正确注册，无冲突
- [ ] `pnpm lint` / `pnpm type-check` 已执行并记录结果
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin` 已执行并记录结果
- [ ] `docs/changelog.md` 已同步更新
