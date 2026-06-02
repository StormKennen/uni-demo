import type { BlockSchema } from '../schemas/block-schema'

/**
 * Block Registry —— 全局 BlockSchema 注册表。
 *
 * 设计要点：
 *   - 模块级单例，类型 → schema 的简单映射
 *   - 注册顺序决定 FAB / 列表里 Block 创建按钮的显示顺序
 *   - 重复注册会覆盖（用于热替换）并在 dev 下警告
 *   - 不耦合 Vue 实例 / 应用上下文，方便单测
 */
const registry = new Map<string, BlockSchema>()

/** 注册一个 Block 类型 */
export function registerBlockSchema(schema: BlockSchema): void {
  if (!schema || !schema.type) {
    throw new Error('[editor-core] registerBlockSchema: schema.type 必填')
  }
  if (registry.has(schema.type)) {
    // 不阻断，仅警告，方便 HMR 场景
    console.warn(`[editor-core] BlockSchema "${schema.type}" 已存在，将被覆盖`)
  }
  registry.set(schema.type, schema)
}

/** 按类型获取一个 Block 的 schema，未注册返回 undefined */
export function getBlockSchema(type: string): BlockSchema | undefined {
  return registry.get(type)
}

/** 列出全部已注册 schema（按注册顺序） */
export function getAllBlockSchemas(): BlockSchema[] {
  return Array.from(registry.values())
}

/** 测试 / 重置用 */
export function clearBlockRegistry(): void {
  registry.clear()
}
