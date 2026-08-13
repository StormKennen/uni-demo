# 设置模块「我的资料 + 账号与安全」需求规格书

## 0. 元信息

| 项       | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 功能名称 | 我的资料与账号绑定                                      |
| 所属域   | `subPackages/user/setting`                              |
| 发布端   | H5 + mp-weixin                                          |
| 状态     | 开发中                                                  |
| 接口来源 | `src/services/apifox/NODEJSDEMO/USERS` generated domain |

## 1. Scope

在现有设置页增加「我的资料」和「账号与安全」入口。登录用户可以编辑应用内昵称和头像、查看手机号与微信绑定状态、首次绑定手机号密码，并在微信小程序中绑定微信身份。

### 1.1 Routes

| 页面       | Route                                        | 来源                       | 登录要求 |
| ---------- | -------------------------------------------- | -------------------------- | -------- |
| 设置       | `/subPackages/user/setting/setting`          | 兼容旧链接                 | 已存在   |
| 我的资料   | `/subPackages/user/setting/profile`          | 我的页面                   | 必须登录 |
| 账号与安全 | `/subPackages/user/setting/account-security` | 我的页面                   | 必须登录 |
| 绑定手机号 | `/subPackages/user/setting/bind-phone`       | 账号与安全的手机号未绑定项 | 必须登录 |
| 关于       | `/subPackages/user/setting/about`            | 我的页面夜间模式下方       | 无       |

新增页面均注册在 `src/pages.json` 的 `subPackages/user` 节点，使用 `navigationStyle: custom`。不移动既有设置路由。

## 2. API Contracts

业务页面直接从 `src/services/apifox/NODEJSDEMO/USERS/apifox.ts` 引入生成方法。

| 功能         | 方法与路径                       | Generated method       | 请求类型                   | 响应类型                |
| ------------ | -------------------------------- | ---------------------- | -------------------------- | ----------------------- |
| 获取资料     | `GET /users/me`                  | `getUsersMe`           | 无                         | `getUsersMeRes`         |
| 修改资料     | `PATCH /users/me`                | `patchUsersMe`         | `patchUsersMeBody`         | `object`                |
| 获取绑定状态 | `GET /users/me/bindings`         | `getUsersMeBindings`   | 无                         | `getUsersMeBindingsRes` |
| 绑定手机号   | `POST /users/me/bindings/phone`  | `postMeBindingsPhone`  | `postMeBindingsPhoneBody`  | `object`                |
| 绑定微信     | `POST /users/me/bindings/wechat` | `postMeBindingsWechat` | `postMeBindingsWechatBody` | `object`                |

Mutation 响应为宽泛 `object`，前端不依赖其结构；成功后重新请求 GET 接口确认服务端状态。

## 3. User Profile semantics

- `name` 是应用自己的昵称，保存前 trim，trim 后不能为空。
- `avatar` 是应用自己的头像 URL，不等同于微信头像快照。
- PATCH 只发送发生变化的 `name` / `avatar` 字段。
- 头像选择复用 `src/utils/upload/**`：H5 使用 web album，微信小程序使用 wechat album；通过 `GET /oss/getSignature` 获取凭证后直传公开对象存储，取得可直接展示的永久 URL。
- 头像上传完成后立即 PATCH `/users/me` 并重新 GET；昵称仍由保存按钮提交。成功后与当前 `getUserInfo()` 合并后调用 `setUserInfo()`，不新增 User Store。
- 头像上传复用 `src/hooks/use-oss-upload.ts`，与文件上传工具共用 `getOssFormData`、OSS 直传地址和 `uni.uploadFile` 成功状态判断；不使用 `VITE_APP_OSS_HOST` 作为文件直传地址。

## 3.1 Mine settings layout

- “我的资料”“账号与安全”在我的页面中直接展示，位于“夜间模式”上方。
- “夜间模式”下方提供“关于”入口，展示用户服务协议、隐私政策与版本号。
- 原设置页保留为旧链接兼容页，不再作为我的页面入口。

## 4. Account Binding semantics

- `GET /users/me/bindings` 是绑定状态唯一数据源。
- 手机号展示直接使用接口返回的 `maskedPhone`。
- 手机号仅支持首次绑定，不支持换绑或解绑。
- 手机号使用中国大陆 11 位格式；密码至少 8 位且包含至少一个英文字母和一个数字；确认密码必须一致，否则不请求接口。
- 微信绑定与微信快捷登录是不同业务；绑定必须调用 `postMeBindingsWechat`，不得调用 `postAuthWechatLogin`。
- 每次主动绑定微信都重新调用 `uni.login()` 获取一次性 code，不缓存、不提交 openid/unionid。
- 微信绑定只在微信小程序中可操作；页面不会要求用户查找或手动输入微信 ID。`uni.login()` 超过 10 秒未回调时结束本次操作并允许重试。

## 5. MP-WEIXIN behavior

- 支持资料查看、昵称编辑和相册头像上传。
- 微信未绑定时展示可操作入口，点击后重新获取 code 并绑定；成功后重新 GET bindings。
- 微信已绑定时只展示状态。

## 6. H5 behavior

- 支持资料查看、昵称编辑、相册头像上传和手机号绑定。
- 不新增微信 H5 OAuth。
- 微信已绑定时展示「已绑定」；未绑定时展示「请在微信小程序中绑定」，不可点击。

## 7. Error handling

- 400/409：展示后端 `message/msg/data.message/data.msg`，不切换当前用户。
- 401：交由 `src/services/http.ts` 的 refresh token / 登录失效流程处理。
- 账号绑定状态接口不可用（例如服务端返回 404）时展示明确错误态和“重新加载”，不把失败误显示成“未绑定”。
- 429：使用请求层提示，页面不重复弹 Toast。
- 所有提交均有局部 loading/disabled，禁止重复点击。
- 禁止记录密码、微信 code、access token、refresh token、openid、unionid。

## 8. Out of scope

- 账号合并
- 手机号或微信解绑、换绑
- 短信验证码
- 修改密码
- 微信 H5 OAuth
- Auth 模块重构
- Storage 到 Pinia 的迁移
- 新 API wrapper、上传 SDK 或 UI Library

## 9. 验收

- [ ] 设置页两个新入口均受现有登录 Gate 保护
- [ ] Profile GET/PATCH、头像上传和 Storage 同步正常
- [ ] bindings 状态完全来自服务端
- [ ] 手机号密码本地校验失败时不发请求
- [ ] 微信绑定仅在 MP-WEIXIN 执行并每次获取新 code
- [ ] H5 与 MP-WEIXIN 构建通过
- [ ] 日间/夜间主题可读
- [ ] changelog 已更新
