import http from '@/services/http'
import {
  getCompendiumsLineups,
  getCompendiumsLineupsLineupId,
  postCompendiumsLineups,
  patchCompendiumsLineupsLineupId,
  deleteCompendiumsLineupsLineupId,
  postLineupsLineupIdReaction,
  getCharactersCharacterIdLineups,
} from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/apifox'
import { getAnonymousId } from '@/utils/anonymous-id'

export type LineupType = string
export type LineupStatus = 'enabled' | 'disabled'

type RawRecord = Record<string, any>

export interface AdminLineupsQuery {
  compendiumId: string
  locale?: string
  keyword?: string
  characterId?: string
  type?: string
  status?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  pageSize?: number
}

export interface AdminLineupsOptionsQuery {
  compendiumId: string
  locale?: string
  keyword?: string
  type?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface AdminLineupsCharacterOptionsQuery {
  compendiumId: string
  locale?: string
  keyword?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface AdminLineupTypesQuery {
  compendiumId: string
}

export interface AdminLineupDetailQuery {
  locale?: string
}

export interface CharacterLineupUsageQuery {
  locale?: string
}

export interface UpdateAdminLineupBody {
  characterIds?: string[]
  description?: string
  name?: string
  status?: LineupStatus
  type?: LineupType
}

export interface CreateAdminLineupBody {
  characterIds: string[]
  compendiumId: string
  description?: string
  name: string
  status?: LineupStatus
  type: LineupType
}

export interface SaveLineupRelationBody {
  compendiumId?: string
  sourceLineupId: string
  targetLineupIds?: string[]
}

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
  source: string // 'admin' | 'user'
  createdBy: string | null
  updatedBy: string | null
  likeCount: number
  dislikeCount: number
  score: number
  myReaction: number // 1 赞 / -1 踩 / 0 未表态
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

const emptyPagination = (): PaginationState => ({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
})

const isRecord = (value: unknown): value is RawRecord => typeof value === 'object' && value !== null && !Array.isArray(value)

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return ''
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return fallback
}

const normalizeUrl = (url?: string): string => {
  if (!url) return ''
  if (url.startsWith('http://')) return url.replace(/^http:/, 'https:')
  return url
}

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const sanitizeQuery = <T extends Record<string, any>>(query: T): Partial<T> => {
  const entries = Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '')
  return Object.fromEntries(entries) as Partial<T>
}

const extractData = (res: unknown): RawRecord => {
  if (isRecord(res) && isRecord(res.data)) return res.data
  return (isRecord(res) ? res : {}) as RawRecord
}

/** 给可选认证接口统一带上游客标识头（登录用户也带，后端以 token 为准忽略）。 */
const withAnonymousHeader = (config: Record<string, any> = {}) => ({
  ...config,
  header: { ...(config.header || {}), 'X-Anonymous-Id': getAnonymousId() },
})

const normalizeInteraction = (source: unknown): LineupInteractionFields => {
  const record = isRecord(source) ? source : {}
  return {
    source: toText(record.source) || 'admin',
    createdBy: record.createdBy != null ? toText(record.createdBy) : null,
    updatedBy: record.updatedBy != null ? toText(record.updatedBy) : null,
    likeCount: toNumber(record.likeCount),
    dislikeCount: toNumber(record.dislikeCount),
    score: toNumber(record.score),
    myReaction: toNumber(record.myReaction),
    canEdit: Boolean(record.canEdit),
  }
}

const normalizePagination = (source: unknown): PaginationState => {
  const data = isRecord(source) ? source : {}
  return {
    page: toNumber(data.page, 1),
    limit: toNumber(data.limit ?? data.pageSize, 20),
    total: toNumber(data.total, 0),
    totalPages: toNumber(data.totalPages, 0),
    hasNext: Boolean(data.hasNext),
    hasPrev: Boolean(data.hasPrev),
  }
}

const normalizeCharacterPreview = (source: unknown): LineupCharacterPreview => {
  const record = isRecord(source) ? source : {}
  const nestedCharacter = isRecord(record.character) ? record.character : {}

  return {
    id: toText(record.id || nestedCharacter.id || record.characterId),
    characterId: toText(record.characterId || nestedCharacter.id || record.id),
    name: toText(record.name || nestedCharacter.name),
    label: toText(record.label || record.name || nestedCharacter.name),
    avatar: normalizeUrl(toText(record.avatar || nestedCharacter.avatar)),
    element: toText(record.element || nestedCharacter.elementKey || record.elementKey),
    elementKey: toText(record.elementKey || nestedCharacter.elementKey),
    elementName: toText(record.elementName || nestedCharacter.elementName),
    archetype: toText(
      record.archetype ||
        record.archetypeKey ||
        record.speciesType ||
        record.type ||
        nestedCharacter.archetype ||
        nestedCharacter.archetypeKey ||
        nestedCharacter.speciesType ||
        nestedCharacter.type,
    ),
    familyKey: toText(record.familyKey || nestedCharacter.familyKey),
    familyName: toText(record.familyName || nestedCharacter.familyName),
    awaken: toText(record.awaken || nestedCharacter.awaken),
    awakenName: toText(record.awakenName || nestedCharacter.awakenName),
    stars: toText(record.stars || nestedCharacter.stars),
  }
}

const normalizeLineupCharacters = (source: unknown): LineupCharacterPreview[] => toArray(source).map(normalizeCharacterPreview)

const normalizeLineupSummary = (source: unknown): AdminLineupSummary => {
  const record = isRecord(source) ? source : {}
  return {
    id: toText(record.id),
    name: toText(record.name),
    type: toText(record.type),
    description: toText(record.description),
    status: toText(record.status),
    memberCount: toNumber(record.memberCount),
    targetLineupsCount: toNumber(record.targetLineupsCount),
    sourceLineupsCount: toNumber(record.sourceLineupsCount),
    characters: normalizeLineupCharacters(record.characters),
  }
}

const normalizeUserLineupSummary = (source: unknown): UserLineupSummary => {
  const record = isRecord(source) ? source : {}
  return { ...normalizeLineupSummary(record), ...normalizeInteraction(record) }
}

const normalizeLineupOption = (source: unknown): LineupOption => {
  const record = isRecord(source) ? source : {}
  return {
    id: toText(record.id),
    name: toText(record.name),
    type: toText(record.type),
    description: toText(record.description),
    status: toText(record.status),
    memberCount: toNumber(record.memberCount),
    targetLineupsCount: toNumber(record.targetLineupsCount),
    sourceLineupsCount: toNumber(record.sourceLineupsCount),
    characters: normalizeLineupCharacters(record.characters),
  }
}

const normalizeCharacterOption = (source: unknown): CharacterOption => {
  const record = isRecord(source) ? source : {}
  return {
    ...normalizeCharacterPreview(record),
    status: toText(record.status),
  }
}

const normalizeLineupMemberDetail = (source: unknown): LineupMemberDetail => {
  const record = isRecord(source) ? source : {}
  return {
    characterId: toText(record.characterId),
    familyKey: toText(record.familyKey),
    elementKey: toText(record.elementKey),
    isCore: Boolean(record.isCore),
    character: normalizeCharacterPreview(record.character),
  }
}

const normalizeReference = (source: unknown): PublicLineupReference => {
  const record = isRecord(source) ? source : {}
  return {
    id: toText(record.id),
    name: toText(record.name),
    type: toText(record.type),
  }
}

const normalizePublicLineup = (source: unknown): PublicLineup => {
  const record = isRecord(source) ? source : {}
  return {
    id: toText(record.id),
    name: toText(record.name),
    type: toText(record.type),
    description: toText(record.description),
    memberCount: toNumber(record.memberCount),
    targetLineupsCount: toNumber(record.targetLineupsCount),
    sourceLineupsCount: toNumber(record.sourceLineupsCount),
    characters: normalizeLineupCharacters(record.characters),
    targetLineupIds: toArray(record.targetLineupIds)
      .map(item => toText(item))
      .filter(Boolean),
    targetLineups: toArray(record.targetLineups).map(normalizeReference),
    incomingLineupIds: toArray(record.incomingLineupIds)
      .map(item => toText(item))
      .filter(Boolean),
    incomingLineups: toArray(record.incomingLineups).map(normalizeReference),
    ...normalizeInteraction(record),
  }
}

export const fetchAdminLineups = async (query: AdminLineupsQuery): Promise<AdminLineupListResult> => {
  const res = await http.get('/admin/lineups', sanitizeQuery(query), {})
  const data = extractData(res)
  return {
    items: toArray(data.items).map(normalizeLineupSummary),
    pagination: normalizePagination(data.pagination),
  }
}

export const createAdminLineup = async (payload: CreateAdminLineupBody): Promise<AdminLineupDetail> => {
  const res = await http.post('/admin/lineups', payload, {})
  return fetchAdminLineupDetailFromUnknown(res)
}

export const fetchAdminLineupOptions = async (query: AdminLineupsOptionsQuery): Promise<LineupOption[]> => {
  const res = await http.get('/admin/lineups/options', sanitizeQuery(query), {})
  const data = extractData(res)
  const items = Array.isArray(data.items) ? data.items : Array.isArray(res) ? res : []
  return items.map(normalizeLineupOption)
}

export const fetchAdminLineupTypes = async (query: AdminLineupTypesQuery): Promise<LineupTypeOption[]> => {
  const res = await http.get('/admin/lineups/types', sanitizeQuery(query), {})
  const data = extractData(res)
  const items = Array.isArray(data.items) ? data.items : Array.isArray(res) ? res : []
  return items
    .map(item => {
      const record = isRecord(item) ? item : {}
      return {
        key: toText(record.key),
        value: toText(record.value || record.key),
        label: toText(record.label || record.value || record.key),
        count: toNumber(record.count),
      }
    })
    .filter(item => Boolean(item.value))
}

export const fetchAdminCharacterOptions = async (query: AdminLineupsCharacterOptionsQuery): Promise<CharacterOptionResult> => {
  const res = await http.get('/admin/lineups/character-options', sanitizeQuery(query), {})
  const data = extractData(res)
  return {
    items: toArray(data.items).map(normalizeCharacterOption),
    pagination: normalizePagination(data.pagination),
  }
}

const fetchAdminLineupDetailFromUnknown = (res: unknown): AdminLineupDetail => {
  const data = extractData(res)
  return {
    id: toText(data.id),
    name: toText(data.name),
    type: toText(data.type),
    description: toText(data.description),
    status: toText(data.status),
    characters: toArray(data.characters).map(normalizeLineupMemberDetail),
  }
}

export const fetchAdminLineupDetail = async (lineupId: string, query: AdminLineupDetailQuery = {}): Promise<AdminLineupDetail> => {
  const res = await http.get(`/admin/lineups/${lineupId}`, query, {})
  return fetchAdminLineupDetailFromUnknown(res)
}

export const updateAdminLineup = async (lineupId: string, payload: UpdateAdminLineupBody): Promise<AdminLineupDetail> => {
  const res = await http.patch(`/admin/lineups/${lineupId}`, payload, {})
  return fetchAdminLineupDetailFromUnknown(res)
}

export const deleteAdminLineup = async (lineupId: string): Promise<void> => {
  await http.delete(`/admin/lineups/${lineupId}`, {}, {})
}

export const fetchLineupRelationDetail = async (sourceLineupId: string, query: AdminLineupDetailQuery = {}): Promise<RelationDetail> => {
  const res = await http.get(`/admin/lineup-relations/${sourceLineupId}`, query, {})
  const data = extractData(res)
  return {
    sourceLineup: isRecord(data.sourceLineup) ? normalizeLineupOption(data.sourceLineup) : null,
    targetLineupIds: toArray(data.targetLineupIds)
      .map(item => toText(item))
      .filter(Boolean),
    targetLineups: toArray(data.targetLineups).map(normalizeLineupOption),
    incomingLineupIds: toArray(data.incomingLineupIds)
      .map(item => toText(item))
      .filter(Boolean),
    incomingLineups: toArray(data.incomingLineups).map(normalizeLineupOption),
  }
}

export const saveLineupRelation = async (payload: SaveLineupRelationBody): Promise<RelationDetail> => {
  const res = await http.post('/admin/lineup-relations', payload, {})
  const data = extractData(res)
  return {
    sourceLineup: isRecord(data.sourceLineup) ? normalizeLineupOption(data.sourceLineup) : null,
    targetLineupIds: toArray(data.targetLineupIds)
      .map(item => toText(item))
      .filter(Boolean),
    targetLineups: toArray(data.targetLineups).map(normalizeLineupOption),
    incomingLineupIds: toArray(data.incomingLineupIds)
      .map(item => toText(item))
      .filter(Boolean),
    incomingLineups: toArray(data.incomingLineups).map(normalizeLineupOption),
  }
}

// ---- 用户侧接口（统一走 apifox 封装方法） ----

const userLineupDetailFromUnknown = (res: unknown): UserLineupDetail => ({
  ...fetchAdminLineupDetailFromUnknown(res),
  ...normalizeInteraction(extractData(res)),
})

export const fetchUserLineups = async (query: AdminLineupsQuery): Promise<UserLineupListResult> => {
  const res = await getCompendiumsLineups(sanitizeQuery(query) as any, withAnonymousHeader())
  const data = extractData(res)
  return {
    items: toArray(data.items).map(normalizeUserLineupSummary),
    pagination: normalizePagination(data.pagination),
  }
}

export const fetchUserLineupDetail = async (lineupId: string, query: AdminLineupDetailQuery = {}): Promise<UserLineupDetail> => {
  const res = await getCompendiumsLineupsLineupId(lineupId, sanitizeQuery(query) as any, withAnonymousHeader())
  return userLineupDetailFromUnknown(res)
}

export const createUserLineup = async (payload: CreateAdminLineupBody): Promise<UserLineupDetail> => {
  const res = await postCompendiumsLineups(payload as any, withAnonymousHeader())
  return userLineupDetailFromUnknown(res)
}

export const updateUserLineup = async (lineupId: string, payload: UpdateAdminLineupBody): Promise<UserLineupDetail> => {
  const res = await patchCompendiumsLineupsLineupId(lineupId, payload as any, withAnonymousHeader())
  return userLineupDetailFromUnknown(res)
}

export const deleteUserLineup = async (lineupId: string): Promise<void> => {
  await deleteCompendiumsLineupsLineupId(lineupId, withAnonymousHeader())
}

export const reactToLineup = async (lineupId: string, value: ReactionValue): Promise<ReactionResult> => {
  const res = await postLineupsLineupIdReaction(lineupId, { value, anonymousId: getAnonymousId() } as any, withAnonymousHeader())
  const data = extractData(res)
  return {
    id: toText(data.id) || lineupId,
    likeCount: toNumber(data.likeCount),
    dislikeCount: toNumber(data.dislikeCount),
    score: toNumber(data.score),
    myReaction: toNumber(data.myReaction),
  }
}

export const fetchCharacterLineupUsage = async (
  characterId: string,
  query: CharacterLineupUsageQuery = {},
): Promise<CharacterLineupUsage> => {
  const res = await getCharactersCharacterIdLineups(characterId, sanitizeQuery(query) as any, withAnonymousHeader())
  const data = extractData(res)

  return {
    lineups: toArray(data.lineups).map(normalizePublicLineup),
  }
}

export const hasPaginationNextPage = (pagination?: PaginationState | null): boolean => Boolean(pagination && pagination.hasNext)

export const getPaginationOrDefault = (pagination?: PaginationState | null): PaginationState => pagination || emptyPagination()
