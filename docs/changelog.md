# Changelog

> Harness 变更日志。每次修改 `src/` 核心代码的提交必须在此追加一条记录（pre-commit 强制校验）。
> 格式：`- YYYY-MM-DD [模块] 变更意图简述（作者/Agent）`

## Unreleased

- 2026-07-13 [utils/tool-flow,components/toolkit,home/navigation,tools/magnet-link] P1-Workflow-01 阶段一/二/三：工作流基础设施 + magnet-flow 入口接入。新增轻量 flow session 工具 `src/utils/tool-flow.ts`（create/read/update/consume/clear，走 `storage.ts` 封装，不散写 `uni.setStorageSync`）与通用底部“下一步”操作条 `flow-action-bar.vue`（固定底部、兼容安全区、纯 UI 容器）；首页第 1 条推荐流程点击改为先创建 `magnet-flow` session（step=magnet-link）再跳转磁力链接页，不影响另外两条流程；磁力链接页 flow 场景禁用剪贴板自动读取，处理出有效链接后展示“下一步：生成二维码”（默认取第一条），点击写入 `magnet` 并跳转二维码页（Devin）
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
