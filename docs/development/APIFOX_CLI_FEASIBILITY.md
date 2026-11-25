# Apifox CLI / 代码生成可行性核验（2026-11-09）

## 官方 CLI 能力边界

Apifox 官方 npm 包页面将 apifox-cli 定义为运行 Apifox 测试场景的命令行工具，示例为导出测试场景后执行 apifox run examples/sample.apifox-cli.json -r cli,html。它不是 OpenAPI 项目同步、接口目录读回或 TypeScript 代码生成器。因此不能把它接成 Swagger → Apifox import → TS 生成，也未安装该包或调用未公开私有 API。

参考：<https://www.npmjs.com/package/apifox-cli>（Apifox Team；核验版本 2.2.12）。该 npm CLI 还有有限的 module/debug-case 资源命令，但没有 OpenAPI 导入命令。

同步可通过另一项官方能力实现：Apifox OpenAPI REST API 提供 [导入 OpenAPI](https://apifox-openapi.apifox.cn/api-173409873) 与 [导出 OpenAPI](https://apifox-openapi.apifox.cn/api-173411997)。后端本地 Node CLI 已实现对此官方 API 的显式同步包装器：要求非敏感配置显式 projectId/branchId 和 tags allowlist，模板限定 SWCRune；只导入所选 tags 的 operation 与引用组件，不隐式导入全部 API；使用 KEEP_EXISTING、不删除、导入后回读 schema。这不是 apifox-cli 包的功能，且本地无实际配置，尚未对远端执行验证。令牌权限等同 Apifox 账号全部项目权限，应只从受保护凭据源提供。

## 当前生成配置与边界

- 插件模板：.vscode/autoApiGen.example.json；本地配置 .vscode/autoApiGen.json 需凭据，普通构建不应读取。
- 当前生成入口仍为 VS Code 插件，自定义模板定义了函数命名、Path/Query/Body 参数拼装。
- 生成请求继续 import @/services/http；业务页面直接使用生成方法。
- src/services/apifox/** 为插件生成区，禁止手工修补或 prettier。

## Rune API URL 为空的检查结果

- Rune 生成文件的 doc block 是 @url undefined undefined，@host 指向 project/undefined/apis/api-undefined；3 个函数的实际请求都为 http.get(空字符串, {}, config)，没有 query/body 参数。
- 同一生成目录的 FAMILIES API 使用相同插件模板，已有 @url GET /families/members 和 http.get('/families/members', ...)，其 baseURL 也是 undefined。因此模板的 baseURL undefined 本身不是空路径的原因；统一 http.ts 使用 VITE_APP_BASE_URL 提供运行时基础地址。
- 后端 swagger-export 中这三个 Rune operation 已有正确的 GET/POST、/compendiums/runes/... path、SWCRune tag 和 servers。OpenAPI 规范不是缺 URL。
- 示例模板 customReturn 由 options.apiPath 组装 URL、由 options.apiMethod 选择 http verb；它将 path 缺失时回退为 ''、method 缺失时回退为 get。生成产物里的空 path、GET 和 undefined 项目/API 标识说明插件此次拿到的 Rune API 元数据为空或来源不匹配。

安全读取的本地插件配置字段显示 projectId 为 7048425、输出目录为 /src/services；已有 FAMILIES 生成文件的 host 也指向 project 7048425，故 projectId 本身看起来一致。branchId 未配置/确认，且没有远端预读记录。最可能原因是 Rune API 还未导入该项目的目标分支，或插件生成时选了另一分支/空的API数据；这仍不是远端实测结论。先在 Apifox 确认分支并执行tag限定的同步预演/导入，再在 VS Code 选择同一项目分支生成；期望注释出现实际 method/path、host 有真实 project/API 标识，识图使用 http.upload、JSON评估使用 http.post。若仍为空，再检查插件当前版本传给模板的 options 字段，不要手改生成文件。

## 三个接口样例对照

比较后端当前 OpenAPI 与工作区已有 src/services/apifox/NODEJSDEMO/SWCRUNE/{apifox,interface}.ts（未读取凭据）：

| operationId | OpenAPI 请求/响应 | 当前生成结果问题 |
|---|---|---|
| getSwcRuneMetadata | GET + 必需 compendiumId query；metadata data object | 无 query、空 URL、Response 为 string |
| recognizeSwcRune | POST multipart image + compendiumId；识别结果 data object | 被生成成 GET 空 URL；无 multipart 参数；Response 为 string |
| evaluateSwcRune | POST JSON body；评估结果嵌套 data object | 被生成成 GET 空 URL；无 body；Response 为 string |

三项都不兼容，且插件当前按 method + path 生成方法名（如 postCompendiumsRunesEvaluate），并非 Swagger operationId。新页面 import 同目录 api.ts；其中手写适配层经 http.get / http.upload / http.post，保留统一请求层但未消费 Apifox 生成方法。当前页面调用点和手写适配层未改，生成文件未修改。

本轮已补齐后端 SWCRuneProperty、SWCRuneData、SWCRuneScoreMetadata、SWCRuneEvaluationResult 等 schema，覆盖统一 envelope、metadata、multipart 识图、JSON 评估及完整结果字段，并通过后端 contract test。尚未把更新后的 OpenAPI 导入目标 Apifox 分支，也未由插件重新生成前端文件；因此此处只证明契约文件完整，不能证明插件产物已经更新。

迁移不是“换一个 CLI 命令”：schema 已补齐；接下来仍要将三个端点导入已确认分支，由插件生成 Path/Query/multipart/JSON Body 与 data response 类型，核对 operationId 与 path-based 方法名映射，切换现有手写适配层并验证 http.ts 上传/响应解包和 TypeScript。官方 CLI 不提供 TS 生成，不替换插件生产生成器。

## 保留插件生成器的门槛

1. 维护者先在 Apifox GUI 确认 projectId/branchId，并在后端运行 CLI 的 --sync --dry-run 核对目标分支和新增候选；确认无路径冲突后再显式 --sync。同步用 KEEP_EXISTING 且不删除资源，既有接口不会自动覆盖。
2. 使用已有插件模板生成上述 3 个方法。
3. 比较 operationId、method、path、参数可选性、multipart/JSON Body、data 字段和方法签名。通过条件：调用仍走 http.ts、命名规则一致、业务调用点无需改动且 TypeScript 通过。
4. OpenAPI 远端同步已由官方 REST API wrapper 提供；TypeScript 文件生成仍只能用现有 VS Code 插件。只有出现官方支持的可复现 CLI 代码生成能力，且覆盖现有模板行为后，再评估替换；不以手写临时代码或未批准依赖替代生产生成器。

## 凭据追踪告警

Git 元数据显示 .vscode/autoApiGen.json 当前仍被索引跟踪且有未提交差异；.gitignore 中针对该路径的规则被注释。文档原称该文件已精确忽略，与现状不符。没有读取该文件内容或凭据值，也没有修改本地文件/索引。

维护者应撤销/轮换可能暴露的 Authorization 与 Cookie，确认本地差异归属后从索引移除并启用精确 ignore，再评估所有分支/标签/备份的历史风险。历史重写由仓库管理员在轮换后协调，不能以删除工作树文件代替轮换。

## 当前验证范围

后端只读 --generation-diff 对照 3 个既有 FAMILIES Path/Query/Body 方法均匹配；另对照 3 个新 Rune 方法发现 method/path、Query/multipart/JSON body 及 response DTO 不匹配。未改生成区。前端 pnpm type-check 与 pnpm lint 仍有大量失败，因此不能宣称类型门禁、Apifox 远端同步或全 CLI 生成通过。双仓审计见后端 docs/api-contract-cli-pipeline-audit.md。
