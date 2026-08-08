# AGENTS.md — AI Agent Operating Guide

> This repo is governed by the Harness system. Read `HARNESS.md` first — it is the binding constraint document (RFC 2119 MUST/MUST NOT). This file is the practical day-to-day guide. 默认使用中文回复。

## Project Overview

uni-app 3 + Vue 3 + TypeScript multi-platform app (H5 + WeChat Mini Program), a toolbox-style client (memo, calendar, compendium 图鉴, family-tree, game-coupons, image/video tools) backed by the express-mongo-docker API.

## Setup & Commands

```bash
pnpm install          # pnpm ONLY (never npm/yarn)
pnpm dev:h5           # H5 dev server
pnpm dev:mp-weixin    # WeChat Mini Program dev build (open dist with WeChat DevTools)
pnpm lint             # read-only ESLint check (excludes src/services/**)
pnpm lint:fix         # ESLint autofix for handwritten source only
pnpm check:generated-boundary # read-only generated-region diff check
pnpm type-check       # vue-tsc --noEmit
pnpm test:tomato      # vitest for src/engine/tomato-cipher
pnpm build:h5 / build:mp-weixin
```

## Architecture (where to put code)

```
src/pages/                 main package pages (index, mine only)
src/subPackages/tools/<x>/ tool pages (register in src/pages.json + src/config/tools.ts)
src/components/            global components (PascalCase or ga-* prefix)
src/services/apifox/**      Apifox auto-generated APIs; never hand-edit or format
src/services/              request infrastructure only (http/adapters/security/oss); no business API wrappers
src/stores/                pinia stores (persistedstate)
src/utils/ | src/utilsH5/  cross-platform utils | H5-only utils
src/engine/                pure algorithm modules (no uni APIs, vitest-tested)
docs/                      design docs — source of truth; changelog.md is commit-gated
```

## Hard Rules (enforced by hooks / review)

- Commit to feature branches only; never push `main`/`dev`; never `--no-verify`.
- Changing `src/**` requires a same-commit entry in `docs/changelog.md` (pre-commit enforced).
- No new dependencies without explicit human approval.
- No edits to `vite.config.ts` / `manifest.json` / `.env.*` / deploy scripts unless the task explicitly asks.
- Every page/component must work on BOTH H5 and mp-weixin; platform code behind `// #ifdef` guards.
- No hardcoded secrets/domains; use `import.meta.env.VITE_*`.
- `src/services/apifox/**` is managed by Apifox; lint, formatting, and architecture work MUST NOT modify it.
- Business pages/composables import Apifox methods directly; do not create `src/services/<business>.ts` API wrappers.
- Query/Body/Path types prefer Apifox generated types; when Response schema is inaccurate, put ViewModels in the business module.

## Style

- `<script setup lang="ts">` Composition API only; no `any`; typed props/emits.
- Prettier: no semi, single quotes, printWidth 140; lint-staged formats staged handwritten files and excludes `src/services/**`.
- Chinese for user-facing copy and comments where surrounding code does so; English identifiers.

## Architecture refactor

The long-term architecture refactor plan is documented in:

- docs/architecture/ARCHITECTURE_REFACTOR_PLAN.md

Before executing an architecture phase:

1. Read the complete plan.
2. Only execute the phase explicitly requested by the user.
3. Do not begin subsequent phases automatically.
4. Do not modify `src/services/**`.
5. Complete validation and report results before stopping.


## 业务接口使用规范

1. API 请求方法统一由 `src/services/apifox/**` 提供。
2. 业务页面 / composable 直接 import 对应 Apifox 方法。
3. Query / Body / Path 类型优先使用 Apifox 生成类型。
4. 不创建 `src/services/<business>.ts` API wrapper。
5. Apifox Response 类型准确时直接使用。
6. Response schema 不准确时，业务 ViewModel 放业务目录。
7. normalize / mapper 属于业务域，不属于 services。
8. `src/services/apifox/**` 禁止手工修改。
