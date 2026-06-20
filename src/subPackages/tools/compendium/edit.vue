<template>
  <view class="edit-page">
    <PageLayout title="编辑角色" nav-gradient="linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)" />

    <view v-if="loading" class="state-block">
      <text>加载数据中...</text>
    </view>

    <view v-else-if="errorMessage" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="retry-btn" @click="loadDetail">重试</button>
    </view>

    <view v-else class="content">
      <view class="hero-card">
        <image v-if="heroAvatar" class="hero-avatar" :src="heroAvatar" mode="aspectFill" lazy-load />
        <view v-else class="hero-avatar hero-avatar-placeholder">
          <text>{{ heroInitial }}</text>
        </view>

        <view class="hero-meta">
          <text class="hero-caption">当前编辑人物</text>
          <text class="hero-name">{{ displayName }}</text>
          <text class="hero-locale">语言：{{ selectedLocaleLabel }}</text>
        </view>
      </view>

      <view class="locale-toolbar">
        <text class="locale-toolbar-label">编辑语言</text>
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

      <view class="section">
        <text class="section-title">人物文案</text>
        <view class="field">
          <text class="field-label">人物名称</text>
          <input v-model="form.name" class="field-input" placeholder="请输入人物名称" />
        </view>
        <text class="field-tip">攻击、生命、防御等数值属性暂不开放编辑。</text>
      </view>

      <view class="section">
        <text class="section-title">技能内容</text>
        <view v-if="form.skills.length === 0" class="empty-block">当前人物暂无技能数据</view>

        <view v-for="(skill, index) in form.skills" :key="skill.id || String(index)" class="skill-block">
          <view class="skill-head-row">
            <text class="skill-index">技能 {{ index + 1 }}</text>
            <text v-if="skill.type" class="skill-type-label">{{ skill.type }}</text>
          </view>

          <view class="field">
            <text class="field-label">技能名称</text>
            <input v-model="skill.name" class="field-input" placeholder="请输入技能名称" />
          </view>

          <view class="field">
            <text class="field-label">技能描述</text>
            <textarea
              v-model="skill.description"
              class="field-textarea"
              placeholder="请输入技能描述"
              :maxlength="2000" />
          </view>

          <view class="field">
            <text class="field-label">技能次数</text>
            <input
              v-model="skill.hitCountText"
              class="field-input"
              type="number"
              placeholder="请输入命中次数 / 攻击次数" />
          </view>

          <view v-if="skill.coefficients.length" class="coefficient-section">
            <text class="coefficient-title">技能系数</text>
            <view
              v-for="(coefficient, coefficientIndex) in skill.coefficients"
              :key="coefficient.id || `${index}-${coefficientIndex}`"
              class="coefficient-item">
              <view class="field">
                <text class="field-label">{{ coefficient.name || `系数 ${coefficientIndex + 1}` }}</text>
                <input
                  v-model="coefficient.valueText"
                  class="field-input"
                  type="digit"
                  placeholder="请输入技能系数" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <button class="submit-btn" :loading="submitting" :disabled="submitting" @click="handleSubmit">保存修改</button>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import { getCompendiumsCharacter } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type { getCompendiumsCharacterQuery } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'
  import { patchAdminCompendiumsCharacters } from '@/services/apifox/NODEJSDEMO/COMPENDIUMADMIN/apifox'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'

  interface LocaleOption {
    label: string
    value: string
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

  const localeOptions: LocaleOption[] = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en' },
  ]

  const loading = ref(false)
  const submitting = ref(false)
  const errorMessage = ref('')
  const characterId = ref('')
  const seedName = ref('')
  const selectedLocale = ref(DEFAULT_LOCALE)
  const avatar = ref('')

  const form = reactive({
    name: '',
    skills: [] as SkillForm[],
  })

  const selectedLocaleLabel = computed(() => localeOptions.find(option => option.value === selectedLocale.value)?.label || selectedLocale.value)
  const displayName = computed(() => form.name || seedName.value || '未命名人物')
  const heroAvatar = computed(() => normalizeUrl(avatar.value))
  const heroInitial = computed(() => displayName.value.slice(0, 1) || '?')

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const extractData = (res: unknown): Record<string, unknown> => {
    if (isRecord(res) && isRecord(res.data)) return res.data as Record<string, unknown>
    if (isRecord(res)) return res
    return {}
  }

  const toText = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return ''
  }

  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http://')) return url.replace(/^http:/, 'https:')
    return url
  }

  const normalizeNumberLike = (value: string): number | string | undefined => {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? trimmed : parsed
  }

  const resetForm = () => {
    form.name = ''
    form.skills = []
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

  const loadDetail = async () => {
    if (!characterId.value) {
      errorMessage.value = '缺少角色 ID'
      return
    }

    loading.value = true
    errorMessage.value = ''
    resetForm()

    try {
      const query: getCompendiumsCharacterQuery = {
        compendiumId: COMPENDIUM_CODE,
        characterId: characterId.value,
        locale: selectedLocale.value,
      }
      const rawRes = await getCompendiumsCharacter(query)
      const data = extractData(rawRes)
      const skills = Array.isArray(data.skills) ? data.skills : []

      form.name = toText(data.name) || seedName.value
      avatar.value = toText(data.avatar)
      form.skills = skills.map(normalizeSkill)
      uni.setNavigationBarTitle({ title: `编辑 - ${displayName.value}` })
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  const changeLocale = (locale: string) => {
    if (locale === selectedLocale.value) return
    selectedLocale.value = locale
    loadDetail()
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

  const handleSubmit = async () => {
    if (!characterId.value) return
    submitting.value = true

    try {
      const body: Record<string, unknown> = {
        compendiumId: COMPENDIUM_CODE,
        characterId: characterId.value,
        locale: selectedLocale.value,
        name: form.name || undefined,
        skills: form.skills.map(buildSkillPayload),
      }

      await patchAdminCompendiumsCharacters(body as never)
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 700)
    } catch (error) {
      const message = typeof error === 'string' ? error : '保存失败，请稍后重试'
      uni.showToast({ title: message, icon: 'none' })
    } finally {
      submitting.value = false
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    characterId.value = options.characterId || ''
    seedName.value = decodeURIComponent(options.name || '')
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    uni.setNavigationBarTitle({ title: `编辑 - ${seedName.value || '角色'}` })
    loadDetail()
  })
</script>

<style scoped lang="scss">
  .edit-page {
    min-height: 100vh;
    background: #f4f6fb;
    padding-bottom: 160rpx;
  }

  .state-block {
    min-height: 520rpx;
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

  .content {
    padding: 24rpx;
  }

  .hero-card {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 24rpx;
    padding: 24rpx;
    border-radius: 22rpx;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    box-shadow: 0 8rpx 24rpx rgba(29, 78, 216, 0.08);
  }

  .hero-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 24rpx;
    background: #fff;
    flex: none;
  }

  .hero-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1d4ed8;
    font-size: 44rpx;
    font-weight: 800;
  }

  .hero-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .hero-caption {
    color: #5b6b86;
    font-size: 22rpx;
    font-weight: 700;
  }

  .hero-name {
    color: #0f172a;
    font-size: 36rpx;
    font-weight: 800;
    line-height: 1.3;
    word-break: break-word;
  }

  .hero-locale {
    color: #2563eb;
    font-size: 24rpx;
    font-weight: 700;
  }

  .locale-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 20rpx;
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

  .section {
    margin-bottom: 28rpx;
    padding: 24rpx;
    border-radius: 16rpx;
    background: #fff;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  }

  .section-title {
    display: block;
    margin-bottom: 16rpx;
    color: #121a26;
    font-size: 30rpx;
    font-weight: 800;
  }

  .field {
    margin-bottom: 18rpx;
  }

  .field-label {
    display: block;
    margin-bottom: 8rpx;
    color: #667085;
    font-size: 24rpx;
    font-weight: 600;
  }

  .field-input {
    width: 100%;
    height: 72rpx;
    padding: 0 20rpx;
    border: 2rpx solid #e7ebf2;
    border-radius: 12rpx;
    background: #fafbfc;
    color: #121a26;
    font-size: 28rpx;
    box-sizing: border-box;
  }

  .field-textarea {
    width: 100%;
    min-height: 180rpx;
    padding: 16rpx 20rpx;
    border: 2rpx solid #e7ebf2;
    border-radius: 12rpx;
    background: #fafbfc;
    color: #121a26;
    font-size: 28rpx;
    line-height: 1.6;
    box-sizing: border-box;
  }

  .field-tip {
    color: #8a94a6;
    font-size: 24rpx;
    line-height: 1.6;
  }

  .empty-block {
    padding: 24rpx;
    border-radius: 12rpx;
    background: #f8f9fb;
    color: #8a94a6;
    font-size: 26rpx;
    text-align: center;
  }

  .skill-block {
    margin-bottom: 24rpx;
    padding: 20rpx;
    border: 2rpx solid #eef0f5;
    border-radius: 14rpx;
    background: #fafbfc;
  }

  .skill-head-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;
  }

  .skill-index {
    color: #2563eb;
    font-size: 28rpx;
    font-weight: 800;
  }

  .skill-type-label {
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
    background: #dbeafe;
    color: #2563eb;
    font-size: 22rpx;
    font-weight: 700;
  }

  .coefficient-section {
    margin-top: 12rpx;
    padding-top: 12rpx;
    border-top: 1rpx solid #e8ebf2;
  }

  .coefficient-title {
    display: block;
    margin-bottom: 12rpx;
    color: #344054;
    font-size: 26rpx;
    font-weight: 700;
  }

  .coefficient-item {
    margin-bottom: 12rpx;
  }

  .action-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20rpx 32rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  }

  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 16rpx;
    background: linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
    letter-spacing: 4rpx;
  }

  .submit-btn[disabled] {
    opacity: 0.6;
  }
</style>
