# 游戏兑换券后端接入说明（当前：魔灵召唤 swc）

## 目标

前端已改为「通用游戏兑换券」架构：

- 当前入口固定展示为「魔灵兑换券」，对应 `gameId=swc`、`compendiumId=swc`；
- 后续新增其它游戏时，只需要在前端增加一个入口和一份游戏配置，复用同一页面与服务；
- 后端接口按 `game_id + compendium_id` 区分游戏，不再把接口命名绑定到 Summoners War；
- 当前文档仍保留在 `docs/summoners-war-coupon-backend.md`，但接口设计按多游戏通用能力编写。

前端相关文件：

- 游戏配置：`src/config/game-coupons.ts`
- 通用接口服务：`src/services/game-coupons.ts`
- 通用页面：`src/subPackages/tools/game-coupons/index.vue`
- 当前入口：`src/config/tools.ts` 中 `/subPackages/tools/game-coupons/index?gameId=swc&compendiumId=swc`

## 从 `q.suisuiaa.fun` 分析到的能力

`https://q.suisuiaa.fun/` 当前主要能力：

- `GET /api/codes`：返回 Summoners War 当前可用券码；
- `POST /api/redeem`：Body 为 `{ server, hiveid, codes }`，用 SSE 返回逐条兑换结果；
- 未开放浏览器 CORS，H5/小程序前端不应直连；
- 未发现公开的昵称/头像查询接口。Hive 昵称/头像通常依赖 SDK 登录态、PlayerID 或官方服务端授权。

因此 uni-demo 需要自家后端做代理，并把密钥、官方 token、第三方抓取逻辑全部放在后端。

## 微信小程序用户识别：未登录时怎么知道是谁？

结论：**如果完全不登录，也不建立微信静默身份，后端无法可靠知道当前用户是谁。**

可选方案如下。

### 方案 A：要求登录后同步游戏号（推荐用于跨端/长期数据）

适用：需要在后端保存「我的游戏号」、跨设备同步、自动兑换、历史记录。

流程：

1. 小程序走现有账号登录，后端签发业务 `user_id` / token；
2. 兑换券页面调用 `GET /game-coupons/{game_id}/accounts?compendium_id=swc` 获取该用户已登记游戏号；
3. 用户新增/编辑游戏号时，调用账号绑定接口写入后端；
4. 兑换时后端用登录态识别 `user_id`，只能操作该用户自己的游戏号。

后端表建议：

```text
user_game_accounts
- id
- user_id
- game_id              // swc
- compendium_id        // swc
- server               // global/korea/...
- account_id           // 对 swc 来说就是 Hive ID
- account_label        // 可选：用户自定义备注
- nickname             // 可选：识别到的游戏昵称
- avatar_url           // 可选：识别到的头像
- profile_available    // 是否成功识别过资料
- is_default
- created_at / updated_at
```

### 方案 B：微信静默身份（不展示登录 UI，但后端有 openid）

适用：用户不想显式登录，但仍希望后端按微信小程序维度保存游戏号。

流程：

1. 小程序调用 `wx.login()` 获取临时 `code`；
2. 后端用 `appid + appsecret + code` 换取 `openid`（如果绑定开放平台也可得到 `unionid`）；
3. 后端创建/读取 `wechat_guest_user`，用 `openid` 作为小程序内用户标识；
4. 游戏号绑定到这个微信身份。

注意：

- `openid` 只在当前小程序内稳定；跨公众号/App/H5 需要 `unionid` 或业务登录账号；
- 这不是「完全无登录」，只是「静默微信身份」；
- 仍需要后端校验登录态，不能让前端传 `openid` 后直接信任。

### 方案 C：纯本地存储（当前前端实现）

适用：先做前端体验，不要求后端知道「我的账号列表」。

特点：

- 游戏号保存在设备本地 `storage`；
- 兑换时前端把本地填写的 `account_id + server` 随请求发送给后端；
- 后端只执行本次兑换，不保存「这个游戏号属于谁」；
- 缺点：换设备/清缓存会丢失，无法做自动兑换、历史记录、账号共享校验。

当前 PR 前端采用方案 C，并预留后端账号列表接口，后续可升级到方案 A 或 B。

## 通用接口约定

Base URL 优先级：

1. `VITE_APP_GAME_COUPON_BASE_URL`
2. `VITE_APP_SW_COUPON_BASE_URL`（兼容旧配置）
3. `VITE_APP_BASE_URL`

统一前缀：`/game-coupons/{game_id}`

当前魔灵召唤请求示例：

```http
GET  /game-coupons/swc/codes?compendium_id=swc
GET  /game-coupons/swc/profile?account_id=123456789&server=global&compendium_id=swc
POST /game-coupons/swc/redeem?compendium_id=swc
```

字段命名原则：

- `game_id`：游戏兑换券功能 ID，当前 `swc`；
- `compendium_id`：图鉴 ID，当前也为 `swc`，用于关联已有图鉴/游戏配置；
- `account_id`：游戏内用于兑换的账号标识。对魔灵召唤来说就是 `Hive ID`；其它游戏可以是 UID、角色 ID、区服账号等；
- `server`：游戏区服，值由各游戏配置决定。

响应既支持直接返回业务对象，也支持项目常见包装：

```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```

## 接口 1：获取已登记游戏号（后端存储时使用）

```http
GET /game-coupons/{game_id}/accounts?compendium_id=swc
Authorization: Bearer <token>
```

### 响应

```json
{
  "gameId": "swc",
  "compendiumId": "swc",
  "accounts": [
    {
      "id": "db-account-id",
      "server": "global",
      "accountId": "123456789",
      "accountLabel": "主号",
      "nickname": "玩家昵称",
      "avatarUrl": "https://example.com/avatar.png",
      "profileAvailable": true,
      "isDefault": true
    }
  ]
}
```

### 鉴权要求

- 方案 A：必须从业务 token 得到 `user_id`；
- 方案 B：必须从后端 session 得到 `openid/unionid`；
- 不能让前端传 `user_id/openid` 后直接查询。

## 接口 2：保存/更新游戏号（后端存储时使用）

```http
POST /game-coupons/{game_id}/accounts?compendium_id=swc
Content-Type: application/json
Authorization: Bearer <token>
```

### 请求

```json
{
  "server": "global",
  "account_id": "123456789",
  "account_label": "主号"
}
```

### 响应

```json
{
  "id": "db-account-id",
  "gameId": "swc",
  "compendiumId": "swc",
  "server": "global",
  "accountId": "123456789",
  "accountLabel": "主号",
  "nickname": "玩家昵称",
  "avatarUrl": "https://example.com/avatar.png",
  "profileAvailable": true
}
```

## 接口 3：获取可用券码

```http
GET /game-coupons/{game_id}/codes?compendium_id=swc
```

### 响应

```json
{
  "gameId": "swc",
  "compendiumId": "swc",
  "codes": [
    {
      "code": "SWXFRIEREN2026",
      "reward": "能量x100 + 玛那x300000 + 神秘卷轴x3",
      "source": "swgt"
    },
    {
      "code": "JUNSW2026W6C",
      "reward": "水晶x100 + 玛那x300000",
      "source": "crowdsourced"
    }
  ],
  "cached": true,
  "cacheTime": "6:52:24 PM",
  "updatedAt": "2026-06-27T10:52:24.000Z"
}
```

后端建议：

- 按 `game_id + compendium_id` 缓存；
- `code` 大写、去重；
- `reward` 可为空；
- `source` 保留，方便前端展示来源；
- 不同游戏可以有不同券码来源适配器。

## 接口 4：查询账号资料（可选但推荐）

```http
GET /game-coupons/{game_id}/profile?account_id=123456789&server=global&compendium_id=swc
```

### 成功识别

```json
{
  "gameId": "swc",
  "compendiumId": "swc",
  "accountId": "123456789",
  "server": "global",
  "nickname": "玩家昵称",
  "avatarUrl": "https://example.com/avatar.png",
  "available": true
}
```

### 暂不支持或无法识别

```json
{
  "gameId": "swc",
  "compendiumId": "swc",
  "accountId": "123456789",
  "server": "global",
  "available": false,
  "message": "当前无法通过 Hive ID 查询头像和昵称"
}
```

后端建议：

- 没有官方授权能力时直接返回 `available=false`，不要伪造昵称/头像；
- 对魔灵召唤，注意区分 `Hive ID`、`PlayerID`、`CS Code`；
- 头像 URL 需要校验协议和域名，避免前端加载不可信地址。

## 接口 5：兑换优惠券

```http
POST /game-coupons/{game_id}/redeem?compendium_id=swc
Content-Type: application/json
```

### 请求

```json
{
  "game_id": "swc",
  "compendium_id": "swc",
  "accounts": [
    {
      "id": "front-local-id-or-db-id",
      "server": "global",
      "account_id": "123456789"
    }
  ],
  "codes": [
    {
      "code": "SWXFRIEREN2026",
      "reward": "能量x100 + 玛那x300000 + 神秘卷轴x3",
      "source": "swgt"
    }
  ]
}
```

### 响应

```json
{
  "gameId": "swc",
  "compendiumId": "swc",
  "total": 1,
  "success": 1,
  "alreadyUsed": 0,
  "failed": 0,
  "accountResults": [
    {
      "account": {
        "id": "front-local-id-or-db-id",
        "server": "global",
        "accountId": "123456789",
        "nickname": "玩家昵称",
        "avatarUrl": "https://example.com/avatar.png",
        "profileAvailable": true
      },
      "success": 1,
      "alreadyUsed": 0,
      "failed": 0,
      "results": [
        {
          "code": "SWXFRIEREN2026",
          "reward": "能量x100 + 玛那x300000 + 神秘卷轴x3",
          "status": "success",
          "message": "兑换成功"
        }
      ]
    }
  ]
}
```

状态枚举：

| status           | 含义                   | 前端展示 |
| ---------------- | ---------------------- | -------- |
| `success`        | 兑换成功               | 成功     |
| `already_used`   | 账号已使用该券码       | 已使用   |
| `invalid_coupon` | 券码无效/过期          | 无效     |
| `invalid_id`     | 游戏账号或服务器不匹配 | ID 无效  |
| `failed`         | 其它失败               | 失败     |
| `pending`        | 等待兑换               | 等待     |
| `redeeming`      | 正在兑换               | 兑换中   |

后端建议：

- 当前前端按聚合 JSON 渲染；如后续做实时进度，可新增 SSE/WebSocket，但保留聚合 JSON；
- 对同一 `game_id + server + account_id + code` 做短期幂等/限流；
- 日志中不要输出完整 `account_id`，可脱敏为 `123****789`；
- 魔灵召唤官方 Web Coupon 文档指向 `/tp/coupon/api`，需要 AppCenter Bearer Token，Token 必须只保存在后端密钥系统；
- 如临时复用 `q.suisuiaa.fun`，也必须由后端代理并做超时、重试、错误映射。

## 前端新增其它游戏的方式

1. 在 `src/config/game-coupons.ts` 新增游戏配置：

```ts
export const OTHER_GAME_COUPON_CONFIG: GameCouponConfig = {
  gameId: 'other-game',
  compendiumId: 'other-game',
  gameName: '其它游戏',
  title: '其它游戏兑换券',
  subtitle: '保存常用 UID，一键兑换礼包码。',
  heroBadge: 'Other Game',
  accountIdLabel: 'UID',
  accountIdPlaceholder: '输入 UID',
  accountIdEmptyText: '待填写 UID',
  storageKey: 'GAME_COUPON_ACCOUNTS_other-game',
  backendDocPath: 'docs/other-game-coupon-backend.md',
  defaultServer: 'global',
  servers: [{ value: 'global', label: '全球服 Global', shortLabel: 'Global' }],
}
```

2. 注册到 `GAME_COUPON_CONFIGS`；
3. 在首页工具配置新增入口：

```ts
path: '/subPackages/tools/game-coupons/index?gameId=other-game&compendiumId=other-game'
```

不需要复制页面，也不需要新增一套 service。
