/**
 * 内置 BlockSchema 一站式入口：
 *   - 导出注册表 API
 *   - 在模块加载时自动注册 Phase 1 的内置 schema
 *
 * 使用：在你的应用入口 / 试验页面里 `import 'editor-core/registry'` 即可。
 */
import { registerBlockSchema } from './block-registry'
import { TextBlockSchema } from '../schemas/blocks/text-block.schema'
import { ImageBlockSchema } from '../schemas/blocks/image-block.schema'
import { RouteBlockSchema } from '../schemas/blocks/route-block.schema'
import { AttachmentBlockSchema } from '../schemas/blocks/attachment-block.schema'
import { MediaBlockSchema } from '../schemas/blocks/media-block.schema'

// 注册顺序决定 FAB / 列表里的显示顺序
registerBlockSchema(TextBlockSchema)
registerBlockSchema(ImageBlockSchema)
registerBlockSchema(RouteBlockSchema)
registerBlockSchema(AttachmentBlockSchema)
registerBlockSchema(MediaBlockSchema)

export * from './block-registry'
