# 景区模式

## 1. 功能与路由

- 页面：`subPackages/tools/scenic/index`
- 发布端：H5 + mp-weixin
- 工具入口：`/subPackages/tools/scenic/index`
- 功能：省/市/区县可选筛选、景区分页、景点搜索、多景区卡片、景区详情和海拔折线图。

## 2. 数据与接口

- 省、市、区县行政树页面初始化时请求一次 `GET /v1/scenic/administrative-options`，前端收到完整树后只在本地做省 → 市/州 → 区县联动。
- 行政树只负责联动；最终选择的 `provinceCode`、`cityCode`、`countyCode` 再作为景区查询条件提交给后端。

- `GET /v1/scenic/administrative-options`：返回完整行政筛选树，前端页面初始化时调用一次。
- `GET /v1/scenic/areas`：景区分页列表；省、市、区县均为可选筛选。
- `GET /v1/scenic/areas/{areaId}`：景区详情和景点分页。
- `GET /v1/scenic/areas/{areaId}/elevation-profile`：小程序折线图数据。
- `GET /v1/scenic/points/search`：景点关键词分页搜索。
- `GET /v1/weather`：景点或景区按 WGS84 经纬度查询实时天气。

## 3. 前端交互

- 省、市、区县使用三个原生 `picker`，允许停留在任意一级。
- 景区列表按 `page/pageSize` 加载，页面支持“加载更多”。
- 景区卡片展示景区海拔、景点数量和最多 5 个景点预览。
- 景点关键词搜索结果展示所属景区、海拔和坐标。
- 景区详情展示景点分页，并提供海拔折线图。
- 折线图使用纯 uni-app `view/scroll-view` 实现，不新增第三方图表依赖，兼容 H5 和微信小程序。

## 4. 数据模型

- 地点坐标来自 `place_coordinates`。
- 景区和景点海拔来自 `scenic_altitude_snapshots`。
- 天气不落库，按景区/景点 WGS84 坐标实时查询。

## 5. 验收

- [ ] 只选省份可以返回多个景区并分页。
- [ ] 只选城市/州可以返回多个景区并分页。
- [ ] 区县为空时不会强制补选区县。
- [ ] 景点搜索结果包含所属景区和海拔。
- [ ] 九寨沟折线图可显示景点名称和海拔差异。
- [ ] H5 和 mp-weixin 均不使用 Web 标签、裸 `uni.request` 或固定 px。
