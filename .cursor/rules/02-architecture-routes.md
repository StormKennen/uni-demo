---
description: 目录与架构分层规范，约束文件创建位置
globs: 'src/**/*'
---

# 架构分层规范（uni-app 3 多端项目）

## 目录职责（只允许在以下位置创建对应类型文件）

```
src/pages/            主包页面（仅首页 index、我的 mine 等核心页）
src/subPackages/      分包页面：tools/<tool-name>/（工具类）、user/、common/
src/components/       全局复用组件（大驼峰或 ga-* 前缀，如 GaConfirmPopup.vue）
src/services/         接口层：http.ts 统一封装；按域拆分 *.api.ts / *.service.ts
src/stores/           pinia stores（persistedstate 持久化）
src/utils/            跨端通用工具；src/utilsH5/ 仅 H5 工具（条件编译隔离）
src/hooks/            组合式函数（useXxx）
src/engine/           纯算法模块（不依赖 uni API，可被 vitest 测试）
src/config/tools.ts   首页工具入口注册表
src/pages.json        页面路由注册（分包页面注册到对应 subPackages 节点）
```

## 新增一个工具页面的标准动作（MUST）

1. 在 `src/subPackages/tools/<tool-name>/` 创建页面（index.vue 等）
2. 在 `src/pages.json` 对应分包节点注册 path
3. 在 `src/config/tools.ts` 注册首页入口（图标/名称/路径）
4. 接口调用走 `src/services/` 新建或复用 \*.api.ts
5. 双端自测：`pnpm dev:h5` 与 `pnpm dev:mp-weixin`

## MUST NOT

- 禁止在主包 `src/pages/` 新增工具页面（包体积约束，必须走分包）。
- 禁止组件内直接写请求逻辑（必须经 services 层）。
- 禁止在 `src/engine/` 内引用 uni/浏览器 API（保持纯函数可测）。
- 禁止小驼峰/中划线混乱命名新组件：统一大驼峰或 ga-\* 既有前缀风格。
