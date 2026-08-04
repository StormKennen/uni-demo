# A0 当前架构基线审计

审计日期：2026-08-04  
基线提交：`362a1cd332682fa6a310d65d1ca6ee2b579f989b`  
范围：A0，只读审计；未执行 P0、P1 或后续阶段。

## 审计边界与方法

本报告来自对 `src/`、工程配置、锁文件及重新生成的双端构建产物的实际扫描。扫描脚本为 `scripts/audit/a0-scan.mjs`，只读取文件并向 stdout 输出 JSON，不写入项目。机器清单位于 `architecture-reports/`。

审计开始前工作区已有以下用户改动，本次未回退或覆盖：`docs/changelog.md`、`src/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox.ts`、`src/services/apifox/NODEJSDEMO/COMPENDIUMS/interface.ts`、`src/subPackages/tools/compendium/swc/list.vue`、删除 `uni-demo.zip`，以及未跟踪的 `scripts/audit/`。

## 基线摘要

| 项目 | 实测结果 |
| --- | ---: |
| 注册路由 | 51（主包 4，分包页面 47） |
| 分包根 | 4（`user`、`tools`、`editor-core`、`common`） |
| 工具注册路径 | 27，均已注册 |
| 跳转调用 | 86（navigateTo 69、redirectTo 8、switchTab 9、reLaunch 0） |
| Vue 文件 | 156 |
| TypeScript 文件 | 234 |
| 根 `src/components` Vue/UVue/NVue 组件 | 57 |
| 直接 import `src/services` 的业务文件 | 50（78 条 import） |
| 直接 import Apifox 生成区的业务文件 | 34（61 条 import） |
| 直接依赖 Apifox DTO 的业务文件 | 17（17 条 import） |
| 显式跨分包 import | 0 |
| 平台能力命中 | 1,023 次 / 99 文件 |
| 无条件编译保护的直接浏览器/微信 API 命中 | 68 次 / 20 文件 |
| `src/static` | 1,415,211 B / 86 文件 |
| H5 构建 | 3,781,832 B / 256 文件 |
| 微信构建 | 2,951,852 B / 616 文件 |
| 微信主包 | 1,943,826 B |
| 微信 `subPackages/tools` | 924,500 B |

## 构建与质量门禁实测

| 命令 | 结果 | 证据/说明 |
| --- | --- | --- |
| `pnpm build:h5` | 通过 | 2026-08-04 重新构建；存在 Sass、Browserslist 及动态/静态 import 警告 |
| `pnpm build:mp-weixin` | 通过 | 2026-08-04 重新构建；存在 Sass 警告、空 chunk、H5 标签选择器警告 |
| `pnpm type-check` | 失败 | `vue-tsc` 报 Volar 插件 API 不兼容、虚拟 `.vue.js` TS6504、TS5070 |
| `pnpm exec eslint --ext .js,.vue,.ts src` | 失败 | 388 个解析错误；仓库只有 `eslintrc.js`，ESLint 8 不会按默认规则加载该名称 |
| `pnpm test:tomato` | 失败 | Vite/uni 插件启动时缺少 `vuex/package.json` |
| `pnpm lint` | 未执行 | `package.json:5` 固定 `eslint --fix`，且生成区未排除；执行会违反 A0 只读约束 |

## 工具链兼容性结论

- `package.json:110,116` 声明 `typescript ^4.9.4`、`vue-tsc ^1.0.24`；锁文件实际为 TypeScript 4.9.5、vue-tsc 1.8.27、Vue 3.5.38。
- `tsconfig.json:11` 使用 `moduleResolution: "Bundler"`，但实装 TypeScript 4.9.5 不支持这一 TS 5.x 解析策略；`tsconfig.json:37` 的 uni-helper Volar 插件同时报告 API 版本不兼容。
- `eslintrc.js:1` 的注释自称 `.eslintrc.js`，但真实文件缺少前导点，导致 ESLint 实测未加载 Vue/TS parser。
- `.eslintignore`、`.prettierignore` 均未排除 `src/services/**`；`package.json:118-124` 的 lint-staged 会对生成区执行 `prettier --write`。
- 仅有 `test:tomato` 脚本；`src/engine/swc-damage-calculator/tests/index.spec.ts` 未纳入 package script。仓库未发现 CI workflow、路由检查、边界检查或包体积门禁。

## 核心结论

1. 当前路由真理源本身完整，但活动备忘录页面仍生成旧的未注册路径，分享链路可直接失效。
2. 构建可通过不等于质量门禁可用：类型检查、lint、单测三条现有门禁均失败。
3. 微信主包 1,943,826 B，其中根 `static` 占 1,415,211 B（72.8%）；ECharts 与疑似无引用资源是主要压力。
4. `subPackages/tools` 实际仍是一个 924,500 B 的大分包；目录看似按工具拆分，但不是独立 uni-app 分包。
5. 业务边界耦合明显：50 个业务文件直接依赖 services，平台调用分散，根 components 混有 OSS、族谱、ECharts 与工具业务组件。
6. 两套备忘录页面、两套 schema 编辑器内核和 26 个超过 800 行的 Vue 文件构成后续迁移的主要回归风险。

详细证据分别见同目录的其余八份报告及 `architecture-reports/*.json`。

## 问题登记

| ID | 问题 | 证据 | 影响 | 严重度 | 建议阶段 | 阻塞后续 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-B01 | 活动备忘录分享仍指向未注册旧路由 | `src/subPackages/tools/memo/detail.vue:2270`；`src/pages.json:45-74` | 微信分享落地失败 | Blocking | P0C | 是 |
| A0-B02 | typecheck、lint、现有单测均不可用 | `package.json:5,43-44`；`tsconfig.json:11,37`；`eslintrc.js:1` | 无法可靠验收后续重构 | Blocking | P0A 后接 P9 | 是 |
| A0-H01 | Apifox 生成区会被 lint/prettier 自动改写 | `.eslintignore:1-13`；`.prettierignore:1-13`；`package.json:118-124` | 生成代码漂移、冲突 | High | P0A | 是 |
| A0-H02 | 微信主包逼近上限且静态资源占 72.8% | `dist/build/mp-weixin`；`src/static/echarts.min.js` | 新增功能容易触发包体积失败 | High | P0B / P5 | 是 |
| A0-H03 | 族谱入口可见并携带 ECharts | `src/config/tools.ts:260-267`；`family-tree-chart.vue:270-271` | 与计划状态不一致、双端和体积风险 | High | P0B | 否 |
