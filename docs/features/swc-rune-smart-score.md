# 魔灵召唤·符文智能评分 需求规格书

## 0. 元信息

| 项       | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| 功能名称 | 符文智能评分                                                                     |
| 所属域   | `subPackages/tools/compendium/swc`                                               |
| 发布端   | H5 + mp-weixin                                                                   |
| 状态     | 开发中                                                                           |
| 后端契约 | `/v1/compendiums/runes/{metadata,recognize,evaluate}`；以同分支后端 Swagger 为准 |

## 1. 业务上下文与页面流

用户上传符文截图得到可编辑识别草稿，或手动录入；确认后调用确定性评分 API，展示基础品质、适配定位、发展建议和数据库中的推荐魔灵。AI 只识图，用户修正后不会再次调用视觉模型。

| 页面         | 路由路径                                                                             | 跳转方式                                                                                             | 来源入口                                           |
| ------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 符文智能评分 | `subPackages/swc-rune-score/index`（独立分包，custom navigation） | `uni.navigateTo`；推荐人物跳 `subPackages/tools/compendium/swc/detail?characterId=...&tab=equipment` | SWC 聚合页入口；recentAliasKey 为 `compendium-swc` |

- `src/pages.json` 将评分页登记在独立分包 `subPackages/swc-rune-score/index`，与工具分包隔离，避免超过微信单包 2MB 限制。
- `src/config/swc-portal.ts` 新增“符文智能评分”入口；`src/config/tools.ts` 增加同工具登记，workspace=`swc`，recentAliasKey=`compendium-swc`。
- 页面缺少必要 `characterId` 时由用户从工具入口进入；评分失败保留手工录入状态，不跳出页面。

## 2. API 契约（同分支后端 Swagger）

| 功能       | 方法与路径                                             | 鉴权              | 请求层                            |
| ---------- | ------------------------------------------------------ | ----------------- | --------------------------------- |
| 规则元数据 | `GET /compendiums/runes/metadata?compendiumId=swc`     | 公开/游客         | 项目 HTTP/Apifox 生成接口         |
| 图片识别   | `POST /compendiums/runes/recognize`（multipart image） | 公开/游客身份门控 | 项目统一 multipart 上传层，非 OSS |
| 评分与推荐 | `POST /compendiums/runes/evaluate`                     | 公开/游客         | 项目 HTTP/Apifox 生成接口         |

RuneData 包含 game、setKey、slot、stars、grade、ancient、level、mainStat、innateStat、subStats、recognition、source。未知值使用 null / unknown，不以 0 补位。副属性保存固定值、百分值、refineValue、gemState、unknown、ambiguous。

`evaluate` 输入 `compendiumId`、`rune`、`context`、`playerStage`、`recommendationLimit`；输出 `quality`、`suitability`、`recommendation`、`monsters`、`ruleVersion`。识图只返回待编辑草稿，不包含评分或魔灵推荐。

错误状态：`INVALID_IMAGE`、`NOT_RUNE_SCREENSHOT`、`MULTIPLE_RUNES`、`LOW_CONFIDENCE`、`MODEL_UNAVAILABLE`、`MODEL_NOT_MULTIMODAL`、`MODEL_TIMEOUT`。任何识图失败均保留手动录入入口。

### 2.1 视觉模型与安全边界

- 图片识别需要后端接入具备视觉能力的模型 API（例如 DeepSeek 支持图像输入的模型）；本功能当前客户端只请求 `/recognize`，不直接访问模型厂商。评分使用独立确定性 `/evaluate`，不需要 DeepSeek。
- DeepSeek API Key、模型选择、提示词、重试与费用控制必须只保存在服务端；不得放入 H5 / 小程序包、客户端环境变量或请求参数。
- 后端必须独立校验文件 MIME/文件签名、大小、解码像素尺寸和单符文截图，设置请求超时、并发/频率限制、游客与账号日额度及费用上限；不能依赖客户端限流或 `size` 校验。
- 明确图片传输、临时处理、保留期限与删除策略；日志不得记录图片内容、Base64、密钥或不必要的用户信息。对识图功能的真实防护、模型可用性及数据留存须由后端部署配置和运行测试确认。

## 3. 交互/页面状态

1. 初始页展示单张图片上传/拍照入口和手动录入提示。
2. 选图后预览，可移除/重选；图片使用本地临时路径，不上传 OSS。
3. 识图期间显示进度并禁用重复操作；服务端失败则提示类型且切换手动录入。
4. 符文属性可编辑；允许 unknown/null 提交评估，由后端返回部分启发式分数与 REVIEW_REQUIRED，不将未知值按 0 补位。
5. 场景、玩家阶段可重复调整；结构未变时本地只缓存当前请求结果，不会再请求 AI。
6. 四类结果依次展示品质/传统效率、定位适配、操作建议、推荐人物；推荐不足时显示真实空态，不凑数。
7. 推荐人物卡按 `characterId` 导航到既有详情并打开符文推荐面板；不按名字匹配。
8. 支持更换图片/重新录入。页面分享只分享工具入口，不带图片、评分或个人内容。

按钮请求中 loading/disabled。识图与评分分别维护加载状态；评分失败保留数据，用户可重试。

## 4. 主题与跨端

- 复用 `PageLayout` 和 `--theme-*` 变量，按 H5/MP 双端构建。
- 图片从相册选择/拍照使用 uni-app API；H5 与小程序临时文件差异由 uni.uploadFile/现有平台 multipart API 处理，不把临时路径强转浏览器 File。
- 禁止裸 `uni.request`、DOM API、直接访问 `window` / `document`、前端 AI 密钥和 OSS 公共上传。
- 业务 API 遵循 Apifox 规范；不得手改 `src/services/apifox/**`。如果当前分支没有可用生成凭证，明确报告，不伪造代码生成结果。

## 5. 算法及可信度说明

评分公式必须服务端唯一实现。传统效率需有核实后的游戏属性 roll 表和社区标准参考样例；本次外部页面可读资料不足时，必须展示字段缺失/需复核，不包装成已验证的 SWOP 复刻。自定义品质分明确标识为本项目参考分，不是官方 Score。匹配仅使用 CharacterBuild 已有场景/套装/主属性/优先副属性统计；套装和主属性独立统计时分开表述。来源、可信度、provisional 状态随推荐展示。

## 6. 验收清单

- [ ] H5/微信小程序均可选择和预览单张图；不使用 OSS 持久化。
- [ ] 模型不可用或识别低置信时可完整手动评分。
- [ ] 可修改识别属性；修改后不重新触发 AI。
- [ ] 评分参数稳定，场景/发展阶段变化可重算。
- [ ] 四结果区清晰，数据不足显示空态/需复核。
- [ ] 推荐卡跳到现有人物详情对应符文推荐页签。
- [ ] 路由与两个 SWC 工具入口登记；最近使用合并到 `compendium-swc`。
- [ ] `pnpm lint`、`pnpm type-check`、`pnpm test:run`、`pnpm check:routes`、`pnpm check:generated-boundary`、`pnpm check:secrets`、H5/MP 构建已执行并真实报告。
- [ ] `docs/changelog.md` 更新。

## 7. 变更记录

- 2026-11-05：根据后端审计明确页面路由、失败降级、数据可信度和双端契约。
