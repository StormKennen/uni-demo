# Apifox 代码生成配置

`src/services/**` 由 Apifox 自动生成插件管理。不得手工修改、格式化、移动或在其中加入业务代码。

## 创建本地配置

1. 将 `.vscode/autoApiGen.example.json` 复制为 `.vscode/autoApiGen.json`。
2. 保留模板中的项目 ID、输出目录、生成模板和其他非敏感选项。
3. 仅在本地填写插件需要的 `Authorization`；如实际会话需要 Cookie，也只在本地填写。
4. 运行生成前确认输出目录仍为 `/src/services`。
5. 生成后使用 `pnpm check:generated-boundary` 检查架构任务是否意外触碰生成区。

`.vscode/autoApiGen.json` 已加入 `.gitignore`，只能作为本地私有配置存在。不得把真实令牌粘贴到示例文件、Issue、构建日志、提交信息或 AI 会话中。`.vscode/autoApiGen.example.json` 是唯一可提交的插件配置模板，其中敏感字段必须保持为空。

当前无法确认该 VS Code 插件支持环境变量替换或 Secret Storage，因此本阶段不改变插件配置格式。若插件后续明确支持安全存储，应优先迁移并更新本文档。

根目录遗留的 `apifox.config.js` 已移除，不再作为生成入口。其历史版本曾包含凭证；当前文件删除不会清除 Git 历史，旧凭证仍需在 Apifox 平台人工撤销或轮换。
