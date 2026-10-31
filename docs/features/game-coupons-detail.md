# 魔灵召唤兑换券单券详情需求规格书

## 0. 元信息

| 项       | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| 功能名称 | 魔灵召唤兑换券单券详情 / 分享领取                          |
| 所属域   | subPackages/tools                                          |
| 发布端   | H5 + mp-weixin（双端必须）                                 |
| 状态     | 开发中                                                     |
| 关联文档 | `docs/architecture.md`、本地 `GAMECOUPONS` Apifox 生成契约 |

## 1. 业务上下文与页面流

管理页 `game-coupons/index` 负责所有兑换券的管理与批量兑换；本页面只负责单张兑换券的查看、账号绑定、领取和分享。用户可从管理页进入详情，也可从微信分享直接进入详情，游客不要求登录。

### 1.1 页面流与路由

| 页面             | 路由路径（pages.json 注册位置）                                                  | 跳转方式                    | 来源入口                     |
| ---------------- | -------------------------------------------------------------------------------- | --------------------------- | ---------------------------- |
| 兑换券管理页     | `subPackages/tools/game-coupons/index?gameId=swc&compendiumId=swc`               | `uni.navigateTo`            | 魔灵召唤聚合页               |
| 兑换券单券详情页 | `subPackages/tools/game-coupons/detail?couponId=xxx&gameId=swc&compendiumId=swc` | `uni.navigateTo` / 微信分享 | 管理页券码主体、微信好友分享 |

- `src/pages.json` 在 `subPackages/tools` 分包新增 `game-coupons/detail`，使用 `navigationStyle: custom`。
- 详情页优先使用稳定的 `couponId`，保留 `gameId` 与 `compendiumId` 上下文；缺少券标识时展示错误态，不猜测券码。
- 详情页无历史页面栈时通过 `PageLayout` 的 `backFallback` 返回兑换券管理页。
- 本页面不新增 `src/config/tools.ts` 工具入口，管理页仍是工具目录入口。

## 2. 前后端 API 契约

接口均直接调用 `src/services/apifox/NODEJSDEMO/GAMECOUPONS` 生成方法，不手工修改生成文件：

| 功能         | 方法与路径                             | 鉴权     | 调用封装                        |
| ------------ | -------------------------------------- | -------- | ------------------------------- |
| 详情         | `GET /game-coupons/codes/detail`       | 可选     | `getGameCouponsCodesDetail`     |
| 昵称验证     | `GET /game-coupons/{gameId}/profile`   | 可选     | `getGameCouponsGameIdProfile`   |
| 单券领取     | `POST /game-coupons/{gameId}/redeem`   | 可选     | `postGameCouponsGameIdRedeem`   |
| 托管账号     | `GET /game-coupons/{gameId}/accounts`  | 登录用户 | `getGameCouponsGameIdAccounts`  |
| 新增托管账号 | `POST /game-coupons/{gameId}/accounts` | 登录用户 | `postGameCouponsGameIdAccounts` |

详情接口的稳定标识为 `couponId`，返回 `code`、`title`、`reward`、`status`、`redeemable`、`serverScope`、`expiresAt`、`publishedAt`。领取请求只提交一个账号和一个 `codes` 项，并优先提交 `{ couponId }`。

## 3. 交互约束

- 页面状态明确区分加载、可领取、不可用、领取中、成功、已领取和失败。
- `active` 且 `redeemable !== false` 才能领取；`expired`、`disabled`、`upcoming` 或不可兑换状态直接禁用主按钮。
- 详情页只允许选择一个账号，不提供批量兑换、账号管理、兑换记录或自动托管。
- 账号规则与管理页共用 `GAME_COUPON_ACCOUNTS_swc`：游客账号保存本地；登录用户读取托管账号；没有账号时可在本页验证并绑定。
- 验证昵称后必须经过用户确认，确认后才保存账号并领取。
- `serverScope: []` 表示全区服；账号区服不在范围内时直接禁用领取并提示原因。
- 领取结果将 `success`、`already_used`、`invalid_coupon`、`invalid_id`、`failed` 转为单券友好状态，不显示后端英文枚举。
- 页面提供明确的微信 `open-type="share"` 按钮；H5 不执行微信分享专属代码。

## 3.1 兑换券海报资源

- 顶部官方礼品主视觉：`https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/poster01.jpeg`
- 动态兑换券背景：`https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/poster02.jpeg`
- 资源目录：`lzk-web/swc/game-coupons/detail/`
- `poster01` 作为详情页顶部纯视觉展示和微信分享卡片图片；`poster02` 作为详情页动态内容背景，叠加券码、奖励、有效期、区服和领取状态。

## 4. 主题与跨端

- 页面使用 `PageLayout`，安全回退到管理页；颜色、背景、边框和按钮使用 `--theme-*` token。
- 仅微信小程序注册 `onShareAppMessage` / `onShareTimeline`，分享配置统一由 `buildSwcCouponDetailShare` 生成。
- 使用 uni-app `view`、`text`、`input`、`picker`、`button`，不使用 Web 标签、浏览器 API、`vue-router` 或裸 `uni.request`。

## 5. 验收清单

- [ ] 管理页点击券码主体进入同一张券的详情页
- [ ] active / expired / disabled / upcoming / serverScope 状态正确
- [ ] 游客和登录用户均可在详情页绑定并领取
- [ ] 游客账号复用 `GAME_COUPON_ACCOUNTS_swc`
- [ ] 单账号单券领取成功、已领取和失败状态正确
- [ ] 微信分享进入同一 `couponId` 详情，H5 构建不受影响
- [ ] H5 与 mp-weixin 的 lint、类型检查和构建通过
- [ ] `docs/changelog.md` 已同步更新
