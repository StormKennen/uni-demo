# Apifox 生成区保护规则

`src/services/**` 由 Apifox 管理。架构任务不得手工修改、移动、重命名或格式化其中的文件，也不得在该目录增加手写代码。

## 质量命令

- `pnpm lint` 仅检查手写源码，不执行自动修复。
- `pnpm lint:fix` 仅对生成区之外的手写源码执行 ESLint 自动修复。
- ESLint、Prettier 与 lint-staged 均排除 `src/services/**`。
- `pnpm check:generated-boundary` 只读检查工作区、索引及未跟踪文件中的生成区变化。
- CI 可通过 `pnpm check:generated-boundary -- --base <git-ref>` 或 `GENERATED_BOUNDARY_BASE=<git-ref>` 检查基准分支到 `HEAD` 的变化。

## 检查限制

生成区保护脚本只读取 Git 差异，不会还原文件、修改 Git 索引或写入项目文件。它无法区分合法的 Apifox 重新生成与手工修改；检测到差异时仍需由维护者根据任务边界确认来源和授权。
