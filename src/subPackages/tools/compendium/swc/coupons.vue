<template>
  <view class="coupon-page">
    <view class="hero-card">
      <view class="hero-badge">Summoners War</view>
      <text class="hero-title">魔灵召唤兑换券</text>
      <text class="hero-desc">保存常用 Hive ID，一键获取可用礼包码并提交兑换。</text>
      <view class="hero-status" :class="{ warning: !backendVerified }">
        <text>{{ backendVerified ? '已连接后端接口' : '等待后端接口接入/验证' }}</text>
      </view>
    </view>

    <view v-if="!backendVerified" class="notice-card">
      <text class="notice-title">为什么需要后端？</text>
      <text class="notice-text">
        兑换站点没有开放跨域访问，官方兑换也需要服务端密钥/代理。当前页面先完成账号、券码、结果展示等前端能力，接口契约见
        docs/summoners-war-coupon-backend.md。
      </text>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view>
          <text class="section-title">账号列表</text>
          <text class="section-desc">最多保存 5 个 Hive ID，仅保存在本机缓存。</text>
        </view>
        <button class="ghost-btn" @click="addAccount">添加账号</button>
      </view>

      <view v-for="(account, index) in accounts" :key="account.id" class="account-item">
        <view class="account-main">
          <view class="avatar-wrap">
            <image v-if="account.avatarUrl" class="avatar-img" :src="account.avatarUrl" mode="aspectFill" />
            <text v-else class="avatar-text">{{ getAvatarText(account) }}</text>
          </view>
          <view class="account-info">
            <text class="account-name">{{ account.nickname || '未识别昵称' }}</text>
            <text class="account-meta"> {{ account.hiveId || '待填写 Hive ID' }} · {{ getServerShortLabel(account.server) }} </text>
            <text v-if="account.profileAvailable === false" class="profile-tip">资料查询暂不可用</text>
          </view>
          <button v-if="accounts.length > 1" class="remove-btn" @click="removeAccount(index)">移除</button>
        </view>

        <view class="account-form">
          <picker class="server-picker" :range="serverLabels" :value="getServerIndex(account.server)" @change="changeServer(index, $event)">
            <view class="picker-value">{{ getServerLabel(account.server) }}</view>
          </picker>
          <input
            class="hive-input"
            type="text"
            placeholder="输入 Hive ID"
            :value="account.hiveId"
            @input="updateHiveId(index, String($event.detail.value || ''))" />
        </view>

        <view class="account-actions">
          <button class="secondary-btn" :disabled="!account.hiveId || profileLoadingId === account.id" @click="refreshProfile(index)">
            {{ profileLoadingId === account.id ? '识别中...' : '识别头像/昵称' }}
          </button>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view>
          <text class="section-title">兑换券码</text>
          <text class="section-desc">自动券码来自后端；也可以手动补充。</text>
        </view>
        <button class="ghost-btn" :disabled="loadingCodes || !backendReady" @click="loadCodes">
          {{ loadingCodes ? '刷新中' : '刷新' }}
        </button>
      </view>

      <view class="manual-row">
        <input
          class="manual-input"
          type="text"
          placeholder="手动输入优惠券码"
          :value="manualCode"
          @input="manualCode = String($event.detail.value || '').toUpperCase()" />
        <button class="primary-small" @click="addManualCode">添加</button>
      </view>

      <view v-if="codeLoadError" class="inline-error">{{ codeLoadError }}</view>
      <view v-if="combinedCodes.length" class="code-list">
        <view v-for="item in combinedCodes" :key="item.code" class="code-item">
          <view>
            <text class="code-text">{{ item.code }}</text>
            <text class="code-reward">{{ item.reward || '奖励信息待确认' }}</text>
          </view>
          <text class="code-source">{{ getSourceLabel(item.source) }}</text>
        </view>
      </view>
      <view v-else class="empty-box">暂无券码，请刷新或手动添加。</view>
    </view>

    <view class="section-card redeem-card">
      <view class="section-header">
        <view>
          <text class="section-title">开始兑换</text>
          <text class="section-desc">会为每个已填写 Hive ID 的账号兑换全部券码。</text>
        </view>
      </view>

      <button class="redeem-btn" :disabled="redeemDisabled" @click="startRedeem">
        {{ redeeming ? '兑换中...' : '获取并兑换所有优惠券' }}
      </button>

      <view v-if="redeemError" class="inline-error">{{ redeemError }}</view>

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
              {{ group.account.nickname || group.account.hiveId }} · {{ getServerShortLabel(group.account.server) }}
            </text>
            <text class="result-count">{{ group.success }} 成功</text>
          </view>
          <view v-for="item in group.results" :key="`${group.account.id}-${item.code}`" class="result-row">
            <view>
              <text class="result-code">{{ item.code }}</text>
              <text class="result-msg">{{ item.message || item.reward || '已返回结果' }}</text>
            </view>
            <text class="result-status" :class="item.status">{{ getStatusLabel(item.status) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import {
    SUMMONERS_WAR_SERVERS,
    getSummonersWarCouponCodes,
    getSummonersWarProfile,
    hasSummonersWarCouponBackend,
    redeemSummonersWarCoupons,
  } from '@/services/summoners-war-coupons'
  import type {
    SummonersWarServer,
    SwCouponAccount,
    SwCouponCode,
    SwCouponRedeemAccountResult,
    SwCouponRedeemResponse,
    SwCouponRedeemStatus,
  } from '@/services/summoners-war-coupons'

  const STORAGE_KEY = 'SWC_COUPON_ACCOUNTS'
  const MAX_ACCOUNTS = 5

  const accounts = ref<SwCouponAccount[]>([])
  const remoteCodes = ref<SwCouponCode[]>([])
  const manualCodes = ref<SwCouponCode[]>([])
  const manualCode = ref('')
  const loadingCodes = ref(false)
  const codeLoadError = ref('')
  const redeeming = ref(false)
  const redeemError = ref('')
  const summary = ref<SwCouponRedeemResponse | null>(null)
  const resultGroups = ref<SwCouponRedeemAccountResult[]>([])
  const profileLoadingId = ref('')
  const backendReady = computed(() => hasSummonersWarCouponBackend())
  const backendVerified = ref(false)
  const serverLabels = SUMMONERS_WAR_SERVERS.map(item => item.label)

  const combinedCodes = computed(() => {
    const map = new Map<string, SwCouponCode>()
    ;[...remoteCodes.value, ...manualCodes.value].forEach(item => {
      const key = item.code.trim().toUpperCase()
      if (!key || map.has(key)) return
      map.set(key, { ...item, code: key })
    })
    return Array.from(map.values())
  })

  const validAccounts = computed(() => accounts.value.filter(account => account.hiveId.trim().length > 0))

  const redeemDisabled = computed(() => redeeming.value || validAccounts.value.length === 0 || combinedCodes.value.length === 0)

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  function createAccount(): SwCouponAccount {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      server: 'global',
      hiveId: '',
    }
  }

  function normalizeServer(value: unknown): SummonersWarServer {
    const found = SUMMONERS_WAR_SERVERS.find(item => item.value === value)
    return found?.value || 'global'
  }

  function normalizeAccount(value: unknown): SwCouponAccount | null {
    if (!isRecord(value)) return null

    return {
      id: typeof value.id === 'string' && value.id ? value.id : createAccount().id,
      server: normalizeServer(value.server),
      hiveId: typeof value.hiveId === 'string' ? value.hiveId : '',
      nickname: typeof value.nickname === 'string' ? value.nickname : undefined,
      avatarUrl: typeof value.avatarUrl === 'string' ? value.avatarUrl : undefined,
      profileAvailable: typeof value.profileAvailable === 'boolean' ? value.profileAvailable : undefined,
    }
  }

  function loadAccounts() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY)
      const parsed = Array.isArray(stored) ? stored.map(normalizeAccount).filter((item): item is SwCouponAccount => !!item) : []
      accounts.value = parsed.length ? parsed : [createAccount()]
    } catch {
      accounts.value = [createAccount()]
    }
  }

  function saveAccounts() {
    try {
      uni.setStorageSync(STORAGE_KEY, accounts.value)
    } catch {
      /* 本地缓存失败不阻断兑换 */
    }
  }

  function addAccount() {
    if (accounts.value.length >= MAX_ACCOUNTS) {
      uni.showToast({ title: `最多保存 ${MAX_ACCOUNTS} 个账号`, icon: 'none' })
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

  function getServerIndex(server: SummonersWarServer) {
    return Math.max(
      0,
      SUMMONERS_WAR_SERVERS.findIndex(item => item.value === server),
    )
  }

  function getServerLabel(server: SummonersWarServer) {
    return SUMMONERS_WAR_SERVERS[getServerIndex(server)].label
  }

  function getServerShortLabel(server: SummonersWarServer) {
    return SUMMONERS_WAR_SERVERS[getServerIndex(server)].shortLabel
  }

  function getAvatarText(account: SwCouponAccount) {
    return (account.nickname || account.hiveId || 'SW').slice(0, 2).toUpperCase()
  }

  function changeServer(index: number, event: { detail: { value: number | string } }) {
    const serverIndex = Number(event.detail.value)
    const server = SUMMONERS_WAR_SERVERS[serverIndex]?.value || 'global'
    accounts.value[index].server = server
    accounts.value[index].profileAvailable = undefined
    saveAccounts()
  }

  function updateHiveId(index: number, value: string) {
    const nextValue = value.trim()
    const account = accounts.value[index]
    account.hiveId = nextValue
    account.nickname = undefined
    account.avatarUrl = undefined
    account.profileAvailable = undefined
    saveAccounts()
  }

  async function refreshProfile(index: number) {
    const account = accounts.value[index]
    if (!account.hiveId) return

    if (!backendReady.value) {
      account.profileAvailable = false
      saveAccounts()
      uni.showToast({ title: '后端接入后可识别资料', icon: 'none' })
      return
    }

    profileLoadingId.value = account.id
    try {
      const profile = await getSummonersWarProfile(account.hiveId, account.server)
      account.nickname = profile.nickname
      account.avatarUrl = profile.avatarUrl
      account.profileAvailable = profile.available
      if (!profile.available) {
        uni.showToast({ title: profile.message || '暂未识别到资料', icon: 'none' })
      }
      saveAccounts()
    } catch (err) {
      account.profileAvailable = false
      uni.showToast({ title: err instanceof Error ? err.message : '资料识别失败', icon: 'none' })
    } finally {
      profileLoadingId.value = ''
    }
  }

  async function loadCodes() {
    if (!backendReady.value) {
      codeLoadError.value = '后端接口未配置，暂时只能手动添加券码。'
      return
    }

    loadingCodes.value = true
    codeLoadError.value = ''
    try {
      const data = await getSummonersWarCouponCodes()
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
      redeemError.value = '请至少填写一个 Hive ID。'
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
      const data = await redeemSummonersWarCoupons(validAccounts.value, combinedCodes.value)
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

  function getStatusLabel(status: SwCouponRedeemStatus) {
    const labels: Record<SwCouponRedeemStatus, string> = {
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

  onMounted(() => {
    loadAccounts()
    if (backendReady.value) {
      loadCodes()
    } else {
      codeLoadError.value = '后端接口未配置，暂时只能手动添加券码。'
    }
  })
</script>

<style lang="scss" scoped>
  $bg-color: #f6f7fb;
  $card-bg: #ffffff;
  $text-primary: #172033;
  $text-secondary: #5e6678;
  $text-hint: #96a0b5;
  $border-color: #edf0f6;
  $accent: #e94560;
  $success: #18a058;
  $warning: #f59e0b;
  $error: #ef4444;
  $radius-lg: 28rpx;
  $shadow: 0 12rpx 36rpx rgba(23, 32, 51, 0.08);

  .coupon-page {
    min-height: 100vh;
    padding: 28rpx 28rpx 56rpx;
    background: $bg-color;
  }

  .hero-card {
    padding: 40rpx 34rpx;
    border-radius: 36rpx;
    color: #fff;
    background: linear-gradient(135deg, #181a2f 0%, #e94560 100%);
    box-shadow: 0 18rpx 44rpx rgba(233, 69, 96, 0.24);
  }

  .hero-badge {
    display: inline-flex;
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    background: rgba(255, 255, 255, 0.16);
  }

  .hero-title {
    display: block;
    margin-top: 28rpx;
    font-size: 44rpx;
    font-weight: 700;
  }

  .hero-desc {
    display: block;
    margin-top: 14rpx;
    font-size: 26rpx;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.84);
  }

  .hero-status {
    display: inline-flex;
    margin-top: 28rpx;
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    color: #d7ffe8;
    background: rgba(24, 160, 88, 0.24);

    &.warning {
      color: #fff3cf;
      background: rgba(245, 158, 11, 0.28);
    }
  }

  .notice-card,
  .section-card {
    margin-top: 24rpx;
    padding: 30rpx;
    border-radius: $radius-lg;
    background: $card-bg;
    box-shadow: $shadow;
  }

  .notice-card {
    border: 2rpx solid rgba(245, 158, 11, 0.18);
    background: #fffaf0;
  }

  .notice-title,
  .section-title {
    display: block;
    font-size: 30rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .notice-text,
  .section-desc {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: $text-secondary;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24rpx;
    margin-bottom: 24rpx;
  }

  button {
    margin: 0;
    border-radius: 999rpx;
    font-size: 24rpx;
    line-height: 1;

    &::after {
      border: 0;
    }
  }

  .ghost-btn,
  .secondary-btn {
    padding: 18rpx 24rpx;
    color: $accent;
    background: rgba(233, 69, 96, 0.08);
  }

  .account-item {
    padding: 24rpx 0;
    border-top: 2rpx solid $border-color;

    &:first-of-type {
      border-top: 0;
    }
  }

  .account-main {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .avatar-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88rpx;
    height: 88rpx;
    border-radius: 26rpx;
    flex-shrink: 0;
    overflow: hidden;
    color: #fff;
    background: linear-gradient(135deg, #ff8a65 0%, #e94560 100%);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
  }

  .avatar-text {
    font-size: 28rpx;
    font-weight: 700;
  }

  .account-info {
    min-width: 0;
    flex: 1;
  }

  .account-name,
  .account-meta,
  .profile-tip {
    display: block;
  }

  .account-name {
    font-size: 28rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .account-meta,
  .profile-tip {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-hint;
  }

  .remove-btn {
    padding: 14rpx 18rpx;
    color: $error;
    background: rgba(239, 68, 68, 0.08);
  }

  .account-form {
    display: grid;
    grid-template-columns: 230rpx minmax(0, 1fr);
    gap: 18rpx;
    margin-top: 22rpx;
  }

  .picker-value,
  .hive-input,
  .manual-input {
    box-sizing: border-box;
    width: 100%;
    min-height: 82rpx;
    padding: 0 22rpx;
    border-radius: 20rpx;
    font-size: 26rpx;
    color: $text-primary;
    background: #f7f8fb;
  }

  .picker-value {
    display: flex;
    align-items: center;
  }

  .account-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 18rpx;
  }

  .manual-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 136rpx;
    gap: 16rpx;
  }

  .primary-small {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: $accent;
  }

  .inline-error {
    margin-top: 18rpx;
    padding: 18rpx 20rpx;
    border-radius: 18rpx;
    font-size: 24rpx;
    line-height: 1.5;
    color: $error;
    background: rgba(239, 68, 68, 0.08);
  }

  .code-list,
  .result-groups {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 22rpx;
  }

  .code-item,
  .result-row,
  .result-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .code-item {
    padding: 20rpx;
    border-radius: 20rpx;
    background: #f7f8fb;
  }

  .code-text,
  .code-reward,
  .result-code,
  .result-msg {
    display: block;
  }

  .code-text,
  .result-code {
    font-size: 26rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .code-reward,
  .result-msg {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-secondary;
  }

  .code-source {
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    flex-shrink: 0;
    font-size: 22rpx;
    color: $accent;
    background: rgba(233, 69, 96, 0.08);
  }

  .empty-box {
    margin-top: 20rpx;
    padding: 42rpx 24rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    text-align: center;
    color: $text-hint;
    background: #f7f8fb;
  }

  .redeem-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 92rpx;
    color: #fff;
    font-size: 28rpx;
    font-weight: 700;
    background: linear-gradient(135deg, #e94560 0%, #ff7a59 100%);
    box-shadow: 0 12rpx 24rpx rgba(233, 69, 96, 0.2);

    &[disabled] {
      opacity: 0.56;
    }
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-top: 24rpx;
  }

  .summary-item {
    padding: 22rpx 10rpx;
    border-radius: 20rpx;
    text-align: center;
    background: #f7f8fb;

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

  .summary-num,
  .summary-label {
    display: block;
  }

  .summary-num {
    font-size: 36rpx;
    font-weight: 800;
  }

  .summary-label {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: $text-secondary;
  }

  .result-group {
    padding: 20rpx;
    border-radius: 22rpx;
    background: #f7f8fb;
  }

  .result-group-header {
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid $border-color;
  }

  .result-account,
  .result-count {
    font-size: 24rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .result-row {
    padding: 16rpx 0 0;
  }

  .result-status {
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    flex-shrink: 0;
    font-size: 22rpx;
    color: $text-secondary;
    background: #eef1f6;

    &.success {
      color: $success;
      background: rgba(24, 160, 88, 0.1);
    }

    &.already_used {
      color: $warning;
      background: rgba(245, 158, 11, 0.12);
    }

    &.invalid_coupon,
    &.invalid_id,
    &.failed {
      color: $error;
      background: rgba(239, 68, 68, 0.08);
    }
  }
</style>
