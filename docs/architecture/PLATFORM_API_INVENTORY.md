# A0 平台能力清单

机器清单：`architecture-reports/platform-api-usage.json`。

扫描范围为业务源码与手写基础层，排除 Apifox 生成区和 `src/static` 第三方静态脚本。各能力允许重叠计数，例如 `wx.chooseMedia` 同时计入 `wx.*` 与文件选择；Canvas 为标识符级清单，包含 API、类型、模板标签和业务变量，适合作为迁移搜索基线而非“调用次数”。

## 按能力

| 能力 | 命中次数 |
| --- | ---: |
| canvas | 281 |
| condition:H5 | 141 |
| share | 112 |
| condition:MP-WEIXIN | 98 |
| document.* | 79 |
| window.* | 69 |
| clipboard | 49 |
| file:choose | 43 |
| wx.* | 41 |
| file:save | 29 |
| privacy | 24 |
| navigator.* | 22 |
| image:save | 16 |
| auth | 10 |
| getCurrentPages | 7 |
| location.* | 2 |

主要精确符号包括：`uni.chooseImage` 18、`wx.chooseMedia` 14、`wx.chooseMessageFile` 6、`uni.chooseVideo` 5、`uni.chooseFile` 4、`uni.saveImageToPhotosAlbum` 16、`uni.downloadFile` 14、`uni.openDocument` 4、`URL.createObjectURL` 8、`navigator.clipboard` 16、`createCanvasContext` 14、`canvasToTempFilePath` 21、`getCurrentPages` 7、`wx.getPrivacySetting` 14、`wx.requirePrivacyAuthorize` 4。

## 按业务域

| 业务域 | 平台能力命中 |
| --- | ---: |
| memo | 228 |
| root-components | 172 |
| engine | 52 |
| utils | 44 |
| compendium | 41 |
| image-compress | 41 |
| image-stitch | 38 |
| calendar | 35 |
| video-compress | 34 |
| pool-aim | 33 |
| utilsH5 | 27 |
| image-format | 26 |
| image-watermark | 25 |
| video-gif | 22 |
| family-tree | 19 |
| oss-upload | 19 |
| watermark | 17 |
| document-scan | 16 |
| image-privacy | 16 |
| main:mine | 13 |
| pdf-toolkit | 12 |
| js | 9 |
| markdown | 7 |
| App.vue | 6 |
| appDebug | 6 |
| main:index | 6 |
| main:tools | 6 |
| qr-generator | 6 |
| webview | 5 |
| chat | 5 |
| game-coupons | 5 |
| image-cipher | 5 |
| qr-parser | 5 |
| main.ts | 4 |
| services | 4 |
| stores | 4 |
| magnet-link | 4 |
| hooks | 3 |
| editor-core | 2 |
| code-wallet | 1 |

memo（228）、根组件（172）、engine（52）、utils（44）、compendium（41）、image-compress（41）、image-stitch（38）是迁移面最大的区域。

## 缺少条件编译上下文的直接 API

判定口径：`window/document/navigator/location` 不在 H5/WEB 条件块、`utilsH5` 或 H5 adapter；`wx.*` 不在 MP-WEIXIN 条件块。运行时 `typeof window` 保护仍会列入，因为其代码仍进入双端产物；平台 adapter 文件需在 P4 复核是否应登记为合法实现。

| 文件 | 次数 | 能力 | 行号 |
| --- | ---: | --- | --- |
| `src/subPackages/services/memo/detail.vue` | 11 | document.*、navigator.* | 1920,1931,1936,1954,1971,1981,1991,2004,2014,2024,1870 |
| `src/subPackages/tools/memo/detail.vue` | 11 | document.*、navigator.* | 2008,2019,2024,2042,2059,2069,2079,2092,2102,2112,1958 |
| `src/js/dsbridge-3.1.4.js` | 9 | window.*、navigator.* | 1,3 |
| `src/components/share-app.vue` | 5 | window.* | 32,34,38,44 |
| `src/utils/loadFile.ts` | 4 | document.* | 5,30,35,44 |
| `src/engine/tomato-cipher/adapters/weapp/WeappAdapter.ts` | 3 | wx.* | 59,83,91 |
| `src/subPackages/tools/family-tree/family-tree-chart.vue` | 3 | wx.*、document.* | 903,905,886 |
| `src/subPackages/tools/image-stitch/index.vue` | 3 | document.* | 629,631,1683 |
| `src/subPackages/tools/watermark/index.vue` | 3 | window.*、navigator.* | 218,219,220 |
| `src/components/toolkit/business/image-shuffle-panel.vue` | 2 | window.*、navigator.* | 448,450 |
| `src/subPackages/common/webview/webview.vue` | 2 | window.*、document.* | 219,226 |
| `src/subPackages/services/memo/editor.vue` | 2 | document.* | 2844,3036 |
| `src/subPackages/tools/pool-aim/index.vue` | 2 | window.*、navigator.* | 1475,1477 |
| `src/utils/upload/cdpOss.ts` | 2 | window.* | 79,107 |
| `src/components/toolkit/business/qr-generator-panel.vue` | 1 | document.* | 126 |
| `src/engine/tomato-cipher/core/CipherFactory.ts` | 1 | wx.* | 89 |
| `src/engine/tomato-cipher/utils/metadataIO.ts` | 1 | wx.* | 9 |
| `src/subPackages/tools/calendar/auspicious.vue` | 1 | document.* | 514 |
| `src/subPackages/tools/image-compress/index.vue` | 1 | document.* | 415 |
| `src/subPackages/tools/pdf-toolkit/index.vue` | 1 | document.* | 320 |

合计 68 次 / 20 文件：document 35、window 19、navigator 7、wx 7。高频的两套 memo detail 各 11 次；`share-app.vue` 和 `utils/loadFile.ts` 整体没有条件编译区；`engine/tomato-cipher/adapters/weapp` 属明确微信 adapter，应在未来边界规则中豁免而不是迁移掉直接调用。

## 能力迁移建议

| 顺序 | 能力 | 主要业务域 | 建议阶段 |
| ---: | --- | --- | --- |
| 1 | 平台注册与能力探测 | App、utils、PageLayout | P4A |
| 2 | 文件选择 | 图片工具、OSS、PDF、视频 | P4B |
| 3 | 文件/图片保存 | 图片工具、memo 海报、calendar 海报 | P4C |
| 4 | 分享 | memo、calendar、compendium、工具页面 | P4D |
| 5 | 剪贴板 | QR、watermark、magnet、工具面板 | P4E |
| 6 | Canvas | family-tree、image-stitch、pool-aim、cipher | P4F |
| 7 | 登录/隐私授权 | login、PageLayout、privacy-popup、wxLogin | P4G |
| 8 | 定位 | `utils/map.ts`、manifest 权限声明 | P4H |

## 问题登记

| ID | 问题 | 证据 | 影响范围 | 严重度 | 建议阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-H06 | 68 个直接平台 API 命中缺少条件编译上下文 | 上表与 JSON 行号 | 20 文件、双端运行时 | High | P4 | 是（对应域迁移前） |
| A0-H11 | Canvas 能力分散且族谱依赖 ECharts Canvas wrapper | `family-tree-chart.vue:270-271,1201`、l-echart | 族谱、导出、性能 | High | P0B/P4F/P7 | 否 |
| A0-B01 | 分享实现分散，旧 memo 分享路径无效 | `tools/memo/detail.vue:2267-2275` | 分享一致性 | Blocking | P0C/P4D | 是 |
| A0-M11 | 登录与隐私能力同时散落 PageLayout、popup、utils | `PageLayout.vue:56-73`、`privacy-popup.vue`、`wxLogin.ts` | 授权时序 | Medium | P4G | 否 |
