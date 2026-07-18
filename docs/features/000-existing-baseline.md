# 000 存量功能基线账本（Existing Baseline）

> 逆向工程产物：对现有代码的「已实现功能」收录与合规审计。本文档只记录、不改码。老代码违反新规则（`.cursor/rules/01-uni-app-rules.md` 等）的项统一记入文末【技术债与合规风险】章节，作为后续分批重构依据。

## 0. 元信息

| 项       | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 功能名称 | 存量功能基线（全量收录）                                                           |
| 所属域   | 全项目（主包 + subPackages/tools + user + common + editor-core）                   |
| 发布端   | H5 + mp-weixin                                                                     |
| 状态     | 已上线（存量）                                                                     |
| 关联文档 | `docs/architecture.md`、`docs/.audit_report.md`、后端 express-mongo-docker Swagger |

> 说明：本仓库为前端仓库；「后端盘点」基于前端 `src/services/**`（含 Apifox 生成层）中实际调用的接口契约实录，后端路由/Controller 源码不在本仓库内。

## 1. 业务上下文与页面流

### 1.1 当前已存在页面与路由映射（pages.json，共 46 个路由）

**主包 `src/pages/`（tabBar 级核心页，自绘 h5-tab-bar + navigationStyle: custom）**

| 页面     | 路由路径                 | 说明                                         |
| -------- | ------------------------ | -------------------------------------------- |
| 首页     | `pages/index/index`      | 工作台：常用工具 + 推荐流程（PR #1/#2 改版） |
| 全部工具 | `pages/tools/index`      | 工具目录（`src/config/tools.ts` 注册表驱动） |
| 我的     | `pages/mine/mine`        | 用户中心                                     |
| 登录     | `pages/mine/login/login` | 账号/微信登录，支持 `redirectUrl` 回跳       |

**分包 `subPackages/user`**

| 页面 | 路由路径                           |
| ---- | ---------------------------------- |
| 设置 | `subPackages/user/setting/setting` |

**分包 `subPackages/tools`（工具页，首页/工具目录经 `handleToolClick` 跳转）**

| 工具域       | 路由路径                                                                                                                                                                     | 页面                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 备忘录       | `memo/list` / `memo/editor` / `memo/detail`                                                                                                                                  | 列表 / 编辑 / 详情（owner/shared/admin 三视角，PR #3） |
| 族谱         | `family-tree/index` / `family-tree/demo`                                                                                                                                     | 族谱图谱 / 演示                                        |
| 文件上传     | `oss-upload/index` / `oss-upload/fileList`                                                                                                                                   | 上传 / 我的文件列表                                    |
| 图片工具     | `image-compress/index`、`image-watermark/index`、`image-format/index`、`image-cipher/index`、`image-stitch/index`                                                            | 压缩/水印/格式转换/混淆/长图拼接                       |
| 二维码       | `qr-generator/index` / `qr-parser/index`                                                                                                                                     | 生成 / 解析                                            |
| 万年历       | `calendar/index` / `detail` / `festivals` / `auspicious`                                                                                                                     | 日历/黄历/节日/择吉日                                  |
| 视频工具     | `video-compress/index`、`watermark/index`（视频去水印）、`video-gif/index`                                                                                                   | 压缩/去水印/转 GIF                                     |
| 笔记/草稿    | `chat/index` / `chat/list`                                                                                                                                                   | 个人笔记 / 我的草稿                                    |
| Markdown     | `markdown/index`                                                                                                                                                             | MD 转 HTML                                             |
| Schema 编辑  | `schema-demo/list`                                                                                                                                                           | Schema 编辑器                                          |
| 台球瞄准器   | `pool-aim/index`                                                                                                                                                             | 纯前端工具                                             |
| 魔灵召唤图鉴 | `compendium/swc/list` / `detail` / `edit` / `admin-list` / `lineups` / `lineup-edit` / `lineup-relations` / `character-picker` / `lineup-mappings` / `lineup-mapping-detail` | wiki 图鉴 + 阵容体系（含管理端页面）                   |
| 磁力链接     | `magnet-link/index`                                                                                                                                                          | 磁力转换（推荐流程起点）                               |
| 游戏兑换券   | `game-coupons/index`                                                                                                                                                         | 兑换码管理                                             |

**其他分包**

| 分包                 | 路由路径                            | 说明                                             |
| -------------------- | ----------------------------------- | ------------------------------------------------ |
| `editor-core`        | `editor-core/demo/SchemaEditorDemo` | 富文本/Schema 编辑内核演示                       |
| `subPackages/common` | `webview/webview`、`webview/h5`     | 通用 webview 容器（外链工具经 `isWebLink` 跳入） |

### 1.2 页面跳转关系（现状）

- 首页/工具目录 → 工具页：`src/hooks/use-tool-directory.ts` 的 `handleToolClick`（处理 disabled/平台限制/`isWebLink` → webview/`requiresAuth` → 登录页回跳）与 `handleWorkflowClick`（推荐流程 → `?flow=<id>` 创建 tool-flow 会话）。
- 备忘录：list → editor（owner）/ detail（`mode=private|admin&readonly=1`，shared/admin 只读）；detail 公开分享走 `getMemosPublicDetail`。
- 登录拦截：`requiresAuth` 工具未登录时弹窗 → `pages/mine/login/login?redirectUrl=...`。
- 跳转 API 全部为 `uni.navigateTo/redirectTo/switchTab/navigateBack`（无 vue-router，合规）。

### 1.3 全局 Store（Pinia，`src/stores/`）

| Store            | 文件        | 职责                                                                                                                               |
| ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `useThemeStore`  | `theme.ts`  | 白天/夜间主题 mode，`buildPageStyleVars` 生成 `--theme-*`，H5 侧经 `#ifdef WEB` 调 `applyThemeToHtml`，持久化经 `utils/storage.ts` |
| `useMallStore`   | `mall.ts`   | 商城商品列表（Apifox `3903128/shangPinXiangGuan`），分页/推荐位（`VITE_RECOMMEND_BUSINESS_GOODS_ID`）                              |
| `useGlobalStore` | `global.ts` | 空壳占位（未使用）；登录态实际由 `utils/autoLogin.ts`/`wxLogin.ts`/`storage.ts` 管理                                               |

## 2. 当前已开放的前后端 API 契约实录

> 全部经 `src/services/http.ts` 统一封装（自动携带 Token/平台头、401 刷新重试、业务码校验）。契约类型在各域 `interface.ts`。后端为 express-mongo-docker（`/v1` 前缀，兼容 `/api`）。

### 2.1 Apifox 生成层 `src/services/apifox/NODEJSDEMO/`（主后端，方法数为已生成封装数）

| 域                | 方法数 | 代表接口（method path）                                                                                                                                                                                                                                                                   |
| ----------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH              | 9      | `POST /auth/login`、`/auth/register`、`/auth/wechat-login`、`/auth/refresh-tokens`、`/auth/logout`、忘记/重置密码、邮箱验证                                                                                                                                                               |
| MEMOS             | 46     | `GET/POST /memos`、`GET /memos/tags`、`/memos/stats`、`PATCH /memos/batch`、`GET/PATCH/DELETE /memos/{id}`、`/pin` `/favorite` `/archive` `/restore` `/move` `/permanent`、`GET /memos/public/detail`、`GET /admin/memos`、`GET /admin/memos/{id}`（owner/shared/admin 三视角，见 PR #3） |
| MEMOFOLDERS       | 6      | 备忘录文件夹 CRUD                                                                                                                                                                                                                                                                         |
| COMPENDIUMS       | 24     | 魔灵图鉴角色查询/详情/编辑                                                                                                                                                                                                                                                                |
| COMPENDIUMADMIN   | 18     | 图鉴管理端（角色审核/图标上传清单）                                                                                                                                                                                                                                                       |
| COMPENDIUMLINEUPS | 70     | 阵容/克制关系/映射 CRUD + reaction（另有手写聚合层 `compendium-lineups.ts`）                                                                                                                                                                                                              |
| FAMILIES          | 20     | 族谱成员/关系 CRUD                                                                                                                                                                                                                                                                        |
| FILES / oSS       | 12 + 2 | OSS 凭证、文件列表、上传回执                                                                                                                                                                                                                                                              |
| GAMECOUPONS       | 33     | 游戏兑换码 CRUD/批量/统计                                                                                                                                                                                                                                                                 |
| CALENDAR          | 4      | 黄历/节日数据                                                                                                                                                                                                                                                                             |
| GEMINI            | 9      | AI 对话/生成                                                                                                                                                                                                                                                                              |
| INTERACTIONS      | 7      | 点赞/反馈类交互                                                                                                                                                                                                                                                                           |
| PAINTER           | 7      | 海报/绘图服务                                                                                                                                                                                                                                                                             |
| VIDEO             | 10     | 视频处理（去水印解析等）                                                                                                                                                                                                                                                                  |

其他 Apifox 项目：`3903128`（银河甄选商城：商品/订单/租赁申请等 6 域）、`ChaoJiAPP`（商品/商务小程序 2 域）——商城域仅 `useMallStore` 消费。

### 2.2 手写 services 层

| 文件                                          | 职责与代表方法                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `http.ts`                                     | 统一请求封装（唯一合法请求出口）                                                                                      |
| `memo.api.ts`                                 | 备忘录二次封装：`getMemoById`、`updateMemo`、`toggleMemoPin/Favorite`、`archiveMemo`、`permanentlyDeleteMemo` 等      |
| `memo.service.ts`                             | 备忘录业务聚合                                                                                                        |
| `compendium-lineups.ts`                       | 阵容域聚合：`fetchAdminLineups`、`fetchUserLineups`、`saveLineupRelation`、`fetchLineupMappings`、分页工具等 30+ 方法 |
| `oss.ts`                                      | `getUserFileList`、`getFileDownloadLink`                                                                              |
| `security.ts` / `adapters.ts` / `template.ts` | 安全校验、适配层、模板（⚠️ 内含裸 `uni.request`，见技术债 TD-2）                                                      |

### 2.3 契约示例（备忘录列表，实录）

```ts
// GET /v1/memos  (src/services/apifox/NODEJSDEMO/MEMOS)
interface getMemosQuery {
  viewScope?: string // all | owned | shared
  folder_id?: string
  status?: string
  is_pinned?: boolean
  is_favorite?: boolean
  tags?: string
  title?: string
  search?: string
  sortBy?: string
  limit?: number
  page?: number
}
interface getMemosRes {
  results?: any[]
  page?: number
  limit?: number
  totalPages?: number
  totalResults?: number
}
// 每条 result 含权限字段：accessRole: 'owner'|'shared'|'admin'; canEdit/canDelete/canArchive: boolean
```

## 3. 交互与主题现状

- 防重：列表页普遍有 `loading` + `hasMore` 双闸；部分老工具页提交防重不完备（未逐一审计）。
- 主题：新改造页面（首页、备忘录权限入口）走 `--theme-*` token；大量老工具页仍硬编码颜色（见 TD-6）。
- 纯算法层 `src/engine/`（tomato-cipher、simple-scrambler）核心无 uni API，vitest 覆盖；其 `adapters/h5/` 子层依赖 DOM（见 TD-3 备注）。

---

## 【技术债与合规风险（Technical Debt）】

> 🚨 以下为老代码与新规则（`.cursor/rules/01-uni-app-rules.md`）的冲突实录。**本次仅登记，未做任何修改**；重构须分批增量进行并逐项双端回归。行号为登记时快照，重构前请以最新代码为准。

### TD-1 Web 标签（违反规则 §1 HTML 标签隔离）— 17 处 / 5 文件

| 文件                                       | 行号                                      | 违规内容                        | 备注                                                   |
| ------------------------------------------ | ----------------------------------------- | ------------------------------- | ------------------------------------------------------ |
| `src/subPackages/tools/chat/index.vue`     | 374, 408, 411, 413, 418(×3), 422(×3), 430 | `<div>/<h1~h3>/<span>` 共 11 处 | 多为拼接 HTML 字符串供富文本渲染，仍需评估小程序端兼容 |
| `src/subPackages/tools/memo/detail.vue`    | 819, 839                                  | `<div>`、`<a>`                  | HTML 字符串生成                                        |
| `src/subPackages/services/memo/detail.vue` | 757, 777                                  | `<div>`、`<a>`                  | 同上（疑似与 tools/memo 重复的旧副本）                 |
| `src/subPackages/tools/markdown/index.vue` | 48                                        | `<div>`                         | MD 转 HTML 输出容器                                    |
| `src/components/ga-select/ga-select.vue`   | 3                                         | `<span>`                        | 模板内真实 Web 标签，mp 端风险最高                     |

### TD-2 裸 `uni.request`（违反规则 §2 / HARNESS 请求层约束）— 8 处 / 5 文件

| 文件                                         | 行号              |
| -------------------------------------------- | ----------------- |
| `src/services/security.ts`                   | 108               |
| `src/services/adapters.ts`                   | 33                |
| `src/components/ga-province/ga-province.vue` | 22                |
| `src/utils/oss-util.ts`                      | 54                |
| `src/utils/upload/cdpOss.ts`                 | 85, 124, 153, 185 |

（另 `src/subPackages/tools/chat/list.vue` 220/307/348 为注释掉的裸调用，建议清理。）OSS 直传类可能确需绕过业务封装，重构时应显式豁免登记而非默认放行。

### TD-3 `window`/`document` 直调（违反规则 §2）— 约 105 处 / 24 文件（utilsH5 之外）

高频文件：`appDebug/debug.vue`、`components/toolkit/business/{qr-parser,qr-generator,image-shuffle}-panel.vue`、`components/share-app.vue`、`components/l-echart/l-echart.vue`、`subPackages/tools/{image-watermark,markdown,memo/detail,pool-aim,watermark,calendar,image-format,family-tree,video-gif,image-stitch,image-compress}/**`、`subPackages/common/webview/webview.vue`、`utils/loadFile.ts`、`utils/map.ts`、`engine/tomato-cipher/adapters/h5/H5Adapter.ts`。
部分已用 `// #ifdef WEB` 包裹，但以下文件**整文件无任何 `#ifdef` 保护**且直调 `window/document`：`components/share-app.vue`、`utils/loadFile.ts`（跨端 utils 目录内！）、`engine/tomato-cipher/adapters/h5/H5Adapter.ts`（属 H5 适配层、仅经条件入口引用，风险较低）。其余文件需逐一复核 `#ifdef` 覆盖完整性或迁移至 `utilsH5/`。

### TD-4 绕过 `utils/storage.ts` 直调 `uni.setStorageSync/getStorageSync` — 9 文件

`components/ga-select/ga-select.vue`、`subPackages/services/memo/editor.vue`、`subPackages/tools/compendium/swc/list.vue`、`subPackages/tools/memo/editor.vue`、`subPackages/tools/chat/{list,index}.vue`、`subPackages/tools/game-coupons/index.vue`、`hooks/use-tool-directory.ts`、`utils/tracker.ts`。

### TD-5 写死 `px`（违反规则 §4）— 约 580 处（排除 1px 描边）

散布于老工具页与组件样式，重构时按页面维度批量换算 `rpx`。

### TD-6 硬编码颜色/渐变（违反规则 §4 主题 token）— 约 2371 处 hex / 112 个 .vue 文件

首页与备忘录权限入口已 token 化；其余老工具页（calendar、compendium、chat、game-coupons、memo/list 旧样式等）仍大面积硬编码，夜间模式违和的主要来源。建议按「单页单 PR」节奏迁移 `--theme-*`。

### TD-7 其他

- `src/stores/global.ts` 为空壳 store，登录态散落 utils 层，与「全局状态入 store」规范不一致（低风险，暂不动）。
- `src/subPackages/services/memo/**` 疑似 `subPackages/tools/memo/**` 的历史副本，存在双份维护风险，需确认后下线其一。
- 全仓 `pnpm lint`（eslintrc.js 未被识别）与 `pnpm type-check`（vue-tsc 插件版本/残留 `.vue.js` 产物）存在环境级既有失败，属工程债而非业务债。

### 汇总

| 编号 | 类别              | 数量              | 风险              | 建议节奏                    |
| ---- | ----------------- | ----------------- | ----------------- | --------------------------- |
| TD-1 | Web 标签          | 17 处/5 文件      | 高（mp 端渲染）   | 优先：ga-select 模板内 span |
| TD-2 | 裸 uni.request    | 8 处/5 文件       | 中                | 迁 http.ts 或显式豁免       |
| TD-3 | window/document   | ~105 处/24 文件   | 高（mp 端崩溃面） | 逐文件补 #ifdef/迁 utilsH5  |
| TD-4 | 绕过 storage 封装 | 9 文件            | 低                | 顺手迁移                    |
| TD-5 | 写死 px           | ~580 处           | 中                | 按页批量换 rpx              |
| TD-6 | 硬编码颜色        | ~2371 处/112 文件 | 中（夜间模式）    | 单页单 PR 迁 token          |
| TD-7 | 结构性债          | 3 项              | 低                | 择机                        |
