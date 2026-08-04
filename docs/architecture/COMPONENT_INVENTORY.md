# A0 组件清单

机器清单：`architecture-reports/component-usage.json`。

统计范围为 `src/components` 下的 Vue、NVue、UVue 文件。引用口径为：解析到该文件的显式 import，加上 Vue 模板中的精确 PascalCase/kebab-case 标签；同一文件内的 import 与标签会分别计为使用次数。动态组件字符串、运行时注册和第三方 easycom 规则不能完全静态证明，因此“未引用”只表示未发现静态证据，删除前仍须在 P2A 复核。

## 分类汇总

| 分类 | 数量 |
| --- | ---: |
| 单一业务组件 | 9 |
| 全局基础 UI | 9 |
| 未引用组件 | 32 |
| 分包内共享组件 | 1 |
| 工具平台通用组件 | 6 |

## 全量组件使用关系

“引用文件 / 使用次数”列保留每个引用文件；“文件数 / 次数”分别表示引用文件数量与 import/标签总命中数。

| 当前路径 | 引用文件（次数） | 文件数 / 次数 | 业务域 | 分类 | 建议目标位置 | 迁移风险 |
| --- | --- | ---: | --- | --- | --- | --- |
| `src/components/FolderPicker.vue` | src/subPackages/tools/oss-upload/fileList.vue (2)<br>src/subPackages/tools/oss-upload/index.vue (2) | 2 / 4 | oss-upload | 单一业务组件 | 对应业务域 components（oss-upload） | Low |
| `src/components/PageLayout.vue` | src/editor-core/demo/SchemaEditorDemo.vue (1)<br>src/pages.json (1)<br>src/pages/index/index.vue (1)<br>src/pages/mine/login/login.vue (1)<br>src/pages/mine/mine.vue (1)<br>src/pages/tools/index.vue (1)<br>src/subPackages/services/memo/detail.vue (1)<br>src/subPackages/services/memo/editor.vue (1)<br>src/subPackages/services/memo/list.vue (1)<br>src/subPackages/tools/calendar/auspicious.vue (1)<br>src/subPackages/tools/calendar/detail.vue (1)<br>src/subPackages/tools/calendar/festivals.vue (1)<br>src/subPackages/tools/calendar/index.vue (1)<br>src/subPackages/tools/chat/index.vue (1)<br>src/subPackages/tools/chat/list.vue (1)<br>src/subPackages/tools/code-wallet/index.vue (1)<br>src/subPackages/tools/compendium/swc/admin-list.vue (1)<br>src/subPackages/tools/compendium/swc/character-picker.vue (1)<br>src/subPackages/tools/compendium/swc/detail.vue (1)<br>src/subPackages/tools/compendium/swc/edit.vue (1)<br>src/subPackages/tools/compendium/swc/index.vue (1)<br>src/subPackages/tools/compendium/swc/lineup-edit.vue (1)<br>src/subPackages/tools/compendium/swc/lineup-mapping-detail.vue (1)<br>src/subPackages/tools/compendium/swc/lineup-mappings.vue (1)<br>src/subPackages/tools/compendium/swc/lineup-relations.vue (1)<br>src/subPackages/tools/compendium/swc/lineups.vue (1)<br>src/subPackages/tools/compendium/swc/list.vue (1)<br>src/subPackages/tools/document-scan/index.vue (1)<br>src/subPackages/tools/family-tree/demo.vue (1)<br>src/subPackages/tools/family-tree/index.vue (1)<br>src/subPackages/tools/game-coupons/index.vue (1)<br>src/subPackages/tools/image-cipher/index.vue (1)<br>src/subPackages/tools/image-compress/index.vue (1)<br>src/subPackages/tools/image-format/index.vue (1)<br>src/subPackages/tools/image-privacy/index.vue (1)<br>src/subPackages/tools/image-stitch/index.vue (1)<br>src/subPackages/tools/image-watermark/index.vue (1)<br>src/subPackages/tools/magnet-link/index.vue (1)<br>src/subPackages/tools/markdown/index.vue (1)<br>src/subPackages/tools/memo/detail.vue (1)<br>src/subPackages/tools/memo/editor.vue (1)<br>src/subPackages/tools/memo/list.vue (1)<br>src/subPackages/tools/oss-upload/fileList.vue (1)<br>src/subPackages/tools/oss-upload/index.vue (1)<br>src/subPackages/tools/pdf-toolkit/index.vue (1)<br>src/subPackages/tools/pool-aim/index.vue (1)<br>src/subPackages/tools/qr-generator/index.vue (1)<br>src/subPackages/tools/qr-parser/index.vue (1)<br>src/subPackages/tools/schema-demo/list.vue (1)<br>src/subPackages/tools/video-compress/index.vue (1)<br>src/subPackages/tools/video-gif/index.vue (1)<br>src/subPackages/tools/watermark/index.vue (1)<br>src/subPackages/user/setting/setting.vue (1) | 53 / 53 | editor-core、pages.json、main:index、main:mine、main:tools、memo、calendar、chat、code-wallet、compendium、document-scan、family-tree、game-coupons、image-cipher、image-compress、image-format、image-privacy、image-stitch、image-watermark、magnet-link、markdown、oss-upload、pdf-toolkit、pool-aim、qr-generator、qr-parser、schema-demo、video-compress、video-gif、watermark、setting | 全局基础 UI | src/shared/ui/PageLayout.vue | High |
| `src/components/ThemeRoot.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/button-item.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/card/index.vue` | src/components/certificate-card/base.vue (1)<br>src/components/upload-card/index.vue (1) | 2 / 2 | root-components | 单一业务组件 | 保留根组件，P2A 复核归属 | Low |
| `src/components/certificate-card/base.vue` | src/components/certificate-card/hook.ts (1)<br>src/components/certificate-card/index.vue (1)<br>src/components/certificate-card/multifile.vue (1) | 3 / 3 | root-components | 单一业务组件 | 保留根组件，P2A 复核归属 | Medium |
| `src/components/certificate-card/index.vue` | src/components/certificate-card/hook.ts (1) | 1 / 1 | root-components | 单一业务组件 | 保留根组件，P2A 复核归属 | Low |
| `src/components/certificate-card/multifile.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/check-radio/index.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/confirm-dialog.vue` | src/subPackages/user/setting/setting.vue (2) | 1 / 2 | setting | 全局基础 UI | src/shared/ui/confirm-dialog.vue | Low |
| `src/components/date-range-picker/date-range-picker.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/download-popup/download-popup.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/empty-data.vue` | src/subPackages/tools/code-wallet/index.vue (1)<br>src/subPackages/tools/pdf-toolkit/index.vue (2) | 2 / 3 | code-wallet、pdf-toolkit | 全局基础 UI | src/shared/ui/empty-data.vue | Low |
| `src/components/family-tree/family-tree-detail.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | High |
| `src/components/family-tree/family-tree-node.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | High |
| `src/components/footer/OneBtn.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/form/item.vue` | src/components/certificate-card/base.vue (2)<br>src/components/certificate-card/index.vue (1)<br>src/components/certificate-card/multifile.vue (1)<br>src/components/download-popup/download-popup.vue (1)<br>src/components/upload-card/index.vue (1) | 5 / 6 | root-components | 单一业务组件 | 保留根组件，P2A 复核归属 | Medium |
| `src/components/ga-calendar/ga-calendar.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/ga-check/ga-check.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/ga-checkbox/ga-checkbox.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/ga-confirm-popup.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/ga-date-picker/ga-date-picker.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/ga-picker/ga-picker.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/ga-province/ga-province.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/ga-select/ga-select.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/ga-tags/ga-tags.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/guide-card.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/h5-tab-bar.vue` | src/pages/index/index.vue (2)<br>src/pages/mine/mine.vue (2)<br>src/pages/tools/index.vue (2) | 3 / 6 | main:index、main:mine、main:tools | 全局基础 UI | src/shared/ui/h5-tab-bar.vue | Medium |
| `src/components/l-echart/l-echart.uvue` | src/components/lime-echart/lime-echart.vue (1)<br>src/subPackages/tools/family-tree/demo.vue (1)<br>src/subPackages/tools/family-tree/family-tree-chart.vue (1) | 3 / 3 | root-components、family-tree | 单一业务组件 | 对应业务域 components（family-tree） | High |
| `src/components/l-echart/l-echart.vue` | src/components/lime-echart/lime-echart.vue (1)<br>src/subPackages/tools/family-tree/demo.vue (2)<br>src/subPackages/tools/family-tree/family-tree-chart.vue (2) | 3 / 5 | root-components、family-tree | 单一业务组件 | 对应业务域 components（family-tree） | High |
| `src/components/layout-page.vue` | src/appDebug/debug.vue (2) | 1 / 2 | appDebug | 单一业务组件 | 对应业务域 components（appDebug） | Low |
| `src/components/lime-echart/lime-echart.nvue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | High |
| `src/components/lime-echart/lime-echart.uvue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | High |
| `src/components/lime-echart/lime-echart.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | High |
| `src/components/mine-list-item.vue` | src/pages/mine/mine.vue (3)<br>src/subPackages/user/setting/setting.vue (2) | 2 / 5 | main:mine、setting | 分包内共享组件 | 目标工具分包 _shared/mine-list-item.vue | Low |
| `src/components/nav-bar-base.vue` | src/components/layout-page.vue (2)<br>src/components/nav-bar.vue (2)<br>src/pages/index/index.vue (2)<br>src/pages/tools/index.vue (2) | 4 / 8 | root-components、main:index、main:tools | 全局基础 UI | src/shared/ui/nav-bar-base.vue | Medium |
| `src/components/nav-bar.vue` | src/components/PageLayout.vue (2) | 1 / 2 | root-components | 全局基础 UI | src/shared/ui/nav-bar.vue | Low |
| `src/components/new-confirm-dialog.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/no-more.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/platform-restriction-notice.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/popup.vue` | src/components/certificate-card/index.vue (1)<br>src/components/certificate-card/multifile.vue (1)<br>src/components/download-popup/download-popup.vue (1)<br>src/components/toolkit/base/tool-sheet.vue (1)<br>src/components/upload-card/index.vue (1)<br>src/components/upload-popup/index.vue (1) | 6 / 6 | root-components | 全局基础 UI | src/shared/ui/popup.vue | Medium |
| `src/components/privacy-popup.vue` | src/components/PageLayout.vue (2) | 1 / 2 | root-components | 全局基础 UI | src/shared/ui/privacy-popup.vue | Low |
| `src/components/radio-select/radio-select.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/share-app.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/simple-table/index.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/step-bar/index.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/toolkit/base/flow-action-bar.vue` | src/subPackages/tools/magnet-link/index.vue (2)<br>src/subPackages/tools/qr-generator/index.vue (2)<br>src/subPackages/tools/qr-parser/index.vue (2) | 3 / 6 | magnet-link、qr-generator、qr-parser | 工具平台通用组件 | src/shared/toolkit/flow-action-bar.vue | Medium |
| `src/components/toolkit/base/tool-action-row.vue` | src/components/toolkit/business/image-shuffle-panel.vue (3)<br>src/components/toolkit/business/qr-generator-panel.vue (2) | 2 / 5 | root-components | 工具平台通用组件 | src/shared/toolkit/tool-action-row.vue | Low |
| `src/components/toolkit/base/tool-section-card.vue` | src/components/toolkit/business/image-shuffle-panel.vue (3)<br>src/components/toolkit/business/qr-generator-panel.vue (4)<br>src/components/toolkit/business/qr-parser-panel.vue (4)<br>src/subPackages/tools/pdf-toolkit/index.vue (7) | 4 / 18 | root-components、pdf-toolkit | 工具平台通用组件 | src/shared/toolkit/tool-section-card.vue | Medium |
| `src/components/toolkit/base/tool-sheet.vue` | src/subPackages/tools/magnet-link/index.vue (3)<br>src/subPackages/tools/qr-generator/index.vue (2) | 2 / 5 | magnet-link、qr-generator | 工具平台通用组件 | src/shared/toolkit/tool-sheet.vue | Low |
| `src/components/toolkit/business/image-shuffle-panel.vue` | src/subPackages/tools/image-cipher/index.vue (2)<br>src/subPackages/tools/magnet-link/index.vue (2)<br>src/subPackages/tools/qr-generator/index.vue (2) | 3 / 6 | image-cipher、magnet-link、qr-generator | 工具平台通用组件 | src/shared/toolkit/image-shuffle-panel.vue | Medium |
| `src/components/toolkit/business/qr-generator-panel.vue` | src/subPackages/tools/code-wallet/index.vue (2)<br>src/subPackages/tools/magnet-link/index.vue (2)<br>src/subPackages/tools/qr-generator/index.vue (2) | 3 / 6 | code-wallet、magnet-link、qr-generator | 工具平台通用组件 | src/shared/toolkit/qr-generator-panel.vue | Medium |
| `src/components/toolkit/business/qr-parser-panel.vue` | src/subPackages/tools/qr-parser/index.vue (2) | 1 / 2 | qr-parser | 单一业务组件 | 对应业务域 components（qr-parser） | Low |
| `src/components/upload-card/index.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/upload-popup/index.vue` | src/components/certificate-card/index.vue (2)<br>src/components/certificate-card/multifile.vue (2)<br>src/components/upload-card/index.vue (2) | 3 / 6 | root-components | 全局基础 UI | src/shared/ui/index.vue | Medium |
| `src/components/vertical-steps/index.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |
| `src/components/vertical-steps/item.vue` | — | 0 / 0 | — | 未引用组件 | P2A 复核动态引用后删除或归档 | Medium |

## 重复或职责重叠

| 组合 | 证据 | 影响 | 严重度 | 建议阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- |
| `PageLayout.vue` / `layout-page.vue` | 前者 53 个引用文件；后者仅 `appDebug/debug.vue` | 两套页面壳命名和行为并存 | Medium | P2B | 否 |
| `nav-bar.vue` / `nav-bar-base.vue` | `PageLayout.vue:8` 使用 nav-bar；首页/工具页直接使用 nav-bar-base | 导航壳层职责重叠 | Medium | P2B | 否 |
| `confirm-dialog.vue` / `new-confirm-dialog.vue` / `ga-confirm-popup.vue` | 仅 confirm-dialog 发现 setting 使用；后两者未发现活动静态引用 | 删除误判与 API 分叉 | Medium | P2A/P2B | 否 |
| `popup.vue` / `download-popup` / `upload-popup` | popup 被根组件使用，download-popup 未引用，upload-popup 仅被上传/证件链使用 | 弹层职责和业务流程混杂 | Medium | P2B/P2C | 否 |
| `empty-data.vue` / `no-more.vue` | empty-data 有 2 个业务域；no-more 无引用 | 空态/结束态命名不统一 | Low | P2B | 否 |
| `l-echart` / `lime-echart` | family-tree 两处 import l-echart；lime-echart 三个跨端实现无活动静态引用 | 两套 ECharts 包装与根包负担 | High | P0B | 是 |
| 根 `components/family-tree` / 分包 `family-tree-*.vue` | 根两组件未引用，分包仍使用 ECharts chart/list | 新旧族谱渲染方向并存 | High | P0B/P7 | 否 |
| `toolkit/business/qr-generator-panel` 与独立 QR 页面 | panel 被 code-wallet、magnet-link、qr-generator 使用 | 具备平台通用价值，但当前位于根业务组件区 | Medium | P2C/P5 | 否 |

## 归属建议

- 全局基础 UI：PageLayout、导航、基础弹层、空态、H5 tab 和隐私弹窗；迁移时保留兼容包装，避免一次修改 53 个页面。
- 工具平台通用：`components/toolkit/base` 及跨多个工具使用的 business panel，目标为 `shared/toolkit`。
- 分包内共享：只在一个目标分包的多个业务域复用时进入该分包 `_shared`，不应继续放根 components。
- 单一业务：`FolderPicker.vue` 应随 OSS；ECharts/族谱组件应留在族谱域；`qr-parser-panel` 应随 QR 工具域。
- 未引用：32 个候选必须结合 easycom 构建产物和运行时注册二次确认；本阶段不删除。

## 问题登记

| ID | 问题 | 证据 | 影响范围 | 严重度 | 建议阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-H08 | 根 components 混有 OSS、族谱、ECharts 和工具业务实现 | FolderPicker、family-tree、l-echart、toolkit/business | 主包与分包边界 | High | P2/P5 | 是 |
| A0-M01 | 32 个组件未发现静态引用 | 上表及 component-usage.json | 死代码与误删风险 | Medium | P2A | 否 |
| A0-M08 | 基础 UI 存在多套职责重叠组件 | 对话框、导航、弹层组合 | 组件 API 与迁移成本 | Medium | P2B | 否 |
