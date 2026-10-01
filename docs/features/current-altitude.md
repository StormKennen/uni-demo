# 查询海拔

## 0. 元信息

| 项       | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| 功能名称 | 查询海拔                                                   |
| 所属域   | `subPackages/tools`                                        |
| 发布端   | H5 + mp-weixin                                             |
| 状态     | 开发中                                                     |
| 关联接口 | 后端 `GET /v1/altitude/current`、`GET /v1/altitude/places` |

## 1. 业务上下文与页面流

用户打开工具后授权定位，页面根据当前位置查询并展示海拔高度；不要求登录，不保存位置。

| 页面     | 路由路径                           | 跳转方式         | 来源入口                     |
| -------- | ---------------------------------- | ---------------- | ---------------------------- |
| 查询海拔 | `subPackages/tools/altitude/index` | `uni.navigateTo` | `src/config/tools.ts` 工具卡 |

- 需要在 `src/pages.json` 中新增的路由：`subPackages/tools/altitude/index`，自定义导航栏。
- 工具入口：名称“查询海拔”，图标 `location`，路径 `/subPackages/tools/altitude/index`，无需登录。
- 返回兜底：返回工具目录 `/pages/tools/index`。

## 2. 前后端 API 契约

### 2.1 接口清单

| 功能         | 方法与路径                                      | 鉴权     | 调用封装                                                                   |
| ------------ | ----------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| 自动定位查询 | `GET /v1/altitude/current?latitude=&longitude=` | 无需登录 | `src/services/apifox/NODEJSDEMO/ALTITUDE/apifox.ts`                        |
| 手动地点查询 | `GET /v1/altitude/places?keyword=`              | 无需登录 | `src/services/apifox/NODEJSDEMO/ALTITUDE/apifox.ts` 的 `getAltitudePlaces` |

### 2.2 TypeScript 契约

```ts
interface CurrentAltitudeQuery {
  latitude: number
  longitude: number
}

interface CurrentAltitudeResult {
  latitude: number
  longitude: number
  altitudeMeters: number
  unit: 'm'
  source: 'open-meteo'
  queriedAt: string
}

interface PrecollectedAltitudePlace {
  id: string
  name: string
  fullName: string
  level: 'province' | 'city' | 'county' | 'scenic_point'
  altitudeMeters: number
  latitude: number
  longitude: number
  referenceType: string
}
```

### 2.3 错误与权限处理

- 定位拒绝/失败：页面展示错误状态，用户可点击“重新定位”。
- API 400/502/网络错误：页面展示“暂时无法获取海拔，请稍后重试”。
- 不触发登录流程。

## 3. 交互约束

- 页面打开后先展示位置信息使用说明，用户点击同意后再发起定位和海拔查询；也可以切换到“手动选地点”。
- 请求期间按钮显示加载态并禁用，避免重复定位请求。
- 成功态展示海拔、经纬度和查询时间。
- 成功态使用温度计式纵向仪表突出显示海拔数值，刻度仅作为当前读数的视觉辅助。
- 仪表颜色按产品提示分段展示：`<1500m` 常规、`1500–2499m` 高度提醒、`2500–3499m` 高海拔提示、`≥3500m` 高海拔警示；颜色不代表医疗诊断。
- 定位被拒绝时提供“去开启定位权限”入口，网络错误提供重新定位按钮。
- 手动查询通过地点关键词匹配四川省预采集 JSON，选择结果后展示参考海拔，不请求实时高程服务。
- 选择树绑定当前路径并提供“确认选择”按钮，未选到具体地点/景点时不会回填海拔结果。
- 景区选择若存在多个具体景点，会在同页展开景点列表；选择具体景点后由后端按数据库海拔优先、实时高程兜底查询。
- 页面颜色走 `--theme-*` token，兼容白天/夜间主题。
- 微信好友和朋友圈分享进入 `/subPackages/tools/altitude/index`，不携带用户坐标或查询结果。

## 4. 条件编译与跨端兼容说明

- H5 和微信小程序统一使用 `uni.getLocation`，不直接访问浏览器 API。
- 微信小程序定位权限由系统弹窗处理；用户拒绝时保留页面并提供重试。
- 微信小程序已拒绝定位时，引导用户打开小程序设置重新开启 `scope.userLocation`。
- 所有 HTTP 调用经业务目录 API 模块复用 `src/services/http.ts`，不使用裸 `uni.request`。
- 页面使用 uni-app 原生 `view`、`text`，不使用 Web 标签、`window`、`document` 或写死 `px`。

## 5. 验收清单

- [ ] H5 白天/夜间模式正常。
- [ ] mp-weixin 白天/夜间模式正常。
- [ ] 路由和工具入口已注册。
- [ ] 定位成功可显示海拔。
- [ ] 定位拒绝、网络失败、重复点击有明确状态。
- [ ] `pnpm lint` / `pnpm type-check` 通过。
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin` 通过。
- [ ] `docs/changelog.md` 已同步更新。
