---
description: 技术栈编码守则（uni-app 3 / Vue 3 / TypeScript / Pinia）
globs: 'src/**/*.{ts,vue,scss}'
---

# 技术栈编码守则

## Vue 3 / TypeScript

- 统一 `<script setup lang="ts">` Composition API，禁止 Options API 新代码。
- 禁止 `any`；props/emits 必须显式类型声明；公共类型放 `src/types/`。
- 代码风格由 Prettier 托管（无分号、单引号、printWidth 140、trailingComma all），提交时 lint-staged 自动格式化生成区以外的手写文件。

## 跨端兼容（H5 + 微信小程序）

- 所有新代码必须双端可用；平台差异用条件编译：`// #ifdef WEB` / `// #ifdef MP-WEIXIN` / `// #ifndef`。
- H5 专用逻辑放 `src/utilsH5/`，禁止在通用代码里直接访问 `window`/`document`（需条件编译包裹）。
- UI 优先使用 uni-ui 与项目内 ga-\* 组件，避免使用仅 H5 可用的 DOM 方案。

## 请求层

- 一律通过既有请求层发起请求，禁止裸 `uni.request`。
- `src/services/**` 由 Apifox 管理，禁止手工修改、增加代码或自动格式化。
- baseURL 等环境差异走 `import.meta.env.VITE_*`（.env.development/.env.test/.env.production）。

## 状态管理

- 全局状态用 pinia store（`src/stores/`），需要持久化的用 pinia-plugin-persistedstate。
- 组件间简单传值不入 store；跨页面/跨分包共享才入 store。

## 存储与登录

- 本地存储统一走 `src/utils/storage.ts`，禁止散落 `uni.setStorageSync`。
- 登录态/token 逻辑复用 `src/utils/autoLogin.ts`、`wxLogin.ts`，禁止另起炉灶。

## 校验命令

- `pnpm lint`（只读检查）、`pnpm lint:fix`（仅修复手写源码）、`pnpm type-check`（vue-tsc --noEmit）；引擎算法改动跑 `pnpm test:tomato`。
