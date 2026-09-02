<script setup lang="ts">
  import { computed } from 'vue'
  import { formatRelayDate } from '../constants'
  import { getEntryFieldDisplay } from '../normalizers'
  import type { RelayEntryViewModel, RelayFieldViewModel } from '../types'

  const props = defineProps<{
    entry: RelayEntryViewModel
    fields: RelayFieldViewModel[]
    showSequence: boolean
    canEdit: boolean
    canWithdraw: boolean
  }>()

  const emit = defineEmits<{
    edit: []
    withdraw: []
  }>()

  const imageItems = computed(() => {
    const imageFields = props.fields.filter(field => field.type === 'image')
    return imageFields.flatMap(field => {
      const values = props.entry.values[field.key]
      if (!Array.isArray(values)) return []
      return values.filter((value): value is string => typeof value === 'string' && value.startsWith('http'))
    })
  })

  const visibleFields = computed(() => props.fields.filter(field => field.type !== 'image' && props.entry.values[field.key] !== undefined))
  const hasHiddenImageValues = computed(() => props.fields.some(field => field.type === 'image' && Array.isArray(props.entry.values[field.key]) && (props.entry.values[field.key] as unknown[]).length > 0))

  const previewImage = (current: string) => uni.previewImage({ urls: imageItems.value, current })
</script>

<template>
  <view class="entry-card">
    <view class="entry-topline">
      <view class="entry-person">
        <text v-if="showSequence" class="entry-sequence">{{ entry.sequenceNo }}</text>
        <text class="entry-nickname">{{ entry.participant.nickname }}</text>
        <text v-if="entry.isMine" class="mine-tag">我</text>
      </view>
      <text class="entry-date">{{ formatRelayDate(entry.createdAt) }}</text>
    </view>

    <view v-for="field in visibleFields" :key="field.key" class="entry-field">
      <text class="entry-field__label">{{ field.label }}</text>
      <text class="entry-field__value">{{ getEntryFieldDisplay(field, entry.values[field.key]) }}</text>
    </view>

    <view v-if="imageItems.length" class="entry-images">
      <image v-for="url in imageItems" :key="url" class="entry-image" :src="url" mode="aspectFill" @click="previewImage(url)" />
    </view>
    <text v-else-if="hasHiddenImageValues" class="image-unavailable">
      已提交图片
    </text>

    <view v-if="(entry.isMine && canEdit) || (entry.isMine && canWithdraw)" class="entry-actions">
      <text v-if="entry.isMine && canEdit" class="entry-action" @click="emit('edit')">编辑</text>
      <text v-if="entry.isMine && canWithdraw" class="entry-action entry-action--danger" @click="emit('withdraw')">撤回</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .entry-card {
    margin-bottom: 18rpx;
    padding: 24rpx 22rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 28rpx var(--theme-shadow-xs);
  }

  .entry-topline,
  .entry-person,
  .entry-actions {
    display: flex;
    align-items: center;
  }

  .entry-topline {
    justify-content: space-between;
  }

  .entry-sequence {
    min-width: 52rpx;
    color: var(--theme-brand);
    font-size: 30rpx;
    font-weight: 800;
  }

  .entry-nickname {
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 700;
  }

  .mine-tag {
    margin-left: 10rpx;
    padding: 4rpx 10rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 19rpx;
  }

  .entry-date,
  .image-unavailable {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .entry-field {
    display: flex;
    align-items: flex-start;
    margin-top: 20rpx;
  }

  .entry-field__label {
    flex-shrink: 0;
    width: 150rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .entry-field__value {
    flex: 1;
    color: var(--theme-text);
    font-size: 25rpx;
    line-height: 1.55;
    word-break: break-all;
  }

  .entry-images {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 20rpx;
  }

  .entry-image {
    width: 192rpx;
    height: 192rpx;
    border-radius: 14rpx;
  }

  .image-unavailable {
    display: block;
    margin-top: 18rpx;
  }

  .entry-actions {
    justify-content: flex-end;
    gap: 24rpx;
    margin-top: 20rpx;
  }

  .entry-action {
    color: var(--theme-brand);
    font-size: 23rpx;
  }

  .entry-action--danger {
    color: var(--theme-danger);
  }
</style>
