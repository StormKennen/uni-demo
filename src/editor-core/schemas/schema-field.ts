/**
 * SchemaField — 描述控制面板里的一个表单字段。
 *
 * 设计原则：
 *   - 仅描述「数据形状 + 渲染意图」，不耦合任何具体面板/组件
 *   - 字段类型保持移动端友好（uni-app/小程序的内置组件可直接覆盖）
 *   - 不实现 Web 富文本编辑器才会用到的能力（selection / dom range / inline toolbar）
 *
 * 注意：Phase 1 仅实现 input/switch/slider/radio/select 五种渲染器，
 *       textarea/color/unit 已在类型中保留位，后续扩展时直接新增 Field 组件即可。
 */
export type SchemaFieldType =
  | 'input'
  | 'textarea'
  | 'switch'
  | 'slider'
  | 'radio'
  | 'select'
  | 'color'
  | 'unit'

export interface SchemaFieldOption {
  /** 显示文案 */
  label: string
  /** 实际值 */
  value: any
}

export interface SchemaField {
  /**
   * 字段在数据对象中的路径，支持嵌套，使用点号分隔。
   * 例：'style.padding.top'、'layout.type'、'isMarkdown'
   */
  key: string

  /** 面板里显示的标签 */
  label: string

  /** 字段渲染类型 */
  type: SchemaFieldType

  /** 默认值（当 draft 中该路径未定义时使用） */
  default?: any

  /** select / radio 的可选项 */
  options?: SchemaFieldOption[]

  /** slider / 数字字段的最小/最大值与步进 */
  min?: number
  max?: number
  step?: number

  /** input 的占位符 */
  placeholder?: string

  /** 字段说明文案（次要说明，显示在 label 下方） */
  hint?: string

  /**
   * 条件可见 — 接收当前 draft 对象，返回 boolean。
   * 例：(d) => d.layout?.type === 'grid'
   */
  visible?: (draft: any) => boolean
}

// ============================================================
// 路径访问工具：让 SchemaForm 可以基于点号路径读写 draft 对象
// ============================================================

/** 按 'a.b.c' 路径读取嵌套值；不存在返回 undefined */
export function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined
  const keys = path.split('.')
  let cur = obj
  for (const k of keys) {
    if (cur == null) return undefined
    cur = cur[k]
  }
  return cur
}

/** 按 'a.b.c' 路径写入嵌套值；中间节点不存在会自动创建 */
export function setByPath(obj: any, path: string, value: any): void {
  if (!obj || !path) return
  const keys = path.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (cur[k] == null || typeof cur[k] !== 'object') {
      cur[k] = {}
    }
    cur = cur[k]
  }
  cur[keys[keys.length - 1]] = value
}
