export type LineupType = string
export type LineupStatus = 'enabled' | 'disabled'

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type ReactionValue = 1 | -1

/** 阵容互动/归属字段（用户侧接口返回）。 */
export interface LineupInteractionFields {
  source: string
  createdBy: string | null
  updatedBy: string | null
  likeCount: number
  dislikeCount: number
  score: number
  myReaction: number
  canEdit: boolean
}

export interface ReactionResult {
  id: string
  likeCount: number
  dislikeCount: number
  score: number
  myReaction: number
}

export interface LineupCharacterPreview {
  id: string
  characterId: string
  name: string
  label: string
  avatar: string
  element: string
  elementKey: string
  elementName: string
  archetype: string
  familyKey: string
  familyName: string
  awaken: string
  awakenName: string
  stars: string
}

export interface AdminLineupSummary {
  id: string
  name: string
  type: LineupType | string
  description: string
  status: LineupStatus | string
  memberCount: number
  targetLineupsCount: number
  sourceLineupsCount: number
  characters: LineupCharacterPreview[]
}

export interface AdminLineupListResult {
  items: AdminLineupSummary[]
  pagination: PaginationState
}

export interface UserLineupSummary extends AdminLineupSummary, LineupInteractionFields {}

export interface UserLineupListResult {
  items: UserLineupSummary[]
  pagination: PaginationState
}

export interface LineupOption {
  id: string
  name: string
  type: LineupType | string
  description: string
  status: LineupStatus | string
  memberCount: number
  targetLineupsCount: number
  sourceLineupsCount: number
  characters: LineupCharacterPreview[]
}

export interface LineupTypeOption {
  key: string
  value: string
  label: string
  count: number
}

export interface CharacterOption extends LineupCharacterPreview {
  status: string
}

export interface CharacterOptionResult {
  items: CharacterOption[]
  pagination: PaginationState
}

export interface LineupMemberDetail {
  characterId: string
  familyKey: string
  elementKey: string
  isCore: boolean
  character: LineupCharacterPreview
}

export interface AdminLineupDetail {
  id: string
  name: string
  type: LineupType | string
  description: string
  status: LineupStatus | string
  characters: LineupMemberDetail[]
}

export interface UserLineupDetail extends AdminLineupDetail, LineupInteractionFields {}

export interface RelationDetail {
  sourceLineup: LineupOption | null
  targetLineupIds: string[]
  targetLineups: LineupOption[]
  incomingLineupIds: string[]
  incomingLineups: LineupOption[]
}

/** 关联阵容项：后端返回 { lineup, relation }，前端展平展示。 */
export interface RelatedLineupItem {
  lineup: UserLineupSummary
  relationId: string
  relationDescription: string
}

/** 公开克制查询：主阵容 + 关联阵容（related 已按后端 mode 方向给出）。 */
export interface LineupRelationGroup {
  lineup: UserLineupSummary
  relatedLineups: RelatedLineupItem[]
}

export interface PublicLineupRelationResult {
  type: string
  relationMode: string
  results: LineupRelationGroup[]
  pagination: PaginationState
}

export interface PublicLineupReference {
  id: string
  name: string
  type: string
}

export interface PublicLineup extends LineupInteractionFields {
  id: string
  name: string
  type: string
  description: string
  memberCount: number
  targetLineupsCount: number
  sourceLineupsCount: number
  characters: LineupCharacterPreview[]
  targetLineupIds: string[]
  targetLineups: PublicLineupReference[]
  incomingLineupIds: string[]
  incomingLineups: PublicLineupReference[]
}

export interface CharacterLineupUsage {
  lineups: PublicLineup[]
}

export type ContainerKind = 'source' | 'target'

export interface ContainerLineupInfo {
  id: string
  name: string
  type: string
}

export interface LineupMappingContainerItem {
  itemId: string
  lineupId: string
  order: number
  lineup: ContainerLineupInfo | null
  likeCount: number
  dislikeCount: number
  score: number
  myReaction: number
}

export interface LineupMappingContainer {
  containerId: string
  items: LineupMappingContainerItem[]
}

export interface LineupMapping {
  id: string
  gameId: string
  name: string
  description: string
  status: string
  sourceContainer: LineupMappingContainer
  targetContainer: LineupMappingContainer
  createdBy: string | null
  canEdit: boolean
  createdAt: string
  updatedAt: string
}

export interface LineupMappingListResult {
  items: LineupMapping[]
  pagination: PaginationState
}

export interface ContainerReactionResult {
  likeCount: number
  dislikeCount: number
  score: number
  myReaction: number
}
