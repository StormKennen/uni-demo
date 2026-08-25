<template>
  <PageLayout
    title=""
    :share-title="detailShare.app.title"
    :share-path="detailShare.app.path"
    :share-image-url="detailShare.app.imageUrl"
    :share-timeline-query="detailShare.timeline.query"
    :share-timeline-title="detailShare.timeline.title"
    :back-fallback="couponManagementPath"
    nav-bg-color="transparent"
    nav-init-bg-color="transparent"
    nav-custom-class="light"
    nav-overlay>
    <view class="detail-page">
      <view v-if="pageState === 'loading'" class="poster-stack loading-poster-stack">
        <image class="hero-poster loading-hero-poster" :src="gameConfig.detailPoster.heroImage" mode="widthFix" />
        <view class="coupon-poster loading-coupon-poster">
          <image class="coupon-poster-bg" :src="gameConfig.detailPoster.contentBackground" mode="scaleToFill" />
          <view class="poster-interaction loading-poster-interaction">
            <view class="loading-card">
              <view class="loading-spinner">…</view>
              <text class="loading-title">正在加载兑换券</text>
              <text class="loading-desc">请稍候</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!coupon" class="state-card">
        <text class="state-icon">!</text>
        <text class="state-title">{{ loadError || '兑换券不存在或已经下架' }}</text>
        <button v-if="loadError && couponId" class="secondary-btn" @click="loadCouponDetail">重新加载</button>
        <button class="primary-btn" @click="goLatestCoupons">查看最新兑换券</button>
      </view>

      <template v-else>
        <view class="poster-stack">
          <image class="hero-poster" :src="gameConfig.detailPoster.heroImage" mode="widthFix" />

          <view class="coupon-poster">
            <image class="coupon-poster-bg" :src="gameConfig.detailPoster.contentBackground" mode="scaleToFill" />
            <view class="coupon-poster-content">
              <view class="poster-code-box">
                <text class="poster-code-label">兑换码</text>
                <text class="poster-code" selectable>{{ coupon.code || '兑换券' }}</text>
              </view>

              <view class="poster-meta-list">
                <view class="poster-meta-item">
                  <text class="poster-meta-label">奖励</text>
                  <text class="poster-meta-value">{{ coupon.reward || '？？' }}</text>
                </view>
                <view v-if="coupon.expiresAt" class="poster-meta-item">
                  <text class="poster-meta-label">有效期</text>
                  <text class="poster-meta-value">{{ coupon.expiresAt ? formatDate(coupon.expiresAt) : '长期有效' }}</text>
                </view>
                <!-- <view class="poster-meta-item">
                  <text class="poster-meta-label">区服</text>
                  <text class="poster-meta-value">{{ serverScopeText }}</text>
                </view> -->
              </view>
            </view>
            <view class="poster-interaction">
              <view v-if="pageState === 'unavailable'" class="status-card unavailable-card">
                <text class="status-icon">!</text>
                <view class="status-copy">
                  <text class="status-title">{{ unavailableTitle }}</text>
                  <text v-if="unavailableDesc" class="status-desc">{{ unavailableDesc }}</text>
                </view>
              </view>

              <view v-if="pageState === 'ready' || pageState === 'redeeming' || pageState === 'error'" class="account-card">
                <view class="card-head">
                  <text class="card-title">领取账号</text>
                  <text v-if="isLoggedIn" class="login-badge">已登录</text>
                </view>

                <view v-if="selectedAccount && !showBindForm && !pendingProfile" class="selected-account" @click="toggleAccountPicker">
                  <view class="account-avatar">{{ accountAvatarText }}</view>
                  <view class="account-copy">
                    <text class="account-name">{{ accountDisplayName }}</text>
                    <text class="account-meta">{{ selectedServerLabel }} · Hive ID {{ accountIdDisplay }}</text>
                    <text v-if="accountEligibilityMessage" class="account-warning">{{ accountEligibilityMessage }}</text>
                  </view>
                  <text class="switch-action">{{ accountPickerVisible ? '收起' : '切换' }}</text>
                </view>

                <view v-if="accountPickerVisible && !pendingProfile" class="account-picker">
                  <view
                    v-for="account in accounts"
                    :key="account.id"
                    class="account-option"
                    :class="{ selected: account.id === selectedAccount?.id }"
                    @click="selectAccount(account)">
                    <view class="account-option-copy">
                      <text class="account-option-name">{{ getAccountDisplayName(account) }}</text>
                      <text class="account-option-meta"
                        >{{ getServerShortLabel(account.server) }} · Hive ID {{ getAccountIdDisplay(account) }}</text
                      >
                    </view>
                    <text v-if="account.id === selectedAccount?.id" class="selected-mark">✓</text>
                  </view>
                  <view class="add-account-link" @click="startNewAccountBinding">绑定其他账号</view>
                </view>

                <view v-if="!selectedAccount || showBindForm" class="bind-form">
                  <view class="bind-row">
                    <picker
                      class="server-picker"
                      :range="serverLabels"
                      :value="getServerIndex(newAccount.server)"
                      @change="changeNewServer">
                      <view class="server-select">
                        <text>{{ getServerShortLabel(newAccount.server) }}</text>
                        <text class="picker-arrow">⌄</text>
                      </view>
                    </picker>
                    <input
                      v-model="newAccount.accountId"
                      class="account-input"
                      type="text"
                      :placeholder="gameConfig.accountIdPlaceholder"
                      @input="handleAccountInput" />
                  </view>
                  <view class="account-profile-preview">
                    <view v-if="pendingProfile" class="profile-preview-ready">
                      <text class="profile-preview-name">{{ pendingProfile.nickname }}</text>
                      <text class="profile-preview-meta">{{ getServerShortLabel(pendingServer) }} · 游戏账号已识别</text>
                    </view>
                    <text v-else-if="autoValidationState === 'validating'" class="profile-preview-hint">正在自动校验账号…</text>
                    <text v-else-if="autoValidationState === 'waiting'" class="profile-preview-hint">停止输入后自动校验</text>
                    <text v-else-if="autoValidationState === 'error'" class="profile-preview-error">{{ autoValidationMessage }}</text>
                    <text v-else class="profile-preview-hint">填写 Hive ID 后自动识别游戏昵称</text>
                  </view>
                </view>
              </view>

              <view v-if="result" class="result-card" :class="`result-${result.status}`">
                <text class="result-icon">{{ result.status === 'error' ? '!' : '✓' }}</text>
                <text class="result-title">{{ result.title }}</text>
                <text class="result-account">{{ result.accountLabel }}</text>
                <text v-if="result.message" class="result-message">{{ result.message }}</text>
                <view v-if="result.reward" class="result-reward">
                  <text class="result-reward-label">奖励将发放到</text>
                  <text class="result-reward-text">{{ result.reward }}</text>
                </view>
              </view>

              <view class="action-stack">
                <view>
                  <button
                    v-if="pageState === 'ready' || pageState === 'redeeming' || pageState === 'unavailable'"
                    class="primary-btn main-action"
                    :disabled="pageState === 'unavailable' || redeeming || validatingAccount || bindingAccount"
                    @click="handleCouponRedeem">
                    {{ pageState === 'unavailable' ? '不可领取' : redeemButtonText }}
                  </button>
                  <button v-if="pageState === 'error'" class="primary-btn main-action" :disabled="redeeming" @click="redeemSelectedAccount">
                    {{ redeeming ? '领取中…' : '重新领取' }}
                  </button>
                  <text class="action-error" :class="{ visible: actionErrorMessage }">{{ actionErrorMessage || ' ' }}</text>
                </view>
                <view class="secondary-action-row">
                  <!-- #ifdef MP-WEIXIN -->
                  <button v-if="coupon" class="secondary-btn share-btn" open-type="share">分享给好友</button>
                  <!-- #endif -->
                  <button class="secondary-btn link-btn" @click="goLatestCoupons">查看其他兑换券</button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import { getGameCouponConfig } from './config'
  import type { GameCouponConfig } from './config'
  import {
    getGameCouponAccountMatchKeys,
    getGameCouponDefaultServer,
    getGameCouponServerIndex,
    getGameCouponServerShortLabel,
    maskGameCouponAccountId,
    parseStoredGameCouponAccounts,
    persistGameCouponLocalAccount,
    saveGameCouponLocalAccounts,
  } from './useGameCouponAccounts'
  import type { GameCouponAccount } from './useGameCouponAccounts'
  import {
    getGameCouponsCodesDetail,
    getGameCouponsGameIdAccounts,
    getGameCouponsGameIdProfile,
    postGameCouponsGameIdAccounts,
    postGameCouponsGameIdRedeem,
  } from '@/services/apifox/NODEJSDEMO/GAMECOUPONS/apifox'
  import type {
    getGameCouponsCodesDetailRes,
    getGameCouponsGameIdProfileRes,
    postGameCouponsGameIdRedeemBodyAccountsItem,
  } from '@/services/apifox/NODEJSDEMO/GAMECOUPONS/interface'
  import { checkLoginStatus } from '@/utils/autoLogin'
  import { getUserInfo } from '@/utils/storage'
  import { buildSwcCouponDetailShare } from '@/subPackages/tools/compendium/swc/share'

  type ServerValue = NonNullable<postGameCouponsGameIdRedeemBodyAccountsItem['server']>
  type CouponPageState = 'loading' | 'ready' | 'unavailable' | 'redeeming' | 'success' | 'already-used' | 'error'
  type ResultStatus = 'success' | 'already-used' | 'error'
  type AutoValidationState = 'idle' | 'waiting' | 'validating' | 'success' | 'error'

  interface AccountValidationResult {
    valid: boolean
    message?: string
  }

  interface RouteOptions {
    couponId?: string
    gameId?: string
    game_id?: string
    compendiumId?: string
    compendium_id?: string
  }

  interface UniValueEvent {
    detail?: {
      value?: unknown
    }
  }

  interface CouponResult {
    status: ResultStatus
    title: string
    accountLabel: string
    message?: string
    reward?: string
  }

  const gameConfig = ref<GameCouponConfig>(getGameCouponConfig())
  const coupon = ref<getGameCouponsCodesDetailRes | null>(null)
  const couponId = ref('')
  const loadError = ref('')
  const pageState = ref<CouponPageState>('loading')
  const isLoggedIn = ref(false)
  const initialized = ref(false)

  const accounts = ref<GameCouponAccount[]>([])
  const selectedAccount = ref<GameCouponAccount | null>(null)
  const accountPickerVisible = ref(false)
  const accountsLoading = ref(false)
  const showBindForm = ref(false)
  const newAccount = ref({ server: getGameCouponDefaultServer(gameConfig.value), accountId: '' })
  const validatingAccount = ref(false)
  const bindingAccount = ref(false)
  const pendingProfile = ref<getGameCouponsGameIdProfileRes | null>(null)
  const pendingAccountId = ref('')
  const pendingServer = ref('')
  const redeeming = ref(false)
  const result = ref<CouponResult | null>(null)
  const actionErrorMessage = ref('')
  const autoValidationState = ref<AutoValidationState>('idle')
  const autoValidationMessage = ref('')
  const validatedAccountKey = ref('')

  const ACCOUNT_VALIDATION_DEBOUNCE_MS = 700
  const ACCOUNT_VALIDATION_THROTTLE_MS = 1500
  let accountValidationTimer: ReturnType<typeof setTimeout> | null = null
  let accountValidationRequestId = 0
  let lastAccountValidationAt = 0

  const serverLabels = computed(() => gameConfig.value.servers.map(item => item.label))

  const couponManagementPath = computed(
    () =>
      `/subPackages/tools/game-coupons/index?gameId=${encodeURIComponent(gameConfig.value.gameId)}&compendiumId=${encodeURIComponent(
        gameConfig.value.compendiumId,
      )}`,
  )

  const detailShare = computed(() =>
    buildSwcCouponDetailShare({
      couponId: couponId.value,
      code: coupon.value?.code,
      reward: coupon.value?.reward,
      gameId: gameConfig.value.gameId,
      compendiumId: gameConfig.value.compendiumId,
      sharerName: getUserInfo()?.name,
      imageUrl: gameConfig.value.detailPoster.heroImage,
    }),
  )

  const unavailableTitle = computed(() => {
    if (isCouponExpired()) return '这个兑换券已经过期'
    switch (coupon.value?.status) {
      case 'expired':
        return '这个兑换券已经过期'
      case 'disabled':
        return '这个兑换券当前不可使用'
      case 'upcoming':
        return '兑换券暂未开放'
      default:
        return coupon.value?.redeemable === false ? '这个兑换券当前不可兑换' : '这个兑换券暂时不可用'
    }
  })

  const unavailableDesc = computed(() => {
    if (coupon.value?.status === 'upcoming' && coupon.value.publishedAt) return `预计开放：${formatDate(coupon.value.publishedAt)}`
    return ''
  })

  const accountDisplayName = computed(() => getAccountDisplayName(selectedAccount.value))
  const accountIdDisplay = computed(() => getAccountIdDisplay(selectedAccount.value))
  const selectedServerLabel = computed(() => getServerShortLabel(selectedAccount.value?.server || ''))
  const accountAvatarText = computed(() => (selectedAccount.value?.nickname || selectedAccount.value?.accountId || '账').slice(0, 1))

  const accountEligibilityMessage = computed(() => {
    const account = selectedAccount.value
    if (!account) return ''
    if (!isCouponServerAllowed(account.server)) return '当前账号所在区服不适用于此兑换券'
    if (account.status === 'invalid' || account.status === 'disabled') return '当前账号需要重新验证'
    if (!account.managed && !account.accountId.trim()) return `请先填写${gameConfig.value.accountIdLabel}`
    if (account.managed && !account.id) return '账号信息不完整，请重新选择'
    return ''
  })

  const redeemButtonText = computed(() => {
    if (redeeming.value || validatingAccount.value || bindingAccount.value || pageState.value === 'redeeming') return '领取中…'
    if (pageState.value === 'error') return '重新领取'
    return '领取'
  })

  function safeDecode(value?: string) {
    if (!value) return ''
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  function applyRouteOptions(options: RouteOptions) {
    const gameId = safeDecode(options.gameId || options.game_id) || 'swc'
    const config = getGameCouponConfig(gameId)
    const compendiumId = safeDecode(options.compendiumId || options.compendium_id) || config.compendiumId
    gameConfig.value = { ...config, compendiumId }
    couponId.value = safeDecode(options.couponId || '').trim()
    newAccount.value.server = getGameCouponDefaultServer(gameConfig.value)
  }

  function refreshLoginState() {
    isLoggedIn.value = checkLoginStatus().isLoggedIn
  }

  function getServerIndex(server: string) {
    return getGameCouponServerIndex(gameConfig.value, server)
  }

  function getServerShortLabel(server: string) {
    return getGameCouponServerShortLabel(gameConfig.value, server)
  }

  function getAccountDisplayName(account?: GameCouponAccount | null) {
    if (!account) return gameConfig.value.accountIdEmptyText
    return account.nickname || account.accountLabel || account.accountIdMasked || account.accountId || gameConfig.value.accountIdEmptyText
  }

  function getAccountIdDisplay(account?: GameCouponAccount | null) {
    if (!account) return gameConfig.value.accountIdEmptyText
    return account.accountIdMasked || maskGameCouponAccountId(account.accountId) || gameConfig.value.accountIdEmptyText
  }

  function isCouponServerAllowed(server: string) {
    const scope = coupon.value?.serverScope || []
    if (!scope.length) return true
    return scope.some(item => item.trim().toLowerCase() === server.trim().toLowerCase())
  }

  function formatDate(value: unknown) {
    if (value === undefined || value === null || String(value).trim() === '') return '时间未知'
    const date = new Date(String(value))
    if (Number.isNaN(date.getTime())) return String(value)
    const pad = (part: number) => String(part).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }

  function toast(title: string) {
    uni.showToast({ title, icon: 'none' })
  }

  function translateCouponErrorMessage(message?: unknown) {
    const raw = String(message || '').trim()
    if (!raw) return '兑换失败'
    const compact = raw.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
    const exactMap: Record<string, string> = {
      success: '领取成功',
      already_used: '该账号已经领取过',
      'already used': '该账号已经领取过',
      invalid_coupon: '兑换券已过期或无效',
      'invalid coupon': '兑换券已过期或无效',
      invalid_id: 'Hive ID 无效',
      'invalid id': 'Hive ID 无效',
      failed: '官方服务繁忙，请稍后重试',
      expired: '兑换券已过期',
      upcoming: '兑换券暂未开放',
      disabled: '这个兑换券当前不可使用',
      server_not_supported: '当前区服不可用',
      'invalid hive id': 'Hive ID 无效',
      'account not found': '游戏账号不存在',
      'network error': '网络异常，请稍后重试',
      unauthorized: '登录已过期，请重新登录',
    }
    if (exactMap[raw] || exactMap[compact]) return exactMap[raw] || exactMap[compact]
    if (/already.*used|used.*coupon/.test(compact)) return '该账号已经领取过'
    if (/server.*(support|available)|not supported/.test(compact)) return '当前区服不可用'
    if (/expired/.test(compact)) return '兑换券已过期'
    if (/invalid.*(id|account|hive)/.test(compact)) return 'Hive ID 无效'
    if (/network|fetch|timeout/.test(compact)) return '网络异常，请稍后重试'
    if (/server|internal/.test(compact)) return '官方服务繁忙，请稍后重试'
    return raw
  }

  function errorMessage(error: unknown, fallback: string) {
    if (typeof error === 'string') return translateCouponErrorMessage(error)
    if (error instanceof Error) return translateCouponErrorMessage(error.message)
    if (error && typeof error === 'object' && 'message' in error) {
      return translateCouponErrorMessage(String((error as { message: unknown }).message))
    }
    return fallback
  }

  async function loadCouponDetail() {
    if (!couponId.value) {
      coupon.value = null
      loadError.value = '兑换券参数无效'
      pageState.value = 'error'
      return
    }
    pageState.value = 'loading'
    loadError.value = ''
    result.value = null
    try {
      coupon.value = await getGameCouponsCodesDetail({
        gameId: gameConfig.value.gameId,
        couponId: couponId.value,
        compendium_id: gameConfig.value.compendiumId,
      })
      pageState.value = isCouponAvailable() ? 'ready' : 'unavailable'
    } catch (error) {
      coupon.value = null
      loadError.value = errorMessage(error, '加载兑换券失败，请稍后重试')
      pageState.value = 'error'
    }
  }

  function isCouponAvailable() {
    const status = coupon.value?.status
    return (
      !isCouponExpired() && coupon.value?.redeemable !== false && status !== 'expired' && status !== 'disabled' && status !== 'upcoming'
    )
  }

  function isCouponExpired() {
    const expiresAt = coupon.value?.expiresAt
    if (!expiresAt) return false
    const timestamp = new Date(String(expiresAt)).getTime()
    return !Number.isNaN(timestamp) && timestamp <= Date.now()
  }

  function accountHasId(account: GameCouponAccount, server: string, accountId: string) {
    const normalizedServer = server.trim().toLowerCase()
    const normalizedId = accountId.trim().toLowerCase()
    if (account.server.trim().toLowerCase() !== normalizedServer) return false
    return account.accountId.trim().toLowerCase() === normalizedId || account.accountIdMasked === maskGameCouponAccountId(accountId)
  }

  function selectDefaultAccount() {
    const usable = accounts.value.filter(
      account =>
        account.status !== 'invalid' &&
        account.status !== 'disabled' &&
        (account.managed ? Boolean(account.id) : account.accountId.trim().length > 0),
    )
    selectedAccount.value =
      usable.find(account => account.managed && account.isDefault && account.status === 'active') ||
      usable.find(account => account.status === 'active') ||
      usable[0] ||
      null
    showBindForm.value = !selectedAccount.value
  }

  async function loadAccounts() {
    if (accountsLoading.value) return
    accountsLoading.value = true
    try {
      if (!isLoggedIn.value) {
        accounts.value = parseStoredGameCouponAccounts(gameConfig.value)
        selectDefaultAccount()
        return
      }

      const response = await getGameCouponsGameIdAccounts(gameConfig.value.gameId, {
        compendium_id: gameConfig.value.compendiumId,
      })
      const managed: GameCouponAccount[] = (response.accounts || []).map(item => ({
        id: String(item.id || ''),
        managed: true,
        server: item.server || getGameCouponDefaultServer(gameConfig.value),
        accountId: typeof item.accountId === 'string' ? item.accountId.trim() : '',
        accountIdMasked: item.accountIdMasked,
        accountLabel: item.accountLabel,
        isDefault: item.isDefault,
        nickname: item.nickname,
        status: item.status,
      }))
      const localAccounts = parseStoredGameCouponAccounts(gameConfig.value)
      const managedKeys = new Set(managed.flatMap(getGameCouponAccountMatchKeys))
      const visibleLocals = localAccounts.filter(account => !getGameCouponAccountMatchKeys(account).some(key => managedKeys.has(key)))
      accounts.value = [...managed, ...visibleLocals]
      selectDefaultAccount()
    } catch (error) {
      toast(errorMessage(error, '获取游戏账号失败'))
      accounts.value = parseStoredGameCouponAccounts(gameConfig.value)
      selectDefaultAccount()
    } finally {
      accountsLoading.value = false
    }
  }

  function toggleAccountPicker() {
    if (!accounts.value.length || showBindForm.value) return
    accountPickerVisible.value = !accountPickerVisible.value
  }

  function clearActionError() {
    actionErrorMessage.value = ''
  }

  function getNewAccountValidationKey(accountId = newAccount.value.accountId, server = newAccount.value.server) {
    return `${server.trim().toLowerCase()}:${accountId.trim().toLowerCase()}`
  }

  function clearScheduledAccountValidation() {
    accountValidationRequestId += 1
    if (accountValidationTimer) {
      clearTimeout(accountValidationTimer)
      accountValidationTimer = null
    }
  }

  function resetPendingAccountValidation() {
    pendingProfile.value = null
    pendingAccountId.value = ''
    pendingServer.value = ''
    validatedAccountKey.value = ''
    autoValidationMessage.value = ''
  }

  function handleAccountInput() {
    clearActionError()
    clearScheduledAccountValidation()
    resetPendingAccountValidation()

    const accountId = newAccount.value.accountId.trim()
    if (!accountId) {
      autoValidationState.value = 'idle'
      return
    }

    autoValidationState.value = 'waiting'
    const requestId = accountValidationRequestId
    const validationKey = getNewAccountValidationKey(accountId)
    const elapsed = Date.now() - lastAccountValidationAt
    const delay = Math.max(ACCOUNT_VALIDATION_DEBOUNCE_MS, ACCOUNT_VALIDATION_THROTTLE_MS - elapsed)
    accountValidationTimer = setTimeout(() => {
      accountValidationTimer = null
      void runAutoAccountValidation(accountId, newAccount.value.server, requestId, validationKey)
    }, delay)
  }

  async function runAutoAccountValidation(accountId: string, server: string, requestId: number, validationKey: string) {
    if (requestId !== accountValidationRequestId || validationKey !== getNewAccountValidationKey()) return
    if (validatingAccount.value) return
    lastAccountValidationAt = Date.now()
    autoValidationState.value = 'validating'
    const validation = await validateNewAccount({ showActionError: false, expectedKey: validationKey })
    if (requestId !== accountValidationRequestId || validationKey !== getNewAccountValidationKey(accountId, server)) return
    if (validation.valid) {
      autoValidationState.value = 'success'
      autoValidationMessage.value = ''
    } else {
      autoValidationState.value = 'error'
      autoValidationMessage.value = validation.message || '账号校验失败，请检查后重试'
    }
  }

  function selectAccount(account: GameCouponAccount) {
    clearScheduledAccountValidation()
    resetPendingAccountValidation()
    autoValidationState.value = 'idle'
    selectedAccount.value = account
    showBindForm.value = false
    accountPickerVisible.value = false
    clearActionError()
  }

  function startNewAccountBinding() {
    clearScheduledAccountValidation()
    resetPendingAccountValidation()
    autoValidationState.value = 'idle'
    accountPickerVisible.value = false
    showBindForm.value = true
    newAccount.value.accountId = ''
    newAccount.value.server = getGameCouponDefaultServer(gameConfig.value)
    clearActionError()
  }

  function changeNewServer(event: UniValueEvent) {
    const index = Number(event.detail?.value)
    newAccount.value.server = gameConfig.value.servers[index]?.value || getGameCouponDefaultServer(gameConfig.value)
    handleAccountInput()
  }

  async function handleCouponRedeem() {
    if (redeeming.value || validatingAccount.value || bindingAccount.value || !coupon.value || !isCouponAvailable()) return
    clearActionError()

    if (selectedAccount.value && !showBindForm.value) {
      if (accountEligibilityMessage.value) {
        actionErrorMessage.value = accountEligibilityMessage.value
        return
      }
      await redeemSelectedAccount()
      return
    }

    const currentValidationKey = getNewAccountValidationKey()
    if (pendingProfile.value && validatedAccountKey.value === currentValidationKey) {
      await confirmProfileAndRedeem()
      return
    }

    clearScheduledAccountValidation()
    autoValidationState.value = newAccount.value.accountId.trim() ? 'validating' : 'idle'
    lastAccountValidationAt = Date.now()
    const validation = await validateNewAccount()
    if (validation.valid) {
      autoValidationState.value = 'success'
      autoValidationMessage.value = ''
      await confirmProfileAndRedeem()
    } else if (newAccount.value.accountId.trim()) {
      autoValidationState.value = 'error'
      autoValidationMessage.value = validation.message || '账号校验失败，请检查后重试'
    }
  }

  async function validateNewAccount(options: { showActionError?: boolean; expectedKey?: string } = {}): Promise<AccountValidationResult> {
    const showActionError = options.showActionError !== false
    const fail = (message: string): AccountValidationResult => {
      if (showActionError) actionErrorMessage.value = message
      return { valid: false, message }
    }
    if (validatingAccount.value || !couponId.value) {
      return fail('兑换券参数无效')
    }
    const accountId = newAccount.value.accountId.trim()
    const server = newAccount.value.server || getGameCouponDefaultServer(gameConfig.value)
    const validationKey = getNewAccountValidationKey(accountId, server)
    if (options.expectedKey && options.expectedKey !== validationKey) return { valid: false }
    if (!accountId) {
      return fail(`请先填写${gameConfig.value.accountIdLabel}`)
    }
    if (!isCouponServerAllowed(server)) {
      return fail('当前区服不适用于此兑换券')
    }
    validatingAccount.value = true
    resetPendingAccountValidation()
    try {
      const profile = await getGameCouponsGameIdProfile(gameConfig.value.gameId, {
        account_id: accountId,
        server,
        coupon_id: couponId.value,
        compendium_id: gameConfig.value.compendiumId,
      })
      if (options.expectedKey && options.expectedKey !== getNewAccountValidationKey()) return { valid: false }
      if (!profile.available || !profile.nickname?.trim()) {
        return fail(translateCouponErrorMessage(profile.message || '未获取到游戏昵称，请检查账号和区服'))
      }
      pendingProfile.value = profile
      pendingAccountId.value = accountId
      pendingServer.value = profile.server || server
      validatedAccountKey.value = validationKey
      return { valid: true }
    } catch (error) {
      return fail(errorMessage(error, '账号验证失败'))
    } finally {
      validatingAccount.value = false
    }
  }

  async function confirmProfileAndRedeem() {
    const profile = pendingProfile.value
    const accountId = pendingAccountId.value.trim()
    const server = pendingServer.value || newAccount.value.server
    if (!profile || !accountId || !server || bindingAccount.value) return
    bindingAccount.value = true
    try {
      let account: GameCouponAccount | undefined
      const existing = accounts.value.find(item => accountHasId(item, server, accountId))
      if (existing && (!isLoggedIn.value || existing.managed)) {
        existing.nickname = profile.nickname?.trim() || existing.nickname
        existing.status = 'active'
        if (!existing.managed) persistGameCouponLocalAccount(gameConfig.value, existing)
        account = existing
      } else if (isLoggedIn.value) {
        await postGameCouponsGameIdAccounts(
          gameConfig.value.gameId,
          { compendium_id: gameConfig.value.compendiumId },
          { account_id: accountId, server: server as ServerValue },
        )
        await loadAccounts()
        account = accounts.value.find(item => accountHasId(item, server, accountId))
      } else {
        account = {
          id: `local-${Date.now()}`,
          managed: false,
          server,
          accountId,
          nickname: profile.nickname?.trim(),
          status: 'active',
        }
        accounts.value = [account, ...accounts.value]
        saveGameCouponLocalAccounts(gameConfig.value, accounts.value)
      }

      if (!account) {
        // 云端写入成功但列表刷新延迟时，用临时游客形态完成当前领取；下次进入会重新读取云端账号。
        account = { id: '', managed: false, server, accountId, nickname: profile.nickname?.trim(), status: 'active' }
      }
      selectedAccount.value = account
      showBindForm.value = false
      accountPickerVisible.value = false
      pendingProfile.value = null
      pendingAccountId.value = ''
      pendingServer.value = ''
      await redeemSelectedAccount()
    } catch (error) {
      pageState.value = 'ready'
      result.value = null
      pendingProfile.value = null
      pendingAccountId.value = ''
      pendingServer.value = ''
      actionErrorMessage.value = errorMessage(error, '账号绑定失败，请稍后重试')
    } finally {
      bindingAccount.value = false
    }
  }

  async function redeemSelectedAccount() {
    const account = selectedAccount.value
    if (redeeming.value || !coupon.value || !isCouponAvailable() || !account || accountEligibilityMessage.value) return
    redeeming.value = true
    pageState.value = 'redeeming'
    result.value = null
    try {
      const payloadAccount: postGameCouponsGameIdRedeemBodyAccountsItem = account.managed
        ? { id: account.id, server: account.server as ServerValue }
        : { id: account.id, server: account.server as ServerValue, account_id: account.accountId.trim() }
      const response = await postGameCouponsGameIdRedeem(
        gameConfig.value.gameId,
        { compendium_id: gameConfig.value.compendiumId },
        {
          accounts: [payloadAccount],
          codes: [{ couponId: couponId.value, reward: coupon.value.reward }],
        },
      )
      const group = response.accountResults?.[0]
      const item = group?.results?.[0]
      const status = String(item?.status || (response.success ? 'success' : response.alreadyUsed ? 'already_used' : 'failed'))
      const accountLabel = `${getServerShortLabel(account.server)} · ${getAccountDisplayName(account)}`
      if (status === 'success') {
        pageState.value = 'success'
        result.value = { status: 'success', title: '领取成功', accountLabel, reward: item?.reward || coupon.value.reward }
      } else if (status === 'already_used') {
        pageState.value = 'already-used'
        result.value = { status: 'already-used', title: '该账号已经领取过', accountLabel, reward: item?.reward || coupon.value.reward }
      } else {
        pageState.value = 'error'
        result.value = {
          status: 'error',
          title: '领取失败',
          accountLabel,
          message: translateCouponErrorMessage(item?.message || item?.reason || item?.status || 'failed'),
        }
      }
    } catch (error) {
      pageState.value = 'error'
      result.value = {
        status: 'error',
        title: '领取失败',
        accountLabel: `${getServerShortLabel(account.server)} · ${getAccountDisplayName(account)}`,
        message: errorMessage(error, '网络异常，请稍后重试'),
      }
    } finally {
      redeeming.value = false
    }
  }

  function goLatestCoupons() {
    uni.redirectTo({ url: couponManagementPath.value })
  }

  async function initializePage() {
    if (initialized.value) return
    initialized.value = true
    refreshLoginState()
    await loadCouponDetail()
    await loadAccounts()
  }

  onLoad(options => {
    applyRouteOptions((options || {}) as RouteOptions)
    initializePage()
  })

  onShow(() => {
    const wasLoggedIn = isLoggedIn.value
    refreshLoginState()
    if (initialized.value && wasLoggedIn !== isLoggedIn.value) loadAccounts()
  })

  onMounted(() => {
    if (!initialized.value && couponId.value) initializePage()
  })

  onBeforeUnmount(() => {
    clearScheduledAccountValidation()
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => detailShare.value.app)
  onShareTimeline(() => detailShare.value.timeline)
  // #endif
</script>

<style lang="scss" scoped>
  .detail-page {
    min-height: 100vh;
    padding: 0;
    box-sizing: border-box;
    background: #090a0c;
    color: var(--theme-text);
  }

  .account-card,
  .status-card,
  .result-card,
  .state-card {
    border: 1rpx solid var(--theme-border);
    border-radius: 28rpx;
    background: var(--theme-surface);
    box-sizing: border-box;
  }

  .poster-stack {
    overflow: hidden;
  }

  .hero-poster,
  .coupon-poster-bg {
    display: block;
    width: 100%;
  }

  .coupon-poster-bg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
    height: 100%;
    width: 100%;
  }

  .hero-poster {
    aspect-ratio: 1301 / 680;
    // border-radius: 28rpx;
    background: #090a0c;
  }

  .coupon-poster {
    position: relative;
    overflow: hidden;
    min-height: calc(100vh - 52.27vw);
    // margin-top: 20rpx;
    border: 1rpx solid rgba(197, 153, 55, 0.7);
    // border-radius: 28rpx;
    background: #090a0c;
    box-sizing: border-box;
  }

  .poster-interaction {
    position: relative;
    z-index: 1;
    padding: 0 38rpx 24rpx;
    background: transparent;
  }

  .loading-poster-interaction {
    padding-top: 36rpx;
  }

  .poster-interaction .status-card,
  .poster-interaction .account-card {
    margin-top: 0;
  }

  .coupon-poster-content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    aspect-ratio: 1301 / 680;
    padding: 34rpx 38rpx 44rpx;
    box-sizing: border-box;
    z-index: 1;
  }

  .login-badge {
    align-self: flex-start;
    color: #e7be64;
    font-size: 22rpx;
    font-weight: 700;
    letter-spacing: 1rpx;
  }

  .poster-code-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    margin-top: 108rpx;
    padding: 20rpx 22rpx;
    border: 1rpx solid rgba(231, 190, 100, 0.45);
    border-radius: 14rpx;
    background: rgba(0, 0, 0, 0.38);
  }

  .poster-code-label,
  .poster-meta-label {
    color: #c7ad76;
    font-size: 26rpx;
    flex-shrink: 0;
  }

  .poster-code-label {
    color: #e7be64;
    font-size: 26rpx;
    font-weight: 700;
  }

  .poster-code {
    min-width: 0;
    overflow: hidden;
    color: #ffb84a;
    font-size: 36rpx;
    font-weight: 800;
    letter-spacing: 3rpx;
    line-height: 1.4;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .poster-meta-list {
    // display: flex;
    // gap: 20rpx;
    margin-top: auto;
  }

  .poster-meta-item {
    min-width: 0;
    flex: 1;
  }

  .poster-meta-value {
    display: block;
    overflow: hidden;
    margin-top: 8rpx;
    color: #fff8e7;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-card,
  .result-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20rpx;
    padding: 34rpx 28rpx;
    text-align: center;
  }

  .loading-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 52rpx 28rpx;
    border: 1rpx solid rgba(231, 190, 100, 0.34);
    border-radius: 28rpx;
    background: rgba(9, 10, 12, 0.72);
    text-align: center;
  }

  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    border: 6rpx solid rgba(231, 190, 100, 0.28);
    border-top-color: #e7be64;
    border-radius: 50%;
    color: transparent;
    font-size: 0;
  }

  .loading-title {
    display: block;
    margin-top: 22rpx;
    color: #fff5d7;
    font-size: 30rpx;
    font-weight: 700;
  }

  .loading-desc {
    display: block;
    margin-top: 8rpx;
    color: rgba(255, 248, 231, 0.68);
    font-size: 24rpx;
  }

  .status-card {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
  }

  .status-icon,
  .result-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 58rpx;
    height: 58rpx;
    border-radius: 50%;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 34rpx;
    font-weight: 800;
    flex-shrink: 0;
  }

  .status-copy {
    margin-left: 18rpx;
  }

  .status-title,
  .result-title,
  .state-title {
    display: block;
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
    line-height: 1.45;
  }

  .status-desc,
  .state-desc,
  .result-message {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.5;
  }

  .account-card {
    margin-top: 20rpx;
    padding: 22rpx;
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .card-title {
    display: block;
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .selected-account {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
    padding: 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: var(--theme-surface-2);
  }

  .account-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68rpx;
    height: 68rpx;
    border-radius: 20rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 30rpx;
    font-weight: 800;
    flex-shrink: 0;
  }

  .account-copy,
  .account-option-copy {
    min-width: 0;
    flex: 1;
    margin-left: 18rpx;
  }

  .account-name,
  .account-option-name {
    display: block;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-meta,
  .account-option-meta {
    display: block;
    margin-top: 6rpx;
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-warning {
    color: var(--theme-brand);
  }

  .switch-action,
  .add-account-link,
  .link-btn {
    color: var(--theme-brand);
    font-size: 24rpx;
  }

  .account-picker {
    margin-top: 12rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .account-option {
    display: flex;
    align-items: center;
    padding: 16rpx 4rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .selected-mark {
    color: var(--theme-brand);
    font-size: 30rpx;
    font-weight: 800;
  }

  .add-account-link {
    padding: 22rpx 4rpx 4rpx;
    text-align: center;
  }

  .bind-form {
    margin-top: 16rpx;
  }

  .bind-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .server-picker {
    height: 64rpx;
    flex-shrink: 0;
  }

  .server-select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 128rpx;
    height: 64rpx;
    min-height: 0;
    padding: 0 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 24rpx;
    box-sizing: border-box;
  }

  .picker-arrow {
    color: var(--theme-text-tertiary);
  }

  .account-input {
    min-width: 0;
    flex: 1;
    height: 64rpx;
    padding: 0 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 26rpx;
    box-sizing: border-box;
  }

  .account-profile-preview {
    display: flex;
    align-items: center;
    height: 64rpx;
    margin-top: 8rpx;
    padding: 0 8rpx;
    box-sizing: border-box;
  }

  .profile-preview-ready {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    width: 100%;
    gap: 16rpx;
  }

  .profile-preview-name,
  .profile-preview-meta,
  .profile-preview-hint,
  .profile-preview-error {
    overflow: hidden;
    font-size: 22rpx;
    line-height: 32rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-preview-name {
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 700;
  }

  .profile-preview-meta,
  .profile-preview-hint {
    color: var(--theme-text-tertiary);
  }

  .profile-preview-meta {
    min-width: 0;
    text-align: right;
  }

  .profile-preview-error {
    color: #c2414e;
  }

  .result-card {
    margin-top: 20rpx;
  }

  .result-account {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
  }

  .result-reward {
    width: 100%;
    margin-top: 22rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .result-reward-text {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
    line-height: 1.5;
  }

  .action-stack {
    margin-top: 18rpx;
  }

  .secondary-action-row {
    display: flex;
    gap: 16rpx;
    margin-top: 16rpx;
  }

  .secondary-action-row .secondary-btn {
    min-width: 0;
    flex: 1;
  }

  .action-error {
    display: block;
    min-height: 32rpx;
    margin-top: 8rpx;
    color: transparent;
    font-size: 22rpx;
    line-height: 32rpx;
    text-align: center;
  }

  .action-error.visible {
    color: #c2414e;
  }

  .primary-btn,
  .secondary-btn,
  .link-btn {
    min-height: 84rpx;
    margin: 0;
    border-radius: 18rpx;
    font-size: 28rpx;
    line-height: 84rpx;
    box-sizing: border-box;
  }

  .primary-btn::after,
  .secondary-btn::after,
  .link-btn::after {
    border: 0;
  }

  .primary-btn {
    background: var(--theme-brand);
    color: var(--theme-surface);
  }

  .secondary-btn {
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    color: var(--theme-text);
  }

  .link-btn {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 248, 231, 0.42);
    color: #fff8e7;
    font-size: 26rpx;
    line-height: 84rpx;
  }

  .share-btn {
    border-color: #f6d38a;
    background: #e7be64;
    color: #2a1b05;
    font-weight: 700;
  }

  .primary-btn[disabled],
  .secondary-btn[disabled] {
    opacity: 1;
    border: 1rpx solid rgba(137, 147, 162, 0.42);
    background: rgba(137, 147, 162, 0.28);
    color: var(--theme-text-tertiary);
  }

  .full-btn,
  .main-action {
    flex: 1;
    width: auto;
    margin-top: 0;
  }

  .state-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 30rpx;
    text-align: center;
  }

  .state-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    margin-bottom: 22rpx;
    border-radius: 24rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 38rpx;
    font-weight: 800;
  }

  .state-card .primary-btn,
  .state-card .secondary-btn {
    width: 100%;
    margin-top: 22rpx;
  }
</style>
