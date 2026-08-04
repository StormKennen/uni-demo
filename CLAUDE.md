# CLAUDE.md — Claude Code 项目守则

> 本仓库受 Harness 工程体系约束。`HARNESS.md` 为最高约束文档（RFC 2119 MUST/MUST NOT），`AGENTS.md` 为日常操作指南，本文件为 Claude Code 入口。冲突时以 `HARNESS.md` 为准。默认使用中文回复。

## 项目概览

uni-app 3 + Vue 3 + TypeScript 多端项目（H5 + 微信小程序），工具箱型客户端（备忘录、日历、图鉴、家谱、游戏兑换码、图片/视频工具等），后端为 express-mongo-docker API。包管理器仅限 pnpm。

## 常用命令

```bash
pnpm install / pnpm dev:h5 / pnpm dev:mp-weixin
pnpm lint          # ESLint 只读检查（排除 src/services/**）
pnpm lint:fix      # 仅修复手写源码
pnpm check:generated-boundary # 只读检查生成区差异
pnpm type-check    # vue-tsc --noEmit
pnpm test:tomato   # vitest（engine 算法）
```

## 架构与文件位置

主包 `src/pages/`（仅核心页）；工具页一律放分包 `src/subPackages/tools/<name>/` 并在 `src/pages.json` + `src/config/tools.ts` 注册；组件大驼峰或 ga-\* 前缀放 `src/components/`；请求必须经 `src/services/http.ts`；状态用 pinia（`src/stores/`）；H5 专用工具放 `src/utilsH5/`；纯算法放 `src/engine/`（禁用 uni API）。

## 硬性约束（pre-commit 强制 / 审查拒绝）

- MUST：修改 `src/**` 的提交必须同时更新并 stage `docs/changelog.md`（hook 强制）。
- MUST：双端兼容（H5 + mp-weixin），平台差异用 `// #ifdef` 条件编译；`window`/`document` 只允许在 `#ifdef WEB` 或 `src/utilsH5/` 中出现。
- MUST NOT：未经授权新增依赖；修改 vite.config.ts / manifest.json / .env.\* / 部署脚本；裸 `uni.request`；硬编码密钥/域名。
- MUST NOT：直接推 main/dev；`--no-verify` 绕过 hooks。
- MUST NOT：手工修改或格式化由 Apifox 管理的 `src/services/**`。
- 完成前必须跑通 `pnpm lint` 与 `pnpm type-check`。

## 风格

`<script setup lang="ts">`、禁 `any`、props/emits 显式类型；Prettier 无分号/单引号/printWidth 140（lint-staged 仅自动格式化生成区以外的手写文件）；用户可见文案用中文，标识符用英文。
