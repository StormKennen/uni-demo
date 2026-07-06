# 夜间模式全覆盖落地方案（uni-app / H5 + 小程序）

> 目标：把日间/夜间模式从当前「机制 + 4 个页面」推进到**整个 uni-app 项目全覆盖**（全部页面、全部全局组件、原生导航栏 / TabBar、系统 chrome、主题相关图片资产），并建立防回归约定。
>
> 本文件为落地前的**方案文档（不含实现）**，供评审确认后分批开工。相关既有文档：`docs/swc-character-lineup-components-design.md`（组件化）、`docs/changelog.md`（提交门禁）。

---

## 0. 结论速览

- **不是「组件 or hook」二选一，而是分三层，各司其职：**
  - **Token（唯一数据源）**：`theme.scss` + `utils/theme.ts`，本轮**补齐 elevation/shadow 等缺口**。
  - **组件 `ThemeRoot`（模板层）**：小程序 `page-meta` 注入 +（新增）驱动原生导航栏/TabBar 变色。每页首节点放一个。
  - **Hook `useTheme()`（命令式层）**：`isDark`、原生栏 API、按主题选图、跟随系统。模板做不到的都归它。
- **最大的坑是全局组件**：`src/components/` 47 个里 **37 个**含硬编码色。页面变暗但组件仍亮色会非常割裂——**组件必须先于/同步于页面迁移**。
- **原生导航栏 / 小程序 TabBar 是静态配置**（`pages.json`），运行时切换**必须靠 JS**（`uni.setNavigationBarColor` / `uni.setTabBarStyle`），CSS token 管不到——这正是 `useTheme()` 的核心价值。

---

## 1. 现状

### 1.1 已具备（PR #4 / #8）

- Token 体系：`src/static/style/theme.scss`（H5 用 `:root[data-theme='dark']` 全局覆盖；小程序用 `page{}` 定义亮色默认值）+ `src/utils/theme.ts`（`LIGHT_TOKENS`/`DARK_TOKENS`/`buildPageStyleVars`）。
- 状态源：`src/stores/theme.ts`（`mode`/`isDark`/`pageStyle`/`toggle`/`setMode`/`init`）。
- 切换入口：mine 页「设置」同级开关。
- 机制组件：`src/components/ThemeRoot.vue`（小程序注入 `page-meta`，H5 空实现占位）。
- 已迁移页面（batch1，4 个）：`pages/index`、`pages/mine`、`user/setting`、`compendium/swc/list`。

### 1.2 现有 token（9 个）

`--theme-bg`、`--theme-surface`、`--theme-surface-2`、`--theme-text`、`--theme-text-secondary`、`--theme-text-tertiary`、`--theme-border`、`--theme-brand`、`--theme-mask`。

### 1.3 两端切换机制差异（关键）

| 端                         | 机制                                                                              | 是否需逐页处理            |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------- |
| H5                         | `<html data-theme="dark">` 全局覆盖 `:root` token                                 | 否，全局自动              |
| 小程序                     | 不能给 page 根全局动态加 class，暗色变量靠 `<page-meta :page-style>` **逐页注入** | 是，每页需 `<ThemeRoot/>` |
| 原生导航栏 / 小程序 TabBar | `pages.json` 静态配置，CSS 不可控                                                 | 是，运行时 JS 设置        |

---

## 2. 库存盘点（完整清单见 §7/§8）

- **页面**：共 **45**，已完成 **4**，**剩余 41**。
- **全局组件**：共 **47**，含硬编码色 **37**；其中高杠杆（被多页复用）约 **20+**。
- **原生 chrome**：`globalStyle` 为 `navigationBarBackgroundColor:#fff` / `navigationBarTextStyle:black` / `backgroundColor:#F8F8F8`；`tabBar` 双 tab，`color/selectedColor:#121A26`。**无任何页面自定义 navbar 颜色**，**无任何** `setNavigationBarColor`/`setTabBarStyle`/`onThemeChange` 使用。
- **`prefers-color-scheme`** 仅 2 处（memo detail），与本方案无冲突。
- **主题相关图片资产** 9 个（logo、`*_on.png`、`nav-back-white.png` 等，已有 `swc/Dark.png` 先例）。

---

## 3. 架构分层与职责

```
┌──────────────────────────────────────────────────────────────┐
│ Token（唯一数据源）  theme.scss + utils/theme.ts               │
│   语义色：bg/surface/surface-2/text/.../border/mask/brand      │
│   + 新增：elevated / shadow-xs|sm|md（§4）                      │
└──────────────────────────────────────────────────────────────┘
        ▲ CSS var()                         ▲ JS 读值
        │                                   │
┌───────────────────────┐        ┌──────────────────────────────┐
│ 组件 ThemeRoot（模板） │        │ Hook useTheme()（命令式）      │
│  · 小程序 page-meta    │        │  · isDark / mode / toggle      │
│  · onMounted 触发      │───────▶│  · applyNativeChrome()         │
│    原生栏变色          │        │    (setNavigationBarColor /    │
│  · watch(isDark) 重设  │        │     setTabBarStyle)            │
│  每页首节点放一个      │        │  · pickAsset(light,dark) 选图  │
└───────────────────────┘        │  · followSystem()（可选）      │
        ▲                        └──────────────────────────────┘
        │ var(--theme-*)                     ▲
┌──────────────────────────────────────────────────────────────┐
│ 页面 & 全局组件 <style>：中性色 → var(--theme-*)                │
└──────────────────────────────────────────────────────────────┘
```

- **Token**：所有颜色的唯一真源，页面/组件只引用 `var(--theme-*)`，不再散落字面值。
- **ThemeRoot**：模板层机制。除现有 page-meta 外，**新增**在挂载时调用 `useTheme().applyNativeChrome()` 并 `watch(isDark)` 重设，使「放一个 `<ThemeRoot/>`」即同时获得：小程序页面背景变量 + 原生导航栏/TabBar 变色。
- **useTheme()**：命令式层。封装对 store 的读取与副作用（原生栏 API、条件资源、系统监听），供 ThemeRoot 与业务页在 `<script>` 中使用。

---

## 4. Token 清单（现有 + 新增）

### 4.1 保留现有 9 个（值不变）

| Token                    | Light             | Dark              |
| ------------------------ | ----------------- | ----------------- |
| `--theme-bg`             | `#f8f9fb`         | `#0f141a`         |
| `--theme-surface`        | `#ffffff`         | `#1a222d`         |
| `--theme-surface-2`      | `#f5f6f8`         | `#232d3a`         |
| `--theme-text`           | `#121a26`         | `#e9ecf0`         |
| `--theme-text-secondary` | `#435163`         | `#b9c1cc`         |
| `--theme-text-tertiary`  | `#8993a2`         | `#8993a2`         |
| `--theme-border`         | `#e9ecf0`         | `#2b3644`         |
| `--theme-brand`          | `#0046b4`         | `#4a86e8`         |
| `--theme-mask`           | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.6)` |

### 4.2 新增语义 token（覆盖盘点出的缺口）

盘点显示未覆盖的高频字面值集中在 **elevation/阴影** 与 **黑/白透明叠层**。建议新增：

| Token               | Light              | Dark               | 用途（替换的高频字面值）                                           |
| ------------------- | ------------------ | ------------------ | ------------------------------------------------------------------ |
| `--theme-elevated`  | `#ffffff`          | `#2a3746`          | 浮层/弹窗/下拉菜单等**高于 surface** 的层（暗色下比 surface 略亮） |
| `--theme-shadow-xs` | `rgba(0,0,0,0.05)` | `rgba(0,0,0,0.3)`  | `rgba(0,0,0,0.04/0.05/0.08)`                                       |
| `--theme-shadow-sm` | `rgba(0,0,0,0.1)`  | `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.1/0.15)`                                             |
| `--theme-shadow-md` | `rgba(0,0,0,0.15)` | `rgba(0,0,0,0.55)` | `rgba(0,0,0,0.2)`                                                  |

用法约定：阴影仅 token 化**颜色**，偏移/模糊保留在 SCSS，如
`box-shadow: 0 4rpx 20rpx var(--theme-shadow-sm);`

### 4.3 明确「不 token 化」的字面值

- **品牌 / 强调 / 渐变**：`#667eea`、`#2f80ed`、工具图标 gradient、星标高亮 `#fbbf24` 等——保持原样。
- **语义状态色**：成功/危险/警告（`#10b981`/`#ff4d4f`/…）本轮不统一，保留字面（如后续复用度高再单列 `--theme-success/danger/warning`）。
- **叠在品牌/彩色底上的白色透明层**（`rgba(255,255,255,0.x)`）：它们是「on-accent」而非中性 surface，**主题翻转时不应变**，一律保留字面。
- **五行/元素等业务语义色**：保留。

> 原则：**只 token 化中性的 背景/表面/文字/描边/阴影/遮罩**；一切品牌、状态、on-accent、业务语义色保持字面。

---

## 5. `useTheme()` Hook 设计

位置：`src/hooks/useTheme.ts`（项目已有 `src/hooks/` 约定：`form.ts`、`layout-page.ts`）。

### 5.1 API（草案）

```ts
export function useTheme() {
  const store = useThemeStore()
  const { mode, isDark } = storeToRefs(store)

  // 运行时给原生导航栏 + 小程序 TabBar 上色（CSS 管不到的部分）
  const applyNativeChrome = (): void => {
    /* setNavigationBarColor + #ifdef MP setTabBarStyle */
  }

  // 按当前主题选择资源（深色 logo / 图标等）
  const pickAsset = (light: string, dark: string): string => (isDark.value ? dark : light)

  // 可选：跟随系统（mp/app: uni.onThemeChange；H5: matchMedia prefers-color-scheme）
  const followSystem = (): (() => void) => {
    /* 注册监听，返回取消函数 */
  }

  return { mode, isDark, toggle: store.toggle, setMode: store.setMode, applyNativeChrome, pickAsset, followSystem }
}
```

### 5.2 关键决策

- **原生栏由 ThemeRoot 统一驱动**：ThemeRoot 内部 `useTheme().applyNativeChrome()`（`onMounted` + `watch(isDark)`）。小程序导航栏/TabBar 是**每页状态**，随页面切换需重设——ThemeRoot 已在每页，天然是最佳触发点。业务页无需重复调用。
- **navbar 前景色**：`frontColor` 仅支持 `#ffffff` / `#000000`（平台限制），暗色用白、亮色用黑；`backgroundColor` 用主题 bg/surface 对应值。
- **TabBar**：`setTabBarStyle` 仅小程序/App 有效（`#ifdef MP-WEIXIN || APP`）；H5 的 `h5-tab-bar.vue` 走 CSS token。选中态图标若是彩色 PNG，配合 `pickAsset` 或暗色变体资源。
- **跟随系统为可选增强**：`mode` 增加 `'system'` 档，`followSystem()` 在 App.vue init 时按平台注册；H5 用 `window.matchMedia('(prefers-color-scheme: dark)')`（置于 `#ifdef WEB`/`utilsH5`）。首版可不做，仅预留。
- store 仍是唯一状态源，hook 只做「读 + 副作用」，不另存状态。

---

## 6. 迁移规范（页面 & 组件通用）

1. **中性色 → token 映射表**（对齐 §4）：
   | 角色 | Token |
   |---|---|
   | 页面/区块背景 | `--theme-bg` |
   | 卡片/面板/导航面 | `--theme-surface` |
   | 次级填充/输入底 | `--theme-surface-2` |
   | 浮层/弹窗/菜单 | `--theme-elevated` |
   | 主文字 | `--theme-text` |
   | 次要文字 | `--theme-text-secondary` |
   | 弱化/占位文字 | `--theme-text-tertiary` |
   | 分隔线/描边 | `--theme-border` |
   | 阴影 | `--theme-shadow-xs/sm/md` |
   | 遮罩层 | `--theme-mask` |
2. **亮色不回归**：迁移只允许在「token 亮色值 ≈ 原字面值」时替换；对差异明显且非品牌的字面值，先在 PR 里列出、评审后再定，不擅自改变亮色观感。
3. **SCSS**：局部 `$var: var(--theme-x)` 或直接用 `var(--theme-x)`；不得把 token 写死回字面。
4. **双端**：所有平台差异保留 `// #ifdef` 守卫；`window/document` 仅 `#ifdef WEB` 或 `utilsH5`。
5. **组件优先**：高杠杆组件（§8）先迁，避免「页面暗、组件亮」。
6. **每个 PR**：`src/**` 改动必带 `docs/changelog.md` 同提交条目；跑通 `pnpm lint` + `pnpm type-check`。

---

## 7. 页面批次清单（剩余 41）

> 分批依据：使用频率/入口层级 + 改动量（`<style>` 色值数）。每批一个 PR。

### Batch 2 — 高频一级工具页（~21）

`compendium/swc/lineups`、`memo/list`、`calendar/index`、`chat/index`、`chat/list`、`oss-upload/index`、`oss-upload/fileList`、`image-compress/index`、`image-watermark/index`、`image-format/index`、`image-cipher/index`、`qr-generator/index`、`qr-parser/index`、`video-compress/index`、`watermark/index`、`image-stitch/index`、`schema-demo/list`、`pool-aim/index`、`magnet-link/index`、`video-gif/index`、`game-coupons/index`。

### Batch 3 — 二级/编辑/详情页（~15）

`compendium/swc/{detail,edit,admin-list,lineup-edit,lineup-relations,character-picker,lineup-mappings,lineup-mapping-detail}`、`memo/{editor,detail}`、`calendar/{detail,festivals,auspicious}`、`markdown/index`。

> 注意：`memo/detail`（168）、`compendium/swc/detail`（113）、`memo/editor`（112）色值最多，单独评估可再拆。

### Batch 4 — 长尾/演示/低频（~5）

`pages/mine/login/login`、`common/webview/{webview,h5}`、`editor-core/demo/SchemaEditorDemo`、`family-tree/{index,demo}`。

---

## 8. 全局组件迁移清单（37）

> **高杠杆优先（Batch A，先做）** —— 被多页复用，收益最大：
> `layout-page`、`nav-bar-base`、`h5-tab-bar`、`card/index`、`upload-card/index`、`form/item`、`simple-table/index`、`empty-data`、`confirm-dialog`、`new-confirm-dialog`、`ga-confirm-popup`、`privacy-popup`、`download-popup`、`share-app`、`platform-restriction-notice`。

> **其余（Batch B）**：
> `FolderPicker`、`button-item`、`certificate-card/{base,index,multifile}`、`date-range-picker`、`footer/OneBtn`、`ga-calendar`、`ga-checkbox`、`ga-date-picker`、`ga-picker`、`ga-province`、`ga-select`、`ga-tags`、`guide-card`、`lime-echart`、`radio-select`、`step-bar/index`、`upload-popup/index`、`vertical-steps/item`、`family-tree/{family-tree-detail,family-tree-node}`。

> 组件迁移遵循 §6 同一映射；含大量业务色的（如 family-tree 渲染、certificate-card）注意区分「中性 UI 色」与「业务语义色」。

---

## 9. 图片资产

- 主题敏感资产 9 个（logo、`*_on.png`、`nav-back-white.png`、`mine/logout.svg` 等）。
- 处理策略：
  - **纯白/纯黑单色图标**：优先改用字体图标或 `var(--theme-*)` 着色的 SVG；无法改则备暗色变体 + `useTheme().pickAsset()` 切换。
  - **彩色 logo**：一般两端通用可不动；若暗底下对比不足再出暗色版。
  - **小程序 TabBar 图标**：`iconPath/selectedIconPath` 为静态资源，暗色下若不清晰，用 `setTabBarItem` 运行时换图（可选，纳入 `applyNativeChrome`）。
  - 沿用既有先例 `swc/Dark.png` 的命名/组织方式。

---

## 10. 防回归

- **约定**：新页面/组件禁止硬编码中性色，一律走 token；PR 评审把关。
- **工具（建议，二期）**：引入 stylelint + `declaration-property-value-disallowed-list` 规则，禁止 `<style>` 内出现裸中性 hex（品牌/业务色加白名单或注释豁免）；或加一个轻量 CI 脚本 grep 拦截。**新增依赖需先获批**，故列为建议项。
- **文档**：本文件与 token 表作为后续迁移的唯一参照，token 变更同步更新此表。

---

## 11. 验收标准（每批 DoD）

1. 该批所有页面/组件在 **H5 亮/暗** 与 **小程序 亮/暗** 下：背景、表面、文字、描边、阴影、遮罩均随主题正确切换，**亮色观感与迁移前一致**。
2. 原生导航栏、小程序 TabBar 随主题变色（切页/切主题后仍正确）。
3. 无「页面暗、内嵌组件亮」的割裂。
4. 品牌色/状态色/on-accent 白色叠层**未被误改**。
5. `pnpm lint`、`pnpm type-check` 无新增（相对仓库既有 baseline）错误。
6. `docs/changelog.md` 有对应条目；双端 `#ifdef` 守卫完整。

---

## 12. 建议实施顺序

1. **基座 PR**：补 §4.2 新增 token（`theme.scss` + `utils/theme.ts`）+ 新建 `useTheme()` + 升级 `ThemeRoot`（驱动原生栏/TabBar）。—— 机制层一次到位。
2. **组件 Batch A**（高杠杆组件）。
3. **页面 Batch 2 → 3 → 4**，每批同时带上该批引用到的组件 Batch B 部分。
4. （可选，二期）跟随系统 `'system'` 档 + stylelint 防回归。

---

## 13. 风险与回退

- **风险**：大范围样式改动可能在个别页面引入亮色微调（近似灰归一）；对策——按 §6.2 逐 PR 列出差异项、小步分批、每批可独立回退（feature 分支 + 单批 PR）。
- **原生栏 API 平台差异**：`frontColor` 仅黑/白；`setTabBarStyle` 仅小程序/App——均已在 §5.2 用 `#ifdef` 隔离。
- **回退**：任一批 PR 独立，出问题 revert 单个 PR 即可，不影响 token 基座与其他批次。
