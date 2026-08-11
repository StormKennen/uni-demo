<template>
  <PageLayout :title="gameConfig.title">
    <view class="coupon-page">
      <view class="coupon-main">
        <!-- 1. 账号 -->
        <view class="card checkout-card">
          <view class="step-head">
            <text class="step-index">1</text>
            <view class="step-copy">
              <text class="step-title">兑换到账号</text>
              <text class="step-desc">{{ accountStepDesc }}</text>
            </view>
          </view>

          <view v-if="!isLoggedIn" class="local-mode-tip">
            <view class="local-mode-tip__copy">
              <text class="local-mode-tip__title">当前为游客模式</text>
              <text class="local-mode-tip__desc">验证后的账号信息仅保存在本设备；登录后可同步账号、查看兑换记录并开启自动兑换。</text>
            </view>
            <button class="local-mode-login" @click="goLogin">登录</button>
          </view>

          <!-- 新用户：直接加号 -->
          <view v-if="!validAccounts.length" class="onboarding-panel">
            <text class="onboarding-title">先添加游戏账号</text>
            <text class="onboarding-desc">填写 {{ gameConfig.accountIdLabel }} 后即可兑换礼包码</text>
            <view class="add-form">
              <picker
                class="server-picker add-server-picker"
                :range="serverLabels"
                :value="getServerIndex(newAccount.server)"
                @change="changeNewServer($event)">
                <view class="server-chip editable">
                  <text class="server-chip-value">{{ getServerShortLabel(newAccount.server) }}</text>
                </view>
              </picker>
              <input
                class="add-input"
                type="text"
                :placeholder="gameConfig.accountIdPlaceholder"
                :value="newAccount.accountId"
                @input="updateNewAccountId" />
              <view class="add-btn" :class="{ disabled: addingAccount }" @click="addAccount">
                {{ addingAccount ? '验证中' : '验证并添加' }}
              </view>
            </view>
          </view>

          <!-- 已有账号：当前账号 + 管理 -->
          <view v-else class="current-account-wrap">
            <view class="current-account" @click="showAccountManager = !showAccountManager">
              <view class="current-account-main">
                <text class="current-account-name">{{ getAccountDisplayName(primaryAccount) }}</text>
                <text class="current-account-meta">
                  {{ getServerShortLabel(primaryAccount?.server || '') }}
                  <text v-if="selectedAccounts.length > 1"> · 已选 {{ selectedAccounts.length }} 个账号</text>
                  <text v-else> · 点管理可多选账号</text>
                </text>
              </view>
              <text class="current-account-action">{{ showAccountManager ? '收起' : validAccounts.length > 1 ? '切换' : '管理' }}</text>
            </view>

            <view v-if="showAccountManager" class="account-manager">
              <view class="manager-tip">点选账号作为兑换目标，可多选批量兑换</view>
              <view class="account-list">
                <view
                  v-for="(account, index) in accounts"
                  :key="account.id"
                  class="account-row"
                  :class="{ selected: isAccountSelected(account) }"
                  @click="toggleAccountSelection(account)">
                  <view class="selection-check" :class="{ checked: isAccountSelected(account) }">
                    <text v-if="isAccountSelected(account)" class="selection-check-mark">✓</text>
                  </view>
                  <view class="account-main">
                    <view class="account-line">
                      <text class="account-name">{{ getAccountDisplayName(account) }}</text>
                      <text class="server-inline">{{ getServerShortLabel(account.server) }}</text>
                      <text class="status-badge" :class="getStatusBadgeClass(account.status)">
                        {{ getStatusBadgeText(account.status) }}
                      </text>
                      <text v-if="isLoggedIn && !account.managed" class="local-badge">本地</text>
                    </view>
                    <text v-if="account.accountIdMasked || account.accountId" class="account-id-sub">
                      {{ account.accountIdMasked || account.accountId }}
                    </text>
                  </view>
                  <view class="account-action-buttons">
                    <view
                      v-if="account.status !== 'active' || !account.nickname"
                      class="mini-btn"
                      :class="{ loading: account.verifying }"
                      @click.stop="verifyAccount(index)">
                      {{ account.verifying ? '验证中' : '验证' }}
                    </view>
                    <view
                      v-if="isLoggedIn && !account.managed"
                      class="mini-btn primary"
                      :class="{ loading: account.syncing }"
                      @click.stop="syncLocalAccount(index)">
                      {{ account.syncing ? '同步中' : '同步' }}
                    </view>
                    <view class="mini-btn danger" @click.stop="removeAccount(index)">删除</view>
                  </view>
                </view>
              </view>

              <view class="add-form compact">
                <picker
                  class="server-picker add-server-picker"
                  :range="serverLabels"
                  :value="getServerIndex(newAccount.server)"
                  @change="changeNewServer($event)">
                  <view class="server-chip editable">
                    <text class="server-chip-value">{{ getServerShortLabel(newAccount.server) }}</text>
                  </view>
                </picker>
                <input
                  class="add-input"
                  type="text"
                  :placeholder="gameConfig.accountIdPlaceholder"
                  :value="newAccount.accountId"
                  @input="updateNewAccountId" />
                <view class="add-btn" :class="{ disabled: addingAccount }" @click="addAccount">
                  {{ addingAccount ? '验证中' : '验证并添加' }}
                </view>
              </view>

              <view v-if="managedAccounts.length" class="auto-row">
                <text class="auto-row-label">自动兑换托管</text>
                <switch
                  class="auto-switch compact"
                  :checked="isLoggedIn && allAutoOn"
                  color="var(--theme-brand)"
                  @change="handleAutoSwitchChange" />
              </view>
            </view>
          </view>
        </view>

        <!-- 2. 券码（默认全选，支持多选批量兑换） -->
        <view class="card checkout-card">
          <view class="step-head">
            <text class="step-index">2</text>
            <view class="step-copy">
              <text class="step-title">选择券码</text>
              <text class="step-desc">{{ codeStepDesc }}</text>
            </view>
          </view>

          <view class="code-add-row">
            <input class="code-input-lg compact" type="text" placeholder="粘贴新券码并添加" :value="codeInput" @input="updateCodeInput" />
            <view class="add-btn code-add-btn" :class="{ disabled: addingPublicCode || redeeming }" @click="addPublicCode">
              {{ addingPublicCode ? '...' : '添加' }}
            </view>
          </view>

          <view v-if="codeLoadError" class="inline-error">{{ codeLoadError }}</view>

          <view v-if="combinedCodes.length" class="quick-codes">
            <view class="quick-head">
              <text class="quick-title">已选 {{ selectedCodes.length }}/{{ combinedCodes.length }}</text>
              <view class="quick-actions">
                <text class="quick-link" @click="selectAllCodesByUser">全选</text>
                <text class="quick-link" @click="clearSelectedCodes">清空</text>
                <text class="quick-refresh" :class="{ disabled: loadingCodes }" @click="loadCodes">
                  {{ loadingCodes ? '刷新中' : '刷新' }}
                </text>
              </view>
            </view>
            <view class="quick-list">
              <view
                v-for="item in visibleCodes"
                :key="item.code"
                class="quick-chip"
                :class="{ active: isCodeSelected(item) }"
                @click="toggleCodeSelection(item)">
                <view class="selection-check code-check" :class="{ checked: isCodeSelected(item) }">
                  <text v-if="isCodeSelected(item)" class="selection-check-mark">✓</text>
                </view>
                <view class="quick-chip-main">
                  <text class="quick-code">{{ item.code }}</text>
                  <text v-if="item.reward" class="quick-reward">{{ item.reward }}</text>
                </view>
              </view>
            </view>
            <text v-if="combinedCodes.length > codePreviewLimit" class="list-toggle" @click="showAllCodes = !showAllCodes">
              {{ showAllCodes ? '收起' : `更多 ${combinedCodes.length - codePreviewLimit} 个` }}
            </text>
          </view>
          <view v-else-if="!loadingCodes" class="empty-tip soft">暂无可用券码，可先粘贴添加</view>
        </view>

        <view v-if="redeemError" class="inline-error">{{ redeemError }}</view>

        <!-- 轻量结果 -->
        <view v-if="resultGroups.length" class="card result-lite-card">
          <view class="result-lite-head">
            <text class="result-lite-title">本次结果</text>
            <text class="result-lite-summary"
              >成功 {{ resultSummary.success }} · 已用 {{ resultSummary.alreadyUsed }} · 失败 {{ resultSummary.failed }}</text
            >
          </view>
          <view v-if="failedPreviewItems.length" class="failed-preview">
            <view v-for="item in failedPreviewItems" :key="item.key" class="result-row">
              <view class="result-main">
                <text class="result-code">{{ item.code }}</text>
                <text class="result-msg">{{ item.message }}</text>
              </view>
              <text class="result-status" :class="item.status">{{ item.statusLabel }}</text>
            </view>
          </view>
          <text v-if="failedResultItems.length > failedPreviewLimit" class="result-more" @click="showAllResults = !showAllResults">
            {{ showAllResults ? '收起明细' : `查看全部失败 ${failedResultItems.length} 条` }}
          </text>
          <view v-if="showAllResults" class="result-list">
            <view v-for="(group, gi) in resultGroups" :key="group.account?.id || gi" class="result-group">
              <view class="result-head">
                <text class="result-account">{{ groupTitle(group) }}</text>
                <text class="result-count">{{ group.success }} 成功</text>
              </view>
              <view v-for="(item, ri) in group.results || []" :key="`${gi}-${item.code}-${ri}`" class="result-row">
                <view class="result-main">
                  <text class="result-code">{{ item.code }}</text>
                  <text class="result-msg">{{
                    translateCouponErrorMessage(item.message || item.reward || item.status || '已返回结果')
                  }}</text>
                </view>
                <text class="result-status" :class="item.status">{{ getStatusLabel(item.status) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 记录入口 -->
        <view v-if="isLoggedIn" class="records-entry" @click="showRecords = !showRecords">
          <text class="records-entry-title">兑换记录</text>
          <text class="records-entry-meta">{{ recordSummaryText }} · {{ showRecords ? '收起' : '查看' }}</text>
        </view>

        <view v-if="isLoggedIn && showRecords" class="card record-card">
          <view class="record-body">
            <view v-if="recordsLoading && !records.length" class="empty-tip">正在加载兑换记录…</view>
            <view v-else-if="!records.length" class="empty-tip">暂无兑换记录</view>
            <view v-for="record in visibleRecords" :key="record.id" class="record-row">
              <view class="record-main">
                <text class="record-code">{{ record.couponCode || '未知券码' }}</text>
                <text class="record-sub">{{ formatRecordServer(record.server) }} · {{ formatRecordTime(record.redeemedAt) }}</text>
              </view>
              <text class="result-status" :class="record.resultStatus">{{ getStatusLabel(record.resultStatus) }}</text>
            </view>
            <view v-if="recordTotal > recordPreviewLimit" class="record-footer">
              <text v-if="recordsExpanded" class="record-footer-action muted" @click="collapseRecords">收起</text>
              <text
                v-if="!recordsExpanded || hasMoreRecords"
                class="record-footer-action"
                :class="{ disabled: recordsLoading }"
                @click="expandOrLoadMoreRecords">
                {{ recordLoadMoreText }}
              </text>
            </view>
          </view>
        </view>

        <view class="redeem-dock">
          <view class="redeem-dock-copy">
            <text class="redeem-dock-title">{{ redeemDockTitle }}</text>
            <text class="redeem-dock-hint">{{ redeemHintText }}</text>
          </view>
          <button class="redeem-btn dock-btn" :disabled="cashierRedeemDisabled" @click="startCashierRedeem">
            {{ redeemActionText }}
          </button>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import { getGameCouponConfig } from './config'
  import type { GameCouponConfig } from './config'
  import {
    deleteGameIdAccountsAccountId,
    getGameIdAccountsAccountId,
    getGameCouponsGameIdAccounts,
    getGameCouponsGameIdCodes,
    getGameCouponsGameIdProfile,
    getGameCouponsGameIdRedeemRecords,
    postAccountsAccountIdAutoRedeem,
    postAccountsAccountIdVerify,
    postGameIdAccountsClaimGuest,
    postGameCouponsGameIdAccounts,
    postGameCouponsGameIdRedeem,
    postGameIdCodesManual,
  } from '@/services/apifox/NODEJSDEMO/GAMECOUPONS/apifox'
  import type {
    getGameCouponsGameIdAccountsResAccounts,
    getGameCouponsGameIdCodesResCodes,
    getGameCouponsGameIdProfileRes,
    getGameCouponsGameIdRedeemRecordsResResults,
    getGameIdRedeemRecordsSummaryRes,
    postGameIdAccountsClaimGuestBody,
    postGameIdAccountsClaimGuestRes,
    postGameCouponsGameIdRedeemBodyAccountsItem,
    postGameCouponsGameIdRedeemResAccountResults,
  } from '@/services/apifox/NODEJSDEMO/GAMECOUPONS/interface'
  import { checkLoginStatus } from '@/utils/autoLogin'
  import { reportToolVisit } from '@/utils/tracker'
  import { buildSwcCouponsShare } from '@/subPackages/tools/compendium/swc/share'

  type ServerValue = NonNullable<postGameCouponsGameIdRedeemBodyAccountsItem['server']>
  type AccountStatus = 'active' | 'invalid' | 'pending' | 'disabled'
  type ManagedAccountApiItem = getGameCouponsGameIdAccountsResAccounts & { accountId?: string }
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

  type ClaimGuestResponse = postGameIdAccountsClaimGuestRes & {
    claimed?: number
    duplicates?: number
    failed?: number
    total?: number
  }

  interface UniValueEvent {
    detail?: {
      value?: unknown
    }
  }

  const maxAccounts = 5
  const gameConfig = ref<GameCouponConfig>(getGameCouponConfig())
  const accounts = ref<AccountVM[]>([])
  const newAccount = ref<{ server: string; accountId: string }>({ server: 'china', accountId: '' })
  const addingAccount = ref(false)
  const showAccountManager = ref(false)
  const showRecords = ref(false)

  const remoteCodes = ref<getGameCouponsGameIdCodesResCodes[]>([])
  const codeInput = ref('')
  const selectedAccountIds = ref<string[]>([])
  const selectedCodeKeys = ref<string[]>([])
  const loadingCodes = ref(false)
  const addingPublicCode = ref(false)
  const codeLoadError = ref('')
  const showAllCodes = ref(false)
  const codePreviewLimit = 5

  const redeeming = ref(false)
  const redeemError = ref('')
  const redeemSummary = ref<getGameIdRedeemRecordsSummaryRes | null>(null)
  const resultGroups = ref<postGameCouponsGameIdRedeemResAccountResults[]>([])
  const showAllResults = ref(false)
  const failedPreviewLimit = 3

  const records = ref<getGameCouponsGameIdRedeemRecordsResResults[]>([])
  const recordsLoading = ref(false)
  const recordsExpanded = ref(false)
  const recordPage = ref(1)
  const recordTotal = ref(0)
  const recordTotalPages = ref(0)
  const recordPreviewLimit = 5

  const isLoggedIn = ref(false)
  const initialized = ref(false)
  const claimingGuestAccounts = ref(false)
  let guestClaimPrompted = false

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

  const selectedAccounts = computed(() => validAccounts.value.filter(account => selectedAccountIds.value.includes(account.id)))

  const primaryAccount = computed(() => selectedAccounts.value[0] || validAccounts.value[0] || null)

  const selectedCodes = computed(() => combinedCodes.value.filter(item => selectedCodeKeys.value.includes(getCodeKey(item))))

  const visibleCodes = computed(() => (showAllCodes.value ? combinedCodes.value : combinedCodes.value.slice(0, codePreviewLimit)))

  const hasRedeemableCodes = computed(() => selectedCodes.value.length > 0 || Boolean(codeInput.value.trim()))

  const cashierRedeemDisabled = computed(() => {
    if (redeeming.value) return true
    if (!selectedAccounts.value.length) return true
    return !hasRedeemableCodes.value
  })

  const accountStepDesc = computed(() => {
    if (!validAccounts.value.length) return '新用户先添加一个账号'
    if (selectedAccounts.value.length > 1) return `将批量兑到 ${selectedAccounts.value.length} 个账号`
    return '默认当前账号；管理里可多选批量兑'
  })

  const codeStepDesc = computed(() => {
    if (!combinedCodes.value.length) return '可用券码加载后会默认全选'
    return `可用券码默认全选，可取消勾选 · 已选 ${selectedCodes.value.length} 个`
  })

  const managedAccounts = computed(() => accounts.value.filter(account => account.managed))

  const allAutoOn = computed(() => managedAccounts.value.length > 0 && managedAccounts.value.every(account => account.autoRedeemEnabled))

  const visibleRecords = computed(() => (recordsExpanded.value ? records.value : records.value.slice(0, recordPreviewLimit)))

  const hasMoreRecords = computed(() => recordPage.value < recordTotalPages.value)

  const recordSummaryText = computed(() => {
    if (recordsLoading.value && !records.value.length) return '正在加载最近记录'
    if (!recordTotal.value) return '最近 5 条'
    return `最近 5 条 · 共 ${recordTotal.value} 条`
  })

  const recordLoadMoreText = computed(() => {
    if (recordsLoading.value) return '加载中…'
    if (!recordsExpanded.value) return `查看更多（${recordTotal.value - recordPreviewLimit}）`
    return '加载更多'
  })

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
          message: translateCouponErrorMessage(item.message || item.reward || item.status || '兑换失败'),
          status: String(item.status || 'failed'),
          statusLabel: getStatusLabel(item.status),
        })),
    ),
  )

  const failedPreviewItems = computed(() => failedResultItems.value.slice(0, failedPreviewLimit))

  const redeemActionText = computed(() => {
    if (redeeming.value) return '兑换中…'
    if (!validAccounts.value.length) return '先添加账号'
    if (!hasRedeemableCodes.value) return '选择券码'
    return '兑换'
  })

  const redeemDockTitle = computed(() => {
    if (!validAccounts.value.length) return '添加账号后开始'
    if (!selectedAccounts.value.length) return '请选择账号'
    const codeCount = Math.max(selectedCodes.value.length, codeInput.value.trim() ? 1 : 0)
    // 若有输入且未在已选列表中，总数按合并后估算
    const input = codeInput.value.trim().toUpperCase()
    const mergedCount = selectedCodes.value.length + (input && !selectedCodes.value.some(item => getCodeKey(item) === input) ? 1 : 0)
    if (!mergedCount) return '请选择或添加券码'
    return `${selectedAccounts.value.length} 个账号 · ${mergedCount} 个券码`
  })

  const redeemHintText = computed(() => {
    if (!validAccounts.value.length) return '新用户请先完成账号添加'
    if (!selectedAccounts.value.length) return '在账号管理里点选目标账号'
    if (!hasRedeemableCodes.value) return '可用券码默认全选，也可粘贴添加'
    return '将按「账号 × 券码」批量提交兑换'
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

  function getAccountDisplayName(account?: AccountVM | null) {
    if (!account) return gameConfig.value.accountIdEmptyText
    return account.nickname || account.accountIdMasked || account.accountId || gameConfig.value.accountIdEmptyText
  }

  /** 账号右侧校验状态徽标文案：active=已校验，invalid=无效，其余=未校验 */
  function getStatusBadgeText(status?: string) {
    if (status === 'active') return '已校验'
    if (status === 'invalid') return '无效'
    if (status === 'pending') return '待验证'
    if (status === 'disabled') return '已停用'
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
    // 批量兑换场景：默认全选账号
    selectedAccountIds.value = validAccounts.value.map(account => account.id)
  }

  function selectAllCodes() {
    selectedCodeKeys.value = combinedCodes.value.map(item => getCodeKey(item))
  }

  function selectAllCodesByUser() {
    selectAllCodes()
  }

  function isAccountSelected(account: AccountVM) {
    return selectedAccountIds.value.includes(account.id)
  }

  function isCodeSelected(item: getGameCouponsGameIdCodesResCodes) {
    return selectedCodeKeys.value.includes(getCodeKey(item))
  }

  function toggleAccountSelection(account: AccountVM) {
    if (!account.managed && !account.accountId.trim()) return
    const selected = new Set(selectedAccountIds.value)
    if (selected.has(account.id)) selected.delete(account.id)
    else selected.add(account.id)
    selectedAccountIds.value = validAccounts.value.map(item => item.id).filter(id => selected.has(id))
  }

  function normalizeAccountSelections() {
    const ids = validAccounts.value.map(account => account.id)
    selectedAccountIds.value = ids.filter(id => selectedAccountIds.value.includes(id))
    if (ids.length && !selectedAccountIds.value.length) {
      selectedAccountIds.value = [...ids]
    }
  }

  function clearSelectedCodes() {
    selectedCodeKeys.value = []
  }

  function buildCodesToRedeem(): getGameCouponsGameIdCodesResCodes[] {
    const map = new Map<string, getGameCouponsGameIdCodesResCodes>()
    selectedCodes.value.forEach(item => {
      const key = getCodeKey(item)
      if (key) map.set(key, { ...item, code: key })
    })
    const input = codeInput.value.trim().toUpperCase()
    if (input && !map.has(input)) {
      map.set(input, { code: input, source: 'manual' })
    }
    return Array.from(map.values())
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

  function getEventValue(event: UniValueEvent) {
    return String(event.detail?.value || '')
  }

  function updateNewAccountId(event: UniValueEvent) {
    newAccount.value.accountId = getEventValue(event).trim()
  }

  function updateCodeInput(event: UniValueEvent) {
    codeInput.value = getEventValue(event).toUpperCase()
  }

  /* ----------------------------- 登录跳转 ----------------------------- */

  function buildCurrentPageUrl() {
    const params = [
      `gameId=${encodeURIComponent(gameConfig.value.gameId)}`,
      `compendiumId=${encodeURIComponent(gameConfig.value.compendiumId)}`,
    ]
    return `/subPackages/tools/game-coupons/index?${params.join('&')}`
  }

  function buildShareQuery() {
    return {
      gameId: gameConfig.value.gameId,
      compendiumId: gameConfig.value.compendiumId,
    }
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
        accounts.value
          .filter(item => !item.managed)
          .map(item => ({
            id: item.id,
            server: item.server,
            accountId: item.accountId,
            nickname: item.nickname,
            status: item.status,
          })),
      )
    } catch {
      /* 缓存失败不阻断 */
    }
  }

  function persistLocalAccount(account: AccountVM) {
    if (account.managed) return
    try {
      const stored = uni.getStorageSync(getStorageKey())
      const list = Array.isArray(stored) ? stored : []
      const snapshot = {
        id: account.id,
        server: account.server,
        accountId: account.accountId,
        nickname: account.nickname,
        status: account.status,
      }
      const hasStoredAccount = list.some(item => item && item.id === account.id)
      uni.setStorageSync(
        getStorageKey(),
        hasStoredAccount ? list.map(item => (item && item.id === account.id ? snapshot : item)) : [...list, snapshot],
      )
    } catch {
      /* 单个本地账号缓存失败不阻断 */
    }
  }

  function normalizeStoredAccountStatus(status: unknown): AccountStatus | undefined {
    if (status === 'active' || status === 'invalid' || status === 'pending' || status === 'disabled') return status
    return undefined
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
          status: normalizeStoredAccountStatus(item.status),
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

  async function loadManagedAccounts(): Promise<AccountVM[] | null> {
    try {
      const res = await getGameCouponsGameIdAccounts(gameConfig.value.gameId, {
        compendium_id: gameConfig.value.compendiumId,
      })
      const managed: AccountVM[] = (res.accounts || []).map(rawItem => {
        const item = rawItem as ManagedAccountApiItem
        return {
          id: String(item.id || ''),
          managed: true,
          server: item.server || getDefaultServer(),
          accountId: typeof item.accountId === 'string' ? item.accountId.trim() : '',
          accountIdMasked: item.accountIdMasked,
          accountLabel: item.accountLabel,
          nickname: item.nickname,
          status: item.status,
          autoRedeemEnabled: item.autoRedeemEnabled,
        }
      })
      // 保留登录前的本地缓存；与托管账号重复时只隐藏本地副本，退出登录后仍可继续使用。
      const locals = parseStoredAccounts().filter(item => item.accountId.trim().length > 0)
      const managedKeys = new Set(managed.flatMap(getAccountMatchKeys))
      const visibleLocals = locals.filter(local => !getAccountMatchKeys(local).some(key => managedKeys.has(key)))
      accounts.value = [...managed, ...visibleLocals]
      selectDefaultAccounts()
      return managed
    } catch (err) {
      toast(errMsg(err, '获取托管账号失败'))
      return null
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

  function maskAccountId(accountId: string): string {
    const value = accountId.trim()
    if (!value) return ''
    if (value.length <= 4) return `${value[0] || ''}***`
    return `${value.slice(0, 3)}****${value.slice(-3)}`
  }

  function getAccountMatchKeys(account: AccountVM): string[] {
    const server = account.server.trim().toLowerCase()
    const keys: string[] = []
    const accountId = account.accountId.trim().toLowerCase()
    const masked = account.accountIdMasked?.trim()
    if (accountId) keys.push(`${server}:plain:${accountId}`, `${server}:masked:${maskAccountId(accountId)}`)
    if (masked) keys.push(`${server}:masked:${masked}`)
    return keys.filter(Boolean)
  }

  function findUnclaimedGuestAccounts(managed: AccountVM[]): AccountVM[] {
    const managedKeys = new Set(managed.flatMap(getAccountMatchKeys))
    return parseStoredAccounts()
      .filter(account => account.accountId.trim().length > 0)
      .filter(account => !getAccountMatchKeys(account).some(key => managedKeys.has(key)))
  }

  function confirmGuestAccountClaim(accountsToClaim: AccountVM[]): Promise<boolean> {
    const preview = accountsToClaim
      .slice(0, 3)
      .map(account => `${getServerShortLabel(account.server)} ${account.accountId}`)
      .join('、')
    const suffix = accountsToClaim.length > 3 ? ` 等 ${accountsToClaim.length} 个账号` : ''

    return new Promise(resolve => {
      uni.showModal({
        title: '检测到游客账号',
        content: `发现未同步到当前登录账号的游客数据：${preview}${suffix}，是否同步？`,
        confirmText: '同步',
        cancelText: '暂不',
        success: result => resolve(result.confirm),
        fail: () => resolve(false),
      })
    })
  }

  async function claimGuestAccounts(accountsToClaim: AccountVM[]) {
    if (!accountsToClaim.length || claimingGuestAccounts.value) return
    claimingGuestAccounts.value = true
    try {
      const body: postGameIdAccountsClaimGuestBody = {
        accounts: accountsToClaim.map(account => ({
          accountId: account.accountId.trim(),
          accountLabel: account.accountLabel || '',
          server: account.server as ServerValue,
        })),
      }
      const response = (await postGameIdAccountsClaimGuest(
        gameConfig.value.gameId,
        { compendium_id: gameConfig.value.compendiumId },
        body,
      )) as ClaimGuestResponse

      await loadManagedAccounts()
      const claimed = Number(response.claimed) || 0
      const duplicates = Number(response.duplicates) || 0
      const failed = Number(response.failed) || 0
      if (claimed > 0) {
        toast(`已同步 ${claimed} 个游客账号${failed ? `，${failed} 个失败` : ''}`)
      } else if (duplicates > 0 && !failed) {
        toast('游客账号已存在，无需重复同步')
      } else {
        toast(failed ? `同步失败 ${failed} 个账号` : '没有可同步的游客账号')
      }
    } catch (err) {
      toast(errMsg(err, '游客账号同步失败'))
    } finally {
      claimingGuestAccounts.value = false
    }
  }

  async function maybeClaimGuestAccounts(managed: AccountVM[]) {
    if (guestClaimPrompted || !isLoggedIn.value || claimingGuestAccounts.value) return
    const accountsToClaim = findUnclaimedGuestAccounts(managed)
    if (!accountsToClaim.length) return

    guestClaimPrompted = true
    if (await confirmGuestAccountClaim(accountsToClaim)) {
      await claimGuestAccounts(accountsToClaim)
    }
  }

  /** 进入登录态：加载云端账号，确认后批量认领游客账号，再加载统计 */
  async function enterLoggedInMode() {
    const managed = await loadManagedAccounts()
    if (!managed) return
    await maybeClaimGuestAccounts(managed)
    loadRecords(true)
  }

  function changeNewServer(event: { detail: { value: number | string } }) {
    const idx = Number(event.detail.value)
    newAccount.value.server = gameConfig.value.servers[idx]?.value || getDefaultServer()
  }

  function hasAccount(server: string, accountId: string) {
    const normalizedServer = server.trim().toLowerCase()
    const normalizedAccountId = accountId.trim().toLowerCase()
    const maskedAccountId = maskAccountId(accountId)
    return accounts.value.some(account => {
      if (account.server.trim().toLowerCase() !== normalizedServer) return false
      return account.accountId.trim().toLowerCase() === normalizedAccountId || account.accountIdMasked?.trim() === maskedAccountId
    })
  }

  function confirmAccountBinding(profile: getGameCouponsGameIdProfileRes, accountId: string, server: string): Promise<boolean> {
    const nickname = profile.nickname?.trim() || ''
    const serverLabel = profile.serverName?.trim() || getServerShortLabel(profile.server || server)
    return new Promise(resolve => {
      uni.showModal({
        title: '确认游戏账号',
        content: `游戏昵称：${nickname}\n区服：${serverLabel}\n${gameConfig.value.accountIdLabel}：${accountId}`,
        confirmText: '确认绑定',
        cancelText: '返回修改',
        success: result => resolve(result.confirm),
        fail: () => resolve(false),
      })
    })
  }

  async function addAccount() {
    if (addingAccount.value) return
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

    if (hasAccount(server, accountId)) {
      toast('该游戏账号已添加')
      return
    }

    addingAccount.value = true
    try {
      const profile = await getGameCouponsGameIdProfile(gameConfig.value.gameId, {
        account_id: accountId,
        server,
        compendium_id: gameConfig.value.compendiumId,
      })
      const nickname = profile.nickname?.trim() || ''
      if (!profile.available || !nickname) {
        toast(translateCouponErrorMessage(profile.message || '未获取到游戏昵称，请检查账号和区服'))
        return
      }
      if (!(await confirmAccountBinding(profile, accountId, server))) return

      if (isLoggedIn.value) {
        await postGameCouponsGameIdAccounts(
          gameConfig.value.gameId,
          { compendium_id: gameConfig.value.compendiumId },
          { account_id: accountId, server: server as ServerValue },
        )
        await loadManagedAccounts()
      } else {
        const account: AccountVM = { id: localId(), managed: false, server, accountId, nickname, status: 'active' }
        accounts.value.push(account)
        selectedAccountIds.value = Array.from(new Set([...selectedAccountIds.value, account.id]))
        saveLocalAccounts()
      }
      newAccount.value.accountId = ''
      toast(`已绑定：${nickname}`)
    } catch (err) {
      toast(errMsg(err, '账号验证或绑定失败'))
    } finally {
      addingAccount.value = false
    }
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
        await deleteGameIdAccountsAccountId({ gameId: gameConfig.value.gameId, accountId: account.id })
        accounts.value.splice(index, 1)
        selectedAccountIds.value = selectedAccountIds.value.filter(id => id !== account.id)
        normalizeAccountSelections()
        toast('已删除')
      } catch (err) {
        toast(errMsg(err, '删除失败'))
      }
      return
    }

    accounts.value.splice(index, 1)
    selectedAccountIds.value = selectedAccountIds.value.filter(id => id !== account.id)
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
      const detail = await getGameIdAccountsAccountId({ gameId: gameConfig.value.gameId, accountId: account.id })
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
        await postAccountsAccountIdVerify({ gameId: gameConfig.value.gameId, accountId: account.id })
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
        const nickname = res.nickname?.trim() || ''
        account.nickname = nickname || undefined
        account.status = res.available && nickname ? 'active' : 'invalid'
        toast(
          res.available && nickname
            ? `验证成功：${nickname}`
            : translateCouponErrorMessage(res.message || '未获取到游戏昵称，请检查账号和区服'),
        )
        persistLocalAccount(account)
      }
    } catch (err) {
      account.status = 'pending'
      toast(errMsg(err, '验证失败'))
      persistLocalAccount(account)
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
          postAccountsAccountIdAutoRedeem({ gameId: gameConfig.value.gameId, accountId: account.id }, { enabled: next }),
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

  function handleAutoSwitchChange(event: UniValueEvent) {
    if (!isLoggedIn.value) {
      toast('登录后可开启自动兑换托管')
      return
    }
    const target = Boolean(event.detail?.value)
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
    if (addingPublicCode.value || redeeming.value) return

    const code = codeInput.value.trim().toUpperCase()
    if (!code) {
      toast('请输入要添加的券码')
      return
    }
    if (combinedCodes.value.some(item => getCodeKey(item) === code)) {
      selectedCodeKeys.value = Array.from(new Set([...selectedCodeKeys.value, code]))
      toast('券码已存在，已帮你勾选')
      return
    }

    // 游客：仅加入本次本地列表并勾选，不写公共库
    if (!isLoggedIn.value) {
      remoteCodes.value = [...remoteCodes.value, { code, source: 'manual' }]
      selectedCodeKeys.value = Array.from(new Set([...selectedCodeKeys.value, code]))
      codeInput.value = ''
      showAllCodes.value = true
      toast('已加入本次兑换列表')
      return
    }

    addingPublicCode.value = true
    codeLoadError.value = ''
    try {
      await postGameIdCodesManual(gameConfig.value.gameId, { compendium_id: gameConfig.value.compendiumId }, { code, source: 'manual' })
      codeInput.value = ''
      try {
        await loadCodes()
      } catch {
        /* loadCodes 内部已记录错误，这里不把刷新失败误判为添加失败 */
      }
      if (!combinedCodes.value.some(item => getCodeKey(item) === code)) {
        remoteCodes.value = [...remoteCodes.value, { code, source: 'manual' }]
      }
      selectedCodeKeys.value = Array.from(new Set([...selectedCodeKeys.value, code]))
      showAllCodes.value = true
      toast('已添加并勾选')
    } catch (err) {
      toast(errMsg(err, '券码添加失败'))
    } finally {
      addingPublicCode.value = false
    }
  }

  async function startCashierRedeem() {
    if (redeeming.value) return
    if (!validAccounts.value.length) {
      showAccountManager.value = true
      redeemError.value = `请先添加一个${gameConfig.value.accountIdLabel}`
      toast(redeemError.value)
      return
    }
    if (!selectedAccounts.value.length) {
      showAccountManager.value = true
      redeemError.value = '请选择要兑换的账号'
      toast(redeemError.value)
      return
    }
    const codesToRedeem = buildCodesToRedeem()
    if (!codesToRedeem.length) {
      redeemError.value = '请选择券码，或粘贴后点添加'
      toast(redeemError.value)
      return
    }

    redeeming.value = true
    redeemError.value = ''
    try {
      const result = await redeemAccountsAndCodes(selectedAccounts.value, codesToRedeem)
      if (result.failed === 0) {
        codeInput.value = ''
      }
    } catch (err) {
      redeemError.value = errMsg(err, '兑换请求失败')
      toast(redeemError.value)
    } finally {
      redeeming.value = false
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
        loadRecords(true)
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

  /* ----------------------------- 记录与统计 ----------------------------- */

  async function loadRecords(reset = false) {
    if (recordsLoading.value) return
    if (reset) {
      recordPage.value = 1
      recordTotalPages.value = 0
      recordTotal.value = 0
    }
    const requestedPage = recordPage.value
    recordsLoading.value = true
    try {
      const res = await getGameCouponsGameIdRedeemRecords(gameConfig.value.gameId, {
        compendium_id: gameConfig.value.compendiumId,
        limit: recordPreviewLimit,
        page: recordPage.value,
        sortBy: 'redeemedAt:desc',
      })
      const nextRecords = res.results || []
      records.value = reset ? nextRecords : [...records.value, ...nextRecords]
      recordTotal.value = res.totalResults || records.value.length
      recordTotalPages.value = res.totalPages || 1
    } catch (err) {
      if (!reset && requestedPage > 1) recordPage.value = requestedPage - 1
      toast(errMsg(err, '获取记录失败'))
    } finally {
      recordsLoading.value = false
    }
  }

  async function expandOrLoadMoreRecords() {
    if (recordsLoading.value) return
    recordsExpanded.value = true
    if (!hasMoreRecords.value) return
    recordPage.value += 1
    await loadRecords()
  }

  function collapseRecords() {
    recordsExpanded.value = false
  }

  function getRecordReward(record: getGameCouponsGameIdRedeemRecordsResResults) {
    if (record.reward) return record.reward
    const couponCode = String(record.couponCode || '').toUpperCase()
    return combinedCodes.value.find(item => getCodeKey(item) === couponCode)?.reward || ''
  }

  function getRecordReason(record: getGameCouponsGameIdRedeemRecordsResResults) {
    if (record.resultStatus === 'success') return ''
    return translateCouponErrorMessage(record.resultMessage || record.resultStatus)
  }

  function formatRecordServer(server?: string) {
    return server ? getServerShortLabel(server) : '区服未知'
  }

  function formatRecordTime(value?: string) {
    if (!value) return '时间未知'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    const pad = (part: number) => String(part).padStart(2, '0')
    const now = new Date()
    const sameYear = date.getFullYear() === now.getFullYear()
    const datePart = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`
    return sameYear ? `${datePart} ${timePart}` : `${date.getFullYear()}-${datePart} ${timePart}`
  }

  /* ----------------------------- 错误处理 ----------------------------- */

  function errMsg(err: unknown, fallback: string) {
    if (typeof err === 'string') return translateCouponErrorMessage(err)
    if (err instanceof Error) return translateCouponErrorMessage(err.message)
    if (err && typeof err === 'object' && 'message' in err)
      return translateCouponErrorMessage(String((err as { message: unknown }).message))
    return fallback
  }

  function translateCouponErrorMessage(message?: unknown): string {
    const raw = String(message || '').trim()
    if (!raw) return '兑换失败'
    const normalized = raw.toLowerCase().replace(/[_-]+/g, ' ')
    const compact = normalized.replace(/\s+/g, ' ')
    const exactMap: Record<string, string> = {
      success: '兑换成功',
      already_used: '该券码已使用',
      'already used': '该券码已使用',
      invalid_coupon: '券码无效或已过期',
      'invalid coupon': '券码无效或已过期',
      invalid_id: '账号 ID 无效',
      'invalid id': '账号 ID 无效',
      failed: '兑换失败',
      pending: '等待兑换',
      redeeming: '兑换中',
      'coupon already used': '该券码已使用',
      'coupon expired': '券码已过期',
      'coupon not found': '券码不存在',
      'invalid account': '账号无效',
      'invalid hive id': 'Hive ID 无效',
      'account not found': '账号不存在',
      'server error': '服务器异常，请稍后重试',
      'network error': '网络异常，请稍后重试',
      unauthorized: '登录已过期，请重新登录',
      forbidden: '无权执行该操作',
    }
    if (exactMap[raw] || exactMap[compact]) return exactMap[raw] || exactMap[compact]
    if (/already.*used|used.*coupon/.test(compact)) return '该券码已使用'
    if (/invalid.*coupon|coupon.*invalid/.test(compact)) return '券码无效或已过期'
    if (/expired/.test(compact)) return '券码已过期'
    if (/not found|not exist/.test(compact)) return '券码或账号不存在'
    if (/invalid.*(id|account|hive)/.test(compact)) return '账号 ID 无效'
    if (/timeout|timed out/.test(compact)) return '请求超时，请稍后重试'
    if (/network|fetch/.test(compact)) return '网络异常，请稍后重试'
    if (/server|internal/.test(compact)) return '服务器异常，请稍后重试'
    return raw
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
    loadCodes()
    if (isLoggedIn.value) {
      enterLoggedInMode()
    } else {
      loadLocalAccounts()
    }
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
      loadCodes()
    }
  })

  onMounted(() => {
    initializePage()
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => buildSwcCouponsShare(buildShareQuery()).app)
  onShareTimeline(() => buildSwcCouponsShare(buildShareQuery()).timeline)
  // #endif
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
    position: relative;
    min-height: 100vh;
    padding: 24rpx 24rpx 220rpx;
    background: $page-bg;
    box-sizing: border-box;
  }

  .checkout-card {
    padding: 24rpx;
  }

  .step-head {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin-bottom: 20rpx;
  }

  .step-index {
    width: 40rpx;
    height: 40rpx;
    border-radius: 12rpx;
    background: rgba(79, 110, 242, 0.12);
    color: $accent;
    font-size: 24rpx;
    font-weight: 700;
    line-height: 40rpx;
    text-align: center;
    flex-shrink: 0;
  }

  .step-copy {
    min-width: 0;
    flex: 1;
  }

  .step-title {
    display: block;
    font-size: 30rpx;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.3;
  }

  .step-desc {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: $text-hint;
    line-height: 1.4;
  }

  .local-mode-tip {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 16rpx;
    padding: 12rpx 16rpx;
    border: 1rpx solid $border;
    border-radius: 12rpx;
    font-size: 22rpx;
    line-height: 1.45;
    color: $text-secondary;
    background: $field-bg;
  }

  .local-mode-tip__copy {
    min-width: 0;
    flex: 1;
  }

  .local-mode-tip__title,
  .local-mode-tip__desc {
    display: block;
  }

  .local-mode-tip__title {
    color: $text-primary;
    font-size: 24rpx;
    font-weight: 600;
  }

  .local-mode-tip__desc {
    margin-top: 4rpx;
    color: $text-secondary;
    font-size: 22rpx;
    line-height: 1.45;
  }

  .local-mode-login {
    flex: 0 0 112rpx;
    width: 112rpx;
    height: 60rpx;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 12rpx;
    background: $accent;
    color: #fff;
    font-size: 24rpx;
    line-height: 60rpx;
  }

  .local-mode-login::after {
    border: 0;
  }

  .onboarding-panel {
    padding: 8rpx 0 0;
  }

  .onboarding-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
  }

  .onboarding-desc {
    display: block;
    margin: 8rpx 0 18rpx;
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.45;
  }

  .current-account {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    padding: 20rpx 18rpx;
    border-radius: 14rpx;
    background: $field-bg;
    border: 1rpx solid $border;
  }

  .current-account-main {
    min-width: 0;
    flex: 1;
  }

  .current-account-name {
    display: block;
    font-size: 30rpx;
    font-weight: 700;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .current-account-meta {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-hint;
  }

  .current-account-action {
    flex-shrink: 0;
    font-size: 24rpx;
    font-weight: 600;
    color: $accent;
  }

  .account-manager {
    margin-top: 16rpx;
  }

  .manager-tip {
    margin-bottom: 12rpx;
    font-size: 22rpx;
    color: $text-hint;
  }

  .server-inline {
    margin-left: 8rpx;
    font-size: 22rpx;
    color: $text-hint;
    font-weight: 500;
  }

  .add-form.compact {
    margin-top: 16rpx;
  }

  .auto-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16rpx;
    padding-top: 12rpx;
    border-top: 1rpx solid $border;
  }

  .auto-row-label {
    font-size: 24rpx;
    color: $text-secondary;
  }

  .code-add-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .code-input-lg.compact {
    height: 80rpx;
    font-size: 28rpx;
  }

  .code-add-btn {
    flex-shrink: 0;
    // min-width: 120rpx;
    height: 80rpx;
    line-height: 80rpx;
  }

  .quick-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .quick-link {
    font-size: 22rpx;
    color: $accent;
  }

  .quick-chip {
    display: flex;
    align-items: center;
    gap: 14rpx;

    &.disabled {
      opacity: 0.55;
      pointer-events: none;
    }
  }

  .current-account.disabled,
  .account-row.disabled,
  .add-form.disabled,
  .code-add-row.disabled,
  .quick-link.disabled {
    opacity: 0.55;
    pointer-events: none;
  }

  .mini-btn.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .quick-chip-main {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
  }

  .code-check {
    width: 34rpx;
    height: 34rpx;
    border-radius: 10rpx;
  }

  .code-input-lg {
    width: 100%;
    height: 88rpx;
    padding: 0 24rpx;
    box-sizing: border-box;
    font-size: 30rpx;
    font-weight: 600;
    letter-spacing: 1rpx;
    color: $text-primary;
    background: $field-bg;
    border-radius: 16rpx;
    border: 1rpx solid $border;
  }

  .quick-codes {
    margin-top: 18rpx;
  }

  .quick-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;
  }

  .quick-title {
    font-size: 24rpx;
    font-weight: 600;
    color: $text-secondary;
  }

  .quick-refresh {
    font-size: 22rpx;
    color: $accent;

    &.disabled {
      opacity: 0.5;
    }
  }

  .quick-list {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .quick-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    padding: 16rpx 18rpx;
    border-radius: 12rpx;
    background: $field-bg;
    border: 1rpx solid transparent;

    &.active {
      border-color: rgba(79, 110, 242, 0.45);
      background: rgba(79, 110, 242, 0.08);
    }
  }

  .quick-code {
    font-size: 26rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .quick-reward {
    max-width: 45%;
    font-size: 22rpx;
    color: $text-hint;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-tip.soft {
    margin-top: 14rpx;
  }

  .result-lite-card {
    padding: 20rpx;
  }

  .result-lite-head {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    margin-bottom: 12rpx;
  }

  .result-lite-title {
    font-size: 27rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .result-lite-summary {
    font-size: 22rpx;
    color: $text-hint;
  }

  .records-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8rpx 0 16rpx;
    padding: 18rpx 8rpx;
  }

  .records-entry-title {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
  }

  .records-entry-meta {
    font-size: 22rpx;
    color: $text-hint;
  }

  /* 卡片 */
  .card {
    margin-bottom: 16rpx;
    padding: 20rpx;
    background: $card-bg;
    border-radius: 14rpx;
    border: 1rpx solid $border;
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 14rpx;
  }

  .card-title {
    display: block;
    font-size: 27rpx;
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
    flex-shrink: 0;
    font-size: 24rpx;
    color: $accent;

    &.disabled {
      opacity: 0.5;
    }
  }

  .account-card .card-head {
    align-items: flex-start;
  }

  .account-head-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-shrink: 0;
  }

  .auto-inline {
    display: flex;
    align-items: center;
    gap: 6rpx;
    color: $text-secondary;
  }

  .auto-inline-label {
    font-size: 22rpx;
    color: $text-secondary;
  }

  .auto-switch.compact {
    transform: scale(0.72);
    transform-origin: right center;
  }

  .account-chip-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .account-chip-row {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 12rpx;
    min-width: 100%;
  }

  .account-chip {
    display: flex;
    align-items: center;
    max-width: 100%;
    min-height: 58rpx;
    padding: 0 18rpx;
    color: $text-secondary;
    background: $field-bg;
    border: 1rpx solid $border;
    border-radius: 999rpx;
    box-sizing: border-box;

    &.selected {
      color: $accent;
      border-color: rgba(79, 110, 242, 0.42);
      background: rgba(79, 110, 242, 0.08);
    }
  }

  .account-chip-name {
    max-width: 330rpx;
    min-width: 0;
    font-size: 25rpx;
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .account-chip-server {
    flex-shrink: 0;
    margin-left: 10rpx;
    padding-left: 10rpx;
    font-size: 22rpx;
    color: inherit;
    opacity: 0.72;
    border-left: 1rpx solid rgba(148, 163, 184, 0.6);
  }

  .account-manager,
  .code-manager {
    margin-top: 18rpx;
    padding-top: 18rpx;
    border-top: 1rpx solid $border;
  }

  .manager-note {
    margin-bottom: 14rpx;
    font-size: 23rpx;
    line-height: 1.45;
    color: $text-hint;
  }

  .manager-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 14rpx;
  }

  .manager-line-text {
    flex: 1;
    min-width: 0;
    font-size: 23rpx;
    color: $text-hint;
  }

  .empty-tip {
    padding: 20rpx 0;
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

  .account-manager .add-form {
    margin-top: 0;
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

  .code-input-panel {
    margin-bottom: 14rpx;
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

  .batch-add-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
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

  .manual-add,
  .manual-once {
    flex-shrink: 0;
    min-width: 96rpx;
    height: 64rpx;
    padding: 0 16rpx;
    line-height: 64rpx;
    font-size: 23rpx;
    font-weight: 600;
    text-align: center;
    border-radius: 12rpx;

    &.disabled {
      opacity: 0.6;
    }
  }

  .manual-add {
    color: #fff;
    background: $accent;
    box-shadow: 0 8rpx 18rpx rgba(79, 110, 242, 0.16);
  }

  .manual-once {
    color: $accent;
    background: rgba(79, 110, 242, 0.1);
    border: 1rpx solid rgba(79, 110, 242, 0.18);
  }

  .mode-tip {
    padding: 8rpx 12rpx;
    font-size: 22rpx;
    line-height: 1.45;
    color: $text-hint;
    background: $field-bg;
    border-radius: 12rpx;
  }

  .code-list {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    margin-top: 14rpx;
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

  .list-toggle {
    display: block;
    padding: 18rpx 0 2rpx;
    font-size: 24rpx;
    color: $accent;
    text-align: center;
  }

  .public-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    margin-bottom: 0;
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
    padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
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
    flex: 0 0 212rpx;
    width: 212rpx;
    height: 76rpx;
    line-height: 76rpx;
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
  .record-card-head {
    align-items: center;
  }

  .record-detail-switch {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 4rpx;
  }

  .record-detail-label {
    font-size: 22rpx;
    color: $text-secondary;
  }

  .record-switch {
    transform: scale(0.72);
    transform-origin: right center;
  }

  .record-body {
    margin-top: 4rpx;
  }

  .record-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    min-height: 86rpx;
    padding: 14rpx 0;
    border-top: 1rpx solid $border;

    &.detailed {
      display: block;
      min-height: 0;
      padding: 20rpx 0;
    }
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

  .record-detail-head,
  .record-code-line,
  .record-detail-line,
  .record-footer {
    display: flex;
    align-items: center;
  }

  .record-detail-head,
  .record-code-line {
    justify-content: space-between;
    gap: 18rpx;
  }

  .record-status-title {
    font-size: 24rpx;
    font-weight: 600;
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

  .record-time,
  .record-server {
    flex-shrink: 0;
    font-size: 22rpx;
    color: $text-hint;
  }

  .record-code-line {
    margin-top: 10rpx;
  }

  .record-code-line .record-code {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .record-detail-line {
    align-items: flex-start;
    gap: 16rpx;
    margin-top: 10rpx;
    font-size: 23rpx;
    line-height: 1.5;
  }

  .record-detail-key {
    flex-shrink: 0;
    width: 96rpx;
    color: $text-hint;
  }

  .record-detail-value {
    flex: 1;
    min-width: 0;
    color: $text-secondary;
    overflow-wrap: anywhere;

    &.reason {
      color: $error;
    }
  }

  .record-footer {
    justify-content: center;
    gap: 32rpx;
    padding-top: 18rpx;
    border-top: 1rpx solid $border;
  }

  .record-footer-action,
  .record-footer-done {
    font-size: 24rpx;
  }

  .record-footer-action {
    color: $accent;

    &.muted {
      color: $text-secondary;
    }

    &.disabled {
      opacity: 0.56;
    }
  }

  .record-footer-done {
    color: $text-hint;
  }
</style>
