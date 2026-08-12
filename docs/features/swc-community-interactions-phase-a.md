# SWC 阵容社区互动与选择流程

## 0. 范围

Phase A 已完成 UI、页面状态、选择流程和跨页面回跳；Phase B 已按本地重新导入的 Apifox 契约接通收藏、scope、ownership 和服务端分页。始终不修改 `src/services/apifox/**`。

## 1. 页面与路由

在 `subPackages/tools` 分包注册：

| 页面                      | 路由                                                    |
| ------------------------- | ------------------------------------------------------- |
| 阵容选择页                | `subPackages/tools/compendium/swc/lineup-picker`        |
| 用户侧克制关系新增/编辑页 | `subPackages/tools/compendium/swc/lineup-relation-edit` |

`lineup-picker` 复用现有 `GET /compendiums/lineups` 查询能力，支持关键词、类型、人物精准筛选、全部/我创建的/我的收藏范围筛选、`requiredType` 类型锁定、严格单选、分页、确认返回和快捷创建入口。

`lineup-relation-edit` 通过 `mode=create|edit` 统一承载用户侧新增关系、编辑本人创建的关系和从当前主阵容补充克制；不包含管理员关系管理能力。阵容克制页使用右下角 FAB 进入全局新增，结果卡片的“补充克制”和本人关系“编辑”也统一进入该页面。

## 2. 本阶段交付

- 新增 `lineup-interaction-bar.vue`，展示点赞、点踩、收藏并通过事件交给页面处理。
- 阵容列表、阵容克制页增加社区互动 UI、范围筛选状态（全部/我创建的/我的收藏）和 `lineup.canEdit` 编辑入口。
- `lineup-relation-editor.vue` 作为纯 UI 表单组件，维护固定关系方向：`defense = source`、`offense = target`；页面导航、storage 和 POST/PATCH 由 `lineup-relation-edit.vue` 负责。
- 阵容选择页与阵容编辑页之间通过隔离 storage key 传递选择结果；编辑页支持 `returnMode`、`returnKey`、`presetType`、`lockType` 路由上下文。

## 3. 已接入契约

- `GET /compendiums/lineups` 使用 `scope=all|mine|favorites`，多人物使用后端 `characterIds` AND 查询并保持服务端分页。
- `GET /compendiums/lineup-relations` 使用 `scope=all|mine|favorites`；counter 无人物也可查询。
- `POST /compendiums/lineups/:lineupId/reaction` 继续承载点赞/点踩，并使用 `action: 'favorite'` 完成登录用户收藏切换。
- `POST /compendiums/lineup-relations` 新增单条用户侧克制关系，固定使用 `sourceLineupId=防守`、`targetLineupId=进攻`。
- `PATCH /compendiums/lineup-relations/:relationId` 编辑单条用户侧克制关系；用户页面仅展示并提交当前登录用户本人创建的关系，管理员管理仍留在独立管理页。
- 阵容互动 ViewModel 解析 `favoriteCount`、`isFavorited`、创建/更新时间和 ownership 字段。
- 新增/编辑阵容和私有 scope/收藏入口使用登录校验；管理员专属映射/删除仍保留原权限边界。

创建阵容响应仍由生成层声明为 `string`；前端兼容提取 ID 后重新读取详情，无法安全提取时保留人工选择兜底。

## 4. 兼容约束

- H5 与 mp-weixin 均使用 uni-app 基础组件和 `storage.ts` 封装。
- 不使用 `as any` 绕过新增契约，不修改生成代码，不新增依赖。
- 验证：`git diff --check`、`pnpm check:routes`、`pnpm check:generated-boundary`、`pnpm lint`、`pnpm type-check`。
