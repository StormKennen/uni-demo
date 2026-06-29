<template>
  <view class="coupon-page">
    <!-- 头部 -->
    <view class="page-head">
      <text class="page-title">{{ gameConfig.title }}</text>
      <text class="page-subtitle">{{ gameConfig.subtitle }}</text>
      <view class="login-tip" :class="{ guest: !isLoggedIn }">
        <text class="login-tip-text">
          {{ isLoggedIn ? '已登录：账号已云端托管，换设备或清缓存都不会丢失。' : '未登录：账号仅保存在本机，清理缓存或换设备会丢失。登录后自动同步到云端，永不丢失。' }}
        </text>
        <text v-if="!isLoggedIn" class="login-link" @click="goLogin">登录同步 ›</text>
      </view>
    </view>

    <!-- 账号卡片 -->
    <view class="card">
      <view class="card-head">
        <text class="card-title">我的账号</text>
        <text class="card-tag">{{ isLoggedIn ? '云端托管' : '本机保存' }}</text>
      </view>

      <view v-if="!accounts.length" class="empty-tip">还没有账号，先在下方添加一个吧</view>

      <view v-for="(account, index) in accounts" :key="account.id" class="account-row">
        <picker class="server-picker" :range="serverLabels" :value="getServerIndex(account.server)" @change="changeServer(index, $event)">
          <view class="server-chip">{{ getServerShortLabel(account.server) }}</view>
        </picker>

        <view class="account-main">
          <view class="account-line">
            <text class="account-name">{{ account.nickname || account.accountIdMasked || account.accountId || gameConfig.accountIdEmptyText }}</text>
            <text class="status-badge" :class="getStatusBadgeClass(account.status)">{{ getStatusBadgeText(account.status) }}</text>
          </view>
          <view class="account-sub">
            <text class="server-name">{{ getServerFullLabel(account.server) }}</text>
            <text v-if="account.nickname && (account.accountIdMasked || account.accountId)" class="account-id-sub">
              {{ account.accountIdMasked || account.accountId }}
            </text>
          </view>
        </view>

        <view class="account-actions">
          <view class="mini-btn" :class="{ loading: account.verifying }" @click="verifyAccount(index)">
            {{ account.verifying ? '验证中' : '验证' }}
          </view>
          <view class="mini-btn danger" @click="removeAccount(index)">删除</view>
        </view>
      </view>

      <!-- 添加账号表单 -->
      <view class="add-form">
        <picker class="server-picker" :range="serverLabels" :value="getServerIndex(newAccount.server)" @change="changeNewServer($event)">
          <view class="server-chip">{{ getServerShortLabel(newAccount.server) }}</view>
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
    </view>

    <!-- 自动兑换 -->
    <view class="auto-card">
      <view class="auto-text">
        <text class="auto-title">自动兑换托管</text>
        <text class="auto-hint">{{ isLoggedIn ? '新码出来时自动帮你兑换' : '登录后开启，新码自动到账' }}</text>
      </view>
      <switch v-if="!isLoggedIn" class="auto-switch" :checked="false" @click="goLogin" />
      <text v-else class="auto-link" @click="toggleAllAuto">{{ allAutoOn ? '全部关闭' : '全部开启' }}</text>
    </view>

    <!-- 主按钮 -->
    <button class="redeem-btn" :disabled="redeemDisabled" @click="startRedeem">
      {{ redeeming ? '兑换中…' : '一键兑换全部券码' }}
    </button>
    <view v-if="redeemError" class="inline-error">{{ redeemError }}</view>

    <!-- 券码区 -->
    <view class="card codes-card">
      <view class="card-head" @click="showCodes = !showCodes">
        <text class="card-title">可用券码 {{ combinedCodes.length }}</text>
        <text class="card-toggle">{{ showCodes ? '收起' : '展开' }}</text>
      </view>

      <view v-if="showCodes" class="codes-body">
        <view class="manual-row">
          <input
            class="manual-input"
            type="text"
            placeholder="手动输入券码"
            :value="manualCode"
            @input="manualCode = String($event.detail.value || '').toUpperCase()" />
          <view class="manual-add" @click="addManualCode">添加</view>
          <view class="manual-refresh" :class="{ disabled: loadingCodes }" @click="loadCodes">
            {{ loadingCodes ? '…' : '刷新' }}
          </view>
        </view>
        <view v-if="codeLoadError" class="inline-error">{{ codeLoadError }}</view>
        <view v-if="combinedCodes.length" class="code-list">
          <view v-for="item in combinedCodes" :key="item.code" class="code-item">
            <view class="code-info">
              <text class="code-text">{{ item.code }}</text>
              <text v-if="item.reward" class="code-reward">{{ item.reward }}</text>
            </view>
            <text class="code-source">{{ getSourceLabel(item.source) }}</text>
          </view>
        </view>
        <view v-else class="empty-tip">暂无券码，可点击刷新或手动添加</view>
      </view>
    </view>

    <!-- 统计 -->
    <view v-if="stats" class="stats-row">
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
    <view v-if="resultGroups.length" class="result-list">
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
  </view>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import {
    deleteGameIdAccountsAccountId,
    getGameCouponsGameIdAccounts,
    getGameCouponsGameIdCodes,
    getGameCouponsGameIdProfile,
    getGameCouponsGameIdRedeemRecords,
    getGameIdAccountsAccountId,
    getGameIdRedeemRecordsSummary,
    patchGameIdAccountsAccountId,
    postAccountsAccountIdAutoRedeem,
    postAccountsAccountIdVerify,
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
  import { getGameCouponConfig } from './config'
  import type { GameCouponConfig } from './config'
  import { checkLoginStatus } from '@/utils/autoLogin'

  type ServerValue = NonNullable<postGameCouponsGameIdRedeemBodyAccountsItem['server']>
  type AccountStatus = 'active' | 'invalid' | 'pending' | 'disabled'

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
  const newAccount = ref<{ server: string; accountId: string }>({ server: 'global', accountId: '' })
  const addingAccount = ref(false)

  const remoteCodes = ref<getGameCouponsGameIdCodesResCodes[]>([])
  const manualCodes = ref<getGameCouponsGameIdCodesResCodes[]>([])
  const manualCode = ref('')
  const loadingCodes = ref(false)
  const codeLoadError = ref('')
  const showCodes = ref(false)

  const redeeming = ref(false)
  const redeemError = ref('')
  const redeemSummary = ref<getGameIdRedeemRecordsSummaryRes | null>(null)
  const resultGroups = ref<postGameCouponsGameIdRedeemResAccountResults[]>([])

  const records = ref<getGameCouponsGameIdRedeemRecordsResResults[]>([])
  const summary = ref<getGameIdRedeemRecordsSummaryRes | null>(null)
  const showRecords = ref(false)

  const isLoggedIn = ref(false)
  const initialized = ref(false)

  const serverLabels = computed(() => gameConfig.value.servers.map(item => item.label))

  const combinedCodes = computed(() => {
    const map = new Map<string, getGameCouponsGameIdCodesResCodes>()
    ;[...remoteCodes.value, ...manualCodes.value].forEach(item => {
      const key = String(item.code || '')
        .trim()
        .toUpperCase()
      if (!key || map.has(key)) return
      map.set(key, { ...item, code: key })
    })
    return Array.from(map.values())
  })

  const validAccounts = computed(() => accounts.value.filter(account => account.managed || account.accountId.trim().length > 0))

  const redeemDisabled = computed(() => redeeming.value || validAccounts.value.length === 0 || combinedCodes.value.length === 0)

  const allAutoOn = computed(() => accounts.value.length > 0 && accounts.value.every(account => account.autoRedeemEnabled))

  const stats = computed(() => summary.value || redeemSummary.value)

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

  /** 区服中文+英文全称，用于账号展示 */
  function getServerFullLabel(server: string) {
    return gameConfig.value.servers[getServerIndex(server)]?.label || server
  }

  function localId() {
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  function getStorageKey() {
    return gameConfig.value.storageKey
  }

  function getStatusText(status?: string) {
    if (status === 'active') return '已验证'
    if (status === 'invalid') return '无效'
    if (status === 'disabled') return '已停用'
    return '未验证'
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
    const map: Record<string, string> = { preset: '预置', upstream: '社区', manual: '手动', admin: '官方', swgt: '官方' }
    return map[source || ''] || '自动'
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

  function loadLocalAccounts() {
    try {
      const stored = uni.getStorageSync(getStorageKey())
      const list = Array.isArray(stored) ? stored : []
      accounts.value = list
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          id: typeof item.id === 'string' && item.id ? item.id : localId(),
          managed: false,
          server: gameConfig.value.servers.some(s => s.value === item.server) ? item.server : getDefaultServer(),
          accountId: typeof item.accountId === 'string' ? item.accountId : '',
          nickname: typeof item.nickname === 'string' ? item.nickname : undefined,
        }))
    } catch {
      accounts.value = []
    }
  }

  /* ----------------------------- 托管账号 ----------------------------- */

  async function loadManagedAccounts() {
    try {
      const res = await getGameCouponsGameIdAccounts(gameConfig.value.gameId, {
        compendium_id: gameConfig.value.compendiumId,
      })
      accounts.value = (res.accounts || []).map(item => ({
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
    } catch (err) {
      toast(errMsg(err, '获取托管账号失败'))
    }
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
        await deleteGameIdAccountsAccountId({ gameId: gameConfig.value.gameId, accountId: account.id })
        accounts.value.splice(index, 1)
        toast('已删除')
      } catch (err) {
        toast(errMsg(err, '删除失败'))
      }
      return
    }

    accounts.value.splice(index, 1)
    saveLocalAccounts()
    toast('已删除')
  }

  async function changeServer(index: number, event: { detail: { value: number | string } }) {
    const account = accounts.value[index]
    if (!account) return
    const idx = Number(event.detail.value)
    const server = gameConfig.value.servers[idx]?.value || getDefaultServer()
    account.server = server
    account.nickname = undefined
    account.status = 'pending'

    if (account.managed) {
      try {
        await patchGameIdAccountsAccountId({ gameId: gameConfig.value.gameId, accountId: account.id }, { server: server as ServerValue })
        await refreshManagedAccount(index)
      } catch (err) {
        toast(errMsg(err, '更新区服失败'))
      }
      return
    }
    saveLocalAccounts()
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
    const managed = accounts.value.filter(item => item.managed)
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
    } catch (err) {
      codeLoadError.value = errMsg(err, '获取券码失败')
    } finally {
      loadingCodes.value = false
    }
  }

  async function addManualCode() {
    const code = manualCode.value.trim().toUpperCase()
    if (!code) return
    if (combinedCodes.value.some(item => item.code === code)) {
      toast('券码已存在')
      return
    }
    manualCodes.value.push({ code, source: 'manual' })
    manualCode.value = ''
    try {
      await postGameIdCodesManual(gameConfig.value.gameId, { compendium_id: gameConfig.value.compendiumId }, { code })
    } catch {
      /* 入库失败不影响本地兑换 */
    }
  }

  /* ----------------------------- 兑换 ----------------------------- */

  async function startRedeem() {
    // 防止未请求完成时重复点击
    if (redeeming.value) return
    if (!validAccounts.value.length) {
      redeemError.value = `请至少添加并填写一个${gameConfig.value.accountIdLabel}`
      return
    }
    if (!combinedCodes.value.length) {
      redeemError.value = '请先获取或添加优惠券码'
      return
    }

    redeeming.value = true
    redeemError.value = ''
    redeemSummary.value = null
    resultGroups.value = []
    uni.showLoading({ title: '兑换中…', mask: true })

    const payloadAccounts: postGameCouponsGameIdRedeemBodyAccountsItem[] = validAccounts.value.map(account =>
      account.managed
        ? { id: account.id, server: account.server as ServerValue }
        : { id: account.id, server: account.server as ServerValue, account_id: account.accountId.trim() },
    )
    const payloadCodes = combinedCodes.value.map(item => ({ code: item.code as string, reward: item.reward }))

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
    } catch (err) {
      uni.hideLoading()
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
      loadManagedAccounts()
      loadSummary()
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
    const wasLoggedIn = isLoggedIn.value
    refreshLoginState()
    if (!initialized.value) return
    if (isLoggedIn.value && !wasLoggedIn) {
      loadManagedAccounts()
      loadSummary()
    }
  })

  onMounted(() => {
    initializePage()
  })
</script>

<style lang="scss" scoped>
  $page-bg: #f4f5f7;
  $card-bg: #ffffff;
  $border: #ebedf0;
  $field-bg: #f6f7f9;
  $text-primary: #1f2330;
  $text-secondary: #6b7180;
  $text-hint: #9aa0ad;
  $accent: #4f6ef2;
  $accent-2: #6a8bff;
  $success: #16a34a;
  $warning: #d97706;
  $error: #dc2626;

  .coupon-page {
    min-height: 100vh;
    padding: 32rpx 28rpx 80rpx;
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
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
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
  }

  .empty-tip {
    padding: 24rpx 0;
    font-size: 24rpx;
    color: $text-hint;
    text-align: center;
  }

  /* 账号行 */
  .account-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 0;
    border-top: 1rpx solid $border;
  }

  .account-row:first-of-type {
    border-top: none;
  }

  .server-picker {
    flex-shrink: 0;
  }

  .server-chip {
    min-width: 96rpx;
    padding: 10rpx 16rpx;
    font-size: 22rpx;
    color: $text-primary;
    background: $field-bg;
    border-radius: 12rpx;
    text-align: center;
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
    margin-top: 4rpx;
  }

  .server-name {
    font-size: 22rpx;
    color: $text-secondary;
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
    gap: 12rpx;
    flex-shrink: 0;
  }

  .mini-btn {
    padding: 10rpx 20rpx;
    font-size: 22rpx;
    color: $accent;
    background: rgba(79, 110, 242, 0.08);
    border-radius: 12rpx;

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
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx dashed $border;
  }

  .add-input {
    flex: 1;
    height: 64rpx;
    padding: 0 20rpx;
    font-size: 26rpx;
    color: $text-primary;
    background: $field-bg;
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
  .auto-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
    padding: 24rpx;
    background: $card-bg;
    border-radius: 20rpx;
    border: 1rpx solid $border;
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

  .auto-link {
    font-size: 24rpx;
    color: $accent;
  }

  .auto-switch {
    transform: scale(0.85);
  }

  /* 主按钮 */
  .redeem-btn {
    width: 100%;
    height: 92rpx;
    line-height: 92rpx;
    margin-bottom: 16rpx;
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

  .inline-error {
    margin-bottom: 16rpx;
    font-size: 24rpx;
    color: $error;
  }

  /* 券码 */
  .codes-card .card-head {
    margin-bottom: 0;
  }

  .codes-body {
    margin-top: 16rpx;
  }

  .manual-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;
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
  .manual-refresh {
    flex-shrink: 0;
    padding: 0 24rpx;
    height: 64rpx;
    line-height: 64rpx;
    font-size: 24rpx;
    border-radius: 12rpx;
  }

  .manual-add {
    color: #fff;
    background: $accent;
  }

  .manual-refresh {
    color: $accent;
    background: rgba(79, 110, 242, 0.08);

    &.disabled {
      opacity: 0.6;
    }
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
    flex-shrink: 0;
    font-size: 22rpx;
    color: $text-hint;
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
  .result-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  .result-group {
    padding: 20rpx;
    background: $card-bg;
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
