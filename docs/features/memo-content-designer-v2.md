# 备忘录内容设计器 V2

## 0. 元信息

| 项 | 内容 |
| --- | --- |
| 功能名称 | 备忘录内容设计器 V2 |
| 所属域 | `subPackages/tools/memo` |
| 发布端 | H5 + mp-weixin |
| 状态 | 开发中 |
| 关联文档 | 用户提供的《备忘录内容设计器 V2 前端完善》任务编排 |

## 1. 目标与边界

在现有 Schema Driven Block Editor 上补齐移动端文章、攻略、教程、清单和资料页的高频结构化表达。活动实现继续以
`src/subPackages/tools/memo` 为唯一生产代码，本期不迁移旧 `src/subPackages/services/memo`，不合并根 `src/editor-core`，不新增路由。

现有 Text、Image、Route、Attachment、Media 保持兼容，新增 List、Table、Callout、LinkCard。内容点击统一为 `ContentAction`，
新数据保存为 V2 结构，旧 `interactionType`、`linkInfo`、`free` 图片布局和旧 settings 在读取时归一化。

## 2. 页面流与路由

| 页面 | 现有路由 | 说明 |
| --- | --- | --- |
| 列表 | `/subPackages/tools/memo/list` | 不改 |
| 编辑 | `/subPackages/tools/memo/editor?id=...` | 不改 |
| 详情 | `/subPackages/tools/memo/detail?id=...` | 不改 |

- 本期不修改 `src/pages.json` 或 `src/config/tools.ts`。
- API 继续直接使用现有 MEMOS Apifox 方法；请求契约不变，仅补齐已由详情读取的 `settings` 字段。

## 3. 数据与交互约束

- Block 操作收敛到选中态菜单：设置、复制、上移、下移、移动到、锁定、删除。
- 复制 Block 必须深拷贝、生成新 anchor、插入原块之后，并进入 Undo/Redo 历史。
- Schema 面板按「内容、布局、样式、交互、高级」分组；Block 与 Item 共用同一表单协议。
- List 支持 bullet、number、checklist；Table 支持 keyValue、table；Callout 使用有限 tone；LinkCard 点击走 ContentAction。
- Image Item 的预览及跳转、Text Item、LinkCard 共用 ContentAction。
- Media 显式保存 `mediaType`，不再只依赖 URL 后缀；Attachment 新数据只保存文件元信息，旧腾讯文档字段继续读取。
- settings 持久化包含 `editorVersion: 2`、padding、border、appearance、typography、layout、features。

## 4. 跨端说明

- 微信小程序 `miniProgram` Action 使用 `uni.navigateToMiniProgram`。
- H5 的 `miniProgram` Action 仅在存在 `fallbackUrl` 时打开后备链接，否则给出不支持提示。
- 地图使用现有 `openMapNavigation`，外链使用现有 `openExternalLink`。
- 所有新增模板使用 uni-app 组件，不使用 Web 标签或新增依赖。

## 5. 验收清单

- [ ] 九类 Block 可新增、编辑、排序、复制、锁定、删除
- [ ] List/Table/Callout/LinkCard 编辑态与只读态共用 Renderer
- [ ] URL、小程序、备忘录、内部页面、地图、锚点 Action 可降级执行
- [ ] 图片有限布局及 Item Action 正常，旧 `free` 数据可读
- [ ] 视频/音频由 `mediaType` 决定，ResourcePicker 类型匹配
- [ ] settings 保存后重新进入可恢复，背景图保存为远端 URL
- [ ] 旧内容归一化测试通过
- [ ] Undo/Redo、本地草稿和保存流程无回归
- [ ] `pnpm lint`、`pnpm type-check`、H5/微信构建通过

