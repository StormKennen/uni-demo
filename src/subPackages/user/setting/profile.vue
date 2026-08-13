<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { isSelectionCancelled, showSettingError } from './utils'
  import defaultAvatar from '@/static/image/default_avator.svg'
  import { getUsersMe, patchUsersMe } from '@/services/apifox/NODEJSDEMO/USERS/apifox'
  import type { getUsersMeRes, patchUsersMeBody } from '@/services/apifox/NODEJSDEMO/USERS/interface'
  import { getToken, getUserInfo, setUserInfo, type UserInfoType } from '@/utils/storage'
  import { uploadFile } from '@/utils/upload'
  import { checkLoginBeforeNavigator } from '@/utils/wxLogin'

  const PROFILE_ROUTE = '/subPackages/user/setting/profile'
  const loading = ref(true)
  const loadError = ref('')
  const saving = ref(false)
  const uploading = ref(false)
  const profile = ref<getUsersMeRes | null>(null)
  const name = ref('')
  const avatar = ref('')
  const initialName = ref('')
  const initialAvatar = ref('')

  const displayAvatar = computed(() => avatar.value || defaultAvatar)
  const hasChanges = computed(() => name.value.trim() !== initialName.value || avatar.value !== initialAvatar.value)
  const isBusy = computed(() => loading.value || saving.value || uploading.value)

  const syncStoredUser = (latestProfile: getUsersMeRes) => {
    const storedUser = getUserInfo()
    const mergedUser: UserInfoType = {
      ...(storedUser || {}),
      id: latestProfile.id,
      name: latestProfile.name,
      avatar: latestProfile.avatar,
    }
    setUserInfo(mergedUser)
  }

  const applyProfile = (latestProfile: getUsersMeRes) => {
    profile.value = latestProfile
    name.value = latestProfile.name
    avatar.value = latestProfile.avatar
    initialName.value = latestProfile.name
    initialAvatar.value = latestProfile.avatar
    syncStoredUser(latestProfile)
  }

  const loadProfile = async () => {
    loading.value = true
    loadError.value = ''
    try {
      applyProfile(await getUsersMe())
    } catch (error: unknown) {
      loadError.value = '资料加载失败'
      showSettingError(error, '获取资料失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const selectAvatar = async () => {
    if (isBusy.value) return
    uploading.value = true
    try {
      let platform: 'web' | 'wechat' = 'web'
      // #ifdef MP-WEIXIN
      platform = 'wechat'
      // #endif
      avatar.value = await uploadFile(platform, 'album', {
        isOssPrivate: false,
      })
    } catch (error: unknown) {
      if (!isSelectionCancelled(error)) {
        showSettingError(error, '头像上传失败，请稍后重试')
      }
    } finally {
      uploading.value = false
    }
  }

  const saveProfile = async () => {
    if (isBusy.value || !profile.value) return
    const trimmedName = name.value.trim()
    if (!trimmedName) {
      uni.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }

    const payload: patchUsersMeBody = {}
    if (trimmedName !== initialName.value) payload.name = trimmedName
    if (avatar.value !== initialAvatar.value) payload.avatar = avatar.value
    if (!Object.keys(payload).length) {
      uni.showToast({ title: '资料没有变化', icon: 'none' })
      return
    }

    saving.value = true
    try {
      await patchUsersMe(payload)
      applyProfile(await getUsersMe())
      uni.showToast({ title: '保存成功', icon: 'success' })
    } catch (error: unknown) {
      showSettingError(error, '保存失败，请稍后重试')
    } finally {
      saving.value = false
    }
  }

  onLoad(() => {
    if (!getToken()) {
      checkLoginBeforeNavigator(PROFILE_ROUTE)
      loading.value = false
      return
    }
    loadProfile()
  })
</script>

<template>
  <PageLayout title="我的资料">
    <view class="profile-page">
      <view v-if="loading" class="status-card">
        <text class="status-text">资料加载中...</text>
      </view>
      <view v-else-if="loadError" class="status-card">
        <text class="status-text">{{ loadError }}</text>
        <button class="retry-button" @click="loadProfile">重新加载</button>
      </view>
      <view v-else-if="profile" class="profile-card">
        <view class="form-row form-row--avatar" @click="selectAvatar">
          <text class="form-label">头像</text>
          <view class="avatar-action">
            <image class="avatar-image" :src="displayAvatar" mode="aspectFill" />
            <text class="row-arrow">›</text>
          </view>
        </view>
        <text v-if="uploading" class="upload-tip">头像上传中...</text>
        <view class="form-row form-row--name">
          <text class="form-label">昵称</text>
          <input v-model="name" class="name-input" :disabled="isBusy" placeholder="请输入昵称" confirm-type="done" />
        </view>
      </view>
      <button
        v-if="profile"
        class="save-button"
        :class="{ 'save-button--disabled': isBusy || !hasChanges }"
        :disabled="isBusy || !hasChanges"
        :loading="saving"
        @click="saveProfile">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .profile-page {
    min-height: 100vh;
    padding: 24rpx 32rpx calc(40rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .status-card,
  .profile-card {
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    background: var(--theme-surface);
  }

  .status-card {
    padding: 64rpx 32rpx;
    text-align: center;
  }

  .status-text,
  .upload-tip {
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

  .form-row {
    display: flex;
    min-height: 112rpx;
    padding: 20rpx 28rpx;
    align-items: center;
    box-sizing: border-box;
  }

  .form-row--avatar {
    min-height: 148rpx;
  }

  .form-row--name {
    border-top: 1rpx solid var(--theme-border);
  }

  .form-label {
    flex: 1;
    color: var(--theme-text);
    font-size: 30rpx;
  }

  .avatar-action {
    display: flex;
    align-items: center;
  }

  .avatar-image {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background: var(--theme-surface-2);
  }

  .row-arrow {
    margin-left: 20rpx;
    color: var(--theme-text-tertiary);
    font-size: 44rpx;
  }

  .name-input {
    width: 430rpx;
    color: var(--theme-text);
    font-size: 30rpx;
    text-align: right;
  }

  .upload-tip {
    display: block;
    padding: 0 28rpx 20rpx;
    text-align: right;
  }

  .save-button {
    height: 88rpx;
    margin-top: 40rpx;
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

  .save-button--disabled {
    opacity: 0.45;
  }
</style>
