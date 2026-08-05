# uni-app 可维护组件结构

## 五层组件边界

| 层级 | 位置 | 允许内容 | 禁止内容 |
| --- | --- | --- | --- |
| 应用壳 | `src/components/PageLayout.vue` | 页面布局、导航栏、主题、安全区、分享与隐私能力 | 具体工具业务、接口数据处理 |
| 基础 UI | `src/shared/ui/` | 无业务含义的空状态、加载状态、弹窗外壳、通用状态展示 | 工具流程、接口调用、业务文案规则 |
| 工具通用组件 | `src/subPackages/tools/_shared/components/` | 多个工具复用的卡片、操作行、轻量布局组件 | 单一业务数据模型、Apifox DTO、平台专属逻辑 |
| 跨工具功能组件 | `src/subPackages/tools/_shared/features/` | 能在多个工具流程中复用的完整功能面板 | 仅属于一个工具的页面状态或接口调用 |
| 业务域组件 | `src/subPackages/tools/<domain>/components/` | 只属于 memo、family-tree、oss-upload 等单一业务的组件 | 为了“看起来通用”提前进入 shared |

## 放置规则

1. `PageLayout.vue` 保持原路径和现有接口，不批量迁移页面。
2. 只有跨多个业务域复用、体积较小且没有业务接口依赖的组件才进入 `src/shared/`。
3. 工具间共享的布局组件进入 `tools/_shared/components`；包含完整工作流的面板进入 `tools/_shared/features`。
4. 单一业务组件留在业务目录。新组件先放业务目录，出现稳定复用后再迁移。
5. 简单工具保持页面 + 少量局部组件；复杂业务按业务域组织，不用全局组件目录承载业务代码。

## 本轮试点

- 基础 UI：`EmptyState`，由码包页直接使用。
- 工具通用组件：`ToolSectionCard`、`ToolActionRow`，由新的二维码功能面板使用。
- 跨工具功能：`QrGeneratorPanel`，由二维码生成、磁力链接、码包三个页面使用。
- 原 `src/components/toolkit/business/qr-generator-panel.vue` 已移除；未迁移的 toolkit 组件继续使用原路径，避免批量改动。

## API 边界

新业务代码不直接使用 Apifox DTO；旧代码在实际修改时逐步迁移。只有出现明确业务适配需求时才建立手写 API 适配层，不为目录完整性提前创建空抽象。本轮族谱成员详情与编辑因生成函数未展开路径参数，在 `src/api/family-tree.ts` 增加了最小手写适配。
