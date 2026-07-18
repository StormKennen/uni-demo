# 项目架构全景图（uni-demo）

> 门派二（Specs）基座文档：AI 与开发者在动手前必须先读本文与 `HARNESS.md`。新功能需求写入 `docs/features/<feature>.md`（模板见 `docs/features/template.md`）。

## 1. 技术栈

uni-app 3 + Vue 3.5（`<script setup lang="ts">`）+ TypeScript + Pinia（persistedstate）+ vue-i18n + uni-ui + Vite 5；包管理器仅限 pnpm。发布端：**H5 + 微信小程序**（双端硬性验收）。后端：express-mongo-docker API（契约以 Swagger / Apifox 生成层为准）。

## 2. 目录拓扑（项目骨架）

```
src/
├── pages/                     主包页面（仅核心页：index 首页、tools 全部工具、mine 我的、mine/login 登录）
├── subPackages/               分包（新页面一律走分包）
│   ├── tools/<tool-name>/     工具页（memo、calendar、compendium、family-tree、game-coupons、
│   │                          image-*、video-*、qr-*、magnet-link、markdown、oss-upload、watermark…）
│   ├── user/                  用户域页面（设置等）
│   ├── common/                通用页面（webview）
│   └── services/              分包内服务模块
├── editor-core/               富文本编辑内核（独立分包，pages.json 中 root: "editor-core"）
├── components/                全局复用组件（PascalCase 或 ga-* 前缀；easycom 自动注册）
├── services/                  接口层：http.ts 统一封装；apifox/ 为生成层；按域 *.api.ts / *.service.ts
├── stores/                    Pinia stores（global / theme / mall，persistedstate 持久化）
├── hooks/                     组合式函数（useXxx，如 use-tool-directory、useTheme）
├── utils/                     跨端通用工具（storage、theme token、autoLogin、wxLogin、share…）
├── utilsH5/                   仅 H5 工具（DOM 访问隔离区）
├── engine/                    纯算法模块（tomato-cipher、simple-scrambler；禁 uni API，vitest 覆盖）
├── config/tools.ts            首页/工具目录入口注册表（新工具必须注册）
├── pages.json                 路由唯一真理源（主包 pages + subPackages 节点）
├── manifest.json              平台配置（禁改区）
└── static/                    静态资源（@img 别名指向 static/images）
docs/                          设计文档（真理源）；changelog.md 为提交卡点；features/ 为需求规格书
```

## 3. 组件共享机制

- 全局组件放 `src/components/`，命名 PascalCase（如 `PageLayout.vue`、`FolderPicker.vue`）或既有 `ga-*` 前缀（如 `ga-select`、`ga-calendar`）。
- easycom 自动注册：`uni-*` → `@dcloudio/uni-ui`，`PageLayout` → `@/components/PageLayout.vue`；页面骨架统一用 `PageLayout`（内含自绘 navbar / h5-tab-bar / 主题容器 ThemeRoot）。
- 仅单工具使用的组件放该工具分包目录内，不进全局 `components/`。

## 4. 全局状态管理

- 使用 **Pinia**（`src/stores/`）：`global.ts`（登录态/用户信息）、`theme.ts`（白天/夜间主题，配合 `src/utils/theme.ts` 的 `--theme-*` token）、`mall.ts`。
- 需要持久化的 store 用 pinia-plugin-persistedstate；本地存储统一经 `src/utils/storage.ts`。
- 组件间简单传值用 props/emits，不入 store；跨页面/跨分包共享才入 store。禁止用 `uni.$emit` 做全局状态。

## 5. 请求与鉴权

- 所有 HTTP 经 `src/services/http.ts`（自动携带 Token/平台头、401 刷新重试、业务码校验）；禁止裸 `uni.request`。
- Apifox 生成层：`src/services/apifox/<PROJECT>/<DOMAIN>/apifox.ts`（方法）+ `interface.ts`(类型)，优先复用。
- baseURL 等环境差异走 `import.meta.env.VITE_*`（`.env.development` / `.env.test` / `.env.production`，禁改区）。
- 登录/token：`src/utils/autoLogin.ts`、`wxLogin.ts`，禁止另起炉灶。

## 6. 新增工具页面标准动作（MUST）

1. `src/subPackages/tools/<tool-name>/` 创建页面
2. `src/pages.json` 对应分包节点注册 path（需求文档必须先写明路由路径）
3. `src/config/tools.ts` 注册首页入口
4. 接口经 `src/services/`（复用或新建 \*.api.ts / Apifox 层）
5. 双端自测（`pnpm dev:h5` + `pnpm dev:mp-weixin`），完成前跑 `pnpm lint` 与 `pnpm type-check`
6. 提交同步更新 `docs/changelog.md`（pre-commit 强制）

## 7. 质量与提交卡点

- 分支：仅 feature 分支（`devin/*` 等），禁推 `main`/`dev`，禁 `--no-verify`。
- pre-commit：lint-staged（Prettier 无分号/单引号/printWidth 140）+ `scripts/check-changelog.cjs`（改 `src/**` 必须同步 stage `docs/changelog.md`）。
- 校验命令：`pnpm lint`、`pnpm type-check`、`pnpm test:tomato`（engine 改动）、`pnpm build:h5` / `pnpm build:mp-weixin`。
