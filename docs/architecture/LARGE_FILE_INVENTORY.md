# A0 大文件与重复实现清单

机器清单：`architecture-reports/large-files.json`。

行数使用物理文本行口径；服务生成区参与总文件数量统计，但“最大 30 个源码文件”和阈值清单排除 `src/services/**`，避免生成 DTO 干扰业务规模判断。

## 数量与阈值

| 指标 | 数量 |
| --- | ---: |
| Vue/NVue/UVue | 156 |
| TypeScript/TSX | 234 |
| 全部扫描源码扩展 | 398 |
| Vue 超过 500 行 | 43 |
| Vue 超过 800 行 | 26 |
| 非 services TypeScript 超过 400 行 | 2 |

## 最大 30 个业务源码文件

| # | 文件 | 行 | 字节 | 业务域 |
| ---: | --- | ---: | ---: | --- |
| 1 | `src/subPackages/services/memo/editor.vue` | 7,245 | 212,363 | memo |
| 2 | `src/subPackages/tools/memo/detail.vue` | 3,826 | 114,693 | memo |
| 3 | `src/subPackages/services/memo/detail.vue` | 3,626 | 107,755 | memo |
| 4 | `src/subPackages/tools/game-coupons/index.vue` | 2,736 | 74,711 | game-coupons |
| 5 | `src/subPackages/tools/image-stitch/index.vue` | 2,563 | 72,172 | image-stitch |
| 6 | `src/subPackages/tools/family-tree/demo.vue` | 2,365 | 82,805 | family-tree |
| 7 | `src/subPackages/tools/compendium/swc/detail.vue` | 2,325 | 65,637 | compendium |
| 8 | `src/subPackages/tools/family-tree/family-tree-chart.vue` | 2,130 | 59,025 | family-tree |
| 9 | `src/subPackages/tools/pool-aim/index.vue` | 2,102 | 62,035 | pool-aim |
| 10 | `src/subPackages/tools/memo/editor.vue` | 1,882 | 55,120 | memo |
| 11 | `src/subPackages/tools/compendium/swc/admin-list.vue` | 1,421 | 45,937 | compendium |
| 12 | `src/subPackages/tools/compendium/swc/list.vue` | 1,397 | 40,519 | compendium |
| 13 | `src/subPackages/tools/memo/list.vue` | 1,283 | 34,997 | memo |
| 14 | `src/subPackages/tools/video-compress/index.vue` | 1,226 | 35,749 | video-compress |
| 15 | `src/subPackages/services/memo/list.vue` | 1,165 | 30,919 | memo |
| 16 | `src/subPackages/tools/calendar/auspicious.vue` | 1,084 | 30,441 | calendar |
| 17 | `src/subPackages/tools/compendium/swc/components/character-picker-panel.vue` | 1,010 | 29,050 | compendium |
| 18 | `src/subPackages/tools/compendium/swc/lineups.vue` | 943 | 26,393 | compendium |
| 19 | `src/subPackages/tools/oss-upload/index.vue` | 930 | 26,291 | oss-upload |
| 20 | `src/subPackages/tools/pdf-toolkit/index.vue` | 908 | 26,276 | pdf-toolkit |
| 21 | `src/subPackages/tools/code-wallet/index.vue` | 868 | 26,318 | code-wallet |
| 22 | `src/subPackages/tools/calendar/index.vue` | 844 | 21,296 | calendar |
| 23 | `src/subPackages/tools/image-watermark/index.vue` | 832 | 24,345 | image-watermark |
| 24 | `src/pages/mine/login/login.vue` | 827 | 22,967 | main:mine |
| 25 | `src/subPackages/tools/chat/index.vue` | 826 | 21,818 | chat |
| 26 | `src/subPackages/tools/compendium/swc/character-picker.vue` | 814 | 23,725 | compendium |
| 27 | `src/subPackages/tools/image-compress/index.vue` | 757 | 20,189 | image-compress |
| 28 | `src/subPackages/tools/oss-upload/fileList.vue` | 743 | 21,539 | oss-upload |
| 29 | `src/subPackages/tools/family-tree/family-tree-list.vue` | 736 | 18,083 | family-tree |
| 30 | `src/subPackages/tools/chat/list.vue` | 722 | 17,778 | chat |

## 超过 800 行的 Vue 文件

| # | 文件 | 行 | 字节 | 业务域 |
| ---: | --- | ---: | ---: | --- |
| 1 | `src/subPackages/services/memo/editor.vue` | 7,245 | 212,363 | memo |
| 2 | `src/subPackages/tools/memo/detail.vue` | 3,826 | 114,693 | memo |
| 3 | `src/subPackages/services/memo/detail.vue` | 3,626 | 107,755 | memo |
| 4 | `src/subPackages/tools/game-coupons/index.vue` | 2,736 | 74,711 | game-coupons |
| 5 | `src/subPackages/tools/image-stitch/index.vue` | 2,563 | 72,172 | image-stitch |
| 6 | `src/subPackages/tools/family-tree/demo.vue` | 2,365 | 82,805 | family-tree |
| 7 | `src/subPackages/tools/compendium/swc/detail.vue` | 2,325 | 65,637 | compendium |
| 8 | `src/subPackages/tools/family-tree/family-tree-chart.vue` | 2,130 | 59,025 | family-tree |
| 9 | `src/subPackages/tools/pool-aim/index.vue` | 2,102 | 62,035 | pool-aim |
| 10 | `src/subPackages/tools/memo/editor.vue` | 1,882 | 55,120 | memo |
| 11 | `src/subPackages/tools/compendium/swc/admin-list.vue` | 1,421 | 45,937 | compendium |
| 12 | `src/subPackages/tools/compendium/swc/list.vue` | 1,397 | 40,519 | compendium |
| 13 | `src/subPackages/tools/memo/list.vue` | 1,283 | 34,997 | memo |
| 14 | `src/subPackages/tools/video-compress/index.vue` | 1,226 | 35,749 | video-compress |
| 15 | `src/subPackages/services/memo/list.vue` | 1,165 | 30,919 | memo |
| 16 | `src/subPackages/tools/calendar/auspicious.vue` | 1,084 | 30,441 | calendar |
| 17 | `src/subPackages/tools/compendium/swc/components/character-picker-panel.vue` | 1,010 | 29,050 | compendium |
| 18 | `src/subPackages/tools/compendium/swc/lineups.vue` | 943 | 26,393 | compendium |
| 19 | `src/subPackages/tools/oss-upload/index.vue` | 930 | 26,291 | oss-upload |
| 20 | `src/subPackages/tools/pdf-toolkit/index.vue` | 908 | 26,276 | pdf-toolkit |
| 21 | `src/subPackages/tools/code-wallet/index.vue` | 868 | 26,318 | code-wallet |
| 22 | `src/subPackages/tools/calendar/index.vue` | 844 | 21,296 | calendar |
| 23 | `src/subPackages/tools/image-watermark/index.vue` | 832 | 24,345 | image-watermark |
| 24 | `src/pages/mine/login/login.vue` | 827 | 22,967 | main:mine |
| 25 | `src/subPackages/tools/chat/index.vue` | 826 | 21,818 | chat |
| 26 | `src/subPackages/tools/compendium/swc/character-picker.vue` | 814 | 23,725 | compendium |

## 超过 500 行的 Vue 文件

| # | 文件 | 行 | 字节 | 业务域 |
| ---: | --- | ---: | ---: | --- |
| 1 | `src/subPackages/services/memo/editor.vue` | 7,245 | 212,363 | memo |
| 2 | `src/subPackages/tools/memo/detail.vue` | 3,826 | 114,693 | memo |
| 3 | `src/subPackages/services/memo/detail.vue` | 3,626 | 107,755 | memo |
| 4 | `src/subPackages/tools/game-coupons/index.vue` | 2,736 | 74,711 | game-coupons |
| 5 | `src/subPackages/tools/image-stitch/index.vue` | 2,563 | 72,172 | image-stitch |
| 6 | `src/subPackages/tools/family-tree/demo.vue` | 2,365 | 82,805 | family-tree |
| 7 | `src/subPackages/tools/compendium/swc/detail.vue` | 2,325 | 65,637 | compendium |
| 8 | `src/subPackages/tools/family-tree/family-tree-chart.vue` | 2,130 | 59,025 | family-tree |
| 9 | `src/subPackages/tools/pool-aim/index.vue` | 2,102 | 62,035 | pool-aim |
| 10 | `src/subPackages/tools/memo/editor.vue` | 1,882 | 55,120 | memo |
| 11 | `src/subPackages/tools/compendium/swc/admin-list.vue` | 1,421 | 45,937 | compendium |
| 12 | `src/subPackages/tools/compendium/swc/list.vue` | 1,397 | 40,519 | compendium |
| 13 | `src/subPackages/tools/memo/list.vue` | 1,283 | 34,997 | memo |
| 14 | `src/subPackages/tools/video-compress/index.vue` | 1,226 | 35,749 | video-compress |
| 15 | `src/subPackages/services/memo/list.vue` | 1,165 | 30,919 | memo |
| 16 | `src/subPackages/tools/calendar/auspicious.vue` | 1,084 | 30,441 | calendar |
| 17 | `src/subPackages/tools/compendium/swc/components/character-picker-panel.vue` | 1,010 | 29,050 | compendium |
| 18 | `src/subPackages/tools/compendium/swc/lineups.vue` | 943 | 26,393 | compendium |
| 19 | `src/subPackages/tools/oss-upload/index.vue` | 930 | 26,291 | oss-upload |
| 20 | `src/subPackages/tools/pdf-toolkit/index.vue` | 908 | 26,276 | pdf-toolkit |
| 21 | `src/subPackages/tools/code-wallet/index.vue` | 868 | 26,318 | code-wallet |
| 22 | `src/subPackages/tools/calendar/index.vue` | 844 | 21,296 | calendar |
| 23 | `src/subPackages/tools/image-watermark/index.vue` | 832 | 24,345 | image-watermark |
| 24 | `src/pages/mine/login/login.vue` | 827 | 22,967 | main:mine |
| 25 | `src/subPackages/tools/chat/index.vue` | 826 | 21,818 | chat |
| 26 | `src/subPackages/tools/compendium/swc/character-picker.vue` | 814 | 23,725 | compendium |
| 27 | `src/subPackages/tools/image-compress/index.vue` | 757 | 20,189 | image-compress |
| 28 | `src/subPackages/tools/oss-upload/fileList.vue` | 743 | 21,539 | oss-upload |
| 29 | `src/subPackages/tools/family-tree/family-tree-list.vue` | 736 | 18,083 | family-tree |
| 30 | `src/subPackages/tools/chat/list.vue` | 722 | 17,778 | chat |
| 31 | `src/subPackages/services/memo/components/OptionsControlPanel.vue` | 718 | 21,303 | memo |
| 32 | `src/subPackages/tools/calendar/detail.vue` | 718 | 16,678 | calendar |
| 33 | `src/subPackages/tools/compendium/swc/edit.vue` | 657 | 19,258 | compendium |
| 34 | `src/components/toolkit/business/image-shuffle-panel.vue` | 651 | 17,580 | root-components |
| 35 | `src/subPackages/tools/video-gif/index.vue` | 651 | 17,522 | video-gif |
| 36 | `src/components/upload-card/index.vue` | 611 | 15,612 | root-components |
| 37 | `src/components/ga-select/ga-select.vue` | 588 | 14,976 | root-components |
| 38 | `src/components/toolkit/business/qr-generator-panel.vue` | 584 | 16,506 | root-components |
| 39 | `src/components/family-tree/family-tree-detail.vue` | 551 | 14,126 | root-components |
| 40 | `src/components/FolderPicker.vue` | 533 | 16,530 | root-components |
| 41 | `src/subPackages/common/webview/webview.vue` | 523 | 18,017 | webview |
| 42 | `src/subPackages/tools/compendium/swc/lineup-mappings.vue` | 516 | 14,101 | compendium |
| 43 | `src/components/l-echart/l-echart.vue` | 514 | 12,719 | root-components |

## 超过 400 行的 TypeScript / composable

| # | 文件 | 行 | 字节 | 业务域 |
| ---: | --- | ---: | ---: | --- |
| 1 | `src/subPackages/tools/memo/schemas.ts` | 454 | 15,432 | memo |
| 2 | `src/utilsH5/appDsBridge.ts` | 431 | 13,594 | utilsH5 |

## 高度相似与重复实现

使用去空白、去短行后的行集合 Jaccard 比较；百分比仅用于定位，最终归并必须比较行为和数据模型。

| 文件对 | 相似度 | 证据/结论 |
| --- | ---: | --- |
| services memo list / tools memo list | 87.3% | 502 / 575 个归一化行相同；旧目录未注册 |
| services memo detail / tools memo detail | 92.4% | 1,572 / 1,702；两者均含旧路径字符串 |
| services memo editor / tools memo editor | 11.2% | 旧编辑器 7,245 行，memo-v2 1,882 行，属于两套实现而非简单副本 |
| root / memo `AttachmentBlockRenderer.vue` | 75.7% | 两套 editor-core |
| root / memo `BlockHost.vue` | 100% | SHA-256 级完全重复 |
| root / memo `ImageBlockRenderer.vue` | 81.6% | 两套 editor-core |
| root / memo `MediaBlockRenderer.vue` | 76.1% | 两套 editor-core |
| root / memo `RouteBlockRenderer.vue` | 68.9% | 两套 editor-core |
| root / memo `TextBlockRenderer.vue` | 79.3% | 两套 editor-core |
| root / memo `schema-field.ts` | 100% | SHA-256 级完全重复 |

## 多套编辑器内核

- 旧 `src/subPackages/services/memo/editor.vue` 是 7,245 行的单体编辑器。
- 活动 `src/subPackages/tools/memo/editor.vue:2-5,381-382` 声明 memo-v2 schema 驱动架构，并引用 memo 内复制的 editor-core。
- 根 `src/editor-core` 有 20 个文件和独立 demo 分包；memo 内 `components/editor-core` 有 10 个文件，其中 2 个完全相同、其余 renderer 高度相似。
- 因此当前至少存在“旧单体编辑器 + 根 schema editor-core + memo 内复制 editor-core”三个演进层次、两个活动代码真理源。

## 疑似废弃目录/实现

| 路径 | 文件数 / 大小 | 判断 | 风险 |
| --- | --- | --- | --- |
| `src/subPackages/services/memo` | 8 / 404 KiB | 三个页面均未注册，仍含旧路由；高度疑似旧实现 | High，P0C/P6A 前不可直接删除 |
| `src/components/lime-echart` | 3 / 16 KiB | 未发现活动静态引用，另有 l-echart 在用 | High，P0B 复核 |
| `src/components/family-tree` | 4 / 48 KiB | 两 Vue 组件未引用，hooks 未被活动族谱使用 | Medium，P7 复核 |
| `src/appDebug` | 1 / 4 KiB | 未注册 debug Vue，且使用独立 layout-page | Low |
| 多个根 ga/form/step/certificate 组件 | 32 个未引用候选的一部分 | 可能为历史组件库或 easycom 动态使用 | Medium，P2A 逐项确认 |

## 问题登记

| ID | 问题 | 证据 | 影响范围 | 严重度 | 建议阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-H04 | 多套 memo 与 editor-core 真理源 | 相似度表、目录清单 | memo 数据/编辑/序列化 | High | P0C/P6A | 是 |
| A0-H07 | 26 个 Vue 文件超过 800 行 | 阈值表 | 多业务域回归面 | High | P6 | 否 |
| A0-M13 | 43 个 Vue 文件超过 500 行 | 阈值表 | 维护与测试成本 | Medium | P6 分批 | 否 |
| A0-M14 | 两个 TypeScript 文件超过 400 行 | `memo/schemas.ts`、`utilsH5/appDsBridge.ts` | schema/bridge 复杂度 | Medium | P6/P8 | 否 |
| A0-M01 | 疑似废弃目录与 32 个未引用组件 | 组件报告、上表 | 删除误判/主包噪声 | Medium | P2A | 否 |
