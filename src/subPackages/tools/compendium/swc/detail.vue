<template>
  <view class="detail-page">
    <!-- <view class="top-tabs">
      <view
        v-for="tab in topTabs"
        :key="tab.key"
        class="top-tab"
        :class="{ active: activeTopTab === tab.key }"
        @click="activeTopTab = tab.key">
        <text>{{ tab.label }}</text>
        <text v-if="tab.dot" class="tab-dot" />
      </view>
    </view> -->

    <view v-if="loading && !switching" class="state-block">
      <text>加载详情中...</text>
    </view>

    <view v-else-if="!switching && errorMessage" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="retry-btn" @click="loadDetail">重试</button>
    </view>

    <view v-else class="content" :class="{ 'content-switching': switching }">
      <view v-if="switching" class="switching-overlay">
        <text>切换中...</text>
      </view>
      <view class="locale-toolbar">
        <text class="locale-toolbar-label">语言</text>
        <view class="locale-switch">
          <text
            v-for="option in localeOptions"
            :key="option.value"
            class="locale-option"
            :class="{ selected: option.value === selectedLocale }"
            @click="changeLocale(option.value)">
            {{ option.label }}
          </text>
        </view>
      </view>
      <view class="hero-card">
        <view class="avatar-column">
          <image v-if="detail.avatar" class="main-avatar" :src="detail.avatar" mode="aspectFill" lazy-load />
          <view v-else class="main-avatar avatar-placeholder">
            <text>{{ detail.name.slice(0, 1) || '?' }}</text>
          </view>
          <text v-if="detail.code" class="code-text">No.{{ detail.code }}</text>
          <view v-if="canSwitchAwaken" class="awaken-btn" @click="onAwakenToggle">
            <text>切换形态</text>
          </view>
        </view>

        <view class="profile-column">
          <view class="profile-head">
            <view class="title-wrap">
              <view class="name-line">
                <text class="name">{{ detail.name || '未知魔灵' }}</text>
                <text v-if="detail.alias" class="alias">/ {{ detail.alias }}</text>
              </view>
              <view class="tag-line">
                <text v-if="detail.elementName" class="tag accent">{{ detail.elementIcon }} {{ detail.elementName }}</text>
                <text v-if="detail.stars" class="tag star-tag">{{ detail.stars }}*</text>
                <text v-if="detail.archetype" class="tag">{{ detail.archetype }}</text>
                <text v-if="detail.family" class="tag">{{ detail.family }}</text>
              </view>
              <text v-if="detail.description" class="species">{{ detail.description }}</text>
            </view>
          </view>

          <view class="element-row">
            <view
              v-for="option in elementBadges"
              :key="option.value"
              class="element-dot"
              :class="{ active: option.value === detail.elementKey, clickable: hasElementForm(option.value) }"
              :style="{ background: option.color }"
              @click="onElementClick(option.value)">
            </view>
          </view>
        </view>
      </view>

      <view class="detail-tabs">
        <view
          class="detail-tab"
          :class="{ active: activeDetailTab === 'stats' }"
          @click="activeDetailTab = 'stats'">
          <text>属性</text>
        </view>
        <view
          class="detail-tab"
          :class="{ active: activeDetailTab === 'skills' }"
          @click="activeDetailTab = 'skills'">
          <text>技能</text>
        </view>
      </view>

      <view v-if="activeDetailTab === 'stats'" class="stats-panel">
        <view class="stat-list">
          <view v-for="stat in primaryStats" :key="stat.key" class="stat-row">
            <view class="stat-row-header">
              <view class="stat-label-group">
                <view class="stat-icon-circle" :style="{ background: stat.color }">
                  <text class="stat-icon">{{ stat.icon }}</text>
                </view>
                <text class="stat-label">{{ stat.label }}</text>
              </view>
              <view class="stat-value-group">
                <text class="stat-value">{{ stat.value || '--' }}</text>
                <text class="stat-rank">{{ stat.rankLabel || '-' }}</text>
              </view>
            </view>
            <view class="stat-bar">
              <view class="stat-bar-inner" :style="{ width: stat.percent, background: stat.color }" />
            </view>
          </view>
        </view>

        <view class="stat-list secondary">
          <view v-for="stat in secondaryStats" :key="stat.key" class="stat-row minor">
            <view class="stat-row-header">
              <text class="stat-label">{{ stat.label }}</text>
              <view class="stat-value-group">
                <text class="stat-value">{{ stat.value || '--' }}</text>
                <text v-if="stat.rankLabel" class="stat-rank minor-rank">{{ stat.rankLabel }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="activeDetailTab === 'skills'" class="skill-section">
        <view v-if="detail.skills.length === 0" class="empty-card">暂无技能数据</view>
        <view v-for="skill in detail.skills" :key="skill.id || skill.name" class="skill-card" :class="{ leader: skill.type === 'leader' }">
          <view class="skill-head">
            <image v-if="skill.attachment" class="skill-icon" :src="skill.attachment" mode="aspectFill" lazy-load />
            <view v-else class="skill-icon empty-icon">{{ skill.type === 'leader' ? 'L' : skill.orderText }}</view>
            <view class="skill-title-wrap">
              <view class="skill-title">
                <text>{{ skill.name || '未命名技能' }}</text>
                <text v-if="skill.cost" class="skill-badge">{{ skill.cost }}</text>
              </view>
              <text v-if="skill.typeText" class="skill-type">{{ skill.typeText }}</text>
            </view>
          </view>
          <text v-if="skill.description" class="skill-desc">{{ skill.description }}</text>
          <view
            v-if="skill.multiplierFormula || skill.hitCountText || skill.cooldownText"
            class="skill-meta-list">
            <view v-if="skill.multiplierFormula" class="skill-meta-item">
              <text class="skill-meta-label">技能系数</text>
              <text class="skill-meta-value">{{ skill.multiplierFormula }}</text>
            </view>
            <view v-if="skill.hitCountText" class="skill-meta-item">
              <text class="skill-meta-label">命中次数</text>
              <text class="skill-meta-value">{{ skill.hitCountText }}</text>
            </view>
            <view v-if="skill.cooldownText" class="skill-meta-item">
              <text class="skill-meta-label">冷却回合</text>
              <text class="skill-meta-value">{{ skill.cooldownText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="lineup-section">
        <view class="lineup-section-head">
          <view>
            <text class="lineup-section-title">参与阵容</text>
            <text class="lineup-section-subtitle">展示该魔灵参与的进攻与防御阵容</text>
          </view>
        </view>

        <view v-if="lineupLoading" class="empty-card">
          <text>加载阵容中...</text>
        </view>

        <view v-else-if="lineupErrorMessage" class="empty-card">
          <text>{{ lineupErrorMessage }}</text>
        </view>

        <view v-else class="lineup-groups">
          <view class="lineup-group-card">
            <view class="lineup-group-head">
              <text class="lineup-group-title">进攻阵容</text>
              <text class="lineup-group-count">{{ lineupUsage.offenseLineups.length }}</text>
            </view>

            <view v-if="!lineupUsage.offenseLineups.length" class="empty-inline">暂无进攻阵容</view>

            <view v-for="lineup in lineupUsage.offenseLineups" :key="lineup.id || lineup.name" class="lineup-item-card">
              <view class="lineup-item-head">
                <text class="lineup-item-name">{{ lineup.name || '未命名阵容' }}</text>
                <text class="lineup-item-count">{{ lineup.memberCount }} 人</text>
              </view>
              <text v-if="lineup.description" class="lineup-item-desc">{{ lineup.description }}</text>
              <text class="lineup-item-relation">被哪些防御阵容克制：{{ getRelationSummary(lineup) }}</text>

              <scroll-view v-if="lineup.characters.length" class="lineup-member-scroll" scroll-x>
                <view class="lineup-member-row">
                  <view v-for="member in lineup.characters" :key="member.characterId || member.id" class="lineup-member-pill">
                    <image v-if="member.avatar" class="lineup-member-avatar" :src="member.avatar" mode="aspectFill" />
                    <view v-else class="lineup-member-avatar lineup-member-avatar-placeholder">
                      <text>{{ (member.name || '?').slice(0, 1) }}</text>
                    </view>
                    <text class="lineup-member-name">{{ member.name || member.label || '未知魔灵' }}</text>
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>

          <view class="lineup-group-card">
            <view class="lineup-group-head">
              <text class="lineup-group-title">防御阵容</text>
              <text class="lineup-group-count">{{ lineupUsage.defenseLineups.length }}</text>
            </view>

            <view v-if="!lineupUsage.defenseLineups.length" class="empty-inline">暂无防御阵容</view>

            <view v-for="lineup in lineupUsage.defenseLineups" :key="lineup.id || lineup.name" class="lineup-item-card">
              <view class="lineup-item-head">
                <text class="lineup-item-name">{{ lineup.name || '未命名阵容' }}</text>
                <text class="lineup-item-count">{{ lineup.memberCount }} 人</text>
              </view>
              <text v-if="lineup.description" class="lineup-item-desc">{{ lineup.description }}</text>
              <text class="lineup-item-relation">可被哪些进攻阵容克制：{{ getRelationSummary(lineup) }}</text>

              <scroll-view v-if="lineup.characters.length" class="lineup-member-scroll" scroll-x>
                <view class="lineup-member-row">
                  <view v-for="member in lineup.characters" :key="member.characterId || member.id" class="lineup-member-pill">
                    <image v-if="member.avatar" class="lineup-member-avatar" :src="member.avatar" mode="aspectFill" />
                    <view v-else class="lineup-member-avatar lineup-member-avatar-placeholder">
                      <text>{{ (member.name || '?').slice(0, 1) }}</text>
                    </view>
                    <text class="lineup-member-name">{{ member.name || member.label || '未知魔灵' }}</text>
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app'
  import { getCompendiumsCharacter } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type { getCompendiumsCharacterQuery } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'
  import { fetchCharacterLineupUsage, type CharacterLineupUsage, type PublicLineup } from '@/services/compendium-lineups'

  type RawRecord = Record<string, any>

  interface RawAttribute {
    key?: string
    name?: string
    displayValue?: string
    value?: string | number | boolean | null
    unit?: string
    rank?: number | string | null
    total?: number | string | null
  }

  interface RawCategory {
    key?: string
    name?: string
    valueKey?: string
    value?: string
    color?: string
    icon?: string
  }

  interface RawCoefficient {
    id?: string
    key?: string
    name?: string
    level?: string
    value?: string | number | null
    unit?: string
    formula?: string
    triggerProbability?: string | number | null
    triggerUnit?: string
  }

  interface RawSkill {
    id?: string
    name?: string
    type?: string
    attachment?: string
    cost?: string
    cooldown?: string
    cooldownTurns?: string | number | null
    description?: string
    multiplierFormula?: string
    hitCount?: string | number | null
    coefficients?: RawCoefficient[]
  }

  interface RawSkin {
    id?: string
    name?: string
    image?: string
    attachment?: string
  }

  interface RawCharacterDetail extends RawRecord {
    id?: string
    name?: string
    code?: string
    alias?: string
    aliases?: string[]
    avatar?: string
    level?: string
    stars?: string | number
    description?: string
    categories?: RawCategory[]
    attributes?: RawAttribute[]
    skills?: RawSkill[]
    skins?: RawSkin[]
    familyMembers?: RawRecord[]
    data?: RawCharacterDetail
  }

  interface NormalizedCoefficient {
    id: string
    name: string
    value: string
  }

  interface NormalizedSkill {
    id: string
    name: string
    type: string
    typeText: string
    orderText: string
    attachment: string
    cost: string
    cooldown: string
    cooldownText: string
    description: string
    multiplierFormula: string
    hitCountText: string
    coefficients: NormalizedCoefficient[]
  }

  interface NormalizedCategory {
    key: string
    name: string
    valueKey: string
    value: string
    color: string
    icon: string
  }

  interface NormalizedSkin {
    id: string
    name: string
    image: string
  }

  interface NormalizedFamilyMember {
    id: string
    name: string
    code: string
    avatar: string
    elementKey: string
    elementName: string
    formLabel: string
    sortOrder: number
    isCurrent: boolean
  }

  interface NormalizedElement {
    key: string
    name: string
  }

  interface LocaleOption {
    label: string
    value: string
  }

  interface CharacterDetail {
    id: string
    name: string
    code: string
    alias: string
    aliases: string[]
    avatar: string
    elementKey: string
    elementName: string
    elementIcon: string
    level: string
    stars: string
    archetype: string
    family: string
    description: string
    statusText: string
    attributes: RawAttribute[]
    categories: NormalizedCategory[]
    skills: NormalizedSkill[]
    skins: NormalizedSkin[]
    familyMembers: NormalizedFamilyMember[]
  }

  interface StatItem {
    key: string
    label: string
    icon: string
    value: string
    rankLabel: string
    percent: string
    color: string
  }

  interface SecondaryStatItem {
    key: string
    label: string
    value: string
    rankLabel: string
  }

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const AWAKENED_LABEL = '觉醒'
  const UNAWAKENED_LABEL = '未觉醒'

  const localeOptions: LocaleOption[] = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en' },
  ]

  const elementBadges = [
    { label: '火', value: 'fire', color: '#f45b62' },
    { label: '水', value: 'water', color: '#4b9df4' },
    { label: '风', value: 'wind', color: '#f5c542' },
    { label: '光', value: 'light', color: '#f5f0c1' },
    { label: '暗', value: 'dark', color: '#8b5cf6' },
  ]

  const activeDetailTab = ref<'stats' | 'skills'>('stats')
  const loading = ref(false)
  const switching = ref(false)
  const lineupLoading = ref(false)
  const errorMessage = ref('')
  const lineupErrorMessage = ref('')
  const characterId = ref('')
  const seedName = ref('')
  const seedAvatar = ref('')
  const selectedLocale = ref(DEFAULT_LOCALE)

  const detail = ref<CharacterDetail>({
    id: '',
    name: '',
    code: '',
    alias: '',
    aliases: [],
    avatar: '',
    elementKey: '',
    elementName: '',
    elementIcon: '',
    level: '',
    stars: '',
    archetype: '',
    family: '',
    description: '',
    statusText: '',
    attributes: [],
    categories: [],
    skills: [],
    skins: [],
    familyMembers: [],
  })

  const lineupUsage = ref<CharacterLineupUsage>({
    offenseLineups: [],
    defenseLineups: [],
  })

  const stringifyValue = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? '是' : '否'
    return ''
  }

  const isRecord = (value: unknown): value is RawRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const readRecordString = (record: RawRecord, keys: string[]): string => {
    for (const key of keys) {
      const value = stringifyValue(record[key]).trim()
      if (value) return value
    }
    return ''
  }

  const readRecordNumber = (record: RawRecord, keys: string[]): number => {
    for (const key of keys) {
      const value = record[key]
      if (typeof value === 'number') return value
      if (typeof value === 'string' && value.trim()) {
        const parsedValue = Number(value)
        if (!Number.isNaN(parsedValue)) return parsedValue
      }
    }
    return 0
  }

  const readRecordArray = (record: RawRecord, keys: string[]): unknown[] => {
    for (const key of keys) {
      const value = record[key]
      if (Array.isArray(value)) return value
    }
    return []
  }

  const normalizeUrl = (url?: string): string => {
    if (!url) return ''
    if (url.startsWith('http://')) return url.replace(/^http:/, 'https:')
    return url
  }

  const extractDetailData = (res: unknown): RawCharacterDetail => {
    if (isRecord(res) && isRecord(res.data)) return res.data as RawCharacterDetail
    return (isRecord(res) ? res : {}) as RawCharacterDetail
  }

  const normalizeCategory = (category: RawCategory): NormalizedCategory => ({
    key: category.key || '',
    name: category.name || '',
    valueKey: category.valueKey || '',
    value: category.value || '',
    color: category.color || '',
    icon: category.icon || '',
  })

  const normalizeCategoryRecord = (source: unknown): NormalizedCategory | null => {
    if (!isRecord(source)) return null
    return {
      key: readRecordString(source, ['key']),
      name: readRecordString(source, ['name']),
      valueKey: readRecordString(source, ['valueKey']),
      value: readRecordString(source, ['value']),
      color: readRecordString(source, ['color']),
      icon: readRecordString(source, ['icon']),
    }
  }

  const normalizeCoefficient = (coefficient: RawCoefficient): NormalizedCoefficient => ({
    id: coefficient.id || coefficient.key || coefficient.name || '',
    name: coefficient.name || coefficient.level || '',
    value: [
      coefficient.formula || '',
      stringifyValue(coefficient.value),
      coefficient.unit || '',
      coefficient.triggerProbability
        ? `触发 ${stringifyValue(coefficient.triggerProbability)}${coefficient.triggerUnit || ''}`
        : '',
    ]
      .filter(Boolean)
      .join(' '),
  })

  const formatCooldownText = (skill: RawSkill): string => {
    const cooldownTurns = stringifyValue(skill.cooldownTurns).trim()
    if (cooldownTurns) return cooldownTurns
    return (skill.cooldown || '').trim()
  }

  const formatHitCountText = (skill: RawSkill): string => stringifyValue(skill.hitCount).trim()

  const formatMultiplierFormula = (skill: RawSkill): string => {
    const formula = (skill.multiplierFormula || '').trim()
    if (formula) return formula
    if (!skill.coefficients?.length) return ''

    return skill.coefficients
      .map(normalizeCoefficient)
      .map(item => [item.name, item.value].filter(Boolean).join(': '))
      .filter(Boolean)
      .join(' / ')
  }

  const formatSkillType = (type = ''): string => {
    const map: Record<string, string> = {
      active: '主动技能',
      passive: '被动技能',
      leader: '队长技能',
    }
    return map[type] || type
  }

  const normalizeSkill = (skill: RawSkill, index: number): NormalizedSkill => ({
    id: skill.id || skill.name || '',
    name: skill.name || '',
    type: skill.type || '',
    typeText: formatSkillType(skill.type),
    orderText: String(index + 1),
    attachment: normalizeUrl(skill.attachment),
    cost: skill.cost || '',
    cooldown: skill.cooldown || '',
    cooldownText: formatCooldownText(skill),
    description: skill.description || '',
    multiplierFormula: formatMultiplierFormula(skill),
    hitCountText: formatHitCountText(skill),
    coefficients: (skill.coefficients || []).map(normalizeCoefficient),
  })

  const normalizeSkin = (skin: RawSkin): NormalizedSkin => ({
    id: skin.id || skin.name || '',
    name: skin.name || '',
    image: normalizeUrl(skin.image || skin.attachment),
  })

  const getCategory = (categories: NormalizedCategory[], key: string): NormalizedCategory | undefined =>
    categories.find(item => item.key === key)

  const getCategoryValue = (categories: NormalizedCategory[], key: string): string => getCategory(categories, key)?.value || ''

  const normalizeElementKey = (value: string): string => {
    const normalizedValue = value.trim().toLowerCase()
    const map: Record<string, string> = {
      fire: 'fire',
      water: 'water',
      wind: 'wind',
      light: 'light',
      dark: 'dark',
      火: 'fire',
      水: 'water',
      风: 'wind',
      光: 'light',
      暗: 'dark',
    }
    return map[normalizedValue] || normalizedValue
  }

  const readElement = (record: RawRecord, categories: NormalizedCategory[]): NormalizedElement => {
    const category = getCategory(categories, 'element')
    const element = record.element
    if (isRecord(element)) {
      const key = readRecordString(element, ['key', 'valueKey', 'value'])
      const name = readRecordString(element, ['name', 'value'])
      return {
        key: normalizeElementKey(key || category?.valueKey || category?.value || ''),
        name: name || category?.value || '',
      }
    }

    const elementText = stringifyValue(element).trim()
    return {
      key: normalizeElementKey(category?.valueKey || elementText || category?.value || ''),
      name: category?.value || elementText,
    }
  }

  const formatAwakenLabel = (record: RawRecord, categories: NormalizedCategory[]): string => {
    const awakenCategory = categories.find(item => ['awakening', 'awaken', 'form', 'stage'].includes(item.key))
    const rawValue =
      readRecordString(record, ['awakening', 'awaken', 'awakened', 'isAwakened', 'form', 'stage', 'state']) ||
      awakenCategory?.value ||
      ''
    const lowerValue = rawValue.toLowerCase()

    if (['否', 'false', '0'].includes(lowerValue) || lowerValue.includes('未觉醒') || lowerValue.includes('unawaken')) {
      return UNAWAKENED_LABEL
    }

    if (['是', 'true', '1'].includes(lowerValue) || lowerValue.includes('觉醒') || lowerValue.includes('awaken')) {
      return AWAKENED_LABEL
    }

    return rawValue || UNAWAKENED_LABEL
  }

  const getElementIcon = (elementKey: string): string => {
    const map: Record<string, string> = {
      fire: '火',
      water: '水',
      wind: '风',
      light: '光',
      dark: '暗',
    }
    return map[elementKey] || ''
  }

  const normalizeFamilyMember = (source: unknown): NormalizedFamilyMember | null => {
    if (!isRecord(source)) return null

    const categories = readRecordArray(source, ['categories'])
      .map(normalizeCategoryRecord)
      .filter((item): item is NormalizedCategory => Boolean(item))
    const element = readElement(source, categories)
    const id = readRecordString(source, ['id', 'characterId'])

    if (!id) return null

    return {
      id,
      name: readRecordString(source, ['name', 'title']),
      code: readRecordString(source, ['code']),
      avatar: normalizeUrl(readRecordString(source, ['avatar', 'icon', 'image', 'cover', 'portrait'])),
      elementKey: element.key,
      elementName: element.name,
      formLabel: formatAwakenLabel(source, categories),
      sortOrder: readRecordNumber(source, ['sortOrder']),
      isCurrent: id === (detail.value.id || characterId.value),
    }
  }

  const getAttributeByKey = (attributes: RawAttribute[], keys: string[]): RawAttribute | undefined =>
    attributes.find(attribute => {
      const source = `${attribute.key || ''} ${attribute.name || ''}`.toLowerCase()
      return keys.some(key => source.includes(key.toLowerCase()))
    })

  const formatAttributeValue = (attribute?: RawAttribute): string =>
    attribute ? `${attribute.displayValue || stringifyValue(attribute.value)}${attribute.unit || ''}` : ''

  const normalizeDetail = (rawRes: unknown): CharacterDetail => {
    const res = extractDetailData(rawRes)
    const record = isRecord(res) ? res : {}
    const categories = (Array.isArray(res.categories) ? res.categories : []).map(normalizeCategory)
    const attributes = Array.isArray(res.attributes) ? res.attributes : []
    const element = readElement(record, categories)
    const familyMembers = readRecordArray(record, ['familyMembers'])
      .map(normalizeFamilyMember)
      .filter((item): item is NormalizedFamilyMember => Boolean(item))
    const starAttribute = formatAttributeValue(getAttributeByKey(attributes, ['stars', '星级']))
    const stars = starAttribute.replace(/[^\d]/g, '') || stringifyValue(res.stars).trim()
    const aliases = Array.isArray(res.aliases) ? res.aliases.filter(Boolean) : []

    return {
      id: res.id || characterId.value,
      name: res.name || seedName.value,
      code: res.code || '',
      alias: aliases[0] || res.alias || '',
      aliases,
      avatar: normalizeUrl(res.avatar || seedAvatar.value),
      elementKey: element.key,
      elementName: element.name,
      elementIcon: getElementIcon(element.key),
      level: res.level || '',
      stars,
      archetype: getCategoryValue(categories, 'archetype'),
      family: getCategoryValue(categories, 'family'),
      description: res.description || '',
      statusText: '',
      attributes,
      categories,
      skills: (Array.isArray(res.skills) ? res.skills : []).map(normalizeSkill),
      skins: (Array.isArray(res.skins) ? res.skins : []).map(normalizeSkin),
      familyMembers,
    }
  }

  const createCurrentFamilyMember = (): NormalizedFamilyMember => ({
    id: detail.value.id || characterId.value,
    name: detail.value.name || seedName.value,
    code: detail.value.code,
    avatar: detail.value.avatar || seedAvatar.value,
    elementKey: detail.value.elementKey,
    elementName: detail.value.elementName,
    formLabel: UNAWAKENED_LABEL,
    sortOrder: 0,
    isCurrent: true,
  })

  const sameElementForms = computed<NormalizedFamilyMember[]>(() => {
    const currentId = detail.value.id || characterId.value
    const currentElementKey = detail.value.elementKey

    if (!currentId || !currentElementKey) return []

    const forms = detail.value.familyMembers
      .filter(member => member.elementKey === currentElementKey)
      .map(member => ({
        ...member,
        isCurrent: member.id === currentId,
      }))

    if (!forms.some(member => member.id === currentId)) {
      forms.unshift(createCurrentFamilyMember())
    }

    const normalizedForms = forms
      .map(member => ({
        ...member,
        formLabel: member.formLabel || UNAWAKENED_LABEL,
      }))
      .sort((left, right) => left.sortOrder - right.sortOrder)

    const awakened = normalizedForms.filter(member => member.formLabel === AWAKENED_LABEL)
    const others = normalizedForms.filter(member => member.formLabel !== AWAKENED_LABEL)
    return [...awakened, ...others]
  })

  const activeAwakenLabel = computed(() => {
    const current = sameElementForms.value.find(member => member.isCurrent)
    return current?.formLabel || AWAKENED_LABEL
  })

  const canSwitchAwaken = computed(() => sameElementForms.value.length > 1)

  const findAttribute = (keys: string[]): RawAttribute | undefined => getAttributeByKey(detail.value.attributes, keys)

  const formatRankLabel = (attribute?: RawAttribute): string => {
    if (!attribute) return ''
    const rank = Number(attribute.rank)
    const total = Number(attribute.total)
    if (!rank || !total) return ''
    return `#${rank}/${total}`
  }

  const calculateRankPercent = (attribute: RawAttribute | undefined, fallback: number): string => {
    const rank = Number(attribute?.rank)
    const total = Number(attribute?.total)
    if (rank > 0 && total > 0) {
      return `${Math.min(100, Math.max(8, ((total - rank + 1) / total) * 100)).toFixed(0)}%`
    }
    return `${fallback}%`
  }

  const primaryStats = computed<StatItem[]>(() => {
    const hp = findAttribute(['hp', '体力', '生命'])
    const attack = findAttribute(['attack', '攻击'])
    const defense = findAttribute(['defense', '防御'])
    const speed = findAttribute(['speed', '速度'])

    return [
      {
        key: 'hp',
        label: '体力',
        icon: 'HP',
        value: formatAttributeValue(hp),
        rankLabel: formatRankLabel(hp),
        percent: calculateRankPercent(hp, 42),
        color: '#f45b62',
      },
      {
        key: 'attack',
        label: '攻击',
        icon: 'ATK',
        value: formatAttributeValue(attack),
        rankLabel: formatRankLabel(attack),
        percent: calculateRankPercent(attack, 34),
        color: '#6877f0',
      },
      {
        key: 'defense',
        label: '防御',
        icon: 'DEF',
        value: formatAttributeValue(defense),
        rankLabel: formatRankLabel(defense),
        percent: calculateRankPercent(defense, 68),
        color: '#52c489',
      },
      {
        key: 'speed',
        label: '速度',
        icon: 'SPD',
        value: formatAttributeValue(speed),
        rankLabel: formatRankLabel(speed),
        percent: calculateRankPercent(speed, 74),
        color: '#f5a623',
      },
    ]
  })

  const secondaryStats = computed<SecondaryStatItem[]>(() => {
    const critRate = findAttribute(['critrate', '暴击率'])
    const critDamage = findAttribute(['critdmg', 'critdamage', '暴击伤害'])
    const resistance = findAttribute(['resistance', '效果抵抗'])
    const accuracy = findAttribute(['accuracy', '效果命中'])

    return [
      { key: 'critRate', label: '暴击率', value: formatAttributeValue(critRate), rankLabel: formatRankLabel(critRate) },
      { key: 'resistance', label: '效果抵抗', value: formatAttributeValue(resistance), rankLabel: formatRankLabel(resistance) },
      { key: 'critDamage', label: '暴击伤害', value: formatAttributeValue(critDamage), rankLabel: formatRankLabel(critDamage) },
      { key: 'accuracy', label: '效果命中', value: formatAttributeValue(accuracy), rankLabel: formatRankLabel(accuracy) },
    ]
  })

  const getRelationSummary = (lineup: PublicLineup): string => {
    const related = lineup.type === 'defense' ? lineup.counters : lineup.counteredBy
    if (!related.length) return '暂无关联阵容'
    return related.map(item => item.name).filter(Boolean).join('、')
  }

  const loadLineupUsage = async (targetCharacterId: string) => {
    lineupLoading.value = true
    lineupErrorMessage.value = ''

    try {
      lineupUsage.value = await fetchCharacterLineupUsage(targetCharacterId, {
        locale: selectedLocale.value,
      })
    } catch (error) {
      lineupUsage.value = {
        offenseLineups: [],
        defenseLineups: [],
      }
      lineupErrorMessage.value = typeof error === 'string' ? error : '阵容数据加载失败'
    } finally {
      lineupLoading.value = false
    }
  }

  const changeLocale = (locale: string) => {
    if (locale === selectedLocale.value) return
    selectedLocale.value = locale
    loadDetail()
  }

  const loadDetail = async () => {
    if (!characterId.value) {
      errorMessage.value = '缺少魔灵 ID'
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const query: getCompendiumsCharacterQuery = {
        compendiumId: COMPENDIUM_CODE,
        characterId: characterId.value,
        locale: selectedLocale.value,
      }
      const res = await getCompendiumsCharacter(query)
      detail.value = normalizeDetail(res)
      uni.setNavigationBarTitle({ title: detail.value.name || '魔灵详情' })
      await loadLineupUsage(characterId.value)
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '详情加载失败，请稍后重试'
    } finally {
      loading.value = false
      uni.stopPullDownRefresh()
    }
  }

  const switchAwakenForm = async (form: NormalizedFamilyMember) => {
    if (form.isCurrent || !form.id) return

    switching.value = true
    errorMessage.value = ''
    characterId.value = form.id
    seedName.value = form.name
    seedAvatar.value = form.avatar
    uni.pageScrollTo({ scrollTop: 0, duration: 120 })

    try {
      const query: getCompendiumsCharacterQuery = {
        compendiumId: COMPENDIUM_CODE,
        characterId: form.id,
        locale: selectedLocale.value,
      }
      const res = await getCompendiumsCharacter(query)
      detail.value = normalizeDetail(res)
      uni.setNavigationBarTitle({ title: detail.value.name || '魔灵详情' })
      await loadLineupUsage(form.id)
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '切换形态失败，请稍后重试'
    } finally {
      switching.value = false
    }
  }

  const onAwakenToggle = () => {
    const targetLabel = activeAwakenLabel.value === AWAKENED_LABEL ? UNAWAKENED_LABEL : AWAKENED_LABEL
    const target = sameElementForms.value.find(member => member.formLabel === targetLabel)
    if (target) switchAwakenForm(target)
  }

  const hasElementForm = (elementKey: string): boolean => {
    if (elementKey === detail.value.elementKey) return true
    return detail.value.familyMembers.some(member => member.elementKey === elementKey)
  }

  const onElementClick = (elementKey: string) => {
    if (elementKey === detail.value.elementKey) return

    const currentAwakenLabel = activeAwakenLabel.value
    const candidates = detail.value.familyMembers.filter(member => member.elementKey === elementKey)
    if (!candidates.length) return

    const target = candidates.find(member => member.formLabel === currentAwakenLabel) || candidates[0]
    if (target) switchAwakenForm(target)
  }

  onLoad((options: Record<string, string | undefined>) => {
    characterId.value = options.characterId || ''
    seedName.value = decodeURIComponent(options.name || '')
    seedAvatar.value = decodeURIComponent(options.avatar || '')
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    detail.value.name = seedName.value
    detail.value.avatar = normalizeUrl(seedAvatar.value)
    uni.setNavigationBarTitle({ title: detail.value.name || '魔灵详情' })
    loadDetail()
  })

  onPullDownRefresh(() => {
    loadDetail()
  })

  onShareAppMessage(() => ({
    title: `魔灵详情 · ${detail.value.name || '图鉴'}`,
    imageUrl: detail.value.avatar || '',
    path: `/subPackages/tools/compendium/swc/detail?characterId=${encodeURIComponent(characterId.value)}&name=${encodeURIComponent(detail.value.name)}&avatar=${encodeURIComponent(detail.value.avatar)}&locale=${encodeURIComponent(selectedLocale.value)}`,
  }))
</script>

<style scoped lang="scss">
  .detail-page {
    min-height: 100vh;
    background: #f4f6fb;
    color: #121a26;
  }

  .top-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    height: 96rpx;
    background: #fff;
    border-bottom: 1rpx solid #edf0f6;
  }

  .top-tab {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    color: #858c99;
    font-size: 30rpx;
    border-right: 1rpx solid #edf0f6;
  }

  .top-tab.active {
    color: #e2bd2f;
  }

  .top-tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 4rpx;
    background: #e2bd2f;
  }

  .tab-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #ff5f5f;
  }

  .content {
    position: relative;
    padding-bottom: 48rpx;
  }

  .locale-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin: 0 22rpx;
    padding: 16rpx 0 4rpx;
  }

  .locale-toolbar-label {
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .locale-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8rpx;
    padding: 6rpx;
    border-radius: 999rpx;
    background: #e8eef5;
  }

  .locale-option {
    min-width: 136rpx;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    border-radius: 999rpx;
    color: #808997;
    font-size: 24rpx;
    font-weight: 700;
  }

  .locale-option.selected {
    background: #2f80ed;
    color: #fff;
  }

  .content-switching {
    opacity: 0.5;
    pointer-events: none;
  }

  .switching-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(244, 246, 251, 0.7);
    color: #4b9df4;
    font-size: 32rpx;
    font-weight: 700;
  }

  .hero-card {
    display: grid;
    grid-template-columns: 180rpx minmax(0, 1fr);
    gap: 16rpx;
    padding: 16rpx 22rpx 18rpx;
    background: #f4f6fb;
  }

  .avatar-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
  }

  .main-avatar {
    width: 150rpx;
    height: 150rpx;
    border: 3rpx solid #e85d55;
    border-radius: 18rpx;
    background: linear-gradient(135deg, #ffe8b0, #fff4dd);
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 46rpx;
    font-weight: 700;
    color: #c75d4d;
  }

  .code-text {
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
    background: #fff;
    color: #667085;
    font-size: 24rpx;
    font-weight: 800;
  }

  .profile-column {
    min-width: 0;
  }

  .profile-head {
    display: flex;
    justify-content: space-between;
    gap: 16rpx;
  }

  .title-wrap {
    min-width: 0;
    flex: 1;
  }

  .name-line {
    display: flex;
    align-items: baseline;
    gap: 10rpx;
  }

  .name {
    font-size: 42rpx;
    font-weight: 800;
    color: #141b2d;
  }

  .alias {
    font-size: 28rpx;
    color: #9ba3b1;
    font-weight: 700;
  }

  .tag-line {
    margin-top: 12rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  .tag {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    background: #e7ebf1;
    color: #737e8f;
    font-size: 24rpx;
    font-weight: 700;
  }

  .tag.accent {
    color: #f16552;
    background: #ffe6e2;
  }

  .tag.star-tag {
    color: #d28a00;
    background: #fff4d6;
  }

  .species {
    display: block;
    margin-top: 10rpx;
    color: #a1a8b5;
    font-size: 24rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .element-row {
    margin-top: 24rpx;
    display: flex;
    gap: 20rpx;
    align-items: center;
  }

  .element-dot {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 4rpx solid transparent;
    opacity: 0.4;
  }

  .element-dot.clickable {
    opacity: 0.65;
    cursor: pointer;
  }

  .element-dot.active {
    opacity: 1;
    border-color: #fff;
    box-shadow:
      0 0 0 4rpx currentColor,
      0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }

  .awaken-btn {
    margin-top: 10rpx;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, #4b9df4, #6c7cf4);
    color: #fff;
    font-size: 22rpx;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 4rpx 12rpx rgba(75, 157, 244, 0.3);
  }

  .detail-tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 12rpx 22rpx 0;
    border-radius: 14rpx;
    background: #e8eef5;
    padding: 6rpx;
    gap: 6rpx;
  }

  .detail-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 68rpx;
    border-radius: 10rpx;
    color: #808997;
    font-size: 28rpx;
    font-weight: 700;
  }

  .detail-tab.active {
    color: #fff;
    background: #4b9df4;
    box-shadow: 0 4rpx 12rpx rgba(75, 157, 244, 0.25);
  }

  .stats-panel {
    padding-bottom: 16rpx;
  }

  .stat-list {
    padding: 12rpx 22rpx 0;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .stat-list.secondary {
    padding-top: 16rpx;
    padding-bottom: 8rpx;
  }

  .stat-row {
    padding: 20rpx 24rpx;
    border-radius: 16rpx;
    background: #fff;
    box-shadow: 0 2rpx 12rpx rgba(40, 52, 76, 0.05);
  }

  .stat-row.minor {
    padding: 16rpx 24rpx;
    background: #f8f9fc;
    box-shadow: none;
  }

  .stat-row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-label-group {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .stat-icon-circle {
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
  }

  .stat-icon {
    font-size: 28rpx;
    color: #fff;
  }

  .stat-label {
    color: #4a5568;
    font-size: 28rpx;
    font-weight: 700;
  }

  .stat-value-group {
    display: flex;
    align-items: baseline;
    gap: 10rpx;
  }

  .stat-value {
    color: #182134;
    font-size: 36rpx;
    font-weight: 800;
  }

  .stat-rank {
    color: #6d75ef;
    font-size: 22rpx;
    font-weight: 800;
  }

  .stat-rank.minor-rank {
    color: #8a93a3;
  }

  .stat-bar {
    margin-top: 14rpx;
    height: 8rpx;
    border-radius: 999rpx;
    background: #edf1f6;
    overflow: hidden;
  }

  .stat-bar-inner {
    height: 100%;
    border-radius: 999rpx;
    transition: width 0.3s ease;
  }

  .section-tabs {
    margin-top: 16rpx;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    height: 78rpx;
    background: #fff;
    border-bottom: 1rpx solid #e8edf5;
  }

  .section-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #858c99;
    font-size: 28rpx;
    font-weight: 700;
  }

  .section-tab.active {
    color: #2f80ed;
    border-bottom: 4rpx solid #2f80ed;
  }

  .skill-section,
  .tag-section,
  .more-section {
    padding: 16rpx 22rpx;
  }

  .language-toggle {
    width: 250rpx;
    height: 64rpx;
    margin-bottom: 18rpx;
    padding: 4rpx;
    border-radius: 999rpx;
    background: #e8eef5;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    color: #808997;
    font-size: 26rpx;
    font-weight: 700;
  }

  .language-toggle text {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .language-toggle .selected {
    color: #fff;
    background: #2f80ed;
    border-radius: 999rpx;
  }

  .skill-card,
  .empty-card,
  .info-card {
    margin-bottom: 18rpx;
    padding: 22rpx;
    border-radius: 18rpx;
    background: #fff;
    box-shadow: 0 2rpx 12rpx rgba(34, 48, 76, 0.05);
  }

  .skill-card.leader {
    border: 2rpx solid #ffe2a8;
    background: linear-gradient(180deg, #fffaf0 0%, #fff 42%);
  }

  .skill-head {
    display: flex;
    gap: 18rpx;
    align-items: center;
  }

  .skill-icon {
    width: 92rpx;
    height: 92rpx;
    border-radius: 16rpx;
    background: #f1f3f7;
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6f7b8d;
    font-size: 36rpx;
  }

  .skill-title-wrap {
    min-width: 0;
    flex: 1;
  }

  .skill-title {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    align-items: center;
    color: #1b2434;
    font-size: 30rpx;
    font-weight: 800;
  }

  .skill-badge {
    padding: 4rpx 10rpx;
    border-radius: 8rpx;
    background: #e8f4ff;
    color: #2f80ed;
    font-size: 22rpx;
    font-weight: 700;
  }

  .skill-type {
    display: block;
    margin-top: 8rpx;
    color: #8e98a8;
    font-size: 24rpx;
  }

  .skill-desc {
    display: block;
    margin-top: 22rpx;
    color: #1f2632;
    font-size: 28rpx;
    line-height: 1.65;
    white-space: pre-line;
  }

  .skill-meta-list {
    margin-top: 18rpx;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .skill-meta-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
    padding: 14rpx 16rpx;
    border-radius: 12rpx;
    background: #f5f8fc;
  }

  .skill-meta-item text:first-child,
  .skill-meta-label {
    flex: none;
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .skill-meta-value {
    flex: 1;
    color: #1f2632;
    font-size: 24rpx;
    font-weight: 700;
    text-align: right;
    word-break: break-word;
  }

  .lineup-section {
    padding: 8rpx 22rpx 0;
  }

  .lineup-section-head {
    margin-bottom: 16rpx;
  }

  .lineup-section-title {
    display: block;
    color: #1d2636;
    font-size: 32rpx;
    font-weight: 800;
  }

  .lineup-section-subtitle {
    display: block;
    margin-top: 8rpx;
    color: #667085;
    font-size: 24rpx;
  }

  .lineup-groups {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }

  .lineup-group-card,
  .lineup-item-card {
    border-radius: 18rpx;
    background: #fff;
    box-shadow: 0 2rpx 12rpx rgba(40, 52, 76, 0.05);
  }

  .lineup-group-card {
    padding: 20rpx;
  }

  .lineup-group-head,
  .lineup-item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .lineup-group-title,
  .lineup-item-name {
    color: #172033;
    font-size: 28rpx;
    font-weight: 800;
  }

  .lineup-group-count,
  .lineup-item-count {
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    background: #eef2ff;
    color: #4b9df4;
    font-size: 22rpx;
    font-weight: 800;
  }

  .lineup-item-card {
    margin-top: 16rpx;
    padding: 18rpx;
    background: #f8fafc;
    box-shadow: none;
  }

  .lineup-item-desc,
  .lineup-item-relation {
    display: block;
    margin-top: 10rpx;
    color: #667085;
    font-size: 24rpx;
    line-height: 1.6;
  }

  .empty-inline {
    margin-top: 14rpx;
    color: #98a2b3;
    font-size: 24rpx;
  }

  .lineup-member-scroll {
    margin-top: 14rpx;
    white-space: nowrap;
  }

  .lineup-member-row {
    display: inline-flex;
    gap: 12rpx;
    padding-bottom: 4rpx;
  }

  .lineup-member-pill {
    width: 160rpx;
    padding: 12rpx;
    border-radius: 16rpx;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
  }

  .lineup-member-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 16rpx;
    background: #e5e7eb;
  }

  .lineup-member-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4b9df4;
    font-weight: 800;
  }

  .lineup-member-name {
    width: 100%;
    color: #172033;
    font-size: 22rpx;
    font-weight: 700;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .coefficient-list {
    margin-top: 18rpx;
    border: 1rpx solid #dceaf8;
    border-radius: 12rpx;
    overflow: hidden;
  }

  .coefficient-item {
    min-height: 58rpx;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 0 14rpx;
    color: #2f80ed;
    font-size: 24rpx;
    border-bottom: 1rpx solid #dceaf8;
  }

  .coefficient-item:last-child {
    border-bottom: 0;
  }

  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .category-chip {
    padding: 14rpx 18rpx;
    border-radius: 14rpx;
    background: #fff;
    color: #5b6677;
    font-size: 26rpx;
    display: flex;
    gap: 12rpx;
  }

  .category-chip text:last-child {
    color: #151d2f;
    font-weight: 800;
  }

  .info-title {
    display: block;
    margin-bottom: 12rpx;
    color: #1d2636;
    font-size: 30rpx;
    font-weight: 800;
  }

  .info-text {
    color: #677386;
    font-size: 26rpx;
    line-height: 1.6;
  }

  .skin-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
  }

  .skin-card {
    min-width: 0;
    text-align: center;
    color: #5d687a;
    font-size: 24rpx;
  }

  .skin-image {
    width: 100%;
    height: 180rpx;
    border-radius: 14rpx;
    background: #f1f3f7;
  }

  .state-block {
    min-height: 680rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
    color: #8b94a4;
    font-size: 28rpx;
  }

  .retry-btn {
    height: 68rpx;
    line-height: 68rpx;
    padding: 0 42rpx;
    border-radius: 999rpx;
    background: #667eea;
    color: #fff;
    font-size: 26rpx;
  }
</style>


