# P0C-1 路由一致性修复报告

执行日期：2026-08-04  
开始基线：`54f7d995fcaa1f5b77436e21f4ed4df40c59802a`  
范围：P0C-1；未执行 P0C-2、P0B、P1 或后续阶段。

## 当前活动备忘录路由

结论来自 `src/pages.json` 注册、`src/config/tools.ts` 工具入口、页面文件存在性及列表 → 编辑/详情调用链，不仅依据目录名称：

| 页面   | 唯一活动路由                     | 证据                                                               |
| ------ | -------------------------------- | ------------------------------------------------------------------ |
| 列表页 | `/subPackages/tools/memo/list`   | `pages.json` 已注册；工具注册表的 memo 入口指向该路径              |
| 详情页 | `/subPackages/tools/memo/detail` | `pages.json` 已注册；列表只读入口、编辑完成跳转均指向该路径        |
| 编辑页 | `/subPackages/tools/memo/editor` | `pages.json` 已注册；列表新建/owner 编辑及详情编辑入口均指向该路径 |

旧路径前缀为 `/subPackages/services/memo`，目标路径前缀为 `/subPackages/tools/memo`。`src/subPackages/services/memo/{list,detail,editor}.vue` 文件仍存在，但未在 `pages.json` 注册，属于旧实现副本；本阶段没有修改、删除、注册或合并它们。

## 修复的活动旧路径

所有修改都以已注册的 `/subPackages/tools/memo/detail` 为目标，并保留原 query 参数、ID、编码与分享行为：

| 文件                                    | 场景                                 | 修改                                                |
| --------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| `src/subPackages/tools/memo/list.vue`   | 当前列表页的备用 `viewMemo(id)` 跳转 | 旧详情路径 → 活动详情路径，保留 `id`                |
| `src/subPackages/tools/memo/detail.vue` | 富文本内部备忘录链接                 | 旧详情路径 → 活动详情路径，保留 `internalId`        |
| 同上                                    | 未登录时登录页 `redirectUrl`         | 回跳目标改为活动详情路径，继续 `encodeURIComponent` |
| 同上                                    | H5 海报生成目标 URL                  | 旧详情路径 → 活动详情路径，保留 `memoId`            |
| 同上                                    | H5 复制/弹窗分享链接                 | 旧详情路径 → 活动详情路径，保留 `memoId`            |
| 同上                                    | 微信 `onShareAppMessage` 卡片路径    | 旧详情路径 → 活动详情路径，保留 `memoId`            |

活动编辑器原有的只读重定向、保存后详情跳转已经使用 `/subPackages/tools/memo/detail`，无需修改。微信 `onShareTimeline` 使用 `query: id=...`，由当前详情页承接，也无需改变。

## 剩余旧路径分类

再次执行 `rg "subPackages/services/memo" src --glob '!src/services/**'` 后，活动页面中已无旧路径。剩余 14 处全部属于以下两类：

1. **未注册旧源码，10 处**：`src/subPackages/services/memo/detail.vue` 5 处、`editor.vue` 4 处、`list.vue` 1 处。它们属于未注册双实现，本阶段按约束不修改；路由门禁明确将该旧副本目录排除在“活动代码旧路径”检查之外。
2. **注释或文档，4 处**：`src/editor-core/README.md` 3 处、`src/editor-core/schemas/blocks/text-block.schema.ts` 注释 1 处。它们描述旧内核/类型背景，不会执行或发布为导航目标。

没有把已确认错误的旧路径加入动态 allowlist，也没有为了让搜索归零而改写历史文档或旧源码。

## 已分享旧链接的兼容风险

本次保证代码今后生成的微信分享卡片、H5 分享链接、登录回跳、内部备忘录链接和海报目标均使用活动路由。已经被用户收藏或转发的 `/subPackages/services/memo/detail?...` 仍有兼容风险，因为该路径没有注册，直接访问无法自然落到新详情页。

本阶段没有重新注册旧页面，也没有启用整套旧备忘录实现。若后续有真实历史链接访问证据，应在备忘录统一阶段评估一个轻量兼容入口，仅解析并转发原 query 到 `/subPackages/tools/memo/detail`，避免复活旧数据模型和编辑器。

## 路由检查脚本

新增 `scripts/check-routes.mjs` 与 `pnpm check:routes`。脚本只读执行，失败时返回非零退出码并输出文件与行号，当前检查：

1. `pages.json` 的 51 个注册页面无重复且对应 `.vue`/`.nvue`/`.uvue` 文件存在。
2. 工具注册表的 27 个应用内路径均已注册，查询参数在比较前剥离。
3. 活动源码中的 36 个静态分享路径均已注册。
4. 解析 `uni/wx.navigateTo`、`redirectTo`、`reLaunch`、`switchTab` 的静态或静态前缀路径；当前扫描 78 个调用。
5. `switchTab` 的静态目标同时必须属于 tabBar。
6. `/subPackages/services/memo` 不得出现在活动源码中。
7. 忽略 `src/services/**`、构建/系统目录、静态资源、审计历史文本及明确未注册的旧备忘录副本。
8. 内置自检可识别合成的未注册静态路径 `/subPackages/__missing__/probe`。

当前 `pnpm check:routes` 通过。21 个变量型调用无法仅靠静态字符串确认，脚本逐项输出文件、行号和表达式作为风险警告，不使用大范围通配允许清单。典型来源包括第三方 callback、登录运行时回跳、工具注册表驱动路径、H5 bridge、数据驱动的 mine 跳转和活动详情的 `targetUrl`；其中工具路径本身另由工具注册检查覆盖。

脚本基于源码文本解析，不执行应用，也不能证明服务器外链或持久化数据中动态路径的有效性；这类路径仍需运行时白名单或业务测试补充。

## 质量与构建结果

| 命令                                        | 结果                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm check:routes`                         | 通过；51 个注册页面、27 个工具路径、36 个分享路径、78 个导航调用     |
| `pnpm type-check`                           | 稳定完成，保持 P0A-2 历史基线：415 个错误，退出码 2，无工具崩溃      |
| `pnpm lint`                                 | 只读启动且未修改源码；90 秒仍被既有 `src/static/echarts.min.js` 阻塞 |
| 临时排除单个 ECharts 文件的只读 ESLint 统计 | 5,253 errors、467 warnings、`src/services/**` 扫描数 0               |
| `pnpm test:tomato`                          | 通过，5/5                                                            |
| `pnpm build:mp-weixin`                      | 通过                                                                 |
| `pnpm build:h5`                             | 通过                                                                 |
| `pnpm build:mp-toutiao`                     | 通过（仓库已有该命令）                                               |

构建仍有 P0A-2 已记录的 Sass legacy API、Browserslist、空 chunk 和动静态 import 警告；本阶段没有处理。

## 生成区与验收结论

`git diff -- src/services` 为空，`scripts/check-generated-boundary.mjs` 通过。没有修改 API、编辑器 schema/内核、路由注册结构、工具注册数据、族谱、ECharts、依赖版本或备忘录数据模型。

P0C-1 验收满足：活动备忘录新生成链接与页面跳转均和 `pages.json` 一致，路由门禁能发现未注册静态路径并已通过，微信/H5/抖音构建通过，旧实现保留且生成区未修改。

建议提交 P0C-1 后另开任务执行 P0C-2，处理凭证与仓库卫生；本次未读取、修改或迁移相关凭证配置。
