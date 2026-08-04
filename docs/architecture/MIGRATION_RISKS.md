# A0 迁移风险登记

以下结论均由本次仓库扫描或实测命令产生。Blocking/High 为下一阶段前必须显式处置或建立保护的风险。

| ID | 问题 | 证据文件与位置 | 影响范围 | 严重度 | 建议归属阶段 | 阻塞后续 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-B01 | 活动备忘录分享生成未注册旧路由 | `src/subPackages/tools/memo/detail.vue:2270`；`src/pages.json:45-74` | 微信分享、外部链接、路由一致性 | Blocking | P0C | 是 |
| A0-B02 | typecheck、lint、现有单测三条门禁均失败 | `package.json:5,43-44`；`tsconfig.json:11,37`；`eslintrc.js:1` | 所有后续重构验收 | Blocking | P0A（保护/拆分 lint）+ P9（完整修复） | 是 |
| A0-H01 | Apifox 生成区未排除自动修复/格式化 | `.eslintignore:1-13`；`.prettierignore:1-13`；`package.json:118-124` | `src/services/**` | High | P0A | 是 |
| A0-H02 | 微信主包 1,943,826 B，根 static 占 1,415,211 B | `dist/build/mp-weixin`；`architecture-reports/package-size-baseline.json` | 微信发布与后续增量 | High | P0B / P5 | 是 |
| A0-H03 | 族谱入口未隐藏且活动依赖 ECharts | `src/config/tools.ts:260-267`；`family-tree-chart.vue:270-271`；`demo.vue:43-44` | 工具目录、H5/微信包体积 | High | P0B | 否 |
| A0-H04 | 两套备忘录页面与两套 editor-core 真理源并存 | `subPackages/services/memo/**`；`subPackages/tools/memo/**`；`src/editor-core/**`；`tools/memo/components/editor-core/**` | 数据模型、序列化、自动保存 | High | P0C 后 P6A | 是 |
| A0-H05 | 50 个业务文件直接 import services，17 个文件直接依赖 Apifox DTO | `architecture-reports/service-imports.json` | API 契约升级和页面回归 | High | P3A-P3F | 否 |
| A0-H06 | 68 个直接平台 API 命中缺少条件编译上下文 | `architecture-reports/platform-api-usage.json`；高频为两套 memo detail、`share-app.vue`、`utils/loadFile.ts` | H5/微信运行时兼容 | High | P4 | 是（对应业务迁移前） |
| A0-H07 | 43 个 Vue 文件超过 500 行，26 个超过 800 行 | `architecture-reports/large-files.json` | 可维护性、回归面 | High | P6 | 否 |
| A0-H08 | 根 components 混入 OSS、族谱、ECharts、工具业务组件 | `FolderPicker.vue`；`components/family-tree/**`；`components/l-echart/**`；`components/toolkit/business/**` | 主包耦合与分包迁移 | High | P2 / P5 | 是（分包重组前） |
| A0-H09 | `subPackages/tools` 仍为单一 924,500 B 分包 | `src/pages.json:75-397`；构建产物统计 | 独立加载收益、域边界 | High | P5A-P5G | 否 |
| A0-M01 | 32 个根组件未发现显式 import 或精确标签引用 | `component-usage.json` | 死代码/动态 easycom 误删风险 | Medium | P2A | 否 |
| A0-M02 | 六个超过 50 KiB 的根静态资源未发现源码引用，共 702,354 B | `PACKAGE_SIZE_BASELINE.md` | 微信主包/H5 下载 | Medium | P0B / P5 | 否 |
| A0-M03 | 22 个动态路由调用不能仅靠字面扫描完全验证 | `route-map.json` | bridge、登录回跳、数据驱动菜单 | Medium | P0C / P9 | 否 |
| A0-M04 | H5 构建同时包含 bundled 与 static ECharts，合计 1,059,952 B | `dist/build/h5/assets/echarts.min.*.js`、`dist/build/h5/static/echarts.min.js`、`static/ecStat.min.js` | H5 首次加载/部署体积 | Medium | P0B | 否 |
| A0-M05 | Tomato 测试因缺少 `vuex/package.json` 无法启动，SWC 测试未纳入脚本 | `package.json:44`；`src/engine/swc-damage-calculator/tests/index.spec.ts` | 算法回归门禁 | Medium | P9 | 否 |
| A0-M06 | 依赖使用 caret 后锁定版本与声明基线漂移 | `package.json:79,110,116`；`pnpm-lock.yaml:106,212` | 可重复安装与兼容判断 | Medium | P0 工具链治理 / P9 | 否 |
| A0-M07 | H5 构建提示 storage/httpHeaders 动静态 import 不能拆 chunk | 构建日志；`src/utils/storage.ts`、`src/utils/httpHeaders.ts` | chunk 规划、潜在循环依赖 | Medium | P1 / P9 | 否 |
| A0-L01 | 构建出现 Sass legacy API、Browserslist 过期及空 chunk 警告 | 双端构建日志 | 开发体验、未来升级 | Low | P9 | 否 |
| A0-L02 | 族谱内部三个 `.vue` 未注册但属于 index 内部组件 | `family-tree/index.vue:48-50` | 路由扫描误报风险 | Low | P7 | 否 |

## 推荐顺序

下一步推荐 **P0A**。理由是当前 `src/services/**` 没有任何 ESLint/Prettier/lint-staged 保护，且 `pnpm lint` 是强制 `--fix`；在执行 P0B 或 P0C 的源码修改与提交验证前，应先建立生成区不可改写的安全边界，并把 lint 的只读检查与 fix 行为分离。

P0A 完成后建议顺序为 P0C（修复 Blocking 备忘录路由并建立路由门禁），再 P0B（隐藏族谱并移除 ECharts，释放主包体积）。本报告没有执行任何 P0 工作。
