# HARNESS SYSTEM SPECIFICATION (FOR AUTONOMOUS AGENTS)

This project runs under strict Harness Engineering constraints. As an autonomous AI Agent (such as Devin), you have full bash/terminal access, but your behavior is bounded by this document. Keywords MUST, MUST NOT, REQUIRED are to be interpreted as in RFC 2119.

## Compiler / Agent Compatibility Matrix

| 工具                                             | 自动读取的入口文件                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Cursor（新版）                                   | `.cursor/rules/01-global-harness.md`、`01-uni-app-rules.md`、`02-architecture-routes.md`、`03-tech-stack-spec.md` |
| Cursor（旧版）/ Windsurf / DeepSeek 等插件类工具 | 根目录 `.cursorrules`、`.windsurfrules`                                                                           |
| Devin / 自主 Agent                               | `HARNESS.md`（本文件）+ `AGENTS.md`                                                                               |
| OpenAI Codex CLI / 遵循 AGENTS.md 标准的 Agent   | `AGENTS.md`                                                                                                       |
| Claude Code                                      | `CLAUDE.md`                                                                                                       |
| GitHub Copilot / Copilot Chat                    | `.github/copilot-instructions.md`                                                                                 |

所有入口文件均以本文件为最高约束源。

## Tech Stack Baseline

- uni-app 3 + Vue 3.5 (`<script setup lang="ts">`) + TypeScript, Pinia (+persistedstate), vue-i18n, uni-ui, Vite 5, pnpm as the ONLY package manager.
- Multi-platform: every page/component MUST work on both H5 and WeChat Mini Program; platform differences via `// #ifdef WEB` / `// #ifdef MP-WEIXIN` conditional compilation.
- Structure: main package `src/pages/`, sub-packages `src/subPackages/{tools,user,common}/`, request layer `src/services/http.ts`, pure algorithm modules `src/engine/` (vitest-tested).

## Sandbox & Execution Constraints

1. **Directory Quarantine:** You MUST only write/modify files inside `src/`, `docs/`, and test files. You MUST NOT touch `vite.config.ts`, `src/manifest.json`, `tsconfig.json`, `.env.*`, or deploy scripts (`deploy-h5*.sh/.ps1`) unless explicitly instructed.
2. **Architecture Baseline:** Before planning, you MUST read `README.md`, `docs/architecture.md`, and the relevant feature spec under `docs/features/` (template: `docs/features/template.md`). New pages MUST be registered in `src/pages.json` (sub-package node) and tool entries in `src/config/tools.ts`; the target routes MUST be written in the feature spec BEFORE touching `src/pages.json` to avoid route conflicts.
3. **Third-Party Dependencies:** You MUST NOT run `pnpm add` or edit `dependencies` without explicit human confirmation.
4. **Git Policy:** Work on feature branches only (e.g. `devin/*` / `feature/ai-harness-*`). Pushing to `main`/`dev` directly is FORBIDDEN. Bypassing hooks (`--no-verify`) is FORBIDDEN.
5. **Changelog Gate (REQUIRED):** Any commit changing `src/**` MUST also stage an update to `docs/changelog.md` (enforced by `scripts/check-changelog.cjs` pre-commit hook).
6. **Request Layer (REQUIRED):** All HTTP calls go through `src/services/http.ts`; raw `uni.request` is FORBIDDEN. Backend contracts come from the express-mongo-docker Swagger docs — do NOT invent endpoints.
7. **Cross-Platform (REQUIRED):** You MUST NOT ship H5-only code paths without `#ifdef` guards; `window`/`document` access outside `src/utilsH5/` or `#ifdef WEB` blocks is FORBIDDEN.
8. **Completion Claims:** You MUST NOT claim completion without running `pnpm lint` and `pnpm type-check` (and `pnpm test:tomato` for engine changes).

## Coding Contract (summary)

- Vue 3 `<script setup lang="ts">` only; no `any`; typed props/emits.
- Components: PascalCase or existing `ga-*` prefix; global reusable ones in `src/components/`.
- Tool pages live in `src/subPackages/tools/<name>/`, never in the main package.
- Storage via `src/utils/storage.ts`; login/token via `src/utils/autoLogin.ts` / `wxLogin.ts`.
- Prettier style: no semicolons, single quotes, printWidth 140 (lint-staged auto-formats).

## AI Red Lines (allowed vs forbidden)

**AI 允许做（ALLOWED）:**

- 修改 `src/pages/` 下的页面与 `src/subPackages/**` 分包页面。
- 修改/新增 `src/components/` 下的组件，调用已有公共组件（uni-ui、`ga-*`、`PageLayout`）与工具类（`src/utils/`、`src/hooks/`、`src/services/`）。
- 更新 `docs/`（含 `docs/changelog.md`、`docs/features/*.md`）与测试文件。

**AI 绝对禁止（FORBIDDEN）:**

- 私自修改 `src/pages.json` —— 仅当需求文档（`docs/features/*.md`）明确列出新增页面及其路由路径时，方可在对应分包节点新增注册；禁止删除/改动既有路由。
- 私自修改根目录配置文件：`vite.config.ts`、`src/manifest.json`、`tsconfig.json`、`.env.*`、`package.json`（scripts/依赖）、部署脚本、husky/pre-commit 卡点。
- 私自引入未经允许的第三方 npm 包（禁止 `pnpm add` / 修改 dependencies，需人工确认）。
- 使用 Web 标签（`div/span/img/p`）、浏览器 API（`window/document/localStorage` 直调）、`vue-router`、写死 `px`、裸 `uni.request`（详见 `.cursor/rules/01-uni-app-rules.md`）。
