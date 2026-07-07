# Changelog

> Harness 变更日志。每次修改 `src/` 核心代码的提交必须在此追加一条记录（pre-commit 强制校验）。
> 格式：`- YYYY-MM-DD [模块] 变更意图简述（作者/Agent）`

## Unreleased

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
