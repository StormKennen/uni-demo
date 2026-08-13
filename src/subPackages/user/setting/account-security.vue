<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { readSettingErrorMessage, showSettingError } from './utils'
  import { getUsersMeBindings, postMeBindingsWechat } from '@/services/apifox/NODEJSDEMO/USERS/apifox'
  import type { getUsersMeBindingsRes } from '@/services/apifox/NODEJSDEMO/USERS/interface'
  import { getToken } from '@/utils/storage'
  import { checkLoginBeforeNavigator } from '@/utils/wxLogin'

  const ACCOUNT_SECURITY_ROUTE = '/subPackages/user/setting/account-security'
  const bindings = ref<getUsersMeBindingsRes | null>(null)
  const loading = ref(false)
  const loadError = ref('')
  const wechatBinding = ref(false)
  const isMpWeixin = ref(false)

  // #ifdef MP-WEIXIN
  isMpWeixin.value = true
  // #endif

  const loadBindings = async (showError = true): Promise<boolean> => {
    if (loading.value || !getToken()) return false
    loading.value = true
    loadError.value = ''
    try {
      bindings.value = await getUsersMeBindings()
      return true
    } catch (error: unknown) {
      loadError.value = '账号绑定状态加载失败'
      if (showError) showSettingError(error, '获取账号绑定状态失败，请稍后重试')
      return false
    } finally {
      loading.value = false
    }
  }

  const openBindPhone = () => {
    if (loading.value || bindings.value?.phone.bound) return
    uni.navigateTo({ url: '/subPackages/user/setting/bind-phone' })
  }

  const getWechatCode = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      let settled = false
      const timeout = setTimeout(() => {
        settled = true
        reject(new Error('获取微信登录凭证超时，请重试'))
      }, 10 * 1000)
      uni.login({
        provider: 'weixin',
        success: result => {
          if (settled) return
          clearTimeout(timeout)
          if (result.code) {
            resolve(result.code)
            return
          }
          reject(new Error('微信未返回登录凭证，请重试'))
        },
        fail: error => {
          if (settled) return
          clearTimeout(timeout)
          reject(new Error(readSettingErrorMessage(error, '获取微信登录凭证失败')))
        },
      })
    })
  }

  const bindWechat = async () => {
    if (!isMpWeixin.value || loading.value || wechatBinding.value || bindings.value?.wechat.bound) return
    wechatBinding.value = true
    try {
      const code = await getWechatCode()
      await postMeBindingsWechat({ code })
      const refreshed = await loadBindings(false)
      uni.showToast({
        title: refreshed ? '微信绑定成功' : '微信已绑定，请重新进入页面查看',
        icon: refreshed ? 'success' : 'none',
      })
    } catch (error: unknown) {
      showSettingError(error, '微信绑定失败，请稍后重试')
    } finally {
      wechatBinding.value = false
    }
  }

  onLoad(() => {
    if (!getToken()) checkLoginBeforeNavigator(ACCOUNT_SECURITY_ROUTE)
  })

  onShow(() => {
    if (getToken()) loadBindings()
  })
</script>

<template>
  <PageLayout title="账号与安全">
    <view class="security-page">
      <view v-if="loading && !bindings" class="status-card">
        <text class="status-text">账号状态加载中...</text>
      </view>
      <view v-else-if="loadError && !bindings" class="status-card">
        <text class="status-text">{{ loadError }}</text>
        <button class="retry-button" @click="loadBindings()">重新加载</button>
      </view>
      <view v-else-if="bindings" class="security-card">
        <view class="security-row" :class="{ 'security-row--action': !bindings.phone.bound }" @click="openBindPhone">
          <view class="security-copy">
            <text class="security-label">手机号</text>
            <text class="security-description">
              {{ bindings.phone.bound ? bindings.phone.maskedPhone || '已绑定' : '用于手机号密码登录' }}
            </text>
          </view>
          <view class="security-state">
            <text :class="['state-text', { 'state-text--bound': bindings.phone.bound }]">
              {{ bindings.phone.bound ? '已绑定' : '未绑定' }}
            </text>
            <text v-if="!bindings.phone.bound" class="row-arrow">›</text>
          </view>
        </view>

        <view
          class="security-row security-row--wechat"
          :class="{ 'security-row--action': isMpWeixin && !bindings.wechat.bound }"
          @click="bindWechat">
          <view class="security-copy">
            <text class="security-label">微信</text>
            <text class="security-description">
              {{ bindings.wechat.bound ? '可使用微信快捷登录' : isMpWeixin ? '绑定当前微信身份' : '请在微信小程序中绑定' }}
            </text>
          </view>
          <view class="security-state">
            <text :class="['state-text', { 'state-text--bound': bindings.wechat.bound }]">
              {{ wechatBinding ? '绑定中...' : bindings.wechat.bound ? '已绑定' : '未绑定' }}
            </text>
            <text v-if="isMpWeixin && !bindings.wechat.bound" class="row-arrow">›</text>
          </view>
        </view>
      </view>
      <text v-if="bindings" class="page-tip">已绑定的登录方式本期仅支持查看，不支持解绑或换绑。</text>
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .security-page {
    min-height: 100vh;
    padding: 24rpx 32rpx calc(40rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .status-card,
  .security-card {
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    background: var(--theme-surface);
  }

  .status-card {
    padding: 64rpx 32rpx;
    text-align: center;
  }

  .status-text,
  .security-description,
  .page-tip {
    color: var(--theme-text-secondary);
    font-size: 26rpx;
  }

  .retry-button {
    width: 220rpx;
    margin-top: 24rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 28rpx;

    &::after {
      display: none;
    }
  }

  .security-row {
    display: flex;
    min-height: 132rpx;
    padding: 24rpx 28rpx;
    align-items: center;
    box-sizing: border-box;
  }

  .security-row--wechat {
    border-top: 1rpx solid var(--theme-border);
  }

  .security-row--action:active {
    background: var(--theme-surface-2);
  }

  .security-copy {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
  }

  .security-label {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 500;
  }

  .security-description {
    margin-top: 8rpx;
  }

  .security-state {
    display: flex;
    margin-left: 24rpx;
    align-items: center;
  }

  .state-text {
    color: var(--theme-text-secondary);
    font-size: 28rpx;
  }

  .state-text--bound {
    color: var(--theme-brand);
  }

  .row-arrow {
    margin-left: 14rpx;
    color: var(--theme-text-tertiary);
    font-size: 44rpx;
  }

  .page-tip {
    display: block;
    padding: 24rpx 8rpx 0;
    line-height: 1.6;
  }
</style>
