<template>
  <PageLayout title="游戏兑换券">
    <view class="coupon-page">
      <!-- 头部 -->
      <view class="page-head">
        <text class="page-title">{{ gameConfig.title }}</text>
        <view v-if="!isLoggedIn" class="login-tip guest">
          <text v-if="!isLoggedIn" class="login-link" @click="goLogin">登录同步 ›</text>
        </view>
      </view>

      <!-- 账号卡片 -->
      <view class="card">
        <view class="card-head">
          <view>
            <text class="card-title">我的账号</text>
            <text class="card-subtitle">已选 {{ selectedAccounts.length }}/{{ validAccounts.length }} 个账号</text>
          </view>
          <text class="card-tag">{{ isLoggedIn ? '云端托管' : '本机保存' }}</text>
        </view>

        <view class="auto-row featured">
          <view class="auto-text">
            <text class="auto-title">自动兑换托管</text>
            <text class="auto-hint">{{ isLoggedIn ? '新码出来时自动帮你兑换' : '登录后开启，新码自动到账' }}</text>
          </view>
          <switch class="auto-switch" :checked="isLoggedIn && allAutoOn" color="var(--theme-brand)" @change="handleAutoSwitchChange" />
        </view>

        <!-- 添加账号表单 -->
        <view class="add-form">
          <picker class="server-picker add-server-picker" :range="serverLabels" :value="getServerIndex(newAccount.server)" @change="changeNewServer($event)">
            <view class="server-chip editable">
              <text class="server-chip-label">区服</text>
              <text class="server-chip-value">{{ getServerShortLabel(newAccount.server) }}</text>
            </view>
          </picker>
          <input
            class="add-input"
            type="text"
            :placeholder="gameConfig.accountIdPlaceholder"
            :value="newAccount.accountId"
            @input="newAccount.accountId = String($event.detail.value || '').trim()" />
          <view class="add-btn" :class="{ disabled: addingAccount }" @click="addAccount">
            {{ addingAccount ? '...' : '添加' }}
          </view>
        </view>

        <view v-if="!accounts.length" class="empty-tip">还没有账号，先添加一个吧</view>

        <view v-if="accounts.length" class="account-list">
          <view
            v-for="(account, index) in accounts"
            :key="account.id"
            class="account-row"
            :class="{ selected: isAccountSelected(account) }"
            @click="toggleAccountSelection(account)">
            <view class="selection-check" :class="{ checked: isAccountSelected(account) }">
              <text v-if="isAccountSelected(account)" class="selection-check-mark">✓</text>
            </view>
            <view class="server-chip readonly">
              <text class="server-chip-label">区服</text>
              <text class="server-chip-value">{{ getServerShortLabel(account.server) }}</text>
            </view>

            <view class="account-main">
              <view class="account-line">
                <text class="account-name">{{ getAccountDisplayName(account) }}</text>
                <text v-if="isLoggedIn && !account.managed" class="local-badge">本地</text>
              </view>
              <view v-if="account.nickname && (account.accountIdMasked || account.accountId)" class="account-sub">
                <text class="account-id-sub">{{ account.accountIdMasked || account.accountId }}</text>
              </view>
            </view>

            <view class="account-actions">
              <view class="account-status-row">
                <text class="status-badge" :class="getStatusBadgeClass(account.status)">{{ getStatusBadgeText(account.status) }}</text>
              </view>
              <view class="account-action-buttons">
                <view
                  v-if="isLoggedIn && !account.managed"
                  class="mini-btn primary"
                  :class="{ loading: account.syncing }"
                  @click.stop="syncLocalAccount(index)">
                  {{ account.syncing ? '同步中' : '同步云端' }}
                </view>
                <view class="mini-btn" :class="{ loading: account.verifying }" @click.stop="verifyAccount(index)">
                  {{ account.verifying ? '验证中' : '验证' }}
                </view>
                <view class="mini-btn danger" @click.stop="removeAccount(index)">删除</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 券码区 -->
      <view class="card codes-card">
        <view class="card-head">
          <view>
            <text class="card-title">券码</text>
            <text class="card-subtitle">{{ couponModeSubtitle }}</text>
          </view>
        </view>

        <view class="coupon-tabs">
          <view class="coupon-tab" :class="{ active: activeCouponMode === 'public' }" @click="setActiveCouponMode('public')">
            批量兑换
          </view>
          <view class="coupon-tab" :class="{ active: activeCouponMode === 'manual' }" @click="setActiveCouponMode('manual')">
            手动输入
          </view>
        </view>

        <view v-if="activeCouponMode === 'manual'" class="manual-mode-body">
          <view class="manual-row">
            <input
              class="manual-input"
              type="text"
              placeholder="输入要兑换的券码"
              :value="manualCode"
              @input="manualCode = String($event.detail.value || '').toUpperCase()" />
          </view>
          <view class="mode-tip">
            默认建议只勾选 1 个账号；确认是公共券码时，可在上方多选账号。
          </view>
        </view>

        <view v-else class="public-mode-body">
          <view class="batch-add-row">
            <input
              class="manual-input"
              type="text"
              placeholder="输入可批量兑换的券码"
              :value="publicCodeInput"
              @input="publicCodeInput = String($event.detail.value || '').toUpperCase()" />
            <view class="manual-add" :class="{ disabled: addingPublicCode }" @click="addPublicCode">
              {{ addingPublicCode ? '添加中' : '添加' }}
            </view>
          </view>
          <view class="mode-tip public-tip">
            适合多个账号一起兑换；添加前会检查重复，成功后默认勾选。
          </view>
          <view class="public-actions">
            <text class="public-summary">已选 {{ selectedCodes.length }}/{{ combinedCodes.length }} 个券码</text>
            <view class="coupon-actions">
              <text class="refresh-code-btn" :class="{ disabled: loadingCodes }" @click="loadCodes">
                {{ loadingCodes ? '刷新中' : '刷新列表' }}
              </text>
              <text class="card-toggle" @click="showCodes = !showCodes">{{ showCodes ? '收起' : '明细' }}</text>
            </view>
          </view>
          <view v-if="codeLoadError" class="inline-error">{{ codeLoadError }}</view>
          <view v-if="showCodes && combinedCodes.length" class="code-list">
            <view
              v-for="item in combinedCodes"
              :key="item.code"
              class="code-item"
              :class="{ selected: isCodeSelected(item) }"
              @click="toggleCodeSelection(item)">
              <view class="code-info">
                <text class="code-text">{{ item.code }}</text>
                <text v-if="item.reward" class="code-reward">{{ item.reward }}</text>
              </view>
              <view class="code-side">
                <view class="selection-check code-check" :class="{ checked: isCodeSelected(item) }">
                  <text v-if="isCodeSelected(item)" class="selection-check-mark">✓</text>
                </view>
                <text class="code-source">{{ getSourceLabel(item.source) }}</text>
              </view>
            </view>
          </view>
          <view v-if="showCodes && !combinedCodes.length" class="empty-tip">暂无批量券码，可先添加券码或切换到手动输入</view>
        </view>
      </view>

      <view v-if="redeemError" class="inline-error">{{ redeemError }}</view>

      <!-- 统计（仅登录态展示，游客模式不触发统计接口） -->
      <view v-if="isLoggedIn && stats && !resultGroups.length" class="stats-row">
        <view class="stat success">
          <text class="stat-num">{{ stats.success }}</text>
          <text class="stat-label">成功</text>
        </view>
        <view class="stat used">
          <text class="stat-num">{{ stats.alreadyUsed }}</text>
          <text class="stat-label">已使用</text>
        </view>
        <view class="stat failed">
          <text class="stat-num">{{ stats.failed }}</text>
          <text class="stat-label">失败</text>
        </view>
      </view>

      <!-- 本次兑换结果分组 -->
      <view v-if="resultGroups.length" class="card result-summary-card">
        <view class="card-head">
          <view>
            <text class="card-title">本次兑换完成</text>
            <text class="card-subtitle">成功 {{ resultSummary.success }} · 已使用 {{ resultSummary.alreadyUsed }} · 失败 {{ resultSummary.failed }}</text>
          </view>
          <text class="card-toggle" @click="showAllResults = !showAllResults">{{ showAllResults ? '收起' : '全部' }}</text>
        </view>

        <view class="result-stats-row">
          <view class="stat success">
            <text class="stat-num">{{ resultSummary.success }}</text>
            <text class="stat-label">成功</text>
          </view>
          <view class="stat used">
            <text class="stat-num">{{ resultSummary.alreadyUsed }}</text>
            <text class="stat-label">已使用</text>
          </view>
          <view class="stat failed">
            <text class="stat-num">{{ resultSummary.failed }}</text>
            <text class="stat-label">失败</text>
          </view>
        </view>

        <view v-if="failedResultItems.length" class="failed-preview">
          <view v-for="item in failedPreviewItems" :key="item.key" class="result-row">
            <view class="result-main">
              <text class="result-code">{{ item.code }}</text>
              <text class="result-msg">{{ item.message }}</text>
            </view>
            <text class="result-status" :class="item.status">{{ item.statusLabel }}</text>
          </view>
          <text v-if="failedResultItems.length > failedPreviewLimit && !showAllResults" class="result-more" @click="showAllResults = true">
            还有 {{ failedResultItems.length - failedPreviewLimit }} 条失败项，查看全部
          </text>
        </view>
        <view v-else class="empty-tip">没有失败项，兑换结果很好。</view>

        <view v-if="showAllResults" class="result-list">
          <view v-for="(group, gi) in resultGroups" :key="group.account?.id || gi" class="result-group">
            <view class="result-head">
              <text class="result-account">{{ groupTitle(group) }}</text>
              <text class="result-count">{{ group.success }} 成功</text>
            </view>
            <view v-for="(item, ri) in group.results || []" :key="`${gi}-${item.code}-${ri}`" class="result-row">
              <view class="result-main">
                <text class="result-code">{{ item.code }}</text>
                <text class="result-msg">{{ item.message || item.reward || '已返回结果' }}</text>
              </view>
              <text class="result-status" :class="item.status">{{ getStatusLabel(item.status) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 兑换记录（登录态） -->
      <view v-if="isLoggedIn" class="card">
        <view class="card-head" @click="toggleRecords">
          <text class="card-title">兑换记录</text>
          <text class="card-toggle">{{ showRecords ? '收起' : '查看' }}</text>
        </view>
        <view v-if="showRecords" class="record-body">
          <view v-if="!records.length" class="empty-tip">暂无兑换记录</view>
          <view v-for="record in records" :key="record.id" class="record-row">
            <view class="record-main">
              <text class="record-code">{{ record.couponCode }}</text>
              <text class="record-sub">{{ record.accountIdMasked }} · {{ getServerShortLabel(record.server || '') }}</text>
            </view>
            <text class="result-status" :class="record.resultStatus">{{ getStatusLabel(record.resultStatus) }}</text>
          </view>
        </view>
      </view>

      <view class="redeem-dock">
        <view class="redeem-dock-copy">
          <text class="redeem-dock-title">{{ redeemDockTitle }}</text>
          <text class="redeem-dock-hint">{{ redeemHintText }}</text>
        </view>
        <button class="redeem-btn dock-btn" :disabled="redeemDisabled" @click="startRedeem">
          {{ redeemActionText }}
        </button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { getGameCouponConfig } from './config'
  import type { GameCouponConfig } from './config'
  import {
    deleteGameCouponsAccounts,
    getGameCouponsAccounts,
    getGameCouponsGameIdAccounts,
    getGameCouponsGameIdCodes,
    getGameCouponsGameIdProfile,
    getGameCouponsGameIdRedeemRecords,
    getGameIdRedeemRecordsSummary,
    postGameCouponsAccountsAutoRedeem,
    postGameCouponsAccountsVerify,
    postGameCouponsGameIdAccounts,
    postGameCouponsGameIdRedeem,
    postGameIdCodesManual,
  } from '@/services/apifox/NODEJSDEMO/GAMECOUPONS/apifox'
  import type {
    getGameCouponsGameIdCodesResCodes,
    getGameCouponsGameIdRedeemRecordsResResults,
    getGameIdRedeemRecordsSummaryRes,
    postGameCouponsGameIdRedeemBodyAccountsItem,
    postGameCouponsGameIdRedeemResAccountResults,
  } from '@/services/apifox/NODEJSDEMO/GAMECOUPONS/apifox'
  import { checkLoginStatus } from '@/utils/autoLogin'
  import { reportToolVisit } from '@/utils/tracker'

  type ServerValue = NonNullable<postGameCouponsGameIdRedeemBodyAccountsItem['server']>
  type AccountStatus = 'active' | 'invalid' | 'pending' | 'disabled'
  type CouponMode = 'manual' | 'public'

  interface AccountVM {
    /** 托管账号为后端 ObjectId，游客为本地临时 ID */
    id: string
    /** 是否后端托管账号 */
    managed: boolean
    server: string
    /** 游客模式存明文 Hive ID，托管模式为空 */
    accountId: string
    /** 托管模式的脱敏展示值 */
    accountIdMasked?: string
    accountLabel?: string
    nickname?: string
    status?: AccountStatus
    autoRedeemEnabled?: boolean
    verifying?: boolean
    syncing?: boolean
  }

  interface RouteOptions {
    gameId?: string
    game_id?: string
    compendiumId?: string
    compendium_id?: string
  }

  const maxAccounts = 5
  const gameConfig = ref<GameCouponConfig>(getGameCouponConfig())
  const accounts = ref<AccountVM[]>([])
  const newAccount = ref<{ server: string; accountId: string }>({ server: 'china', accountId: '' })
  const addingAccount = ref(false)

  const remoteCodes = ref<getGameCouponsGameIdCodesResCodes[]>([])
  const manualCode = ref('')
  const publicCodeInput = ref('')
  const activeCouponMode = ref<CouponMode>('public')
  const manualSelectedAccountIds = ref<string[]>([])
  const publicSelectedAccountIds = ref<string[]>([])
  const selectedCodeKeys = ref<string[]>([])
  const loadingCodes = ref(false)
  const addingPublicCode = ref(false)
  const codeLoadError = ref('')
  const showCodes = ref(false)

  const redeeming = ref(false)
  const redeemError = ref('')
  const redeemSummary = ref<getGameIdRedeemRecordsSummaryRes | null>(null)
  const resultGroups = ref<postGameCouponsGameIdRedeemResAccountResults[]>([])
  const showAllResults = ref(false)
  const failedPreviewLimit = 3

  const records = ref<getGameCouponsGameIdRedeemRecordsResResults[]>([])
  const summary = ref<getGameIdRedeemRecordsSummaryRes | null>(null)
  const showRecords = ref(false)

  const isLoggedIn = ref(false)
  const initialized = ref(false)
  // 登录后自动同步本地账号的并发锁（非响应式）
  let autoSyncing = false

  const serverLabels = computed(() => gameConfig.value.servers.map(item => item.label))

  const combinedCodes = computed(() => {
    const map = new Map<string, getGameCouponsGameIdCodesResCodes>()
    remoteCodes.value.forEach(item => {
      const key = String(item.code || '')
        .trim()
        .toUpperCase()
      if (!key || map.has(key)) return
      map.set(key, { ...item, code: key })
    })
    return Array.from(map.values())
  })

  const validAccounts = computed(() => accounts.value.filter(account => account.managed || account.accountId.trim().length > 0))

  const activeSelectedAccountIds = computed(() =>
    activeCouponMode.value === 'manual' ? manualSelectedAccountIds.value : publicSelectedAccountIds.value,
  )

  const selectedAccounts = computed(() => validAccounts.value.filter(account => activeSelectedAccountIds.value.includes(account.id)))

  const selectedCodes = computed(() => combinedCodes.value.filter(item => selectedCodeKeys.value.includes(getCodeKey(item))))

  const redeemDisabled = computed(() => {
    if (redeeming.value || selectedAccounts.value.length === 0) return true
    if (activeCouponMode.value === 'manual') return !manualCode.value.trim()
    return selectedCodes.value.length === 0
  })

  const managedAccounts = computed(() => accounts.value.filter(account => account.managed))

  const allAutoOn = computed(() => managedAccounts.value.length > 0 && managedAccounts.value.every(account => account.autoRedeemEnabled))

  const stats = computed(() => summary.value || redeemSummary.value)

  const resultSummary = computed(() => ({
    success: redeemSummary.value?.success || 0,
    alreadyUsed: redeemSummary.value?.alreadyUsed || 0,
    failed: redeemSummary.value?.failed || 0,
  }))

  const failedResultItems = computed(() =>
    resultGroups.value.flatMap((group, groupIndex) =>
      (group.results || [])
        .filter(item => !['success', 'already_used'].includes(String(item.status || '')))
        .map((item, resultIndex) => ({
          key: `${group.account?.id || groupIndex}-${item.code}-${resultIndex}`,
          code: String(item.code || '未知券码'),
          message: item.message || item.reward || '兑换失败',
          status: String(item.status || 'failed'),
          statusLabel: getStatusLabel(item.status),
        })),
    ),
  )

  const failedPreviewItems = computed(() => failedResultItems.value.slice(0, failedPreviewLimit))

  const redeemActionText = computed(() => {
    if (redeeming.value) return '兑换中…'
    if (activeCouponMode.value === 'manual') {
      if (!manualCode.value.trim()) return '输入券码后兑换'
      if (selectedAccounts.value.length > 1) return `兑换到 ${selectedAccounts.value.length} 个账号`
      return '立即兑换'
    }
    if (selectedAccounts.value.length === 1 && selectedCodes.value.length === 1) return '兑换这个券码'
    return '批量兑换'
  })

  const redeemDockTitle = computed(() => {
    if (!selectedAccounts.value.length) return '请选择账号'
    if (activeCouponMode.value === 'manual') return manualCode.value.trim() ? '一次性券码' : '请输入兑换码'
    if (!selectedCodes.value.length) return '请选择券码'
    return `${selectedAccounts.value.length} 个账号 · ${selectedCodes.value.length} 个券码`
  })

  const redeemHintText = computed(() => {
    if (activeCouponMode.value === 'manual') {
      if (selectedAccounts.value.length > 1) return '会把输入的券码兑换到已勾选账号'
      return '默认单账号兑换，可在上方多选账号'
    }
    if (selectedAccounts.value.length === 1 && selectedCodes.value.length === 1) return '单账号单券码兑换'
    return '仅兑换已勾选的账号和券码'
  })

  const couponModeSubtitle = computed(() => {
    if (activeCouponMode.value === 'manual') return `手动输入 · 已选 ${selectedAccounts.value.length}/${validAccounts.value.length} 个账号`
    return `批量兑换 · 已选 ${selectedCodes.value.length}/${combinedCodes.value.length} 个券码`
  })

  /* ----------------------------- 工具 ----------------------------- */

  function refreshLoginState() {
    const { isLoggedIn: loggedIn } = checkLoginStatus()
    isLoggedIn.value = loggedIn
  }

  function getDefaultServer(): string {
    return gameConfig.value.defaultServer || gameConfig.value.servers[0]?.value || 'global'
  }

  function getServerIndex(server: string) {
    return Math.max(
      0,
      gameConfig.value.servers.findIndex(item => item.value === server),
    )
  }

  function getServerShortLabel(server: string) {
    return gameConfig.value.servers[getServerIndex(server)]?.shortLabel || server
  }

  function localId() {
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  function getStorageKey() {
    return gameConfig.value.storageKey
  }

  function getAccountDisplayName(account: AccountVM) {
    return account.nickname || account.accountIdMasked || account.accountId || gameConfig.value.accountIdEmptyText
  }

  /** 账号右侧校验状态徽标文案：active=已校验，invalid=无效，其余=未校验 */
  function getStatusBadgeText(status?: string) {
    if (status === 'active') return '已校验'
    if (status === 'invalid') return '无效'
    return '未校验'
  }

  function getStatusBadgeClass(status?: string) {
    if (status === 'active') return 'ok'
    if (status === 'invalid') return 'bad'
    return 'pending'
  }

  function getSourceLabel(source?: string) {
    const map: Record<string, string> = { preset: '预置', upstream: '社区', manual: '自定义', admin: '官方', swgt: '官方' }
    return map[source || ''] || '自动'
  }

  function getCodeKey(item: getGameCouponsGameIdCodesResCodes) {
    return String(item.code || '')
      .trim()
      .toUpperCase()
  }

  function selectDefaultAccounts() {
    const ids = validAccounts.value.map(account => account.id)
    publicSelectedAccountIds.value = ids
    manualSelectedAccountIds.value = ids[0] ? [ids[0]] : []
  }

  function selectAllCodes() {
    selectedCodeKeys.value = combinedCodes.value.map(item => getCodeKey(item))
  }

  function isAccountSelected(account: AccountVM) {
    return activeSelectedAccountIds.value.includes(account.id)
  }

  function isCodeSelected(item: getGameCouponsGameIdCodesResCodes) {
    return selectedCodeKeys.value.includes(getCodeKey(item))
  }

  function toggleAccountSelection(account: AccountVM) {
    if (!account.managed && !account.accountId.trim()) return
    const selected = new Set(activeSelectedAccountIds.value)
    if (selected.has(account.id)) selected.delete(account.id)
    else selected.add(account.id)
    const next = validAccounts.value.map(item => item.id).filter(id => selected.has(id))
    if (activeCouponMode.value === 'manual') {
      manualSelectedAccountIds.value = next
    } else {
      publicSelectedAccountIds.value = next
    }
  }

  function normalizeAccountSelections() {
    const ids = validAccounts.value.map(account => account.id)
    publicSelectedAccountIds.value = ids.filter(id => publicSelectedAccountIds.value.includes(id))
    manualSelectedAccountIds.value = ids.filter(id => manualSelectedAccountIds.value.includes(id))
    if (ids.length && !manualSelectedAccountIds.value.length) {
      manualSelectedAccountIds.value = [ids[0]]
    }
  }

  function setActiveCouponMode(mode: CouponMode) {
    activeCouponMode.value = mode
    redeemError.value = ''
    normalizeAccountSelections()
  }

  function toggleCodeSelection(item: getGameCouponsGameIdCodesResCodes) {
    const key = getCodeKey(item)
    if (!key) return
    const selected = new Set(selectedCodeKeys.value)
    if (selected.has(key)) selected.delete(key)
    else selected.add(key)
    selectedCodeKeys.value = combinedCodes.value.map(code => getCodeKey(code)).filter(codeKey => selected.has(codeKey))
  }

  function getStatusLabel(status?: string) {
    const map: Record<string, string> = {
      pending: '等待',
      redeeming: '兑换中',
      success: '成功',
      already_used: '已使用',
      invalid_coupon: '券码无效',
      invalid_id: 'ID 无效',
      failed: '失败',
    }
    return map[status || ''] || '失败'
  }

  function groupTitle(group: postGameCouponsGameIdRedeemResAccountResults) {
    const account = group.account
    const name = account?.accountId || account?.id || '账号'
    return `${name} · ${getServerShortLabel(account?.server || '')}`
  }

  function toast(title: string) {
    uni.showToast({ title, icon: 'none' })
  }

  /* ----------------------------- 登录跳转 ----------------------------- */

  function buildCurrentPageUrl() {
    const params = [
      `gameId=${encodeURIComponent(gameConfig.value.gameId)}`,
      `compendiumId=${encodeURIComponent(gameConfig.value.compendiumId)}`,
    ]
    return `/subPackages/tools/game-coupons/index?${params.join('&')}`
  }

  function goLogin() {
    uni.navigateTo({ url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(buildCurrentPageUrl())}` })
  }

  /* ----------------------------- 本地账号缓存 ----------------------------- */

  function saveLocalAccounts() {
    if (isLoggedIn.value) return
    try {
      uni.setStorageSync(
        getStorageKey(),
        accounts.value.map(item => ({ id: item.id, server: item.server, accountId: item.accountId, nickname: item.nickname })),
      )
    } catch {
      /* 缓存失败不阻断 */
    }
  }

  /** 读取并解析本地缓存账号为 VM（managed=false） */
  function parseStoredAccounts(): AccountVM[] {
    try {
      const stored = uni.getStorageSync(getStorageKey())
      const list = Array.isArray(stored) ? stored : []
      return list
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          id: typeof item.id === 'string' && item.id ? item.id : localId(),
          managed: false,
          server: gameConfig.value.servers.some(s => s.value === item.server) ? item.server : getDefaultServer(),
          accountId: typeof item.accountId === 'string' ? item.accountId : '',
          nickname: typeof item.nickname === 'string' ? item.nickname : undefined,
        }))
    } catch {
      return []
    }
  }

  function loadLocalAccounts() {
    accounts.value = parseStoredAccounts()
    selectDefaultAccounts()
  }

  /** 从本地缓存中移除指定账号（登录后同步/删除本地账号时调用） */
  function dropLocalAccount(id: string) {
    try {
      const stored = uni.getStorageSync(getStorageKey())
      const list = Array.isArray(stored) ? stored : []
      uni.setStorageSync(
        getStorageKey(),
        list.filter(item => item && item.id !== id),
      )
    } catch {
      /* 缓存失败不阻断 */
    }
  }

  /* ----------------------------- 托管账号 ----------------------------- */

  async function loadManagedAccounts() {
    try {
      const res = await getGameCouponsGameIdAccounts(gameConfig.value.gameId, {
        compendium_id: gameConfig.value.compendiumId,
      })
      const managed: AccountVM[] = (res.accounts || []).map(item => ({
        id: String(item.id || ''),
        managed: true,
        server: item.server || getDefaultServer(),
        accountId: '',
        accountIdMasked: item.accountIdMasked,
        accountLabel: item.accountLabel,
        nickname: item.nickname,
        status: item.status,
        autoRedeemEnabled: item.autoRedeemEnabled,
      }))
      // 保留登录前的本地缓存账号，展示「本地」标识并支持同步到云端
      const locals = parseStoredAccounts().filter(item => item.accountId.trim().length > 0)
      accounts.value = [...managed, ...locals]
      selectDefaultAccounts()
    } catch (err) {
      toast(errMsg(err, '获取托管账号失败'))
    }
  }

  /** 把本地缓存账号上传为云端托管账号 */
  async function syncLocalAccount(index: number) {
    const account = accounts.value[index]
    if (!account || account.managed || account.syncing) return
    if (!account.accountId.trim()) {
      toast('本地账号信息缺失，无法同步')
      return
    }
    account.syncing = true
    try {
      await postGameCouponsGameIdAccounts(
        gameConfig.value.gameId,
        { compendium_id: gameConfig.value.compendiumId },
        { account_id: account.accountId.trim(), server: account.server as ServerValue },
      )
      dropLocalAccount(account.id)
      await loadManagedAccounts()
      toast('已同步到云端')
    } catch (err) {
      account.syncing = false
      toast(errMsg(err, '同步失败'))
    }
  }

  /**
   * 登录后自动把本机缓存的全部账号上传到云端。
   * 去重：1) 本地内部按 server + accountId 去重；
   *      2) 后端 createAccount 以 account_id 指纹做 upsert，重复上传不会产生重复账号。
   * 上传成功的从本机缓存移除；失败的保留，下次进入或手动「同步云端」时重试。
   */
  async function autoSyncLocalAccounts(): Promise<number> {
    if (autoSyncing) return 0
    autoSyncing = true
    try {
      const locals = parseStoredAccounts().filter(item => item.accountId.trim().length > 0)
      const seen = new Set<string>()
      const unique: AccountVM[] = []
      locals.forEach(item => {
        const key = `${item.server}::${item.accountId.trim().toLowerCase()}`
        if (seen.has(key)) {
          dropLocalAccount(item.id) // 本地重复项直接清掉
          return
        }
        seen.add(key)
        unique.push(item)
      })
      let synced = 0
      for (const item of unique) {
        try {
          await postGameCouponsGameIdAccounts(
            gameConfig.value.gameId,
            { compendium_id: gameConfig.value.compendiumId },
            { account_id: item.accountId.trim(), server: item.server as ServerValue },
          )
          dropLocalAccount(item.id)
          synced += 1
        } catch {
          /* 单个失败保留本地，不阻断其余账号 */
        }
      }
      return synced
    } finally {
      autoSyncing = false
    }
  }

  /** 进入登录态：先自动同步本地账号，再加载云端账号与统计 */
  async function enterLoggedInMode() {
    const synced = await autoSyncLocalAccounts()
    await loadManagedAccounts()
    loadSummary()
    if (synced > 0) toast(`已自动同步 ${synced} 个本地账号到云端`)
  }

  function changeNewServer(event: { detail: { value: number | string } }) {
    const idx = Number(event.detail.value)
    newAccount.value.server = gameConfig.value.servers[idx]?.value || getDefaultServer()
  }

  async function addAccount() {
    if (accounts.value.length >= maxAccounts) {
      toast(`最多保存 ${maxAccounts} 个账号`)
      return
    }
    const accountId = newAccount.value.accountId.trim()
    if (!accountId) {
      toast(`请输入${gameConfig.value.accountIdLabel}`)
      return
    }
    const server = newAccount.value.server || getDefaultServer()

    if (isLoggedIn.value) {
      addingAccount.value = true
      try {
        await postGameCouponsGameIdAccounts(
          gameConfig.value.gameId,
          { compendium_id: gameConfig.value.compendiumId },
          { account_id: accountId, server: server as ServerValue },
        )
        await loadManagedAccounts()
        newAccount.value.accountId = ''
      } catch (err) {
        toast(errMsg(err, '添加账号失败'))
      } finally {
        addingAccount.value = false
      }
      return
    }

    accounts.value.push({ id: localId(), managed: false, server, accountId })
    const createdId = accounts.value[accounts.value.length - 1].id
    publicSelectedAccountIds.value = [...publicSelectedAccountIds.value, createdId]
    if (!manualSelectedAccountIds.value.length) {
      manualSelectedAccountIds.value = [createdId]
    }
    newAccount.value.accountId = ''
    saveLocalAccounts()
  }

  function removeAccount(index: number) {
    const account = accounts.value[index]
    if (!account) return
    const name = account.nickname || account.accountIdMasked || account.accountId || gameConfig.value.accountIdLabel
    uni.showModal({
      title: '删除账号',
      content: `确定删除「${name}」吗？删除后不可恢复。`,
      confirmText: '删除',
      confirmColor: '#dc2626',
      success: res => {
        if (res.confirm) doRemoveAccount(index)
      },
    })
  }

  async function doRemoveAccount(index: number) {
    const account = accounts.value[index]
    if (!account) return

    if (account.managed) {
      try {
        await deleteGameCouponsAccounts({ gameId: gameConfig.value.gameId, accountId: account.id })
        accounts.value.splice(index, 1)
        publicSelectedAccountIds.value = publicSelectedAccountIds.value.filter(id => id !== account.id)
        manualSelectedAccountIds.value = manualSelectedAccountIds.value.filter(id => id !== account.id)
        normalizeAccountSelections()
        toast('已删除')
      } catch (err) {
        toast(errMsg(err, '删除失败'))
      }
      return
    }

    accounts.value.splice(index, 1)
    publicSelectedAccountIds.value = publicSelectedAccountIds.value.filter(id => id !== account.id)
    manualSelectedAccountIds.value = manualSelectedAccountIds.value.filter(id => id !== account.id)
    normalizeAccountSelections()
    if (isLoggedIn.value) {
      // 登录态下删除的是未同步的本地账号，需同步从缓存移除
      dropLocalAccount(account.id)
    } else {
      saveLocalAccounts()
    }
    toast('已删除')
  }

  async function refreshManagedAccount(index: number) {
    const account = accounts.value[index]
    if (!account || !account.managed) return
    try {
      const detail = await getGameCouponsAccounts({ gameId: gameConfig.value.gameId, accountId: account.id })
      account.server = detail.server || account.server
      account.accountIdMasked = detail.accountIdMasked
      account.nickname = detail.nickname
      account.status = detail.status
      account.autoRedeemEnabled = detail.autoRedeemEnabled
    } catch {
      /* 刷新失败忽略 */
    }
  }

  async function verifyAccount(index: number) {
    const account = accounts.value[index]
    if (!account) return
    account.verifying = true
    try {
      if (account.managed) {
        await postGameCouponsAccountsVerify({ gameId: gameConfig.value.gameId, accountId: account.id })
        await refreshManagedAccount(index)
        toast(account.nickname ? `已验证：${account.nickname}` : '验证完成')
      } else {
        if (!account.accountId.trim()) {
          toast(`请先填写${gameConfig.value.accountIdLabel}`)
          return
        }
        const res = await getGameCouponsGameIdProfile(gameConfig.value.gameId, {
          account_id: account.accountId.trim(),
          server: account.server,
          compendium_id: gameConfig.value.compendiumId,
        })
        account.nickname = res.nickname
        account.status = res.available ? 'active' : 'invalid'
        toast(res.available ? `验证成功：${res.nickname || '有效账号'}` : res.message || '账号无效')
        saveLocalAccounts()
      }
    } catch (err) {
      account.status = 'invalid'
      toast(errMsg(err, '验证失败'))
    } finally {
      account.verifying = false
    }
  }

  async function toggleAllAuto() {
    const next = !allAutoOn.value
    const managed = managedAccounts.value
    if (!managed.length) {
      toast('暂无托管账号')
      return
    }
    try {
      await Promise.all(
        managed.map(account =>
          postGameCouponsAccountsAutoRedeem({ gameId: gameConfig.value.gameId, accountId: account.id }, { enabled: next }),
        ),
      )
      managed.forEach(account => {
        account.autoRedeemEnabled = next
      })
      toast(next ? '已开启自动兑换托管' : '已关闭自动兑换')
    } catch (err) {
      toast(errMsg(err, '设置失败'))
    }
  }

  function handleAutoSwitchChange(event: { detail: { value: boolean } }) {
    if (!isLoggedIn.value) {
      goLogin()
      return
    }

    const target = Boolean(event.detail.value)
    if (target !== allAutoOn.value) {
      toggleAllAuto()
    }
  }

  /* ----------------------------- 券码 ----------------------------- */

  async function loadCodes() {
    if (loadingCodes.value) return
    loadingCodes.value = true
    codeLoadError.value = ''
    try {
      const res = await getGameCouponsGameIdCodes(gameConfig.value.gameId, {
        compendium_id: gameConfig.value.compendiumId,
      })
      remoteCodes.value = res.codes || []
      selectAllCodes()
    } catch (err) {
      codeLoadError.value = errMsg(err, '获取券码失败')
    } finally {
      loadingCodes.value = false
    }
  }

  async function addPublicCode() {
    if (addingPublicCode.value) return

    const code = publicCodeInput.value.trim().toUpperCase()
    if (!code) {
      toast('请输入要添加的券码')
      return
    }
    if (combinedCodes.value.some(item => getCodeKey(item) === code)) {
      toast('券码已存在，请直接勾选兑换')
      return
    }

    addingPublicCode.value = true
    codeLoadError.value = ''
    try {
      await postGameIdCodesManual(
        gameConfig.value.gameId,
        { compendium_id: gameConfig.value.compendiumId },
        { code, source: 'manual' },
      )
      publicCodeInput.value = ''
      try {
        await loadCodes()
      } catch {
        /* loadCodes 内部已记录错误，这里不把刷新失败误判为添加失败 */
      }
      if (!combinedCodes.value.some(item => getCodeKey(item) === code)) {
        remoteCodes.value = [...remoteCodes.value, { code, source: 'manual' }]
      }
      selectedCodeKeys.value = Array.from(new Set([...selectedCodeKeys.value, code]))
      showCodes.value = true
      toast('已添加并加入批量兑换')
    } catch (err) {
      toast(errMsg(err, '券码添加失败'))
    } finally {
      addingPublicCode.value = false
    }
  }

  /* ----------------------------- 兑换 ----------------------------- */

  async function redeemAccountsAndCodes(accountsToRedeem: AccountVM[], codesToRedeem: getGameCouponsGameIdCodesResCodes[]) {
    redeemSummary.value = null
    resultGroups.value = []
    showAllResults.value = false
    uni.showLoading({ title: '兑换中…', mask: true })

    const payloadAccounts: postGameCouponsGameIdRedeemBodyAccountsItem[] = accountsToRedeem.map(account =>
      account.managed
        ? { id: account.id, server: account.server as ServerValue }
        : { id: account.id, server: account.server as ServerValue, account_id: account.accountId.trim() },
    )
    const payloadCodes = codesToRedeem.map(item => ({ code: item.code as string, reward: item.reward }))

    try {
      const res = await postGameCouponsGameIdRedeem(
        gameConfig.value.gameId,
        { compendium_id: gameConfig.value.compendiumId },
        { accounts: payloadAccounts, codes: payloadCodes },
      )
      resultGroups.value = res.accountResults || []
      const successCount = res.success || 0
      const alreadyUsedCount = res.alreadyUsed || 0
      const failedCount = res.failed || 0
      redeemSummary.value = {
        success: successCount,
        alreadyUsed: alreadyUsedCount,
        failed: failedCount,
        total: successCount + alreadyUsedCount + failedCount,
      }
      if (isLoggedIn.value) {
        loadSummary()
        if (showRecords.value) loadRecords()
      }
      uni.hideLoading()
      uni.showModal({
        title: successCount > 0 ? '兑换成功' : '兑换完成',
        content: `成功兑换 ${successCount} 个礼包码\n已使用 ${alreadyUsedCount} 个 · 失败 ${failedCount} 个`,
        showCancel: false,
        confirmText: '知道了',
      })
      return { success: successCount, alreadyUsed: alreadyUsedCount, failed: failedCount }
    } catch (err) {
      uni.hideLoading()
      throw err
    }
  }

  async function startRedeem() {
    // 防止未请求完成时重复点击
    if (redeeming.value) return
    if (!validAccounts.value.length) {
      redeemError.value = `请至少添加并填写一个${gameConfig.value.accountIdLabel}`
      return
    }
    if (!selectedAccounts.value.length) {
      redeemError.value = '请选择要兑换的账号'
      return
    }
    const codesToRedeem =
      activeCouponMode.value === 'manual'
        ? [{ code: manualCode.value.trim().toUpperCase(), source: 'manual' }]
        : selectedCodes.value

    if (activeCouponMode.value === 'manual' && !codesToRedeem[0].code) {
      redeemError.value = '请输入一次性兑换码'
      return
    }
    if (activeCouponMode.value === 'public' && !combinedCodes.value.length) {
      redeemError.value = '暂无批量券码，请刷新、添加或切换到手动输入'
      return
    }
    if (activeCouponMode.value === 'public' && !selectedCodes.value.length) {
      redeemError.value = '请选择要批量兑换的券码'
      return
    }

    redeeming.value = true
    redeemError.value = ''
    try {
      const result = await redeemAccountsAndCodes(selectedAccounts.value, codesToRedeem)
      if (activeCouponMode.value === 'manual' && result.failed === 0) {
        manualCode.value = ''
      }
    } catch (err) {
      redeemError.value = errMsg(err, '兑换请求失败')
      toast(redeemError.value)
    } finally {
      redeeming.value = false
    }
  }

  /* ----------------------------- 记录与统计 ----------------------------- */

  async function loadSummary() {
    try {
      summary.value = await getGameIdRedeemRecordsSummary(gameConfig.value.gameId, {
        compendium_id: gameConfig.value.compendiumId,
      })
    } catch {
      /* 统计失败忽略 */
    }
  }

  async function loadRecords() {
    try {
      const res = await getGameCouponsGameIdRedeemRecords(gameConfig.value.gameId, {
        compendium_id: gameConfig.value.compendiumId,
        limit: 20,
        sortBy: 'redeemedAt:desc',
      })
      records.value = res.results || []
    } catch (err) {
      toast(errMsg(err, '获取记录失败'))
    }
  }

  function toggleRecords() {
    showRecords.value = !showRecords.value
    if (showRecords.value && !records.value.length) loadRecords()
  }

  /* ----------------------------- 错误处理 ----------------------------- */

  function errMsg(err: unknown, fallback: string) {
    if (typeof err === 'string') return err
    if (err instanceof Error) return err.message
    if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
    return fallback
  }

  /* ----------------------------- 初始化 ----------------------------- */

  function applyRouteOptions(options: RouteOptions = {}) {
    const gameId = options.gameId || options.game_id || 'swc'
    const config = getGameCouponConfig(gameId)
    const compendiumId = options.compendiumId || options.compendium_id || config.compendiumId
    gameConfig.value = { ...config, compendiumId }
    newAccount.value.server = getDefaultServer()
  }

  function initializePage() {
    if (initialized.value) return
    initialized.value = true
    refreshLoginState()
    if (isLoggedIn.value) {
      enterLoggedInMode()
    } else {
      loadLocalAccounts()
    }
    loadCodes()
  }

  onLoad(options => {
    applyRouteOptions(options as RouteOptions)
    initializePage()
  })

  onShow(() => {
    reportToolVisit('summoners-war-coupons')
    const wasLoggedIn = isLoggedIn.value
    refreshLoginState()
    if (!initialized.value) return
    if (isLoggedIn.value && !wasLoggedIn) {
      enterLoggedInMode()
    }
  })

  onMounted(() => {
    initializePage()
  })
</script>

<style lang="scss" scoped>
  $page-bg: var(--theme-bg);
  $card-bg: var(--theme-surface);
  $border: var(--theme-border);
  $field-bg: var(--theme-surface-2);
  $text-primary: var(--theme-text);
  $text-secondary: var(--theme-text-secondary);
  $text-hint: var(--theme-text-tertiary);
  $accent: #4f6ef2;
  $accent-2: #6a8bff;
  $success: #16a34a;
  $warning: #d97706;
  $error: #dc2626;

  .coupon-page {
    min-height: 100vh;
    padding: 32rpx 28rpx 220rpx;
    background: $page-bg;
    box-sizing: border-box;
  }

  /* 头部 */
  .page-head {
    margin-bottom: 28rpx;
  }

  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .page-subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.5;
  }

  /* 卡片 */
  .card {
    margin-bottom: 24rpx;
    padding: 24rpx;
    background: $card-bg;
    border-radius: 20rpx;
    border: 1rpx solid $border;
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .card-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
  }

  .card-subtitle {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-hint;
    line-height: 1.4;
  }

  .card-tag {
    font-size: 22rpx;
    color: $accent;
    background: rgba(79, 110, 242, 0.1);
    padding: 4rpx 16rpx;
    border-radius: 999rpx;
  }

  .card-toggle {
    font-size: 24rpx;
    color: $accent;

    &.disabled {
      opacity: 0.5;
    }
  }

  .empty-tip {
    padding: 24rpx 0;
    font-size: 24rpx;
    color: $text-hint;
    text-align: center;
  }

  /* 账号行 */
  .account-list {
    margin-top: 18rpx;
    overflow: hidden;
    border-radius: 16rpx;
    border: 1rpx solid $border;
  }

  .account-row {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    padding: 18rpx 16rpx;
    border-top: 1rpx solid $border;
    border-left: 4rpx solid transparent;

    &.selected {
      border-left-color: $accent;
      background: rgba(79, 110, 242, 0.06);
    }
  }

  .account-row:first-child {
    border-top: none;
  }

  .server-picker {
    flex-shrink: 0;
  }

  .add-server-picker {
    align-self: stretch;
  }

  .server-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 112rpx;
    min-height: 64rpx;
    padding: 8rpx 14rpx;
    color: $text-primary;
    background: $field-bg;
    border-radius: 12rpx;
    text-align: center;

    &.editable {
      color: $accent;
      background: rgba(79, 110, 242, 0.1);
      border: 1rpx solid rgba(79, 110, 242, 0.28);
      box-shadow: 0 6rpx 14rpx rgba(79, 110, 242, 0.08);
    }

    &.readonly {
      min-width: 88rpx;
      color: $text-hint;
      background: rgba(148, 163, 184, 0.12);
    }
  }

  .server-chip-label {
    display: block;
    font-size: 18rpx;
    line-height: 1.1;
    color: inherit;
    opacity: 0.72;
  }

  .server-chip-value {
    display: block;
    margin-top: 4rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: inherit;
  }

  .account-main {
    flex: 1;
    min-width: 0;
  }

  .account-line {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .account-name {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: $text-primary;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .local-badge {
    flex-shrink: 0;
    padding: 2rpx 14rpx;
    font-size: 20rpx;
    border-radius: 999rpx;
    color: $warning;
    background: rgba(217, 119, 6, 0.12);
  }

  .status-badge {
    flex-shrink: 0;
    padding: 2rpx 14rpx;
    font-size: 20rpx;
    border-radius: 999rpx;
    color: $text-hint;
    background: rgba(148, 163, 184, 0.16);

    &.ok {
      color: $success;
      background: rgba(22, 163, 74, 0.12);
    }

    &.bad {
      color: $error;
      background: rgba(220, 38, 38, 0.12);
    }
  }

  .account-sub {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 6rpx;
  }

  .account-id-sub {
    font-size: 22rpx;
    color: $text-hint;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .account-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10rpx;
    flex-shrink: 0;
    max-width: 232rpx;
  }

  .account-status-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8rpx;
  }

  .account-action-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10rpx;
  }

  .selection-check {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36rpx;
    height: 36rpx;
    margin-top: 14rpx;
    border-radius: 999rpx;
    border: 2rpx solid rgba(148, 163, 184, 0.52);
    background: $card-bg;
    box-sizing: border-box;

    &.checked {
      border-color: $accent;
      background: $accent;
    }
  }

  .selection-check-mark {
    font-size: 24rpx;
    line-height: 1;
    color: #fff;
  }

  .mini-btn {
    padding: 8rpx 18rpx;
    font-size: 22rpx;
    color: $accent;
    background: rgba(79, 110, 242, 0.08);
    border-radius: 12rpx;

    &.primary {
      color: #fff;
      background: $accent;
    }

    &.danger {
      color: $error;
      background: rgba(220, 38, 38, 0.08);
    }

    &.loading {
      opacity: 0.6;
    }
  }

  /* 添加账号 */
  .add-form {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 18rpx;
    padding: 16rpx;
    background: $field-bg;
    border-radius: 16rpx;
    border: 1rpx solid $border;
  }

  .add-input {
    flex: 1;
    height: 64rpx;
    padding: 0 20rpx;
    font-size: 26rpx;
    color: $text-primary;
    background: $card-bg;
    border-radius: 12rpx;
  }

  .add-btn {
    flex-shrink: 0;
    padding: 0 28rpx;
    height: 64rpx;
    line-height: 64rpx;
    font-size: 24rpx;
    color: #fff;
    background: $accent;
    border-radius: 12rpx;

    &.disabled {
      opacity: 0.6;
    }
  }

  /* 自动兑换 */
  .auto-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    margin-top: 18rpx;
    padding: 18rpx 20rpx;
    background: $field-bg;
    border-radius: 16rpx;
    border: 1rpx solid $border;

    &.featured {
      margin-bottom: 18rpx;
      background: rgba(79, 110, 242, 0.08);
      border-color: rgba(79, 110, 242, 0.26);
      box-shadow: 0 10rpx 24rpx rgba(79, 110, 242, 0.08);
    }
  }

  .auto-text {
    flex: 1;
    min-width: 0;
  }

  .auto-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
  }

  .auto-hint {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-secondary;
  }

  .auto-switch {
    transform: scale(0.85);
  }

  /* 主按钮 */
  .redeem-btn {
    width: 100%;
    height: 92rpx;
    line-height: 92rpx;
    margin-bottom: 8rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, $accent, $accent-2);
    border-radius: 20rpx;
    border: none;

    &[disabled] {
      opacity: 0.5;
    }

    &::after {
      border: none;
    }
  }

  .redeem-hint {
    display: block;
    margin-bottom: 18rpx;
    font-size: 22rpx;
    color: $text-hint;
    text-align: center;
  }

  .inline-error {
    margin-bottom: 16rpx;
    font-size: 24rpx;
    color: $error;
  }

  /* 券码 */
  .codes-card .card-head {
    margin-bottom: 16rpx;
  }

  .coupon-tabs {
    display: flex;
    gap: 8rpx;
    padding: 6rpx;
    margin-bottom: 18rpx;
    background: $field-bg;
    border-radius: 16rpx;
    border: 1rpx solid $border;
  }

  .coupon-tab {
    flex: 1;
    height: 64rpx;
    line-height: 64rpx;
    font-size: 26rpx;
    font-weight: 600;
    color: $text-secondary;
    text-align: center;
    border-radius: 12rpx;

    &.active {
      color: #fff;
      background: $accent;
      box-shadow: 0 8rpx 18rpx rgba(79, 110, 242, 0.16);
    }
  }

  .coupon-actions {
    display: flex;
    align-items: center;
    gap: 14rpx;
    flex-shrink: 0;
  }

  .refresh-code-btn {
    flex-shrink: 0;
    padding: 8rpx 18rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: $accent;
    background: rgba(79, 110, 242, 0.1);
    border-radius: 999rpx;

    &.disabled {
      opacity: 0.5;
    }
  }

  .manual-mode-body,
  .public-mode-body {
    margin-top: 2rpx;
  }

  .manual-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;
  }

  .batch-add-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;
  }

  .manual-input {
    flex: 1;
    height: 64rpx;
    padding: 0 20rpx;
    font-size: 26rpx;
    color: $text-primary;
    background: $field-bg;
    border-radius: 12rpx;
  }

  .manual-add {
    flex-shrink: 0;
    min-width: 112rpx;
    height: 64rpx;
    padding: 0 22rpx;
    line-height: 64rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
    text-align: center;
    background: $accent;
    border-radius: 12rpx;
    box-shadow: 0 8rpx 18rpx rgba(79, 110, 242, 0.16);

    &.disabled {
      opacity: 0.6;
    }
  }

  .mode-tip {
    padding: 14rpx 18rpx;
    font-size: 24rpx;
    line-height: 1.45;
    color: $warning;
    background: rgba(217, 119, 6, 0.1);
    border-radius: 12rpx;
  }

  .public-tip {
    margin-bottom: 16rpx;
    color: $text-secondary;
    background: rgba(79, 110, 242, 0.08);
  }

  .code-list {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .code-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 20rpx;
    background: $field-bg;
    border-radius: 12rpx;
    border: 1rpx solid transparent;

    &.selected {
      border-color: rgba(79, 110, 242, 0.35);
      background: rgba(79, 110, 242, 0.06);
    }
  }

  .code-info {
    flex: 1;
    min-width: 0;
  }

  .code-text {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
  }

  .code-reward {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: $text-secondary;
  }

  .code-source {
    display: block;
    margin-top: 6rpx;
    flex-shrink: 0;
    font-size: 22rpx;
    color: $text-hint;
  }

  .code-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
    margin-left: 18rpx;
  }

  .code-check {
    margin-top: 0;
    margin-bottom: 4rpx;
  }

  .public-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    margin-bottom: 16rpx;
  }

  .public-summary {
    flex: 1;
    min-width: 0;
    font-size: 24rpx;
    color: $text-secondary;
  }

  .redeem-dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 18rpx 28rpx calc(18rpx + env(safe-area-inset-bottom));
    background: $card-bg;
    border-top: 1rpx solid $border;
    box-shadow: 0 -12rpx 32rpx rgba(15, 23, 42, 0.08);
    box-sizing: border-box;
  }

  .redeem-dock-copy {
    flex: 1;
    min-width: 0;
  }

  .redeem-dock-title {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
  }

  .redeem-dock-hint {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: $text-hint;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .dock-btn {
    flex: 0 0 240rpx;
    width: 240rpx;
    height: 80rpx;
    line-height: 80rpx;
    margin: 0;
    font-size: 26rpx;
    border-radius: 18rpx;
  }

  /* 统计 */
  .stats-row {
    display: flex;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  .stat {
    flex: 1;
    padding: 24rpx 0;
    background: $card-bg;
    border-radius: 16rpx;
    border: 1rpx solid $border;
    text-align: center;
  }

  .stat-num {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .stat-label {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-secondary;
  }

  .stat.success .stat-num {
    color: $success;
  }

  .stat.used .stat-num {
    color: $warning;
  }

  .stat.failed .stat-num {
    color: $error;
  }

  /* 结果分组 */
  .result-summary-card .card-head {
    align-items: flex-start;
  }

  .result-stats-row {
    display: flex;
    gap: 12rpx;
    margin-bottom: 18rpx;
  }

  .result-stats-row .stat {
    padding: 18rpx 0;
    background: $field-bg;
  }

  .result-stats-row .stat-num {
    font-size: 34rpx;
  }

  .failed-preview {
    overflow: hidden;
    border-radius: 14rpx;
    border: 1rpx solid $border;
  }

  .failed-preview .result-row:first-child {
    border-top: none;
  }

  .result-more {
    display: block;
    padding: 16rpx 0;
    font-size: 24rpx;
    color: $accent;
    text-align: center;
    border-top: 1rpx solid $border;
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 18rpx;
  }

  .result-group {
    padding: 20rpx;
    background: $field-bg;
    border-radius: 16rpx;
    border: 1rpx solid $border;
  }

  .result-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;
  }

  .result-account {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
  }

  .result-count {
    font-size: 22rpx;
    color: $success;
  }

  .result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12rpx 0;
    border-top: 1rpx solid $border;
  }

  .result-main {
    flex: 1;
    min-width: 0;
  }

  .result-code {
    display: block;
    font-size: 26rpx;
    color: $text-primary;
  }

  .result-msg {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: $text-hint;
  }

  .result-status {
    flex-shrink: 0;
    font-size: 24rpx;
    color: $text-secondary;

    &.success {
      color: $success;
    }

    &.already_used {
      color: $warning;
    }

    &.invalid_coupon,
    &.invalid_id,
    &.failed {
      color: $error;
    }
  }

  /* 记录 */
  .record-body {
    margin-top: 8rpx;
  }

  .record-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14rpx 0;
    border-top: 1rpx solid $border;
  }

  .record-main {
    flex: 1;
    min-width: 0;
  }

  .record-code {
    display: block;
    font-size: 26rpx;
    color: $text-primary;
  }

  .record-sub {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: $text-hint;
  }
</style>
