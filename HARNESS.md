# HARNESS SYSTEM SPECIFICATION (FOR AUTONOMOUS AGENTS)

This project runs under strict Harness Engineering constraints. As an autonomous AI Agent (such as Devin), you have full bash/terminal access, but your behavior is bounded by this document. Keywords MUST, MUST NOT, REQUIRED are to be interpreted as in RFC 2119.

## Compiler / Agent Compatibility Matrix

| 工具                                             | 自动读取的入口文件                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Cursor（新版）                                   | `.cursor/rules/01-global-harness.md`、`02-architecture-routes.md`、`03-tech-stack-spec.md` |
| Cursor（旧版）/ Windsurf / DeepSeek 等插件类工具 | 根目录 `.cursorrules`、`.windsurfrules`                                                    |
| Devin / 自主 Agent                               | `HARNESS.md`（本文件）+ `AGENTS.md`                                                        |
| OpenAI Codex CLI / 遵循 AGENTS.md 标准的 Agent   | `AGENTS.md`                                                                                |
| Claude Code                                      | `CLAUDE.md`                                                                                |
| GitHub Copilot / Copilot Chat                    | `.github/copilot-instructions.md`                                                          |

所有入口文件均以本文件为最高约束源。

## Tech Stack Baseline

- uni-app 3 + Vue 3.5 (`<script setup lang="ts">`) + TypeScript, Pinia (+persistedstate), vue-i18n, uni-ui, Vite 5, pnpm as the ONLY package manager.
- Multi-platform: every page/component MUST work on both H5 and WeChat Mini Program; platform differences via `// #ifdef WEB` / `// #ifdef MP-WEIXIN` conditional compilation.
- Structure: main package `src/pages/`, sub-packages `src/subPackages/{tools,user,common}/`, request layer `src/services/http.ts`, pure algorithm modules `src/engine/` (vitest-tested).

## Sandbox & Execution Constraints

1. **Directory Quarantine:** You MUST only write/modify files inside `src/`, `docs/`, and test files. You MUST NOT touch `vite.config.ts`, `src/manifest.json`, `tsconfig.json`, `.env.*`, or deploy scripts (`deploy-h5*.sh/.ps1`) unless explicitly instructed.
2. **Architecture Baseline:** Before planning, you MUST read `README.md` and the relevant design docs under `docs/`. New pages MUST be registered in `src/pages.json` (sub-package node) and tool entries in `src/config/tools.ts`.
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
