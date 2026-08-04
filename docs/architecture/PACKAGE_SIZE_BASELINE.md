# A0 构建与包体积基线

机器清单：`architecture-reports/package-size-baseline.json`。

依赖已安装，本次实际执行 `pnpm build:h5` 与 `pnpm build:mp-weixin`，两者均成功。以下为未压缩磁盘字节和 MiB（1 MiB = 1,048,576 B）；不等同于微信开发者工具最终上传压缩值。

## 总体

| 产物 | 文件数 | 总字节 | MiB | 生成时间（UTC） |
| --- | ---: | ---: | ---: | --- |
| H5 | 256 | 3,781,832 | 3.61 | 2026-08-04T01:55:08.203Z |
| mp-weixin | 616 | 2,951,852 | 2.82 | 2026-08-04T01:55:29.357Z |
| 源 `src/static` | 86 | 1,415,211 | 1.35 | — |

## 微信包

| package root | 字节 | MiB |
| --- | ---: | ---: |
| main | 1,943,826 | 1.85 |
| subPackages/tools | 924,500 | 0.88 |
| editor-core | 69,497 | 0.07 |
| subPackages/common | 11,049 | 0.01 |
| subPackages/user | 2,980 | 0.00 |

微信主包 1,943,826 B 中，根 `static` 为 1,415,211 B，占 72.8%。`manifest.json` 中 `optimization.subPackages` 当前为 false（`src/manifest.json:91-93`）。

## H5 最大 30 个文件

| # | 文件 | 字节 |
| ---: | --- | ---: |
| 1 | `assets/echarts.min.B-Dv-SM2.js` | 526,472 |
| 2 | `static/echarts.min.js` | 517,186 |
| 3 | `assets/index-BT7MMyaq.js` | 393,450 |
| 4 | `static/image/home/cooking.jpg` | 321,556 |
| 5 | `static/image/hsbc-info@3x.png` | 116,742 |
| 6 | `static/style/animate.min.scss` | 71,752 |
| 7 | `static/image/hsbc-info.png` | 70,560 |
| 8 | `assets/utils.BPgAUcxT.js` | 69,406 |
| 9 | `assets/subPackages-tools-memo-editor.DZB2Fet0.js` | 68,675 |
| 10 | `static/image/hsbc-info@2x.png` | 62,853 |
| 11 | `static/image/order/pic_01.png` | 58,891 |
| 12 | `assets/editor-core-demo-SchemaEditorDemo.Cv1GeWn8.js` | 43,817 |
| 13 | `assets/marked.esm.CPrSqo4Z.js` | 42,081 |
| 14 | `assets/qr-generator-panel.5qu5MC7N.js` | 40,798 |
| 15 | `assets/subPackages-tools-family-tree-index.heKUTVNO.js` | 39,776 |
| 16 | `assets/uniicons-DN59BOw4.ttf` | 35,824 |
| 17 | `assets/subPackages-tools-memo-detail.X3u5D-3Z.js` | 34,143 |
| 18 | `assets/editor-DtFIDX6q.css` | 33,945 |
| 19 | `assets/uni.1b63df7d.css` | 30,855 |
| 20 | `static/image/home/ai_person_2.png` | 29,910 |
| 21 | `assets/subPackages-tools-game-coupons-index.CQXabmSX.js` | 27,263 |
| 22 | `assets/detail-DT6QH1eI.css` | 25,849 |
| 23 | `assets/subPackages-tools-image-stitch-index.CMdWlbl1.js` | 25,664 |
| 24 | `assets/index-2zECCZUF.css` | 25,337 |
| 25 | `assets/subPackages-tools-compendium-swc-detail.Cx4DT0Yk.js` | 25,178 |
| 26 | `assets/subPackages-tools-family-tree-demo.h8R-zbjp.js` | 24,103 |
| 27 | `assets/index-D5HXx8C1.css` | 23,075 |
| 28 | `assets/subPackages-tools-pool-aim-index.BbR1GyZ5.js` | 22,842 |
| 29 | `assets/subPackages-tools-compendium-swc-admin-list.HFqFgmca.js` | 21,516 |
| 30 | `assets/index-DDyxZYoD.css` | 20,875 |

## 微信最大 30 个文件

| # | 文件 | 字节 |
| ---: | --- | ---: |
| 1 | `static/echarts.min.js` | 517,186 |
| 2 | `static/image/home/cooking.jpg` | 321,556 |
| 3 | `common/vendor.js` | 253,470 |
| 4 | `static/image/hsbc-info@3x.png` | 116,742 |
| 5 | `static/style/animate.min.scss` | 71,752 |
| 6 | `static/image/hsbc-info.png` | 70,560 |
| 7 | `static/image/hsbc-info@2x.png` | 62,853 |
| 8 | `static/image/order/pic_01.png` | 58,891 |
| 9 | `node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.wxss` | 54,560 |
| 10 | `static/image/home/ai_person_2.png` | 29,910 |
| 11 | `subPackages/tools/memo/detail.js` | 25,488 |
| 12 | `subPackages/tools/memo/detail.wxss` | 24,292 |
| 13 | `subPackages/tools/game-coupons/index.wxss` | 22,059 |
| 14 | `subPackages/tools/image-stitch/index.js` | 20,665 |
| 15 | `subPackages/tools/pool-aim/index.js` | 18,801 |
| 16 | `subPackages/tools/game-coupons/index.js` | 18,439 |
| 17 | `subPackages/tools/compendium/swc/detail.wxss` | 17,897 |
| 18 | `static/ecStat.min.js` | 16,061 |
| 19 | `subPackages/tools/compendium/swc/detail.js` | 15,823 |
| 20 | `subPackages/tools/memo/editor.js` | 15,605 |
| 21 | `subPackages/tools/compendium/swc/admin-list.js` | 14,816 |
| 22 | `subPackages/tools/memo/editor.wxss` | 13,362 |
| 23 | `subPackages/tools/image-stitch/index.wxml` | 11,792 |
| 24 | `subPackages/tools/memo/editor.wxml` | 11,703 |
| 25 | `subPackages/tools/memo/list.wxss` | 11,424 |
| 26 | `subPackages/tools/memo/detail.wxml` | 11,358 |
| 27 | `subPackages/tools/image-stitch/index.wxss` | 11,038 |
| 28 | `subPackages/tools/compendium/swc/list.wxss` | 10,656 |
| 29 | `subPackages/tools/compendium/swc/list.js` | 10,359 |
| 30 | `subPackages/tools/code-wallet/index.js` | 10,099 |

## 根 static 最大 30 个文件

| # | 文件 | 字节 |
| ---: | --- | ---: |
| 1 | `static/echarts.min.js` | 517,186 |
| 2 | `static/image/home/cooking.jpg` | 321,556 |
| 3 | `static/image/hsbc-info@3x.png` | 116,742 |
| 4 | `static/style/animate.min.scss` | 71,752 |
| 5 | `static/image/hsbc-info.png` | 70,560 |
| 6 | `static/image/hsbc-info@2x.png` | 62,853 |
| 7 | `static/image/order/pic_01.png` | 58,891 |
| 8 | `static/image/home/ai_person_2.png` | 29,910 |
| 9 | `static/ecStat.min.js` | 16,061 |
| 10 | `static/image/no-data.png` | 9,703 |
| 11 | `static/image/home/ai_person_1.png` | 9,130 |
| 12 | `static/image/files/png.png` | 7,641 |
| 13 | `static/image/files/jpg.png` | 7,635 |
| 14 | `static/image/files/bmp.png` | 7,343 |
| 15 | `static/image/files/ppt.png` | 7,304 |
| 16 | `static/image/files/word.png` | 7,239 |
| 17 | `static/image/files/tiff.png` | 7,121 |
| 18 | `static/image/files/pdf.png` | 6,302 |
| 19 | `static/uni.webview.1.5.5.js` | 6,146 |
| 20 | `static/image/logo.png` | 5,951 |
| 21 | `static/image/hsbc-info-bg.svg` | 4,971 |
| 22 | `static/uvue.html` | 4,698 |
| 23 | `static/style/global.scss` | 4,685 |
| 24 | `static/image/files/hetong.png` | 3,869 |
| 25 | `static/logo.png` | 3,760 |
| 26 | `static/image/empty.svg` | 2,227 |
| 27 | `static/image/error.png` | 1,510 |
| 28 | `static/image/mine.png` | 1,487 |
| 29 | `static/image/close.png` | 1,466 |
| 30 | `static/image/mall.png` | 1,410 |

## ECharts、重复资源与族谱

- H5 ECharts 命名产物合计 1,059,952 B (1.01 MiB)：bundled `assets/echarts.min.*.js`、原样复制 `static/echarts.min.js`、`static/ecStat.min.js` 和少量 CSS。单是 bundled + static 两份 ECharts 主体即 1,043,658 B，属于逻辑重复。
- 微信 ECharts 命名产物合计 533,247 B (0.51 MiB)，全部位于根 static，因此进入主包。
- H5 族谱命名 chunk 合计 63,879 B (0.06 MiB)；微信 `subPackages/tools/family-tree` 构建文件合计 40,032 B (0.04 MiB)。微信数字不含位于主包的 ECharts 运行时。
- 对每个平台中至少 1 KiB 的文件做 SHA-256 检查，没有发现字节完全相同且路径不同的构建文件；逻辑重复仍包括 H5 的 bundled/static ECharts。
- H5 构建警告指出 `storage.ts` / `httpHeaders.ts` 同时动态和静态 import，动态 import 不会形成独立 chunk。

## 未发现源码引用的大资源

静态扫描在 `src/static` 外的源码中搜索资源相对路径，以下超过 50 KiB 的文件未命中。因为 uni-app 会原样复制根 static，它们全部进入双端产物；删除前仍须复核运行时拼接、CSS 间接引用和产品配置。

| 文件 | 字节 |
| --- | ---: |
| `src/static/image/home/cooking.jpg` | 321,556 |
| `src/static/image/hsbc-info@3x.png` | 116,742 |
| `src/static/style/animate.min.scss` | 71,752 |
| `src/static/image/hsbc-info.png` | 70,560 |
| `src/static/image/hsbc-info@2x.png` | 62,853 |
| `src/static/image/order/pic_01.png` | 58,891 |

合计 702,354 B。

## 问题登记

| ID | 问题 | 证据 | 影响范围 | 严重度 | 建议阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-H02 | 微信主包 1.94 MB，根 static 占 72.8% | mp 包表、rootStaticBytes | 微信发布余量 | High | P0B/P5 | 是 |
| A0-H03 | ECharts 活动进入双端产物 | ECharts 清单；family-tree import | 主包、H5 下载 | High | P0B | 否 |
| A0-M04 | H5 同时携带 bundled/static ECharts | 两个 500+ KiB 文件 | H5 部署与首载 | Medium | P0B | 否 |
| A0-M02 | 702,354 B 大资源未发现源码引用 | 上表 | 双端体积 | Medium | P0B/P5 | 否 |
| A0-M07 | storage/httpHeaders 动静态引用阻止拆 chunk | H5 构建日志 | chunk 边界 | Medium | P1/P9 | 否 |
