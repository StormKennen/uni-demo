<template>
  <PageLayout title="魔灵召唤·图鉴管理" nav-gradient="linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)">
    <view class="swc-admin-page">
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
            <view v-if="!row.editing" class="row-readonly">
              <view class="row-head">
                <image v-if="row.avatar" class="avatar" :src="row.avatar" mode="aspectFill" lazy-load />
                <view v-else class="avatar avatar-placeholder">
                  <text>{{ row.zhName.slice(0, 1) || '?' }}</text>
                </view>

                <view class="head-main">
                  <text class="title">{{ row.zhName || '未命名魔灵' }}</text>
                  <text class="sub-title">EN：{{ row.enName || '—' }}</text>
                  <text class="sub-title">五行：{{ row.elementName || elementLabel(row.elementKey) || '—' }}</text>
                  <text class="sub-title">星级：{{ row.starsText || '—' }}</text>
                  <text class="sub-title aliases">别名：{{ row.aliasesPreview || '—' }}</text>
                </view>

                <button class="action-btn" @click="beginEdit(row)">编辑</button>
              </view>
            </view>

            <view v-else class="row-edit">
              <view class="row-head">
                <image v-if="row.avatar" class="avatar" :src="row.avatar" mode="aspectFill" lazy-load />
                <view v-else class="avatar avatar-placeholder">
                  <text>{{ row.draft.zhName.slice(0, 1) || '?' }}</text>
                </view>

                <view class="head-main">
                  <text class="title">{{ row.draft.zhName || row.zhName || '未命名魔灵' }}</text>
                  <text class="sub-title">EN：{{ row.draft.enName || row.enName || '—' }}</text>
                  <text class="sub-title">五行：{{ elementLabel(row.draft.elementKey) || '—' }}</text>
                  <text class="sub-title">星级：{{ row.draft.starsText || '—' }}</text>
                </view>

                <button class="action-btn ghost" :disabled="row.detailsLoading || row.submitting" @click="cancelEdit(row)">取消</button>
              </view>

              <view class="edit-form">
                <view class="field-grid">
                  <view class="field wide">
                    <text class="field-label">五行</text>
                    <picker
                      :range="elementOptions"
                      range-key="label"
                      :value="elementPickerIndex(row.draft.elementKey)"
                      @change="changeElementDraft(row, $event)">
                      <view class="picker-box">
                        <text>{{ elementLabel(row.draft.elementKey) || '请选择五行' }}</text>
                      </view>
                    </picker>
                  </view>

                  <view class="field narrow">
                    <text class="field-label">星级</text>
                    <input v-model="row.draft.starsText" class="field-input" type="number" placeholder="请输入星级" />
                  </view>
                </view>

                <view class="locale-section">
                  <text class="locale-title">中文</text>
                  <view class="field-grid single-col">
                    <view class="field">
                      <text class="field-label">名称</text>
                      <input v-model="row.draft.zhName" class="field-input" placeholder="请输入中文名" />
                    </view>

                    <view class="field">
                      <text class="field-label">别名</text>
                      <input v-model="row.draft.zhAliasesText" class="field-input" placeholder="用「、」或「/」分隔" />
                    </view>

                    <view class="field">
                      <text class="field-label">描述</text>
                      <textarea v-model="row.draft.zhDescription" class="field-textarea" placeholder="请输入中文描述" :maxlength="2000" />
                    </view>
                  </view>
                </view>

                <view class="locale-section">
                  <text class="locale-title">English</text>
                  <view class="field-grid single-col">
                    <view class="field">
                      <text class="field-label">Name</text>
                      <input v-model="row.draft.enName" class="field-input" placeholder="Enter English name" />
                    </view>

                    <view class="field">
                      <text class="field-label">Aliases</text>
                      <input v-model="row.draft.enAliasesText" class="field-input" placeholder="Use 、 or / to separate" />
                    </view>

                    <view class="field">
                      <text class="field-label">Description</text>
                      <textarea
                        v-model="row.draft.enDescription"
                        class="field-textarea"
                        placeholder="Enter English description"
                        :maxlength="2000" />
                    </view>
                  </view>
                </view>

                <view class="skills-panel">
                  <view class="skills-head">
                    <text class="locale-title">技能</text>
                    <text class="skills-hint">中文 / English 双语编辑，未改动字段会按原记录回传</text>
                  </view>

                  <view v-if="row.detailsLoading" class="skills-state">加载人物详情中...</view>
                  <view v-else-if="row.draft.skills.length === 0" class="skills-state">当前人物暂无技能数据</view>
                  <view v-else>
                    <view v-for="(skill, skillIndex) in row.draft.skills" :key="skill.key" class="skill-block">
                      <view class="skill-head-row">
                        <text class="skill-index">技能 {{ skillIndex + 1 }}</text>
                        <text class="skill-key" v-if="skill.key">{{ skill.key }}</text>
                      </view>

                      <view class="skill-locale-grid">
                        <view class="skill-locale-card">
                          <text class="skill-locale-title">中文</text>
                          <view class="field">
                            <text class="field-label">技能名称</text>
                            <input v-model="skill.zh.name" class="field-input" placeholder="请输入中文技能名" />
                          </view>
                          <view class="field">
                            <text class="field-label">技能描述</text>
                            <textarea
                              v-model="skill.zh.description"
                              class="field-textarea"
                              placeholder="请输入中文技能描述"
                              :maxlength="2000" />
                          </view>
                        </view>

                        <view class="skill-locale-card">
                          <text class="skill-locale-title">English</text>
                          <view class="field">
                            <text class="field-label">Skill Name</text>
                            <input v-model="skill.en.name" class="field-input" placeholder="Enter English skill name" />
                          </view>
                          <view class="field">
                            <text class="field-label">Skill Description</text>
                            <textarea
                              v-model="skill.en.description"
                              class="field-textarea"
                              placeholder="Enter English skill description"
                              :maxlength="2000" />
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>

                <view class="action-row">
                  <button class="action-btn ghost" :loading="row.submitting" :disabled="row.submitting" @click="cancelEdit(row)"
                    >取消</button
                  >
                  <button class="action-btn primary" :loading="row.submitting" :disabled="row.submitting" @click="saveRow(row)"
                    >保存</button
                  >
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="loading && rows.length > 0" class="load-more">继续加载...</view>
        <view v-else-if="!hasNext && rows.length > 0" class="load-more muted">没有更多了</view>
      </template>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onReachBottom } from '@dcloudio/uni-app'

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
    isRecord,
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

  interface LocaleSkillDraft {
    name: string
    description: string
  }

  interface MergedSkillDraft {
    key: string
    order: number
    zhOriginal: CharacterRecord
    enOriginal: CharacterRecord
    zh: LocaleSkillDraft
    en: LocaleSkillDraft
  }

  interface RowDraft {
    elementKey: string
    starsText: string
    zhName: string
    enName: string
    zhDescription: string
    enDescription: string
    zhAliasesText: string
    enAliasesText: string
    skills: MergedSkillDraft[]
  }

  interface AdminCharacterRow extends SwcCharacterView {
    elementKey: string
    aliasesPreview: string
    zhDescription: string
    enDescription: string
    zhAliasesText: string
    enAliasesText: string
    starsText: string
    loadedElementKey: string
    loadedZhName: string
    loadedEnName: string
    loadedZhDescription: string
    loadedEnDescription: string
    loadedZhAliasesText: string
    loadedEnAliasesText: string
    loadedStarsText: string
    editing: boolean
    detailsLoaded: boolean
    detailsLoading: boolean
    submitting: boolean
    zhDetail: CharacterRecord | null
    enDetail: CharacterRecord | null
    zhSkillsOriginal: CharacterRecord[]
    enSkillsOriginal: CharacterRecord[]
    draft: RowDraft
  }

  interface PaginationLike {
    hasNext?: boolean
    hasNextPage?: boolean
    page?: number
    totalPages?: number
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

  const selectedElement = ref(ALL_VALUE)
  const selectedStarSortOrder = ref<'asc' | 'desc'>('desc')
  const rows = ref<AdminCharacterRow[]>([])
  const page = ref(1)
  const hasNext = ref(true)
  const loading = ref(false)
  const errorMessage = ref('')
  const requestSequence = ref(0)

  const isAdmin = computed(() => getUserInfo()?.role === 'admin')
  const canManage = computed(() => isAdmin.value)
  const blockedText = computed(() => '仅管理员可用')
  const starSortLabel = computed(() => `星级${selectedStarSortOrder.value === 'desc' ? '↓' : '↑'}`)

  type CompendiumCharactersQueryParams = getCompendiumsCharactersQuery & {
    'categories[element]'?: string
  }

  const readRecordValue = (record: Record<string, unknown>, key: string): unknown => record[key]

  const readString = (record: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
      const value = readRecordValue(record, key)
      const text = toText(value)
      if (text) return text
    }
    return ''
  }

  const readArray = (record: Record<string, unknown>, keys: string[]): unknown[] => {
    for (const key of keys) {
      const value = readRecordValue(record, key)
      if (Array.isArray(value)) return value
    }
    return []
  }

  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http://')) return url.replace(/^http:/, 'https:')
    return url
  }

  const normalizeCategory = (source: unknown): CharacterRecord | null => {
    if (!isRecord(source)) return null
    return cloneAttribute(source)
  }

  const normalizeCategories = (source: unknown): CharacterRecord[] => {
    if (Array.isArray(source)) {
      return source.map(normalizeCategory).filter((item): item is CharacterRecord => Boolean(item))
    }

    if (isRecord(source)) {
      return Object.entries(source).map(([key, value]) => ({
        key,
        name: key,
        value: toText(value),
        valueKey: toText(value),
      }))
    }

    return []
  }

  const normalizeAttributes = (source: unknown): CharacterRecord[] => {
    if (!Array.isArray(source)) return []
    return source.map(cloneAttribute)
  }

  const normalizeAliases = (source: unknown): string[] => toArray(source).map(toText).filter(Boolean)

  const splitAliases = (text: string): string[] =>
    text
      .split(/[、,，\/\n]+/)
      .map(item => item.trim())
      .filter(Boolean)

  const joinAliases = (aliases: string[]): string => aliases.filter(Boolean).join('、')

  const readElementKey = (categories: CharacterRecord[]): string => {
    const element = categories.find(item => toText(item.key) === 'element' || toText(item.name) === 'element')
    return toText(element?.valueKey) || toText(element?.value)
  }

  const elementLabel = (elementKey: string): string => elementOptions.find(option => option.value === elementKey)?.label || elementKey

  const readElementName = (categories: CharacterRecord[]): string => {
    const key = readElementKey(categories)
    return elementLabel(key)
  }

  const resolveSkillKey = (source: unknown, index: number): string => {
    if (!isRecord(source)) return `index:${index}`
    const id = toText(source.id)
    if (id) return `id:${id}`
    const code = toText(source.code)
    if (code) return `code:${code}`
    const sortOrder = Number(source.sortOrder)
    if (Number.isFinite(sortOrder)) return `sort:${sortOrder}`
    return `index:${index}`
  }

  const getSkillOrder = (source: unknown, fallback: number): number => {
    if (!isRecord(source)) return fallback
    const sortOrder = Number(source.sortOrder)
    if (Number.isFinite(sortOrder)) return sortOrder
    return fallback
  }

  const mergeSkills = (zhSkills: unknown[], enSkills: unknown[]): MergedSkillDraft[] => {
    const merged = new Map<string, MergedSkillDraft>()

    zhSkills.forEach((skill, index) => {
      const key = resolveSkillKey(skill, index)
      merged.set(key, {
        key,
        order: getSkillOrder(skill, index),
        zhOriginal: cloneAttribute(skill),
        enOriginal: {},
        zh: {
          name: readString(cloneAttribute(skill), ['name']),
          description: readString(cloneAttribute(skill), ['description']),
        },
        en: {
          name: '',
          description: '',
        },
      })
    })

    enSkills.forEach((skill, index) => {
      const key = resolveSkillKey(skill, index)
      const existing = merged.get(key)
      if (existing) {
        existing.enOriginal = cloneAttribute(skill)
        existing.en = {
          name: readString(cloneAttribute(skill), ['name']),
          description: readString(cloneAttribute(skill), ['description']),
        }
        existing.order = Math.min(existing.order, getSkillOrder(skill, index))
        return
      }

      merged.set(key, {
        key,
        order: getSkillOrder(skill, index),
        zhOriginal: {},
        enOriginal: cloneAttribute(skill),
        zh: {
          name: '',
          description: '',
        },
        en: {
          name: readString(cloneAttribute(skill), ['name']),
          description: readString(cloneAttribute(skill), ['description']),
        },
      })
    })

    return [...merged.values()].sort((left, right) => left.order - right.order)
  }

  const readLocaleSnapshot = (
    data: CharacterRecord,
    fallback: Partial<AdminCharacterRow>,
  ): {
    name: string
    description: string
    aliasesText: string
    starsText: string
    elementKey: string
    elementName: string
    skills: CharacterRecord[]
    attributes: CharacterRecord[]
    categories: CharacterRecord[]
    skins: unknown[]
  } => {
    const attributes = normalizeAttributes(data.attributes)
    const categories = normalizeCategories(data.categories)
    const aliases = normalizeAliases(data.aliases)
    const starsText = readStarsAttributeText(attributes) || fallback.starsText || ''
    const elementKey = readElementKey(categories) || fallback.elementKey || ''
    const elementName = readElementName(categories) || fallback.elementName || ''

    return {
      name: toText(data.name) || fallback.zhName || fallback.enName || '',
      description: toText(data.description) || fallback.zhDescription || fallback.enDescription || '',
      aliasesText: joinAliases(aliases) || fallback.zhAliasesText || fallback.enAliasesText || '',
      starsText,
      elementKey,
      elementName,
      skills: toArray(data.skills).map(cloneAttribute),
      attributes,
      categories,
      skins: toArray(data.skins),
    }
  }

  const createDraftFromSnapshots = (row: AdminCharacterRow): RowDraft => ({
    elementKey: row.loadedElementKey || row.elementKey || '',
    starsText: row.loadedStarsText || row.starsText || '',
    zhName: row.loadedZhName || row.zhName || '',
    enName: row.loadedEnName || row.enName || '',
    zhDescription: row.loadedZhDescription || row.zhDescription || '',
    enDescription: row.loadedEnDescription || row.enDescription || '',
    zhAliasesText: row.loadedZhAliasesText || row.zhAliasesText || '',
    enAliasesText: row.loadedEnAliasesText || row.enAliasesText || '',
    skills: mergeSkills(row.zhSkillsOriginal, row.enSkillsOriginal),
  })

  const buildDraftFromDetails = (row: AdminCharacterRow, zhData: CharacterRecord, enData: CharacterRecord): RowDraft => {
    const zhSnapshot = readLocaleSnapshot(zhData, row)
    const enSnapshot = readLocaleSnapshot(enData, row)
    return {
      elementKey: zhSnapshot.elementKey || enSnapshot.elementKey || row.elementKey,
      starsText: zhSnapshot.starsText || enSnapshot.starsText || row.starsText,
      zhName: zhSnapshot.name || row.zhName,
      enName: enSnapshot.name || row.enName,
      zhDescription: zhSnapshot.description,
      enDescription: enSnapshot.description,
      zhAliasesText: zhSnapshot.aliasesText,
      enAliasesText: enSnapshot.aliasesText,
      skills: mergeSkills(zhSnapshot.skills, enSnapshot.skills),
    }
  }

  const createRowFromPreview = (source: unknown, enSource: unknown): AdminCharacterRow | null => {
    if (!isRecord(source)) return null
    const avatar = normalizeUrl(readString(source, ['avatar', 'icon', 'image', 'cover', 'portrait']))
    const name = readString(source, ['name', 'title'])
    const enName = isRecord(enSource) ? readString(enSource, ['name', 'title']) : ''
    const categories = normalizeCategories(readRecordValue(source, 'categories'))
    const attributes = normalizeAttributes(readRecordValue(source, 'attributes'))
    const aliases = normalizeAliases(readRecordValue(source, 'aliases'))
    const elementKey = readElementKey(categories)
    const elementName = readElementName(categories)
    const starsText = readStarsAttributeText(attributes)

    const base = toSwcCharacterView({
      characterId: readString(source, ['characterId', 'id', 'code']),
      name,
      avatar,
      elementKey,
      elementName,
      familyName: readString(source, ['familyName', 'family']),
      archetype: readString(source, ['archetype', 'type']),
      stars: starsText,
      awaken: readString(source, ['awaken', 'awakenName']),
    })

    if (!base.characterId) return null

    const normalizedRow: AdminCharacterRow = {
      ...base,
      elementKey,
      aliasesPreview:
        joinAliases(aliases) || (isRecord(enSource) ? joinAliases(normalizeAliases(readRecordValue(enSource, 'aliases'))) : ''),
      zhDescription: readString(source, ['description']),
      enDescription: isRecord(enSource) ? readString(enSource, ['description']) : '',
      zhAliasesText: joinAliases(aliases),
      enAliasesText: isRecord(enSource) ? joinAliases(normalizeAliases(readRecordValue(enSource, 'aliases'))) : '',
      starsText,
      loadedElementKey: elementKey,
      loadedZhName: name,
      loadedEnName: enName || name,
      loadedZhDescription: readString(source, ['description']),
      loadedEnDescription: isRecord(enSource) ? readString(enSource, ['description']) : '',
      loadedZhAliasesText: joinAliases(aliases),
      loadedEnAliasesText: isRecord(enSource) ? joinAliases(normalizeAliases(readRecordValue(enSource, 'aliases'))) : '',
      loadedStarsText: starsText,
      editing: false,
      detailsLoaded: false,
      detailsLoading: false,
      submitting: false,
      zhDetail: null,
      enDetail: null,
      zhSkillsOriginal: [],
      enSkillsOriginal: [],
      draft: {
        elementKey,
        starsText,
        zhName: name,
        enName: enName || name,
        zhDescription: readString(source, ['description']),
        enDescription: isRecord(enSource) ? readString(enSource, ['description']) : '',
        zhAliasesText: joinAliases(aliases),
        enAliasesText: isRecord(enSource) ? joinAliases(normalizeAliases(readRecordValue(enSource, 'aliases'))) : '',
        skills: [],
      },
    }

    return normalizedRow
  }

  const getCharacterId = (source: unknown): string => {
    if (!isRecord(source)) return ''
    return readString(source, ['characterId', 'id', 'code'])
  }

  const extractItems = (res: getCompendiumsCharactersRes): unknown[] => {
    if (Array.isArray(res)) return res
    if (!isRecord(res)) return []
    const items = readArray(res, ['items', 'list', 'records', 'data'])
    if (items.length) return items
    if (isRecord(res.data)) return readArray(res.data, ['items', 'list', 'records'])
    return []
  }

  const readPagination = (record: Record<string, unknown>): PaginationLike => {
    const pagination = readRecordValue(record, 'pagination')
    if (isRecord(pagination)) return pagination as PaginationLike
    return {}
  }

  const buildQuery = (pageNumber: number): CompendiumCharactersQueryParams => {
    const query: CompendiumCharactersQueryParams = {
      compendiumId: COMPENDIUM_CODE,
      locale: DEFAULT_LOCALE,
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

  const buildSkillPayload = (originalSkill: CharacterRecord, name: string, description: string): CharacterRecord => {
    const payload = cloneAttribute(originalSkill)
    payload.name = name
    payload.description = description
    return payload
  }

  const buildLocaleSkillsPayload = (
    originalSkills: CharacterRecord[],
    mergedSkills: MergedSkillDraft[],
    locale: 'zh' | 'en',
  ): CharacterRecord[] => {
    const mergedMap = new Map<string, MergedSkillDraft>()
    mergedSkills.forEach(skill => {
      mergedMap.set(skill.key, skill)
    })

    return originalSkills.map((skill, index) => {
      const key = resolveSkillKey(skill, index)
      const merged = mergedMap.get(key)
      if (!merged) return cloneAttribute(skill)

      if (locale === 'zh') {
        return buildSkillPayload(skill, merged.zh.name, merged.zh.description)
      }

      return buildSkillPayload(skill, merged.en.name, merged.en.description)
    })
  }

  const syncRowFromSnapshot = (row: AdminCharacterRow, zhData: CharacterRecord, enData: CharacterRecord) => {
    const zhSnapshot = readLocaleSnapshot(zhData, row)
    const enSnapshot = readLocaleSnapshot(enData, row)
    const nextZhSkills = zhSnapshot.skills.length > 0 ? zhSnapshot.skills : row.zhSkillsOriginal
    const nextEnSkills = enSnapshot.skills.length > 0 ? enSnapshot.skills : row.enSkillsOriginal
    row.zhDetail = zhData
    row.enDetail = enData
    row.zhSkillsOriginal = nextZhSkills
    row.enSkillsOriginal = nextEnSkills
    row.zhName = zhSnapshot.name
    row.enName = enSnapshot.name
    row.zhDescription = zhSnapshot.description
    row.enDescription = enSnapshot.description
    row.zhAliasesText = zhSnapshot.aliasesText
    row.enAliasesText = enSnapshot.aliasesText
    row.elementKey = zhSnapshot.elementKey || enSnapshot.elementKey || row.elementKey
    row.elementName = zhSnapshot.elementName || enSnapshot.elementName || row.elementName
    row.aliasesPreview = zhSnapshot.aliasesText || enSnapshot.aliasesText || ''
    row.starsText = zhSnapshot.starsText || enSnapshot.starsText || row.starsText
    row.loadedElementKey = row.elementKey
    row.loadedZhName = row.zhName
    row.loadedEnName = row.enName
    row.loadedZhDescription = row.zhDescription
    row.loadedEnDescription = row.enDescription
    row.loadedZhAliasesText = row.zhAliasesText
    row.loadedEnAliasesText = row.enAliasesText
    row.loadedStarsText = row.starsText
    row.draft = createDraftFromSnapshots(row)
  }

  const initializeRowDraft = (row: AdminCharacterRow, zhData: CharacterRecord, enData: CharacterRecord) => {
    syncRowFromSnapshot(row, zhData, enData)
    row.draft = buildDraftFromDetails(row, zhData, enData)
    row.detailsLoaded = true
    row.editing = true
  }

  const refreshRows = () => {
    loadRows(true)
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
        getCompendiumsCharacters(buildQuery(currentPage)),
        getCompendiumsCharacters({ ...buildQuery(currentPage), locale: 'en' }),
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
        .map(item => createRowFromPreview(item, enMap.get(getCharacterId(item))))
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

  const changeElement = (value: string) => {
    if (value === selectedElement.value) return
    selectedElement.value = value
    refreshRows()
  }

  const toggleStarSortOrder = () => {
    selectedStarSortOrder.value = selectedStarSortOrder.value === 'desc' ? 'asc' : 'desc'
    refreshRows()
  }

  const elementPickerIndex = (elementKey: string): number => {
    const index = elementOptions.findIndex(option => option.value === elementKey)
    return index >= 0 ? index : 0
  }

  const changeElementDraft = (row: AdminCharacterRow, event: { detail?: { value?: number | string } }) => {
    const index = Number(event.detail?.value ?? 0)
    row.draft.elementKey = elementOptions[index]?.value || elementOptions[0].value
  }

  const loadRowDetails = async (row: AdminCharacterRow) => {
    if (row.detailsLoading) return
    row.detailsLoading = true
    try {
      const [zhData, enData] = await Promise.all([
        fetchCharacterDetails(row.characterId, DEFAULT_LOCALE),
        fetchCharacterDetails(row.characterId, 'en'),
      ])
      initializeRowDraft(row, zhData, enData)
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载人物详情失败，请稍后重试', icon: 'none' })
    } finally {
      row.detailsLoading = false
    }
  }

  const beginEdit = async (row: AdminCharacterRow) => {
    if (row.detailsLoaded) {
      row.draft = createDraftFromSnapshots(row)
      row.editing = true
      return
    }

    await loadRowDetails(row)
  }

  const cancelEdit = (row: AdminCharacterRow) => {
    row.draft = createDraftFromSnapshots(row)
    row.editing = false
  }

  const verifyStarsAfterPatch = async (
    patchData: CharacterRecord,
    submittedStarsValue: number,
    row: AdminCharacterRow,
    body: Record<string, unknown>,
  ): Promise<boolean> => {
    const responseStarsValue = toNumberValue(readStarsAttributeText(normalizeAttributes(patchData.attributes)))
    let actualStarsValue = responseStarsValue

    if (actualStarsValue === undefined) {
      try {
        const confirmData = await fetchCharacterDetails(row.characterId, DEFAULT_LOCALE)
        actualStarsValue = toNumberValue(readStarsAttributeText(normalizeAttributes(confirmData.attributes)))
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

  const buildLocaleBody = (
    locale: 'zh-CN' | 'en',
    row: AdminCharacterRow,
    detail: CharacterRecord,
    name: string,
    description: string,
    aliasesText: string,
    skills: CharacterRecord[],
    starsValue: number | undefined,
  ): Record<string, unknown> => {
    const categories = buildCategoriesPayload(normalizeCategories(detail.categories))
    categories.element = row.draft.elementKey || row.elementKey

    return {
      compendiumId: COMPENDIUM_CODE,
      characterId: row.characterId,
      locale,
      name,
      description,
      aliases: splitAliases(aliasesText),
      skills,
      attributes: buildAttributesPayload(normalizeAttributes(detail.attributes), starsValue),
      categories,
      skins: toArray(detail.skins),
    }
  }

  const saveRow = async (row: AdminCharacterRow) => {
    if (!canManage.value || row.submitting) return

    row.submitting = true
    try {
      const submittedStarsText = row.draft.starsText.trim()
      const submittedStarsValue = toNumberValue(submittedStarsText)
      const shouldVerifyStars = Boolean(submittedStarsText)
      if (shouldVerifyStars && submittedStarsValue === undefined) {
        uni.showToast({ title: '星级请输入数字', icon: 'none' })
        return
      }

      const zhDetail = row.zhDetail || (await fetchCharacterDetails(row.characterId, DEFAULT_LOCALE))
      const enDetail = row.enDetail || (await fetchCharacterDetails(row.characterId, 'en'))

      const zhBody = buildLocaleBody(
        DEFAULT_LOCALE,
        row,
        zhDetail,
        row.draft.zhName,
        row.draft.zhDescription,
        row.draft.zhAliasesText,
        buildLocaleSkillsPayload(
          row.zhSkillsOriginal.length ? row.zhSkillsOriginal : toArray(zhDetail.skills).map(cloneAttribute),
          row.draft.skills,
          'zh',
        ),
        submittedStarsValue,
      )
      const zhPatchResult = await patchAdminCompendiumsCharacters(zhBody as never)
      const zhPatchData = extractData(zhPatchResult)

      if (shouldVerifyStars) {
        const verified = await verifyStarsAfterPatch(zhPatchData, submittedStarsValue as number, row, zhBody)
        if (!verified) return
      }

      const enBody = buildLocaleBody(
        'en',
        row,
        enDetail,
        row.draft.enName,
        row.draft.enDescription,
        row.draft.enAliasesText,
        buildLocaleSkillsPayload(
          row.enSkillsOriginal.length ? row.enSkillsOriginal : toArray(enDetail.skills).map(cloneAttribute),
          row.draft.skills,
          'en',
        ),
        submittedStarsValue,
      )
      const enPatchResult = await patchAdminCompendiumsCharacters(enBody as never)
      const enPatchData = extractData(enPatchResult)

      syncRowFromSnapshot(row, zhPatchData, enPatchData)
      row.editing = false
      uni.showToast({ title: '保存成功', icon: 'success' })
    } catch (error) {
      const message = typeof error === 'string' ? error : '保存失败，请稍后重试'
      uni.showToast({ title: message, icon: 'none' })
    } finally {
      row.submitting = false
    }
  }

  onLoad(() => {
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
    background: var(--theme-bg);
  }

  .filter-bar {
    margin: 24rpx;
    padding: 24rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 24rpx var(--theme-shadow-xs);
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
  .action-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
  }

  .retry-btn {
    margin-top: 16rpx;
    height: 66rpx;
    line-height: 66rpx;
    padding: 0 32rpx;
    background: linear-gradient(135deg, #0f766e 0%, #38bdf8 100%);
    color: #fff;
  }

  .action-btn {
    min-width: 120rpx;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0 24rpx;
    background: linear-gradient(135deg, #0f766e 0%, #38bdf8 100%);
    color: #fff;
  }

  .action-btn.ghost {
    background: #e2e8f0;
    color: #334155;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #0f766e 0%, #38bdf8 100%);
    color: #fff;
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
    align-items: flex-start;
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
  .skills-hint {
    font-size: 22rpx;
    color: #64748b;
  }

  .sub-title.aliases {
    word-break: break-all;
  }

  .edit-form {
    margin-top: 18rpx;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }

  .field-grid.single-col {
    grid-template-columns: 1fr;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .field.wide {
    grid-column: span 2;
  }

  .field.narrow {
    grid-column: span 1;
  }

  .field-label,
  .locale-title,
  .skill-locale-title,
  .skill-index,
  .skill-key {
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

  .picker-box {
    min-height: 72rpx;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    border-radius: 16rpx;
    background: #f8fafc;
    border: 1rpx solid #e2e8f0;
    color: #0f172a;
    font-size: 26rpx;
  }

  .locale-section,
  .skills-panel {
    margin-top: 18rpx;
    padding: 18rpx;
    border-radius: 20rpx;
    background: #f8fafc;
  }

  .locale-title {
    display: block;
    margin-bottom: 12rpx;
    font-size: 26rpx;
    font-weight: 600;
    color: #0f172a;
  }

  .skills-head {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    margin-bottom: 14rpx;
  }

  .skills-state {
    font-size: 24rpx;
    color: #64748b;
  }

  .skill-block + .skill-block {
    margin-top: 16rpx;
  }

  .skill-block {
    padding: 16rpx;
    border-radius: 18rpx;
    background: #fff;
    border: 1rpx solid #e2e8f0;
  }

  .skill-head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;
  }

  .skill-locale-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16rpx;
  }

  .skill-locale-card {
    padding: 14rpx;
    border-radius: 16rpx;
    background: #f8fafc;
  }

  .skill-locale-title {
    display: block;
    margin-bottom: 10rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: #0f172a;
  }

  .action-row {
    margin-top: 20rpx;
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
  }

  .row-readonly .row-head {
    align-items: center;
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

  @media screen and (max-width: 900px) {
    .skill-locale-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
