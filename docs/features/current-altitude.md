# 查询海拔

## 0. 元信息

| 项       | 内容                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| 功能名称 | 查询海拔                                                                                        |
| 所属域   | `subPackages/tools`                                                                             |
| 发布端   | H5 + mp-weixin                                                                                  |
| 状态     | 开发中                                                                                          |
| 关联接口 | 后端 `GET /v1/altitude/elevation`、`GET /v1/altitude/places`、`GET /v1/altitude/places/options` |

## 1. 业务上下文与页面流

用户打开工具后授权定位，页面根据当前位置查询并展示海拔高度；不要求登录，不保存位置。

| 页面         | 路由路径                                   | 跳转方式         | 来源入口                     |
| ------------ | ------------------------------------------ | ---------------- | ---------------------------- |
| 查询海拔     | `subPackages/tools/altitude/index`         | `uni.navigateTo` | `src/config/tools.ts` 工具卡 |
| 景区海拔详情 | `subPackages/tools/altitude/scenic-detail` | `uni.navigateTo` | 查询海拔页景区卡片           |

- 需要在 `src/pages.json` 中新增的路由：`subPackages/tools/altitude/index`、`subPackages/tools/altitude/scenic-detail`，均使用自定义导航栏。
- 工具入口：名称“查询海拔”，图标 `location`，路径 `/subPackages/tools/altitude/index`，无需登录。
- 返回兜底：返回工具目录 `/pages/tools/index`。

## 2. 前后端 API 契约

### 2.1 接口清单

| 功能         | 方法与路径                                      | 鉴权     | 调用封装                                                                   |
| ------------ | ----------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| 自动定位查询 | `GET /v1/altitude/current?latitude=&longitude=` | 无需登录 | `src/services/apifox/NODEJSDEMO/ALTITUDE/apifox.ts`                        |
| 手动地点查询 | `GET /v1/altitude/places?keyword=`              | 无需登录 | `src/services/apifox/NODEJSDEMO/ALTITUDE/apifox.ts` 的 `getAltitudePlaces` |
| 统一坐标查询 | `GET /v1/altitude/elevation`                    | 无需登录 | `src/subPackages/tools/altitude/altitude-api.ts`（待切换生成方法）         |

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
  source: string
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

- 页面打开后默认自动请求当前位置海拔；分享进入景区筛选模式时不触发定位，用户也可以通过蓝色文字按钮重新获取当前海拔。
- 请求期间按钮显示加载态并禁用，避免重复定位请求。
- 成功态展示海拔、经纬度和查询时间。
- 成功态使用跑车式半圆仪表盘：固定浅灰外环，内侧半径更小、同心且宽度略窄的警戒色进度弧；弧线仅显示至当前读数，之后透明，不使用扇形填充。进度与轻微指针摆动同步；关键刻度为 `0m/1500m/2500m/3500m/4500m`，刻线沿半径方向朝向圆心。默认量程为 `0–5000m`，超过 `5000m` 自动扩展至 `0–10000m`。浅色主题使用浅灰底板/深色文字，深色主题使用深色底板/浅色文字。
- 自动定位结果使用动态圆弧仪表盘；已完成的进度部分按绝对海拔对应的警告等级着色，未达到的部分透明；当前读数与指针、弧线进度同步，微信端提供原生分享入口。
- 仪表颜色按产品提示分段展示：`<1500m` 常规、`1500–2499m` 高度提醒、`2500–3499m` 高海拔提示、`≥3500m` 高海拔警示；颜色不代表医疗诊断。
- 海拔警告区段和颜色统一由 `src/subPackages/tools/altitude/altitude-warning.ts` 控制；景区海拔柱状图复用同一套绝对海拔区段，纵轴从 `0m` 起算。
- 定位被拒绝时提供“去开启定位权限”入口，网络错误提供重新定位按钮。
- 手动查询通过地点关键词匹配四川省预采集 JSON，选择结果后展示参考海拔，不请求实时高程服务。
- 选择树绑定当前路径并提供“确认选择”按钮，未选到具体地点/景点时不会回填海拔结果。
- 景区筛选结果点击景区后进入独立的景区海拔详情页，不再在筛选页容器内展开；详情页展示景区景点海拔快照列表和柱状图。
- 景区详情页分享携带 `areaId`（以及用于分享标题的景区名称），接收方无需经过筛选即可直接查看该景区海拔快照。
- 景区筛选页分享携带已确认的 `provinceCode`、`cityCode`、`countyCode` 和关键词，接收方打开后自动恢复筛选条件并加载景区列表。
- 景区筛选页首屏预置省级行政区列表，城市和区县优先读取本地行政树缓存，再由行政树接口异步补全并刷新缓存；首次接口较慢或失败时不阻塞省份选择和景区列表首屏加载。
- 地区级联面板点击“完成”后刷新景区列表，关键词仍可通过输入框确认或“查询”按钮刷新。
- 景区筛选使用单一“地区”入口和底部级联面板，按省份 → 城市/州 → 区县逐级选择；选择过程先保留草稿，点击“完成”后统一刷新景区列表，不再在页面上并排展示三个独立 picker。
- 自动定位、选择地点、地图选点最终统一进入坐标海拔查询 Adapter，分别携带 `wgs84`、`wgs84`、`gcj02`。
- 页面颜色走 `--theme-*` token，兼容白天/夜间主题。
- 查询海拔首页顶部使用“获取当前海拔 / 景区海拔”双 Tab 切换，采用明显的选中态、下划线和当前标识，让用户一眼识别查询方式可切换，适配微信小程序单手操作。
- 顶部查询方式切换使用分段胶囊 Tab；仪表盘仅保留关键量程刻度：默认 `0/1.5/2.5/3.5/5km`，扩展后增加 `7.5/10km`，帮助识别警告色变化起点。
- 当前定位分享进入 `/subPackages/tools/altitude/index`，不携带用户坐标或查询结果；景区筛选分享携带筛选参数，景区详情分享进入 `/subPackages/tools/altitude/scenic-detail` 并携带景区参数。
- 查询海拔页和景区海拔详情页均开启微信好友分享、朋友圈分享入口，分享回调使用当前页面的筛选参数。

## 4. 条件编译与跨端兼容说明

- H5 和微信小程序统一使用 `uni.getLocation`，不直接访问浏览器 API。
- 自动海拔查询使用 `wgs84` GPS 坐标请求高程服务；`gcj02` 仅用于地图/导航场景，避免坐标系偏移造成海拔差异。
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
