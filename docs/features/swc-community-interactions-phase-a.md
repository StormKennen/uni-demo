# SWC 阵容社区互动与选择流程 Phase A

## 0. 范围

本阶段只实现前端 UI、页面状态、选择流程和跨页面回跳，不猜测后端新增契约，不修改 `src/services/apifox/**`，不执行最终 H5/mp-weixin 构建。

## 1. 页面与路由

在 `subPackages/tools` 分包注册：

| 页面 | 路由 |
| --- | --- |
| 阵容选择页 | `subPackages/tools/compendium/swc/lineup-picker` |

`lineup-picker` 复用现有 `GET /compendiums/lineups` 查询能力，支持关键词、类型、人物精准筛选、严格单选、分页、确认返回和快捷创建入口。

## 2. 本阶段交付

- 新增 `lineup-interaction-bar.vue`，展示点赞、点踩、收藏并通过事件交给页面处理。
- 阵容列表、阵容克制页增加社区互动 UI、范围筛选状态（全部/我创建的/我的收藏）和 `lineup.canEdit` 编辑入口。
- 新增 `lineup-relation-editor.vue`，维护固定关系方向：`defense = source`、`offense = target`。
- 阵容选择页与阵容编辑页之间通过隔离 storage key 传递选择结果；编辑页支持 `returnMode`、`returnKey`、`presetType`、`lockType` 路由上下文。

## 3. 后端契约待接入点

以下位置必须保留 `BACKEND-CONTRACT-PENDING`：

1. 收藏动作的最终 API / Body / Response。
2. 阵容列表查询的 `scope=all|mine|favorites` Query。
3. 用户侧新增/编辑克制关系的最终接口、请求体与响应结构。
4. 创建阵容响应中可安全取得新阵容 ID，并自动回填到 `lineup-picker` 的最终链路。
5. 关系 `canEdit`、`createdAt` 等最终返回字段。

在后端重新生成 Apifox 后，逐项删除上述待接入标记并完成联调。

## 4. 兼容约束

- H5 与 mp-weixin 均使用 uni-app 基础组件和 `storage.ts` 封装。
- 不使用 `as any` 绕过新增契约，不修改生成代码，不新增依赖。
- 本阶段验证：`git diff --check`、`pnpm check:routes`、`pnpm check:generated-boundary`。
