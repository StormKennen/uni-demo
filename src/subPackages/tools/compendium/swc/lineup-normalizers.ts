import type {
  AdminLineupDetail,
  AdminLineupListResult,
  AdminLineupSummary,
  CharacterLineupUsage,
  CharacterOption,
  CharacterOptionResult,
  ContainerReactionResult,
  LineupCharacterPreview,
  LineupInteractionFields,
  LineupMapping,
  LineupMappingContainer,
  LineupMappingContainerItem,
  LineupMappingListResult,
  LineupMemberDetail,
  LineupOption,
  LineupRelationGroup,
  RelatedLineupItem,
  LineupTypeOption,
  PaginationState,
  PublicLineup,
  PublicLineupReference,
  PublicLineupRelationResult,
  ReactionResult,
  RelationDetail,
  UserLineupDetail,
  UserLineupListResult,
  UserLineupSummary,
  ContainerLineupInfo,
} from './lineup-types'

type RawRecord = Record<string, any>

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

export const extractData = (res: unknown): RawRecord => {
  if (isRecord(res) && isRecord(res.data)) return res.data
  return (isRecord(res) ? res : {}) as RawRecord
}

export const normalizePagination = (source: unknown): PaginationState => {
  const data = isRecord(source) ? source : {}
  const page = toNumber(data.page, 1)
  const limit = toNumber(data.limit ?? data.pageSize, 20)
  const total = toNumber(data.total ?? data.totalResults, 0)
  const totalPages = toNumber(data.totalPages, total > 0 && limit > 0 ? Math.ceil(total / limit) : 0)
  const hasNext = data.hasNext != null ? Boolean(data.hasNext) : page < totalPages
  const hasPrev = data.hasPrev != null ? Boolean(data.hasPrev) : page > 1
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  }
}

export const hasPaginationNextPage = (pagination?: PaginationState | null): boolean => Boolean(pagination && pagination.hasNext)

export const getPaginationOrDefault = (pagination?: PaginationState | null): PaginationState => pagination || emptyPagination()

const normalizeInteraction = (source: unknown): LineupInteractionFields => {
  const record = isRecord(source) ? source : {}
  const interaction = isRecord(record.interaction) ? record.interaction : {}
  const favorite = isRecord(record.favorite) ? record.favorite : {}
  const read = (key: string): unknown => record[key] ?? interaction[key]
  return {
    source: toText(read('source')) || 'admin',
    createdBy: read('createdBy') != null ? toText(read('createdBy')) : null,
    updatedBy: read('updatedBy') != null ? toText(read('updatedBy')) : null,
    createdAt: toText(read('createdAt')),
    updatedAt: toText(read('updatedAt')),
    likeCount: toNumber(read('likeCount')),
    dislikeCount: toNumber(read('dislikeCount')),
    score: toNumber(read('score')),
    myReaction: toNumber(read('myReaction')),
    favoriteCount: toNumber(read('favoriteCount') ?? favorite.count),
    isFavorited: Boolean(read('isFavorited') ?? favorite.isFavorited),
    canEdit: Boolean(read('canEdit')),
  }
}

const findCategory = (categories: unknown, key: string): RawRecord => {
  if (!Array.isArray(categories)) return {}
  const found = categories.find((item: unknown) => isRecord(item) && item.key === key)
  return isRecord(found) ? found : {}
}

const findAttribute = (attributes: unknown, key: string): RawRecord => {
  if (!Array.isArray(attributes)) return {}
  const found = attributes.find((item: unknown) => isRecord(item) && (item.key === key || item.name === key))
  return isRecord(found) ? found : {}
}

export const normalizeCharacterPreview = (source: unknown): LineupCharacterPreview => {
  const record = isRecord(source) ? source : {}
  const nestedCharacter = isRecord(record.character) ? record.character : {}
  const categories = [...toArray(record.categories), ...toArray(nestedCharacter.categories)]
  const attributes = [...toArray(record.attributes), ...toArray(nestedCharacter.attributes)]

  const familyCat = findCategory(categories, 'family')
  const archetypeCat = findCategory(categories, 'archetype')
  const elementCat = findCategory(categories, 'element')
  const awakenCat = findCategory(categories, 'awaken')
  const starsAttr = findAttribute(attributes, 'stars')

  return {
    id: toText(record.id || record._id || nestedCharacter.id || nestedCharacter._id || record.characterId),
    characterId: toText(record.characterId || nestedCharacter.id || nestedCharacter._id || record.id || record._id),
    name: toText(record.name || nestedCharacter.name),
    label: toText(record.label || record.name || nestedCharacter.name),
    avatar: normalizeUrl(toText(record.avatar || nestedCharacter.avatar)),
    element: toText(
      record.element ||
        nestedCharacter.elementKey ||
        record.elementKey ||
        elementCat.valueKey ||
        elementCat.value ||
        nestedCharacter.element ||
        nestedCharacter.elementName,
    ),
    elementKey: toText(record.elementKey || nestedCharacter.elementKey || record.element || elementCat.valueKey || elementCat.value),
    elementName: toText(record.elementName || nestedCharacter.elementName || elementCat.value || elementCat.valueKey),
    archetype: toText(
      record.archetype ||
        record.archetypeKey ||
        record.speciesType ||
        nestedCharacter.archetype ||
        nestedCharacter.archetypeKey ||
        nestedCharacter.speciesType ||
        archetypeCat.valueKey ||
        archetypeCat.value,
    ),
    familyKey: toText(record.familyKey || nestedCharacter.familyKey || familyCat.valueKey),
    familyName: toText(record.familyName || nestedCharacter.familyName || familyCat.value || familyCat.name),
    awaken: toText(record.awaken || nestedCharacter.awaken || awakenCat.value || awakenCat.valueKey),
    awakenName: toText(record.awakenName || nestedCharacter.awakenName || awakenCat.valueKey || awakenCat.value),
    stars: toText(record.stars || nestedCharacter.stars || starsAttr.displayValue || starsAttr.value),
  }
}

const normalizeLineupCharacters = (source: unknown): LineupCharacterPreview[] =>
  toArray(source).map(item => {
    const record = isRecord(item) ? item : {}
    // 后端 member 形态：{ characterId, familyKey, elementKey, isCore, character }
    if (isRecord(record.character)) {
      return normalizeCharacterPreview({
        ...record.character,
        characterId: record.characterId || record.character.characterId || record.character.id,
        familyKey: record.familyKey || record.character.familyKey,
        familyName: record.familyName || record.character.familyName,
        elementKey: record.elementKey || record.character.elementKey,
        elementName: record.elementName || record.character.elementName,
        archetype: record.archetype || record.character.archetype,
        stars: record.stars || record.character.stars,
        awaken: record.awaken || record.character.awaken,
      })
    }
    return normalizeCharacterPreview(record)
  })

export const normalizeLineupSummary = (source: unknown): AdminLineupSummary => {
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

export const normalizeUserLineupSummary = (source: unknown): UserLineupSummary => {
  const record = isRecord(source) ? source : {}
  return { ...normalizeLineupSummary(record), ...normalizeInteraction(record) }
}

export const normalizeLineupOption = (source: unknown): LineupOption => {
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

export const normalizeCharacterOption = (source: unknown): CharacterOption => {
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

export const normalizePublicLineup = (source: unknown): PublicLineup => {
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

export const normalizeAdminLineupDetail = (res: unknown): AdminLineupDetail => {
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

export const normalizeUserLineupDetail = (res: unknown): UserLineupDetail => ({
  ...normalizeAdminLineupDetail(res),
  ...normalizeInteraction(extractData(res)),
})

export const normalizeAdminLineupListResult = (res: unknown): AdminLineupListResult => {
  const data = extractData(res)
  return {
    items: toArray(data.items).map(normalizeLineupSummary),
    pagination: normalizePagination(data.pagination),
  }
}

export const normalizeUserLineupListResult = (res: unknown): UserLineupListResult => {
  const data = extractData(res)
  return {
    items: toArray(data.items).map(normalizeUserLineupSummary),
    pagination: normalizePagination(data.pagination),
  }
}

export const normalizeLineupOptions = (res: unknown): LineupOption[] => {
  const data = extractData(res)
  const items = Array.isArray(data.items) ? data.items : Array.isArray(res) ? res : []
  return items.map(normalizeLineupOption)
}

export const normalizeLineupTypes = (res: unknown): LineupTypeOption[] => {
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

export const normalizeCharacterOptionResult = (res: unknown): CharacterOptionResult => {
  // http 拦截器已解包 data；兼容 {items,pagination} / {list} / {results} / 直接数组
  const root = isRecord(res) ? res : {}
  const data = isRecord(root.data) && !Array.isArray(root.items) ? root.data : root
  const rawItems = Array.isArray(res)
    ? res
    : toArray(data.items).length
      ? toArray(data.items)
      : toArray(data.list).length
        ? toArray(data.list)
        : toArray(data.results).length
          ? toArray(data.results)
          : toArray(data.records)

  const paginationSource = data.pagination || {
    page: data.page,
    limit: data.limit ?? data.pageSize,
    total: data.total ?? data.totalResults,
    totalPages: data.totalPages,
    hasNext: data.hasNext ?? data.hasNextPage,
    hasPrev: data.hasPrev ?? data.hasPrevPage,
  }

  return {
    items: rawItems.map(normalizeCharacterOption).filter(item => Boolean(item.characterId || item.id)),
    pagination: normalizePagination(paginationSource),
  }
}

export const normalizeRelationDetail = (res: unknown): RelationDetail => {
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

export const normalizeReactionResult = (res: unknown, lineupId = ''): ReactionResult => {
  const data = extractData(res)
  const interaction = isRecord(data.interaction) ? data.interaction : data
  const favorite = isRecord(data.favorite) ? data.favorite : {}
  return {
    id: toText(data.id) || lineupId,
    likeCount: toNumber(interaction.likeCount),
    dislikeCount: toNumber(interaction.dislikeCount),
    score: toNumber(interaction.score),
    myReaction: toNumber(interaction.myReaction),
    favoriteCount: toNumber(interaction.favoriteCount ?? favorite.count),
    isFavorited: Boolean(interaction.isFavorited ?? favorite.isFavorited),
  }
}

const sortRelatedLineupsByScore = (list: UserLineupSummary[]): UserLineupSummary[] =>
  [...list].sort((a, b) => {
    if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0)
    if ((b.likeCount ?? 0) !== (a.likeCount ?? 0)) return (b.likeCount ?? 0) - (a.likeCount ?? 0)
    return 0
  })

const normalizeRelatedLineupItem = (source: unknown): RelatedLineupItem | null => {
  const record = isRecord(source) ? source : {}
  // 后端标准：{ lineup, relation: { id, description } }
  const lineupSource = record.lineup || record
  const relation = isRecord(record.relation) ? record.relation : {}
  const lineup = normalizeUserLineupSummary(lineupSource)
  if (!lineup.id) return null
  return {
    lineup,
    relationId: toText(relation.id || record.relationId),
    relationDescription: toText(relation.description || record.relationDescription || record.description),
    relationSource: toText(relation.source || record.relationSource),
    relationCreatedBy:
      relation.createdBy != null ? toText(relation.createdBy) : record.relationCreatedBy != null ? toText(record.relationCreatedBy) : null,
    relationUpdatedBy:
      relation.updatedBy != null ? toText(relation.updatedBy) : record.relationUpdatedBy != null ? toText(record.relationUpdatedBy) : null,
    relationCreatedAt: toText(relation.createdAt || record.relationCreatedAt),
    relationUpdatedAt: toText(relation.updatedAt || record.relationUpdatedAt),
    relationCanEdit: Boolean(relation.canEdit ?? record.relationCanEdit),
  }
}

export const normalizeRelationGroup = (source: unknown): LineupRelationGroup => {
  const record = isRecord(source) ? source : {}
  const lineupSource = record.lineup || record.sourceLineup || record.mainLineup || record.defenseLineup || record.offenseLineup || record
  const relatedSource =
    record.relatedLineups ||
    record.targetLineups ||
    record.counters ||
    record.counterLineups ||
    record.incomingLineups ||
    record.sourceLineups ||
    []

  const relatedLineups = toArray(relatedSource)
    .map(normalizeRelatedLineupItem)
    .filter((item): item is RelatedLineupItem => Boolean(item))

  return {
    lineup: normalizeUserLineupSummary(lineupSource),
    relatedLineups: sortRelatedLineupsByScore(relatedLineups.map(item => item.lineup)).map(sorted => {
      const found = relatedLineups.find(item => item.lineup.id === sorted.id)
      return (
        found || {
          lineup: sorted,
          relationId: '',
          relationDescription: '',
          relationSource: '',
          relationCreatedBy: null,
          relationUpdatedBy: null,
          relationCreatedAt: '',
          relationUpdatedAt: '',
          relationCanEdit: false,
        }
      )
    }),
  }
}

export const normalizePublicLineupRelations = (res: unknown, fallbackType = ''): PublicLineupRelationResult => {
  const data = extractData(res)
  // controller: { type, relationMode, items, pagination }
  const rawGroups = data.items || data.results || data.groups || data.list || []
  const paginationSource = data.pagination || {
    page: data.page,
    limit: data.limit,
    total: data.total ?? data.totalResults,
    totalPages: data.totalPages,
    hasNext: data.hasNext,
    hasPrev: data.hasPrev,
  }
  return {
    type: toText(data.type) || fallbackType,
    relationMode: toText(data.relationMode || data.mode),
    results: toArray(rawGroups)
      .map(normalizeRelationGroup)
      .filter(group => Boolean(group.lineup.id)),
    pagination: normalizePagination(paginationSource),
  }
}

export const normalizeCharacterLineupUsage = (res: unknown): CharacterLineupUsage => {
  const data = extractData(res)
  return {
    lineups: toArray(data.lineups).map(normalizePublicLineup),
  }
}

const normalizeContainerLineupInfo = (source: unknown): ContainerLineupInfo | null => {
  if (!isRecord(source)) return null
  return {
    id: toText(source.id),
    name: toText(source.name),
    type: toText(source.type),
  }
}

const normalizeContainerItem = (source: unknown): LineupMappingContainerItem => {
  const record = isRecord(source) ? source : {}
  return {
    itemId: toText(record.itemId),
    lineupId: toText(record.lineupId),
    order: toNumber(record.order),
    lineup: normalizeContainerLineupInfo(record.lineup),
    likeCount: toNumber(record.likeCount),
    dislikeCount: toNumber(record.dislikeCount),
    score: toNumber(record.score),
    myReaction: toNumber(record.myReaction),
  }
}

const normalizeContainer = (source: unknown): LineupMappingContainer => {
  const record = isRecord(source) ? source : {}
  return {
    containerId: toText(record.containerId),
    items: toArray(record.items).map(normalizeContainerItem),
  }
}

const normalizeLineupMappingData = (source: unknown): LineupMapping => {
  const record = isRecord(source) ? source : {}
  return {
    id: toText(record.id),
    gameId: toText(record.gameId),
    name: toText(record.name),
    description: toText(record.description),
    status: toText(record.status) || 'active',
    sourceContainer: normalizeContainer(record.sourceContainer),
    targetContainer: normalizeContainer(record.targetContainer),
    createdBy: record.createdBy != null ? toText(record.createdBy) : null,
    canEdit: Boolean(record.canEdit),
    createdAt: toText(record.createdAt),
    updatedAt: toText(record.updatedAt),
  }
}

export const normalizeLineupMappingResponse = (res: unknown): LineupMapping => {
  const data = extractData(res)
  const record = data.id || data.sourceContainer ? data : isRecord(res) ? res : {}
  return normalizeLineupMappingData(record)
}

export const normalizeLineupMappingListResult = (res: unknown): LineupMappingListResult => {
  const data = extractData(res)
  return {
    items: toArray(data.items).map(item => normalizeLineupMappingData(item)),
    pagination: normalizePagination(data),
  }
}

export const normalizeContainerReactionResult = (res: unknown): ContainerReactionResult => {
  const data = extractData(res)
  return {
    likeCount: toNumber(data.likeCount),
    dislikeCount: toNumber(data.dislikeCount),
    score: toNumber(data.score),
    myReaction: toNumber(data.myReaction),
  }
}
