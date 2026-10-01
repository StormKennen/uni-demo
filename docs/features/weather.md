# 天气实时查询 V1

## 页面与入口

- 页面：`subPackages/tools/weather/index`
- 分类：`record`（记录）
- 发布端：H5 + mp-weixin
- 位置来源：当前定位、地点选择、地图选点

## 前端请求模型

```ts
interface WeatherPoint {
  latitude: number
  longitude: number
  coordinateSystem: 'wgs84' | 'gcj02'
  source: 'location' | 'place' | 'map'
  placeId?: string
  name?: string
}
```

所有天气查询都经 `getWeather(point)`，天气 API 返回当前天气、未来 24 小时和未来 7 天；天气不写入本地地点或 MongoDB。

## 交互

- 当前定位：用户授权后查询当前位置。
- 选择地点：复用海拔地点树和关键词搜索，使用地点 WGS84 坐标。
- 地图选点：微信小程序使用 `uni.chooseLocation()`，使用 GCJ02 坐标交给后端转换。
- 结果页展示当前天气、体感温度、湿度、降水、降雨概率、风况、24 小时和 7 天预报。
- 分享只保存位置状态，不保存天气结果；打开分享后重新请求最新天气。
