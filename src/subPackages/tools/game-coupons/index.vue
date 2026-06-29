<template>
  <view class="coupon-page">
    <view class="page-head">
      <text class="page-title">{{ gameConfig.title }}</text>
      <text class="page-subtitle">{{ gameConfig.subtitle }}</text>
    </view>

    <view class="promo-card" @click="goLogin">
      <view class="promo-top">
        <text class="promo-emoji">🤖</text>
        <text class="promo-title">新码出来时帮你自动兑换</text>
      </view>
      <text class="promo-desc">不用打开网站，{{ isLoggedIn ? '登录后游戏号跟随账号保存' : '30 秒内到账' }}</text>
      <view class="promo-tags">
        <text class="promo-tag">试用 30 天免费</text>
        <text class="promo-tag">不绑卡</text>
        <text class="promo-tag">加密存储</text>
      </view>
      <text class="promo-link">{{ isLoggedIn ? '已登录 · 数据更稳妥' : '立即登录试用 →' }}</text>
    </view>

    <view class="block">
      <text class="block-label">账号列表</text>
      <view v-for="(account, index) in accounts" :key="account.id" class="account-row">
        <picker class="server-picker" :range="serverLabels" :value="getServerIndex(account.server)" @change="changeServer(index, $event)">
          <view class="picker-value">{{ getServerShortLabel(account.server) }}</view>
        </picker>
        <input
          class="hive-input"
          type="text"
          :placeholder="`${gameConfig.accountIdLabel} #${index + 1}`"
          :value="account.accountId"
          @input="updateAccountId(index, String($event.detail.value || ''))" />
        <view v-if="accounts.length > 1" class="row-remove" @click="removeAccount(index)">×</view>
      </view>
      <button class="add-account-btn" @click="addAccount">+ 添加账号</button>
    </view>

    <label class="auto-toggle">
      <checkbox class="auto-checkbox" :checked="autoRedeem" @click="toggleAutoRedeem" />
      <view class="auto-text">
        <text class="auto-title">开启自动兑换（30 天免费试用）</text>
        <text class="auto-hint">勾选后，新码出来时不再需要打开此页</text>
      </view>
    </label>

    <button class="redeem-btn" :disabled="redeemDisabled" @click="startRedeem">
      {{ redeeming ? '兑换中...' : '获取并兑换所有优惠券' }}
    </button>

    <view v-if="redeemError" class="inline-error">{{ redeemError }}</view>

    <view class="manual-block">
      <view class="manual-toggle" @click="showManual = !showManual">
        <text>{{ showManual ? '▼' : '▶' }} 手动添加优惠券码</text>
      </view>
      <view v-if="showManual" class="manual-panel">
        <view class="manual-row">
          <input
            class="manual-input"
            type="text"
            placeholder="输入优惠券码"
            :value="manualCode"
            @input="manualCode = String($event.detail.value || '').toUpperCase()" />
          <button class="manual-add-btn" @click="addManualCode">添加</button>
        </view>
        <view class="manual-foot">
          <text class="codes-count">已知券码 {{ combinedCodes.length }} 个</text>
          <text class="refresh-link" :class="{ disabled: loadingCodes || !backendReady }" @click="loadCodes">
            {{ loadingCodes ? '刷新中...' : '刷新' }}
          </text>
        </view>
        <view v-if="codeLoadError" class="inline-error">{{ codeLoadError }}</view>
        <view v-if="combinedCodes.length" class="code-list">
          <view v-for="item in combinedCodes" :key="item.code" class="code-item">
            <view class="code-main">
              <text class="code-text">{{ item.code }}</text>
              <text v-if="item.reward" class="code-reward">{{ item.reward }}</text>
            </view>
            <text class="code-source">{{ getSourceLabel(item.source) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="summary" class="summary-grid">
      <view class="summary-item success">
        <text class="summary-num">{{ summary.success }}</text>
        <text class="summary-label">成功</text>
      </view>
      <view class="summary-item used">
        <text class="summary-num">{{ summary.alreadyUsed }}</text>
        <text class="summary-label">已使用</text>
      </view>
      <view class="summary-item failed">
        <text class="summary-num">{{ summary.failed }}</text>
        <text class="summary-label">失败</text>
      </view>
    </view>

    <view v-if="resultGroups.length" class="result-groups">
      <view v-for="group in resultGroups" :key="group.account.id" class="result-group">
        <view class="result-group-header">
          <text class="result-account">
            {{ group.account.accountId }} · {{ getServerShortLabel(group.account.server) }}
          </text>
          <text class="result-count">{{ group.success }} 成功</text>
        </view>
        <view v-for="item in group.results" :key="`${group.account.id}-${item.code}`" class="result-row">
          <view class="result-main">
            <text class="result-code">{{ item.code }}</text>
            <text class="result-msg">{{ item.message || item.reward || '已返回结果' }}</text>
          </view>
          <text class="result-status" :class="item.status">{{ getStatusLabel(item.status) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { getGameCouponConfig } from '@/config/game-coupons'
  import { getGameCouponCodes, hasGameCouponBackend, redeemGameCoupons } from '@/services/game-coupons'
  import { checkLoginStatus } from '@/utils/autoLogin'
  import type { GameCouponConfig } from '@/config/game-coupons'
  import type {
    GameCouponAccount,
    GameCouponCode,
    GameCouponRedeemAccountResult,
    GameCouponRedeemResponse,
    GameCouponRedeemStatus,
  } from '@/services/game-coupons'

  interface RouteOptions {
    gameId?: string
    game_id?: string
    compendiumId?: string
    compendium_id?: string
  }

  const maxAccounts = 5
  const gameConfig = ref<GameCouponConfig>(getGameCouponConfig())
  const accounts = ref<GameCouponAccount[]>([])
  const remoteCodes = ref<GameCouponCode[]>([])
  const manualCodes = ref<GameCouponCode[]>([])
  const manualCode = ref('')
  const loadingCodes = ref(false)
  const codeLoadError = ref('')
  const redeeming = ref(false)
  const redeemError = ref('')
  const summary = ref<GameCouponRedeemResponse | null>(null)
  const resultGroups = ref<GameCouponRedeemAccountResult[]>([])
  const backendReady = computed(() => hasGameCouponBackend())
  const backendVerified = ref(false)
  const initialized = ref(false)
  const isLoggedIn = ref(false)
  const autoRedeem = ref(false)
  const showManual = ref(false)
  const serverLabels = computed(() => gameConfig.value.servers.map(item => item.label))

  const combinedCodes = computed(() => {
    const map = new Map<string, GameCouponCode>()
    ;[...remoteCodes.value, ...manualCodes.value].forEach(item => {
      const key = item.code.trim().toUpperCase()
      if (!key || map.has(key)) return
      map.set(key, { ...item, code: key })
    })
    return Array.from(map.values())
  })

  const validAccounts = computed(() => accounts.value.filter(account => account.accountId.trim().length > 0))

  const redeemDisabled = computed(() => redeeming.value || validAccounts.value.length === 0 || combinedCodes.value.length === 0)

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  function refreshLoginState() {
    const { isLoggedIn: loggedIn } = checkLoginStatus()
    isLoggedIn.value = loggedIn
  }

  function buildCurrentPageUrl() {
    const params = [
      `gameId=${encodeURIComponent(gameConfig.value.gameId)}`,
      `compendiumId=${encodeURIComponent(gameConfig.value.compendiumId)}`,
    ]
    return `/subPackages/tools/game-coupons/index?${params.join('&')}`
  }

  function goLogin() {
    uni.navigateTo({
      url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(buildCurrentPageUrl())}`,
    })
  }

  function getDefaultServer() {
    return gameConfig.value.defaultServer || gameConfig.value.servers[0]?.value || ''
  }

  function createAccount(): GameCouponAccount {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      server: getDefaultServer(),
      accountId: '',
    }
  }

  function normalizeServer(value: unknown): string {
    const found = gameConfig.value.servers.find(item => item.value === value)
    return found?.value || getDefaultServer()
  }

  function normalizeAccount(value: unknown): GameCouponAccount | null {
    if (!isRecord(value)) return null

    const legacyHiveId = typeof value.hiveId === 'string' ? value.hiveId : ''
    return {
      id: typeof value.id === 'string' && value.id ? value.id : createAccount().id,
      server: normalizeServer(value.server),
      accountId: typeof value.accountId === 'string' ? value.accountId : legacyHiveId,
      nickname: typeof value.nickname === 'string' ? value.nickname : undefined,
      avatarUrl: typeof value.avatarUrl === 'string' ? value.avatarUrl : undefined,
      profileAvailable: typeof value.profileAvailable === 'boolean' ? value.profileAvailable : undefined,
    }
  }

  function getStorageKeys() {
    return [gameConfig.value.storageKey, 'SWC_COUPON_ACCOUNTS']
  }

  function loadAccounts() {
    try {
      let stored: unknown = []
      for (const key of getStorageKeys()) {
        stored = uni.getStorageSync(key)
        if (Array.isArray(stored) && stored.length) break
      }
      const parsed = Array.isArray(stored) ? stored.map(normalizeAccount).filter((item): item is GameCouponAccount => !!item) : []
      accounts.value = parsed.length ? parsed : [createAccount()]
    } catch {
      accounts.value = [createAccount()]
    }
  }

  function saveAccounts() {
    try {
      uni.setStorageSync(gameConfig.value.storageKey, accounts.value)
    } catch {
      /* 本地缓存失败不阻断兑换 */
    }
  }

  function addAccount() {
    if (accounts.value.length >= maxAccounts) {
      uni.showToast({ title: `最多保存 ${maxAccounts} 个账号`, icon: 'none' })
      return
    }
    accounts.value.push(createAccount())
    saveAccounts()
  }

  function removeAccount(index: number) {
    accounts.value.splice(index, 1)
    if (!accounts.value.length) accounts.value.push(createAccount())
    saveAccounts()
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

  function changeServer(index: number, event: { detail: { value: number | string } }) {
    const serverIndex = Number(event.detail.value)
    const server = gameConfig.value.servers[serverIndex]?.value || getDefaultServer()
    accounts.value[index].server = server
    accounts.value[index].profileAvailable = undefined
    saveAccounts()
  }

  function updateAccountId(index: number, value: string) {
    const nextValue = value.trim()
    const account = accounts.value[index]
    account.accountId = nextValue
    account.nickname = undefined
    account.avatarUrl = undefined
    account.profileAvailable = undefined
    saveAccounts()
  }

  function toggleAutoRedeem() {
    if (!isLoggedIn.value) {
      autoRedeem.value = false
      uni.showToast({ title: '自动兑换托管需先登录', icon: 'none' })
      goLogin()
      return
    }
    autoRedeem.value = !autoRedeem.value
    uni.showToast({ title: autoRedeem.value ? '已开启自动兑换托管' : '已关闭自动兑换', icon: 'none' })
  }

  async function loadCodes() {
    if (!backendReady.value) {
      codeLoadError.value = '后端接口未配置，暂时只能手动添加券码。'
      return
    }

    loadingCodes.value = true
    codeLoadError.value = ''
    try {
      const data = await getGameCouponCodes(gameConfig.value)
      remoteCodes.value = data.codes || []
      backendVerified.value = true
    } catch (err) {
      backendVerified.value = false
      codeLoadError.value = err instanceof Error ? err.message : '获取券码失败'
    } finally {
      loadingCodes.value = false
    }
  }

  function addManualCode() {
    const code = manualCode.value.trim().toUpperCase()
    if (!code) return
    if (combinedCodes.value.some(item => item.code === code)) {
      uni.showToast({ title: '券码已存在', icon: 'none' })
      return
    }
    manualCodes.value.push({ code, source: 'manual' })
    manualCode.value = ''
  }

  async function startRedeem() {
    if (!backendReady.value) {
      redeemError.value = '后端接口未配置，无法直接兑换。'
      return
    }

    if (!validAccounts.value.length) {
      redeemError.value = `请至少填写一个${gameConfig.value.accountIdLabel}。`
      return
    }

    if (!combinedCodes.value.length) {
      redeemError.value = '请先获取或添加优惠券码。'
      return
    }

    redeeming.value = true
    redeemError.value = ''
    summary.value = null
    resultGroups.value = []

    try {
      const data = await redeemGameCoupons(gameConfig.value, validAccounts.value, combinedCodes.value)
      summary.value = data
      resultGroups.value = data.accountResults || []
      saveAccounts()
    } catch (err) {
      redeemError.value = err instanceof Error ? err.message : '兑换请求失败'
    } finally {
      redeeming.value = false
    }
  }

  function getSourceLabel(source?: string) {
    if (source === 'manual') return '手动'
    if (source === 'crowdsourced') return '众包'
    if (source === 'swgt') return 'SWGT'
    return source || '自动'
  }

  function getStatusLabel(status: GameCouponRedeemStatus) {
    const labels: Record<GameCouponRedeemStatus, string> = {
      pending: '等待',
      redeeming: '兑换中',
      success: '成功',
      already_used: '已使用',
      invalid_coupon: '无效',
      invalid_id: 'ID 无效',
      failed: '失败',
    }
    return labels[status] || '失败'
  }

  function applyRouteOptions(options: RouteOptions = {}) {
    const gameId = options.gameId || options.game_id || 'swc'
    const config = getGameCouponConfig(gameId)
    const compendiumId = options.compendiumId || options.compendium_id || config.compendiumId
    gameConfig.value = { ...config, compendiumId }
  }

  function initializePage() {
    if (initialized.value) return
    initialized.value = true
    refreshLoginState()
    loadAccounts()
    if (backendReady.value) {
      loadCodes()
    } else {
      codeLoadError.value = '后端接口未配置，暂时只能手动添加券码。'
    }
  }

  onLoad(options => {
    applyRouteOptions(options as RouteOptions)
    initializePage()
  })

  onShow(() => {
    refreshLoginState()
  })

  onMounted(() => {
    initializePage()
  })
</script>

<style lang="scss" scoped>
  $page-bg: #0b0b12;
  $card-bg: #15151f;
  $card-border: rgba(255, 255, 255, 0.07);
  $field-bg: #1c1c28;
  $field-border: rgba(255, 255, 255, 0.1);
  $text-primary: #f1f2f7;
  $text-secondary: #9aa0b2;
  $text-hint: #6b7180;
  $accent: #ff3d6b;
  $accent-2: #e94560;
  $success: #34d399;
  $warning: #fbbf24;
  $error: #f87171;

  .coupon-page {
    min-height: 100vh;
    padding: 48rpx 32rpx 80rpx;
    background: $page-bg;
  }

  /* 头部 */
  .page-head {
    margin-bottom: 36rpx;
  }

  .page-title {
    display: block;
    font-size: 44rpx;
    font-weight: 800;
    color: $text-primary;
  }

  .page-subtitle {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: $text-secondary;
  }

  /* 自动兑换宣传卡 */
  .promo-card {
    padding: 32rpx;
    border-radius: 24rpx;
    border: 2rpx solid $card-border;
    background: $card-bg;
  }

  .promo-top {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .promo-emoji {
    font-size: 32rpx;
  }

  .promo-title {
    font-size: 30rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .promo-desc {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: $text-secondary;
  }

  .promo-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    margin-top: 18rpx;
  }

  .promo-tag {
    font-size: 22rpx;
    color: $text-secondary;

    &::before {
      content: '✓ ';
      color: $success;
    }
  }

  .promo-link {
    display: block;
    margin-top: 18rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: $accent;
  }

  /* 通用块 */
  .block {
    margin-top: 40rpx;
  }

  .block-label {
    display: block;
    margin-bottom: 18rpx;
    font-size: 24rpx;
    color: $text-secondary;
  }

  /* 账号行 */
  .account-row {
    display: flex;
    align-items: stretch;
    gap: 16rpx;
    margin-bottom: 16rpx;
  }

  .server-picker {
    flex-shrink: 0;
    width: 200rpx;
  }

  .picker-value {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 84rpx;
    padding: 0 22rpx;
    border-radius: 16rpx;
    border: 2rpx solid $field-border;
    font-size: 26rpx;
    color: $text-primary;
    background: $field-bg;
  }

  .hive-input {
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: 84rpx;
    padding: 0 24rpx;
    border-radius: 16rpx;
    border: 2rpx solid $field-border;
    font-size: 26rpx;
    color: $text-primary;
    background: $field-bg;
  }

  .row-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 64rpx;
    height: 84rpx;
    border-radius: 16rpx;
    font-size: 40rpx;
    line-height: 1;
    color: $text-hint;
    background: rgba(255, 255, 255, 0.04);
  }

  button {
    margin: 0;
    line-height: 1;

    &::after {
      border: 0;
    }
  }

  .add-account-btn {
    width: 100%;
    height: 84rpx;
    border-radius: 16rpx;
    border: 2rpx dashed $field-border;
    font-size: 26rpx;
    color: $text-secondary;
    background: transparent;
  }

  /* 自动兑换开关 */
  .auto-toggle {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin-top: 32rpx;
  }

  .auto-checkbox {
    margin-top: 4rpx;
    transform: scale(0.86);
  }

  .auto-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .auto-title {
    font-size: 26rpx;
    color: $text-primary;
  }

  .auto-hint {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-hint;
  }

  /* 主按钮 */
  .redeem-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 96rpx;
    margin-top: 36rpx;
    border-radius: 18rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, $accent 0%, $accent-2 100%);
    box-shadow: 0 12rpx 30rpx rgba(255, 61, 107, 0.28);

    &[disabled] {
      opacity: 0.5;
      box-shadow: none;
    }
  }

  .inline-error {
    margin-top: 18rpx;
    padding: 18rpx 20rpx;
    border-radius: 14rpx;
    font-size: 24rpx;
    line-height: 1.5;
    color: $error;
    background: rgba(248, 113, 113, 0.12);
  }

  /* 手动添加 */
  .manual-block {
    margin-top: 32rpx;
  }

  .manual-toggle {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
  }

  .manual-panel {
    margin-top: 22rpx;
  }

  .manual-row {
    display: flex;
    gap: 16rpx;
  }

  .manual-input {
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: 84rpx;
    padding: 0 24rpx;
    border-radius: 16rpx;
    border: 2rpx solid $field-border;
    font-size: 26rpx;
    color: $text-primary;
    background: $field-bg;
  }

  .manual-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 120rpx;
    height: 84rpx;
    border-radius: 16rpx;
    font-size: 26rpx;
    color: $text-primary;
    background: rgba(255, 255, 255, 0.08);
  }

  .manual-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20rpx;
  }

  .codes-count {
    font-size: 22rpx;
    color: $text-hint;
  }

  .refresh-link {
    font-size: 24rpx;
    color: $accent;

    &.disabled {
      color: $text-hint;
    }
  }

  .code-list {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
    margin-top: 20rpx;
  }

  .code-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    padding: 20rpx;
    border-radius: 16rpx;
    border: 2rpx solid $card-border;
    background: rgba(255, 255, 255, 0.03);
  }

  .code-main {
    min-width: 0;
    flex: 1;
  }

  .code-text {
    display: block;
    font-size: 26rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .code-reward {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-secondary;
  }

  .code-source {
    flex-shrink: 0;
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
    color: $accent;
    background: rgba(255, 61, 107, 0.12);
  }

  /* 结果统计 */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-top: 36rpx;
  }

  .summary-item {
    padding: 24rpx 10rpx;
    border-radius: 18rpx;
    text-align: center;
    border: 2rpx solid $card-border;
    background: $card-bg;

    &.success .summary-num {
      color: $success;
    }
    &.used .summary-num {
      color: $warning;
    }
    &.failed .summary-num {
      color: $error;
    }
  }

  .summary-num {
    display: block;
    font-size: 40rpx;
    font-weight: 800;
    color: $text-primary;
  }

  .summary-label {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-secondary;
  }

  .result-groups {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 24rpx;
  }

  .result-group {
    padding: 22rpx;
    border-radius: 18rpx;
    border: 2rpx solid $card-border;
    background: $card-bg;
  }

  .result-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid $card-border;
  }

  .result-account {
    font-size: 24rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .result-count {
    font-size: 24rpx;
    font-weight: 700;
    color: $success;
  }

  .result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding-top: 16rpx;
  }

  .result-main {
    min-width: 0;
    flex: 1;
  }

  .result-code {
    display: block;
    font-size: 26rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .result-msg {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-secondary;
  }

  .result-status {
    flex-shrink: 0;
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    color: $text-secondary;
    background: rgba(255, 255, 255, 0.06);

    &.success {
      color: $success;
      background: rgba(52, 211, 153, 0.14);
    }

    &.already_used {
      color: $warning;
      background: rgba(251, 191, 36, 0.14);
    }

    &.invalid_coupon,
    &.invalid_id,
    &.failed {
      color: $error;
      background: rgba(248, 113, 113, 0.14);
    }
  }
</style>
