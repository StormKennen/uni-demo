<template>
  <PageLayout title="魔灵 wiki-详情">
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
        <!-- <view class="locale-toolbar">
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
        </view> -->
        <view class="hero-card" :class="`hero-element-${detail.elementKey || 'neutral'}`">
          <view class="hero-title-bar">
            <view class="title-wrap">
              <view class="name-line">
                <text class="name">{{ detail.name || '未知魔灵' }}</text>
                <!-- <text v-if="detail.alias" class="alias">/ {{ detail.alias }}</text> -->
              </view>
              <view class="hero-star-line">
                <SwcStarBadge v-if="heroStarCount > 0" :count="heroStarCount" layout="flat" :size="27" />
                <!-- <text v-if="detail.code" class="code-text">No.{{ detail.code }}</text> -->
              </view>
              <view v-if="canSwitchAwaken" class="awaken-switch">
                <view
                  class="awaken-switch-option"
                  :class="{ active: activeAwakenLabel === UNAWAKENED_LABEL }"
                  @click="switchAwakenTo(UNAWAKENED_LABEL)">
                  <text>未觉醒</text>
                </view>
                <view
                  class="awaken-switch-option"
                  :class="{ active: activeAwakenLabel === AWAKENED_LABEL }"
                  @click="switchAwakenTo(AWAKENED_LABEL)">
                  <text>觉醒</text>
                </view>
              </view>
            </view>

            <!-- <view v-if="detail.elementName" class="hero-element-badge">
              <SwcElementBadge :element-key="detail.elementKey" :label="detail.elementName" :size="28" :font-size="24" :gap="8" />
            </view> -->
          </view>

          <view class="hero-portrait-panel">
            <swiper
              v-if="galleryItems.length"
              class="hero-gallery"
              :current="activeGalleryIndex"
              :indicator-dots="galleryItems.length > 1"
              indicator-color="rgba(255, 255, 255, 0.58)"
              indicator-active-color="#ffffff"
              circular
              @change="onGalleryChange">
              <swiper-item v-for="item in galleryItems" :key="item.id">
                <view class="gallery-slide">
                  <image class="main-avatar" :src="item.image" mode="aspectFit" lazy-load />
                  <view class="gallery-caption">
                    <text>{{ item.name }}</text>
                  </view>
                </view>
              </swiper-item>
            </swiper>
            <view v-else class="main-avatar avatar-placeholder">
              <text>{{ detail.name.slice(0, 1) || '?' }}</text>
            </view>
          </view>

          <view class="hero-info-panel">
            <view class="tag-line">
              <view v-if="detail.archetype" class="tag tag-with-icon">
                <SwcSquareIcon kind="archetype" :icon-key="detail.archetype" :size="26" :radius="6" />
                <text>{{ getArchetypeLabel(detail.archetype) }}</text>
              </view>
              <text v-if="detail.family" class="tag">{{ detail.family }}</text>
              <!-- <text v-if="detail.stars" class="tag star-tag">{{ detail.stars }}★</text> -->
            </view>
            <text v-if="detail.description" class="species">{{ detail.description }}</text>
          </view>

          <view class="hero-actions">
            <scroll-view v-if="availableElementBadges.length" class="element-scroll" scroll-x enable-flex>
              <view class="element-row">
                <view
                  v-for="option in availableElementBadges"
                  :key="option.value"
                  class="quick-chip element-chip"
                  :class="{ active: option.value === detail.elementKey, clickable: isSwitchableElement(option.value) }"
                  @click="onElementClick(option.value)">
                  <SwcElementBadge :element-key="option.value" :label="option.label" :size="24" :font-size="23" :gap="8" />
                </view>
              </view>
            </scroll-view>
          </view>
        </view>

        <view class="detail-tabs">
          <view class="detail-tab" :class="{ active: activeDetailTab === 'stats' }" @click="activeDetailTab = 'stats'">
            <text>属性</text>
          </view>
          <view class="detail-tab" :class="{ active: activeDetailTab === 'skills' }" @click="activeDetailTab = 'skills'">
            <text>技能</text>
          </view>
        </view>

        <view v-if="activeDetailTab === 'stats'" class="stats-panel">
          <view v-if="primaryStats.length" class="stat-list">
            <view v-for="stat in primaryStats" :key="stat.key" class="stat-row">
              <view class="stat-row-header">
                <view class="stat-label-group">
                  <view class="stat-icon-circle" :style="{ background: stat.color }">
                    <text class="stat-icon">{{ stat.icon }}</text>
                  </view>
                  <text class="stat-label">{{ stat.label }}</text>
                </view>
                <view class="stat-value-group">
                  <text class="stat-value">{{ stat.value }}</text>
                  <text v-if="stat.rankLabel" class="stat-rank">{{ stat.rankLabel }}</text>
                </view>
              </view>
              <view class="stat-bar">
                <view class="stat-bar-inner" :style="{ width: stat.percent, background: stat.color }" />
              </view>
            </view>
          </view>

          <view v-if="secondaryStats.length" class="stat-list secondary">
            <view v-for="stat in secondaryStats" :key="stat.key" class="stat-row minor">
              <view class="stat-row-header">
                <text class="stat-label">{{ stat.label }}</text>
                <view class="stat-value-group">
                  <text class="stat-value">{{ stat.value }}</text>
                  <!-- <text v-if="stat.rankLabel" class="stat-rank minor-rank">{{ stat.rankLabel }}</text> -->
                </view>
              </view>
            </view>
          </view>
          <view v-if="!primaryStats.length && !secondaryStats.length" class="empty-card">暂无属性数据</view>
        </view>

        <view v-else-if="activeDetailTab === 'skills'" class="skill-section">
          <view v-if="detail.skills.length" class="damage-panel">
            <view class="damage-panel-head" @click="showDamagePanel = !showDamagePanel">
              <view>
                <text class="damage-panel-title">理想伤害</text>
                <text class="damage-panel-subtitle">基础 + 绿色 = 总面板</text>
              </view>
              <text class="damage-panel-toggle">{{ showDamagePanel ? '收起' : '展开' }}</text>
            </view>

            <view v-if="showDamagePanel" class="damage-body">
              <view class="damage-row damage-row-head">
                <text>属性</text>
                <text>基础</text>
                <text>绿色</text>
                <text>总计</text>
              </view>
              <view v-for="row in damageStatRows" :key="row.key" class="damage-row">
                <text class="damage-label">{{ row.label }}</text>
                <text class="damage-base">{{ row.baseText }}</text>
                <input v-model="damageBonus[row.key]" class="damage-input" type="digit" placeholder="0" />
                <text class="damage-total">{{ row.totalText }}</text>
              </view>
              <text class="damage-note">理想值，不含敌方防御、属性克制、神器与技能升级修正。</text>
            </view>
          </view>

          <view v-if="detail.skills.length === 0" class="empty-card">暂无技能数据</view>
          <view
            v-for="(skill, skillIndex) in detail.skills"
            :key="skillDamageKey(skill, skillIndex)"
            class="skill-card"
            :class="{ leader: skill.type === 'leader' }">
            <view class="skill-head">
              <SwcLeaderSkillIcon
                v-if="skill.leaderSkill && skill.leaderSkillIcon"
                :leader-skill="skill.leaderSkill"
                :size="80"
              />
              <image v-else-if="skill.attachment" class="skill-icon" :src="skill.attachment" mode="aspectFill" lazy-load />
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
            <view v-if="skill.multiplierFormula || skill.hitCountText || skill.cooldownText" class="skill-meta-list">
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
            <view class="skill-damage-card" :class="{ muted: !isSkillDamageCalculable(skill, skillIndex) }">
              <view class="skill-damage-head">
                <text class="skill-damage-title">预计伤害</text>
                <text v-if="isSkillDamageCalculable(skill, skillIndex)" class="skill-damage-hits">
                  {{ getSkillDamageHitText(skill, skillIndex) }}
                </text>
              </view>
              <view v-if="isSkillDamageCalculable(skill, skillIndex)" class="skill-damage-grid">
                <view class="skill-damage-item">
                  <text class="skill-damage-label">普通</text>
                  <text class="skill-damage-value">{{ formatDamageValue(getSkillDamageResult(skill, skillIndex).totalNormal) }}</text>
                </view>
                <view class="skill-damage-item critical">
                  <text class="skill-damage-label">暴击</text>
                  <text class="skill-damage-value">{{ formatDamageValue(getSkillDamageResult(skill, skillIndex).totalCritical) }}</text>
                </view>
                <view class="skill-damage-item expected">
                  <text class="skill-damage-label">期望</text>
                  <text class="skill-damage-value">{{ formatDamageValue(getSkillDamageResult(skill, skillIndex).totalExpected) }}</text>
                </view>
              </view>
              <text v-else class="skill-damage-empty">暂无可计算系数</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import SwcElementBadge from './components/swc-element-badge.vue'
  import SwcLeaderSkillIcon from './components/swc-leader-skill-icon.vue'
  import SwcStarBadge from './components/swc-star-badge.vue'
  import SwcSquareIcon from './components/swc-square-icon.vue'
  import {
    SWC_ARCHETYPE_LABEL_MAP,
    buildLeaderSkillIconUrl,
    normalizeSwcArchetype,
    type SwcLeaderSkillInput,
  } from './icon-assets'
  import { buildSwcDetailShare } from './share'
  import { calculateSkillDamage, parseNumber, type DamageStats, type SkillDamageResult } from '@/engine/swc-damage-calculator'
  import { getCompendiumsCharacter } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type { getCompendiumsCharacterQuery } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'

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

  const getArchetypeLabel = (value?: string): string => {
    const normalizedKey = normalizeSwcArchetype(value)
    return SWC_ARCHETYPE_LABEL_MAP[normalizedKey] || value || ''
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
    nameZh?: string
    nameEn?: string
    type?: string
    attachment?: string
    cost?: string
    cooldown?: string
    cooldownTurns?: string | number | null
    description?: string
    descriptionZh?: string
    descriptionEn?: string
    multiplierFormula?: string
    hitCount?: string | number | null
    coefficients?: RawCoefficient[]
    leaderSkill?: SwcLeaderSkillInput | null
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
    avatarOriginal?: string
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
    leaderSkill: SwcLeaderSkillInput | null
    leaderSkillIcon: string
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

  interface GalleryItem {
    id: string
    name: string
    image: string
    type: 'avatar' | 'skin'
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
    avatarOriginal: string
    elementKey: string
    elementName: string
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

  interface DamageBonusForm {
    hp: string
    attack: string
    defense: string
    speed: string
    critRate: string
    critDamage: string
  }

  interface DamageStatRow {
    key: keyof DamageBonusForm
    label: string
    baseText: string
    totalText: string
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
  const errorMessage = ref('')
  const characterId = ref('')
  const seedName = ref('')
  const seedAvatar = ref('')
  const selectedLocale = ref(DEFAULT_LOCALE)
  const activeGalleryIndex = ref(0)
  const showDamagePanel = ref(false)
  const damageBonus = ref<DamageBonusForm>({
    hp: '',
    attack: '',
    defense: '',
    speed: '',
    critRate: '',
    critDamage: '',
  })

  const detail = ref<CharacterDetail>({
    id: '',
    name: '',
    code: '',
    alias: '',
    aliases: [],
    avatar: '',
    avatarOriginal: '',
    elementKey: '',
    elementName: '',
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

  const isRecord = (value: unknown): value is RawRecord => typeof value === 'object' && value !== null && !Array.isArray(value)

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
      coefficient.triggerProbability ? `触发 ${stringifyValue(coefficient.triggerProbability)}${coefficient.triggerUnit || ''}` : '',
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

  const readLocalizedSkillName = (skill: RawSkill): string => {
    if (selectedLocale.value === 'zh-CN') {
      return (skill.nameZh || skill.name || skill.nameEn || '').trim()
    }
    return (skill.nameEn || skill.name || skill.nameZh || '').trim()
  }

  const readLocalizedSkillDescription = (skill: RawSkill): string => {
    if (selectedLocale.value === 'zh-CN') {
      return (skill.descriptionZh || skill.description || skill.descriptionEn || '').trim()
    }
    return (skill.descriptionEn || skill.description || skill.descriptionZh || '').trim()
  }

  const normalizeLeaderSkill = (leaderSkill?: SwcLeaderSkillInput | null): SwcLeaderSkillInput | null => {
    if (!leaderSkill || typeof leaderSkill !== 'object') return null
    const attribute = typeof leaderSkill.attribute === 'string' ? leaderSkill.attribute.trim() : ''
    if (!attribute) return null
    return {
      attribute,
      amount: leaderSkill.amount,
      area: typeof leaderSkill.area === 'string' ? leaderSkill.area.trim() : leaderSkill.area,
      element: typeof leaderSkill.element === 'string' ? leaderSkill.element.trim() : leaderSkill.element,
    }
  }

  const normalizeSkill = (skill: RawSkill, index: number): NormalizedSkill => {
    const leaderSkill = normalizeLeaderSkill(skill.leaderSkill)
    return {
      id: skill.id || skill.name || skill.nameEn || skill.nameZh || '',
      name: readLocalizedSkillName(skill),
      type: skill.type || '',
      typeText: formatSkillType(skill.type),
      orderText: String(index + 1),
      attachment: normalizeUrl(skill.attachment),
      cost: skill.cost || '',
      cooldown: skill.cooldown || '',
      cooldownText: formatCooldownText(skill),
      description: readLocalizedSkillDescription(skill),
      multiplierFormula: formatMultiplierFormula(skill),
      hitCountText: formatHitCountText(skill),
      coefficients: (skill.coefficients || []).map(normalizeCoefficient),
      leaderSkill,
      leaderSkillIcon: buildLeaderSkillIconUrl(leaderSkill),
    }
  }

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

  const readFieldText = (record: RawRecord, keys: string[]): string => {
    for (const key of keys) {
      const value = record[key]
      if (isRecord(value)) {
        const text = readRecordString(value, ['key', 'valueKey', 'value', 'name'])
        if (text) return text
      } else {
        const text = stringifyValue(value).trim()
        if (text) return text
      }
    }
    return ''
  }

  const formatAwakenLabel = (record: RawRecord, categories: NormalizedCategory[]): string => {
    const awakenCategory = categories.find(item => ['awakening', 'awaken', 'form', 'stage'].includes(item.key))
    const rawValue =
      readFieldText(record, ['awakening', 'awaken', 'awakened', 'isAwakened', 'form', 'stage', 'state']) ||
      awakenCategory?.valueKey ||
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
      avatarOriginal: normalizeUrl(res.avatarOriginal),
      elementKey: element.key,
      elementName: element.name,
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
    avatar: detailAvatarSrc.value,
    elementKey: detail.value.elementKey,
    elementName: detail.value.elementName,
    formLabel: formatAwakenLabel({}, detail.value.categories),
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

  const detailAvatarSrc = computed(() => detail.value.avatarOriginal || detail.value.avatar || seedAvatar.value)

  const galleryItems = computed<GalleryItem[]>(() => {
    const items: GalleryItem[] = []
    if (detailAvatarSrc.value) {
      items.push({
        id: 'avatar',
        name: '',
        image: detailAvatarSrc.value,
        type: 'avatar',
      })
    }

    detail.value.skins
      .filter(skin => Boolean(skin.image))
      .forEach((skin, index) => {
        items.push({
          id: `skin-${skin.id || index}`,
          name: skin.name || `皮肤 ${index + 1}`,
          image: skin.image,
          type: 'skin',
        })
      })

    return items
  })

  const onGalleryChange = (event: { detail?: { current?: number } }) => {
    activeGalleryIndex.value = event.detail?.current || 0
  }

  const heroStarCount = computed(() => {
    const parsedValue = Number.parseInt((detail.value.stars || '').replace(/\D+/g, ''), 10)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  })

  const availableElementBadges = computed(() =>
    elementBadges.filter(
      option => option.value === detail.value.elementKey || detail.value.familyMembers.some(member => member.elementKey === option.value),
    ),
  )

  const isSwitchableElement = (elementKey: string): boolean =>
    elementKey !== detail.value.elementKey && detail.value.familyMembers.some(member => member.elementKey === elementKey)

  const findAttribute = (keys: string[]): RawAttribute | undefined => getAttributeByKey(detail.value.attributes, keys)

  const parseAttributeNumber = (attribute: RawAttribute | undefined, fallback = 0): number => {
    if (!attribute) return fallback
    const parsed = parseNumber(attribute.value ?? attribute.displayValue ?? '')
    return parsed || fallback
  }

  const formatDamageNumber = (value: number, suffix = ''): string => {
    const rounded = Math.round(value)
    return `${rounded.toLocaleString('en-US')}${suffix}`
  }

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

  const damageBaseStats = computed<DamageStats>(() => ({
    hp: parseAttributeNumber(findAttribute(['hp', '体力', '生命'])),
    attack: parseAttributeNumber(findAttribute(['attack', '攻击'])),
    defense: parseAttributeNumber(findAttribute(['defense', '防御'])),
    speed: parseAttributeNumber(findAttribute(['speed', '速度'])),
    critRate: parseAttributeNumber(findAttribute(['critrate', '暴击率']), 15),
    critDamage: parseAttributeNumber(findAttribute(['critdmg', 'critdamage', '暴击伤害']), 50),
  }))

  const damageTotalStats = computed<DamageStats>(() => ({
    hp: damageBaseStats.value.hp + parseNumber(damageBonus.value.hp),
    attack: damageBaseStats.value.attack + parseNumber(damageBonus.value.attack),
    defense: damageBaseStats.value.defense + parseNumber(damageBonus.value.defense),
    speed: damageBaseStats.value.speed + parseNumber(damageBonus.value.speed),
    critRate: damageBaseStats.value.critRate + parseNumber(damageBonus.value.critRate),
    critDamage: damageBaseStats.value.critDamage + parseNumber(damageBonus.value.critDamage),
  }))

  const damageStatRows = computed<DamageStatRow[]>(() => [
    {
      key: 'hp',
      label: '体力',
      baseText: formatDamageNumber(damageBaseStats.value.hp),
      totalText: formatDamageNumber(damageTotalStats.value.hp),
    },
    {
      key: 'attack',
      label: '攻击',
      baseText: formatDamageNumber(damageBaseStats.value.attack),
      totalText: formatDamageNumber(damageTotalStats.value.attack),
    },
    {
      key: 'defense',
      label: '防御',
      baseText: formatDamageNumber(damageBaseStats.value.defense),
      totalText: formatDamageNumber(damageTotalStats.value.defense),
    },
    {
      key: 'speed',
      label: '速度',
      baseText: formatDamageNumber(damageBaseStats.value.speed),
      totalText: formatDamageNumber(damageTotalStats.value.speed),
    },
    {
      key: 'critRate',
      label: '暴率',
      baseText: formatDamageNumber(damageBaseStats.value.critRate, '%'),
      totalText: formatDamageNumber(damageTotalStats.value.critRate, '%'),
    },
    {
      key: 'critDamage',
      label: '暴伤',
      baseText: formatDamageNumber(damageBaseStats.value.critDamage, '%'),
      totalText: formatDamageNumber(damageTotalStats.value.critDamage, '%'),
    },
  ])

  const skillDamageKey = (skill: NormalizedSkill, index: number): string => skill.id || skill.name || String(index)

  const skillDamageResults = computed(() => {
    const resultMap = new Map<string, SkillDamageResult>()
    detail.value.skills.forEach((skill, index) => {
      resultMap.set(
        skillDamageKey(skill, index),
        calculateSkillDamage(
          {
            multiplierFormula: skill.multiplierFormula,
            hitCount: skill.hitCountText,
            coefficients: skill.coefficients,
          },
          damageTotalStats.value,
        ),
      )
    })
    return resultMap
  })

  const getSkillDamageResult = (skill: NormalizedSkill, index: number): SkillDamageResult =>
    skillDamageResults.value.get(skillDamageKey(skill, index)) ||
    calculateSkillDamage(
      {
        multiplierFormula: skill.multiplierFormula,
        hitCount: skill.hitCountText,
        coefficients: skill.coefficients,
      },
      damageTotalStats.value,
    )

  const isSkillDamageCalculable = (skill: NormalizedSkill, index: number): boolean => getSkillDamageResult(skill, index).calculable

  const getSkillDamageHitText = (skill: NormalizedSkill, index: number): string => {
    const result = getSkillDamageResult(skill, index)
    return result.hitCount > 1 ? `${result.hitCount} 段合计` : '单段'
  }

  const formatDamageValue = (value: number): string => formatDamageNumber(value)

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
    ].filter(stat => stat.value)
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
    ].filter(stat => stat.value)
  })

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
    activeGalleryIndex.value = 0

    try {
      const query: getCompendiumsCharacterQuery = {
        compendiumId: COMPENDIUM_CODE,
        characterId: characterId.value,
        locale: selectedLocale.value,
      }
      const res = await getCompendiumsCharacter(query)
      detail.value = normalizeDetail(res)
      uni.setNavigationBarTitle({ title: detail.value.name || '魔灵详情' })
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '详情加载失败，请稍后重试'
    } finally {
      loading.value = false
      uni.stopPullDownRefresh()
    }
  }

  let switchRequestToken = 0

  const switchAwakenForm = async (form: NormalizedFamilyMember) => {
    if (form.isCurrent || !form.id) return

    const requestToken = ++switchRequestToken
    switching.value = true
    errorMessage.value = ''
    activeGalleryIndex.value = 0
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
      if (requestToken !== switchRequestToken) return
      detail.value = normalizeDetail(res)
      uni.setNavigationBarTitle({ title: detail.value.name || '魔灵详情' })
      switching.value = false
    } catch (error) {
      if (requestToken !== switchRequestToken) return
      errorMessage.value = typeof error === 'string' ? error : '切换形态失败，请稍后重试'
      switching.value = false
    }
  }

  const switchAwakenTo = (targetLabel: string) => {
    if (targetLabel === activeAwakenLabel.value) return
    const target = sameElementForms.value.find(member => member.formLabel === targetLabel)
    if (target) switchAwakenForm(target)
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

  // #ifdef MP-WEIXIN
  onShareAppMessage(
    () =>
      buildSwcDetailShare({
        characterId: characterId.value,
        name: detail.value.name,
        avatar: detailAvatarSrc.value,
        locale: selectedLocale.value,
      }).app,
  )

  onShareTimeline(
    () =>
      buildSwcDetailShare({
        characterId: characterId.value,
        name: detail.value.name,
        avatar: detailAvatarSrc.value,
        locale: selectedLocale.value,
      }).timeline,
  )
  // #endif
</script>

<style scoped lang="scss">
  .detail-page {
    min-height: 100vh;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .top-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    height: 96rpx;
    background: var(--theme-surface);
    border-bottom: 1rpx solid var(--theme-border);
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
    --hero-card-tint: rgba(75, 157, 244, 0.08);
    margin: 14rpx 18rpx 0;
    padding: 16rpx;
    border: 2rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: linear-gradient(180deg, var(--hero-card-tint), transparent 72%), var(--theme-surface);
    box-shadow: 0 10rpx 24rpx var(--theme-shadow-xs);
    overflow: hidden;
  }

  .hero-element-fire {
    --hero-card-tint: rgba(232, 93, 85, 0.14);
    --hero-accent: #e85d55;
    --hero-accent-soft: rgba(232, 93, 85, 0.12);
  }

  .hero-element-water {
    --hero-card-tint: rgba(75, 157, 244, 0.14);
    --hero-accent: #4b9df4;
    --hero-accent-soft: rgba(75, 157, 244, 0.12);
  }

  .hero-element-wind {
    --hero-card-tint: rgba(42, 166, 111, 0.14);
    --hero-accent: #2aa66f;
    --hero-accent-soft: rgba(42, 166, 111, 0.12);
  }

  .hero-element-light {
    --hero-card-tint: rgba(217, 154, 22, 0.16);
    --hero-accent: #d99a16;
    --hero-accent-soft: rgba(217, 154, 22, 0.13);
  }

  .hero-element-dark {
    --hero-card-tint: rgba(124, 77, 255, 0.15);
    --hero-accent: #7c4dff;
    --hero-accent-soft: rgba(124, 77, 255, 0.13);
  }

  .hero-element-neutral {
    --hero-card-tint: rgba(75, 157, 244, 0.08);
    --hero-accent: #4b9df4;
    --hero-accent-soft: rgba(75, 157, 244, 0.12);
  }

  .hero-title-bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
    min-width: 0;
  }

  .avatar-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
  }

  .main-avatar {
    width: 100%;
    height: 100%;
    border-radius: 18rpx;
    background: transparent;
  }

  .hero-gallery,
  .gallery-slide {
    width: 100%;
    height: 100%;
  }

  .gallery-slide {
    position: relative;
  }

  .gallery-caption {
    position: absolute;
    left: 16rpx;
    bottom: 16rpx;
    max-width: calc(100% - 32rpx);
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    background: rgba(20, 27, 45, 0.52);
    color: #fff;
    font-size: 22rpx;
    font-weight: 700;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    padding: 3rpx 12rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.72);
    color: #667085;
    font-size: 21rpx;
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
    flex-wrap: wrap;
    gap: 8rpx;
  }

  .name {
    font-size: 38rpx;
    font-weight: 800;
    color: var(--theme-text);
    line-height: 1.18;
  }

  .alias {
    font-size: 24rpx;
    color: var(--theme-text-tertiary);
    font-weight: 700;
  }

  .hero-star-line {
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    min-height: 30rpx;
  }

  .awaken-switch {
    margin-top: 12rpx;
    width: 212rpx;
    min-height: 48rpx;
    padding: 4rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4rpx;
    box-sizing: border-box;
  }

  .awaken-switch-option {
    min-width: 0;
    border-radius: 999rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }

  .awaken-switch-option.active {
    background: var(--hero-accent);
    color: #fff;
    box-shadow: 0 6rpx 14rpx rgba(28, 39, 62, 0.12);
  }

  .hero-element-badge {
    flex: none;
    min-height: 50rpx;
    padding: 0 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    box-shadow: 0 4rpx 12rpx var(--theme-shadow-xs);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tag-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8rpx;
  }

  .tag {
    padding: 3rpx 10rpx;
    border-radius: 8rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .tag-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
  }

  .element-badge-plain {
    display: inline-flex;
    align-items: center;
    height: 46rpx;
    padding: 0 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .tag.star-tag {
    color: #d28a00;
    background: rgba(217, 154, 22, 0.14);
  }

  .species {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.45;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .hero-portrait-panel {
    position: relative;
    height: 430rpx;
    margin-top: 16rpx;
    padding: 10rpx;
    border: 2rpx solid transparent;
    border-radius: 22rpx;
    background: transparent;
    box-shadow: none;
    box-sizing: border-box;
  }

  .hero-info-panel {
    margin-top: 14rpx;
    padding: 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
  }

  .hero-actions {
    margin-top: 12rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .element-scroll {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
  }

  .element-row {
    display: flex;
    gap: 10rpx;
    align-items: center;
    padding-right: 8rpx;
  }

  .quick-chip {
    min-height: 48rpx;
    padding: 0 14rpx;
    border-radius: 999rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease,
      opacity 0.2s ease;
  }

  .element-chip.clickable {
    opacity: 0.82;
    cursor: pointer;
  }

  .element-chip.active {
    opacity: 1;
    border-color: var(--hero-accent);
    background: var(--hero-accent-soft);
    color: var(--hero-accent);
    box-shadow:
      0 8rpx 18rpx rgba(75, 157, 244, 0.12),
      inset 0 0 0 1rpx rgba(255, 255, 255, 0.7);
  }

  .detail-tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 12rpx 20rpx 0;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
    padding: 5rpx;
    gap: 5rpx;
  }

  .detail-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60rpx;
    border-radius: 9rpx;
    color: var(--theme-text-secondary);
    font-size: 26rpx;
    font-weight: 700;
  }

  .detail-tab.active {
    color: #fff;
    background: #4b9df4;
    box-shadow: 0 4rpx 12rpx rgba(75, 157, 244, 0.25);
  }

  .stats-panel {
    padding: 14rpx 20rpx 20rpx;
  }

  .stat-list {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }

  .stat-list.secondary {
    margin-top: 14rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10rpx;
  }

  .stat-row {
    position: relative;
    padding: 18rpx 20rpx;
    border: 1rpx solid rgba(148, 163, 184, 0.16);
    border-radius: 16rpx;
    background: var(--theme-surface);
    overflow: hidden;
    box-shadow: 0 6rpx 16rpx rgba(40, 52, 76, 0.05);
  }

  .stat-row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 18rpx;
    bottom: 18rpx;
    width: 6rpx;
    border-radius: 0 999rpx 999rpx 0;
    background: var(--theme-brand);
  }

  .stat-row.minor {
    min-height: 94rpx;
    padding: 14rpx 16rpx;
    border-color: var(--theme-border);
    background: var(--theme-surface-2);
    box-shadow: none;
  }

  .stat-row.minor::before {
    display: none;
  }

  .stat-row.minor .stat-row-header {
    min-height: 62rpx;
    flex-direction: column;
    align-items: flex-start;
    gap: 8rpx;
  }

  .stat-row.minor .stat-value-group {
    width: 100%;
    justify-content: space-between;
  }

  .stat-row.minor .stat-value {
    font-size: 28rpx;
  }

  .stat-row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-label-group {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .stat-icon-circle {
    width: 46rpx;
    height: 46rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
  }

  .stat-icon {
    font-size: 25rpx;
    color: #fff;
  }

  .stat-label {
    color: var(--theme-text-secondary);
    font-size: 26rpx;
    font-weight: 700;
  }

  .stat-value-group {
    display: flex;
    align-items: baseline;
    gap: 10rpx;
    min-width: 0;
  }

  .stat-value {
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 800;
    white-space: nowrap;
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
    background: var(--theme-surface-2);
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
    background: var(--theme-surface);
    border-bottom: 1rpx solid var(--theme-border);
  }

  .section-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-secondary);
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
    padding: 14rpx 20rpx;
  }

  .damage-panel {
    margin-bottom: 14rpx;
    padding: 14rpx 16rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    background: var(--theme-surface);
    box-shadow: none;
  }

  .damage-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .damage-panel-title {
    display: block;
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 800;
  }

  .damage-panel-subtitle {
    display: block;
    margin-top: 4rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .damage-panel-toggle {
    flex-shrink: 0;
    height: 44rpx;
    line-height: 44rpx;
    padding: 0 16rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 700;
  }

  .damage-body {
    margin-top: 14rpx;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
  }

  .damage-row {
    display: grid;
    grid-template-columns: 1.05fr 1.15fr 1.35fr 1.15fr;
    align-items: center;
    gap: 8rpx;
    min-height: 64rpx;
    padding: 8rpx 12rpx;
    border-top: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    box-sizing: border-box;
  }

  .damage-row:first-child {
    border-top: none;
  }

  .damage-row-head {
    min-height: 48rpx;
    color: var(--theme-text-tertiary);
    background: var(--theme-surface-2);
    font-size: 22rpx;
    font-weight: 700;
  }

  .damage-label {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 700;
  }

  .damage-base,
  .damage-total {
    min-width: 0;
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .damage-total {
    color: var(--theme-brand);
    text-align: right;
  }

  .damage-input {
    width: 100%;
    height: 46rpx;
    min-width: 0;
    padding: 0 10rpx;
    border-radius: 9rpx;
    color: var(--theme-text);
    background: var(--theme-surface-2);
    font-size: 24rpx;
    box-sizing: border-box;
  }

  .damage-note {
    display: block;
    padding: 10rpx 12rpx;
    color: var(--theme-text-tertiary);
    background: var(--theme-surface-2);
    border-top: 1rpx solid var(--theme-border);
    font-size: 21rpx;
    line-height: 1.45;
  }

  .language-toggle {
    width: 250rpx;
    height: 64rpx;
    margin-bottom: 18rpx;
    padding: 4rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    color: var(--theme-text-secondary);
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
    margin-bottom: 14rpx;
    padding: 18rpx;
    border-radius: 14rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
    box-shadow: 0 2rpx 8rpx var(--theme-shadow-xs);
  }

  .skill-card.leader {
    border: 2rpx solid rgba(217, 154, 22, 0.34);
    background: linear-gradient(180deg, rgba(217, 154, 22, 0.12) 0%, transparent 48%), var(--theme-surface);
  }

  .skill-head {
    display: flex;
    gap: 14rpx;
    align-items: center;
  }

  .skill-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-secondary);
    font-size: 32rpx;
  }

  .skill-title-wrap {
    min-width: 0;
    flex: 1;
  }

  .skill-title {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    align-items: center;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 800;
  }

  .skill-badge {
    padding: 3rpx 9rpx;
    border-radius: 8rpx;
    background: rgba(0, 70, 180, 0.12);
    color: var(--theme-brand);
    font-size: 21rpx;
    font-weight: 700;
  }

  .skill-type {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .skill-desc {
    display: block;
    margin-top: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 26rpx;
    line-height: 1.55;
    white-space: pre-line;
  }

  .skill-meta-list {
    margin-top: 14rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .skill-meta-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12rpx;
    padding: 10rpx 12rpx;
    border-radius: 10rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
  }

  .skill-meta-item text:first-child,
  .skill-meta-label {
    flex: none;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .skill-meta-value {
    flex: 1;
    color: var(--theme-text);
    font-size: 22rpx;
    font-weight: 700;
    text-align: right;
    word-break: break-word;
  }

  .skill-damage-card {
    margin-top: 14rpx;
    padding: 12rpx;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
  }

  .skill-damage-card.muted {
    opacity: 0.78;
  }

  .skill-damage-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .skill-damage-title {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 800;
  }

  .skill-damage-hits {
    flex-shrink: 0;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .skill-damage-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8rpx;
    margin-top: 10rpx;
  }

  .skill-damage-item {
    min-width: 0;
    padding: 10rpx 8rpx;
    border-radius: 10rpx;
    background: var(--theme-surface);
    text-align: center;
  }

  .skill-damage-item.critical .skill-damage-value {
    color: #dc2626;
  }

  .skill-damage-item.expected .skill-damage-value {
    color: var(--theme-brand);
  }

  .skill-damage-label {
    display: block;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .skill-damage-value {
    display: block;
    margin-top: 4rpx;
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-damage-empty {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
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
    background: var(--theme-surface);
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
