<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { showSettingError } from './utils'
  import { postMeBindingsPhone } from '@/services/apifox/NODEJSDEMO/USERS/apifox'
  import type { postMeBindingsPhoneBody } from '@/services/apifox/NODEJSDEMO/USERS/interface'
  import { getToken } from '@/utils/storage'
  import { checkLoginBeforeNavigator } from '@/utils/wxLogin'

  const BIND_PHONE_ROUTE = '/subPackages/user/setting/bind-phone'
  const phone = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const submitting = ref(false)

  const phoneValid = computed(() => /^1[3-9]\d{9}$/.test(phone.value.trim()))
  const passwordValid = computed(() => password.value.length >= 8 && /[A-Za-z]/.test(password.value) && /\d/.test(password.value))
  const passwordMismatch = computed(() => Boolean(confirmPassword.value) && password.value !== confirmPassword.value)
  const canSubmit = computed(() => {
    return phoneValid.value && passwordValid.value && Boolean(confirmPassword.value) && !passwordMismatch.value && !submitting.value
  })

  const submit = async () => {
    if (submitting.value) return
    if (!phone.value.trim()) {
      uni.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }
    if (!phoneValid.value) {
      uni.showToast({ title: '请输入正确的11位手机号', icon: 'none' })
      return
    }
    if (!password.value) {
      uni.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    if (!passwordValid.value) {
      uni.showToast({ title: '密码至少8位，需包含字母和数字', icon: 'none' })
      return
    }
    if (!confirmPassword.value) {
      uni.showToast({ title: '请再次输入密码', icon: 'none' })
      return
    }
    if (passwordMismatch.value) {
      uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
      return
    }

    submitting.value = true
    try {
      const payload: postMeBindingsPhoneBody = {
        phone: phone.value.trim(),
        password: password.value,
      }
      await postMeBindingsPhone(payload)
      uni.showToast({ title: '手机号绑定成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 500)
    } catch (error: unknown) {
      showSettingError(error, '手机号绑定失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  }

  onLoad(() => {
    if (!getToken()) checkLoginBeforeNavigator(BIND_PHONE_ROUTE)
  })
</script>

<template>
  <PageLayout title="绑定手机号">
    <view class="bind-phone-page">
      <view class="form-card">
        <view class="input-row">
          <text class="input-label">手机号</text>
          <input
            v-model="phone"
            class="form-input"
            type="number"
            :maxlength="11"
            :disabled="submitting"
            placeholder="请输入11位手机号"
            confirm-type="next" />
        </view>
        <view class="input-row">
          <text class="input-label">密码</text>
          <input
            v-model="password"
            class="form-input"
            :password="true"
            :disabled="submitting"
            placeholder="至少8位，需包含字母和数字"
            confirm-type="next" />
        </view>
        <view class="input-row">
          <text class="input-label">确认密码</text>
          <input
            v-model="confirmPassword"
            class="form-input"
            :password="true"
            :disabled="submitting"
            placeholder="请再次输入密码"
            confirm-type="done"
            @confirm="submit" />
        </view>
      </view>

      <view class="validation-area">
        <text v-if="password && !passwordValid" class="validation-text">密码至少8位，需包含至少一个字母和一个数字</text>
        <text v-else-if="passwordMismatch" class="validation-text validation-text--error">两次密码输入不一致</text>
        <text v-else class="validation-text">绑定后可使用该手机号和密码登录当前账号</text>
      </view>

      <button
        class="submit-button"
        :class="{ 'submit-button--disabled': !canSubmit }"
        :disabled="!canSubmit"
        :loading="submitting"
        @click="submit">
        {{ submitting ? '绑定中...' : '确认绑定' }}
      </button>
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .bind-phone-page {
    min-height: 100vh;
    padding: 24rpx 32rpx calc(40rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .form-card {
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    background: var(--theme-surface);
  }

  .input-row {
    display: flex;
    min-height: 112rpx;
    padding: 18rpx 28rpx;
    align-items: center;
    box-sizing: border-box;

    & + & {
      border-top: 1rpx solid var(--theme-border);
    }
  }

  .input-label {
    width: 170rpx;
    flex-shrink: 0;
    color: var(--theme-text);
    font-size: 30rpx;
  }

  .form-input {
    flex: 1;
    color: var(--theme-text);
    font-size: 30rpx;
    text-align: right;
  }

  .validation-area {
    min-height: 70rpx;
    padding: 18rpx 8rpx 0;
    box-sizing: border-box;
  }

  .validation-text {
    color: var(--theme-text-secondary);
    font-size: 25rpx;
    line-height: 1.5;
  }

  .validation-text--error {
    color: var(--theme-brand);
  }

  .submit-button {
    height: 88rpx;
    margin-top: 28rpx;
    border-radius: 24rpx;
    background: var(--theme-brand);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 88rpx;

    &::after {
      display: none;
    }
  }

  .submit-button--disabled {
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
    color: var(--theme-text-tertiary);
    opacity: 1;
    box-shadow: none;
  }
</style>
