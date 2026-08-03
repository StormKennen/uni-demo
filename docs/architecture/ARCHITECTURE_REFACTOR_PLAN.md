# uni-app 项目架构优化：Codex 完整任务编排

## 一、执行原则

本次不是一次性重写，而是渐进式架构治理。

建议创建独立分支：

```bash
git checkout -b refactor/uniapp-architecture-v2
```

整个优化拆分为：

```text
A0  当前架构基线审计
P0  风险治理与工程门禁
P1  目标架构骨架
P2  公共组件与工具组件体系
P3  Apifox 外部适配层
P4  微信小程序与 H5 平台适配层
P5  分包与业务域重组
P6  巨型页面和备忘录治理
P7  族谱轻量渲染重构
P8  H5 产品化
P9  测试、CI 与质量门禁
P10 最终只读审查与最小修复
```

每个阶段：

1. 使用独立 Codex 会话。
2. 完成后单独提交 Git commit。
3. 前一阶段验收通过后再执行下一阶段。
4. 不允许多个模型同时修改同一个工作区。
5. 不允许把整个 P0～P10 放在一次任务里执行。

---

# 二、全阶段固定约束

下面这段提示词应放在每一个 Codex 阶段任务开头。

```text
你正在维护一个 Vue 3 + TypeScript + uni-app 项目，主要发布为微信小程序，后续需要支持移动 H5 和桌面 H5。

执行前必须读取并遵循仓库中的：
- AGENTS.md
- CLAUDE.md
- HARNESS.md
- README.md
- package.json
- pages.json
- manifest.json
- tsconfig.json

全局不可违反的约束：

1. src/services/** 是 Apifox 插件生成区。
   - 禁止手动修改。
   - 禁止格式化。
   - 禁止移动。
   - 禁止重命名。
   - 禁止在其中添加手写业务逻辑。
   - 最终必须执行 git diff -- src/services，结果应为空。

2. 不要直接升级 Vue、uni-app、Vite、TypeScript 或主要依赖。
   只有当前阶段明确要求时才允许调整，并说明兼容性依据。

3. 不要执行全仓库格式化。
   不要因为本任务修改无关文件。

4. 现有微信小程序业务行为必须保持。
   除当前任务明确涉及的功能外，不修改页面交互和视觉样式。

5. 新代码不得直接调用：
   - wx.*
   - window.*
   - document.*
   - navigator.*
   - location.*
   平台能力必须经过 platform 适配层。
   迁移历史代码时可以渐进处理，但禁止新增直接调用。

6. 新业务代码不得直接 import src/services。
   必须经过 src/api 手写适配层。
   历史直接引用允许暂时存在，但数量不得增加。

7. 分包之间禁止直接互相 import。
   共享能力只能放在根 shared，或者复制为真正独立的轻量适配代码。
   不允许通过复制完整业务模块解决跨分包问题。

8. 根 shared 只允许放跨多个业务域复用、体积较小、无业务接口依赖的代码。
   仅被一个业务使用的组件必须留在该业务目录。

9. 不引入大型图表、编辑器、Canvas 或 UI 依赖包。
   族谱不再使用 ECharts，也不使用另一个大型图表库替代。

10. 每次修改前先输出：
    - 当前问题
    - 修改范围
    - 预计涉及文件
    - 风险
    然后再执行。

11. 每个阶段结束必须输出：
    - 实际修改文件
    - 未修改但发现的问题
    - 执行的验证命令
    - 验证结果
    - 是否满足验收条件
    - 建议 commit message

12. 若发现与本阶段无关的问题，记录到报告，不扩大修改范围。

13. 优先使用项目现有包管理器和锁文件。
    不得同时生成 npm、pnpm、yarn 多套锁文件。

14. 删除文件前必须确认没有活动引用。
    使用 rg、静态引用检查、路由检查和构建验证交叉确认。
```

---

# 三、模型与推理等级

| 阶段         | 模型                | 推理程度        |
| ---------- | ----------------- | ----------- |
| A0 基线审计    | GPT-5.6 Sol       | Max         |
| P0 风险与门禁   | GPT-5.6 Sol       | High        |
| P1 架构骨架    | GPT-5.6 Sol       | High        |
| P2 组件体系    | GPT-5.6 Sol       | High        |
| P3 API 适配层 | GPT-5.6 Sol       | High        |
| P4 平台适配层   | GPT-5.6 Sol       | Max         |
| P5 分包重组    | GPT-5.6 Sol       | Max         |
| P6 备忘录统一   | GPT-5.6 Sol       | Max         |
| P6 其他页面拆分  | GPT-5.6 Sol       | High        |
| P7 族谱重构    | GPT-5.6 Sol       | Max         |
| P8 H5 产品化  | GPT-5.6 Sol       | High        |
| P9 CI 与测试  | GPT-5.6 Terra     | Medium/High |
| P10 最终审查   | GPT-5.6 Sol       | Max         |
| P10 最小修复   | GPT-5.6 Sol/Terra | High        |

---

# A0：当前架构基线审计

## 目标

只读分析仓库，形成后续所有阶段共同使用的基线。

本阶段禁止修改业务源码。

## Codex 任务

```text
执行 uni-app 项目架构基线审计。

本阶段以只读分析为主，不修改现有业务源码，不移动文件，不修复问题。

请完成以下内容：

一、项目结构审计

统计并分析：

1. 所有主包页面。
2. 所有分包和分包页面。
3. pages.json 中注册的全部路由。
4. src/config/tools.ts 中的工具路径。
5. 分享配置中的页面路径。
6. navigateTo、redirectTo、reLaunch、switchTab 中使用的路径。
7. 未注册路由。
8. 已注册但不存在的文件。
9. 已存在但未注册的页面。

二、代码规模审计

列出：

1. 超过 500 行的 Vue 页面。
2. 超过 800 行的 Vue 页面。
3. 超过 400 行的 composable 或 TypeScript 文件。
4. 重复或高度相似的页面。
5. 疑似废弃目录。
6. 多套相似组件。
7. 多套编辑器内核。

三、组件审计

为每个 src/components 下的组件统计：

1. 被哪些文件引用。
2. 引用次数。
3. 是否跨业务域使用。
4. 是否只被一个功能使用。
5. 是否可以归类为：
   - 全局基础组件
   - 工具平台组件
   - 业务域组件
   - 分包内共享组件
   - 未引用组件

四、依赖边界审计

统计：

1. 哪些文件直接 import src/services。
2. 哪些文件直接调用 wx.*。
3. 哪些文件直接调用 window、document、navigator、location。
4. 哪些分包存在跨分包 import。
5. 哪些业务组件位于根 components。
6. 哪些大资源位于根 static。

五、包体积基线

分析现有微信小程序和 H5 构建产物：

1. 主包体积。
2. 每个分包体积。
3. static 体积。
4. 最大的 30 个文件。
5. ECharts 相关文件。
6. 重复进入 H5 构建的资源。

六、输出文件

仅新增架构报告文件：

docs/architecture/
├── CURRENT_STATE.md
├── ROUTE_AUDIT.md
├── COMPONENT_INVENTORY.md
├── PLATFORM_API_INVENTORY.md
├── SERVICE_IMPORT_INVENTORY.md
├── PACKAGE_SIZE_BASELINE.md
├── LARGE_FILE_INVENTORY.md
└── MIGRATION_RISKS.md

如适合机器读取，可同时生成：

architecture-reports/
├── route-map.json
├── component-usage.json
├── service-imports.json
├── platform-api-usage.json
└── package-size-baseline.json

七、验收要求

- 不修改 src/services。
- 不修改页面代码。
- 不移动文件。
- 不删除资源。
- 报告中的数据必须来自仓库实际扫描。
- 给出后续 P0～P10 的风险优先级。
```

## 建议提交

```text
docs(architecture): add current architecture baseline audit
```

---

# P0：风险治理与工程门禁

P0 不是完整架构重构，只处理当前会阻碍后续改造的风险。

## P0A：保护 Apifox 生成区

### 模型

```text
GPT-5.6 Terra / Medium
```

### Codex 任务

```text
保护 src/services Apifox 生成区，避免开发工具自动修改生成代码。

完成：

1. 检查 ESLint 配置和 lint 命令。
2. 将 src/services/** 排除在 eslint --fix 之外。
3. 检查 Prettier 和 lint-staged。
4. 将 src/services/** 排除在 prettier --write 之外。
5. lint 命令和 lint:fix 命令分离。
6. 生成代码不参与手写代码质量统计。
7. 生成代码仍然参与 TypeScript 编译和实际构建。
8. 增加架构检查脚本，确保本次任务没有修改 services。
9. 在根 AGENTS.md 中增加 services 只读规则。

禁止：

- 修改 services 内任何文件。
- 为通过 lint 而修改生成代码。
- 更改 Apifox 目录结构。

验收：

git diff -- src/services

必须为空。
```

---

## P0B：族谱隐藏并移除 ECharts

### 模型

```text
GPT-5.6 Sol / High
```

### Codex 任务

```text
族谱功能需要保留，但当前从工具入口隐藏，并移除 ECharts 运行依赖。

业务要求：

1. 保留族谱 API。
2. 保留族谱页面路由，方便后续开发调试。
3. 保留成员列表、成员详情和编辑相关源码。
4. 工具首页不再展示族谱入口。
5. 工具注册表中保留族谱定义：
   - visible: false
   - status: refactoring
6. 图谱区域暂时显示“族谱图谱升级中”。
7. 不删除族谱业务数据模型。
8. 不使用其他图表库替代 ECharts。

需要移除：

- src/static/echarts.min.js
- src/static/ecStat.min.js（若存在且只为族谱使用）
- src/static/uvue.html（若只为 ECharts 使用）
- src/components/l-echart/**
- src/components/lime-echart/**
- 所有 ECharts import
- 所有 ECharts 初始化逻辑

删除前确认没有其他功能使用。

验收：

1. rg 搜索不再存在活动 ECharts 引用。
2. 微信小程序构建通过。
3. H5 构建通过。
4. 构建产物中不存在 echarts 相关文件。
5. 族谱入口不显示。
6. 手动访问族谱路由仍可进入占位或列表页面。
7. services 未修改。
8. 输出移除前后的包体积变化。
```

---

## P0C：路由和仓库卫生

### 模型

```text
GPT-5.6 Terra / Medium
```

### Codex 任务

```text
修复路由一致性并建立自动检查。

重点检查当前备忘录旧路径：

- /subPackages/services/memo/**
- /subPackages/tools/memo/**

完成：

1. 确认当前唯一活动路由。
2. 修复 navigateTo、分享、内部链接中的旧路径。
3. 不在本阶段合并备忘录实现，只修复实际路由错误。
4. 新增 scripts/check-routes.mjs。
5. 检查：
   - pages.json 注册页面是否存在
   - 工具注册路径是否已注册
   - 分享路径是否已注册
   - 代码跳转路径是否已注册
   - 是否残留废弃路径
6. 增加 .gitignore。
7. 排除 node_modules、dist、ZIP、__MACOSX、.env、系统文件。
8. 检查 Apifox 配置是否包含硬编码 Token。
9. 将 Token 改为环境变量读取，但不修改 services。
10. 提供 .env.example，不放真实凭证。

验收：

- 路由检查脚本通过。
- services 未修改。
- Git 中没有新增密钥。
- 微信小程序和 H5 构建通过。
```

---

# P1：建立目标架构骨架

## 模型

```text
GPT-5.6 Sol / High
```

## 目标

先创建边界，不进行大规模迁移。

## Codex 任务

```text
在不改变现有业务行为的前提下，建立项目目标架构骨架。

新增或规范：

src/
├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── stores/
│   ├── navigation/
│   └── feature-flags/
├── api/
├── platform/
│   ├── contracts/
│   ├── mp-weixin/
│   └── h5/
├── shared/
│   ├── ui/
│   ├── toolkit/
│   ├── composables/
│   ├── errors/
│   ├── storage/
│   ├── types/
│   ├── constants/
│   └── utils/
└── engine/

要求：

1. 只创建有实际用途的目录和最小入口文件。
2. 不为空目录制造大量无用 index.ts。
3. services 保持原位置和原内容。
4. 定义 ToolDefinition 类型，至少包含：
   - id
   - name
   - description
   - path
   - category
   - icon
   - visible
   - status
   - requiresAuth
   - platforms
   - keywords
5. 调整工具注册表，使其具备可扩展元数据。
6. 族谱保留 visible:false 和 status:refactoring。
7. 增加平台、路由和工具状态的基础类型。
8. 在 AGENTS.md 中写入架构依赖规则。
9. 增加 architecture boundary 文档。
10. 不迁移大型业务页面。

依赖规则：

- pages/subPackages 可以依赖 shared、api、platform contracts、engine。
- api 可以依赖 services。
- shared 不得依赖具体业务分包。
- platform 实现可以依赖平台 API。
- 分包之间不得互相依赖。

验收：

- 业务界面没有变化。
- 工具列表和原功能正常。
- 微信小程序和 H5 构建通过。
- services 未修改。
```

---

# P2：组件体系和多组件复用

P2 建议拆成三个独立任务。

## P2A：组件分类和迁移计划

### 模型

```text
GPT-5.6 Sol / High
```

### Codex 任务

```text
根据 A0 的 COMPONENT_INVENTORY，对现有组件进行分类。

分类为：

1. shared/ui
   - 轻量
   - 无业务依赖
   - 多业务域使用

2. shared/toolkit
   - 多种工具页面共用的处理流程组件

3. 分包 _shared
   - 只在同一类工具中复用

4. 业务组件
   - 只属于一个具体功能

5. 废弃组件
   - 没有活动引用

输出：

docs/architecture/COMPONENT_MIGRATION_PLAN.md

必须包含：

- 当前路径
- 目标路径
- 使用方
- 是否需要兼容包装
- 迁移风险
- 推荐迁移批次

本阶段不批量移动组件。
```

---

## P2B：基础 UI 组件统一

### 模型

```text
GPT-5.6 Sol / High
```

### Codex 任务

```text
实现第一批全局基础 UI 组件，并保持兼容。

优先处理：

- PageLayout / layout-page
- nav-bar / nav-bar-base
- confirm-dialog / new-confirm-dialog / ga-confirm-popup
- popup 和底部弹层
- empty-data
- loading
- footer/OneBtn 和 flow-action-bar

目标组件建议：

src/shared/ui/
├── AppPage.vue
├── AppNavbar.vue
├── AppDialog.vue
├── AppPopup.vue
├── AppEmpty.vue
├── AppLoading.vue
├── AppButton.vue
└── AppBottomBar.vue

要求：

1. 不一次性修改所有页面。
2. 旧组件可以保留为兼容包装。
3. 兼容包装内部调用新组件。
4. 不改变现有 props、emits 和视觉行为。
5. 新组件不调用业务 API。
6. 新组件不处理页面路由。
7. 新组件不直接调用 wx/window/document。
8. 使用统一主题变量。
9. 选择 2～3 个低风险页面试点迁移。

验收：

- 试点页面功能和视觉无明显变化。
- 旧页面继续工作。
- 新组件具有清晰类型。
- 微信小程序和 H5 构建通过。
```

---

## P2C：工具页面通用组件

### 模型

```text
GPT-5.6 Sol / High
```

### Codex 任务

```text
建立工具平台通用组件体系。

目标是复用以下流程：

选择输入
→ 参数配置
→ 执行处理
→ 预览结果
→ 保存、复制或分享

建立：

src/shared/toolkit/
├── ToolPageShell.vue
├── ToolSection.vue
├── ToolInputPanel.vue
├── ToolSettingsPanel.vue
├── ToolPreviewPanel.vue
├── ToolResultPanel.vue
├── ToolActionRow.vue
├── ToolBottomActionBar.vue
├── ToolFilePicker.vue
├── ToolProgress.vue
└── ToolStatusPanel.vue

要求：

1. 先盘点现有 toolkit/base 能力，优先复用。
2. 不重复创建功能相同的组件。
3. 组件只处理 UI 和事件。
4. 不直接处理具体图片算法。
5. 不直接调用具体 Apifox 接口。
6. 不内置业务名称和业务字段。
7. 选择两个结构相似的简单工具作为试点。
8. 不在本阶段迁移图片拼接等巨型页面。

验收：

- 两个试点页面复用同一套流程组件。
- 组件 API 可用于后续图片和文件工具。
- 不增加大型依赖。
```

---

# P3：Apifox 外部适配层

## 模型

```text
GPT-5.6 Sol / High
```

## 执行方式

不要一次迁移所有接口，按业务域执行独立任务。

推荐顺序：

```text
P3A auth
P3B files / OSS
P3C calendar
P3D memo
P3E compendium
P3F 其他工具
```

## 通用 Codex 任务模板

```text
为【业务域名称】建立 src/api 外部适配层。

严格约束：

- 不修改 src/services。
- 不复制 services 生成代码。
- 不把 Apifox DTO 直接暴露给页面。
- 不改变现有接口行为。

目标目录示例：

src/api/<domain>/
├── <domain>.api.ts
├── <domain>.mapper.ts
├── <domain>.models.ts
├── <domain>.errors.ts
└── index.ts

适配层负责：

1. 调用 Apifox 生成方法。
2. 请求参数转换。
3. 响应 DTO 转业务模型。
4. 空值和默认值处理。
5. 字段兼容。
6. 业务错误标准化。
7. 隔离生成方法命名。

同时：

1. 将当前业务域页面逐步改为 import src/api。
2. 增加现有直接 services import 的 allowlist。
3. 新增检查脚本：
   - 历史允许项可保留
   - 新增直接 services import 必须失败
   - allowlist 只能减少，不能增加
4. 为 mapper 和参数转换增加单元测试。

验收：

- 当前业务域页面不再直接依赖 Apifox DTO。
- services 未修改。
- 原有接口请求和业务行为保持。
- 测试和双端构建通过。
```

---

# P4：微信小程序与 H5 平台适配层

建议每项能力独立执行，不要一次迁移所有平台 API。

## 推荐顺序

```text
P4A 平台注册与能力探测
P4B 文件选择
P4C 图片和文件导出
P4D 分享
P4E 剪贴板
P4F Canvas
P4G 登录和隐私权限
P4H 定位
```

## 模型

```text
GPT-5.6 Sol / Max
```

## Codex 任务

```text
建立微信小程序与 H5 平台适配层。

先扫描当前业务代码中的：

- wx.*
- window.*
- document.*
- navigator.*
- location.*
- uni.chooseImage
- uni.chooseMedia
- uni.saveImageToPhotosAlbum
- Canvas 平台差异
- 文件下载和分享逻辑

建立契约：

src/platform/contracts/
├── file-picker.ts
├── file-exporter.ts
├── image-exporter.ts
├── share-gateway.ts
├── clipboard-gateway.ts
├── canvas-gateway.ts
├── auth-gateway.ts
├── privacy-gateway.ts
└── location-gateway.ts

实现：

src/platform/mp-weixin/
src/platform/h5/

并建立统一入口：

src/platform/index.ts

要求：

1. 条件编译集中在平台注册和实现层。
2. 业务页面只依赖 contracts 或统一入口。
3. 不在 shared/ui 中调用平台 API。
4. 不一次性迁移全部页面。
5. 先选择 2～3 个工具作为试点：
   - 一个图片工具
   - 一个文件工具
   - 一个分享功能
6. H5 使用 Blob、Object URL、Clipboard 等适当实现。
7. 微信小程序保留权限处理。
8. 定义 PLATFORM_UNSUPPORTED 等统一错误。

验收：

- 试点页面不直接调用平台私有 API。
- 微信和 H5 行为分别正常。
- 平台实现具有独立测试或最小验证。
- 不引入大型依赖。
```

---

# P5：分包与业务域重组

此阶段风险较高，必须拆成多个任务。

## P5A：分包迁移设计

### 模型

```text
GPT-5.6 Sol / Max
```

### Codex 任务

```text
只设计分包重组方案，不立即移动页面。

目标分包：

subPackages/
├── user/
├── image-tools/
├── media-tools/
├── memo/
├── compendium/
├── record-tools/
├── utility-tools/
└── common/

分析：

1. 每个现有页面的目标分包。
2. 每个组件的目标位置。
3. 分包之间的依赖。
4. 需要提升到根 shared 的轻量代码。
5. 不能提升到根 shared 的重型组件。
6. 需要保留兼容路由的页面。
7. 分享路径和外部入口风险。
8. 迁移顺序。
9. 每个新分包预计体积。
10. pages.json 目标结构。

输出：

docs/architecture/SUBPACKAGE_MIGRATION_PLAN.md
architecture-reports/subpackage-target-map.json

本阶段不移动页面。
```

---

## P5B～P5G：逐业务域迁移

### 模型

```text
GPT-5.6 Sol / High 或 Max
```

### 执行顺序

```text
P5B image-tools
P5C media-tools
P5D utility-tools
P5E record-tools
P5F compendium
P5G user
```

备忘录单独放到 P6。

### 通用 Codex 任务模板

```text
将【业务域】迁移到目标分包。

要求：

1. 只迁移本业务域。
2. 更新 pages.json。
3. 更新工具注册表。
4. 更新分享路径。
5. 更新所有内部跳转。
6. 检查是否存在旧路径。
7. 对已经外部分享或可能被收藏的路径，评估兼容入口。
8. 不允许新分包 import 其他业务分包。
9. 业务专属组件随业务移动。
10. 同分包多个工具复用的组件放 _shared。
11. 只有真正跨业务域的轻量组件才能进入根 shared。
12. 静态资源随业务进入分包。
13. 不移动 services。
14. 不进行无关页面重构。

验收：

- 路由检查通过。
- 业务功能正常。
- 分享路径有效。
- 双端构建通过。
- 输出迁移前后主包和分包体积。
```

---

# P6：巨型页面与备忘录治理

## P6A：备忘录实现统一

### 模型

```text
GPT-5.6 Sol / Max
```

### Codex 任务

```text
统一备忘录活动实现和编辑器内核。

当前重点检查：

- subPackages/services/memo
- subPackages/tools/memo
- src/editor-core
- memo 内部 editor-core
- list/detail/editor 路由
- 分享和内部链接
- Schema、序列化和自动保存

先输出：

1. 新旧实现功能对比。
2. 数据模型差异。
3. 编辑器内核差异。
4. 当前实际活动实现。
5. 迁移和兼容风险。
6. 唯一目标实现方案。

确认方案后执行：

1. 只保留一套活动 list/detail/editor。
2. 只保留一个编辑器内核真理源。
3. 不再通过复制源码解决跨分包问题。
4. 统一路由。
5. 统一分享路径。
6. 统一 Schema。
7. 保持已有备忘录数据兼容。
8. 增加旧数据迁移或兼容解析。
9. 增加序列化、反序列化和自动保存测试。
10. 拆分 7000 行级别编辑器页面。

目标结构：

subPackages/memo/
├── pages/
├── components/
├── application/
├── domain/
├── infrastructure/
└── editor-core/

页面目标：

- 页面只负责组件编排。
- API 通过 src/api/memo。
- 平台能力通过 src/platform。
- 编辑器规则不放页面。
- 单个页面壳层尽量控制在 1000 行以内。

验收：

- 旧备忘录可打开。
- 新建、编辑、保存、分享正常。
- 只有一个编辑器内核。
- 不存在旧活动路由。
- 微信和 H5 构建通过。
```

---

## P6B：其他巨型页面拆分

每个页面单独一个 Codex 会话。

推荐顺序：

```text
1. image-stitch
2. game-coupons
3. compendium/swc/detail
4. pool-aim
5. video-compress
6. OSS 上传
```

### 模型

```text
GPT-5.6 Sol / High
```

### 通用任务模板

```text
重构【页面路径】。

目标不是简单移动模板，而是按职责拆分：

- index.vue：页面编排
- components：展示和交互
- application：业务流程和页面状态
- domain：纯规则、计算和类型
- infrastructure：文件、缓存或 API
- platform：平台能力调用

要求：

1. 先记录当前页面所有功能。
2. 建立行为清单，避免拆分遗漏。
3. 不改变 UI 和已有业务行为。
4. API 通过 src/api。
5. 平台能力通过 src/platform。
6. 纯算法移出 Vue。
7. 单页面目标不超过 500～800 行。
8. 单个 composable 尽量不超过 400 行。
9. 不为了行数机械拆分无意义组件。
10. 增加关键业务规则测试。

验收：

- 功能清单逐项验证。
- 原页面行为保持。
- 构建通过。
- 新结构职责清晰。
```

---

# P7：族谱轻量渲染重构

## 模型

```text
GPT-5.6 Sol / Max
```

## Codex 任务

```text
实现不依赖 ECharts 的轻量族谱图谱。

保留族谱入口隐藏状态，完成验收前不要重新公开。

优先复用并审查现有：

- components/family-tree/family-tree-node.vue
- components/family-tree/family-tree-detail.vue
- use-family-tree-layout.ts
- use-family-tree-interaction.ts

目标架构：

record-tools/family-tree/
├── pages/
├── components/
│   ├── FamilyTreeViewport.vue
│   ├── FamilyTreeNode.vue
│   ├── FamilyTreeEdge.vue
│   ├── FamilyTreeToolbar.vue
│   └── FamilyMemberDetail.vue
├── domain/
│   ├── family-tree.types.ts
│   ├── family-tree.normalizer.ts
│   ├── family-tree-layout.ts
│   └── family-tree-edge-builder.ts
├── application/
├── adapters/
└── export/

渲染要求：

1. 普通 view 渲染人物节点。
2. 普通 view 渲染直角连接线。
3. movable-area / movable-view 实现拖动缩放。
4. Canvas 仅用于导出完整族谱图片。
5. 不引入其他大型图库。
6. 布局算法使用纯 TypeScript。
7. 区分 generation 和 depth。
8. 使用 FamilyUnit 表达本人、配偶、子女。
9. 使用子树宽度算法避免节点重叠。
10. 支持：
    - 节点选择
    - 节点详情
    - 折叠展开
    - 自动居中
    - 缩放
    - 拖动
    - 导出
11. 增加可视区域过滤或最小虚拟化。
12. 微信和 H5 共用领域模型和布局算法。

测试数据：

- 10 个节点
- 50 个节点
- 200 个节点
- 500 个节点
- 多子女
- 多配偶或再婚数据
- 缺失父母关系
- 环形错误关系

验收：

- 无 ECharts 依赖。
- 节点不明显重叠。
- 连线关系正确。
- 微信小程序可拖动缩放。
- H5 可拖动缩放。
- 导出图片可用。
- 性能数据和已知限制写入文档。
```

---

# P8：H5 产品化

建议分两步。

## P8A：移动 H5 能力完整

### 模型

```text
GPT-5.6 Sol / High
```

### Codex 任务

```text
完成移动 H5 基础产品化。

重点验证：

1. 所有公开页面可直接访问。
2. 页面刷新不丢失路由。
3. 文件选择正常。
4. 图片和文件下载正常。
5. 剪贴板正常。
6. 分享具备合理降级。
7. Canvas 输出正常。
8. 登录流程不通过 URL 长期暴露 Token。
9. 安全区和底部导航正常。
10. 小程序条件编译不影响 H5。

所有能力优先通过 src/platform/h5 实现。

不在本阶段重做桌面布局。
```

---

## P8B：桌面 H5 响应式布局

### 模型

```text
GPT-5.6 Sol / High
```

### Codex 任务

```text
增加桌面 H5 App Shell，同时保留移动端和微信小程序行为。

建立：

- AppShell
- DesktopSidebar
- MobileTabBar
- ResponsiveContent
- DesktopToolLayout

布局策略：

1. 普通工具：居中窄内容区。
2. 图片工具：设置区 + 预览区。
3. 备忘录编辑器：编辑区 + 属性面板。
4. 资料库：列表 + 详情。
5. 族谱：全屏画布。
6. 微信小程序不加载桌面组件。

要求：

- 复用现有主题。
- 不重写业务逻辑。
- 只调整外层布局。
- 避免在每个页面重复媒体查询。
- 响应式能力集中到共享布局组件和 composable。
```

---

# P9：测试、CI 与架构门禁

## 模型

```text
GPT-5.6 Terra / Medium 或 High
```

## Codex 任务

```text
为架构优化建立自动化质量门禁。

新增或完善：

1. typecheck
2. lint
3. unit test
4. route check
5. Apifox boundary check
6. platform API boundary check
7. cross-subpackage import check
8. component dependency check
9. package size check
10. 微信小程序构建
11. H5 构建

规则：

- services 不参与自动格式化。
- services 可以参与编译。
- 新文件禁止直接 import services。
- 新业务文件禁止直接调用 wx/window/document。
- 分包之间禁止直接 import。
- 工具注册路径必须已注册。
- 分享路径必须已注册。
- 主包内部预算建议 1.3～1.5 MB。
- 单分包内部预算建议 1.3～1.5 MB。
- 包体积增加超过阈值时 CI 失败或告警。

测试优先覆盖：

- 路由
- mapper
- Domain 算法
- 编辑器序列化
- Token 刷新
- 文件平台适配
- 族谱布局
- 工具注册表过滤

不要为了覆盖率测试 Apifox 生成实现细节。
```

---

# P10：最终只读审查与最小修复

必须拆成两个会话。

## P10A：最终只读审查

### 模型

```text
GPT-5.6 Sol / Max
```

### Codex 任务

```text
对完整架构优化进行最终只读审查。

禁止修改任何文件。

检查：

1. services 是否被修改。
2. 是否存在新增直接 services import。
3. 是否存在新增 wx/window/document 调用。
4. 是否存在跨分包 import。
5. shared 中是否混入业务组件。
6. 是否存在重复编辑器内核。
7. 是否存在旧备忘录路由。
8. ECharts 是否完全退出构建。
9. 族谱是否仍保持隐藏或符合开放条件。
10. 工具配置、路由和分享路径是否一致。
11. 主包和分包体积是否满足预算。
12. 微信小程序和 H5 构建是否通过。
13. 是否存在巨型页面未拆分。
14. 是否出现过度抽象。
15. 是否存在无使用方的架构代码。
16. 是否存在循环依赖。
17. 是否存在未测试的高风险迁移。

输出：

docs/architecture/FINAL_ARCHITECTURE_AUDIT.md

问题按：

- Blocking
- High
- Medium
- Low

分类，并给出证据、文件路径和最小修复建议。
```

---

## P10B：最小修复与最终验收

### 模型

```text
GPT-5.6 Sol / High
```

### Codex 任务

```text
读取 FINAL_ARCHITECTURE_AUDIT.md。

逐项核实问题：

1. 只修复仓库中可以确认的问题。
2. 不盲目接受审查报告。
3. 对误报写明原因。
4. 不扩大修改范围。
5. Blocking 和 High 必须处理。
6. Medium 仅处理低风险明确问题。
7. Low 记录到后续 backlog。

最终执行完整验收：

- typecheck
- lint
- unit test
- route check
- boundary check
- package size check
- build:mp-weixin
- build:h5
- git diff -- src/services

输出：

docs/architecture/FINAL_ACCEPTANCE.md

包含：

- 完成的阶段
- 未完成事项
- 当前包体积
- 双端构建结果
- 架构边界检查结果
- 已知技术债
- 后续新功能开发规范
```

---

# 四、推荐 Git 提交划分

建议提交粒度：

```text
docs(architecture): add current architecture audit

chore(services): protect apifox generated sources
refactor(family-tree): remove echarts runtime and hide feature
fix(routes): align registered and runtime routes
chore(architecture): add project boundary checks

refactor(ui): introduce shared base components
refactor(toolkit): introduce reusable tool workflow components

refactor(api-auth): add apifox adapter layer
refactor(api-files): add file api adapter layer
refactor(api-memo): isolate memo api models

refactor(platform): add cross-platform capability contracts
refactor(platform): migrate file and sharing capabilities

refactor(packages): split image tools package
refactor(packages): split media tools package
refactor(packages): split record tools package
refactor(packages): split compendium package

refactor(memo): unify memo implementation and editor core
refactor(image-stitch): separate page workflow and engine

refactor(family-tree): add lightweight tree renderer
feat(h5): complete mobile h5 platform capabilities
feat(h5): add responsive desktop shell

test(architecture): add route and boundary gates
ci: add dual-platform build and package size checks

docs(architecture): add final architecture acceptance
```

---

# 五、整体完成标准

全部阶段完成后，项目至少达到：

```text
□ services 完全由 Apifox 维护
□ services 不被自动格式化
□ 新业务不直接依赖 services
□ ECharts 不进入任何构建产物
□ 族谱使用自研轻量布局与渲染
□ 备忘录只有一个活动实现
□ 编辑器内核只有一个真理源
□ 分包按业务域划分
□ 分包之间没有直接依赖
□ 全局组件均为轻量无业务组件
□ 同类工具具有分包内共享组件
□ 工具页面复用统一处理流程组件
□ 平台差异集中在 platform
□ API DTO 被 api adapter 隔离
□ 普通页面不再持续增长为巨型页面
□ 微信小程序构建通过
□ 移动 H5 构建和使用正常
□ 桌面 H5 具有响应式布局
□ 路由、分享和工具注册自动校验
□ 主包和分包具有体积门禁
□ 架构规则写入 AGENTS.md
```
