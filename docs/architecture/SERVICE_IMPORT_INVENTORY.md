# A0 Apifox / services 边界审计

机器清单：`architecture-reports/service-imports.json`。扫描排除 `src/services/**` 自身，解析业务源码的 ES import/export 和 require；本阶段未修改生成区。

## 汇总

| 指标 | 数量 |
| --- | ---: |
| 直接 import `src/services` | 78 条 |
| 涉及业务文件 | 50 |
| 直接 import Apifox 生成区 | 61 条 / 34 文件 |
| 直接依赖 Apifox DTO | 17 条 / 17 文件 |
| 仅依赖手写 services 聚合/安全模块 | 17 条 |

“DTO”口径为从 Apifox `interface` 文件或以 `import type` 方式从生成模块导入。完整 specifier、类型导入标志和行号见 JSON。

## 按业务域

| 业务域 | services import | 文件数 | 生成区 import | DTO import | 直接引用文件 |
| --- | ---: | ---: | ---: | ---: | --- |
| compendium | 23 | 17 | 10 | 4 | src/subPackages/tools/compendium/swc/admin-list.vue<br>src/subPackages/tools/compendium/swc/character-picker.vue<br>src/subPackages/tools/compendium/swc/components/character-picker-panel.vue<br>src/subPackages/tools/compendium/swc/components/lineup-mapping-container-section.vue<br>src/subPackages/tools/compendium/swc/components/lineup-picker-panel.vue<br>src/subPackages/tools/compendium/swc/components/lineup-select-modal.vue<br>src/subPackages/tools/compendium/swc/composables/use-admin-lineup-list.ts<br>src/subPackages/tools/compendium/swc/detail.vue<br>src/subPackages/tools/compendium/swc/edit.vue<br>src/subPackages/tools/compendium/swc/lineup-edit.vue<br>src/subPackages/tools/compendium/swc/lineup-mapping-detail.vue<br>src/subPackages/tools/compendium/swc/lineup-mappings.vue<br>src/subPackages/tools/compendium/swc/lineup-meta.ts<br>src/subPackages/tools/compendium/swc/lineup-relations.vue<br>src/subPackages/tools/compendium/swc/lineups.vue<br>src/subPackages/tools/compendium/swc/list.vue<br>src/subPackages/tools/compendium/swc/utils.ts |
| memo | 13 | 7 | 13 | 2 | src/subPackages/services/memo/detail.vue<br>src/subPackages/services/memo/editor.vue<br>src/subPackages/services/memo/list.vue<br>src/subPackages/tools/memo/components/editor-core/components/ResourcePicker.vue<br>src/subPackages/tools/memo/detail.vue<br>src/subPackages/tools/memo/editor.vue<br>src/subPackages/tools/memo/list.vue |
| oss-upload | 6 | 3 | 5 | 1 | src/subPackages/tools/oss-upload/fileList.vue<br>src/subPackages/tools/oss-upload/index.vue<br>src/subPackages/tools/oss-upload/utils.ts |
| calendar | 4 | 3 | 4 | 0 | src/subPackages/tools/calendar/auspicious.vue<br>src/subPackages/tools/calendar/detail.vue<br>src/subPackages/tools/calendar/index.vue |
| image-stitch | 4 | 1 | 4 | 1 | src/subPackages/tools/image-stitch/index.vue |
| family-tree | 3 | 3 | 3 | 0 | src/subPackages/tools/family-tree/family-tree-chart.vue<br>src/subPackages/tools/family-tree/family-tree-list.vue<br>src/subPackages/tools/family-tree/member-detail.vue |
| utils | 3 | 2 | 3 | 1 | src/utils/autoLogin.ts<br>src/utils/wxLogin.ts |
| root-components | 2 | 1 | 2 | 1 | src/components/FolderPicker.vue |
| editor-core | 2 | 1 | 2 | 1 | src/editor-core/components/ResourcePicker.vue |
| main:mine | 2 | 1 | 2 | 1 | src/pages/mine/login/login.vue |
| stores | 2 | 1 | 2 | 1 | src/stores/mall.ts |
| chat | 2 | 2 | 2 | 0 | src/subPackages/tools/chat/index.vue<br>src/subPackages/tools/chat/list.vue |
| code-wallet | 2 | 1 | 2 | 1 | src/subPackages/tools/code-wallet/index.vue |
| game-coupons | 2 | 1 | 2 | 1 | src/subPackages/tools/game-coupons/index.vue |
| pdf-toolkit | 2 | 1 | 2 | 1 | src/subPackages/tools/pdf-toolkit/index.vue |
| pool-aim | 2 | 1 | 2 | 1 | src/subPackages/tools/pool-aim/index.vue |
| document-scan | 1 | 1 | 0 | 0 | src/subPackages/tools/document-scan/index.vue |
| image-compress | 1 | 1 | 0 | 0 | src/subPackages/tools/image-compress/index.vue |
| image-privacy | 1 | 1 | 0 | 0 | src/subPackages/tools/image-privacy/index.vue |
| watermark | 1 | 1 | 1 | 0 | src/subPackages/tools/watermark/index.vue |

## 边界观察

- compendium 数量最高（23 条 / 17 文件），其中大量阵容页面依赖手写 `src/services/compendium-lineups.ts`，四个图鉴页面直接依赖生成区。
- memo 的 13 条全部进入生成区，覆盖新旧两套页面及 memo 内复制的 ResourcePicker。
- OSS/file 能力从根 `FolderPicker.vue`、根 `editor-core/ResourcePicker.vue`、memo 复制内核和 OSS 页面同时直连 FILES DTO，组件与接口边界耦合。
- auth 入口分散在登录页、`autoLogin.ts`、`wxLogin.ts`；商城 Store 也直接暴露 Apifox DTO。
- `document-scan`、`image-compress`、`image-privacy` 依赖手写 `services/security`，虽非 DTO，但仍违反目标“业务只依赖 api adapter”的方向。

## 渐进迁移顺序

| 顺序 | 阶段 | 依据 | 风险 |
| ---: | --- | --- | --- |
| 1 | P3A auth | 入口少但覆盖登录、自动登录和微信登录；先固定鉴权模型 | High |
| 2 | P3B files / OSS | 根组件、editor-core、memo 和 OSS 多点共用，能先解除组件对 DTO 的耦合 | High |
| 3 | P3C calendar | 3 个页面、4 条 import，边界清晰，适合作为 mapper 模板 | Medium |
| 4 | P3D memo | 新旧实现并存，需与 P0C/P6A 的路由和模型决策协调 | High |
| 5 | P3E compendium | 量最大且含聚合层/DTO/管理页，放在已有模式稳定后迁移 | High |
| 6 | P3F 其他工具 | chat、coupons、PDF、image-stitch、watermark、商城等按域推进 | Medium |

## 问题登记

| ID | 问题 | 证据 | 影响范围 | 严重度 | 建议阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-H01 | 生成区缺少自动格式化保护 | `.eslintignore`、`.prettierignore`、`package.json:118-124` | 全部 Apifox 文件 | High | P0A | 是 |
| A0-H05 | 50 个业务文件直接依赖 services | 本表与 service-imports.json | 20 个业务域/基础层 | High | P3 | 否 |
| A0-H10 | 17 个业务文件直接暴露 Apifox DTO | `interface` / type import 行号见 JSON | 页面模型、Store、组件 | High | P3 | 否 |
| A0-M09 | 根组件和 editor-core 直接调用 FILES 生成 API | `FolderPicker.vue:3-4`、`editor-core/components/ResourcePicker.vue:114-115` | 组件复用与分包 | Medium | P2/P3B | 是（移动前） |
