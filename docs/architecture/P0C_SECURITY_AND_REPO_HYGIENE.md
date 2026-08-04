# P0C-2 凭证安全与仓库卫生报告

执行日期：2026-08-04

开始基线：`70b53182ac00892a528bab1649b275ee5f22722b`

范围：P0C-2；未执行 P0B、P1 或后续阶段。

## 扫描范围

本阶段检查当前 Git 跟踪文件、根配置、`.env*`、`.vscode`、Git Hooks、构建与发布脚本、压缩包及可访问的相关 Git 历史。当前工作树检查排除 `src/services/**` 中的普通生成字段，凭证命中只输出文件位置和规则名称，不输出实际值。

## 凭证风险与处理

| 风险 | 证据 | 当前处理 | 严重程度 |
| --- | --- | --- | --- |
| VS Code Apifox 插件本地配置包含真实凭证 | `.vscode/autoApiGen.json` | 从 Git 索引移除、本地保留；加入 `.gitignore`；新增空敏感字段模板 | Blocking（当前文件已隔离，轮换仍需人工确认） |
| 已删除的根 Apifox 配置曾包含凭证 | `git log --all -- apifox.config.js` | 当前工作树不存在；不恢复、不重写历史 | Blocking（历史风险） |
| 项目 ZIP 快照包含旧 Apifox 配置和硬编码 Bearer | `uniapp_project_p0.zip` | 已确认是可再生项目副本并从仓库删除 | High |
| 既有请求头工具会在运行时打印令牌前缀 | `src/utils/httpHeaders.ts:35-36` | 本阶段禁止修改业务源码，记录为后续安全清理项 | High |

报告不展示任何凭证或片段。用户仍需在 Apifox 平台撤销旧令牌、创建新令牌并只写入本地 `.vscode/autoApiGen.json`。本阶段不声明平台侧轮换已经完成，也不执行 `git filter-repo`、BFG 或 force push；是否清理历史由仓库管理员另行决定。

## 当前文件治理

- `.vscode/autoApiGen.json`：本地私有文件，插件功能继续保留，不再由 Git 跟踪。
- `.vscode/autoApiGen.example.json`：可提交模板，保留项目 ID、输出目录、生成模板和选项，`Authorization` 与 `Cookie` 为空。
- `apifox.config.js`：开始基线已删除，本阶段不恢复。
- `.env.development`、`.env.test`、`.env.production`：作为 `loadEnv(mode, process.cwd())` 使用的团队共享 mode 配置继续跟踪；三者均与开始基线一致，只包含可公开的 `VITE_*` 值。
- `.env.example`：保留源码实际读取的前端公开变量名和空值，用于创建本地覆盖文件；没有 Apifox 令牌或其他秘密。

## 环境变量清单

所有现有运行时变量均通过 `import.meta.env` 暴露给前端，因此只能保存公开配置，不能保存 Authorization、Secret、Token、密码或私钥。

| 变量 | 用途 | 敏感性 |
| --- | --- | --- |
| `VITE_APP_ENV` | 运行环境标识 | 公开 |
| `VITE_APP_BASE_URL` | 前端 API 基础地址 | 公开 |
| `VITE_APP_H5_URL` | H5 应用地址 | 公开 |
| `VITE_APP_OSS_HOST` | OSS 公开服务地址 | 公开 |
| `VITE_APP_CDN_OSS_BUSINESS` | 业务 CDN 地址 | 公开 |
| `VITE_PUBLIC_THIS_H5_URL` | 当前 H5 分享/访问地址 | 公开 |
| `VITE_RECOMMEND_BUSINESS_GOODS_ID` | 推荐商品公开标识 | 公开 |
| `VITE_APP_CDP_HOST` | CDP 公开服务地址 | 公开 |
| `VITE_E_SIGN_URL` | 电子签公开页面地址 | 公开 |

Apifox 插件仍使用其本地 JSON 配置字段；在未验证插件支持环境变量或 Secret Storage 前，不强行改变格式，也不虚构 `APIFOX_*` 环境变量。

## `.gitignore` 与仓库垃圾

新增或规范了 `node_modules/`、`dist/`、`unpackage/`、`.env.local`、`.env.*.local`、`__MACOSX/`、`.DS_Store`、压缩包、coverage、Vite/cache/temp 目录，以及精确的 `.vscode/autoApiGen.json`。共享的 `.env.development`、`.env.test`、`.env.production` 不被忽略；也没有忽略整个 `.vscode/`、`src/static/**`、架构报告、锁文件或测试夹具。

删除 `uniapp_project_p0.zip`：该文件为 2,220,794 字节、733 个条目的完整项目压缩副本，包含已删除的旧 Apifox 配置和硬编码 Bearer。未删除 ECharts、族谱、备忘录实现或业务静态资源。

仓库外或不受 Git 跟踪的开发者文件没有被清理。

## 安全门禁能力与限制

- `pnpm check:secrets`：扫描当前 Git 索引及未忽略的待提交文件，检查本地 Apifox 配置、私有 `.env`、硬编码 Bearer、私钥、明显敏感赋值及敏感 `VITE_` 变量；共享 mode 文件额外限制为公开 `VITE_*` 变量；不打印命中值，不扫描进程环境变量，并排除 `src/services/**` 的普通生成字段。
- `pnpm check:repo`：检查被跟踪的本地 Apifox 配置、私有 `.env`、压缩包、构建产物、系统垃圾、临时文件和异常根目录大文件，同时允许三份明确的团队共享 mode 配置。
- 两个脚本均只读，命中时返回非零状态，不修改工作树或 Git 索引。
- 当前文件门禁不能证明历史凭证已撤销，也不能扫描远端平台、Issue、CI Secret 或未跟踪的本地配置内容。
- 动态拼接的请求头（例如 ``Bearer ${token}``）不属于硬编码凭证，不会被误报；这不代表运行时日志可以输出令牌片段。

## 验证结果

| 命令 | 结果 |
| --- | --- |
| `pnpm check:generated-boundary` | 通过；工作区和索引中的 `src/services/**` 无变化 |
| `pnpm check:secrets` | 通过；扫描 587 个 Git 跟踪及待提交文件；三份共享 mode 配置仅含公开 `VITE_*` 变量 |
| `pnpm check:repo` | 通过；扫描 587 个 Git 跟踪及待提交文件 |
| `pnpm check:routes` | 通过；51 个注册页面、27 个工具路径、36 个分享路径、78 个导航调用 |
| `pnpm type-check` | 稳定执行；415 个既有错误，和 P0A-2/P0C-1 基线一致 |
| `pnpm lint` | 只读启动；运行 90 秒仍阻塞于既有 `src/static/echarts.min.js`，人工终止；未产生源码变化，和当前基线一致 |
| `pnpm test:tomato` | 通过；5/5 |
| `pnpm build:mp-weixin-test` | 通过；关键接口地址 `undefined` 扫描无命中 |
| `pnpm build:mp-weixin-prod` | 通过；关键接口地址 `undefined` 扫描无命中 |
| `pnpm build:h5-test` | 通过；关键接口地址 `undefined` 扫描无命中 |
| `pnpm build:h5-prod` | 通过；关键接口地址 `undefined` 扫描无命中 |

双端构建仍报告既有 Sass legacy API、Browserslist、空 chunk 和动静态 import 警告；本阶段没有升级依赖或处理 ECharts。构建产物的明显 Bearer、私钥和 Apifox 敏感变量扫描未发现命中。

## 验收结论

仓库侧 P0C-2 验收满足：本地 Apifox 配置保留但不再跟踪，脱敏模板可提交，当前跟踪及待提交文件没有真实 Bearer；团队共享 mode 配置继续跟踪且只包含公开 `VITE_*` 值，本地覆盖配置已私有化；安全与仓库卫生检查通过，生成区无差异，质量结果不低于当前基线且双端构建通过。未执行 P0B、P1 或其他阶段。

外部平台状态无法由仓库验证。进入 P0B 前，用户仍应确认 Apifox 旧令牌已完成撤销或轮换；否则 Git 历史风险仍为 Blocking。
