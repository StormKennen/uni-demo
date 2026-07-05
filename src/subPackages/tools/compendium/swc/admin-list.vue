<template>
  <!-- #ifdef H5 -->
  <view class="swc-admin-page">
    <PageLayout title="魔灵召唤·图鉴管理" nav-gradient="linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)" />

    <view v-if="!canManage" class="state-block">
      <text>{{ blockedText }}</text>
    </view>

    <template v-else>
      <view class="filter-bar">
        <view class="filter-group">
          <text class="filter-label">五行</text>
          <view class="chip-row">
            <view
              v-for="option in elementOptions"
              :key="option.value"
              class="chip"
              :class="{ selected: option.value === selectedElement }"
              @click="changeElement(option.value)">
              {{ option.label }}
            </view>
          </view>
        </view>

        <view class="filter-group">
          <text class="filter-label">星级排序</text>
          <view class="chip-row">
            <view class="chip" @click="toggleStarSortOrder">
              {{ starSortLabel }}
            </view>
          </view>
        </view>
      </view>

      <view v-if="loading && rows.length === 0" class="state-block">
        <text>加载魔灵中...</text>
      </view>

      <view v-else-if="errorMessage" class="state-block">
        <text>{{ errorMessage }}</text>
        <button class="retry-btn" @click="refreshRows">重试</button>
      </view>

      <view v-else-if="rows.length === 0" class="state-block">
        <text>暂无符合条件的魔灵</text>
      </view>

      <view v-else class="row-list">
        <view v-for="row in rows" :key="row.characterId" class="row-card">
          <view class="row-head">
            <image v-if="row.avatar" class="avatar" :src="row.avatar" mode="aspectFill" lazy-load />
            <view v-else class="avatar avatar-placeholder">
              <text>{{ row.zhName.slice(0, 1) || '?' }}</text>
            </view>

            <view class="head-main">
              <text class="title">{{ row.zhName || '未命名魔灵' }}</text>
              <text class="sub-title">EN：{{ row.enName || '—' }}</text>
            </view>

            <button class="save-btn top" :loading="row.submitting" :disabled="row.submitting" @click="saveRow(row)"> 保存 </button>
          </view>

          <view class="field-grid">
            <view class="field">
              <text class="field-label">中文名(zh-CN)</text>
              <input v-model="row.zhName" class="field-input" placeholder="请输入中文名" />
            </view>

            <view class="field">
              <text class="field-label">英文名(en)</text>
              <input v-model="row.enName" class="field-input" placeholder="请输入英文名" />
            </view>

            <view class="field narrow">
              <text class="field-label">星级</text>
              <input v-model="row.starsText" class="field-input" type="number" placeholder="请输入星级" />
            </view>

            <view class="field wide">
              <text class="field-label">别名(zh-CN)</text>
              <input v-model="row.zhAliasesText" class="field-input" placeholder="用「、」分隔多个别名" />
            </view>
          </view>

          <view class="row-actions">
            <view class="expand-link" @click="toggleSkills(row)">
              <text>{{ row.skillsExpanded ? '收起技能' : '展开技能' }}</text>
            </view>
            <text class="meta-hint">ID：{{ row.characterId }}</text>
          </view>

          <view v-if="row.skillsExpanded" class="skills-panel">
            <view v-if="row.skillsLoading" class="skills-state">加载技能中...</view>
            <template v-else>
              <view v-if="row.skills.length === 0" class="skills-state">当前人物暂无技能数据</view>
              <view
                v-else
                v-for="(skill, skillIndex) in row.skills"
                :key="skill.id || `${row.characterId}-${skillIndex}`"
                class="skill-block">
                <view class="skill-head">
                  <text class="skill-index">技能 {{ skillIndex + 1 }}</text>
                  <text v-if="skill.type" class="skill-type">{{ skill.type }}</text>
                </view>

                <view class="skill-grid">
                  <view class="field">
                    <text class="field-label">中文技能名</text>
                    <input v-model="skill.name" class="field-input" placeholder="请输入技能名" />
                  </view>

                  <view class="field">
                    <text class="field-label">技能描述</text>
                    <textarea v-model="skill.description" class="field-textarea" placeholder="请输入技能描述" :maxlength="2000" />
                  </view>
                </view>
              </view>
            </template>
          </view>
        </view>
      </view>

      <view v-if="loading && rows.length > 0" class="load-more">继续加载...</view>
      <view v-else-if="!hasNext && rows.length > 0" class="load-more muted">没有更多了</view>
    </template>
  </view>
  <!-- #endif -->

  <!-- #ifndef H5 -->
  <view class="swc-admin-page">
    <view class="state-block">
      <text>仅 H5 管理端可用</text>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onReachBottom } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import { getCompendiumsCharacter, getCompendiumsCharacters } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type {
    getCompendiumsCharacterQuery,
    getCompendiumsCharactersQuery,
    getCompendiumsCharactersRes,
  } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'
  import { patchAdminCompendiumsCharacters } from '@/services/apifox/NODEJSDEMO/COMPENDIUMADMIN/apifox'
  import { getUserInfo } from '@/utils/storage'
  import {
    buildAttributesPayload,
    buildCategoriesPayload,
    cloneAttribute,
    extractData,
    normalizeNumberLike,
    readStarsAttributeText,
    toArray,
    toNumberValue,
    toText,
    type CharacterRecord,
  } from './character-payload'
  import { toSwcCharacterView, type SwcCharacterView } from './utils'

  interface FilterOption {
    label: string
    value: string
  }

  interface CharacterCategory {
    key: string
    name: string
    valueKey: string
    value: string
  }

  interface CharacterAttribute {
    key: string
    name: string
    value: string
    displayValue: string
    unit: string
  }

  interface SkillCoefficientForm {
    id: string
    key: string
    name: string
    valueText: string
    unit: string
    level: string
    formula: string
    description: string
    triggerProbabilityText: string
    triggerUnit: string
    condition: string
    attachment: string
  }

  interface SkillForm {
    id: string
    code: string
    name: string
    type: string
    description: string
    hitCountText: string
    sortOrder: number
    coefficients: SkillCoefficientForm[]
  }

  interface AdminCharacterRow extends SwcCharacterView {
    enName: string
    zhName: string
    zhAliasesText: string
    loadedZhName: string
    loadedEnName: string
    starsText: string
    skillsExpanded: boolean
    skillsLoaded: boolean
    skillsLoading: boolean
    submitting: boolean
    zhDetail: CharacterRecord | null
    enDetail: CharacterRecord | null
    skills: SkillForm[]
  }

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const PAGE_SIZE = 50
  const ALL_VALUE = 'all'

  const elementOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '火', value: 'fire' },
    { label: '水', value: 'water' },
    { label: '风', value: 'wind' },
    { label: '光', value: 'light' },
    { label: '暗', value: 'dark' },
  ]

  // #ifdef H5
  const isPlatformH5 = true
  // #endif
  // #ifndef H5
  const isPlatformH5 = false
  // #endif

  const selectedElement = ref(ALL_VALUE)
  const selectedStarSortOrder = ref<'asc' | 'desc'>('desc')
  const rows = ref<AdminCharacterRow[]>([])
  const page = ref(1)
  const hasNext = ref(true)
  const loading = ref(false)
  const errorMessage = ref('')
  const requestSequence = ref(0)

  const isAdmin = computed(() => getUserInfo()?.role === 'admin')
  const canManage = computed(() => isPlatformH5 && isAdmin.value)
  const blockedText = computed(() => (isPlatformH5 ? '仅管理员可用' : '仅 H5 管理端可用'))
  const starSortLabel = computed(() => `星级${selectedStarSortOrder.value === 'desc' ? '↓' : '↑'}`)

  type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[]
  type CompendiumCharactersQueryParams = getCompendiumsCharactersQuery & {
    'categories[element]'?: string
  }

  interface PaginationLike {
    hasNext?: boolean
    hasNextPage?: boolean
    page?: number
    totalPages?: number
  }

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const readRecordValue = (record: Record<string, unknown>, key: string): RecordValue => record[key] as RecordValue

  const stringifyValue = (value: RecordValue): string => {
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? '是' : '否'
    return ''
  }

  const readString = (record: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
      const value = readRecordValue(record, key)
      const text = stringifyValue(value)
      if (text) return text
    }
    return ''
  }

  const readArray = (record: Record<string, unknown>, keys: string[]): unknown[] => {
    for (const key of keys) {
      const value = record[key]
      if (Array.isArray(value)) return value
    }
    return []
  }

  const readPagination = (record: Record<string, unknown>): PaginationLike => {
    const pagination = record.pagination
    if (isRecord(pagination)) return pagination as PaginationLike
    return {}
  }

  const normalizeCategory = (source: unknown): CharacterCategory | null => {
    if (!isRecord(source)) return null
    return {
      key: readString(source, ['key']),
      name: readString(source, ['name']),
      valueKey: readString(source, ['valueKey']),
      value: readString(source, ['value']),
    }
  }

  const normalizeAttribute = (source: unknown): CharacterAttribute | null => {
    if (!isRecord(source)) return null
    return {
      key: readString(source, ['key']),
      name: readString(source, ['name']),
      value: readString(source, ['value']),
      displayValue: readString(source, ['displayValue']),
      unit: readString(source, ['unit']),
    }
  }

  const getCategoryValue = (categories: CharacterCategory[], key: string): string =>
    categories.find(category => category.key === key)?.value || ''

  const getCategoryValueKey = (categories: CharacterCategory[], key: string): string =>
    categories.find(category => category.key === key)?.valueKey || ''

  const normalizeElementKey = (value: string): string => {
    const map: Record<string, string> = {
      火: 'fire',
      水: 'water',
      风: 'wind',
      光: 'light',
      暗: 'dark',
    }
    return map[value] || value
  }

  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http://')) return url.replace(/^http:/, 'https:')
    return url
  }

  const normalizeSkillCoefficient = (source: unknown): SkillCoefficientForm => {
    const coefficient = isRecord(source) ? source : {}
    return {
      id: toText(coefficient.id),
      key: toText(coefficient.key),
      name: toText(coefficient.name) || toText(coefficient.level),
      valueText: toText(coefficient.value),
      unit: toText(coefficient.unit),
      level: toText(coefficient.level),
      formula: toText(coefficient.formula),
      description: toText(coefficient.description),
      triggerProbabilityText: toText(coefficient.triggerProbability),
      triggerUnit: toText(coefficient.triggerUnit),
      condition: toText(coefficient.condition),
      attachment: toText(coefficient.attachment),
    }
  }

  const normalizeSkill = (source: unknown, index: number): SkillForm => {
    const skill = isRecord(source) ? source : {}
    const coefficients = Array.isArray(skill.coefficients) ? skill.coefficients : []

    return {
      id: toText(skill.id),
      code: toText(skill.code),
      name: toText(skill.name) || `技能 ${index + 1}`,
      type: toText(skill.type),
      description: toText(skill.description),
      hitCountText: toText(skill.hitCount),
      sortOrder: Number(skill.sortOrder) || index,
      coefficients: coefficients.map(normalizeSkillCoefficient),
    }
  }

  const normalizeCharacterPreview = (source: unknown): SwcCharacterView | null => {
    if (!isRecord(source)) return null

    const nestedCharacter = ['representative', 'representativeCharacter', 'character', 'item'].map(key => source[key]).find(isRecord)
    const characterSource = nestedCharacter || source
    const groupSource = isRecord(source.group) ? source.group : null

    const id = readString(characterSource, ['id', 'characterId', 'code'])
    if (!id) return null

    const categories = readArray(characterSource, ['categories'])
      .map(normalizeCategory)
      .filter((item): item is CharacterCategory => Boolean(item))
    const attributes = readArray(characterSource, ['attributes']).map(cloneAttribute)
    const elementKey = normalizeElementKey(getCategoryValueKey(categories, 'element') || readString(characterSource, ['element']))
    const elementName = getCategoryValue(categories, 'element') || readString(characterSource, ['elementName'])
    const stars = readStarsAttributeText(attributes) || readString(characterSource, ['level', 'star', 'rarity'])
    const awaken = getCategoryValue(categories, 'awaken') || readString(characterSource, ['awaken', 'awakening', 'awakened'])
    const avatar = readString(characterSource, ['avatar', 'icon', 'image', 'cover', 'portrait'])
    const groupFamily =
      readString(source, ['groupValue', 'groupName', 'familyName']) ||
      (groupSource ? readString(groupSource, ['value', 'name', 'label', 'key']) : '')

    return toSwcCharacterView({
      characterId: id,
      name: readString(characterSource, ['name', 'title']),
      avatar: normalizeUrl(avatar),
      elementKey,
      elementName,
      familyName: getCategoryValue(categories, 'family') || groupFamily,
      archetype: getCategoryValue(categories, 'archetype') || readString(characterSource, ['speciesType', 'type']),
      stars: stars.replace(/星$/, ''),
      awaken,
    })
  }

  const getCharacterId = (source: unknown): string => {
    if (!isRecord(source)) return ''
    return readString(source, ['characterId', 'id', 'code'])
  }

  const extractItems = (res: getCompendiumsCharactersRes): unknown[] => {
    if (Array.isArray(res)) return res
    if (!isRecord(res)) return []

    const directItems = readArray(res, ['items', 'list', 'records', 'data'])
    if (directItems.length) return directItems

    const nestedData = res.data
    if (isRecord(nestedData)) return readArray(nestedData, ['items', 'list', 'records'])
    return []
  }

  const buildQuery = (locale: string, pageNumber: number): CompendiumCharactersQueryParams => {
    const query: CompendiumCharactersQueryParams = {
      compendiumId: COMPENDIUM_CODE,
      locale,
      page: pageNumber,
      pageSize: PAGE_SIZE,
      sortBy: 'stars',
      sortOrder: selectedStarSortOrder.value,
    }

    if (selectedElement.value !== ALL_VALUE) {
      query['categories[element]'] = selectedElement.value
    }

    return query
  }

  const fetchCharacterDetails = async (characterId: string, locale: 'zh-CN' | 'en') => {
    const query: getCompendiumsCharacterQuery = {
      compendiumId: COMPENDIUM_CODE,
      characterId,
      locale,
    }
    const res = await getCompendiumsCharacter(query)
    return extractData(res)
  }

  const buildSkillPayload = (skill: SkillForm) => ({
    id: skill.id || undefined,
    code: skill.code || undefined,
    name: skill.name || undefined,
    description: skill.description || undefined,
    hitCount: normalizeNumberLike(skill.hitCountText),
    sortOrder: skill.sortOrder,
    coefficients: skill.coefficients.map(coefficient => ({
      id: coefficient.id || undefined,
      key: coefficient.key || undefined,
      name: coefficient.name || undefined,
      level: coefficient.level || undefined,
      formula: coefficient.formula || undefined,
      description: coefficient.description || undefined,
      unit: coefficient.unit || undefined,
      condition: coefficient.condition || undefined,
      attachment: coefficient.attachment || undefined,
      triggerProbability: normalizeNumberLike(coefficient.triggerProbabilityText),
      triggerUnit: coefficient.triggerUnit || undefined,
      value: normalizeNumberLike(coefficient.valueText),
    })),
  })

  const splitAliases = (value: string): string[] =>
    value
      .split(/[、,，\n]+/)
      .map(item => item.trim())
      .filter(Boolean)

  const normalizeRow = (zhSource: unknown, enSource: unknown): AdminCharacterRow | null => {
    const preview = normalizeCharacterPreview(zhSource)
    if (!preview) return null

    const zhRecord = isRecord(zhSource) ? zhSource : {}
    const enRecord = isRecord(enSource) ? enSource : {}
    const zhAliases = toArray(zhRecord.aliases).map(toText).filter(Boolean)
    const enName = readString(enRecord, ['name', 'title']) || preview.name
    const starsText = readStarsAttributeText(toArray(zhRecord.attributes).map(cloneAttribute)) || preview.stars

    return {
      ...preview,
      zhName: preview.name,
      enName,
      loadedZhName: preview.name,
      loadedEnName: enName,
      zhAliasesText: zhAliases.join('、'),
      starsText,
      skillsExpanded: false,
      skillsLoaded: false,
      skillsLoading: false,
      submitting: false,
      zhDetail: null,
      enDetail: null,
      skills: [],
    }
  }

  const applySavedRowSnapshot = (row: AdminCharacterRow, data: CharacterRecord) => {
    const nextZhName = toText(data.name) || row.zhName
    const nextAliases = toArray(data.aliases).map(toText).filter(Boolean)
    const nextStars = readStarsAttributeText(toArray(data.attributes).map(cloneAttribute)) || row.starsText

    row.zhDetail = data
    row.zhName = nextZhName
    row.loadedZhName = nextZhName
    row.zhAliasesText = nextAliases.join('、')
    row.starsText = nextStars

    if (Array.isArray(data.skills)) {
      row.skills = data.skills.map(normalizeSkill)
      row.skillsLoaded = true
    }
  }

  const applySavedEnSnapshot = (row: AdminCharacterRow, data: CharacterRecord) => {
    const nextEnName = toText(data.name) || row.enName
    row.enDetail = data
    row.enName = nextEnName
    row.loadedEnName = nextEnName
  }

  const loadRows = async (reset = false) => {
    if (!canManage.value) return
    if (loading.value && !reset) return
    if (!reset && !hasNext.value) return

    const requestId = reset ? requestSequence.value + 1 : requestSequence.value
    requestSequence.value = requestId
    loading.value = true
    errorMessage.value = ''

    if (reset) {
      page.value = 1
      hasNext.value = true
      rows.value = []
    }

    try {
      const currentPage = page.value
      const [zhRes, enRes] = await Promise.all([
        getCompendiumsCharacters(buildQuery(DEFAULT_LOCALE, currentPage)),
        getCompendiumsCharacters(buildQuery('en', currentPage)),
      ])
      if (requestId !== requestSequence.value) return

      const zhItems = extractItems(zhRes)
      const enItems = extractItems(enRes)
      const enMap = new Map<string, unknown>()
      enItems.forEach(item => {
        const characterId = getCharacterId(item)
        if (characterId) enMap.set(characterId, item)
      })

      const nextRows = zhItems
        .map(item => normalizeRow(item, enMap.get(getCharacterId(item))))
        .filter((item): item is AdminCharacterRow => Boolean(item))

      rows.value = reset ? nextRows : [...rows.value, ...nextRows]

      const pagination: PaginationLike = isRecord(zhRes) ? readPagination(zhRes) : {}
      const hasNextPage = Boolean(
        pagination.hasNext ||
        pagination.hasNextPage ||
        (pagination.totalPages && pagination.page && Number(pagination.page) < Number(pagination.totalPages)) ||
        nextRows.length >= PAGE_SIZE,
      )
      hasNext.value = hasNextPage
      page.value += 1
    } catch (error) {
      if (requestId !== requestSequence.value) return
      errorMessage.value = typeof error === 'string' ? error : '图鉴加载失败，请稍后重试'
    } finally {
      if (requestId === requestSequence.value) {
        loading.value = false
        uni.stopPullDownRefresh()
      }
    }
  }

  const refreshRows = () => {
    loadRows(true)
  }

  const changeElement = (value: string) => {
    if (value === selectedElement.value) return
    selectedElement.value = value
    refreshRows()
  }

  const toggleStarSortOrder = () => {
    selectedStarSortOrder.value = selectedStarSortOrder.value === 'desc' ? 'asc' : 'desc'
    refreshRows()
  }

  const loadRowSkills = async (row: AdminCharacterRow) => {
    if (row.skillsLoaded || row.skillsLoading) return
    row.skillsLoading = true
    try {
      const data = await fetchCharacterDetails(row.characterId, DEFAULT_LOCALE)
      row.zhDetail = data
      row.skills = Array.isArray(data.skills) ? data.skills.map(normalizeSkill) : []
      row.skillsLoaded = true
      if (!row.zhName) row.zhName = toText(data.name)
      if (!row.starsText) row.starsText = readStarsAttributeText(toArray(data.attributes).map(cloneAttribute))
      if (!row.zhAliasesText) row.zhAliasesText = toArray(data.aliases).map(toText).filter(Boolean).join('、')
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载技能失败，请稍后重试', icon: 'none' })
    } finally {
      row.skillsLoading = false
    }
  }

  const toggleSkills = async (row: AdminCharacterRow) => {
    row.skillsExpanded = !row.skillsExpanded
    if (row.skillsExpanded && !row.skillsLoaded) {
      await loadRowSkills(row)
    }
  }

  const verifyStarsAfterPatch = async (
    patchData: CharacterRecord,
    submittedStarsValue: number,
    row: AdminCharacterRow,
    body: Record<string, unknown>,
  ): Promise<boolean> => {
    const responseStarsValue = toNumberValue(readStarsAttributeText(toArray(patchData.attributes).map(cloneAttribute)))
    let actualStarsValue = responseStarsValue

    if (actualStarsValue === undefined) {
      try {
        const confirmData = await fetchCharacterDetails(row.characterId, DEFAULT_LOCALE)
        actualStarsValue = toNumberValue(readStarsAttributeText(toArray(confirmData.attributes).map(cloneAttribute)))
      } catch (verifyError) {
        console.warn('[swc/admin-list] 保存后星级复核失败', {
          characterId: row.characterId,
          submittedStars: submittedStarsValue,
          actualStars: actualStarsValue,
          body,
          error: verifyError,
        })
        uni.showToast({ title: '已提交，暂时无法确认星级是否生效，请稍后查看', icon: 'none' })
        return false
      }
    }

    if (actualStarsValue !== undefined && Number(actualStarsValue) === Number(submittedStarsValue)) {
      return true
    }

    console.warn('[swc/admin-list] 保存后星级未确认或未落库', {
      characterId: row.characterId,
      submittedStars: submittedStarsValue,
      actualStars: actualStarsValue,
      body,
    })
    uni.showToast({ title: '已提交，但服务端未更新星级，请联系后端', icon: 'none' })
    return false
  }

  const saveRow = async (row: AdminCharacterRow) => {
    if (!canManage.value || row.submitting) return

    row.submitting = true
    try {
      const submittedStarsText = row.starsText.trim()
      const submittedStarsValue = toNumberValue(submittedStarsText)
      const shouldVerifyStars = Boolean(submittedStarsText)
      if (shouldVerifyStars && submittedStarsValue === undefined) {
        uni.showToast({ title: '星级请输入数字', icon: 'none' })
        return
      }

      const zhDetail = row.zhDetail || (await fetchCharacterDetails(row.characterId, DEFAULT_LOCALE))
      row.zhDetail = zhDetail
      const zhSkills = row.skillsLoaded ? row.skills : Array.isArray(zhDetail.skills) ? zhDetail.skills.map(normalizeSkill) : []
      const zhBody: Record<string, unknown> = {
        compendiumId: COMPENDIUM_CODE,
        characterId: row.characterId,
        locale: DEFAULT_LOCALE,
        name: row.zhName || undefined,
        skills: zhSkills.map(buildSkillPayload),
        attributes: buildAttributesPayload(toArray(zhDetail.attributes).map(cloneAttribute), submittedStarsValue),
        categories: buildCategoriesPayload(toArray(zhDetail.categories).map(cloneAttribute)),
        skins: toArray(zhDetail.skins),
        aliases: splitAliases(row.zhAliasesText),
      }

      const zhPatchResult = await patchAdminCompendiumsCharacters(zhBody as never)
      const zhPatchData = extractData(zhPatchResult)

      if (shouldVerifyStars) {
        const verified = await verifyStarsAfterPatch(zhPatchData, submittedStarsValue as number, row, zhBody)
        if (!verified) return
      }

      applySavedRowSnapshot(row, zhPatchData)

      if (row.enName !== row.loadedEnName) {
        const enDetail = await fetchCharacterDetails(row.characterId, 'en')
        row.enDetail = enDetail
        const enBody: Record<string, unknown> = {
          compendiumId: COMPENDIUM_CODE,
          characterId: row.characterId,
          locale: 'en',
          name: row.enName || undefined,
          skills: Array.isArray(enDetail.skills) ? enDetail.skills.map(normalizeSkill).map(buildSkillPayload) : [],
          attributes: buildAttributesPayload(toArray(enDetail.attributes).map(cloneAttribute), submittedStarsValue),
          categories: buildCategoriesPayload(toArray(enDetail.categories).map(cloneAttribute)),
          skins: toArray(enDetail.skins),
          aliases: toArray(enDetail.aliases).map(toText).filter(Boolean),
        }

        const enPatchResult = await patchAdminCompendiumsCharacters(enBody as never)
        const enPatchData = extractData(enPatchResult)
        applySavedEnSnapshot(row, enPatchData)
      }

      uni.showToast({ title: '保存成功', icon: 'success' })
    } catch (error) {
      const message = typeof error === 'string' ? error : '保存失败，请稍后重试'
      uni.showToast({ title: message, icon: 'none' })
    } finally {
      row.submitting = false
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    selectedElement.value = options.element || ALL_VALUE
    uni.setNavigationBarTitle({ title: '魔灵召唤·图鉴管理' })
    if (canManage.value) {
      loadRows(true)
    }
  })

  onReachBottom(() => {
    if (canManage.value) {
      loadRows()
    }
  })
</script>

<style scoped lang="scss">
  .swc-admin-page {
    min-height: 100vh;
    padding-bottom: 40rpx;
    background: #f7f8fb;
  }

  .filter-bar {
    margin: 24rpx;
    padding: 24rpx;
    border-radius: 20rpx;
    background: #fff;
    box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
  }

  .filter-group + .filter-group {
    margin-top: 20rpx;
  }

  .filter-label {
    display: block;
    margin-bottom: 12rpx;
    font-size: 24rpx;
    color: #64748b;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .chip {
    height: 56rpx;
    line-height: 56rpx;
    padding: 0 20rpx;
    border-radius: 999rpx;
    background: #f1f5f9;
    color: #334155;
    font-size: 24rpx;
  }

  .chip.selected {
    background: linear-gradient(135deg, #0f766e 0%, #38bdf8 100%);
    color: #fff;
  }

  .state-block {
    min-height: 420rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 28rpx;
  }

  .retry-btn,
  .save-btn {
    border-radius: 999rpx;
    background: linear-gradient(135deg, #0f766e 0%, #38bdf8 100%);
    color: #fff;
    font-size: 24rpx;
  }

  .retry-btn {
    margin-top: 16rpx;
    height: 66rpx;
    line-height: 66rpx;
    padding: 0 32rpx;
  }

  .row-list {
    padding: 0 24rpx 24rpx;
  }

  .row-card {
    margin-bottom: 20rpx;
    padding: 20rpx;
    border-radius: 24rpx;
    background: #fff;
    box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
  }

  .row-head {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 18rpx;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    color: #475569;
  }

  .head-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .title {
    font-size: 30rpx;
    font-weight: 600;
    color: #0f172a;
  }

  .sub-title,
  .meta-hint {
    font-size: 22rpx;
    color: #64748b;
  }

  .save-btn {
    min-width: 120rpx;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0 24rpx;
  }

  .field-grid {
    margin-top: 18rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .field.narrow {
    grid-column: span 1;
  }

  .field.wide {
    grid-column: span 2;
  }

  .field-label {
    font-size: 22rpx;
    color: #64748b;
  }

  .field-input,
  .field-textarea {
    width: 100%;
    box-sizing: border-box;
    border-radius: 16rpx;
    background: #f8fafc;
    border: 1rpx solid #e2e8f0;
    color: #0f172a;
    font-size: 26rpx;
    padding: 18rpx 20rpx;
  }

  .field-input {
    height: 72rpx;
  }

  .field-textarea {
    min-height: 120rpx;
  }

  .row-actions {
    margin-top: 16rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .expand-link {
    color: #0f766e;
    font-size: 24rpx;
  }

  .skills-panel {
    margin-top: 18rpx;
    padding: 18rpx;
    border-radius: 20rpx;
    background: #f8fafc;
  }

  .skills-state {
    font-size: 24rpx;
    color: #64748b;
  }

  .skill-block + .skill-block {
    margin-top: 16rpx;
  }

  .skill-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;
  }

  .skill-index,
  .skill-type {
    font-size: 24rpx;
    color: #334155;
  }

  .skill-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12rpx;
  }

  .load-more {
    padding: 24rpx 0 20rpx;
    text-align: center;
    color: #94a3b8;
    font-size: 24rpx;
  }

  .load-more.muted {
    color: #cbd5e1;
  }

  @media screen and (min-width: 900px) {
    .row-card {
      max-width: 1000px;
      margin-left: auto;
      margin-right: auto;
    }
  }
</style>
