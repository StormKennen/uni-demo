# 夜间模式全覆盖 · 统一 Layout 改造可行性方案

> 前置：PR #1 已完成 CSS token 迁移（84 文件），但页面在暗色下背景仍是白色。本方案分析根因并给出统一 Layout 的落地路径。

## 1. 现状与根因分析

### 1.1 为什么页面背景还是白的（暗色不生效）

| 端          | 根因                                                                                                                                                                                                                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 微信小程序  | token 变量在 `theme.scss` 的 `#ifndef WEB` 分支里**静态写死为亮色值**（`page { --theme-bg: #f8f9fb; ... }`）。暗色值只能靠 `<page-meta :page-style>`（ThemeRoot 组件）在**每个页面实例**上注入，但全仓 77 个页面中**只有 4 个页面挂了 ThemeRoot**（index、mine、setting、compendium/list）。其余 ~73 个页面在小程序端永远是亮色。 |
| H5          | `:root[data-theme='dark']` 全局生效 + `App.vue` 中 `page { background-color: var(--theme-bg) }`，token 本身可切换；但部分页面根容器自己铺了白色/浅色底、以及原生导航栏区域未随主题变化。                                                                                                                                          |
| 原生导航栏  | 45 个注册页面中 **15 个仍用原生导航栏**（pages.json 未设 `navigationStyle: custom`），原生导航栏颜色只能靠 `uni.setNavigationBarColor` 在页面内调用，而该调用在 `useThemeOnPage()` 里，同样只有挂了 ThemeRoot 的 4 个页面执行。                                                                                                   |
| Layout 缺位 | 仓库现有两套 layout：`layout-page.vue`（页面级 0 使用，仅 debug 页）与 `PageLayout.vue`（easycom，仅 3 个页面使用）。绝大多数页面直接 `<view class="xxx-page">` + 手动引 `nav-bar`，没有统一容器可以集中挂 ThemeRoot / 背景 / 导航。                                                                                              |

### 1.2 结论

token 体系本身已就绪，缺的是**分发层**：每个页面实例都需要 ① page-meta 注入暗色变量（小程序）② 原生 chrome 同步（导航栏/TabBar）③ 统一的 `--theme-bg` 页面底色容器。统一 Layout 正是承载这三件事的最佳位置，方向可行。

## 2. 方案设计：统一 GaLayout

### 2.1 组件形态（升级现有 PageLayout，而非新建第三套）

以 easycom 的 `PageLayout.vue` 为基底升级（保留现有 3 个页面 API 兼容），内聚：

```
<PageLayout title="xxx" :nav-back="true" :show-nav="true">
  ├─ ThemeRoot            ← page-meta 注入 token（MP）+ useThemeOnPage()（导航栏/TabBar 同步）
  ├─ NavBar（自定义导航栏） ← 背景 var(--theme-surface)、文字 var(--theme-text)
  ├─ <view class="layout-body">  ← min-height:100vh; background: var(--theme-bg)
  │    └─ <slot />        ← 页面内容
  └─ <slot name="footer"> ← 底部操作条（可选，sticky + safe-area）
</PageLayout>
```

新增 props（均有默认值，向后兼容）：

- `showNav`（默认 true）：tabbar 页 / 特殊页可关
- `navGradient` / `navCustomClass`：保留现有渐变导航能力（如 qr-generator 的紫色渐变头，暗色下保持品牌渐变不变）
- `bgColor`（默认 `var(--theme-bg)`）：个别页面需要自定义底色时透传

`layout-page.vue` 标记为废弃（仅 debug 页在用），后续删除，避免三套并存。

### 2.2 页面接入模式

每个页面的改造是机械的三步：

1. 根节点换成 `<PageLayout title="原导航标题">`（easycom 免 import）
2. 删除页面内手动引入的 `nav-bar` / 自铺的白色页面底色（改由 layout 提供）
3. pages.json 该页面加 `navigationStyle: "custom"`（原生导航 15 个页面）

### 2.3 pages.json 全量 custom 化

15 个原生导航页面（setting、pool-aim、compendium/swc 10 个、game-coupons、webview 2 个）统一改为 `navigationStyle: custom` 并由 layout 渲染导航。特殊处理：

- `webview/webview`、`webview/h5`：内嵌 web-view，小程序端 web-view 撑满页面且不允许自定义导航共存 → **保留原生导航**，改为在页面 onShow 调 `uni.setNavigationBarColor`（新增 `useThemeNavBar()` 轻量 hook）作为兜底。
- tabbar 页（index、mine）：已挂 ThemeRoot，只需把根容器换成 `<PageLayout :show-nav="false">` 或保持现状仅补背景容器。

### 2.4 兜底与风险控制

- **小程序 page 底色**：`page-meta` 的 `page-style` 已含 `--theme-bg`，配合 App.vue 的 `page { background-color: var(--theme-bg) }` 即可让下拉回弹区域也变暗；另在 `buildPageStyleVars` 中追加 `background-color` 直接值，双保险。
- **下拉刷新样式**：pages.json 对开启 `enablePullDownRefresh` 的页面补 `"backgroundTextStyle": "dark"` 的动态处理不可行（静态配置），接受亮色 loading 点（微信限制），或在暗色下用 `uni.stopPullDownRefresh` 自定义刷新（不在本期范围）。
- **H5 uni-page-head**：已全局隐藏，custom 化后无回归风险。
- **回归风险**：接入 layout 会改变页面 DOM 层级（多一层 view），对使用 `position: fixed` / `scroll-view 100vh` 的页面（memo/editor、family-tree-chart、image-stitch 等）需逐页目检。

## 3. 实施批次（Harness 流程，每批一个 PR）

| 批次                         | 内容                                                                                                                                                    | 规模     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| PR-1 基座                    | 升级 PageLayout（内聚 ThemeRoot/NavBar/bg 容器/footer slot）+ 新增 `useThemeNavBar()` + `buildPageStyleVars` 补 background-color + 废弃标注 layout-page | ~5 文件  |
| PR-2 原生导航页 custom 化    | 15 个原生导航页接入 PageLayout + pages.json 改 custom（webview 2 页走兜底 hook）                                                                        | ~16 文件 |
| PR-3 工具页批量接入 A        | subPackages/tools 高频页（memo、calendar、chat、family-tree 等 ~15 页）                                                                                 | ~15 文件 |
| PR-4 工具页批量接入 B + 主包 | 其余工具页 + index/mine 收尾 + 删除 layout-page.vue                                                                                                     | ~18 文件 |
| 验证                         | 每批：pnpm lint + pnpm type-check + H5 双主题目检 + mp-weixin 构建通过；changelog 同步                                                                  | —        |

每批均走 feature 分支 + changelog 同步 + pre-commit，不动 vite.config/manifest/.env。

## 4. 涉及 pages.json 的说明

pages.json 不在 HARNESS 禁改清单内（禁改的是 vite.config.ts / manifest.json / .env.\* / 部署脚本），且 AGENTS.md 明确工具页需在 pages.json 注册，属常规可改文件；本方案只改 `style.navigationStyle` 字段，不动路由路径。

## 5. 预期收益

- 小程序端 73 个未覆盖页面全部获得暗色 token（page-meta 由 layout 统一注入）
- 45 个页面导航栏 100% 随主题切换（自定义导航直接吃 token；webview 兜底 hook）
- 页面底色统一由 layout 提供 `var(--theme-bg)`，消灭"内容变暗、底色仍白"
- 新页面接入成本降为一行 `<PageLayout>`，杜绝再次漏配
