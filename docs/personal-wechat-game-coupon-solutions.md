# 个人微信小程序游戏兑换券用户识别方案

## 背景

当前「游戏兑换券」功能需要保存用户填写过的游戏账号，例如魔灵召唤的 Hive ID、服务器、备注名，以及后续可能出现的兑换历史、默认账号、批量兑换记录。

但个人主体微信小程序通常无法使用完整的商业化用户能力，例如：

- 不能做手机号授权登录；
- 不希望或不能引入复杂的自建账号体系；
- 用户可能只想临时兑换，不愿注册；
- 后端仍需要知道“这次兑换用哪个游戏号”，以及是否要保存“我的游戏号列表”。

结论：**不强依赖手机号，也不一定强依赖微信 ID。** 但如果后端要长期保存“某个用户的账号列表”，就必须有某种稳定标识。这个稳定标识可以是微信 `openid`、业务账号、匿名同步码，也可以退化为“仅本机本地存储”。

## 能不能完全不登录？

可以，但能力会退化。

完全不登录时：

- 前端可以把游戏号保存在小程序本地缓存；
- 兑换时把 `game_id + account_id + server + codes` 直接发给后端；
- 后端只负责执行本次兑换，不知道这个账号属于哪个长期用户；
- 换手机、清缓存、重装微信后，本地数据可能丢失；
- 后端无法做跨设备同步、账号归属校验、自动兑换、长期兑换历史。

所以核心取舍是：

| 需求                         | 是否必须有稳定用户标识 |
| ---------------------------- | ---------------------- |
| 只做当前设备兑换             | 不必须                 |
| 本地记住游戏号               | 不必须                 |
| 后端保存“我的游戏号”         | 必须                   |
| 换设备同步游戏号             | 必须                   |
| 自动兑换 / 定时兑换          | 必须                   |
| 查看历史兑换记录             | 建议必须               |
| 防止别人操作我的已绑定游戏号 | 必须                   |

## 推荐方案优先级

面向个人小程序，建议按下面顺序演进：

1. **第一阶段：本地存储 + 手动填写游戏号**
   - 最容易上线；
   - 不需要微信登录、手机号、业务注册；
   - 当前兑换券前端架构已经适合这个模式。
2. **第二阶段：匿名同步码**
   - 用户不注册账号；
   - 后端生成一串同步码，用户自己保存；
   - 换设备时输入同步码即可恢复游戏号列表。
3. **第三阶段：可选微信静默身份 `wx.login`**
   - 如果个人小程序实际可以调用 `wx.login` / `code2Session`，可用 `openid` 做静默身份；
   - 这不是手机号授权，也不要求用户点“获取手机号”；
   - 如果当前资质、后台配置或产品策略不允许，则不要强依赖它。
4. **第四阶段：轻量业务账号**
   - 例如邮箱验证码、口令登录、一次性恢复码；
   - 功能最完整，但开发和维护成本最高。

## 方案 A：纯本地存储

### 适用场景

- 个人项目快速上线；
- 用户只在当前手机使用；
- 不需要账号体系；
- 允许用户换设备后重新输入游戏号。

### 用户体验

1. 用户进入「魔灵召唤兑换券」页面；
2. 首次手动输入 Hive ID、选择服务器、可选填写备注；
3. 前端把账号列表写入小程序本地 storage；
4. 下次进入页面自动读取本地账号；
5. 点击兑换时，前端把当前选择的账号信息发给后端；
6. 后端兑换完成后返回逐条结果。

### 前端存储结构

```ts
interface LocalGameCouponAccount {
  id: string
  gameId: string
  compendiumId: string
  accountId: string
  server: string
  label?: string
  nickname?: string
  avatarUrl?: string
  isDefault?: boolean
  updatedAt: string
}
```

建议 storage key：

```text
GAME_COUPON_ACCOUNTS:{game_id}:{compendium_id}
```

魔灵召唤示例：

```text
GAME_COUPON_ACCOUNTS:swc:swc
```

### 后端接口

后端不保存用户账号列表，只提供兑换能力。

```http
POST /game-coupons/{game_id}/redeem?compendium_id={compendium_id}
```

请求体：

```json
{
  "account_id": "123456789",
  "server": "global",
  "codes": ["SW2026COUPON"],
  "client_request_id": "optional-uuid"
}
```

响应体：

```json
{
  "success": true,
  "results": [
    {
      "code": "SW2026COUPON",
      "status": "success",
      "message": "兑换成功"
    }
  ]
}
```

### 优点

- 不依赖微信 ID；
- 不依赖手机号；
- 后端不需要用户系统；
- 开发成本最低；
- 隐私风险最低。

### 缺点

- 不能跨设备同步；
- 清缓存会丢失；
- 后端没有“我的游戏号”概念；
- 无法可靠做长期历史记录；
- 无法防止别人输入同一个游戏号进行兑换。

### 建议落地

这是个人小程序最推荐的首发方案。前端把“保存账号”文案明确成“保存在本机”，避免用户误解为云端账号同步。

## 方案 B：匿名同步码

### 适用场景

- 不想接微信登录；
- 不想让用户注册账号；
- 但希望支持换设备恢复游戏号；
- 希望后端保存“某个匿名用户的游戏号列表”。

### 核心概念

后端不识别真实用户，只创建一个匿名档案：

```text
anonymous_profile_id = 后端内部 UUID
sync_code = 展示给用户的恢复码
access_token = 当前设备本地保存的访问令牌
```

用户第一次使用时创建匿名档案，并获得一串同步码。以后换设备时，输入同步码即可恢复游戏号列表。

### 用户体验

首次使用：

1. 用户进入兑换券页面；
2. 页面提示“可创建同步码，用于换设备恢复游戏号”；
3. 用户点击“创建同步码”；
4. 后端返回同步码，例如 `SWC-8K2M-93QD`；
5. 前端提示用户截图或复制保存；
6. 用户绑定游戏号，后端按匿名档案保存。

换设备：

1. 用户进入页面；
2. 点击“我有同步码”；
3. 输入 `SWC-8K2M-93QD`；
4. 后端校验后返回新的 `access_token`；
5. 前端拉取已保存的游戏号列表。

### 后端数据表

```text
anonymous_profiles
- id
- public_code_hash       // 同步码哈希，不能明文保存
- access_token_hash      // 当前设备访问令牌哈希
- created_at
- updated_at
- last_used_at
- revoked_at

user_game_accounts
- id
- owner_type             // anonymous
- owner_id               // anonymous_profiles.id
- game_id                // swc
- compendium_id          // swc
- account_id             // Hive ID
- server
- label
- nickname
- avatar_url
- is_default
- created_at
- updated_at
```

### 后端接口

创建同步档案：

```http
POST /game-coupons/anonymous-profiles
```

响应：

```json
{
  "profile_id": "anon_01H...",
  "sync_code": "SWC-8K2M-93QD",
  "access_token": "opaque-token",
  "expires_in": null
}
```

使用同步码恢复：

```http
POST /game-coupons/anonymous-profiles/restore
```

请求体：

```json
{
  "sync_code": "SWC-8K2M-93QD"
}
```

响应：

```json
{
  "profile_id": "anon_01H...",
  "access_token": "new-opaque-token"
}
```

获取账号列表：

```http
GET /game-coupons/{game_id}/accounts?compendium_id={compendium_id}
Authorization: Bearer {access_token}
```

新增账号：

```http
POST /game-coupons/{game_id}/accounts?compendium_id={compendium_id}
Authorization: Bearer {access_token}
```

请求体：

```json
{
  "account_id": "123456789",
  "server": "global",
  "label": "主号"
}
```

兑换：

```http
POST /game-coupons/{game_id}/redeem?compendium_id={compendium_id}
Authorization: Bearer {access_token}
```

请求体可以传 `account_record_id`，也可以直接传账号信息：

```json
{
  "account_record_id": "acct_01H...",
  "codes": ["SW2026COUPON"]
}
```

### 安全要求

- 同步码只展示一次或允许用户主动重置；
- 后端只保存同步码哈希，不保存明文；
- `access_token` 也只保存哈希；
- 同步码需要足够随机，至少 80 bit 熵；
- 输入同步码恢复时要做频率限制；
- 用户可以“重置同步码”或“退出当前设备”；
- 不要把同步码放进 URL query，避免被日志记录。

### 优点

- 不依赖微信 ID；
- 不依赖手机号；
- 用户无注册压力；
- 支持跨设备恢复；
- 后端可以保存游戏号列表和历史记录。

### 缺点

- 用户丢失同步码就无法恢复；
- 同步码被别人看到，别人可能恢复账号列表；
- 需要后端实现匿名档案和 token 体系；
- 仍然不能证明游戏号真实属于该用户。

### 建议落地

这是个人小程序下最平衡的“云端保存”方案。建议作为本项目第二阶段实现。

## 方案 C：微信静默身份 `wx.login` / `openid`

### 适用场景

- 小程序可以使用 `wx.login`；
- 不需要手机号；
- 用户不需要填写账号密码；
- 希望后端自动识别同一个微信用户。

### 重要说明

`wx.login` 和“获取手机号”不是同一件事。

微信登录流程通常是：

1. 小程序调用 `wx.login()` 获取一次性 `code`；
2. 后端用 `appid + appsecret + code` 调用 `code2Session`；
3. 微信返回当前小程序内稳定的 `openid`；
4. 后端用 `openid` 创建自己的业务登录态；
5. 前端后续请求只带后端 token，不直接传 `openid`。

如果当前个人小程序后台、审核策略或团队决策不允许走这个流程，则不要把它作为强依赖。

### 数据流

```text
小程序 wx.login()
  -> 得到 code
  -> POST /auth/wechat-mini-program/login { code }
  -> 后端 code2Session
  -> 得到 openid
  -> 后端签发 app_token
  -> 前端保存 app_token
  -> 后续用 app_token 访问游戏账号接口
```

### 后端数据表

```text
wechat_mini_users
- id
- appid
- openid_hash           // 建议哈希或加密存储
- unionid_hash          // 可选
- created_at
- last_login_at

user_game_accounts
- id
- owner_type            // wechat_mini
- owner_id              // wechat_mini_users.id
- game_id
- compendium_id
- account_id
- server
- label
- nickname
- avatar_url
- is_default
- created_at
- updated_at
```

### 优点

- 用户体验最好；
- 不需要手机号；
- 不需要用户记同步码；
- 换设备后，只要还是同一个微信用户即可恢复；
- 后端可以稳定保存账号列表和历史记录。

### 缺点

- 依赖微信接口和小程序配置；
- `openid` 只在当前小程序内稳定，跨产品需要 `unionid` 或业务账号；
- 后端必须保护 `appid/appsecret/session_key`；
- 如果个人小程序无法使用该能力，则不能落地。

### 建议落地

如果确认个人小程序可调用 `wx.login`，它比匿名同步码更省心。但产品实现上仍建议保留“本地存储兜底”，避免微信登录失败时无法兑换。

## 方案 D：轻量业务账号

### 适用场景

- 未来希望做多端统一，例如 H5、App、小程序共用账号；
- 需要更强的账号找回能力；
- 用户愿意使用邮箱、口令或验证码。

### 可选登录方式

个人小程序不一定要使用手机号，可以考虑：

- 邮箱验证码；
- 用户名 + 密码；
- 用户名 + 一次性恢复码；
- 第三方 OAuth 的 H5 跳转登录（需确认小程序平台限制和审核要求）。

### 优点

- 不依赖微信身份；
- 可跨小程序、H5、App；
- 找回和风控能力更完整；
- 后端用户模型更标准。

### 缺点

- 注册登录链路增加使用门槛；
- 需要做密码/验证码/邮件发送/风控；
- 对个人项目维护成本较高；
- 可能超出当前兑换券功能的复杂度。

### 建议落地

不建议首发实现。除非后续项目已经有统一账号体系，否则匿名同步码更轻量。

## 方案 E：设备指纹或设备 ID（不推荐）

### 为什么不推荐

有些方案会尝试用设备型号、系统信息、微信缓存、IP、UA 等拼出一个“设备 ID”。不建议这样做：

- 小程序可获取的设备信息有限且可能变化；
- 不同用户可能碰撞；
- 系统升级、微信升级、换网络都可能导致标识变化；
- 隐私合规风险更高；
- 不能证明用户身份；
- 无法可靠跨设备。

### 可接受用法

只可以作为辅助信息，例如：

- 风控日志；
- 异常请求排查；
- 同步码恢复时的安全提醒。

不应作为主用户 ID。

## 推荐最终架构

### 首发版本

使用“纯本地存储 + 后端无状态兑换”。

```text
前端本地 storage 保存账号列表
  -> 用户选择账号和券码
  -> POST /game-coupons/swc/redeem
  -> 后端只执行兑换
  -> 前端展示结果
```

首发必须明确：

- 游戏号仅保存在当前设备；
- 清缓存或换设备后需要重新填写；
- 后端不保存用户游戏号；
- 后端只接收本次兑换所需参数。

### 增强版本

增加“匿名同步码”。

```text
用户创建同步码
  -> 后端创建 anonymous_profile
  -> 前端保存 access_token
  -> 游戏号保存到后端 profile 下
  -> 换设备输入同步码恢复
```

增强版本可以支持：

- 跨设备同步游戏号；
- 兑换历史；
- 默认账号；
- 多游戏账号列表；
- 后续迁移到微信 openid 或业务账号。

### 可选版本

如果确认 `wx.login` 可用，再加微信静默身份。

```text
优先 wx.login/openid
失败则降级为本地模式
用户也可主动创建匿名同步码
```

## 前端实现要求

### 页面状态

游戏兑换券页面建议支持三种账号模式：

```ts
type GameCouponAccountMode = 'local' | 'anonymous-sync' | 'wechat-openid'
```

当前首发可以只实现：

```ts
const accountMode = 'local'
```

未来扩展时再切换。

### 文案要求

本地模式：

```text
账号信息仅保存在当前设备，不会自动同步到云端。
```

匿名同步码模式：

```text
同步码用于换设备恢复游戏号，请自行妥善保存。任何拿到同步码的人都可能恢复你的账号列表。
```

微信静默身份模式：

```text
将使用微信小程序身份保存你的游戏号，不涉及手机号授权。
```

### 本地与云端合并策略

如果未来从本地模式升级到同步码模式：

1. 前端读取本地账号列表；
2. 用户创建或恢复同步码；
3. 弹窗询问是否上传本地账号；
4. 上传前按 `game_id + compendium_id + account_id + server` 去重；
5. 上传成功后保留本地副本作为缓存。

## 后端实现要求

### 统一 owner 模型

为了同时支持本地、匿名同步码、微信身份和业务账号，后端账号归属建议统一抽象：

```text
owner_type:
- anonymous
- wechat_mini
- user

owner_id:
- anonymous_profiles.id
- wechat_mini_users.id
- users.id
```

纯本地模式没有 `owner_type/owner_id`，兑换接口直接使用请求体里的账号信息。

### 通用游戏账号表

```text
game_coupon_accounts
- id
- owner_type
- owner_id
- game_id
- compendium_id
- account_id
- server
- label
- nickname
- avatar_url
- profile_available
- is_default
- created_at
- updated_at
- deleted_at

unique(owner_type, owner_id, game_id, compendium_id, account_id, server)
```

### 通用兑换历史表

```text
game_coupon_redeem_records
- id
- owner_type             // 可空，本地模式为空
- owner_id               // 可空，本地模式为空
- game_id
- compendium_id
- account_id
- server
- coupon_code
- status                 // success / failed / skipped / unknown
- message
- raw_response           // 脱敏后保存
- client_request_id
- created_at

index(game_id, compendium_id, account_id, server)
index(owner_type, owner_id, created_at)
```

### 接口鉴权规则

| 接口         | 本地模式             | 匿名同步码                | 微信静默身份              |
| ------------ | -------------------- | ------------------------- | ------------------------- |
| 获取券码     | 不需要 token         | 不需要 token              | 不需要 token              |
| 查询账号列表 | 不支持               | Bearer token              | App token                 |
| 新增账号     | 仅本地保存           | Bearer token              | App token                 |
| 兑换         | 直接传账号信息       | token + account_record_id | token + account_record_id |
| 查询历史     | 不支持或按请求 ID 查 | Bearer token              | App token                 |

## 风险与边界

### 无法证明游戏号归属

无论本地模式、同步码模式还是 `openid` 模式，都只能证明“小程序用户保存了这个游戏号”，不能证明该游戏号一定属于用户本人。

如果后续需要强校验，只能依赖游戏官方能力，例如：

- 官方 OAuth；
- 游戏内验证码；
- 让用户在游戏昵称/签名里临时填写验证码；
- 官方服务端查询接口。

魔灵召唤目前未发现公开可稳定使用的昵称/头像/归属校验接口，因此只能把昵称和头像能力作为“可选增强”。

### 不要让前端伪造用户 ID

如果使用微信 `openid` 或匿名 profile，前端不应直接传：

```json
{
  "openid": "xxx",
  "profile_id": "xxx"
}
```

后端必须从 token/session 中解析用户身份。

### 不要明文保存敏感恢复凭据

同步码、access token、微信 session_key 都不能明文落库。

## 给后端 AI 的实现指令

请实现一套通用游戏兑换券后端，优先支持个人小程序本地模式，并预留匿名同步码模式。

最低要求：

1. 支持 `GET /game-coupons/{game_id}/codes`；
2. 支持 `POST /game-coupons/{game_id}/redeem`，允许无登录直接传 `account_id + server + codes`；
3. 所有接口使用 `game_id + compendium_id` 区分游戏；
4. 不要求微信登录，不要求手机号；
5. 兑换记录可以按 `client_request_id` 做幂等；
6. 后端不要信任前端传入的用户身份字段；
7. 魔灵召唤中 `account_id` 表示 Hive ID。

增强要求：

1. 实现匿名同步码 profile；
2. 支持通过 `Authorization: Bearer {access_token}` 管理云端游戏号；
3. 同步码和 token 只保存哈希；
4. 支持本地账号迁移到匿名 profile；
5. 支持未来把匿名 profile 绑定到微信 `openid` 或业务用户。

## 给前端 AI 的实现指令

请保持当前游戏兑换券页面的通用架构：

1. 当前入口固定为 `gameId=swc&compendiumId=swc`；
2. 当前默认使用本地模式，不强依赖微信登录；
3. 本地 storage key 必须按 `game_id + compendium_id` 隔离；
4. 账号字段统一使用 `account_id`，页面文案对魔灵召唤展示为 Hive ID；
5. 兑换请求直接提交当前选中的 `account_id + server + codes`；
6. 页面显示“账号仅保存在当前设备”的说明；
7. 后续新增游戏时，只新增游戏配置和入口，复用同一页面。

未来增强时：

1. 增加“创建同步码”和“输入同步码恢复”入口；
2. 支持本地账号上传到匿名 profile；
3. 支持云端账号列表与本地缓存合并；
4. 不要把微信 `openid` 暴露给页面业务逻辑。

## 最终建议

对当前个人小程序，建议不要强依赖微信 ID。

最稳妥路径：

1. 先上线纯本地模式，满足兑换券核心功能；
2. 页面明确提示“游戏号仅保存在当前设备”；
3. 后端兑换接口保持无状态，只处理本次兑换；
4. 后续如果用户反馈“换设备麻烦”，再加匿名同步码；
5. 如果确认个人小程序可以稳定使用 `wx.login`，再把微信静默身份作为可选增强，而不是首发强依赖。
