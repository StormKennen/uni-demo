<template>
  <PageLayout title="符文智能评分" :nav-back="true" nav-init-bg-color="var(--theme-surface)" nav-divider>
    <view class="rune-page">
      <view class="intro-card">
        <view class="intro-topline">
          <view class="intro-mark"><uni-icons type="camera" size="20" color="var(--theme-brand)" /></view>
          <text class="eyebrow">SWC · RUNE LAB</text>
        </view>
        <text class="page-title">看懂这颗符文，<text class="title-accent">再决定怎么养</text></text>
        <text class="page-subtitle">识图只提取属性；评分和魔灵推荐由规则与现有数据计算。</text>
      </view>

      <view class="section-card upload-card">
        <view class="section-heading">
          <view>
            <text class="section-kicker">01 / SCREENSHOT</text>
            <text class="section-title">上传符文截图</text>
          </view>
          <text class="privacy-chip">识图需上传</text>
        </view>
        <view v-if="imagePath" class="image-preview">
          <image class="rune-image" :src="imagePath" mode="aspectFit" />
          <view class="image-actions">
            <text class="image-note">原图会发送至识别服务；请勿上传含隐私内容的截图。</text>
            <text class="link-action" @click="removeImage">移除</text>
          </view>
        </view>
        <view v-else class="upload-placeholder" @click="chooseImage">
          <view class="upload-icon"><uni-icons type="plusempty" size="24" color="var(--theme-brand)" /></view>
          <text class="upload-title">选择截图或拍照</text>
          <text class="upload-hint">单张 JPEG / PNG，最大 8 MB</text>
        </view>
        <button class="secondary-button" :disabled="recognitionLoading" @click="chooseImage">
          {{ imagePath ? '更换截图 / 重新识别' : '从相册选取或拍照' }}
        </button>
        <view v-if="recognitionLoading" class="status-line status-line--loading">
          <view class="loading-dot" />
          <text>正在识别符文属性，请稍候…</text>
          <text class="cancel-action" @click="cancelRecognition">取消</text>
        </view>
        <view v-if="recognitionMessage" class="status-message" :class="{ 'status-message--warning': recognitionFailed }">
          <text>{{ recognitionMessage }}</text>
        </view>
      </view>

      <view class="section-card rune-form">
        <view class="section-heading">
          <view>
            <text class="section-kicker">02 / VERIFY</text>
            <text class="section-title">核对符文数据</text>
          </view>
          <text class="source-chip">{{ rune.source === 'image' ? '识图草稿，可修改' : '手动录入' }}</text>
        </view>
        <text class="helper-copy">识别不到的字段保持未知，不会按 0 参与计算。带「待确认」的内容请先核实。</text>
        <view class="field-grid">
          <view class="field-block field-block--wide">
            <text class="field-label">符文套装</text>
            <picker :range="setOptions" range-key="name" @change="onSetChange">
              <view class="picker-value"
                >{{ currentSetLabel }}<uni-icons type="bottom" size="14" color="var(--theme-text-tertiary)"
              /></view>
            </picker>
          </view>
          <view class="field-block">
            <text class="field-label">位置</text>
            <picker :range="slotOptions" @change="onSlotChange">
              <view class="picker-value"
                >{{ rune.slot ? `${rune.slot} 号位` : '未知' }}<uni-icons type="bottom" size="14" color="var(--theme-text-tertiary)"
              /></view>
            </picker>
          </view>
          <view class="field-block">
            <text class="field-label">星级</text>
            <picker :range="starOptions" @change="onStarsChange">
              <view class="picker-value"
                >{{ rune.stars ? `${rune.stars} 星` : '未知' }}<uni-icons type="bottom" size="14" color="var(--theme-text-tertiary)"
              /></view>
            </picker>
          </view>
          <view class="field-block">
            <text class="field-label">品质</text>
            <picker :range="gradeOptions" @change="onGradeChange">
              <view class="picker-value"
                >{{ rune.grade ? gradeLabel(rune.grade) : '未知' }}<uni-icons type="bottom" size="14" color="var(--theme-text-tertiary)"
              /></view>
            </picker>
          </view>
          <view class="field-block">
            <text class="field-label">强化等级</text>
            <picker :range="levelOptions" @change="onLevelChange">
              <view class="picker-value"
                >{{ rune.level == null ? '未知' : `+${rune.level}` }}<uni-icons type="bottom" size="14" color="var(--theme-text-tertiary)"
              /></view>
            </picker>
          </view>
          <view class="field-block field-block--wide">
            <text class="field-label">主属性</text>
            <view class="property-row">
              <picker :range="statOptions" :value="statPickerIndex(rune.mainStat?.stat || null)" @change="onMainStatChange">
                <view class="picker-value property-stat"
                  >{{ formatStatLabel(rune.mainStat?.stat || null) }}<uni-icons type="bottom" size="14" color="var(--theme-text-tertiary)"
                /></view>
              </picker>
              <input
                class="number-input"
                type="digit"
                :value="numberText(rune.mainStat?.value)"
                placeholder="数值未知"
                @input="onMainValueInput" />
            </view>
          </view>
          <view class="field-block field-block--wide">
            <text class="field-label">固有属性 <text class="optional-label">选填</text></text>
            <view class="property-row">
              <picker :range="statOptions" :value="statPickerIndex(rune.innateStat?.stat || null)" @change="onInnateStatChange">
                <view class="picker-value property-stat"
                  >{{ formatStatLabel(rune.innateStat?.stat || null)
                  }}<uni-icons type="bottom" size="14" color="var(--theme-text-tertiary)"
                /></view>
              </picker>
              <input
                class="number-input"
                type="digit"
                :value="numberText(rune.innateStat?.value)"
                placeholder="数值未知"
                @input="onInnateValueInput" />
            </view>
          </view>
        </view>
        <view class="substat-head">
          <view
            ><text class="section-title section-title--small">副属性</text><text class="substat-hint">固定值与百分比会分开计分</text></view
          >
          <text class="count-chip">最多 4 条</text>
        </view>
        <view v-for="(item, index) in rune.subStats" :key="index" class="substat-row">
          <text class="substat-index">0{{ index + 1 }}</text>
          <picker :range="statOptions" :value="statPickerIndex(item.stat)" @change="onSubStatChange(index, $event)">
            <view class="picker-value substat-picker"
              >{{ formatStatLabel(item.stat) }}<uni-icons type="bottom" size="12" color="var(--theme-text-tertiary)"
            /></view>
          </picker>
          <input
            class="number-input substat-value"
            type="digit"
            :value="numberText(item.value)"
            placeholder="未知"
            @input="onSubValueInput(index, $event)" />
          <text class="percent-mark">{{ isPercentStat(item.stat) ? '%' : '' }}</text>
        </view>
        <view class="toggle-row">
          <view class="toggle-copy"><text class="field-label">远古符文</text><text class="helper-copy">无法确认时保持未知</text></view>
          <view class="toggle-actions">
            <text :class="['toggle-option', { selected: rune.ancient === false }]" @click="setAncient(false)">否</text>
            <text :class="['toggle-option', { selected: rune.ancient === true }]" @click="setAncient(true)">是</text>
            <text :class="['toggle-option', { selected: rune.ancient === null }]" @click="setAncient(null)">未知</text>
          </view>
        </view>
        <view v-if="pendingFields.length" class="pending-hint">
          <uni-icons type="info" size="15" color="var(--theme-warning, #b7791f)" />
          <text>待确认：{{ pendingFieldsLabel }}</text>
        </view>
      </view>

      <view class="section-card settings-card">
        <view class="section-heading">
          <view><text class="section-kicker">03 / CONTEXT</text><text class="section-title">按你的阶段评估</text></view>
        </view>
        <text class="field-label">使用场景</text>
        <view class="choice-list">
          <text
            v-for="item in contextOptions"
            :key="item.key"
            :class="['choice-chip', { selected: context === item.key }]"
            @click="selectContext(item.key)"
            >{{ item.label }}</text
          >
        </view>
        <text class="field-label stage-label">玩家发展阶段</text>
        <view class="choice-list">
          <text
            v-for="item in stageOptions"
            :key="item.key"
            :class="['choice-chip', { selected: playerStage === item.key }]"
            @click="selectStage(item.key)"
            >{{ item.label }}</text
          >
        </view>
        <button class="primary-button" :disabled="evaluationLoading || recognitionLoading" @click="runEvaluation">
          <text v-if="evaluationLoading">正在计算…</text><text v-else>确认属性并开始评分</text>
          <uni-icons v-if="!evaluationLoading" type="arrow-right" size="17" color="#ffffff" />
        </button>
        <text class="offline-note">评分不调用 AI；调整场景或阶段可重新计算。</text>
        <view v-if="evaluationError" class="status-message status-message--warning"
          ><text>{{ evaluationError }}</text></view
        >
      </view>

      <view v-if="evaluation" class="results-section">
        <view class="results-title-row"
          ><view><text class="section-kicker">04 / RESULTS</text><text class="section-title">评分与建议</text></view
          ><text class="version-chip">规则 {{ evaluation.ruleVersion }}</text></view
        >
        <view class="result-card quality-card">
          <view class="result-card-heading"
            ><view><text class="result-kicker">RUNE QUALITY</text><text class="result-title">符文本身的品质</text></view
            ><view class="score-badge"
              ><text class="score-number">{{ evaluation.quality.qualityScore }}</text
              ><text class="score-unit">/ 100</text></view
            ></view
          >
          <text class="quality-grade">{{ qualityGradeLabel(evaluation.quality.qualityGrade) }} · 本项目参考分，不是游戏官方评分</text>
          <view class="efficiency-row"
            ><view
              ><text class="metric-label">传统 Efficiency</text
              ><text class="metric-value">{{ efficiencyText(evaluation.quality.efficiencyPercent) }}</text></view
            ><view
              ><text class="metric-label">效率上限估计</text
              ><text class="metric-value">{{ efficiencyText(evaluation.quality.efficiencyMaxPercent) }}</text></view
            ><view
              ><text class="metric-label">精炼后估计</text
              ><text class="metric-value">{{ efficiencyText(evaluation.quality.refinedEfficiencyPercent) }}</text></view
            ></view
          >
          <view class="potential-line"
            ><text>当前潜力 {{ evaluation.quality.currentPotential }}</text
            ><text>发展区间 {{ evaluation.quality.maxPotentialRange.min }}–{{ evaluation.quality.maxPotentialRange.max }}</text></view
          >
          <view v-for="item in evaluation.quality.scoreBreakdown" :key="item.key" class="breakdown-row"
            ><view class="breakdown-copy"
              ><text class="breakdown-label">{{ item.label }}</text
              ><text class="breakdown-explanation">{{ item.explanation }}</text></view
            ><text class="breakdown-score">+{{ item.score }}</text></view
          >
          <view v-for="warning in evaluation.quality.warnings" :key="warning" class="warning-line"
            ><uni-icons type="info" size="14" color="var(--theme-warning, #b7791f)" /><text>{{ warning }}</text></view
          >
        </view>
        <view class="result-card">
          <view class="result-card-heading"
            ><view><text class="result-kicker">BUILD FIT</text><text class="result-title">属性方向适配</text></view
            ><text v-if="evaluation.suitability.bestRole" class="best-role">{{ roleLabel(evaluation.suitability.bestRole) }}</text></view
          >
          <view v-for="role in evaluation.suitability.roles" :key="role.key" class="role-row"
            ><view class="role-label-wrap"
              ><text class="role-label">{{ roleLabel(role.key) }}</text
              ><text class="role-score">{{ role.score }}%</text></view
            ><view class="score-track"><view class="score-fill" :style="{ width: `${role.score}%` }" /></view
            ><text v-for="reason in role.reasons" :key="reason" class="reason-text">{{ reason }}</text></view
          >
          <view class="two-column-notes"
            ><view
              ><text class="note-heading">优势</text
              ><text v-for="item in evaluation.suitability.strengths" :key="item" class="note-item">{{ item }}</text></view
            ><view
              ><text class="note-heading">留意</text
              ><text v-for="item in evaluation.suitability.weaknesses" :key="item" class="note-item">{{ item }}</text></view
            ></view
          >
        </view>
        <view class="result-card advice-card"
          ><view class="result-card-heading"
            ><view
              ><text class="result-kicker">NEXT STEP</text
              ><text class="result-title">{{ actionLabel(evaluation.recommendation.action) }}</text></view
            ><text class="stage-badge">{{ stageName }}</text></view
          ><text class="advice-next-step">{{ evaluation.recommendation.nextStep }}</text
          ><text v-for="reason in evaluation.recommendation.reasons" :key="reason" class="reason-bullet">{{ reason }}</text
          ><text v-if="evaluation.recommendation.observeFurther" class="observe-note"
            >建议先观察下一次强化结果，再决定是否继续投入。</text
          ></view
        >
        <view class="result-card monsters-card"
          ><view class="result-card-heading"
            ><view><text class="result-kicker">MONSTER MATCH</text><text class="result-title">可能适用的魔灵</text></view
            ><text class="match-context">{{ currentContextLabel }}</text></view
          ><text v-if="evaluation.recommendationWarning" class="helper-copy">{{ evaluation.recommendationWarning }}</text
          ><view v-if="!evaluation.monsters.length" class="empty-monsters">当前没有足够的推荐装备数据，不会强行补齐候选。</view
          ><view
            v-for="monster in evaluation.monsters"
            :key="monster.characterId"
            class="monster-row"
            @click="openCharacter(monster.characterId)"
            ><image v-if="monster.avatar" class="monster-avatar" :src="monster.avatar" mode="aspectFill" /><view
              v-else
              class="monster-avatar monster-avatar--empty"
              ><uni-icons type="person" size="20" color="var(--theme-text-tertiary)" /></view
            ><view class="monster-main"
              ><view class="monster-name-line"
                ><text class="monster-name">{{ monster.name }}</text
                ><text class="element-tag">{{ monster.element || '属性未知' }}</text></view
              ><text class="monster-evidence">{{ monster.matchedReasons.join(' · ') }}</text
              ><text class="data-source"
                >{{ monster.dataSource }} · {{ monster.dataQuality || '可信度未标注' }} · {{ monster.context.toUpperCase() }}</text
              ><text v-for="warning in monster.warnings" :key="warning" class="monster-warning">{{ warning }}</text></view
            ><view class="match-score"
              ><text>{{ monster.matchScore }}</text
              ><text class="match-suffix">匹配</text></view
            ></view
          ></view
        >
      </view>
      <view class="page-footnote"><text>结果仅作整理与培养参考；符文规则和社区统计可能随版本变化。</text></view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import type { RuneRecognitionResult } from './api'
  import { evaluateRune, recognizeRuneImage, getRuneScoreMetadata, normalizeRuneRecognitionErrorCode } from './api'
  import {
    actionLabel,
    createEmptyRune,
    errorLabel,
    formatStatLabel,
    gradeLabel,
    roleLabel,
    RUNE_CONTEXT_OPTIONS,
    RUNE_GRADE_OPTIONS,
    RUNE_SET_LABELS,
    RUNE_STAT_OPTIONS,
    PLAYER_STAGE_OPTIONS,
    type ApiFailure,
    type PlayerStage,
    type RuneContext,
    type RuneData,
    type RuneEvaluationResult,
    type RuneScoreEvaluationRequest,
    type RuneProperty,
    type RuneScoreMetadata,
    type RuneStat,
  } from './types'

  const rune = ref<RuneData>(createEmptyRune())
  const metadata = ref<RuneScoreMetadata | null>(null)
  const imagePath = ref('')
  const recognitionLoading = ref(false)
  const recognitionCancelled = ref(false)
  const evaluationLoading = ref(false)
  let evaluationRequestId = 0
  let recognitionRequestId = 0
  let runeRevision = 0
  let activeUploadTask: { abort: () => void } | null = null
  const recognitionFailed = ref(false)
  const recognitionMessage = ref('')
  const evaluationError = ref('')
  const evaluation = ref<RuneEvaluationResult | null>(null)
  const context = ref<RuneContext>('rta')
  const playerStage = ref<PlayerStage>('mid')
  const slotOptions = ['未知', '1', '2', '3', '4', '5', '6']
  const starOptions = ['未知', '4', '5', '6']
  const levelOptions = ['未知', ...Array.from({ length: 16 }, (_, index) => `+${index}`)]
  const statOptions = ['未识别', ...RUNE_STAT_OPTIONS.map(formatStatLabel)]
  const gradeOptions = ['未识别', ...RUNE_GRADE_OPTIONS.map(gradeLabel)]
  const defaultSets = Object.keys(RUNE_SET_LABELS).map(key => ({ key, name: `${RUNE_SET_LABELS[key]}（${key}）` }))
  const setOptions = computed(() => [{ key: '', name: '未识别' }, ...(metadata.value?.sets?.length ? metadata.value.sets : defaultSets)])
  const contextOptions = RUNE_CONTEXT_OPTIONS
  const stageOptions = PLAYER_STAGE_OPTIONS
  const currentSetLabel = computed(() => setOptions.value.find(item => item.key === rune.value.setKey)?.name || '未识别')
  const pendingFields = computed(() => rune.value.recognition.pendingFields || [])
  const pendingFieldsLabel = computed(() =>
    pendingFields.value
      .map(
        field =>
          ({
            setKey: '套装',
            slot: '位置',
            stars: '星级',
            grade: '品质',
            ancient: '远古状态',
            level: '强化等级',
            mainStat: '主属性',
            subStats: '副属性',
          })[field] || field,
      )
      .join('、'),
  )
  const currentContextLabel = computed(() => contextOptions.find(item => item.key === context.value)?.label || '综合')
  const stageName = computed(() => stageOptions.find(item => item.key === playerStage.value)?.label || '中期')
  type RuneValueEvent = { detail: { value: string } }
  const selectedStat = (event: RuneValueEvent): RuneStat | null => RUNE_STAT_OPTIONS[Number(event.detail.value || 0) - 1] || null
  const statPickerIndex = (stat: RuneStat | null): number => (stat ? RUNE_STAT_OPTIONS.indexOf(stat) + 1 : 0)

  const numberText = (value: number | null | undefined): string =>
    typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
  const isPercentStat = (stat: string | null): boolean =>
    Boolean(stat && stat.endsWith('%')) || stat === 'CR' || stat === 'CD' || stat === 'ACC' || stat === 'RES'
  const efficiencyText = (value: number | null): string => (typeof value === 'number' ? `${value.toFixed(1)}%` : '暂不可计算')
  const qualityGradeLabel = (value: string): string =>
    (({ high: '高潜力', promising: '潜力较好', moderate: '中等', developing: '待观察' }) as Record<string, string>)[value] || value

  function readInput(event: RuneValueEvent): number | null {
    const value = event.detail.value.trim() || ''
    if (!value) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  function invalidateEvaluation() {
    evaluationRequestId += 1
    evaluationLoading.value = false
    evaluation.value = null
    evaluationError.value = ''
  }

  function markChanged() {
    runeRevision += 1
    invalidateEvaluation()
    rune.value.source = 'manual'
    const pendingFields: string[] = []
    const fieldStatus: RuneData['recognition']['fieldStatus'] = {}
    const requiredValues: Array<[string, boolean]> = [
      ['setKey', rune.value.setKey !== null],
      ['slot', rune.value.slot !== null],
      ['stars', rune.value.stars !== null],
      ['grade', rune.value.grade !== null],
      ['ancient', rune.value.ancient !== null],
      ['level', rune.value.level !== null],
      ['mainStat', Boolean(rune.value.mainStat?.stat) && rune.value.mainStat?.value !== null],
      [
        'subStats',
        rune.value.subStats.length === 4 &&
          rune.value.subStats.every(item => item.stat && item.value !== null && !item.unknown && !item.ambiguous),
      ],
    ]
    requiredValues.forEach(([field, complete]) => {
      fieldStatus[field] = complete ? 'recognized' : 'unknown'
      if (!complete) pendingFields.push(field)
    })
    rune.value.recognition = { ...rune.value.recognition, status: 'manual', fieldStatus, pendingFields }
  }

  function setAncient(value: boolean | null) {
    rune.value.ancient = value
    markChanged()
  }

  function selectContext(value: RuneContext) {
    if (context.value === value) return
    context.value = value
    invalidateEvaluation()
  }

  function selectStage(value: PlayerStage) {
    if (playerStage.value === value) return
    playerStage.value = value
    invalidateEvaluation()
  }

  function onSetChange(event: RuneValueEvent) {
    const index = Number(event.detail.value || 0)
    rune.value.setKey = setOptions.value[index]?.key || null
    markChanged()
  }
  function onSlotChange(event: RuneValueEvent) {
    const index = Number(event.detail.value || 0)
    rune.value.slot = index === 0 ? null : index
    markChanged()
  }
  function onStarsChange(event: RuneValueEvent) {
    rune.value.stars = Number(starOptions[Number(event.detail.value || 0)]) || null
    markChanged()
  }
  function onGradeChange(event: RuneValueEvent) {
    const index = Number(event.detail.value || 0) - 1
    rune.value.grade = RUNE_GRADE_OPTIONS[index] || null
    markChanged()
  }
  function onLevelChange(event: RuneValueEvent) {
    const selected = levelOptions[Number(event.detail.value || 0)]
    rune.value.level = selected === '未知' ? null : Number(selected.slice(1))
    markChanged()
  }
  function ensureMainStat(): RuneProperty {
    if (!rune.value.mainStat) rune.value.mainStat = { stat: null, value: null }
    return rune.value.mainStat
  }
  function onMainStatChange(event: RuneValueEvent) {
    ensureMainStat().stat = selectedStat(event)
    markChanged()
  }
  function onMainValueInput(event: RuneValueEvent) {
    ensureMainStat().value = readInput(event)
    markChanged()
  }
  function onInnateStatChange(event: RuneValueEvent) {
    const stat = selectedStat(event)
    rune.value.innateStat = stat
      ? { stat, value: rune.value.innateStat?.value ?? null, refineValue: rune.value.innateStat?.refineValue ?? null }
      : null
    markChanged()
  }
  function onInnateValueInput(event: RuneValueEvent) {
    if (!rune.value.innateStat) rune.value.innateStat = { stat: null, value: null }
    rune.value.innateStat.value = readInput(event)
    markChanged()
  }
  function onSubStatChange(index: number, event: RuneValueEvent) {
    const stat = selectedStat(event)
    const item = rune.value.subStats[index]
    item.stat = stat
    item.unknown = !stat
    item.ambiguous = false
    markChanged()
  }
  function onSubValueInput(index: number, event: RuneValueEvent) {
    rune.value.subStats[index].value = readInput(event)
    rune.value.subStats[index].unknown = false
    markChanged()
  }

  function normalizeDraft(result: RuneRecognitionResult): RuneData {
    const next = result.rune
    const subStats = Array.isArray(next.subStats) ? next.subStats.slice(0, 4) : []
    while (subStats.length < 4) subStats.push({ stat: null, value: null, refineValue: null, gemState: 'unknown', unknown: true })
    return {
      ...createEmptyRune(),
      ...next,
      mainStat: next.mainStat || { stat: null, value: null },
      innateStat: next.innateStat || null,
      subStats,
      source: 'image',
      recognition: next.recognition || {
        status: 'needs_review',
        fieldStatus: result.fieldStatus || {},
        pendingFields: result.pendingFields || [],
        warnings: result.warnings || [],
      },
    }
  }

  async function chooseImage() {
    if (recognitionLoading.value) return
    let requestId: number | null = null
    try {
      const selection = await uni.chooseImage({
        count: 1,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
      })
      const path = selection.tempFilePaths?.[0]
      if (!path) return
      requestId = ++recognitionRequestId
      invalidateEvaluation()
      imagePath.value = path
      rune.value = createEmptyRune()
      runeRevision += 1
      recognitionLoading.value = false
      recognitionCancelled.value = false
      recognitionFailed.value = false
      recognitionMessage.value = ''
      const selectedFile = Array.isArray(selection.tempFiles) ? selection.tempFiles[0] : selection.tempFiles
      const fileSize = selectedFile?.size
      if (typeof fileSize === 'number' && fileSize > 8 * 1024 * 1024) {
        recognitionFailed.value = true
        recognitionMessage.value = '图片超过 8 MB，请压缩后重新选择；也可以直接手动填写。'
        return
      }
      const revisionAtStart = runeRevision
      recognitionLoading.value = true
      const result = await recognizeRuneImage(path, task => {
        activeUploadTask = task
      })
      if (requestId === null || requestId !== recognitionRequestId) return
      if (runeRevision !== revisionAtStart) {
        recognitionMessage.value = '识图已完成；已保留你等待期间的手动修改，请继续核对。'
        return
      }
      invalidateEvaluation()
      rune.value = normalizeDraft(result)
      runeRevision += 1
      recognitionMessage.value = result.warnings?.length ? result.warnings.join('；') : '识别草稿已载入，请逐项核对后再评分。'
    } catch (error) {
      if (requestId === null) return
      const failure = error as ApiFailure
      if (requestId === null || requestId !== recognitionRequestId) return
      if (recognitionCancelled.value) {
        recognitionFailed.value = false
        recognitionMessage.value = imagePath.value ? '已取消识图；可以继续手动填写符文属性。' : ''
        return
      }
      if (failure?.message?.toLowerCase().includes('cancel')) return
      recognitionFailed.value = true
      const recognitionErrorCode = normalizeRuneRecognitionErrorCode(error)
      recognitionMessage.value = failure?.message?.toLowerCase().includes('timeout')
        ? errorLabel('MODEL_TIMEOUT')
        : errorLabel(recognitionErrorCode)
      rune.value = {
        ...rune.value,
        source: 'manual',
        recognition: { ...rune.value.recognition, status: 'failed', warnings: [recognitionMessage.value] },
      }
    } finally {
      if (requestId === recognitionRequestId) {
        recognitionLoading.value = false
        activeUploadTask = null
      }
    }
  }

  function cancelRecognition() {
    recognitionCancelled.value = true
    recognitionRequestId += 1
    recognitionLoading.value = false
    activeUploadTask?.abort()
    activeUploadTask = null
  }

  function removeImage() {
    if (recognitionLoading.value) cancelRecognition()
    invalidateEvaluation()
    imagePath.value = ''
    recognitionMessage.value = ''
    recognitionFailed.value = false
    rune.value = createEmptyRune()
    evaluation.value = null
  }

  async function runEvaluation() {
    if (evaluationLoading.value || recognitionLoading.value) return
    evaluationError.value = ''
    evaluationLoading.value = true
    const requestId = ++evaluationRequestId
    const request: RuneScoreEvaluationRequest = {
      compendiumId: 'swc',
      rune: JSON.parse(JSON.stringify(rune.value)) as RuneData,
      context: context.value,
      playerStage: playerStage.value,
      recommendationLimit: 5,
    }
    try {
      const result = await evaluateRune(request)
      if (requestId === evaluationRequestId) evaluation.value = result
    } catch (error) {
      if (requestId === evaluationRequestId) evaluationError.value = (error as ApiFailure)?.message || '评分失败，请稍后重试。'
    } finally {
      if (requestId === evaluationRequestId) evaluationLoading.value = false
    }
  }

  function openCharacter(characterId: string) {
    if (!characterId) return
    uni.navigateTo({ url: `/subPackages/tools/compendium/swc/detail?characterId=${encodeURIComponent(characterId)}&tab=equipment` })
  }

  onLoad(() => {
    getRuneScoreMetadata()
      .then(result => {
        metadata.value = result
      })
      .catch(() => {
        metadata.value = null
      })
  })

  onShareAppMessage(() => ({ title: '符文智能评分｜魔灵召唤工具', path: '/subPackages/swc-rune-score/index' }))
  onShareTimeline(() => ({ title: '符文智能评分｜魔灵召唤', query: '' }))
</script>

<style scoped lang="scss">
  .rune-page {
    min-height: 100vh;
    padding: 24rpx 24rpx calc(56rpx + env(safe-area-inset-bottom));
    background: var(--theme-bg);
    color: var(--theme-text);
    box-sizing: border-box;
  }
  .intro-card {
    padding: 30rpx 28rpx 28rpx;
    border-radius: 24rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
  }
  .intro-topline,
  .section-heading,
  .result-card-heading,
  .results-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }
  .intro-topline {
    justify-content: flex-start;
    gap: 12rpx;
  }
  .intro-mark {
    width: 54rpx;
    height: 54rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-surface-2);
  }
  .eyebrow,
  .section-kicker,
  .result-kicker {
    display: block;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
    line-height: 1.3;
    font-weight: 800;
    letter-spacing: 1.5rpx;
  }
  .page-title {
    display: block;
    margin-top: 22rpx;
    font-size: 40rpx;
    line-height: 1.25;
    font-weight: 800;
  }
  .title-accent {
    color: var(--theme-brand);
  }
  .page-subtitle,
  .helper-copy {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.55;
  }
  .section-card,
  .result-card {
    margin-top: 18rpx;
    padding: 24rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: var(--theme-surface);
  }
  .section-heading {
    margin-bottom: 18rpx;
  }
  .section-title,
  .result-title {
    display: block;
    margin-top: 7rpx;
    font-size: 29rpx;
    line-height: 1.35;
    font-weight: 800;
  }
  .section-title--small {
    display: inline-block;
    margin: 0;
    font-size: 26rpx;
  }
  .privacy-chip,
  .source-chip,
  .count-chip,
  .version-chip,
  .match-context,
  .stage-badge {
    flex: none;
    padding: 8rpx 12rpx;
    border-radius: 999rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-2);
    font-size: 19rpx;
    font-weight: 700;
  }
  .upload-placeholder {
    min-height: 260rpx;
    border: 2rpx dashed var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .upload-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 22rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-surface);
  }
  .upload-title {
    margin-top: 14rpx;
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 750;
  }
  .upload-hint,
  .image-note,
  .offline-note {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    line-height: 1.45;
  }
  .image-preview {
    padding: 12rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
  }
  .rune-image {
    display: block;
    width: 100%;
    height: 360rpx;
  }
  .image-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14rpx;
    padding: 0 8rpx;
  }
  .link-action {
    min-height: 56rpx;
    display: flex;
    align-items: center;
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 750;
  }
  .secondary-button,
  .primary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    min-height: 84rpx;
    margin: 18rpx 0 0;
    padding: 0 24rpx;
    border-radius: 14rpx;
    font-size: 25rpx;
    line-height: 1.3;
    font-weight: 800;
  }
  .secondary-button {
    color: var(--theme-brand);
    background: var(--theme-surface-2);
  }
  .primary-button {
    color: #fff;
    background: var(--theme-brand);
  }
  .secondary-button::after,
  .primary-button::after {
    border: 0;
  }
  button[disabled] {
    opacity: 0.55;
  }
  .status-line {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-top: 14rpx;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }
  .loading-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: var(--theme-brand);
  }
  .cancel-action {
    min-width: 72rpx;
    min-height: 52rpx;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-brand);
    font-size: 21rpx;
    font-weight: 750;
  }
  .status-message {
    margin-top: 14rpx;
    padding: 14rpx 16rpx;
    border-radius: 12rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-2);
    font-size: 21rpx;
    line-height: 1.5;
  }
  .status-message--warning,
  .warning-line,
  .monster-warning {
    color: var(--theme-warning, #8a5a00);
  }
  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
    margin-top: 20rpx;
  }
  .field-block {
    min-width: 0;
  }
  .field-block--wide {
    grid-column: 1 / -1;
  }
  .field-label {
    display: block;
    margin-bottom: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    font-weight: 750;
  }
  .optional-label {
    margin-left: 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    font-weight: 500;
  }
  .picker-value,
  .number-input {
    box-sizing: border-box;
    min-height: 72rpx;
    padding: 0 16rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
    color: var(--theme-text);
    background: var(--theme-surface-2);
    font-size: 22rpx;
  }
  .picker-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8rpx;
  }
  .property-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(150rpx, 0.65fr);
    gap: 10rpx;
  }
  .number-input {
    width: 100%;
    padding-top: 0;
    padding-bottom: 0;
  }
  .number-input::placeholder {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }
  .substat-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12rpx;
    margin-top: 26rpx;
  }
  .substat-hint {
    display: block;
    margin-top: 4rpx;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }
  .substat-row {
    display: grid;
    grid-template-columns: 42rpx minmax(0, 1fr) minmax(110rpx, 0.55fr) 18rpx;
    align-items: center;
    gap: 8rpx;
    margin-top: 10rpx;
  }
  .substat-index {
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
    font-weight: 800;
  }
  .substat-picker {
    min-height: 68rpx;
    padding: 0 12rpx;
    font-size: 20rpx;
  }
  .substat-value {
    min-height: 68rpx;
    padding: 0 10rpx;
    font-size: 21rpx;
    text-align: right;
  }
  .percent-mark {
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    margin-top: 22rpx;
    padding-top: 18rpx;
    border-top: 1rpx solid var(--theme-border);
  }
  .toggle-copy .helper-copy {
    margin-top: 2rpx;
    font-size: 19rpx;
  }
  .toggle-actions {
    display: flex;
    gap: 6rpx;
    padding: 5rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
  }
  .toggle-option {
    min-width: 52rpx;
    min-height: 48rpx;
    padding: 0 10rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-secondary);
    font-size: 19rpx;
  }
  .toggle-option.selected {
    color: #fff;
    background: var(--theme-brand);
  }
  .pending-hint {
    display: flex;
    align-items: flex-start;
    gap: 8rpx;
    margin-top: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    line-height: 1.45;
  }
  .choice-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }
  .choice-chip {
    min-height: 60rpx;
    padding: 0 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-2);
    font-size: 21rpx;
  }
  .choice-chip.selected {
    border-color: var(--theme-brand);
    color: var(--theme-brand);
    background: var(--theme-surface);
    font-weight: 800;
  }
  .stage-label {
    margin-top: 22rpx;
  }
  .offline-note {
    text-align: center;
  }
  .results-title-row {
    margin: 28rpx 4rpx 6rpx;
  }
  .results-title-row .section-title {
    font-size: 31rpx;
  }
  .quality-card {
    border-top: 4rpx solid var(--theme-brand);
  }
  .result-kicker {
    font-size: 18rpx;
  }
  .result-title {
    font-size: 27rpx;
  }
  .score-badge {
    display: flex;
    align-items: baseline;
    gap: 4rpx;
    color: var(--theme-brand);
  }
  .score-number {
    font-size: 52rpx;
    line-height: 1;
    font-weight: 900;
  }
  .score-unit {
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }
  .quality-grade {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }
  .efficiency-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8rpx;
    margin-top: 20rpx;
    padding: 16rpx 10rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
  }
  .efficiency-row > view {
    min-width: 0;
    text-align: center;
  }
  .metric-label,
  .metric-value {
    display: block;
  }
  .metric-label {
    color: var(--theme-text-tertiary);
    font-size: 17rpx;
    line-height: 1.35;
  }
  .metric-value {
    margin-top: 6rpx;
    color: var(--theme-text);
    font-size: 22rpx;
    line-height: 1.3;
    font-weight: 800;
  }
  .potential-line {
    display: flex;
    justify-content: space-between;
    gap: 12rpx;
    margin-top: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }
  .breakdown-row {
    display: flex;
    justify-content: space-between;
    gap: 14rpx;
    padding: 14rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }
  .breakdown-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }
  .breakdown-label {
    color: var(--theme-text);
    font-size: 21rpx;
    font-weight: 750;
  }
  .breakdown-explanation {
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    line-height: 1.4;
  }
  .breakdown-score {
    flex: none;
    color: var(--theme-brand);
    font-size: 21rpx;
    font-weight: 800;
  }
  .warning-line {
    display: flex;
    gap: 8rpx;
    margin-top: 12rpx;
    font-size: 19rpx;
    line-height: 1.45;
  }
  .best-role {
    flex: none;
    padding: 9rpx 14rpx;
    border-radius: 999rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-2);
    font-size: 20rpx;
    font-weight: 800;
  }
  .role-row {
    margin-top: 18rpx;
  }
  .role-label-wrap {
    display: flex;
    justify-content: space-between;
    gap: 12rpx;
    color: var(--theme-text);
    font-size: 21rpx;
    font-weight: 700;
  }
  .role-score {
    color: var(--theme-brand);
    font-weight: 800;
  }
  .score-track {
    height: 10rpx;
    margin-top: 8rpx;
    overflow: hidden;
    border-radius: 99rpx;
    background: var(--theme-surface-2);
  }
  .score-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--theme-brand);
  }
  .reason-text {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    line-height: 1.4;
  }
  .two-column-notes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12rpx;
    margin-top: 20rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid var(--theme-border);
  }
  .note-heading {
    display: block;
    margin-bottom: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 19rpx;
    font-weight: 800;
  }
  .note-item {
    display: block;
    margin-top: 5rpx;
    color: var(--theme-text);
    font-size: 19rpx;
    line-height: 1.45;
  }
  .stage-badge {
    color: var(--theme-brand);
  }
  .advice-next-step {
    display: block;
    margin-top: 14rpx;
    padding: 16rpx;
    border-radius: 12rpx;
    color: var(--theme-text);
    background: var(--theme-surface-2);
    font-size: 22rpx;
    line-height: 1.5;
    font-weight: 750;
  }
  .reason-bullet {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    line-height: 1.45;
  }
  .reason-bullet::before {
    content: '• ';
    color: var(--theme-brand);
    font-weight: 900;
  }
  .observe-note {
    display: block;
    margin-top: 14rpx;
    color: var(--theme-brand);
    font-size: 20rpx;
    line-height: 1.45;
    font-weight: 750;
  }
  .empty-monsters {
    margin-top: 16rpx;
    padding: 20rpx;
    border-radius: 12rpx;
    color: var(--theme-text-tertiary);
    background: var(--theme-surface-2);
    font-size: 20rpx;
    line-height: 1.5;
    text-align: center;
  }
  .monster-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 16rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }
  .monster-row:last-child {
    border-bottom: 0;
  }
  .monster-avatar {
    width: 76rpx;
    height: 76rpx;
    border-radius: 16rpx;
    flex: none;
    background: var(--theme-surface-2);
  }
  .monster-avatar--empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .monster-main {
    min-width: 0;
    flex: 1;
  }
  .monster-name-line {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  .monster-name {
    color: var(--theme-text);
    font-size: 22rpx;
    font-weight: 800;
  }
  .element-tag {
    color: var(--theme-text-tertiary);
    font-size: 17rpx;
  }
  .monster-evidence,
  .data-source,
  .monster-warning {
    display: block;
    margin-top: 4rpx;
    color: var(--theme-text-secondary);
    font-size: 18rpx;
    line-height: 1.4;
  }
  .data-source {
    color: var(--theme-text-tertiary);
    font-size: 17rpx;
  }
  .match-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: none;
    color: var(--theme-brand);
    font-size: 25rpx;
    font-weight: 900;
  }
  .match-suffix {
    color: var(--theme-text-tertiary);
    font-size: 16rpx;
    font-weight: 500;
  }
  .page-footnote {
    padding: 24rpx 14rpx 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    line-height: 1.5;
    text-align: center;
  }
</style>
