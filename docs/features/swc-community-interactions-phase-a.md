# SWC 阵容社区互动与选择流程

## 0. 范围

Phase A 已完成 UI、页面状态、选择流程和跨页面回跳；Phase B 已按本地重新导入的 Apifox 契约接通收藏、scope、ownership 和服务端分页。始终不修改 `src/services/apifox/**`。

## 1. 页面与路由

在 `subPackages/tools` 分包注册：

| 页面 | 路由 |
| --- | --- |
| 阵容选择页 | `subPackages/tools/compendium/swc/lineup-picker` |

`lineup-picker` 复用现有 `GET /compendiums/lineups` 查询能力，支持关键词、类型、人物精准筛选、`requiredType` 类型锁定、严格单选、分页、确认返回和快捷创建入口。

## 2. 本阶段交付

- 新增 `lineup-interaction-bar.vue`，展示点赞、点踩、收藏并通过事件交给页面处理。
- 阵容列表、阵容克制页增加社区互动 UI、范围筛选状态（全部/我创建的/我的收藏）和 `lineup.canEdit` 编辑入口。
- 新增 `lineup-relation-editor.vue`，维护固定关系方向：`defense = source`、`offense = target`。
- 阵容选择页与阵容编辑页之间通过隔离 storage key 传递选择结果；编辑页支持 `returnMode`、`returnKey`、`presetType`、`lockType` 路由上下文。

## 3. 已接入契约

- `GET /compendiums/lineups` 使用 `scope=all|mine|favorites`，多人物使用后端 `characterIds` AND 查询并保持服务端分页。
- `GET /compendiums/lineup-relations` 使用 `scope=all|mine|favorites`；counter 无人物也可查询。
- `POST /compendiums/lineups/:lineupId/reaction` 继续承载点赞/点踩，并使用 `action: 'favorite'` 完成登录用户收藏切换。
- 阵容互动 ViewModel 解析 `favoriteCount`、`isFavorited`、创建/更新时间和 ownership 字段。
- 新增/编辑阵容和私有 scope/收藏入口使用登录校验；管理员专属映射/删除仍保留原权限边界。

## 4. 后端契约待接入点

仅保留以下位置：

1. 用户侧新增/编辑克制关系的最终接口、请求体与响应结构。当前 `relationWriteAvailable=false`，不会调用管理员关系 API 或伪造成功。

创建阵容响应仍由生成层声明为 `string`；前端兼容提取 ID 后重新读取详情，无法安全提取时保留人工选择兜底。

## 4. 兼容约束

- H5 与 mp-weixin 均使用 uni-app 基础组件和 `storage.ts` 封装。
- 不使用 `as any` 绕过新增契约，不修改生成代码，不新增依赖。
- 验证：`git diff --check`、`pnpm check:routes`、`pnpm check:generated-boundary`、`pnpm lint`、`pnpm type-check`。
