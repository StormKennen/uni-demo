# Changelog

> Harness 变更日志。每次修改 `src/` 核心代码的提交必须在此追加一条记录（pre-commit 强制校验）。
> 格式：`- YYYY-MM-DD [模块] 变更意图简述（作者/Agent）`

## Unreleased

- 2026-07-01 [harness] 引入 Harness 护栏体系：.cursor/rules/、HARNESS.md、AGENTS.md、CLAUDE.md、copilot-instructions、Husky pre-commit（lint-staged + changelog 强校验）（Devin）
- 2026-07-01 [swc/lineup-edit] 阵容编辑页人物选择改为「精准人物筛选」按钮跳转独立选择页；人物选择页重构为一行五个头像网格、点击选中/取消、底部确认回传（Devin）
- 2026-07-03 [swc/lineup-edit] 放开阵容成员数量限制并允许名称为空提交，创建入口同步传递不限数量参数（Devin）
- 2026-07-03 [swc/lineup-mappings] 创建阵容映射允许空名称创建，取消弹窗必填拦截（Devin）
- 2026-07-03 [swc/character-picker] 选择页默认已觉醒、星级倒序、自动分页加载并接入头像缓存（Devin）
- 2026-07-03 [swc/character-picker] 取消「加载更多」按钮，改为滚动到底部自动加载下一页 50 条（Devin）
- 2026-07-03 [swc/list] 图鉴列表页分页步长统一调整为 50 条（Devin）
