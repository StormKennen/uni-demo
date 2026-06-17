<template>
  <view class="edit-page">
    <view v-if="loading" class="state-block">
      <text>加载数据中...</text>
    </view>

    <view v-else-if="errorMessage" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="retry-btn" @click="loadDetail">重试</button>
    </view>

    <view v-else class="content">
      <view class="section">
        <text class="section-title">基本信息</text>
        <view class="field">
          <text class="field-label">名称</text>
          <input v-model="form.name" class="field-input" placeholder="角色名称" />
        </view>
        <view class="field">
          <text class="field-label">别名</text>
          <input v-model="aliasesText" class="field-input" placeholder="多个别名用逗号分隔" />
        </view>
        <view class="field">
          <text class="field-label">描述</text>
          <textarea v-model="form.description" class="field-textarea" placeholder="角色描述" :maxlength="500" />
        </view>
        <view class="field">
          <text class="field-label">头像 URL</text>
          <input v-model="form.avatar" class="field-input" placeholder="头像图片地址" />
        </view>
        <view class="field">
          <text class="field-label">等级</text>
          <input v-model="form.level" class="field-input" placeholder="等级" />
        </view>
        <view class="field">
          <text class="field-label">排序权重</text>
          <input v-model="sortOrderText" class="field-input" type="number" placeholder="排序权重（数字）" />
        </view>
      </view>

      <view class="section">
        <text class="section-title">分类</text>
        <view v-for="(value, key) in form.categories" :key="key" class="field">
          <text class="field-label">{{ categoryLabels[key] || key }}</text>
          <input v-model="form.categories[key]" class="field-input" :placeholder="'选项 key 或名称'" />
        </view>
      </view>

      <view class="section">
        <text class="section-title">属性</text>
        <view v-for="(value, key) in form.attributes" :key="key" class="field">
          <text class="field-label">{{ attributeLabels[key] || key }}</text>
          <input v-model="form.attributes[key]" class="field-input" type="digit" :placeholder="key" />
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">技能</text>
        </view>
        <view v-for="(skill, index) in form.skills" :key="index" class="skill-block">
          <view class="skill-head-row">
            <text class="skill-index">#{{ index + 1 }}</text>
            <text v-if="skill.type" class="skill-type-label">{{ skill.type }}</text>
          </view>
          <view class="field">
            <text class="field-label">名称</text>
            <input v-model="skill.name" class="field-input" placeholder="技能名称" />
          </view>
          <view class="field">
            <text class="field-label">类型</text>
            <input v-model="skill.type" class="field-input" placeholder="active / passive / leader" />
          </view>
          <view class="field">
            <text class="field-label">描述</text>
            <textarea v-model="skill.description" class="field-textarea" placeholder="技能描述" :maxlength="1000" />
          </view>
          <view class="field-row">
            <view class="field half">
              <text class="field-label">消耗</text>
              <input v-model="skill.cost" class="field-input" placeholder="消耗" />
            </view>
            <view class="field half">
              <text class="field-label">冷却</text>
              <input v-model="skill.cooldown" class="field-input" placeholder="冷却" />
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">国际化 (English)</text>
        </view>
        <view class="field">
          <text class="field-label">Name (EN)</text>
          <input v-model="form.i18nEn.name" class="field-input" placeholder="English name" />
        </view>
        <view class="field">
          <text class="field-label">Description (EN)</text>
          <textarea v-model="form.i18nEn.description" class="field-textarea" placeholder="English description" :maxlength="500" />
        </view>
        <view v-for="(skill, index) in form.skills" :key="'i18n-skill-' + index" class="skill-i18n-block">
          <text class="skill-i18n-label">技能 #{{ index + 1 }} - {{ skill.name || '未命名' }}</text>
          <view class="field">
            <text class="field-label">Name (EN)</text>
            <input v-model="form.i18nEnSkills[skill.id || String(index)].name" class="field-input" placeholder="Skill English name" />
          </view>
          <view class="field">
            <text class="field-label">Description (EN)</text>
            <textarea
              v-model="form.i18nEnSkills[skill.id || String(index)].description"
              class="field-textarea"
              placeholder="Skill English description"
              :maxlength="1000" />
          </view>
        </view>
      </view>

      <view class="action-bar">
        <button class="submit-btn" :loading="submitting" :disabled="submitting" @click="handleSubmit">保存修改</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { getCompendiumsCharacter } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type { getCompendiumsCharacterQuery } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'
  import { patchAdminCompendiumsCharacters } from '@/services/apifox/NODEJSDEMO/COMPENDIUMADMIN/apifox'
  import type { patchAdminCompendiumsCharactersBody } from '@/services/apifox/NODEJSDEMO/COMPENDIUMADMIN/interface'

  const COMPENDIUM_CODE = 'swc'

  interface SkillForm {
    id: string
    name: string
    type: string
    description: string
    cost: string
    cooldown: string
    attachment: string
    sortOrder: number
  }

  interface I18nSkillField {
    name: string
    description: string
  }

  const loading = ref(false)
  const submitting = ref(false)
  const errorMessage = ref('')
  const paramCharacterId = ref('')
  const paramName = ref('')

  const form = reactive({
    name: '',
    aliases: [] as string[],
    description: '',
    avatar: '',
    level: '',
    sortOrder: 0,
    categories: {} as Record<string, string>,
    attributes: {} as Record<string, string>,
    skills: [] as SkillForm[],
    i18nEn: { name: '', description: '' },
    i18nEnSkills: {} as Record<string, I18nSkillField>,
  })

  const categoryLabels: Record<string, string> = {
    element: '属性',
    archetype: '类型',
    family: '物种',
    awaken: '觉醒',
  }

  const attributeLabels: Record<string, string> = {
    stars: '星级',
    hp: '体力',
    attack: '攻击力',
    defense: '防御力',
    speed: '速度',
    critRate: '暴击率',
    critDmg: '暴击伤害',
    accuracy: '效果命中',
    resistance: '效果抵抗',
  }

  const aliasesText = computed({
    get: () => form.aliases.join(', '),
    set: (value: string) => {
      form.aliases = value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    },
  })

  const sortOrderText = computed({
    get: () => String(form.sortOrder || ''),
    set: (value: string) => {
      form.sortOrder = Number(value) || 0
    },
  })

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const extractData = (res: unknown): Record<string, unknown> => {
    if (isRecord(res) && isRecord(res.data)) return res.data as Record<string, unknown>
    if (isRecord(res)) return res
    return {}
  }

  const loadDetail = async () => {
    if (!paramCharacterId.value) {
      errorMessage.value = '缺少角色 ID'
      return
    }
    loading.value = true
    errorMessage.value = ''

    try {
      const query: getCompendiumsCharacterQuery = {
        compendiumId: COMPENDIUM_CODE,
        characterId: paramCharacterId.value,
      }
      const rawRes = await getCompendiumsCharacter(query)
      const data = extractData(rawRes)

      form.name = String(data.name || paramName.value || '')
      form.aliases = Array.isArray(data.aliases) ? data.aliases.filter((a: unknown) => typeof a === 'string') : []
      form.description = String(data.description || '')
      form.avatar = String(data.avatar || '')
      form.level = String(data.level || '')
      form.sortOrder = Number(data.sortOrder) || 0

      const categories = Array.isArray(data.categories) ? data.categories : []
      const catMap: Record<string, string> = {}
      for (const cat of categories) {
        if (isRecord(cat) && cat.key) {
          catMap[String(cat.key)] = String(cat.valueKey || cat.value || '')
        }
      }
      form.categories = catMap

      const attributes = Array.isArray(data.attributes) ? data.attributes : []
      const attrMap: Record<string, string> = {}
      for (const attr of attributes) {
        if (isRecord(attr) && attr.key) {
          attrMap[String(attr.key)] = String(attr.value ?? attr.displayValue ?? '')
        }
      }
      form.attributes = attrMap

      const skills = Array.isArray(data.skills) ? data.skills : []
      form.skills = skills.map((skill: unknown, index: number) => {
        const s = isRecord(skill) ? skill : {}
        const skillId = String(s.id || '')
        const skillForm: SkillForm = {
          id: skillId,
          name: String(s.name || ''),
          type: String(s.type || ''),
          description: String(s.description || ''),
          cost: String(s.cost || ''),
          cooldown: String(s.cooldown || ''),
          attachment: String(s.attachment || ''),
          sortOrder: Number(s.sortOrder) || index,
        }
        form.i18nEnSkills[skillId || String(index)] = { name: '', description: '' }
        return skillForm
      })

      // 预填 i18n（如果后端返回有 i18n 数据）
      if (isRecord(data.i18n) && isRecord(data.i18n.en)) {
        const en = data.i18n.en as Record<string, unknown>
        form.i18nEn.name = String(en.name || '')
        form.i18nEn.description = String(en.description || '')
        if (isRecord(en.skills)) {
          const enSkills = en.skills as Record<string, Record<string, unknown>>
          for (const [key, val] of Object.entries(enSkills)) {
            if (form.i18nEnSkills[key]) {
              form.i18nEnSkills[key].name = String(val?.name || '')
              form.i18nEnSkills[key].description = String(val?.description || '')
            }
          }
        }
      }

      uni.setNavigationBarTitle({ title: `编辑 - ${form.name || '角色'}` })
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    if (!paramCharacterId.value) return
    submitting.value = true

    try {
      const body: patchAdminCompendiumsCharactersBody = {
        compendiumId: COMPENDIUM_CODE,
        characterId: paramCharacterId.value,
        name: form.name || undefined,
        aliases: form.aliases.length ? form.aliases : undefined,
        description: form.description || undefined,
        avatar: form.avatar || undefined,
        level: form.level || undefined,
        sortOrder: form.sortOrder || undefined,
      }

      if (Object.keys(form.categories).length) {
        body.categories = { ...form.categories }
      }

      if (Object.keys(form.attributes).length) {
        const attrs: Record<string, number | string> = {}
        for (const [key, value] of Object.entries(form.attributes)) {
          const num = Number(value)
          attrs[key] = Number.isNaN(num) ? value : num
        }
        body.attributes = attrs
      }

      if (form.skills.length) {
        body.skills = form.skills.map(skill => ({
          id: skill.id || undefined,
          name: skill.name || undefined,
          type: skill.type || undefined,
          description: skill.description || undefined,
          cost: skill.cost || undefined,
          cooldown: skill.cooldown || undefined,
          attachment: skill.attachment || undefined,
          sortOrder: skill.sortOrder,
        }))
      }

      const hasI18n = form.i18nEn.name || form.i18nEn.description || Object.values(form.i18nEnSkills).some(s => s.name || s.description)
      if (hasI18n) {
        const skillsI18n: Record<string, { name?: string; description?: string }> = {}
        for (const [key, val] of Object.entries(form.i18nEnSkills)) {
          if (val.name || val.description) {
            skillsI18n[key] = {
              name: val.name || undefined,
              description: val.description || undefined,
            }
          }
        }
        body.i18n = {
          en: {
            name: form.i18nEn.name || undefined,
            description: form.i18nEn.description || undefined,
            skills: Object.keys(skillsI18n).length ? skillsI18n : undefined,
          },
        }
      }

      await patchAdminCompendiumsCharacters(body)
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 800)
    } catch (error) {
      const message = typeof error === 'string' ? error : '保存失败，请稍后重试'
      uni.showToast({ title: message, icon: 'none' })
    } finally {
      submitting.value = false
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    paramCharacterId.value = options.characterId || ''
    paramName.value = decodeURIComponent(options.name || '')
    uni.setNavigationBarTitle({ title: `编辑 - ${paramName.value || '角色'}` })
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
    padding: 20rpx 24rpx;
  }

  .section {
    margin-bottom: 28rpx;
    padding: 24rpx;
    border-radius: 16rpx;
    background: #fff;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8rpx;
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
    margin-bottom: 6rpx;
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
    min-height: 140rpx;
    padding: 16rpx 20rpx;
    border: 2rpx solid #e7ebf2;
    border-radius: 12rpx;
    background: #fafbfc;
    color: #121a26;
    font-size: 28rpx;
    line-height: 1.6;
    box-sizing: border-box;
  }

  .field-row {
    display: flex;
    gap: 16rpx;
  }

  .field.half {
    flex: 1;
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
    color: #667eea;
    font-size: 28rpx;
    font-weight: 800;
  }

  .skill-type-label {
    padding: 4rpx 14rpx;
    border-radius: 8rpx;
    background: #eef2ff;
    color: #667eea;
    font-size: 22rpx;
    font-weight: 700;
  }

  .skill-i18n-block {
    margin-bottom: 20rpx;
    padding: 16rpx;
    border: 2rpx dashed #d4d9e2;
    border-radius: 12rpx;
    background: #f8f9fb;
  }

  .skill-i18n-label {
    display: block;
    margin-bottom: 12rpx;
    color: #465164;
    font-size: 26rpx;
    font-weight: 700;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
    letter-spacing: 4rpx;
  }

  .submit-btn[disabled] {
    opacity: 0.6;
  }
</style>
