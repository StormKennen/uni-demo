---
description: 全局最高约束规范，适用于项目内的所有文件和所有操作
globs: '**/*'
alwaysApply: true
---

# Harness 全局核心宪法（uni-demo）

你现在运行在配备了 Harness 驾驭工程体系的代码库中。必须严格遵守以下硬性约束，任何违反都将导致提交被 pre-commit 卡点拒绝或代码被拒绝合并。默认使用中文回复。

## 1. 认知与需求来源

- **唯一真理源：** 开发依据来自 `README.md`、`docs/` 方案文档（如 `docs/tools-integration-proposal.md`、`docs/compendium-i18n-plan.md`）与 `src/services/` 内的接口定义。
- **严禁臆测：** 严禁凭空猜测业务逻辑或后端接口契约；接口以后端仓库 express-mongo-docker 的 Swagger 为准。文档与口述冲突时，提示用户先更新文档。

## 2. 行为权限边界

- **MUST NOT（绝对禁止）：**
  - 禁止修改全局配置（`vite.config.ts`、`src/manifest.json`、`tsconfig.json`、`.env.*`、部署脚本 `deploy-h5*.sh/.ps1`），除非用户明确授权。
  - 禁止未经用户确认引入新的第三方依赖（`pnpm add` / 修改 package.json dependencies）。
  - 禁止绕过 `src/services/http.ts` 直接调用 `uni.request`。
  - 禁止只考虑单端：所有页面/组件必须同时兼容 H5 与微信小程序（平台差异用 `// #ifdef` 条件编译）。
  - 禁止在未通过 `pnpm lint` 与 `pnpm type-check` 的情况下声称任务完成。
- **MUST（必须做到）：**
  - 修改 `src/**` 的提交必须同步更新并 stage `docs/changelog.md`（pre-commit 强制校验）。
  - 新增页面必须在 `src/pages.json` 正确注册（工具页放对应 `subPackages` 分包，并在 `src/config/tools.ts` 注册入口）。
  - 密钥/域名等配置一律走 `.env.*` 环境变量（`import.meta.env.VITE_*`），严禁硬编码。
