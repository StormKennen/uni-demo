# 微信小程序统一安全返回（Safe Back）需求规格书

## 0. 元信息

| 项       | 内容                                      |
| -------- | ----------------------------------------- |
| 功能名称 | 微信小程序统一安全返回                     |
| 所属域   | `components` / `utils` / 已注册业务页面   |
| 发布端   | H5 + mp-weixin                            |
| 状态     | 开发中                                    |
| 关联文档 | `HARNESS.md`、`docs/architecture.md`      |

## 1. 业务上下文与页面流

分享、二维码、小程序码和冷启动可直接打开详情页，此时 `getCurrentPages()` 可能仅包含当前页面。项目左上角返回按钮必须在正常页面栈下保持 `uni.navigateBack()`，在单页栈下进入业务父页面，未配置父页面时进入工具 Tab。

| 页面类型 | 页面栈存在上一页 | 页面栈不存在上一页 |
| -------- | ---------------- | ------------------ |
| 默认业务页 | `navigateBack` | `/pages/tools/index` |
| 详情页 | `navigateBack` | 配置的直接父页面 |
| TabBar | 不额外导航 | 不重复跳转当前页 |

本期不新增路由，不修改 `src/pages.json`、工具权限、登录回跳、分享参数、备忘录 API 或后端接口。

## 2. 实现约束

- 新增 `src/utils/navigation.ts`，集中导出 `safeBack()`、`DEFAULT_BACK_FALLBACK` 与 TabBar 判断。
- `PageLayout` 使用 `backFallback` prop；模板使用 `back-fallback`。
- 返回优先级必须是 `beforeBack`、`customGoBack/@back`、`safeBack`。
- 普通 fallback 使用 `redirectTo`，TabBar fallback 使用 `switchTab`；跳转失败后才回退工具 Tab，最后以 `reLaunch` 容错。
- Picker、保存完成、流程取消等依赖调用方回传的 `uni.navigateBack()` 保持原状。
- 没有项目自定义返回按钮的协议/WebView 页面不强制迁移至 `PageLayout`。

## 3. 页面 fallback

| 路由 | 单页栈 fallback |
| ---- | ---------------- |
| `compendium/swc/detail` | 图鉴列表；`tab=rta` 时为 RTA 排行榜 |
| `compendium/swc/rta/detail` | RTA 排行榜 |
| `compendium/swc/lineup-mapping-detail` | 阵容映射列表 |
| `calendar/detail` | 万年历首页 |
| `tools/memo/detail` | 工具列表 |

## 4. 验收清单

- [ ] 正常页面栈返回仍调用 `navigateBack`。
- [ ] 单页栈详情页进入业务父页面或工具 Tab。
- [ ] TabBar fallback 使用 `switchTab`，不产生详情页回退循环。
- [ ] 登录页和 H5 WebView 自定义返回使用 `safeBack`。
- [ ] `beforeBack`、`customGoBack` 与 picker 回传流程保持原行为。
- [ ] `pnpm lint`、`pnpm type-check`、`pnpm build:mp-weixin` 通过。
