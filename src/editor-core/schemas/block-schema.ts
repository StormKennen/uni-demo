import type { Component } from 'vue'
import type { SchemaField } from './schema-field'

/**
 * BlockSchema — 描述一种 Block 类型的完整契约。
 *
 * 核心理念：
 *   把一个 Block 类型需要的全部信息（如何创建、如何渲染、如何配置）集中描述，
 *   编辑器内核拿到 schema 就能自动获得：
 *     · 默认值
 *     · 在画布上的呈现（renderer）
 *     · 控制面板（panel 或 styleSchema/businessSchema）
 *
 * 兼容性约束：
 *   - 整体面向 uni-app / 微信小程序 / H5，不要假设浏览器 DOM 能力
 *   - Block 是一等公民；Item 仅是 Block 内部轻量子对象，不在此处描述
 *   - 不引入 Web 富文本编辑器（tiptap/slate/prosemirror）的能力模型
 */
export interface BlockSchema<TBlock = any> {
  /** Block 类型 ID，全局唯一，例：'text' / 'image' / 'gallery' */
  type: string

  /** 用户可见的中文名（FAB 子按钮、面板标题等） */
  label: string

  /** 用户可见的小图标（emoji 或 iconfont 类名） */
  icon?: string

  /** 是否允许有 children（item 数组）；默认 true */
  supportsChildren?: boolean

  /**
   * 创建一个 Block 默认对象。
   * 由内核在 “新增 Block” 时调用。
   */
  createDefault: () => TBlock

  /**
   * 在画布上渲染该 Block 的 Vue 组件。
   * 组件 props 至少接收 { block: TBlock, blockIndex: number }，
   * 并通过 emit('update:block', newBlock) 反向同步。
   */
  renderer?: Component

  /**
   * （可选）整块自定义控制面板组件。
   * 如果指定，内核将直接用它而忽略 styleSchema/businessSchema。
   * 用于需要超出 Schema 表达能力的复杂面板（如路径节点编辑）。
   */
  panel?: Component

  /**
   * 样式相关字段 schema —— 描述 block.style 下的可配置字段
   * 由 SchemaForm 自动渲染
   */
  styleSchema?: SchemaField[]

  /**
   * 业务相关字段 schema —— 描述 block 顶层 / business 下的可配置字段
   * 例：text 块的 isMarkdown、route 块的 showTime
   */
  businessSchema?: SchemaField[]

  /**
   * Item 级字段 schema —— 描述 block.children[i] 的可配置字段。
   *
   * 例：TextItem 的 bold/italic/fontSize/color；ImageItem 的 sizeMode/width/rotate。
   *
   * Renderer 在每个 item 上提供 ⚙️ 按钮，点击后由内核弹出 SchemaDrivenPanel
   * 并把当前 item 作为 source 传入；保存时整体替换该 item。
   */
  itemSchema?: SchemaField[]

  /**
   * 子项数组在 block 上的字段名。默认 `'children'`。
   * 路径块用 `'content'`，所以专门提供这个钩子。
   */
  itemArrayKey?: string

  /**
   * 创建默认 item 的工厂函数。
   * 当用户点击 Renderer 中的"+ 添加项"按钮时调用。
   * 
   * 例：TextBlock 返回 { value: '', style: {} }
   *     ImageBlock 返回 { value: { id: '', url: '' }, style: {} }
   */
  createDefaultItem?: () => any
}
