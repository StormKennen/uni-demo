# 首页 Workspace「工作间」体系需求规格书

## 0. 元信息

| 项       | 内容                             |
| -------- | -------------------------------- |
| 功能名称 | 首页工作间体系                   |
| 所属域   | 首页 / 工具目录 / Tool Directory |
| 发布端   | H5 + mp-weixin                   |
| 状态     | 开发中                           |
| 后端依赖 | 无                               |

## 1. Scope

将首页和工具目录原有 Tool Category 统一为正式 Workspace 模型。首页顶部通过自定义 Workspace Switcher 切换当前工作间；工作台保留常用工具和推荐流程，普通工作间展示一行一个工具，魔灵召唤工作间直接展示公共 Portal 能力。

本功能不新增页面和路由，不修改 `src/pages.json`。

## 2. Workspace 定义

```ts
export type WorkspaceKey = 'workbench' | 'image' | 'video' | 'swc' | 'qr' | 'record' | 'text' | 'entertainment'
```

唯一配置源为 `src/config/workspaces.ts` 的 `WORKSPACES`：

| Key             | 中文名称 | 类型        | 默认顺序 |
| --------------- | -------- | ----------- | -------- |
| `workbench`     | 工作台   | `workbench` | 1        |
| `image`         | 图片     | `tools`     | 2        |
| `video`         | 视频     | `tools`     | 3        |
| `swc`           | 魔灵召唤 | `portal`    | 4        |
| `qr`            | 二维码   | `tools`     | 5        |
| `record`        | 记录     | `tools`     | 6        |
| `text`          | 文本     | `tools`     | 7        |
| `entertainment` | 娱乐     | `tools`     | 8        |

当前平台无可用入口的普通工作间不出现在首页选择器。`swc` 的可见性由公共 `SWC_PORTAL_ENTRIES` 决定。

## 3. Tool → Workspace

`ToolItem.category` 正式迁移为 `ToolItem.workspace: Exclude<WorkspaceKey, 'workbench'>`。工作台是首页聚合能力，不是工具分类，任何 Tool 都不归属 `workbench`。

- 图片：图片上传、拼接、压缩、隐私清理、格式转换、打乱、水印、文档扫描、PDF 工具箱。
- 视频：视频压缩、视频链接整理、视频转 GIF。
- 魔灵召唤：所有 SWC Portal、图鉴管理、阵容、映射、克制、兑换券入口。
- 二维码、记录、文本、娱乐继续按领域归属；娱乐普通入口只保留台球瞄准器。
- `disabled`、`hiddenInDirectory`、`unsupportedPlatforms`、`requiresAuth`、`adminOnly` 等规则不变。

## 4. Workbench 特殊规则

`workbench` 继续展示原有「常用工具」和「推荐流程」。原算法、fallback、工具点击和流程跳转保持不变。

`APP_RECENT_TOOLS` 是具体工具访问历史，只用于工作台常用工具；禁止由工作间切换写入或由 Workspace History 驱动。

## 5. SWC Portal Workspace

`src/config/swc-portal.ts` 的 `SWC_PORTAL_ENTRIES` 是 SWC 公共入口唯一数据源，同时供现有 SWC 综合入口页和首页 `swc` 工作间读取。首页不展示管理员入口，也不先展示“魔灵召唤”再多跳一层。

## 6. Current Workspace 与手动偏好

- `APP_CURRENT_WORKSPACE`：用户下次普通进入首页时默认打开的工作间。
- `APP_WORKSPACE_MANUAL_SELECTED`：用户是否曾主动切换过工作间，用于区分用户偏好和分享建立的默认值。

上述状态由 `src/utils/storage.ts` helper 统一读写。旧 `media/wiki` 等无效值回退到 `workbench`。

选择器顺序始终按 `WORKSPACES` 的 `defaultOrder` 固定排列，不受当前选中项或任何 Storage 影响。当前项通过选中样式和勾选图标表达，不移动到顶部。

## 7. 初始化与主动切换

首页 `onLoad`：

1. 合法且当前平台可用的 `options.workspace`：临时进入分享工作间。
2. 否则使用合法且可用的 `APP_CURRENT_WORKSPACE`。
3. 否则进入 `workbench`。

分享初始化时，若 `APP_WORKSPACE_MANUAL_SELECTED` 不为 `true`，将分享工作间写入 `APP_CURRENT_WORKSPACE` 作为默认 Seed；不改变手动选择状态。已有手动偏好的用户只临时展示分享工作间，不覆盖自己的默认值。普通初始化不改变任何偏好状态。

用户从选择器主动选择不同工作间时：更新当前页面、写 `APP_CURRENT_WORKSPACE`、写 `APP_WORKSPACE_MANUAL_SELECTED=true` 并关闭菜单。点击当前工作间只关闭菜单，不产生任何持久化变化。

## 8. Workspace Switcher

首页局部组件 `HomeWorkspaceSwitcher.vue` 负责 Logo、当前名称、箭头、遮罩、滚动菜单和选中状态，只通过 props/emits 通信，不读写 Storage 或操作 Tool。

## 9. Share

首页分享 query 固定使用 `workspace`：

```text
/pages/index/index?workspace=image
```

分享标题随当前 Workspace 动态生成。分享打开后展示指定 Workspace；未主动选择过工作间的用户会把它保存为默认 Seed，已经主动选择过的用户不被覆盖。无效 query 按本地保存值、再按 workbench 安全回退。

## 10. H5 / MP-WEIXIN

- 自定义 Dropdown 使用 uni-app 组件和 `uni-icons`，禁止原生 picker、ActionSheet、浏览器 API 和微信专属 API。
- H5 保留现有 `H5TabBar`。
- 平台不支持的工具继续由现有 Tool Directory 过滤；空工作间不显示。
- Navbar trigger、Dropdown、Mask、工具卡使用现有主题 token，日间/夜间均可读。

## 11. 工具目录

`src/pages/tools/index.vue` 使用同一 `WORKSPACES` 和 `getToolsByWorkspace()` 分组；不展示虚拟 `workbench` 空组。目录内展开/折叠只是浏览状态，不修改首页默认 Workspace。

## 12. Out of scope

- 新页面、TabBar 或路由
- 后端与 Apifox generated code
- 登录、设置、Mine、Auth、Tracker 算法重构
- Pinia Workspace Store
- 新依赖、UI Library 或动画资源
- 所有 Tool 页面重构

## 13. 验收

- [ ] 工作台原有常用工具和推荐流程保持
- [ ] 图片、视频、魔灵召唤独立工作间
- [ ] 娱乐普通入口只剩台球
- [ ] Dropdown 非原生 picker，Logo 整体热区可点击
- [ ] Current Workspace 与 Manual Selection 两类 Preference Storage 职责独立
- [ ] 分享 Workspace 不覆盖接收方本地状态
- [ ] Picker 固定顺序，不按最近操作时间重排
- [ ] 未手动选择用户可由分享 Workspace 建立默认 Seed，已有偏好不被分享覆盖
- [ ] tools/index 与首页使用同一 WORKSPACES
- [ ] H5 + MP-WEIXIN 构建通过
