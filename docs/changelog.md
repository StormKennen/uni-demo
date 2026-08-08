# Changelog

> Harness 变更日志。每次修改 `src/` 核心代码的提交必须在此追加一条记录（pre-commit 强制校验）。
- 2026-07-31 [common/webview] 增强协议页标题识别逻辑，支持“小程序服务”“协议”“政策”等常见标题，避免微信平台配置的隐私/服务URL打开时显示空白（Codex）
> 格式：`- YYYY-MM-DD [模块] 变更意图简述（作者/Agent）`

## Unreleased

- 2026-08-08 [services,tools/compendium-swc] 删除 compendium-lineups/memo API wrapper，SWC 业务直接调用 Apifox；normalize/ViewModel 下沉到 swc 业务目录，generated boundary 收敛为 src/services/apifox/**（Codex）

- 2026-08-08 [tools/compendium-swc] 新增公开页「克制与被克制」：防守/进攻模式、魔灵多选、adapter 接入 GET /compendiums/lineup-relations、关联阵容点赞点踩与前端 score 排序；综合入口与工具配置同步（Codex）

- 2026-08-07 [tools/compendium-swc] 修复 SwcLineup 成员卡因名称换行导致高度/边框不一致：名称单行省略，网格内卡片等高拉伸（Codex）

- 2026-08-07 [tools/compendium-swc] 阵容列表成员预览改为 SwcLineup：展示星级/五行/人物类型图标与家族名，移除本地 member-pill（Codex）

- 2026-08-07 [tools/compendium-swc] SwcCharacterCard/SwcLineup 支持配置家族名与成员名（头像下方换行展示），人物类型改为头像右下角图标；SwcLineup 新增 showFamily/showMemberType 透传（Codex）

- 2026-08-07 [common/agreement] 用户服务协议/隐私政策改为独立原生页，避免小程序 web-view 白屏导致审核判定协议空白；入口 URL 切到 agreement/index（Codex）

- 2026-08-07 [tools/game-coupons] 兑换券恢复游客可用：取消未登录按钮禁用与登录拦截，本地账号可直接添加并批量兑换，托管/记录仍建议登录后使用（Codex）

- 2026-08-05 [api/family-tree] 为族谱成员详情与编辑补充手写路径适配，绕开生成代码中未展开的成员 ID 占位符；Apifox 生成区保持只读（Codex）

- 2026-08-05 [tools/family-tree] 在无 ECharts 的族谱管理面板中恢复成员详情与编辑入口，复用现有成员更新接口，保持成员列表、新增和编辑能力（Codex）

- 2026-08-05 [platform/file,tools/image-format] 建立微信小程序与 H5 文件选择入口，统一图片/文件选择结果结构，并以图片格式转换页作为单页试点；旧上传调用入口保持不变（Codex）

- 2026-08-05 [architecture,components] 建立基础 UI、工具共享组件和跨工具功能组件的最小边界；二维码生成、磁力链接、码包三个试点页面切换至新边界，并恢复族谱快照历史路由为无 ECharts 的升级占位（Codex）

- 2026-08-05 [tools/family-tree,components,static] 隐藏族谱工具目录入口（保留路由/成员列表/详情/新增能力），移除 ECharts 与 ecStat 运行依赖、l-echart/lime-echart 适配组件及纯图表快照页，族谱图谱区域改为升级占位（Codex）

- 2026-08-04 [routes,memo] 将活动备忘录的列表备用跳转、详情登录回跳、内部链接、海报目标、H5 分享链接和微信分享卡片统一到 pages.json 已注册的 `/subPackages/tools/memo/detail`，并新增只读路由一致性门禁（Codex）

- 2026-08-04 [tooling,components/PageLayout,engine/tomato-cipher] 恢复 TypeScript/Volar 与 Vitest 质量门禁启动链路；PageLayout 将内联 back emit 改为具名处理函数，规避 vue-tsc 模板代码生成崩溃且不改变事件行为；Tomato Snake 路径测试按算法实际返回的 Uint32Array 归一化后校验值序列（Codex）

- 2026-08-03 [tools/compendium-swc] 人物列表形态筛选新增 Boss 选项，选中后按 categories[entry_type]=boss 查询（Codex）

- 2026-08-03 [tools/compendium-swc] 人物列表排序改为多字段 sortBy（如 stars:desc,code:desc），不再拆分 sortOrder 传参（Codex）

- 2026-08-01 [tools/game-coupons] 未登录时业务按钮统一置灰禁用，仅顶部「去登录」可跳转，取消操作内自动拉起登录（Codex）

- 2026-08-01 [mine,tools/game-coupons] 设置页退出登录移到夜间模式下方；兑换券取消未登录全屏遮罩，改为步骤前登录提示条，关键操作统一 ensureLogin 校验（Codex）

- 2026-08-01 [tools/game-coupons] 纠正批量兑换逻辑：可用券码默认全选且支持多选，底部按「账号×券码」批量提交；账号默认全选，输入框用于补充添加券码（Codex）

- 2026-08-01 [tools/game-coupons] 兑换券页改为收银台版：首屏仅「加/选账号 → 输入券码 → 一键兑换」；新用户空态直接加号，管理/多选/托管/记录下沉，公开券码改为快选填入（Codex）

- 2026-08-01 [tools/game-coupons] 未登录改为可预览底层账号/券码/兑换结构，叠加半透明遮罩与登录引导按钮，避免空白页看不出功能（Codex）

- 2026-08-01 [tools/game-coupons] 兑换券页去掉重复标题与头部登录胶囊，改为登录门禁：未登录仅展示登录引导，已登录才进入账号/券码/兑换流程，不再走游客本地主链路（Codex）
- 2026-08-01 [tools/directory,config/tools] 工具nav中屏蔽“图片加水印”、“图片隐私处理”、“文档扫描”入口，设置 hiddenInDirectory: true（Codex）

- 2026-08-01 [tools/game-coupons] 简化兑换券页券码区：移除“批量/手动”双 Tab，统一为输入框 +「添加/仅本次」；底部兑换仅作用于已勾选列表券码，账号选择合并为单一列表（Codex）

- 2026-08-01 [tools/compendium-swc] 魔灵详情队长技能接入 leaderSkill：新增 swc-leader-skill-icon 组件，按 swarfarm 规则拼接队长技能图标，amount 非空时左上角展示百分比角标（Codex）

- 2026-08-01 [tools/pdf-toolkit] 暂未完整实现，工具大全入口先设置 hiddenInDirectory 屏蔽，避免用户进入半成品 PDF 工具箱（Codex）

- 2026-08-01 [common/webview] 加固协议/隐私页兜底逻辑：无外部 url 时默认展示用户服务协议内容，增强微信后台服务名标题识别，并强制设置标准导航标题，解决审核入口空白问题（Codex）

- 2026-07-30 [tools/directory,tools/document-scan,tools/magnet-link] 修复工具大全中图片格式转换、图片加水印、Markdown 转 HTML 使用无效 uni-icons 名称导致只显示背景色的问题，替换为现有 image/compose/font 图标；文档扫描与磁力链接页按钮统一使用 flex 垂直居中并重置小程序原生按钮行高和伪元素边框（Codex）
- 2026-07-30 [tools/game-coupons] 进一步精简微信小程序兑换流程：有效券码及奖励默认展示最近 5 条并支持展开，管理区只承载新增券码；兑换记录登录后默认加载最近 5 条，新增“展示详情”开关，紧凑态显示券码/区服/时间/状态，详情态补充脱敏账号、奖励内容与中文失败原因，并支持分页查看更多/收起；同步接入记录 reward 奖励快照字段（Codex）
- 2026-07-30 [tools/compendium-swc,tools/game-coupons] 为魔灵召唤综合入口、图鉴列表、人物详情、兑换券、阵容、阵容映射、映射详情与克制关系页补齐微信小程序单独分享配置：新增 SWC 分享构建器集中维护标题、路径、query 与图片兜底；人物详情分享优先使用当前高清头像，列表/阵容分享携带当前筛选参数，兑换券与映射页带基础上下文参数（Codex）
- 2026-07-27 [user-agreement] 修复微信小程序审核反馈的协议页空白与授权说明不足问题：隐私政策、用户服务协议入口改为小程序原生文本页，不再依赖外部 PDF/webview，并统一登录页、协议弹窗、设置页入口命名；隐私政策明确列出手机号、微信登录标识、用户主动提交内容、文件图片视频、位置、剪贴板、相册保存、游戏账号/兑换记录、设备日志等个人信息的收集目的、方式、用途、存储与第三方服务；手机号登录补齐未勾选协议时的拦截；隐私授权弹窗改由 PageLayout 全局兜底挂载，确保工具页直接进入时也能处理微信隐私授权；移除手机号登录/注册流程中非必要的 `uni.getUserInfo` 调用，不再为账号密码流程额外采集微信昵称、头像或加密用户资料（Codex）
- 2026-07-27 [tools/image-security] 按微信小程序审核意见收紧图片内容安全校验：图片压缩、图片隐私清理、文档扫描在小程序端只有 `checkMediaSecurity` 明确返回安全才继续处理；接口异常、超时或返回不安全均阻断流程，并统一仅提示“所发布内容含违规信息”，不再出现安全校验不可用/失败等说明或放行本地处理（Codex）
- 2026-07-27 [tools/directory,tools/image-watermark,tools/video-watermark,image-format,video-compress,document-scan] 完善工具大全的小程序可用入口口径：目录按当前平台过滤真实不可用功能，微信小程序端隐藏 H5-only 的“视频转GIF”；放开已有小程序画布实现的“图片加水印”入口并补齐选图隐私授权/失败提示；需要登录的工具不再从目录消失，改为保留入口并由点击时引导登录；清理“视频链接整理”页面遗留的 H5 限制状态与注释，图片格式转换、视频压缩、文档扫描的小程序可见文案不再引导或依赖 H5，避免入口被误判为 H5 专属（Codex）
- 2026-07-27 [tools/image-compress] 修复微信小程序审核反馈的“选择图片”点击无响应风险：图片压缩页在小程序端补齐 `getPrivacySetting -> requirePrivacyAuthorize -> chooseMedia` 授权链路，选图失败展示明确 toast；选中图片后先进入预览态再异步补文件大小/尺寸，避免 `getFileInfo` 失败导致页面回到空态；内容安全校验策略按后续 `tools/image-security` 条目统一收紧（Codex）
- 2026-07-25 [theme,auth,tools/compendium-swc,tools/game-coupons] 补齐多处夜间模式与兑换错误文案：魔灵图鉴列表筛选选中态改为主题品牌色浅底，避免夜间模式黑底选中不可读；魔灵详情技能卡、技能描述、队长技能与技能元信息迁移到 `--theme-*` token；设置页、我的设置 tab、登录/注册页和协议确认弹窗改为纯色主题背景并适配夜间模式；微信快捷登录未勾选协议时，点击弹窗“同意”会自动勾选并继续微信登录；兑换券接口英文失败原因增加前端中文映射（Codex）
- 2026-07-25 [tools/game-coupons] 将魔灵召唤兑换券页进一步改为简约“兑换收银台”样式：头部收敛为标题、简短提示和登录状态胶囊；账号胶囊改横向滚动以减少首屏高度；历史成功/已使用/失败统计移入兑换记录摘要，不再单独占主流程卡片；卡片间距、圆角、页签和底部兑换栏尺寸整体压缩，突出“账号 → 券码 → 兑换”三步主线（Codex）
- 2026-07-25 [tools/game-coupons] 精简魔灵召唤兑换券页兑换文案：底部主按钮统一为“兑换/兑换中…”，把单账号、批量券码、手动输入等差异收进底部提示；批量页签改为“批量券码”，同步压缩账号托管、手动输入、公共券码与结果空态文案，减少重复“兑换”表达（Codex）
- 2026-07-25 [tools/compendium-swc] 阵容管理与阵容映射增加临时手机号白名单：聚合入口隐藏非白名单用户的阵容/映射入口，阵容列表、阵容编辑、阵容关系、映射列表与映射详情深链统一拦截，仅 `13025460560`、`13025460562` 可访问；同时将阵容管理列表与映射列表卡片/筛选/弹窗色值迁移到主题 token，补齐夜间模式适配（Codex）
- 2026-07-25 [tools/compendium-swc] 完善魔灵图鉴人物卡片夜间模式：列表人物卡片与详情页人物 Hero 容器改为主题底色叠加五行 tint，不再使用大面积白色/浅色渐变；名称、标签、信息面板、觉醒开关和卡片边框统一切换到 `--theme-*` token，避免夜间模式下卡片发白（Codex）
- 2026-07-25 [tools/compendium-swc] 优化魔灵详情页觉醒形态切换：移除头像卡片底部重复的“切换形态”按钮，仅保留名称信息列中的未觉醒/觉醒分段开关，并根据当前人物形态高亮激活状态，点击另一状态直接切换形态（Codex）
- 2026-07-25 [tools/compendium-swc] 调整魔灵详情页相册主视觉：头像轮播容器与图片背景改为透明以适配夜间模式，默认头像固定优先使用第三方源头像 `avatarOriginal`，不再在正常展示链路中自动降级到列表压缩 OSS 缩略图，避免详情大图发糊（Codex）
- 2026-07-24 [tools/compendium-swc] 魔灵详情页头像主视觉改为相册：将默认头像与接口返回的 `skins` 皮肤图片组合为顶部 `swiper`，支持微信小程序/H5 左右滑动查看（Codex）
- 2026-07-24 [tools/compendium-swc] 修复魔灵详情页头像主视觉不可见问题：详情页头像渲染改为统一计算地址，优先使用高清原始头像并在加载失败时自动降级到列表压缩头像/传入头像，小程序端兜底复用本地头像缓存解析；Hero 主图改用 `aspectFit`，避免源图透明留白或裁切导致内容看不到（Codex）
- 2026-07-23 [tools/compendium-swc] 移除魔灵详情页阵容关联加载链路：删除详情页对阵容服务的引用、相关响应式状态、加载/点赞方法与切换形态后的阵容刷新调用，并清理已注释的阵容展示模板和无效样式，避免人物详情额外请求阵容数据（Codex）
- 2026-07-21 [tools/compendium-swc] 魔灵详情页顶部信息区参考游戏卡片秩序重排：保留现有数据源与属性/技能页签不变，将 Hero 改为名称标题栏、星级与编号、五行角标、头像主视觉、类型/家族/描述与元素/形态切换操作区，突出人物身份识别但不重复展示体力/攻击/防御/速度等属性面板（Codex）
- 2026-07-21 [tools/compendium-swc] 魔灵召唤图鉴人物列表卡片抽象为可复用卡牌布局：新增 `swc-star-badge` 与 `swc-avatar-frame` 基础展示组件，扩展 `swc-character-card` 支持 `variant="bestiary"`，列表页启用“左上星级、右上五行、头像主视觉、底部名称”的紧凑图鉴卡，并在筛选类型时显示攻击/防御/体力/辅助类型标签；旧选人页与阵容组件默认布局保持不变（Codex）
- 2026-07-21 [tools/compendium-swc] 精简魔灵召唤图鉴列表与详情页默认界面：列表页筛选改为元素常驻、已选条件摘要与“更多筛选”展开面板，默认不再铺开形态/类型/星级/排序；详情页压缩 Hero、属性卡与技能卡间距，并将理想伤害输入面板默认收起，保留技能下方预计伤害展示，降低首屏与技能页臃肿感（Codex）
- 2026-07-20 [tools/compendium-swc] 魔灵详情技能页新增第一版理想伤害预估：新增纯前端 `swc-damage-calculator` 解析攻击/防御/体力/速度系数与命中次数，技能页提供绿色属性输入并按基础+绿色合成总面板，在可计算技能下展示普通、暴击与期望伤害；不可识别系数时保留“暂无可计算系数”提示，不引入敌方防御/神器/技能升级等实战修正（Codex）
- 2026-07-20 [tools/game-coupons] 精简魔灵召唤兑换券页主界面：账号区改为可直接勾选的胶囊摘要，添加/校验/同步/删除收进账号管理展开区；券码区默认只展示兑换模式、已选摘要与刷新/管理入口，批量券码添加和明细列表收进券码管理区，并弱化提示块与卡片间距，降低首屏臃肿感（Codex）
- 2026-07-20 [tools/compendium-swc] 优化魔灵详情页属性区域：元素切换只展示当前魔灵家族实际存在的属性形态，当前属性保留不可点击但强化选中态；基础/副属性列表过滤空值，避免缺失属性展示占位，并重绘属性卡片层级与副属性网格样式（Codex）
- 2026-07-20 [tools/watermark] 参考历史可用实现恢复「视频链接整理」主流程：页面不再按平台隐藏解析/保存入口，继续使用 `/video/process` 从分享文本提取到的链接解析 `videoUrl/downloadUrl`，保存视频恢复 `uni.downloadFile + saveVideoToPhotosAlbum` 并保留 `/video/download` 代理重试兜底；保留 PageLayout 与夜间模式样式适配（Codex）
- 2026-07-19 [tools/image-stitch] 长截图拼接增强：在保留现有 Painter/OSS 本地拼接的基础上，新增「拼接模式（普通/聊天截图/紧凑）、遮挡区域（顶部/底部/中心/四角/头像/昵称）、处理方式（自动/本地/云端）」；紧凑模式收敛导出间距、聊天模式对逐项头像/昵称与整体区域绘制遮挡层（随 `#stitch-container` 被后端海报渲染捕获）；云端兜底走 `postImageToolsStitch`（仅提交 `images/mode/masks/outputWidth/gap/backgroundColor`，`masks` 序列化为字符串），展示返回 `url` 并支持保存/复制链接；自动模式在图片数 > 8 时提示「图片较长，本地生成可能失败，是否改用云端生成？」或本地失败时引导云端，普通模式行为不回归（Devin）
- 2026-07-19 [tools/qr-parser,tools/qr-generator,components/toolkit] 二维码解析/生成结果打通「保存到码包」：解析出内容后展示保存入口，`QrGeneratorPanel` 新增 `generated-content` 事件回传生成内容，生成页据此展示保存入口；均以 `encodeURIComponent` 编码 `content` 后 `navigateTo` 至 `code-wallet` 页并携带 `codeType=qr`（Devin）
- 2026-07-19 [tools/code-wallet,config/tools,pages.json] 新增「码包」工具页与分包路由 `subPackages/tools/code-wallet/index`：未登录本地保存/编辑/删除/筛选（`TOOL_CODE_WALLET_LOCAL_ITEMS`，置顶优先），已登录走 CODEWALLET 生成方法云端列表/新增/编辑/删除/置顶/分页与关键字筛选，并支持「同步本地码到云端」（仅提交 `postCodeWalletItemsSyncBodyItemsItem` 支持字段）；QR 预览复用 `QrGeneratorPanel`，条形码首版展示内容+复制不新增依赖；`onLoad` 支持 `?content=&codeType=` 自动打开并回填新增表单；类型全部取自 CODEWALLET/interface（Devin）
- 2026-07-19 [tools/pdf-toolkit,config/tools,pages.json] 新增「PDF 工具箱」工具页与分包路由 `subPackages/tools/pdf-toolkit/index`：接入 PDFTOOLKIT 生成方法完成图片转 PDF/合并/拆分/压缩，逐个 `postPdfToolkitFiles` 上传收集 `fileId` 后 `postPdfToolkitTasks` 建任务，`getPdfToolkitTasksTaskId` 每 1500ms 轮询（最多 60 次、离开页面清理 timer），展示进度/错误/结果（H5 打开 URL、mp-weixin `uni.openDocument`），并用 `getPdfToolkitTasks` 加载最近历史；因生成列表响应为 `object` 采用运行时收窄，类型取自 PDFTOOLKIT/interface（Devin）
- 2026-07-19 [tools/watermark] 将工具入口与页面标题从“视频去水印”调整为低风险的“视频链接整理”，并移除小程序端首页工作台过滤，使入口可在工具库/工作台正常露出；页面处理逻辑保持原状，小程序端仍展示平台限制说明，H5 端保留原解析处理流程（Codex）
- 2026-07-19 [tools/mobile-toolkit] 按 P0 移动端工具增强规格落地三项微信小程序友好能力：二维码解析结果新增类型/风险识别与复制、生成二维码、磁力补全快捷动作；新增“图片隐私清理”工具，通过重新绘制图片移除原图元信息并支持手动遮挡敏感区域；新增“文档扫描”工具，支持最多 6 页拍照/相册图片整理为文档长图并保存，PDF 导出作为后续 H5/服务端增强能力说明；同步注册工具库入口与分包路由（Codex）
- 2026-07-18 [home/navigation,config/tools] 调整小程序端“视频去水印”入口策略：工具配置新增 `hiddenInWorkbenchPlatforms`，让 `video-watermark` 仅在工具库分类中展示，不进入首页工作台/最近使用/默认常用推荐；功能页自身仍在微信小程序端展示平台限制说明，不开放受限处理能力（Codex）
- 2026-07-18 [tools/game-coupons] 精简魔灵召唤兑换券页头部与批量券码文案：账号列表上方移除账号数量/云端托管说明等长描述，仅未登录时保留“登录同步”入口；批量券码输入区用户可见文案从“入库/入库中/入库失败”统一改为“添加/添加中/添加失败”，降低系统实现感（Codex）
- 2026-07-18 [home/tools-ui] 基于 `uni-demo UI / Design Skill` 优化首页常用工具与工具库卡片：将原左上堆叠的信息卡改为更接近移动端工具箱/常用服务入口的居中紧凑卡片，首页常用工具与工具库 grid 均调整为三列居中图标 + 居中文案，减少大卡片空白；工具库 NEW 标识改为角标定位，列表型分类保持横向信息行，兼顾小程序/H5 与日夜主题（Codex）
- 2026-07-18 [tools/game-coupons] 补齐魔灵召唤兑换券批量页签的手动券码入库能力：页面默认进入“批量兑换”，批量券码区新增输入 + 入库按钮并在提交前按大写券码检查本地列表重复；入库成功后刷新服务端券码列表、默认勾选新增券码并展开明细，同时将“自动兑换托管”switch 前置为账号卡重点区域，提升入口可见性（Codex）
- 2026-07-18 [tools/game-coupons] 强化批量/公共券码页签的券码列表刷新入口：保留 `loadCodes()` 刷新服务端券码列表逻辑，将原“刷新”文字操作改为“刷新列表”胶囊按钮，仅在公共券码列表页签展示，提升用户手动同步最新券码的可见性（Codex）
- 2026-07-18 [tools/game-coupons] 魔灵召唤兑换券页改为账号列表 + 券码页签结构：账号列表固定在上方作为统一兑换对象，账号勾选状态按当前页签生效（一次性券码默认首个账号、公共券码默认全选账号）；下方券码区拆分为“一次性券码/公共券码”两个页签，一次性券码仅手动输入且不入库，公共券码仅展示服务端返回列表并移除手动添加入口；底部固定操作栏统一根据当前页签提交兑换，文案与校验随一次性/公共模式切换（Codex）
- 2026-07-18 [tools/game-coupons] 优化魔灵召唤兑换券页勾选与区服交互：批量兑换账号/券码取消“本次兑换/不兑换”文字徽标，改为更明显的圆形勾选与选中描边/侧边强调；一次性券码入口改为实心按钮，账号切换动作改为胶囊按钮；已添加账号区服改为只读展示，不再允许修改，只有新增账号表单保留可点击区服选择并强化可操作样式（Codex）
- 2026-07-18 [tools/game-coupons] P2 新增“一次性券码”独立兑换入口：一次性码不再落入通用待兑换券列表、不调用手动券码入库接口；用户输入一次性兑换码后选择 1 个账号立即兑换，默认选中首个有效账号，兑换请求复用现有批量接口但只提交单账号单券码；兑换成功或已使用且无失败时清空输入，失败时保留券码便于修正重试，并继续复用本次兑换结果摘要展示（Codex）
- 2026-07-18 [tools/game-coupons] 魔灵召唤兑换券页支持“本次兑换”选择范围：账号与券码默认全选以保留批量兑换体验，用户可点选账号/券码取消参与，从而支持单账号单券码兑换；兑换接口继续复用批量接口并仅提交已选账号和券码；主兑换按钮改为固定底部操作栏，显示当前已选数量与单次/批量提示，避免被长列表内容挤出屏幕（Codex）
- 2026-07-18 [tools/game-coupons] P1 移动端任务流改版：魔灵召唤兑换券页收敛为账号卡、券码卡、主兑换按钮、结果摘要与兑换记录入口；自动兑换托管内聚到账号卡并只统计托管账号开关状态；券码区默认展示数量摘要，明细折叠后再手动添加；本次兑换结果改为成功/已使用/失败摘要优先，仅预览失败项，全部账号明细按需展开，降低大量兑换结果导致的长滚动压力（Codex）
- 2026-07-18 [tools/game-coupons] 优化魔灵召唤兑换券账号管理体验：默认区服改为国服，区服选项与账号行展示统一使用中文；添加账号表单前置到账号列表上方，账号信息下方不再重复展示服务器名称；校验状态移动到账号行右侧操作区对齐展示；自动兑换托管由文字开关改为统一 switch 控件并继续复用原批量开关逻辑；同步对齐当前 `GAMECOUPONS/apifox.ts` 生成服务层导出名，修复兑换券页构建导入错误（Codex）
- 2026-07-18 [swc/navigation,config/tools] 新增魔灵召唤聚合入口页 `compendium/swc/index`，首页/工具库顶层仅展示「魔灵召唤」主入口并归入娱乐分类；图鉴、兑换券、阵容、阵容映射改由聚合页承接访问，阵容/映射/兑换券子产品配置 `hiddenInDirectory` 与 `recentAliasKey`，最近使用记录统一归并到 `compendium-swc`，避免首页常用功能冒出子产品入口（Codex）
- 2026-07-14 [services/apifox/GAMECOUPONS] 修复魔灵召唤兑换券「添加账号」与「一键兑换」报错：`GAMECOUPONS/apifox.ts` 生成的请求 URL 模板存在 codegen 笔误 `` `/game-coupons/$${gameId}/...` ``（多了一个 `$`），JS 模板字符串会渲染成 `/game-coupons/$swc/accounts`、`/game-coupons/$swc/redeem` 等，后端收到 `gameId="$swc"` 导致 404/报错（仅 gameId 级接口受影响：codes/codes/manual/profile/redeem/accounts(POST&GET)/redeem-records/summary 共 8 处；accountId 级接口用单 `$` 正常）。统一改为 `` `/game-coupons/${gameId}/...` ``。未改业务逻辑与页面（Devin）

- 2026-07-14 [harness/docs] v1.0.0 - 基于门派一二架构规范，完成 uni-app 存量项目分析、基线文档生成及「无文档，不编码」防线部署：新增前端专项审计简报 `docs/.frontend_audit_report.md`；`.cursor/rules/01-uni-app-rules.md` 顶部注入「No Spec, No Code」最高准则（代码只能翻译 `docs/features/` 文档，口头需求与文档不符须先更新文档）；pre-commit 门禁 `scripts/check-changelog.cjs` 升级为 Harness 铁律文案（改 src 运行代码未同步 changelog 直接拒绝提交，并提示维护 docs/features 文档），本地 husky 已安装激活（Devin）
- 2026-07-14 [docs/features] v1.0.1 - 逆向完成全栈存量功能基线收录与技术债审计：新增 `docs/features/000-existing-baseline.md`，按 `template.md` 格式收录现有 46 个路由页面映射与跳转关系、3 个 Pinia store、`src/services/**`（Apifox 生成层 15 域 + 手写层）已开放 API 契约实录；并依据 `.cursor/rules/01-uni-app-rules.md` 完成技术债审计（TD-1~TD-7：Web 标签 17 处、裸 uni.request 8 处、window/document 直调约 105 处、绕过 storage 封装 9 文件、写死 px 约 580 处、硬编码颜色约 2371 处等），仅登记未改任何老代码（Devin）
- 2026-07-14 [tools/memo] 备忘录接入后端「owner/shared/admin」三视角数据隔离：列表页 `list.vue` 新增视角切换（全部/我创建的/分享给我的，管理员额外「全局(管理员)」走只读 `getAdminMemos`），用户侧列表按 `viewScope` 请求，并依据后端返回的 `accessRole/canEdit/canDelete` 控制入口——创建者点击进编辑页、分享/管理员点击进只读详情页，非创建者隐藏置顶/收藏/删除入口并展示「分享/只读」标识（旧数据无 `accessRole` 时沿用可编辑旧行为）；详情页 `detail.vue` 支持 `mode=private/admin` 走鉴权/管理员接口取详情、`readonly=1` 或 `accessRole` 为 shared/admin 时隐藏编辑入口并显示只读标识，鉴权接口 404 统一提示「无权限或备忘录不存在」；编辑页 `editor.vue` 加载后若非 owner（`canEdit!==true`）转跳只读详情、加载失败（404）提示无权限并返回。仅用现有 `@/services/apifox/NODEJSDEMO/MEMOS` 封装与字段，未新增依赖；样式全部走 `--theme-*`，双端（H5 + mp-weixin）build 均通过（Devin）
- 2026-07-14 [home/navigation] 首页保持极简 + 主题 token 的同时，为常用工具卡恢复「功能识别色」：工具图标不再统一灰化，改为从各工具已有的 `gradient` 中解析首个功能色作为图标颜色，并叠一层同色 14% 透明浅色底板（`toolAccent(gradient)` 派生 `{color, soft}`，不新增数据字段、不改数据来源）；卡片本体、背景、描边、文字、footer 仍全部走 `--theme-*` 中性 token，避免整卡彩色/渐变。解决上一版首页图标发灰、页面发白、识别度不足的问题；双端（H5 + mp-weixin）双主题验证，两个 build 均通过（Devin）
- 2026-07-14 [home/navigation,hooks/use-tool-directory] 首页极简改版并全量接入主题 token：收敛为「常用工具 + 推荐流程 + footer」，移除与 navbar 重复的“工作台”标题、平台/状态 chips 与多余装饰；删除页面所有硬编码渐变/彩色背景/rgba 蒙层与彩色图标底板，页面/卡片/次级块/文本/描边/阴影统一走 `--theme-bg / --theme-surface / --theme-surface-2 / --theme-text(-secondary/-tertiary) / --theme-border / --theme-brand`，navbar 改为主题 surface + 主题文本；工具卡改中性底块（图标 `--theme-text-secondary`，按压态用 `--theme-brand` 轻反馈），无最近使用时展示默认推荐工具（视频去水印/二维码生成/魔灵召唤）并配一条弱化空态提示；推荐流程改为纵向卡片，每卡含标题+一句收益说明+步骤链（`WorkflowScene` 新增 `label/benefit` 展示字段，不改 `workbenchTools/workflowScenes/handleToolClick/handleWorkflowClick` 业务逻辑与跳转）；双端（H5 + mp-weixin）双主题验证，`build:h5` 与 `build:mp-weixin` 均通过（Devin）
- 2026-07-13 [utils/tool-flow,components/toolkit,home/navigation,tools/qr-parser,tools/magnet-link,tools/qr-generator] P1-Workflow-02：新增第 2 条页面级链路 `二维码解析 → 磁力补全 → 二维码生成`（scan-flow）。`tool-flow.ts` 扩展 `ToolFlowId`（新增 `scan-flow`）、`ToolFlowStep`（新增 `qr-parser`）与 `ScanFlowPayload`；首页推荐流程点击入口改为通用映射，`scan-flow` 创建 session（step=qr-parser）后跳转二维码解析页，并把该链路终点修正为二维码生成页；`QrParserPanel` 新增 `parsed` 事件（携带 `text` 与 `text|url|magnetCandidate` 类型判定），二维码解析页 flow 场景在解析出磁力/hash 特征后展示“下一步：磁力补全”，写入 `rawText` 跳转磁力链接页；磁力链接页兼容 `scan-flow`（读取 `rawText` 自动补全、禁用剪贴板、下一步统一跳二维码生成页）；二维码生成页兼容 `scan-flow`（读取 `magnet` 自动生成、作为链路终点 `consume` 清理、不展示下一步）；全链路不依赖剪贴板续传，双端兼容（Devin）
- 2026-07-13 [swc/detail] 魔灵详情页元素切换入口改为复用图鉴列表同款 `SwcElementBadge` 胶囊组件展示，替换原有纯色圆点样式；保留当前切换逻辑与激活态，同时统一列表页与详情页的五行视觉表达（Codex）
- 2026-07-13 [components/toolkit,tools/qr-generator,tools/image-cipher] P1-Workflow-01 阶段四/五/六：二维码 + 图片打乱链路接入与收口。`QrGeneratorPanel` 新增 `generated` 事件（生成成功后抛出二维码图片 payload，静默导出不打扰）；二维码生成页 flow 场景优先读取 `magnet-flow` 的 `magnet` 自动回填生成、不触发剪贴板提示，监听生成结果后展示“下一步：图片打乱”，点击写入 `qrImage` 并跳转；图片打乱页 flow 场景读取并 `consume`（读完即删）二维码图片自动带入并执行一次打乱，链路终点不再展示下一步；全链路不依赖剪贴板续传，双端兼容（Devin）
- 2026-07-13 [utils/tool-flow,components/toolkit,home/navigation,tools/magnet-link] P1-Workflow-01 阶段一/二/三：工作流基础设施 + magnet-flow 入口接入。新增轻量 flow session 工具 `src/utils/tool-flow.ts`（create/read/update/consume/clear，走 `storage.ts` 封装，不散写 `uni.setStorageSync`）与通用底部“下一步”操作条 `flow-action-bar.vue`（固定底部、兼容安全区、纯 UI 容器）；首页第 1 条推荐流程点击改为先创建 `magnet-flow` session（step=magnet-link）再跳转磁力链接页，不影响另外两条流程；磁力链接页 flow 场景禁用剪贴板自动读取，处理出有效链接后展示“下一步：生成二维码”（默认取第一条），点击写入 `magnet` 并跳转二维码页（Devin）
- 2026-07-13 [swc/detail] 魔灵详情页五行属性展示与图鉴列表保持一致：去掉原红色底色标签（`.tag.accent`），改用 `SwcElementBadge`（`size/font 24`、`gap 8`）并为外层 `.element-badge-plain` 套上与列表筛选项 `.quick-chip` 相同的浅灰药丸底色框（`--theme-surface-2` 背景、`--theme-border` 描边、`height 52rpx`、`border-radius 999rpx`）；`light` 等偏浅的属性图标在纯白背景下会显得发白，加底色框后与列表观感一致、更清晰（Devin）
- 2026-07-13 [swc/detail] 修复魔灵详情页“切换形态”与元素切换无效：`familyMembers` 的 `element`/`awaken` 为 `{key,value}` 对象结构，`formatAwakenLabel` 仅按字符串解析导致所有同族成员被判定为“未觉醒”，`切换形态` 找不到对立形态而无响应；新增对象字段解析（复用 `key/valueKey/value/name`），当前形态兜底也改为按详情 `categories` 推导觉醒状态，使 `切换形态` 与元素圆点切换均能命中正确的觉醒/未觉醒目标；同时为切换请求加入竞态令牌并在详情返回后即收起“切换中”遮罩、阵容数据后台加载，避免连点旧请求覆盖与遮罩卡死（Devin）
- 2026-07-12 [theme/layout] 修复微信小程序详情页主题报错：移除 `PageLayout` / `ThemeRoot` 内部组件级 `page-meta` 渲染，改为依赖页面容器内联主题变量；同时 `useTheme` 仅在 tabbar 页面调用 `setTabBarStyle`，避免非 tabbar 页（如魔灵详情）出现 `setTabBarStyle:fail not TabBar page`（Codex）
- 2026-07-12 [swc/components,swc/list] 统一人物卡片 `swc-character-card` 调整五行展示：将五行属性图标移到人物头像右下角展示，底部 `character-name-row` 不再重复占位展示五行，仅保留人物名/家族名，图鉴列表等复用场景同步生效（Codex）
- 2026-07-12 [home/navigation] 首页“推荐流程”由横向滚动改为竖向列表卡片，更贴近工作台类产品的单列浏览习惯；首页继续保持只展示工作台与推荐流程两块核心内容（Codex）
- 2026-07-12 [home/navigation] 继续精简首页为纯“工作台 + 推荐流程”结构：移除说明型 Hero、空态引导和额外解释文案，工作台直接承载最近使用；当无最近记录时自动回退展示 `视频去水印 / 二维码生成 / 魔灵召唤` 等默认常用入口，首页只保留可点击的核心动作（Codex）
- 2026-07-12 [home/navigation,theme] 首页工作台与工具目录页补齐日间/夜间模式适配：首页 Hero 区改为亮暗双视觉方案，工具页与首页的强调色统一走主题品牌色，避免白天/夜间下出现固定深色卡片或硬编码强调色不协调（Codex）
- 2026-07-12 [home/navigation] 首页工作台重构为更克制的“工作台 + 最近使用 + 新手起步引导”结构：移除分类速览与完整目录信息，新用户无最近记录时改为展示推荐起步入口与使用说明；`pages/tools/index` 同步收敛为纯完整工具目录页，不再承载工作台与最近使用（Codex）
- 2026-07-12 [swc/assets,swc/components] 新增 SWC 固定图标本地缓存层：`swc-square-icon` 在 H5 继续直接走 OSS URL，微信小程序端则对 `element / archetype / buff / debuff / leader-skill` 统一走下载后保存到本地文件的缓存策略，并在缓存路径失效时自动回退远端重拉，减少图鉴/阵容等页面重复请求（Codex）
- 2026-07-12 [swc/assets,swc/detail] SWC 方形图标资源基地址切换为 `https://lzk-web.oss-cn-beijing.aliyuncs.com/swc`，统一由组件走 OSS/CDN 取图；同时图鉴详情页五行属性展示改为复用 `SwcElementBadge`，与图鉴列表/选人列表保持一致（Codex）
- 2026-07-12 [family-tree/h5] 恢复 `src/static/echarts.min.js` 仅供 H5 族谱树形图页面使用；微信小程序端仍通过条件编译完全移除树形图与 ECharts 依赖，避免影响 mp 包体（Codex）
- 2026-07-12 [swc/assets] 将 SWC 方形图标资源映射升级为显式 manifest：统一固化 `kind/iconKey/fileName/folder/objectKey`，前端组件继续走统一解析，后端可直接复用同一套文件名规范上传 OSS，避免前后端各自拼接资源路径（Codex）
- 2026-07-11 [family-tree/mp-build] 族谱树形图改为 H5 专属：小程序端仅保留列表模式，`family-tree-chart/demo` 改为 H5 才引入 ECharts，并移除分包内置 `echarts.min.js` 静态文件以缩减 `subPackages/tools` 包体（Codex）
- 2026-07-11 [home/navigation] 首页改为轻量“工作台”视图，仅保留最近使用、快捷入口与工作流捷径；新增独立 `pages/tools/index` 作为完整工具目录页，并将底部 tab 调整为“首页 / 工具 / 设置”，同步修复 H5 tab、高频回跳白名单与分享配置（Codex）
- 2026-07-11 [mp-build] 将 `echarts.min.js` 从主包 `src/static/` 下沉至 `src/subPackages/tools/static/` 供族谱分包使用，并移除未检出有效引用的 `src/static/font/` DIN 字体目录，继续缩减微信小程序主包体积（Codex）
- 2026-07-11 [mp-build] 移除 `main.ts` 对 `src/static/font/dinfont.css` 的全局引入，减少微信小程序主包字体资源体积；现有全局样式中未检出该字体对应类的实际页面引用（Codex）
- 2026-07-11 [swc/build] 为解决微信小程序包体过大，将 SWC 图标资源整体迁移至 `src/subPackages/tools/static/swc/` 分包根静态目录，并将统一图标映射改为直接返回分包静态路径，避免 `import.meta.glob` 将图片打入主包 `assets/`（Codex）
- 2026-07-11 [swc/components,swc/assets] 新增 `src/static/image/swc/elements/` 五行属性图标目录，并将 `swc-element-badge` 底层切换为复用统一方形图标资源映射；统一图标体系现支持 `element / archetype / buff / debuff / leader-skill`（Codex）
- 2026-07-11 [swc/components,swc/assets] 新增统一方形图标组件 `swc-square-icon` 与 SWC 图标资源映射，支持 `archetype / buff / debuff / leader-skill` 四类资源按 `kind + iconKey` 取图；图鉴列表与详情页 archetype 展示改为图标化，并统一 archetype key 归一化逻辑（Codex）
- 2026-07-11 [swc/assets] 新增魔灵召唤人物类型图标资源 4 张（`attack/defense/hp/support`），按组件复用场景独立落盘到 `src/static/image/swc/arche-types/`（Codex）
- 2026-07-11 [swc/assets] 从四合一参考图中裁切魔灵召唤人物类型图标 4 张（`attack/defense/hp/support`），统一落盘到 `src/static/image/swc/archetypes/` 供图鉴、阵容与映射页面复用（Codex）
- 2026-07-11 [swc/assets] 新增魔灵召唤图鉴 debuff 状态图标资源 22 张，统一落盘到 `src/static/image/swc/debuffs/` 供图鉴、阵容与映射页面复用；源站 DOM 中 `Demon Bag` 与 `Scroll Seal` 图片地址为 `undefined`，本次未包含（Codex）
- 2026-07-11 [swc/assets] 新增魔灵召唤图鉴 buff 状态图标资源 22 张，统一落盘到 `src/static/image/swc/buffs/` 供图鉴、阵容与映射页面复用（Codex）
- 2026-07-11 [theme/index] 基于 taste-skill 思路重做首页为更克制的“AI 时代工具工作台”：收敛首屏信息量，改为高科技精简 Hero、连续处理带、最近处理列表与低噪声目录分组，弱化传统工具宫格感并保留原生工作流导向（Codex）
- 2026-07-11 [tools/magnet-link,qr-generator,qr-parser,image-cipher,components/toolkit] 新增工具组件分层：封装基础弹层/卡片/操作行组件与二维码生成、二维码解析、图片打乱业务组件；磁力链接页改为二维码弹层预览并可继续图片打乱，二维码生成页改为复用业务组件并支持弹层打乱二维码图（Codex）
- 2026-07-10 [tools/image-cipher,qr-generator,config/tools] 图片混淆工具更名为“图片打乱”并移除小程序隐藏；二维码生成页新增“选择图片去打乱”入口，支持带图跳转并自动执行一次打乱（Codex）
- 2026-07-06 [tools/qr-generator] 修复微信小程序端二维码生成空白：uqrcodejs 的 drawCanvas 内部已调用 ctx.draw(true) 提交绘制并返回 Promise，原代码在其后又调用 ctx.draw(false) 导致清空画布（reserve=false 会清除已绘制内容），二维码渲染后立即被擦除。改为直接等待 drawCanvas() 的 Promise 完成再标记成功，不再重复 draw（Devin）
- 2026-07-06 [tools/qr-generator,qr-parser] 修复二维码生成/解析页无法使用：PageLayout 迁移（2ab8061）移除了 nav-bar 导入却遗留 `components: { NavBar }`，导致 ReferenceError 页面崩溃（H5 显示"连接超时"）；同时 H5 端 `document.getElementById('qrcode')` 取到的是 uni-canvas 包裹层（无 getContext/toDataURL），导致生成二维码 TypeError 空白、下载/分享无效。修复：移除失效的 NavBar 组件注册；新增 resolveH5Canvas() 解析包裹层内真实 HTMLCanvasElement，供生成/下载/分享复用（Devin）
- 2026-07-06 [swc/components] SwcCharacterCard 新增 starLayout 星级样式配置项（flat 平铺 / stacked 层叠，默认 flat）：stacked 模式下从左往右每颗星星以 margin-left -0.34em 叠压在左侧星星约 1/3 处，右侧星星在上；SwcLineup 透传该配置（Devin）
- 2026-07-06 [swc/admin-list] 修复管理员图鉴列表未显示人物名称：AdminCharacterRow 接口缺少 zhName/enName 字段，createRowFromPreview 未初始化导致模板 row.zhName 为 undefined，列表全部显示"未命名魔灵"且 .slice() 报 TypeError（Devin）
- 2026-07-06 [theme/dark-mode-reliable] 暗色模式可靠性修复：重构 PageLayout 将 page-meta 直接内嵌（解决嵌套组件 fragment 导致小程序端 CSS 变量注入失败）；PageLayout 改为通过 layoutStyle computed 在 .page-layout 容器内联注入全部 theme token，确保即使 page-meta 未生效、CSS 变量仍对子元素可用；theme store 在 H5 端立即调用 applyThemeToHtml（不再依赖 onLaunch 时机）；修复 markdown 页面硬编码背景色（Devin）
- 2026-07-06 [swc/admin-list] 图鉴管理编辑优化：新增 locale 切换 Tab（默认中文），编辑表单按当前 locale 分区显示翻译字段与技能；保存逻辑重构为智能检测变更——仅中文改动发 locale:zh-CN 请求、仅英文改动发 locale:en 请求、同时改动则分两次请求，语言无关字段（星级/五行）跟随任意 locale 请求发送；新增未修改提示与保存结果 locale 标注（Devin）
- 2026-07-06 [theme/dark-mode-fix] 暗色模式全覆盖修复：useTheme.ts 移除 setTabBarStyle MP-WEIXIN 平台限制使 H5 TabBar 同步切换；applyThemeToHtml 增强为同时注入 data-theme 属性 + documentElement.style CSS 变量双保险；首页 NavBarBase 渐变色改为响应 isDark（暗色用 --theme-surface / 亮色保留 #667eea）；我的页面 header 渐变新增 bg--dark 暗色变体；全仓批量替换 116 处 background:#fff → var(--theme-surface)、99 处浅灰背景 → var(--theme-surface-2)、294 处硬编码 color:#333/#666/#999 及 border:#eee/#ddd → 对应 theme token；popup 组件默认背景改用 var(--theme-surface)（Devin）
- 2026-07-06 [theme/layout-fullcoverage] 夜间模式全覆盖落地 Phase 2 — 统一 PageLayout 组件驱动主题分发：升级 PageLayout（easycom）内聚 ThemeRoot + NavBar + var(--theme-bg) 页面底色容器；全仓 50 个页面接入 PageLayout（45 工具/服务页 + 3 主包页 + 1 登录页 + 1 demo 页），消灭所有手动 nav-bar/ThemeRoot 引用；pages.json 全量 navigationStyle: custom 化（webview 2 页因小程序限制保留 default）；nav-bar 默认 bgColor 改为 var(--theme-surface)；buildPageStyleVars 追加 background-color 注入（Devin）
- 2026-07-06 [theme/fullcoverage] 夜间模式全覆盖落地：新增 4 个语义 token（--theme-elevated/mask/surface-2/text-tertiary）+ useTheme()/useThemeOnPage() hook + ThemeRoot 升级驱动原生导航栏/TabBar；将 82 个文件（36 全局组件 + 46 页面/子页面）的硬编码颜色迁移至 CSS token 体系，覆盖 background/color/border/box-shadow 四类属性，保留品牌色(#0046b4)与状态色不变（Devin）
- 2026-07-03 [components/ThemeRoot] 封装 ThemeRoot 统一小程序 page-meta 注入，页面只需首节点引入即可同步主题页级样式（Devin）
- 2026-07-03 [theme/index] 首页接入 ThemeRoot，并将首页中性背景、卡片、文字、边框与提示态颜色迁移到主题 token（Devin）
- 2026-07-03 [theme/compendium-list] 图鉴列表页接入 ThemeRoot，并将筛选栏、列表壳、提示文案等中性颜色迁移到主题 token（Devin）
- 2026-07-03 [theme/mine] mine 页接入 ThemeRoot，并保留夜间模式开关为页面主题控制入口（Devin）
- 2026-07-03 [theme/setting] 设置页接入 ThemeRoot，并将页面背景迁移到主题 token（Devin）
- 2026-07-01 [harness] 引入 Harness 护栏体系：.cursor/rules/、HARNESS.md、AGENTS.md、CLAUDE.md、copilot-instructions、Husky pre-commit（lint-staged + changelog 强校验）（Devin）
- 2026-07-01 [swc/lineup-edit] 阵容编辑页人物选择改为「精准人物筛选」按钮跳转独立选择页；人物选择页重构为一行五个头像网格、点击选中/取消、底部确认回传（Devin）
- 2026-07-03 [swc/lineup-edit] 放开阵容成员数量限制并允许名称为空提交，创建入口同步传递不限数量参数（Devin）
- 2026-07-03 [swc/lineup-mappings] 创建阵容映射允许空名称创建，取消弹窗必填拦截（Devin）
- 2026-07-03 [swc/character-picker] 选择页默认已觉醒、星级倒序、自动分页加载并接入头像缓存（Devin）
- 2026-07-03 [swc/character-picker] 取消「加载更多」按钮，改为滚动到底部自动加载下一页 50 条（Devin）
- 2026-07-03 [swc/list] 图鉴列表页分页步长统一调整为 50 条（Devin）
- 2026-07-03 [swc/components] 新增统一人物卡片组件 SwcCharacterCard（圆/方头像、名称/种族/五行/星级/原始星级/删除叉/选中角标均可配置）与阵容组件 SwcLineup（0~多成员、名称/描述/类型可配置、editable 删除态），下沉共享视图模型与星级推算至 swc/utils.ts（Devin）
- 2026-07-03 [swc] 图鉴列表/选人页/阵容编辑/阵容映射/选人面板全量迁移至 SwcCharacterCard + SwcLineup，移除旧 character-avatar-grid 与 lineup-avatar-card（Devin）
- 2026-07-03 [swc/edit] 人物编辑页新增「原始星级」可编辑字段，复用现有 attributes[stars] 读写并保留其它属性（Devin）
- 2026-07-03 [swc/edit] 保存人物星级改为提交规范化 attributes 数组（[{key,value}]，数值型 value，保留 hp 等其它属性并覆盖 stars）（Devin）
- 2026-07-03 [swc/edit] 保存人物改为回传完整记录（attributes 完整数组仅覆盖 stars，categories 以对象形态、skins/aliases 原样回传），避免整体替换时被清空（Devin）
- 2026-07-03 [swc/edit] 保存后增加星级落库自检，未生效时不再误报成功；图鉴列表从编辑页返回后自动刷新，并补充后端保存契约排查文档（Devin）
- 2026-07-03 [swc/admin-list] 新增 H5 + 管理员专用的魔灵召唤图鉴内联管理页，支持中英双语名称、星级与别名 inline 编辑、技能展开编辑、五行筛选与星级排序（Devin）
- 2026-07-03 [config/tools] 为魔灵召唤新增仅 H5/管理员可见的图鉴管理入口（Devin）
- 2026-07-03 [swc/admin-list] 放开平台限制，管理员在小程序可见；图鉴管理页改为行级编辑模式，默认只读、点编辑才展开中英双语名称/五行/星级/别名/描述/技能表单（Devin）
- 2026-07-03 [config/tools] 魔灵召唤图鉴管理入口改为管理员可见并移除 H5 平台限制（Devin）
- 2026-07-03 [theme] 新增全局日间/夜间主题（CSS 变量 tokens + Pinia 持久化，H5 通过 :root[data-theme] 切换、小程序通过 page-meta 注入），mine 页「设置」同级新增夜间模式开关（Devin）
