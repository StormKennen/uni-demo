<template>
  <view class="detail-page">
    <view class="top-tabs">
      <view
        v-for="tab in topTabs"
        :key="tab.key"
        class="top-tab"
        :class="{ active: activeTopTab === tab.key }"
        @click="activeTopTab = tab.key">
        <text>{{ tab.label }}</text>
        <text v-if="tab.dot" class="tab-dot" />
      </view>
    </view>

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
          <text class="update-text">{{ detail.statusText }}</text>
        </view>

        <view class="profile-column">
          <view class="profile-head">
            <view class="title-wrap">
              <view class="name-line">
                <text class="name">{{ detail.name || '未知魔灵' }}</text>
                <text v-if="detail.alias" class="alias">· {{ detail.alias }}</text>
              </view>
              <view class="tag-line">
                <text v-if="detail.elementName" class="tag accent">{{ detail.elementName }}</text>
                <text v-if="detail.role" class="tag">{{ detail.role }}</text>
                <text v-if="detail.level" class="tag">{{ detail.level }}</text>
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
              :class="{ active: option.label === detail.elementName || option.value === detail.element }">
              <text>{{ option.icon }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="stat-grid">
        <view v-for="stat in primaryStats" :key="stat.key" class="stat-card">
          <view class="stat-title">
            <text class="stat-icon">{{ stat.icon }}</text>
            <text>{{ stat.label }}</text>
            <text class="stat-value">{{ stat.value || '--' }}</text>
            <text class="stat-rank">{{ stat.rank || '-' }}</text>
          </view>
          <view class="stat-bar">
            <view class="stat-bar-inner" :style="{ width: stat.percent, background: stat.color }" />
          </view>
        </view>
      </view>

      <view class="minor-stat-grid">
        <view v-for="stat in secondaryStats" :key="stat.key" class="minor-stat">
          <text>{{ stat.label }}</text>
          <text>{{ stat.value || '--' }}</text>
        </view>
      </view>

      <view class="section-tabs">
        <view
          v-for="tab in sectionTabs"
          :key="tab.key"
          class="section-tab"
          :class="{ active: activeSectionTab === tab.key }"
          @click="activeSectionTab = tab.key">
          {{ tab.label }}
        </view>
      </view>

      <view v-if="activeSectionTab === 'skills'" class="skill-section">
        <view class="language-toggle">
          <text class="selected">中文</text>
          <text>原格式</text>
        </view>

        <view v-if="detail.skills.length === 0" class="empty-card">暂无技能信息</view>
        <view v-for="skill in detail.skills" :key="skill.id || skill.name" class="skill-card">
          <view class="skill-head">
            <image v-if="skill.attachment" class="skill-icon" :src="skill.attachment" mode="aspectFill" lazy-load />
            <view v-else class="skill-icon empty-icon">✦</view>
            <view class="skill-title-wrap">
              <view class="skill-title">
                <text>{{ skill.name || '未命名技能' }}</text>
                <text v-if="skill.cost" class="skill-badge">{{ skill.cost }}</text>
                <text v-if="skill.cooldown" class="skill-badge">{{ skill.cooldown }}</text>
              </view>
              <text v-if="skill.type" class="skill-type">{{ skill.type }}</text>
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

  type TopTabKey = 'main' | 'runes' | 'team'
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
    attachment: string
    cost: string
    cooldown: string
    description: string
    coefficients: NormalizedCoefficient[]
  }

  interface NormalizedCategory {
    key: string
    name: string
    value: string
  }

  interface NormalizedSkin {
    id: string
    name: string
    image: string
  }

  interface CharacterDetail {
    id: string
    name: string
    alias: string
    aliases: string[]
    avatar: string
    element: string
    elementName: string
    level: string
    role: string
    description: string
    statusText: string
    attributes: getCompendiumsCharacterResAttributes[]
    categories: NormalizedCategory[]
    skills: NormalizedSkill[]
    skins: NormalizedSkin[]
  }

  interface StatItem {
    key: string
    label: string
    icon: string
    value: string
    rank: string
    percent: string
    color: string
  }

  const COMPENDIUM_CODE = 'swc'
  const FAVORITE_KEY = `compendium:${COMPENDIUM_CODE}:favoriteCharacters`

  const topTabs = [
    { key: 'main' as const, label: '主要数据' },
    { key: 'runes' as const, label: '符文/我的' },
    { key: 'team' as const, label: '阵容攻略/RTA', dot: true },
  ]

  const sectionTabs = [
    { key: 'skills' as const, label: '技能' },
    { key: 'review' as const, label: '评论倾向' },
    { key: 'change' as const, label: '技改' },
    { key: 'tags' as const, label: '标签' },
    { key: 'more' as const, label: '更多' },
  ]

  const elementBadges = [
    { label: '火', value: 'fire', icon: '🔥' },
    { label: '水', value: 'water', icon: '🌊' },
    { label: '风', value: 'wind', icon: '🌪️' },
    { label: '光', value: 'light', icon: '🛡️' },
    { label: '暗', value: 'dark', icon: '⚫' },
  ]

  const activeTopTab = ref<TopTabKey>('main')
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
    alias: '',
    aliases: [],
    avatar: '',
    element: '',
    elementName: '',
    level: '',
    role: '',
    description: '',
    statusText: '',
    attributes: [],
    categories: [],
    skills: [],
    skins: [],
  })

  const stringifyValue = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? '是' : '否'
    return ''
  }

  const normalizeUrl = (url?: string): string => {
    if (!url) return ''
    if (url.startsWith('http://')) return url.replace(/^http:/, 'https:')
    return url
  }

  const normalizeCategory = (category: getCompendiumsCharacterResCategories): NormalizedCategory => ({
    key: category.key || category.valueKey || '',
    name: category.name || '',
    value: category.value || '',
  })

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

  const normalizeSkill = (skill: getCompendiumsCharacterResSkills): NormalizedSkill => ({
    id: skill.id || skill.name || '',
    name: skill.name || '',
    type: skill.type || '',
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

  const inferElement = (categories: NormalizedCategory[], fallback = ''): [string, string] => {
    const category = categories.find(
      item =>
        ['element', 'attribute'].includes(item.key) ||
        ['火', '水', '风', '光', '暗'].includes(item.name) ||
        ['fire', 'water', 'wind', 'light', 'dark'].includes(item.value),
    )
    return [category?.value || fallback, category?.name || fallback]
  }

  const inferRole = (categories: NormalizedCategory[]): string => {
    const category = categories.find(
      item => ['type', 'role', 'speciesType'].includes(item.key) || item.name.includes('型') || item.value.includes('型'),
    )
    return category?.value || category?.name || ''
  }

  const normalizeDetail = (res: getCompendiumsCharacterRes): CharacterDetail => {
    const categories = (res.categories || []).map(normalizeCategory)
    const [element, elementName] = inferElement(categories)
    const role = inferRole(categories)
    const aliases = res.aliases || []

    return {
      id: res.id || characterId.value,
      name: res.name || seedName.value,
      alias: aliases[0] || '',
      aliases,
      avatar: normalizeUrl(res.avatar || seedAvatar.value),
      element,
      elementName,
      level: res.level || '',
      role,
      description: res.description || '',
      statusText: res.status === 'enabled' ? '已收录' : '',
      attributes: res.attributes || [],
      categories,
      skills: (res.skills || []).map(normalizeSkill),
      skins: (res.skins || []).map(normalizeSkin),
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

  const findAttribute = (keys: string[]): getCompendiumsCharacterResAttributes | undefined =>
    detail.value.attributes.find(attribute => {
      const key = `${attribute.key || ''} ${attribute.name || ''}`.toLowerCase()
      return keys.some(item => key.includes(item))
    })

  const formatAttributeValue = (attribute?: getCompendiumsCharacterResAttributes): string =>
    attribute?.displayValue || attribute?.value || ''

  const formatRank = (attribute?: getCompendiumsCharacterResAttributes): string => {
    if (!attribute) return ''
    if (typeof attribute.rank === 'string') return attribute.rank
    const rank = Number(attribute.rank)
    const total = Number(attribute.total)
    if (!rank || !total) return ''
    const ratio = rank / total
    if (ratio <= 0.1) return 'S'
    if (ratio <= 0.25) return 'A'
    if (ratio <= 0.5) return 'B'
    return 'C'
  }

  const calculatePercent = (attribute: getCompendiumsCharacterResAttributes | undefined, fallback: number): string => {
    const value = Number(attribute?.value)
    const total = Number(attribute?.total)
    if (value > 0 && total > 0) return `${Math.min(100, Math.max(8, (value / total) * 100)).toFixed(0)}%`
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
        rank: formatRank(hp),
        percent: calculatePercent(hp, 42),
        color: '#f45b62',
      },
      {
        key: 'attack',
        label: '攻击',
        icon: '✖',
        value: formatAttributeValue(attack),
        rank: formatRank(attack),
        percent: calculatePercent(attack, 34),
        color: '#6877f0',
      },
      {
        key: 'defense',
        label: '防御',
        icon: '⬟',
        value: formatAttributeValue(defense),
        rank: formatRank(defense),
        percent: calculatePercent(defense, 68),
        color: '#52c489',
      },
      {
        key: 'speed',
        label: '速度',
        icon: '●',
        value: formatAttributeValue(speed),
        rank: formatRank(speed),
        percent: calculatePercent(speed, 74),
        color: '#f5a623',
      },
    ]
  })

  const secondaryStats = computed(() => {
    const critRate = findAttribute(['critRate', '暴击率'])
    const critDamage = findAttribute(['critDamage', '暴击伤害'])
    const resistance = findAttribute(['resistance', '效果抵抗'])
    const accuracy = findAttribute(['accuracy', '效果命中'])
    return [
      { key: 'critRate', label: '暴击率', value: formatAttributeValue(critRate) },
      { key: 'resistance', label: '效果抵抗', value: formatAttributeValue(resistance) },
      { key: 'critDamage', label: '暴击伤害', value: formatAttributeValue(critDamage) },
      { key: 'accuracy', label: '效果命中', value: formatAttributeValue(accuracy) },
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
    min-width: 34rpx;
    text-align: right;
    color: #6d75ef;
    font-size: 40rpx;
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
    color: #87909f;
    font-size: 28rpx;
    font-weight: 700;
  }

  .minor-stat text:last-child {
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
