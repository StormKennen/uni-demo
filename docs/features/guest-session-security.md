# 微信小程序 Guest Session 安全接入需求规格书

## 0. 元信息

| 项       | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 功能名称 | 微信小程序 Guest Session 安全接入                                                  |
| 所属域   | 请求基础设施 / 鉴权                                                                |
| 发布端   | H5 + mp-weixin                                                                     |
| 状态     | 开发中                                                                             |
| 关联文档 | 后端 `docs/features/016-api-security-hardening.md`、OpenAPI `postAuthGuestSession` |

## 1. 业务上下文与页面流

微信小程序游客无需主动登录或授权头像昵称，由 `uni.login` 获取临时 code，换取不创建 User、UserAuth 或 Refresh Token 的短期 Guest JWT。现有页面继续只调用 Apifox API，Guest 身份由 `src/services/http.ts` 统一保障。

本功能不新增页面、路由或工具入口，不修改 `src/pages.json` 与 `src/config/tools.ts`。

## 2. API 契约

| 功能         | 方法与路径                    | 鉴权                   | 调用位置                                          |
| ------------ | ----------------------------- | ---------------------- | ------------------------------------------------- |
| 创建游客会话 | `POST /v1/auth/guest-session` | 无正式登录，按 IP 限流 | 请求基础设施 bootstrap；Apifox 前端生成层尚未同步 |

请求：

```ts
interface GuestSessionRequest {
  code: string
}
```

`http.ts` 解包后的响应：

```ts
interface GuestSessionResponse {
  token: string
  expires: string
  header: 'X-Guest-Token'
  platform: 'wechat_mp'
}
```

- 普通小程序请求使用 `X-Guest-Token: <jwt>`。
- 正式登录仍使用 `Authorization: Bearer <access jwt>`，正式 User Token 存在时不发送 Guest Token。
- `X-Anonymous-Id` 继续保留，不能替代 Guest Token。
- Guest Token 无效或过期：HTTP 401，消息为“游客会话无效或已过期”。
- 429：统一提示“请求过于频繁，请稍后再试”，保留 `Retry-After` 供后续扩展。
- Guest Session 端点尚未部署并返回 404 时，继续发送不带 Guest Token 的原有游客请求，并在 5 分钟退避期内停止重复探测；仅 404 可降级，其他 bootstrap 错误继续抛出。

## 3. Guest Session 状态与并发

- 本地缓存 `guestToken` 与绝对时间戳 `expiresAt`，通过 `src/utils/storage.ts` 的封装读写。
- 到期前 2 分钟视为失效；缓存有效时不得再次执行 `uni.login`。
- `ensureGuestSession` 与 `refreshGuestSession` 共享模块级 in-flight Promise；并发请求只能创建一次 Guest Session。
- Guest Session bootstrap 请求显式跳过 Guest ensure，避免递归。
- 携带 Guest Token 的业务请求收到 401 时，清理并刷新 Guest Session，然后仅重试原请求一次。
- 携带正式 User Token 的请求继续走现有 Refresh Token 逻辑，Guest 逻辑不得触发登录弹窗或清除正式登录数据。

## 4. 跨端与启动策略

- `MP-WEIXIN`：启动时非阻塞预热，请求层继续 lazy ensure 兜底。
- H5：不执行 `uni.login({ provider: 'weixin' })`，不因缺少 Guest Token 阻塞现有请求。
- 页面不读取、不判断 Guest Token。

## 5. 验收标准

- 首次请求：1 次 `uni.login` + 1 次 Guest Session。
- 有效缓存、并发 10 请求：不重复登录，会话请求总数为 1。
- 临近过期、主动清除：下一次请求自动恢复。
- Guest 401：刷新并重试一次，不无限循环、不弹正式登录提示。
- Guest Session 404：业务请求继续使用原有游客逻辑，并发或连续请求不重复探测。
- 正式用户：Authorization、Refresh Token 与登录 UI 行为保持不变。
- 429：统一提示，不进入 401 流程。
- H5 与 mp-weixin 均通过 lint、type-check 和构建。
- 页面修改数为 0，Apifox 生成文件修改数为 0。
