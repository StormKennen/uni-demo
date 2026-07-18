---
description: uni-app 跨端硬性护栏（门派一 Rules），Vue3 + TS 多端项目绝对约束
globs: 'src/**/*.{vue,ts,scss}'
alwaysApply: true
---

# uni-app 跨端硬性护栏（绝对约束）

本项目为 uni-app 3 + Vue 3 + TypeScript 多端项目（发布端：微信小程序 + H5）。以下为不可协商的硬性规则，违反将被 pre-commit / 代码审查直接拒绝。

## ⚖️ 认知最高准则：无文档，不编码（No Spec, No Code）

- 你在这个前端项目里的所有代码编写，都只是 `docs/features/` 下对应文档的【代码翻译器】。存量功能以 `docs/features/000-existing-baseline.md` 为准，新功能必须先有 `docs/features/<feature>.md`（模板：`docs/features/template.md`）。
- 绝对禁止自我发明任何文档里没有明确提到的：组件字段、页面路由、接口契约、交互边界。
- 如果用户口头要求实现的逻辑与现有 `docs/` 内容不符，你必须立刻停止编写，并回答：“请先更新对应的 docs 文档，我才能为您生成代码。”
- 物理防线：pre-commit 会拦截「改 `src/**` 运行代码但未同步 `docs/changelog.md`」的提交（`scripts/check-changelog.cjs`），不要尝试绕过（`--no-verify` 被禁止）。

## 1. HTML 标签隔离（MUST NOT）

- 绝对禁止在模板中使用 Web 标签：`div`、`span`、`p`、`img`、`a`、`ul/li`、`h1~h6`。
- 必须使用 uni-app 内置组件替代：
  - `div` → `view`
  - `span` / `p` → `text`
  - `img` → `image`（必须显式设置 `mode`，如 `aspectFit`）
  - `a` → `navigator` 或 `view` + 跳转 API
  - 滚动容器 → `scroll-view`（禁止依赖 body 滚动的 H5-only 方案）

## 2. 浏览器 API 拦截（MUST NOT）

- 禁止在跨端代码中直接使用 `window`、`document`、`localStorage`、`sessionStorage`、`navigator.*`、`XMLHttpRequest`/`fetch`。
- 必须替换为 uni API：
  - `localStorage` → `uni.setStorageSync` / `uni.getStorageSync`（且本项目统一经 `src/utils/storage.ts` 封装，禁止散落直调）
  - 网络请求 → 本项目统一经 `src/services/http.ts`（禁止裸 `uni.request`）
  - 系统/环境信息 → `uni.getSystemInfoSync` 等
- 例外：确需 DOM 的 H5-only 逻辑，必须放 `src/utilsH5/` 或包裹在 `// #ifdef WEB` 条件编译块内。

## 3. 路由限制（MUST NOT）

- 绝对禁止引入或使用 `vue-router`。
- 页面跳转必须使用 uni 路由 API：`uni.navigateTo`、`uni.redirectTo`、`uni.switchTab`、`uni.reLaunch`、`uni.navigateBack`。
- 所有页面必须在 `src/pages.json` 注册（工具页注册到 `subPackages/tools` 分包节点，并同步 `src/config/tools.ts` 入口）；新增页面前必须在需求文档中写明将要配置的路由路径，避免路由冲突/丢失。

## 4. 样式适配（MUST）

- 移动端尺寸单位强制使用 `rpx`（750 设计稿基准），严禁写死 `px`（仅 1px 物理描边等极少数场景可用 `1rpx`/媒体查询处理）。
- 颜色/背景/边框/阴影必须走主题 token `--theme-*`（定义于 `src/utils/theme.ts`），禁止新增硬编码颜色与渐变。
- 禁止使用小程序不支持的选择器（如通配符 `*`、标签选择器作用于 `h1` 等 Web 标签）。

## 5. 条件编译规范（MUST）

- 平台差异必须使用 uni-app 条件编译指令，禁止运行时 UA 嗅探：
  - 脚本/样式：`// #ifdef MP-WEIXIN` / `// #ifdef WEB`（或 `H5`）/ `// #ifdef APP-PLUS` / `// #ifndef MP-WEIXIN` … `// #endif`
  - 模板：`<!-- #ifdef MP-WEIXIN -->` … `<!-- #endif -->`
- 每个页面/组件必须同时兼容 H5 与微信小程序双端；不允许提交仅单端可用且无 `#ifdef` 保护的代码。

## 6. 语言与框架（MUST）

- Vue 3 `<script setup lang="ts">` Composition API only；禁止 Options API 新代码；禁止 `any`。
- 生命周期使用 uni-app 页面钩子（`onLoad`/`onShow`/`onReachBottom` 等，来自 `@dcloudio/uni-app`），不得依赖仅浏览器可用的生命周期方案。
