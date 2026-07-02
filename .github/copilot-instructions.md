# Copilot Code Generation Rules

uni-app 3 + Vue 3 + TypeScript multi-platform project (H5 + WeChat Mini Program). Full constraints: `HARNESS.md`.

## Always

- `<script setup lang="ts">` Composition API; typed props/emits; no `any`.
- Support BOTH H5 and mp-weixin; wrap platform-specific code in `// #ifdef WEB` / `// #ifdef MP-WEIXIN`.
- HTTP via `src/services/http.ts` wrapper and per-domain `*.api.ts`; state via pinia stores; storage via `src/utils/storage.ts`.
- Tool pages in `src/subPackages/tools/<name>/`, registered in `src/pages.json` and `src/config/tools.ts`.
- Components PascalCase or `ga-*` prefix; Prettier style (no semicolons, single quotes, width 140); pnpm only.
- Config via `import.meta.env.VITE_*` (.env files).

## Never

- Never call `uni.request` directly, or `window`/`document` outside `#ifdef WEB` / `src/utilsH5/`.
- Never add pages to the main package `src/pages/` (sub-packages only).
- Never hallucinate backend endpoints — contracts come from the express-mongo-docker Swagger docs.
- Never add dependencies, or edit `vite.config.ts` / `manifest.json` / `.env.*` / deploy scripts.
- Never hardcode secrets, tokens, or domains.
