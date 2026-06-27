# 魔灵召唤兑换券后端接入说明

## 背景

前端已在 `subPackages/tools/compendium/swc/coupons` 完成入口与交互：

- 本地保存多个账号的 `server + Hive ID`；
- 支持手动添加优惠券码；
- 支持展示后端返回的自动券码、头像/昵称、兑换汇总和逐条结果；
- 入口已加入首页「图鉴」分类的「魔灵兑换券」。

分析站点 `https://q.suisuiaa.fun/` 后确认：

- `GET /api/codes` 返回当前可用券码；
- `POST /api/redeem` 使用 SSE 返回逐条兑换进度，Body 为 `{ server, hiveid, codes }`；
- 站点未返回 `Access-Control-Allow-Origin`，H5 不能直接跨域调用；
- 昵称/头像未在该站公开接口中出现。Hive 官方资料接口通常依赖 SDK 登录态或服务端授权，建议后端先做可选能力。

因此需要 uni-demo 自家后端做代理，避免在前端暴露官方 AppCenter Token 或其它密钥。

## 前端配置

前端服务文件：`src/services/summoners-war-coupons.ts`

接口 Base URL 优先级：

1. `VITE_APP_SW_COUPON_BASE_URL`
2. `VITE_APP_BASE_URL`

统一前缀：`/summoners-war/coupons`

例如：

```env
VITE_APP_SW_COUPON_BASE_URL=https://api.example.com
```

则前端会请求：

- `GET https://api.example.com/summoners-war/coupons/codes`
- `GET https://api.example.com/summoners-war/coupons/profile?hive_id=xxx&server=global`
- `POST https://api.example.com/summoners-war/coupons/redeem`

## 服务器枚举

前端传值如下，后端需映射到官方/第三方接口要求的服务器 ID。

| 前端值   | 展示            | 备注         |
| -------- | --------------- | ------------ |
| `global` | Global / 国际服 | 目标站点同名 |
| `korea`  | Korea / 韩服    | 目标站点同名 |
| `japan`  | Japan / 日服    | 目标站点同名 |
| `china`  | China / 国服    | 目标站点同名 |
| `asia`   | Asia / 亚服     | 目标站点同名 |
| `europe` | Europe / 欧服   | 目标站点同名 |

## 接口 1：获取可用券码

```http
GET /summoners-war/coupons/codes
```

### 成功响应

支持直接返回业务对象，也支持现有后端常见的 `{ code, data, message }` 包装。

```json
{
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

### 后端建议

- 可以定时拉取第三方公开数据源并缓存，避免每次前端请求都抓取；
- `code` 必须大写、去重；
- `reward` 可为空字符串；
- `source` 建议保留，便于前端展示来源。

## 接口 2：查询账号资料（可选但推荐）

```http
GET /summoners-war/coupons/profile?hive_id=123456789&server=global
```

### 成功识别

```json
{
  "hiveId": "123456789",
  "server": "global",
  "nickname": "玩家昵称",
  "avatarUrl": "https://example.com/avatar.png",
  "available": true
}
```

### 暂不支持或无法识别

```json
{
  "hiveId": "123456789",
  "server": "global",
  "available": false,
  "message": "当前无法通过 Hive ID 查询头像和昵称"
}
```

### 后端建议

- 如果没有官方授权能力，不要伪造昵称/头像；直接返回 `available=false`；
- 如使用 Hive SDK / Hive Server API，注意区分 `Hive ID`、`PlayerID`、`CS Code`，不要把不同 ID 混用；
- 头像 URL 建议由后端校验协议和域名，避免前端加载不可信地址。

## 接口 3：兑换优惠券

```http
POST /summoners-war/coupons/redeem
Content-Type: application/json
```

### 请求体

```json
{
  "accounts": [
    {
      "id": "front-local-id-1",
      "server": "global",
      "hive_id": "123456789"
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

### 响应体

```json
{
  "total": 1,
  "success": 1,
  "alreadyUsed": 0,
  "failed": 0,
  "accountResults": [
    {
      "account": {
        "id": "front-local-id-1",
        "server": "global",
        "hiveId": "123456789",
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

### 状态枚举

| status                  | 含义                   | 前端展示    |
| ----------------------- | ---------------------- | ----------- |
| `success`               | 兑换成功               | 成功        |
| `already_used`          | 账号已使用该券码       | 已使用      |
| `invalid_coupon`        | 券码无效/过期          | 无效        |
| `invalid_id`            | Hive ID 或服务器不匹配 | ID 无效     |
| `failed`                | 其它失败               | 失败        |
| `pending` / `redeeming` | 如后续改 SSE 可使用    | 等待/兑换中 |

### 后端建议

- 推荐先返回聚合 JSON，前端当前按聚合结果渲染；
- 如后续需要实时进度，可以增加 SSE/WebSocket 版本，但保留聚合 JSON 作为兼容接口；
- 对同一 `hive_id + server + code` 做短期幂等/限流，避免用户重复点击造成刷接口；
- 不要在日志中输出完整 Hive ID，可脱敏为 `123****789`；
- 官方 Web Coupon 文档指向 `/tp/coupon/api`，需要 AppCenter Bearer Token。Token 必须只保存在后端密钥系统；
- 若临时复用 `q.suisuiaa.fun` 的接口，后端也应做代理并做好超时、重试、错误映射，不要让前端直连该站。

## 错误响应建议

前端支持以下两种错误形态：

```json
{
  "code": 500,
  "message": "兑换服务暂不可用"
}
```

或 HTTP 非 2xx：

```json
{
  "message": "Hive ID 无效"
}
```

建议后端使用明确中文 `message`，前端会直接显示给用户。
