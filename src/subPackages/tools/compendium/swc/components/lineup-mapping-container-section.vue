<template>
  <view class="container-section">
    <view class="section-head">
      <text class="section-title">{{ title }}</text>
      <view class="section-head-right">
        <text class="section-count">{{ container.items.length }} 个阵容</text>
        <button v-if="canEdit" class="add-btn" size="mini" @click="emit('add')">新增阵容</button>
      </view>
    </view>

    <StateBlock v-if="!container.items.length" class="empty-block" text="该容器暂无阵容" />

    <view v-else class="item-list">
      <view v-for="item in container.items" :key="item.itemId" class="item-card">
        <LineupAvatarCard
          :name="item.lineup?.name"
          :type="item.lineup?.type"
          :characters="charactersOf(item.lineupId)"
          show-name
          show-type
          show-attributes
          show-stars
          :columns="6"
          :avatar-size="80" />

        <view class="item-actions">
          <view class="reaction-group">
            <button
              class="reaction-btn"
              :class="{ active: item.myReaction === 1 }"
              size="mini"
              :disabled="reactingId === item.itemId"
              @click="emit('react', { containerId: container.containerId, itemId: item.itemId, lineupId: item.lineupId, value: 1 })">
              👍 {{ item.likeCount }}
            </button>
            <button
              class="reaction-btn"
              :class="{ active: item.myReaction === -1 }"
              size="mini"
              :disabled="reactingId === item.itemId"
              @click="emit('react', { containerId: container.containerId, itemId: item.itemId, lineupId: item.lineupId, value: -1 })">
              👎 {{ item.dislikeCount }}
            </button>
          </view>

          <button
            v-if="canEdit"
            class="remove-btn"
            size="mini"
            :loading="removingId === item.itemId"
            @click="emit('remove', { containerId: container.containerId, itemId: item.itemId, lineupId: item.lineupId })">
            移除
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import StateBlock from './state-block.vue'
  import LineupAvatarCard from './lineup-avatar-card.vue'
  import type { LineupCharacterPreview, LineupMappingContainer, ReactionValue } from '@/services/compendium-lineups'

  const props = withDefaults(
    defineProps<{
      title: string
      container: LineupMappingContainer
      canEdit?: boolean
      characterMap?: Record<string, LineupCharacterPreview[]>
      reactingId?: string
      removingId?: string
    }>(),
    {
      canEdit: false,
      characterMap: () => ({}),
      reactingId: '',
      removingId: '',
    },
  )

  const emit = defineEmits<{
    (event: 'add'): void
    (event: 'react', payload: { containerId: string; itemId: string; lineupId: string; value: ReactionValue }): void
    (event: 'remove', payload: { containerId: string; itemId: string; lineupId: string }): void
  }>()

  const charactersOf = (lineupId: string): LineupCharacterPreview[] => props.characterMap[lineupId] || []
</script>

<style scoped lang="scss">
  .container-section {
    margin: 0 24rpx 20rpx;
    padding: 24rpx;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 18rpx;
  }

  .section-title {
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .section-head-right {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .section-count {
    color: #667085;
    font-size: 22rpx;
    font-weight: 700;
  }

  .add-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
    background: #0f766e;
    color: #fff;
  }

  .empty-block {
    padding: 40rpx 28rpx;
    text-align: center;
    color: #98a2b3;
    font-size: 24rpx;
    background: #f8fafc;
    border-radius: 16rpx;
  }

  .item-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .item-card {
    padding: 20rpx;
    border-radius: 20rpx;
    background: #f8fafc;
  }

  .item-actions {
    margin-top: 18rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .reaction-group {
    display: flex;
    gap: 14rpx;
  }

  .reaction-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
    background: #fff;
    color: #475467;
    border: 2rpx solid #e5e7eb;
  }

  .reaction-btn.active {
    background: #ccfbf1;
    color: #0f766e;
    border-color: #0f766e;
  }

  .remove-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: #dc2626;
    background: #fff1f2;
    border: 2rpx solid #fecdd3;
  }
</style>
