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

    <view v-if="loading" class="state-block">
      <text>加载详情中...</text>
    </view>

    <view v-else-if="errorMessage" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="retry-btn" @click="loadDetail">重试</button>
    </view>

    <view v-else class="content">
      <view class="hero-card">
        <view class="avatar-column">
          <image v-if="detail.avatar" class="main-avatar" :src="detail.avatar" mode="aspectFill" lazy-load />
          <view v-else class="main-avatar avatar-placeholder">
            <text>{{ detail.name.slice(0, 1) || '?' }}</text>
          </view>
          <text v-if="detail.code" class="code-text">No.{{ detail.code }}</text>
          <text v-if="detail.statusText" class="update-text">{{ detail.statusText }}</text>
        </view>

        <view class="profile-column">
          <view class="profile-head">
            <view class="title-wrap">
              <view class="name-line">
                <text class="name">{{ detail.name || '未知魔灵' }}</text>
                <text v-if="detail.alias" class="alias">· {{ detail.alias }}</text>
              </view>
              <view class="tag-line">
                <text v-if="detail.elementName" class="tag accent">{{ detail.elementIcon }} {{ detail.elementName }}</text>
                <text v-if="detail.stars" class="tag star-tag">{{ detail.stars }}★</text>
                <text v-if="detail.archetype" class="tag">{{ detail.archetype }}</text>
                <text v-if="detail.family" class="tag">{{ detail.family }}</text>
              </view>
              <text v-if="detail.description" class="species">{{ detail.description }}</text>
            </view>
            <view class="actions">
              <text class="action-icon" :class="{ active: isFavorite }" @click="toggleFavorite">☆</text>
              <text class="action-icon" @click="copyName">💬</text>
              <text class="action-icon" @click="shareCharacter">↗</text>
            </view>
          </view>

          <view class="element-row">
            <view
              v-for="option in elementBadges"
              :key="option.value"
              class="element-badge"
              :class="{ active: option.label === detail.elementName || option.value === detail.elementKey }">
              <text>{{ option.icon }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="sameElementForms.length > 1" class="awaken-switch-card">
        <view class="awaken-switch-head">
          <view>
            <text class="awaken-title">觉醒形态</text>
            <text class="awaken-subtitle">同属性形态切换</text>
          </view>
          <text class="awaken-count">{{ sameElementForms.length }} 个形态</text>
        </view>
        <view class="awaken-form-row">
          <view
            v-for="form in sameElementForms"
            :key="form.id"
            class="awaken-form"
            :class="{ current: form.isCurrent }"
            @click="switchAwakenForm(form)">
            <image v-if="form.avatar" class="awaken-avatar" :src="form.avatar" mode="aspectFill" lazy-load />
            <view v-else class="awaken-avatar awaken-placeholder">{{ form.name.slice(0, 1) || '?' }}</view>
            <view class="awaken-info">
              <text class="awaken-label">{{ form.formLabel }}</text>
              <text class="awaken-name">{{ form.name || '未知魔灵' }}</text>
            </view>
            <text v-if="form.isCurrent" class="current-mark">当前</text>
          </view>
        </view>
      </view>

      <view class="stat-grid">
        <view v-for="stat in primaryStats" :key="stat.key" class="stat-card">
          <view class="stat-title">
            <text class="stat-icon">{{ stat.icon }}</text>
            <text>{{ stat.label }}</text>
            <text class="stat-value">{{ stat.value || '--' }}</text>
            <text class="stat-rank">{{ stat.rankLabel || '-' }}</text>
          </view>
          <view class="stat-bar">
            <view class="stat-bar-inner" :style="{ width: stat.percent, background: stat.color }" />
          </view>
        </view>
      </view>

      <view class="minor-stat-grid">
        <view v-for="stat in secondaryStats" :key="stat.key" class="minor-stat">
          <text>{{ stat.label }}</text>
          <view class="minor-stat-value">
            <text>{{ stat.value || '--' }}</text>
            <text v-if="stat.rankLabel" class="minor-rank">{{ stat.rankLabel }}</text>
          </view>
        </view>
      </view>

      <!-- <view class="section-tabs">
        <view
          v-for="tab in sectionTabs"
          :key="tab.key"
          class="section-tab"
          :class="{ active: activeSectionTab === tab.key }"
          @click="activeSectionTab = tab.key">
          {{ tab.label }}
        </view>
      </view> -->

      <view v-if="activeSectionTab === 'skills'" class="skill-section">
        <view class="language-toggle">
          <text class="selected">英文</text>
          <text>中文</text>
        </view>

        <view v-if="detail.skills.length === 0" class="empty-card">暂无技能信息</view>
        <view v-for="skill in detail.skills" :key="skill.id || skill.name" class="skill-card" :class="{ leader: skill.type === 'leader' }">
          <view class="skill-head">
            <image v-if="skill.attachment" class="skill-icon" :src="skill.attachment" mode="aspectFill" lazy-load />
            <view v-else class="skill-icon empty-icon">{{ skill.type === 'leader' ? 'L' : skill.orderText }}</view>
            <view class="skill-title-wrap">
              <view class="skill-title">
                <text>{{ skill.name || '未命名技能' }}</text>
                <text v-if="skill.cost" class="skill-badge">{{ skill.cost }}</text>
                <text v-if="skill.cooldown" class="skill-badge">{{ skill.cooldown }}</text>
              </view>
              <text v-if="skill.typeText" class="skill-type">{{ skill.typeText }}</text>
            </view>
          </view>
          <text v-if="skill.description" class="skill-desc">{{ skill.description }}</text>
          <view v-if="skill.coefficients.length" class="coefficient-list">
            <view v-for="coefficient in skill.coefficients" :key="coefficient.id || coefficient.name" class="coefficient-item">
              <text>{{ coefficient.name || '系数' }}</text>
              <text>{{ coefficient.value }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="activeSectionTab === 'tags'" class="tag-section">
        <view v-if="detail.categories.length === 0" class="empty-card">暂无标签</view>
        <view v-else class="category-list">
          <view v-for="category in detail.categories" :key="category.key + category.value" class="category-chip">
            <text>{{ category.name }}</text>
            <text>{{ category.value }}</text>
          </view>
        </view>
      </view>

      <view v-else-if="activeSectionTab === 'more'" class="more-section">
        <view class="info-card">
          <text class="info-title">别名</text>
          <text class="info-text">{{ detail.aliases.join('、') || '暂无' }}</text>
        </view>
        <view class="info-card">
          <text class="info-title">皮肤</text>
          <view v-if="detail.skins.length" class="skin-list">
            <view v-for="skin in detail.skins" :key="skin.id || skin.name" class="skin-card">
              <image v-if="skin.image" class="skin-image" :src="skin.image" mode="aspectFill" lazy-load />
              <text>{{ skin.name || '皮肤' }}</text>
            </view>
          </view>
          <text v-else class="info-text">暂无</text>
        </view>
      </view>

      <view v-else class="empty-card">该模块内容建设中</view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app'
  import { getCompendiumsCharacter } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type {
    getCompendiumsCharacterQuery,
    getCompendiumsCharacterRes,
    getCompendiumsCharacterResAttributes,
    getCompendiumsCharacterResCategories,
    getCompendiumsCharacterResSkills,
    getCompendiumsCharacterResSkillsCoefficients,
    getCompendiumsCharacterResSkins,
  } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'

  type SectionTabKey = 'skills' | 'review' | 'change' | 'tags' | 'more'

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
    description: string
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
    attributes: getCompendiumsCharacterResAttributes[]
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
  const FAVORITE_KEY = `compendium:${COMPENDIUM_CODE}:favoriteCharacters`

  // const topTabs = [
  //   { key: 'main' as const, label: '主要数据' },
  //   { key: 'runes' as const, label: '符文/我的' },
  //   { key: 'team' as const, label: '阵容攻略/RTA', dot: true },
  // ]

  // const sectionTabs = [
  //   { key: 'skills' as const, label: '技能' },
  //   { key: 'review' as const, label: '评论倾向' },
  //   { key: 'change' as const, label: '技改' },
  //   { key: 'tags' as const, label: '标签' },
  //   { key: 'more' as const, label: '更多' },
  // ]

  const elementBadges = [
    { label: '火', value: 'fire', icon: '🔥' },
    { label: '水', value: 'water', icon: '🌊' },
    { label: '风', value: 'wind', icon: '🌪️' },
    { label: '光', value: 'light', icon: '🛡️' },
    { label: '暗', value: 'dark', icon: '⚫' },
  ]

  const activeSectionTab = ref<SectionTabKey>('skills')
  const loading = ref(false)
  const errorMessage = ref('')
  const characterId = ref('')
  const seedName = ref('')
  const seedAvatar = ref('')
  const favoriteIds = ref<string[]>([])
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

  const stringifyValue = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? '是' : '否'
    return ''
  }

  const readRecordString = (record: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
      const value = stringifyValue(record[key]).trim()
      if (value) return value
    }
    return ''
  }

  const readRecordNumber = (record: Record<string, unknown>, keys: string[]): number => {
    for (const key of keys) {
      const value = record[key]
      if (typeof value === 'number') return value
      if (typeof value === 'string' && value.trim()) {
        const numberValue = Number(value)
        if (!Number.isNaN(numberValue)) return numberValue
      }
    }
    return 0
  }

  const readRecordArray = (record: Record<string, unknown>, keys: string[]): unknown[] => {
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

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const extractDetailData = (res: getCompendiumsCharacterRes): getCompendiumsCharacterRes => {
    if (isRecord(res) && isRecord(res.data)) return res.data as getCompendiumsCharacterRes
    return res
  }

  const normalizeCategory = (category: getCompendiumsCharacterResCategories): NormalizedCategory => ({
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

  const normalizeCoefficient = (coefficient: getCompendiumsCharacterResSkillsCoefficients): NormalizedCoefficient => ({
    id: coefficient.id || coefficient.key || coefficient.name || '',
    name: coefficient.name || coefficient.level || '',
    value: [
      stringifyValue(coefficient.value),
      coefficient.unit || '',
      coefficient.triggerProbability ? `触发 ${stringifyValue(coefficient.triggerProbability)}${coefficient.triggerUnit || ''}` : '',
    ]
      .filter(Boolean)
      .join(' '),
  })

  const formatSkillType = (type = ''): string => {
    const map: Record<string, string> = {
      active: '主动技能',
      passive: '被动技能',
      leader: '队长技能',
    }
    return map[type] || type
  }

  const normalizeSkill = (skill: getCompendiumsCharacterResSkills, index: number): NormalizedSkill => ({
    id: skill.id || skill.name || '',
    name: skill.name || '',
    type: skill.type || '',
    typeText: formatSkillType(skill.type),
    orderText: String(index + 1),
    attachment: normalizeUrl(skill.attachment),
    cost: skill.cost || '',
    cooldown: skill.cooldown || '',
    description: skill.description || '',
    coefficients: (skill.coefficients || []).map(normalizeCoefficient),
  })

  const normalizeSkin = (skin: getCompendiumsCharacterResSkins): NormalizedSkin => ({
    id: skin.id || skin.name || '',
    name: skin.name || '',
    image: normalizeUrl(skin.image || skin.attachment),
  })

  const getCategory = (categories: NormalizedCategory[], key: string): NormalizedCategory | undefined =>
    categories.find(item => item.key === key)

  const getCategoryValue = (categories: NormalizedCategory[], key: string): string => getCategory(categories, key)?.value || ''

  const normalizeElementKey = (value: string): string => {
    const normalizedValue = value.trim()
    const map: Record<string, string> = {
      火: 'fire',
      水: 'water',
      风: 'wind',
      光: 'light',
      暗: 'dark',
    }
    return map[normalizedValue] || normalizedValue.toLowerCase()
  }

  const readElement = (record: Record<string, unknown>, categories: NormalizedCategory[]): NormalizedElement => {
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

  const formatAwakenLabel = (record: Record<string, unknown>, categories: NormalizedCategory[]): string => {
    const awakenCategory = categories.find(item => ['awakening', 'awaken', 'form', 'stage'].includes(item.key))
    const rawValue =
      readRecordString(record, ['awakening', 'awaken', 'awakened', 'isAwakened', 'form', 'stage', 'state']) || awakenCategory?.value || ''
    const lowerValue = rawValue.toLowerCase()
    if (['否', 'false', '0'].includes(lowerValue) || lowerValue.includes('未') || lowerValue.includes('unawaken')) return '未觉醒'
    if (['是', 'true', '1'].includes(lowerValue) || lowerValue.includes('觉醒') || lowerValue.includes('awaken')) return '觉醒'
    return rawValue
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

  const getElementIcon = (elementKey: string, elementName: string): string => {
    const key = elementKey || elementName
    const map: Record<string, string> = {
      fire: '🔥',
      火: '🔥',
      water: '🌊',
      水: '🌊',
      wind: '🌪️',
      风: '🌪️',
      light: '🛡️',
      光: '🛡️',
      dark: '🟣',
      暗: '🟣',
    }
    return map[key] || '✦'
  }

  const getAttributeByKey = (
    attributes: getCompendiumsCharacterResAttributes[],
    keys: string[],
  ): getCompendiumsCharacterResAttributes | undefined =>
    attributes.find(attribute => {
      const key = `${attribute.key || ''} ${attribute.name || ''}`.toLowerCase()
      return keys.some(item => key.includes(item.toLowerCase()))
    })

  const normalizeDetail = (rawRes: getCompendiumsCharacterRes): CharacterDetail => {
    const res = extractDetailData(rawRes)
    const record = isRecord(res) ? res : {}
    const categories = (res.categories || []).map(normalizeCategory)
    const attributes = res.attributes || []
    const element = readElement(record, categories)
    const familyMembers = readRecordArray(record, ['familyMembers'])
      .map(normalizeFamilyMember)
      .filter((item): item is NormalizedFamilyMember => Boolean(item))
    const stars = formatAttributeValue(getAttributeByKey(attributes, ['stars', '星级'])).replace(/星$/, '')
    const aliases = res.aliases || []

    return {
      id: res.id || characterId.value,
      name: res.name || seedName.value,
      code: res.code || '',
      alias: aliases[0] || '',
      aliases,
      avatar: normalizeUrl(res.avatar || seedAvatar.value),
      elementKey: element.key,
      elementName: element.name,
      elementIcon: getElementIcon(element.key, element.name),
      level: res.level || '',
      stars,
      archetype: getCategoryValue(categories, 'archetype'),
      family: getCategoryValue(categories, 'family'),
      description: res.description || '',
      statusText: res.status === 'enabled' ? '已收录' : '',
      attributes,
      categories,
      skills: (res.skills || []).map(normalizeSkill),
      skins: (res.skins || []).map(normalizeSkin),
      familyMembers,
    }
  }

  const readFavoriteIds = (): string[] => {
    const value = uni.getStorageSync(FAVORITE_KEY)
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
  }

  const saveFavoriteIds = (ids: string[]) => {
    uni.setStorageSync(FAVORITE_KEY, ids)
  }

  const isFavorite = computed(() => favoriteIds.value.includes(detail.value.id || characterId.value))

  const createCurrentFamilyMember = (): NormalizedFamilyMember => ({
    id: detail.value.id || characterId.value,
    name: detail.value.name || seedName.value,
    code: detail.value.code,
    avatar: detail.value.avatar || seedAvatar.value,
    elementKey: detail.value.elementKey,
    elementName: detail.value.elementName,
    formLabel: '',
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
    return forms.map((member, index) => ({
      ...member,
      formLabel: member.formLabel || (index === 0 ? '未觉醒' : '觉醒'),
    }))
  })

  const findAttribute = (keys: string[]): getCompendiumsCharacterResAttributes | undefined =>
    getAttributeByKey(detail.value.attributes, keys)

  const formatAttributeValue = (attribute?: getCompendiumsCharacterResAttributes): string =>
    attribute ? `${attribute.displayValue || stringifyValue(attribute.value)}${attribute.unit || ''}` : ''

  const formatRankLabel = (attribute?: getCompendiumsCharacterResAttributes): string => {
    if (!attribute) return ''
    const rank = Number(attribute.rank)
    const total = Number(attribute.total)
    if (!rank || !total) return ''
    return `#${rank}/${total}`
  }

  const calculateRankPercent = (attribute: getCompendiumsCharacterResAttributes | undefined, fallback: number): string => {
    const rank = Number(attribute?.rank)
    const total = Number(attribute?.total)
    if (rank > 0 && total > 0) return `${Math.min(100, Math.max(8, ((total - rank + 1) / total) * 100)).toFixed(0)}%`
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
        icon: '❤',
        value: formatAttributeValue(hp),
        rankLabel: formatRankLabel(hp),
        percent: calculateRankPercent(hp, 42),
        color: '#f45b62',
      },
      {
        key: 'attack',
        label: '攻击',
        icon: '✖',
        value: formatAttributeValue(attack),
        rankLabel: formatRankLabel(attack),
        percent: calculateRankPercent(attack, 34),
        color: '#6877f0',
      },
      {
        key: 'defense',
        label: '防御',
        icon: '⬟',
        value: formatAttributeValue(defense),
        rankLabel: formatRankLabel(defense),
        percent: calculateRankPercent(defense, 68),
        color: '#52c489',
      },
      {
        key: 'speed',
        label: '速度',
        icon: '●',
        value: formatAttributeValue(speed),
        rankLabel: formatRankLabel(speed),
        percent: calculateRankPercent(speed, 74),
        color: '#f5a623',
      },
    ]
  })

  const secondaryStats = computed<SecondaryStatItem[]>(() => {
    const critRate = findAttribute(['critRate', '暴击率'])
    const critDamage = findAttribute(['critDmg', 'critDamage', '暴击伤害'])
    const resistance = findAttribute(['resistance', '效果抵抗'])
    const accuracy = findAttribute(['accuracy', '效果命中'])
    return [
      { key: 'critRate', label: '暴击率', value: formatAttributeValue(critRate), rankLabel: formatRankLabel(critRate) },
      { key: 'resistance', label: '效果抵抗', value: formatAttributeValue(resistance), rankLabel: formatRankLabel(resistance) },
      { key: 'critDamage', label: '暴击伤害', value: formatAttributeValue(critDamage), rankLabel: formatRankLabel(critDamage) },
      { key: 'accuracy', label: '效果命中', value: formatAttributeValue(accuracy), rankLabel: formatRankLabel(accuracy) },
    ]
  })

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
      }
      const res = await getCompendiumsCharacter(query)
      detail.value = normalizeDetail(res)
      favoriteIds.value = readFavoriteIds()
      uni.setNavigationBarTitle({ title: `魔灵 wiki-${detail.value.name || '详情'}` })
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '详情加载失败，请稍后重试'
    } finally {
      loading.value = false
      uni.stopPullDownRefresh()
    }
  }

  const toggleFavorite = () => {
    const id = detail.value.id || characterId.value
    if (!id) return
    const set = new Set(favoriteIds.value)
    if (set.has(id)) {
      set.delete(id)
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      set.add(id)
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
    favoriteIds.value = [...set]
    saveFavoriteIds(favoriteIds.value)
  }

  const copyName = () => {
    const name = detail.value.name
    if (!name) return
    uni.setClipboardData({ data: name, showToast: false })
    uni.showToast({ title: '名称已复制', icon: 'success' })
  }

  const shareCharacter = () => {
    uni.showToast({ title: '请使用右上角分享', icon: 'none' })
  }

  const switchAwakenForm = (form: NormalizedFamilyMember) => {
    if (form.isCurrent || !form.id) return
    characterId.value = form.id
    seedName.value = form.name
    seedAvatar.value = form.avatar
    detail.value = {
      ...detail.value,
      id: form.id,
      name: form.name,
      avatar: form.avatar,
    }
    uni.pageScrollTo({ scrollTop: 0, duration: 120 })
    loadDetail()
  }

  onLoad((options: Record<string, string | undefined>) => {
    characterId.value = options.characterId || ''
    seedName.value = decodeURIComponent(options.name || '')
    seedAvatar.value = decodeURIComponent(options.avatar || '')
    detail.value.name = seedName.value
    detail.value.avatar = normalizeUrl(seedAvatar.value)
    uni.setNavigationBarTitle({ title: `魔灵 wiki-${seedName.value || '详情'}` })
    loadDetail()
  })

  onPullDownRefresh(() => {
    loadDetail()
  })

  onShareAppMessage(() => ({
    title: `魔灵 wiki-${detail.value.name || '图鉴'}`,
    path: `/subPackages/tools/compendium/detail?characterId=${encodeURIComponent(characterId.value)}&name=${encodeURIComponent(detail.value.name)}&avatar=${encodeURIComponent(detail.value.avatar)}`,
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
    padding-bottom: 48rpx;
  }

  .hero-card {
    display: grid;
    grid-template-columns: 210rpx minmax(0, 1fr);
    gap: 18rpx;
    padding: 18rpx 22rpx 20rpx;
    background: #f4f6fb;
  }

  .avatar-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14rpx;
  }

  .main-avatar {
    width: 170rpx;
    height: 170rpx;
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

  .update-text {
    color: #a8afbb;
    font-size: 24rpx;
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

  .actions {
    display: flex;
    gap: 16rpx;
    align-items: flex-start;
  }

  .action-icon {
    font-size: 44rpx;
    line-height: 48rpx;
    color: #5f99df;
  }

  .action-icon.active {
    color: #f1bd22;
  }

  .element-row {
    margin-top: 24rpx;
    display: grid;
    grid-template-columns: repeat(5, 72rpx);
    gap: 18rpx;
  }

  .element-badge {
    height: 62rpx;
    border: 2rpx solid #dce3ee;
    border-radius: 16rpx;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
  }

  .element-badge.active {
    border-color: #4b9df4;
    box-shadow: 0 4rpx 12rpx rgba(49, 134, 230, 0.18);
  }

  .awaken-switch-card {
    margin: 0 22rpx 18rpx;
    padding: 20rpx;
    border-radius: 18rpx;
    background: #fff;
    box-shadow: 0 2rpx 10rpx rgba(40, 52, 76, 0.04);
  }

  .awaken-switch-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .awaken-title {
    display: block;
    color: #141b2d;
    font-size: 30rpx;
    font-weight: 900;
  }

  .awaken-subtitle {
    display: block;
    margin-top: 4rpx;
    color: #8a94a6;
    font-size: 22rpx;
  }

  .awaken-count {
    flex: none;
    padding: 4rpx 12rpx;
    border-radius: 999rpx;
    background: #f4f7fb;
    color: #667085;
    font-size: 22rpx;
    font-weight: 700;
  }

  .awaken-form-row {
    margin-top: 18rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
  }

  .awaken-form {
    position: relative;
    min-width: 0;
    padding: 14rpx;
    border: 2rpx solid #eef1f6;
    border-radius: 16rpx;
    background: #f8fafc;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .awaken-form.current {
    border-color: #4b9df4;
    background: #edf6ff;
  }

  .awaken-avatar {
    flex: none;
    width: 72rpx;
    height: 72rpx;
    border-radius: 14rpx;
    background: #fff;
  }

  .awaken-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667085;
    font-size: 28rpx;
    font-weight: 800;
  }

  .awaken-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .awaken-label {
    color: #4b9df4;
    font-size: 22rpx;
    font-weight: 800;
  }

  .awaken-name {
    color: #182134;
    font-size: 26rpx;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .current-mark {
    position: absolute;
    right: 10rpx;
    top: 8rpx;
    color: #4b9df4;
    font-size: 20rpx;
    font-weight: 800;
  }

  .stat-grid {
    padding: 8rpx 22rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }

  .stat-card {
    padding: 18rpx 14rpx;
    border-radius: 14rpx;
    background: #fff;
    box-shadow: 0 2rpx 10rpx rgba(40, 52, 76, 0.04);
  }

  .stat-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    color: #647184;
    font-size: 26rpx;
    font-weight: 700;
  }

  .stat-icon {
    font-size: 30rpx;
  }

  .stat-value {
    margin-left: auto;
    color: #182134;
    font-size: 36rpx;
    font-weight: 800;
  }

  .stat-rank {
    min-width: 84rpx;
    text-align: right;
    color: #6d75ef;
    font-size: 24rpx;
    font-weight: 900;
  }

  .stat-bar {
    margin-top: 12rpx;
    height: 10rpx;
    border-radius: 999rpx;
    background: #edf1f6;
    overflow: hidden;
  }

  .stat-bar-inner {
    height: 100%;
    border-radius: 999rpx;
  }

  .minor-stat-grid {
    margin: 4rpx 22rpx 0;
    padding: 18rpx 22rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12rpx 48rpx;
    border-radius: 14rpx;
    background: #fff;
  }

  .minor-stat {
    display: flex;
    justify-content: space-between;
    gap: 16rpx;
    color: #87909f;
    font-size: 28rpx;
    font-weight: 700;
  }

  .minor-stat-value {
    display: flex;
    align-items: center;
    gap: 10rpx;
    color: #162033;
  }

  .minor-rank {
    color: #8a93a3;
    font-size: 22rpx;
  }

  .minor-stat-value text:first-child {
    color: #162033;
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
    padding: 18rpx 20rpx;
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
