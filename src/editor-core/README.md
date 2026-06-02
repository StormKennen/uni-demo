# editor-core —— Phase 1 Schema 驱动编辑器内核

> **状态：Phase 1 PoC（架构验证）**
> 当前 `src/subPackages/services/memo/editor.vue` 完全不受影响。本目录只做新内核试验。

---

## 一、为什么这样设计

### 1.1 项目定位
本编辑器是 **uni-app / 微信小程序 / H5** 的移动端 **Block Container Editor**，
不是 Web 富文本编辑器（ProseMirror / Slate / TipTap）。所以：

- 没有 selection / range / inline toolbar 概念
- 不依赖浏览器 DOM 能力
- 优先使用 uni-app 内置组件（`<switch>` / `<slider>` / `<picker>` / `<radio-group>`）
- Block 是核心，Item 是 Block 内部的轻量子对象

### 1.2 当前痛点
旧实现里：
- Block 类型通过巨型 `v-if/else` 分发
- 每种 Block 的控制面板都是单独手写的 Vue 组件
- 新增 Block 类型成本高：要改渲染、改面板、改创建逻辑
- `editor.vue` 越来越巨石化（数千行）

### 1.3 Schema 驱动的解法
把每种 Block 类型的契约集中到一份 **BlockSchema**：

```ts
interface BlockSchema {
  type: string                    // 'text' / 'image' / 'gallery' / ...
  label: string                   // 用户可见中文名
  icon?: string                   // emoji / iconfont
  createDefault: () => any        // 创建默认 block 数据
  renderer: Component             // 画布上的渲染器
  panel?: Component               // 可选：完全自定义面板（逃生口）
  styleSchema?: SchemaField[]     // 样式字段（SchemaForm 自动渲染）
  businessSchema?: SchemaField[]  // 业务字段（同上）
}
```

编辑器内核拿到 schema 就能自动获得：渲染、控制面板、默认值、表单。

**最终目标**：新增一个 Block 类型只需要：
```ts
registerBlockSchema({
  type: 'gallery',
  label: '画廊',
  createDefault: () => ({ type: 'gallery', children: [] }),
  renderer: GalleryRenderer,
  styleSchema: [ ... ],
})
```
不动 editor 主流程。

### 1.4 关于第三方库的决策
我们**不**用 JSON Forms / Form Render / VForm，理由：
- 它们都依赖浏览器 DOM 原生元素（`<input>` / `<select>`），**小程序不能运行**
- 自研轻量版 ≈ 200 行 SchemaForm + ~10 个原子字段，可控、可扩展、无运行时依赖

---

## 二、目录结构

```
src/editor-core/
├── README.md                       本文件
├── schemas/
│   ├── schema-field.ts             SchemaField 接口 + getByPath/setByPath 工具
│   ├── block-schema.ts             BlockSchema 接口
│   └── blocks/
│       ├── text-block.schema.ts    内置：文字块
│       └── image-block.schema.ts   内置：图片块（grid/carousel/free 三种布局）
├── registry/
│   ├── block-registry.ts           register / get / getAll API（模块级单例）
│   └── index.ts                    入口：自动注册内置 schemas
├── forms/
│   └── SchemaForm.vue              根据 SchemaField[] 渲染表单
│                                    支持 input / switch / slider / radio / select
├── panels/
│   └── SchemaDrivenPanel.vue       通用控制面板（深拷贝 draft + 取消/保存）
├── renderers/
│   ├── TextBlockRenderer.vue       文字块渲染器
│   ├── ImageBlockRenderer.vue      图片块渲染器（含 grid 列数 / 轮播 / 自由）
│   └── BlockHost.vue               按 block.type 查 schema.renderer 并分发
└── demo/
    └── SchemaEditorDemo.vue        最小可运行 Demo（左渲染 + 顶部+按钮 + 右面板）
```

---

## 三、核心接口

### 3.1 SchemaField
路径：`schemas/schema-field.ts`

```ts
export interface SchemaField {
  key: string                              // 'style.padding.top'
  label: string
  type: 'input' | 'textarea' | 'switch'
      | 'slider' | 'radio' | 'select'
      | 'color' | 'unit'
  default?: any
  options?: { label: string; value: any }[]
  min?: number; max?: number; step?: number
  placeholder?: string
  hint?: string
  visible?: (draft: any) => boolean        // 条件可见
}
```

**Phase 1 已实现的渲染器**：input / switch / slider / radio / select。
其他类型在 SchemaForm 里会显示 `[未实现的字段类型]` 占位，方便后续扩展。

### 3.2 BlockSchema
路径：`schemas/block-schema.ts`

```ts
export interface BlockSchema<TBlock = any> {
  type: string
  label: string
  icon?: string
  supportsChildren?: boolean
  createDefault: () => TBlock
  renderer: Component
  panel?: Component
  styleSchema?: SchemaField[]
  businessSchema?: SchemaField[]
}
```

### 3.3 Registry
路径：`registry/block-registry.ts`

```ts
registerBlockSchema(schema: BlockSchema): void
getBlockSchema(type: string): BlockSchema | undefined
getAllBlockSchemas(): BlockSchema[]
clearBlockRegistry(): void   // 测试用
```

模块级单例，无 Vue 依赖，方便单测和热替换。

---

## 四、Demo 运行步骤

### 4.1 注册 demo 页面到 `pages.json`

把下面这一项加进 `src/pages.json` 的 `pages` 数组（任意位置）：

```json
{
  "path": "editor-core/demo/SchemaEditorDemo",
  "style": { "navigationBarTitleText": "Schema Editor Demo" }
}
```

> ⚠️ 不要复制到主包顶部影响首页；也可以挂在 subPackages 里。
> Demo 不依赖任何 API / 后端，纯前端逻辑。

### 4.2 跳转到 demo

任意位置调用：
```ts
uni.navigateTo({ url: '/editor-core/demo/SchemaEditorDemo' })
```

### 4.3 操作流程

1. 顶栏点击 **📝 文字** 或 **🖼️ 图片** → 新增一个 block，画布上立刻出现 renderer
2. 块右上角 **⚙️** → 弹出 SchemaDrivenPanel，根据 schema 自动渲染对应字段
3. 改动字段（如把 ImageBlock 的 `layout.type` 切到 `carousel`）→ 点保存 → 画布渲染立刻切换
4. 块右上角 **×** → 删除该 block

### 4.4 验证点
- ✅ 切 ImageBlock 的 `layout.type` 为 `grid` → 调 `layout.columns` slider → 网格列数实时变化
- ✅ 切 `carousel` → 渲染变成 swiper 轮播
- ✅ `visible` 条件生效：只有 `grid` 模式下才显示"网格列数"字段
- ✅ 改文本块对齐方式 → 渲染立刻反映

---

## 五、后续如何替换现有 editor.vue（迁移路径）

> **核心策略：旧的 `src/subPackages/services/memo/editor.vue` 永远不动。**
> 新版编辑器作为独立页面在 **`src/subPackages/tools/`** 下另起炉灶，
> 等到稳定后只需把入口处的 `navigateTo` 路径换成新页面即可。
> 这样回滚成本接近零（改一个 URL）。

### Phase 2 — 内核完善（仍只在 editor-core/ 里）
- 编写余下 Block 类型的 schema：route / attachment / media
- 完善剩余字段类型：color picker / textarea / unit input / file picker
- 验证 schema 表达力是否覆盖 `BlockStyleControlPanel` / `OptionsControlPanel` 现有字段
- 增加单元测试（registry / SchemaForm 路径访问）

### Phase 3 — 在 `src/subPackages/tools/` 下搭建新版备忘录页
新建：
```
src/subPackages/tools/memo-v2/
├── editor.vue        新版编辑器主页（导航栏 + 标题/标签输入 + BlockHost 列表 + FAB + SchemaDrivenPanel）
├── detail.vue        新版预览页（同样 BlockHost 渲染，但只读）
└── list.vue          （可选）新版备忘录列表，若希望与旧 list 并存
```
要点：
- 直接复用 `editor-core/` 全部组件
- 复用旧的 API service / 草稿系统 / Undo/Redo 这些**与渲染无关**的能力，可以从 `services/memo/composables/` 抽取或重新封装到 `editor-core/composables/`
- 数据模型保持与旧版兼容（保存后的 JSON 能被旧 detail.vue 读取，方便灰度）
- 把 Phase 1 demo 页的能力升级为生产级：保存 / 加载 / Undo/Redo / 本地草稿

### Phase 4 — 入口切换
在所有调用旧 editor 的地方（列表页点击、新建按钮、分享回跳等）把：
```ts
uni.navigateTo({ url: '/subPackages/services/memo/editor?id=xxx' })
```
改成：
```ts
uni.navigateTo({ url: '/subPackages/tools/memo-v2/editor?id=xxx' })
```
**这是唯一需要修改非新增文件的步骤**，且改动量极小（grep 一下入口数量通常 < 10 处）。

回滚方案：把入口 URL 改回旧路径即可，旧代码完整保留，零风险。

### Phase 5 — 旧代码归档
长期稳定后（建议运行 2-4 周无回归）：
- 在旧 `editor.vue` 顶部加 `@deprecated` 注释和迁移指引
- 旧 `editor.vue` 从 `pages.json` 中移除（保留文件做归档）
- 高级能力升级：Undo/Redo → JSON Patch 级 / 全局 settings Schema 化 / AI 操作录制

---

## 六、设计取舍记录

| 决策 | 选择 | 理由 |
|---|---|---|
| 表单引擎 | 自研轻量版 | 外部库 DOM 依赖与小程序不兼容 |
| 面板形态 | 弹出式（bottom sheet） | 移动端友好；与现有 `BlockStyleControlPanel` 协议一致 |
| 草稿协议 | SchemaDrivenPanel 内部深拷贝 | 简单可靠；不暴露 useDraftPanel 内部细节 |
| 字段路径 | 点号字符串 + getByPath/setByPath | 比 JSONPath 轻；够用；好调试 |
| Block 数据形状 | 与现有 editor.vue 暂时**不**对齐 | 允许内核独立演进；后续迁移时再做模型对齐 |
| Renderer 反向同步 | `emit('update:block')` + 直接修改 children | 简单；Phase 1 不引入 immer 等不可变库 |
| 复杂面板逃生口 | `BlockSchema.panel` 允许指定自定义组件 | 应对路径节点编辑等无法 schema 化的场景 |

---

## 七、Phase 1 不做的事

明确划清边界，避免 scope creep：

- ❌ 不实现 do/undo（与 schema 的整合是 Phase 5）
- ❌ 不实现自由布局（free 模式当前是垂直堆叠占位）
- ❌ 不实现复杂字段（color picker / 文件选择 / 链接选择器）
- ❌ 不抽离 Item 级 schema（Phase 1 只演示 Block 级 schema；Item 级是 Phase 2）
- ❌ 不接入 editor.vue 现有数据（独立模型，Phase 3 才考虑迁移）

---

## 八、给 Reviewer 的核心检查清单

1. **接口契约**：`BlockSchema` / `SchemaField` 是否覆盖未来需求？是否有遗漏字段？
2. **Registry 设计**：模块级单例是否合适？是否需要支持多实例 / 命名空间？
3. **SchemaForm 字段类型**：5 种是否够用？哪些是必须加进 Phase 2 的？
4. **草稿协议**：SchemaDrivenPanel 的深拷贝 + 整体替换是否会有性能问题？
5. **Renderer 契约**：`block / blockIndex / selected` + `select / update:block` 这套约定够不够？要不要加 `editable` 之类的开关？
6. **Demo 可用性**：在小程序模拟器 + H5 都能跑通吗？

---

## 九、单文件最小可读路径

如果你只想快速读懂这套架构，按顺序读这 4 个文件即可：

1. `schemas/schema-field.ts` —— 字段长什么样
2. `schemas/block-schema.ts` —— Block 类型长什么样
3. `registry/index.ts` + 两个 `blocks/*.schema.ts` —— 怎么注册
4. `demo/SchemaEditorDemo.vue` —— 怎么用起来

其余的 SchemaForm / SchemaDrivenPanel / BlockHost / Renderer 都是把上面 4 个文件的能力组装出 UI。
