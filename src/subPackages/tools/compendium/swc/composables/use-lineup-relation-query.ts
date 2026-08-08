import { computed, ref, type Ref } from 'vue'
import {
  getCompendiumsLineupRelations,
  postLineupsLineupIdReaction,
} from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/apifox'
import { getAnonymousId } from '@/utils/anonymous-id'
import type {
  CharacterOption,
  LineupRelationGroup,
  PaginationState,
  ReactionResult,
  ReactionValue,
  UserLineupSummary,
} from '../lineup-types'
import { normalizePublicLineupRelations, normalizeReactionResult } from '../lineup-normalizers'
import { buildAnonymousRequestConfig, sanitizeQuery } from '../request-options'

export type LineupCounterMode = '占领战防守' | '占领战进攻'
export type RelationEmptyReason = 'idle' | 'no_characters' | 'no_lineups' | 'error'

const DEFAULT_PAGE_SIZE = 20

const createDefaultPagination = (pageSize: number): PaginationState => ({
  page: 1,
  limit: pageSize,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
})

const createCharacterOption = (characterId: string, option: Partial<CharacterOption> = {}): CharacterOption => ({
  id: option.id || characterId,
  characterId,
  name: option.name || option.label || characterId,
  label: option.label || option.name || characterId,
  avatar: option.avatar || '',
  element: option.element || '',
  elementKey: option.elementKey || '',
  elementName: option.elementName || '',
  archetype: option.archetype || '',
  familyKey: option.familyKey || '',
  familyName: option.familyName || '',
  awaken: option.awaken || '',
  awakenName: option.awakenName || '',
  stars: option.stars || '',
  status: option.status || 'enabled',
})

const patchGroupsReaction = (groups: LineupRelationGroup[], reaction: ReactionResult): LineupRelationGroup[] =>
  groups.map(group => ({
    lineup:
      group.lineup.id === reaction.id
        ? {
            ...group.lineup,
            likeCount: reaction.likeCount,
            dislikeCount: reaction.dislikeCount,
            score: reaction.score,
            myReaction: reaction.myReaction,
          }
        : group.lineup,
    relatedLineups: group.relatedLineups.map(item =>
      item.id === reaction.id
        ? {
            ...item,
            likeCount: reaction.likeCount,
            dislikeCount: reaction.dislikeCount,
            score: reaction.score,
            myReaction: reaction.myReaction,
          }
        : item,
    ),
  }))

export const useLineupRelationQuery = (params: { compendiumId: string; locale: Ref<string>; pageSize?: number }) => {
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZE
  const selectedMode = ref<LineupCounterMode>('占领战防守')
  const selectedCharacters = ref<CharacterOption[]>([])
  const results = ref<LineupRelationGroup[]>([])
  const pagination = ref<PaginationState>(createDefaultPagination(pageSize))
  const loading = ref(false)
  const loadingMore = ref(false)
  const reactingId = ref('')
  const errorMessage = ref('')
  const emptyReason = ref<RelationEmptyReason>('no_characters')
  let requestVersion = 0

  const selectedCharacterIds = computed(() => selectedCharacters.value.map(item => item.characterId).filter(Boolean))
  const isDefenseMode = computed(() => selectedMode.value === '占领战防守')
  const primaryLabel = computed(() => (isDefenseMode.value ? '防守阵容' : '进攻阵容'))
  const relatedLabel = computed(() => (isDefenseMode.value ? '克制阵容' : '可克制防守'))
  const hasResults = computed(() => results.value.length > 0)

  const setMode = (mode: LineupCounterMode) => {
    if (selectedMode.value === mode) return
    selectedMode.value = mode
    void refresh()
  }

  const setSelectedCharacters = (items: CharacterOption[]) => {
    selectedCharacters.value = items.map(item => createCharacterOption(item.characterId || item.id, item))
  }

  const removeCharacter = (characterId: string) => {
    selectedCharacters.value = selectedCharacters.value.filter(item => item.characterId !== characterId)
    void refresh()
  }

  const clearCharacters = () => {
    selectedCharacters.value = []
    results.value = []
    pagination.value = createDefaultPagination(pageSize)
    errorMessage.value = ''
    emptyReason.value = 'no_characters'
  }

  const applyRouteQuery = (options: Record<string, string | undefined>) => {
    const type = (options.type || '').trim()
    if (type === '占领战进攻' || type === '进攻') selectedMode.value = '占领战进攻'
    if (type === '占领战防守' || type === '防守') selectedMode.value = '占领战防守'

    const characterIds = (options.characterIds || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
    if (characterIds.length) {
      selectedCharacters.value = characterIds.map(id => createCharacterOption(id))
    }
  }

  const fetchPage = async (page: number, append: boolean) => {
    if (!selectedCharacterIds.value.length) {
      results.value = []
      pagination.value = createDefaultPagination(pageSize)
      errorMessage.value = ''
      emptyReason.value = 'no_characters'
      return
    }

    const currentVersion = ++requestVersion
    if (append) loadingMore.value = true
    else loading.value = true
    errorMessage.value = ''

    try {
      const result = normalizePublicLineupRelations(
        await getCompendiumsLineupRelations(
          sanitizeQuery({
            compendiumId: params.compendiumId,
            type: selectedMode.value,
            characterIds: selectedCharacterIds.value.join(','),
            locale: params.locale.value,
            page,
            pageSize,
          }) as any,
          buildAnonymousRequestConfig(),
        ),
        selectedMode.value,
      )

      if (currentVersion !== requestVersion) return

      results.value = append ? [...results.value, ...result.results] : result.results
      pagination.value = result.pagination
      emptyReason.value = result.results.length ? 'idle' : 'no_lineups'
    } catch (error) {
      if (currentVersion !== requestVersion) return
      if (!append) {
        results.value = []
        pagination.value = createDefaultPagination(pageSize)
      }
      emptyReason.value = 'error'
      errorMessage.value = typeof error === 'string' ? error : '查询克制关系失败，请稍后重试'
    } finally {
      if (currentVersion === requestVersion) {
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  const refresh = async () => {
    await fetchPage(1, false)
  }

  const loadMore = async () => {
    if (loading.value || loadingMore.value || !pagination.value.hasNext) return
    await fetchPage(pagination.value.page + 1, true)
  }

  const patchLineupReaction = (reaction: ReactionResult) => {
    results.value = patchGroupsReaction(results.value, {
      ...reaction,
      id: reaction.id,
    })
  }

  const handleReaction = async (lineup: UserLineupSummary, value: ReactionValue) => {
    if (!lineup.id || reactingId.value) return
    reactingId.value = lineup.id
    try {
      const result = normalizeReactionResult(
        await postLineupsLineupIdReaction(
          lineup.id,
          { value, anonymousId: getAnonymousId() } as any,
          buildAnonymousRequestConfig(),
        ),
        lineup.id,
      )
      patchLineupReaction({
        id: result.id || lineup.id,
        likeCount: result.likeCount,
        dislikeCount: result.dislikeCount,
        score: result.score,
        myReaction: result.myReaction,
      })
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '操作失败，请稍后重试',
        icon: 'none',
      })
    } finally {
      reactingId.value = ''
    }
  }

  return {
    selectedMode,
    selectedCharacters,
    selectedCharacterIds,
    results,
    pagination,
    loading,
    loadingMore,
    reactingId,
    errorMessage,
    emptyReason,
    isDefenseMode,
    primaryLabel,
    relatedLabel,
    hasResults,
    setMode,
    setSelectedCharacters,
    removeCharacter,
    clearCharacters,
    applyRouteQuery,
    refresh,
    loadMore,
    handleReaction,
    createCharacterOption,
  }
}
