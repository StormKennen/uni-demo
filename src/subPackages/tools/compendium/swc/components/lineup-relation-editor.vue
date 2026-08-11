<template>
  <view class="editor-card">
    <view class="editor-head">
      <view>
        <text class="editor-title">新增克制关系</text>
        <text class="editor-subtitle">关系方向固定为：防守阵容 → 进攻阵容</text>
      </view>
      <text class="pending-badge">待接入保存接口</text>
    </view>

    <view class="relation-row">
      <view class="relation-side">
        <text class="side-label">防守阵容</text>
        <view v-if="defense" class="selected-lineup">
          <view class="selected-main">
            <text class="selected-name">{{ defense.name || '未命名阵容' }}</text>
            <text class="selected-desc">{{ defense.description || '暂无描述' }}</text>
          </view>
          <button class="side-btn" size="mini" @click="emit('choose-defense')">重新选择</button>
        </view>
        <button v-else class="choose-btn" size="mini" @click="emit('choose-defense')">选择防守阵容</button>
      </view>

      <text class="relation-arrow">→</text>

      <view class="relation-side">
        <text class="side-label">进攻阵容</text>
        <view v-if="offense" class="selected-lineup">
          <view class="selected-main">
            <text class="selected-name">{{ offense.name || '未命名阵容' }}</text>
            <text class="selected-desc">{{ offense.description || '暂无描述' }}</text>
          </view>
          <button class="side-btn" size="mini" @click="emit('choose-offense')">重新选择</button>
        </view>
        <button v-else class="choose-btn" size="mini" @click="emit('choose-offense')">选择进攻阵容</button>
      </view>
    </view>

    <view class="description-field">
      <text class="side-label">关系说明（可选）</text>
      <textarea
        class="description-input"
        :value="description"
        :maxlength="500"
        placeholder="补充适用场景、速度要求或关键打法"
        @input="handleDescriptionInput" />
    </view>

    <view class="editor-actions">
      <button class="action-btn ghost" size="mini" @click="emit('cancel')">取消</button>
      <button class="action-btn primary" size="mini" :loading="saving" :disabled="saving || !defense || !offense" @click="emit('save')">
        保存关系
      </button>
    </view>

    <text class="pending-tip">BACKEND-CONTRACT-PENDING：保存请求体和用户侧关系接口待后端 Swagger/Apifox 确认。</text>
  </view>
</template>

<script setup lang="ts">
  import type { LineupOption } from '../lineup-types'

  defineProps<{
    defense: LineupOption | null
    offense: LineupOption | null
    description: string
    saving?: boolean
  }>()

  const emit = defineEmits<{
    (event: 'choose-defense'): void
    (event: 'choose-offense'): void
    (event: 'cancel'): void
    (event: 'save'): void
    (event: 'update:description', value: string): void
  }>()

  interface TextareaInputEvent {
    detail?: {
      value?: string
    }
  }

  const handleDescriptionInput = (event: TextareaInputEvent) => {
    emit('update:description', event.detail?.value || '')
  }
</script>

<style scoped lang="scss">
  .editor-card {
    margin: 24rpx;
    padding: 24rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    background: var(--theme-surface);
  }

  .editor-head,
  .selected-lineup,
  .editor-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .editor-title,
  .side-label {
    display: block;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 800;
  }

  .editor-subtitle,
  .pending-tip,
  .selected-desc {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    line-height: 1.5;
  }

  .pending-badge {
    flex-shrink: 0;
    padding: 8rpx 12rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }

  .relation-row {
    display: flex;
    align-items: stretch;
    gap: 12rpx;
    margin-top: 24rpx;
  }

  .relation-side {
    min-width: 0;
    flex: 1;
    padding: 16rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .relation-arrow {
    align-self: center;
    flex-shrink: 0;
    color: var(--theme-brand);
    font-size: 28rpx;
    font-weight: 800;
  }

  .selected-lineup {
    align-items: flex-start;
    margin-top: 12rpx;
  }

  .selected-main {
    min-width: 0;
    flex: 1;
  }

  .selected-name {
    display: block;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .choose-btn,
  .side-btn,
  .action-btn {
    margin: 12rpx 0 0;
    border-radius: 999rpx;
    font-size: 21rpx;
    font-weight: 700;
  }

  .side-btn {
    flex-shrink: 0;
    margin: 0;
    padding: 0 12rpx;
  }

  .choose-btn {
    width: 100%;
    color: var(--theme-brand);
  }

  .description-field {
    margin-top: 20rpx;
  }

  .description-input {
    width: 100%;
    min-height: 140rpx;
    margin-top: 10rpx;
    padding: 16rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 24rpx;
    line-height: 1.6;
  }

  .editor-actions {
    margin-top: 20rpx;
  }

  .action-btn {
    flex: 1;
    margin: 0;
  }

  .action-btn.primary {
    background: var(--theme-brand);
    color: #fff;
  }

  .pending-tip {
    margin-top: 16rpx;
  }
</style>
