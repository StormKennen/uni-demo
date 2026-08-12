import type { LineupOption } from './lineup-types'

export type RelationEditMode = 'create' | 'edit'
export type RelationSide = 'defense' | 'offense'

export interface RelationEditPrefill {
  mode: RelationEditMode
  relationId?: string
  defense?: LineupOption | null
  offense?: LineupOption | null
  description?: string
  relationCreatedBy?: string | null
  relationSource?: string
  relationCanEdit?: boolean
}

export interface RelationEditResult {
  changed: boolean
  action: RelationEditMode
}

export const RELATION_EDIT_PREFILL_KEY = 'compendium:swc:lineup-relation-edit:prefill'
export const RELATION_EDIT_PICKER_CONTEXT_KEY = 'compendium:swc:lineup-relation-edit:picker-context'
export const RELATION_EDIT_PICKER_RESULT_KEY = 'compendium:swc:lineup-relation-edit:picker-result'
export const RELATION_EDIT_RESULT_KEY = 'compendium:swc:lineup-relation-edit:result'
