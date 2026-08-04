# P0A-2 质量门禁基线

审计日期：2026-08-04  
开始基线：`ed8126c8eaf399e2b9ca25df13093b431ba70eaf`  
范围：P0A-2；未执行 P0B、P0C、P1 或后续阶段。

## 环境与版本组合

| 项目                      | 修改前                   | 修改后                           |
| ------------------------- | ------------------------ | -------------------------------- |
| Node.js                   | 25.6.0                   | 25.6.0                           |
| pnpm                      | 10.29.2                  | 10.29.2                          |
| TypeScript                | 4.9.5（声明 `^4.9.4`）   | 5.4.5（精确锁定）                |
| vue-tsc                   | 1.8.27（声明 `^1.0.24`） | 2.2.12（精确锁定）               |
| Vue                       | 3.5.38                   | 3.5.38（未调整）                 |
| Vite                      | 5.2.8                    | 5.2.8（未调整）                  |
| Vitest                    | 1.6.0                    | 1.6.0（未调整）                  |
| uni-app                   | 3.0.0-4050720250324001   | 3.0.0-4050720250324001（未调整） |
| @uni-helper/uni-app-types | 1.0.0-alpha.6            | 1.0.0-alpha.6（未调整）          |

锁文件中 uni-app 工具链同时包含 `@vue/compiler-sfc` 3.4.21，Vue 3.5.38 自身解析到 `@vue/compiler-sfc` 3.5.38；本阶段没有强行统一该既有传递依赖。

## 版本调整原因

修改前的组合存在三个可复现的不兼容点：

1. TypeScript 4.9.5 不支持 `tsconfig.json` 已启用的 `moduleResolution: "Bundler"`，并因此报告 TS5070。
2. `@uni-helper/uni-app-types@1.0.0-alpha.6` 的 peer dependency 要求 TypeScript `^5.0.0`，其 Volar 插件声明 API v2。
3. vue-tsc 1.8.27 使用 Vue/Volar language-core 1.x，只接受插件 API v1，启动时报告 `expected 1.x but got 2` 并生成错误的 `.vue.js` 根文件。

TypeScript 5.4.5 支持现有 tsconfig 选项；vue-tsc 2.2.12 使用 `@vue/language-core` 2.2.12 与 `@volar/typescript` 2.4.15，和 Volar v2 插件一致。Vue、uni-app 与 Vite 主版本均保持不变。

升级后还定位到 `src/components/PageLayout.vue` 的内联 `@back="emit('back')"` 会触发 vue-tsc/TypeScript 模板虚拟代码的内部 `getCheckFlags` 异常。将相同行为改为具名 `handleBack` 后，完整检查可稳定结束并输出真实诊断。

## TypeScript 结果

`pnpm type-check` 现在能够完成扫描，不再出现配置、Volar API 或 vue-tsc 内部崩溃；命令保留真实非零退出码，因为仓库存在历史类型错误。

| 指标                         | 数量 |
| ---------------------------- | ---: |
| 错误总数                     |  415 |
| `src/services/**` 生成区错误 |   56 |
| 其他手写源码错误             |  359 |

主要错误码：TS2339 202、TS2322 83、TS7005 35、TS7006 24、TS2304 21、TS2345 12。主要来源为 `src/subPackages/services` 166、`src/subPackages/tools` 77、`src/components` 62、`src/services` 56、`src/pages` 27。

生成区错误仅被记录，未修改 `src/services/**`。历史错误量不适合在 P0A-2 批量清理，建议后续建立独立的 TypeScript 债务收敛任务，并按业务域逐步减少基线。

## ESLint 结果

`pnpm lint` 已确认：

- 正确加载 `.eslintrc.cjs`；
- 只读运行，不含 `--fix`；
- `src/services/**` 的 ESLint `isPathIgnored` 为 `true`；
- 运行前后源码 diff 不变。

完整命令在 90 秒内仍卡在既有 `src/static/echarts.min.js`，没有完成输出。本阶段明确不处理 ECharts，因此没有把临时排除写入项目配置。只读诊断临时排除该单个文件后，统计如下：

| 指标                            |      数量 |
| ------------------------------- | --------: |
| errors                          |     5,253 |
| warnings                        |       467 |
| 有诊断文件                      | 187 / 270 |
| 被扫描的 `src/services/**` 文件 |         0 |

主要规则为 `prettier/prettier` 3,950、`block-spacing` 426、`semi` 256、`@typescript-eslint/no-unused-vars` 211、`object-curly-spacing` 204、`quotes` 196。主要目录为 `src/components` 1,936、`src/editor-core` 1,547、`src/static` 712、`src/utils` 673。

这些均为历史基线；本阶段没有运行 `pnpm lint:fix`、没有全仓库格式化，也没有为清零关闭规则。

## 单元测试结果

原 `pnpm test:tomato` 被 Vitest 自动加载到根 `vite.config.ts`，从而启动 `@dcloudio/vite-plugin-uni`。uni H5 SSR 配置经 `@dcloudio/uni-cli-shared/dist/resolve.js` 解析可选内置模块 `vuex/package.json`，最终在项目并不使用 Vuex 的情况下启动失败。错误不是 Pinia、算法源码或测试 mock 引入的，也不需要安装 Vuex。

新增独立的根 `vitest.config.ts`，只使用 Node 测试环境；`test:tomato` 显式指定该配置。测试启动后发现 Snake 路径实现按接口返回 `Uint32Array`，旧断言却直接与普通数组比较；测试现将切片通过 `Array.from` 归一化后继续校验原数值序列，没有修改算法或弱化断言。

| 命令               | 结果                                         |
| ------------------ | -------------------------------------------- |
| `pnpm test:tomato` | 通过，1 个文件、5 个测试                     |
| `pnpm test:run`    | 通过，2 个文件、9 个测试（Tomato 5 + SWC 4） |

仍有 Vite CJS Node API deprecation 警告，但不影响测试结果。

## 双端构建结果

| 命令                   | 结果 |
| ---------------------- | ---- |
| `pnpm build:mp-weixin` | 通过 |
| `pnpm build:h5`        | 通过 |

构建仍输出既有 Sass legacy API、Browserslist 数据过期、空 chunk、H5 动静态 import 等警告；本阶段仅记录，没有升级或重构相关依赖和业务。

## 最小门禁入口

新增 `pnpm test:run` 作为现有全部单元测试的统一入口。暂未增加 `pnpm check`：type-check 仍有 415 个历史错误，完整 lint 又受 ECharts 压缩产物阻塞，此时串行入口会在首个历史错误处退出，无法提供比独立命令更有效的门禁信息；同时不得使用 `|| true` 吞掉错误码。

## 剩余风险与后续阶段

- TypeScript 工具已恢复，但 415 个历史错误意味着目前还不能把零错误作为提交门禁；生成区 56 个错误必须通过 Apifox 模板或上游契约治理，不能手改。
- ESLint 配置和只读边界有效，但完整命令受 ECharts 压缩文件阻塞；处理方式属于后续明确授权的 ECharts/静态资源或工程门禁任务。
- lint 与 type-check 的历史问题不直接改变 P0C 的备忘录路由修复，但 P0C 必须保持改动极小，并至少复核错误基线没有新增、单元测试和双端构建继续通过。

结论：P0A-2 的“工具不再启动崩溃、输出真实错误、测试与双端构建恢复”验收已满足。可以在提交本阶段后进入 P0C，但不应把当前状态描述为质量门禁全绿。

## 回滚方式

提交后如需回滚，应使用 `git revert <P0A-2-commit>`，随后执行 `pnpm install --frozen-lockfile` 恢复依赖树。回滚范围包括 TypeScript/vue-tsc 版本与锁文件、`vitest.config.ts`、测试脚本、PageLayout 的具名 back 处理函数、Tomato 测试断言和本报告；不得单独回退 `src/services/**`，因为本阶段没有修改生成区。
