# AGENTS.md — AI Agent Operating Guide

> This repo is governed by the Harness system. Read `HARNESS.md` first — it is the binding constraint document (RFC 2119 MUST/MUST NOT). This file is the practical day-to-day guide. 默认使用中文回复。

## Project Overview

uni-app 3 + Vue 3 + TypeScript multi-platform app (H5 + WeChat Mini Program), a toolbox-style client (memo, calendar, compendium 图鉴, family-tree, game-coupons, image/video tools) backed by the express-mongo-docker API.

## Setup & Commands

```bash
pnpm install          # pnpm ONLY (never npm/yarn)
pnpm dev:h5           # H5 dev server
pnpm dev:mp-weixin    # WeChat Mini Program dev build (open dist with WeChat DevTools)
pnpm lint             # eslint --fix (config: eslintrc.js)
pnpm type-check       # vue-tsc --noEmit
pnpm test:tomato      # vitest for src/engine/tomato-cipher
pnpm build:h5 / build:mp-weixin
```

## Architecture (where to put code)

```
src/pages/                 main package pages (index, mine only)
src/subPackages/tools/<x>/ tool pages (register in src/pages.json + src/config/tools.ts)
src/components/            global components (PascalCase or ga-* prefix)
src/services/              http.ts wrapper + per-domain *.api.ts; NEVER raw uni.request
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

## Style

- `<script setup lang="ts">` Composition API only; no `any`; typed props/emits.
- Prettier: no semi, single quotes, printWidth 140; lint-staged formats staged files.
- Chinese for user-facing copy and comments where surrounding code does so; English identifiers.
