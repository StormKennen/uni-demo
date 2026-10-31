<script setup lang="ts">
  import type { VoteParticipation } from '../types'

  const props = defineProps<{
    participation: VoteParticipation | null | undefined
    canViewCount: boolean
    canViewParticipants: boolean
  }>()

  const participantLabel = (participant: { name?: string; type: 'user' | 'guest' | 'anonymous' }): string => {
    if (participant.name) return participant.name
    if (participant.type === 'guest') return '游客'
    if (participant.type === 'anonymous') return '匿名参与者'
    return '参与者'
  }

  const participantInitial = (participant: { name?: string; type: 'user' | 'guest' | 'anonymous' }): string =>
    participantLabel(participant).slice(0, 1)
</script>

<template>
  <view v-if="props.canViewCount || props.canViewParticipants" class="participation-card">
    <view class="section-heading">
      <text class="section-title">参与情况</text>
      <text v-if="props.canViewCount" class="section-hint">已有 {{ props.participation?.total || 0 }} 人参与</text>
    </view>
    <view v-if="props.canViewParticipants && props.participation?.participants?.length" class="participant-list">
        <view v-for="participant in props.participation.participants" :key="participant.id" class="participant-item">
          <view class="avatar"
          ><text>{{ participantInitial(participant) }}</text></view
        >
        <text class="participant-name">{{ participantLabel(participant) }}</text>
      </view>
    </view>
    <text v-else-if="props.canViewParticipants" class="empty-participants">暂无参与者</text>
    <text v-else class="count-only-hint">仅展示参与人数，不展示成员名单</text>
  </view>
</template>

<style scoped lang="scss">
  .participation-card {
    margin-bottom: 20rpx;
    padding: 22rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
  }

  .section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .section-hint,
  .count-only-hint,
  .empty-participants {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .participant-list {
    display: flex;
    flex-wrap: wrap;
    gap: 18rpx;
    margin-top: 18rpx;
  }

  .participant-item {
    display: flex;
    align-items: center;
    max-width: 45%;
  }

  .avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    margin-right: 10rpx;
    border-radius: 50%;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 700;
  }

  .participant-name {
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count-only-hint,
  .empty-participants {
    display: block;
    margin-top: 18rpx;
  }
</style>
