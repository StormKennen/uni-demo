# [功能名称] 需求规格书（AI-Native Spec）

> 使用说明：复制本模板为 `docs/features/<feature-name>.md`，填写后作为 AI 开发的唯一需求真理源。开发前 AI 必须通读本文档、`docs/architecture.md` 与 `HARNESS.md`。

## 0. 元信息

| 项       | 内容                                     |
| -------- | ---------------------------------------- |
| 功能名称 |                                          |
| 所属域   | 主包 / subPackages/tools / user / common |
| 发布端   | H5 + mp-weixin（双端必须）               |
| 状态     | 草稿 / 评审通过 / 开发中 / 已上线        |
| 关联文档 | 后端 PR / Swagger / 设计稿链接           |

## 1. 业务上下文与页面流

### 1.1 业务背景

（一句话说明用户是谁、要解决什么问题、成功标准是什么。）

### 1.2 页面流与路由（MUST 填写，防路由冲突）

| 页面   | 路由路径（pages.json 注册位置）                   | 跳转方式         | 来源入口                      |
| ------ | ------------------------------------------------- | ---------------- | ----------------------------- |
| 列表页 | `subPackages/tools/<name>/list`（tools 分包节点） | `uni.navigateTo` | 首页工具卡（config/tools.ts） |
| 详情页 | `subPackages/tools/<name>/detail?id=xxx`          | `uni.navigateTo` | 列表项点击                    |

- 需要在 `src/pages.json` 中新增的路由路径：（逐条列出，含 navigationStyle 等 style 配置）
- 需要在 `src/config/tools.ts` 中注册的工具入口：（名称/图标/路径/是否需登录 requiresAuth）
- 页面返回/兜底行为：（如 404、无权限时 navigateBack / redirectTo 到哪）

## 2. 前后端 API 契约（TypeScript）

> 契约以后端 Swagger / `src/services/apifox/**` 生成层为准，禁止臆测接口。所有请求经 `src/services/http.ts`。

### 2.1 接口清单

| 功能 | 方法与路径    | 鉴权     | 调用封装（services 层方法） |
| ---- | ------------- | -------- | --------------------------- |
| 列表 | `GET /v1/xxx` | 登录用户 | `getXxx`（apifox 生成层）   |

### 2.2 TypeScript 契约

```ts
// Request
interface GetXxxQuery {
  page?: number
  limit?: number
}

// Response
interface GetXxxRes {
  results: XxxItem[]
  page: number
  totalPages: number
  totalResults: number
}

interface XxxItem {
  id: string
  name: string
}
```

### 2.3 错误与权限处理

- 401：由 http.ts 统一刷新重试，页面无需处理。
- 404 / 无权限：提示文案（如「无权限或资源不存在」）与回退路径。
- 权限字段驱动 UI：（如 `accessRole` / `canEdit`，按后端返回控制入口显隐，禁止前端自行比对用户 ID。）

## 3. 交互约束

### 3.1 防重与防抖（MUST）

- 提交按钮：请求期间必须置 `loading` / `disabled`，防止重复提交。
- 列表触底加载：`loading` + `hasMore` 双闸，防止并发翻页。
- 搜索输入：防抖 ≥ 300ms（用 lodash-es `debounce`）。

### 3.2 状态与空态

- Loading / 空态 / 错误态 / 未登录态各自的展示与文案。
- 空态是否有引导操作（按钮/默认推荐内容）。

### 3.3 主题

- 所有颜色/背景/描边/阴影走 `--theme-*` token，白天/夜间双主题均需验收；禁止硬编码颜色与渐变。

## 4. 埋点

| 事件名 | 触发时机 | 参数 |
| ------ | -------- | ---- |
|        |          |      |

（无埋点需求则写「本期无」。埋点走 `src/utils/tracker.ts`。）

## 5. 条件编译与跨端兼容说明

- 平台差异点清单（逐条列出并注明处理方式）：
  - 例：H5 用 `navigator.clipboard` → 必须改用 `uni.setClipboardData`（双端通用）。
  - 例：仅小程序需要的分享钩子 → `// #ifdef MP-WEIXIN` 包裹。
- 禁用项自查：无 `div/span/img`、无 `window/document/localStorage` 直调、无 `vue-router`、无写死 `px`、无裸 `uni.request`。

## 6. 验收清单

- [ ] H5 白天/夜间模式正常
- [ ] mp-weixin 白天/夜间模式正常
- [ ] 路由已在 `pages.json` 正确注册，无冲突
- [ ] `pnpm lint` / `pnpm type-check` 通过
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin` 通过
- [ ] `docs/changelog.md` 已同步更新
