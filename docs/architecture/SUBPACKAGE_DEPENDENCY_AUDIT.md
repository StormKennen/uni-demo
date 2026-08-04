# A0 分包依赖审计

机器清单：`architecture-reports/subpackage-dependencies.json`。

## 当前结构

`src/pages.json` 定义四个分包根：`subPackages/user`（1 页）、`subPackages/tools`（43 页）、`editor-core`（1 页）、`subPackages/common`（2 页）。`subPackages/services/memo` 不在 pages.json 中，因此既不是有效分包，也不是活动路由包。

静态 import 解析结果：

- 分包之间直接 import：0。
- 分包显式 import 根 `src/components`：21 条。
- 加上 PageLayout/easycom 与精确组件标签后，根组件被分包页面使用关系为 70 条文件级记录。
- “0 个跨分包 import”只代表当前四个真实 package root 间没有显式静态依赖；所有工具域现在同属 `subPackages/tools`，工具目录之间的 import 不会被 uni-app 视为跨分包。

## 根组件显式依赖

| 根组件/类型 | import 数 | 引用位置 |
| --- | ---: | --- |
| `src/components/toolkit/business/qr-generator-panel.vue` | 3 | src/subPackages/tools/code-wallet/index.vue:159<br>src/subPackages/tools/magnet-link/index.vue:89<br>src/subPackages/tools/qr-generator/index.vue:40 |
| `src/components/toolkit/business/image-shuffle-panel.vue` | 3 | src/subPackages/tools/image-cipher/index.vue:14<br>src/subPackages/tools/magnet-link/index.vue:90<br>src/subPackages/tools/qr-generator/index.vue:41 |
| `src/components/toolkit/types` | 3 | src/subPackages/tools/image-cipher/index.vue:15<br>src/subPackages/tools/magnet-link/index.vue:91<br>src/subPackages/tools/qr-generator/index.vue:44 |
| `src/components/toolkit/base/flow-action-bar.vue` | 3 | src/subPackages/tools/magnet-link/index.vue:88<br>src/subPackages/tools/qr-generator/index.vue:43<br>src/subPackages/tools/qr-parser/index.vue:26 |
| `src/components/l-echart/l-echart.vue` | 2 | src/subPackages/tools/family-tree/demo.vue:43<br>src/subPackages/tools/family-tree/family-tree-chart.vue:270 |
| `src/components/toolkit/base/tool-sheet.vue` | 2 | src/subPackages/tools/magnet-link/index.vue:87<br>src/subPackages/tools/qr-generator/index.vue:42 |
| `src/components/FolderPicker.vue` | 2 | src/subPackages/tools/oss-upload/fileList.vue:7<br>src/subPackages/tools/oss-upload/index.vue:3 |
| `src/components/toolkit/business/qr-parser-panel.vue` | 1 | src/subPackages/tools/qr-parser/index.vue:25 |
| `src/components/mine-list-item.vue` | 1 | src/subPackages/user/setting/setting.vue:2 |
| `src/components/confirm-dialog.vue` | 1 | src/subPackages/user/setting/setting.vue:4 |

另有 `PageLayout.vue` 被绝大多数分包页通过 easycom/标签使用，属于合理的轻量根 UI 候选；上表的 ECharts、FolderPicker 与 toolkit business 则带有明确业务或重型依赖。

## 根 shared 中的业务组件

| 当前组件 | 实际业务 | 建议位置 | 风险 |
| --- | --- | --- | --- |
| `src/components/FolderPicker.vue` | 仅 OSS 两页，且直连 FILES API/DTO | OSS 业务 components；先完成 P3B | Medium |
| `src/components/l-echart/**` | 仅族谱活动使用 | P0B 移除运行依赖；不提升 shared | High |
| `src/components/lime-echart/**` | 未发现活动引用的另一套 ECharts wrapper | P0B 复核后移除 | High |
| `src/components/family-tree/**` | 族谱专属，当前未引用 | 目标 record-tools/family-tree | Medium |
| `src/components/toolkit/business/qr-parser-panel.vue` | 仅 QR parser | QR 业务 components | Low |
| `src/components/toolkit/business/qr-generator-panel.vue` | QR、码包、磁力流程共用 | 目标工具分包 `_shared` 或 shared/toolkit | Medium |
| `src/components/toolkit/business/image-shuffle-panel.vue` | cipher、QR、磁力流程共用 | 目标工具分包 `_shared` 或 shared/toolkit | Medium |
| `src/components/mine-list-item.vue`、`confirm-dialog.vue` | 主包 mine + user setting | user 分包 `_shared` 或兼容 shared/ui | Medium |

## 静态资源边界

根 `src/static` 为 1,415,211 B，微信构建全部落入主包。活动 ECharts 资源 533,247 B；另有六个超过 50 KiB 且未发现源码引用的资源 702,354 B。业务图片（home、HSBC、order）留在根 static 会让所有用户承担下载/包体积成本，应在 P5 逐域确认后随包迁移或移除；A0 不做删除。

## 当前与目标分包差异

| 当前 | 目标 | 主要差异 | 推荐阶段 |
| --- | --- | --- | --- |
| `subPackages/tools`（43 页，924,500 B） | `image-tools`、`media-tools`、`memo`、`compendium`、`record-tools`、`utility-tools` | 当前所有工具共享一个加载边界 | P5A-P5F |
| `subPackages/services/memo`（未注册目录） | 唯一 `memo` 分包 | 旧副本不是真实分包却携带页面代码 | P0C / P6A |
| 根 `editor-core` + memo 内复制 core | memo 唯一 editor-core 真理源 | 两套相似文件和独立 demo 分包 | P6A |
| 根 components 业务实现 | 业务 components / 分包 `_shared` | OSS、族谱、QR panel 进入主依赖图 | P2 / P5 |
| 根 static 业务资源 | 业务分包 static/assets | 当前 1.415 MB 全在主包 | P0B / P5 |

## 问题登记

| ID | 问题 | 证据 | 影响范围 | 严重度 | 建议阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-H08 | 根组件混入业务与重型实现 | 上表 21 条显式 import | 主包/分包依赖 | High | P2/P5 | 是 |
| A0-H09 | 43 个工具页面仍是单一 tools 分包 | `pages.json:75-397`、构建 924,500 B | 加载与体积隔离 | High | P5A-P5G | 否 |
| A0-H04 | 未注册 services/memo 与活动 memo 并存 | 两目录文件清单 | memo 路由与模型 | High | P0C/P6A | 是 |
| A0-M12 | 根 static 包含大批业务/疑似无引用资源 | package-size-baseline.json | 微信主包 | Medium | P0B/P5 | 否 |
| A0-L03 | 当前未发现真实跨分包 import | subpackage-dependencies.json | 边界现状为正向基线 | Low | P9 建门禁 | 否 |
