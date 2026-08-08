<template>
  <view class="character-slots" :style="rootStyle">
    <view
      v-for="(character, index) in characters"
      :key="character.characterId || `${index}`"
      class="character-slot filled"
      @click="handleCharacterClick(character, index)">
      <image v-if="character.avatar" class="character-avatar" :src="character.avatar" mode="aspectFill" lazy-load />
      <view v-else class="character-avatar character-avatar-placeholder">
        <text>{{ (character.name || '?').slice(0, 1) }}</text>
      </view>

      <view
        v-if="removable && !disabled"
        class="remove-button"
        @click.stop="handleRemove(character, index)">
        <text class="remove-icon">×</text>
      </view>
    </view>

    <view
      v-if="showAddSlot"
      class="character-slot add-slot"
      :class="{ disabled }"
      @click="handleAdd">
      <text class="add-icon">+</text>
      <text class="add-label">添加</text>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { SwcCharacterView } from '../utils'

  const props = withDefaults(
    defineProps<{
      characters?: SwcCharacterView[]
      /** 0 / undefined = 不限数量；1 = 单选；>1 = 固定上限 */
      maxCount?: number
      disabled?: boolean
      removable?: boolean
      /** 槽位边长 rpx */
      size?: number
    }>(),
    {
      characters: () => [],
      maxCount: 0,
      disabled: false,
      removable: true,
      size: 120,
    },
  )

  const emit = defineEmits<{
    (event: 'add'): void
    (event: 'remove', character: SwcCharacterView, index: number): void
    (event: 'character-click', character: SwcCharacterView, index: number): void
  }>()

  const unlimited = computed(() => !props.maxCount || props.maxCount <= 0)

  const showAddSlot = computed(() => {
    if (props.disabled) return false
    if (unlimited.value) return true
    return props.characters.length < props.maxCount
  })

  const rootStyle = computed(() => ({
    '--slot-size': `${props.size}rpx`,
  }))

  const handleAdd = () => {
    if (props.disabled || !showAddSlot.value) return
    emit('add')
  }

  const handleRemove = (character: SwcCharacterView, index: number) => {
    if (props.disabled || !props.removable) return
    emit('remove', character, index)
  }

  const handleCharacterClick = (character: SwcCharacterView, index: number) => {
    emit('character-click', character, index)
  }
</script>

<style scoped lang="scss">
  .character-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .character-slot {
    position: relative;
    width: var(--slot-size);
    height: var(--slot-size);
    border-radius: 16rpx;
    box-sizing: border-box;
    overflow: visible;
    flex-shrink: 0;
  }

  .character-slot.filled {
    background: var(--theme-surface-2);
    border: 2rpx solid var(--theme-border);
    overflow: hidden;
  }

  .character-avatar {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 14rpx;
  }

  .character-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 36rpx;
    font-weight: 800;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.28), rgba(15, 23, 42, 0.12));
  }

  .remove-button {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    z-index: 2;
    width: 34rpx;
    height: 34rpx;
    border-radius: 50%;
    background: rgba(220, 38, 38, 0.94);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 10rpx rgba(220, 38, 38, 0.28);
  }

  .remove-icon {
    font-size: 26rpx;
    font-weight: 800;
    line-height: 1;
  }

  .add-slot {
    border: 2rpx dashed var(--theme-border);
    background: var(--theme-surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
  }

  .add-slot:active {
    border-color: var(--theme-brand);
    background: var(--theme-surface-2);
  }

  .add-slot.disabled {
    opacity: 0.5;
  }

  .add-icon {
    color: var(--theme-text-tertiary);
    font-size: 40rpx;
    font-weight: 500;
    line-height: 1;
  }

  .add-label {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    font-weight: 700;
    line-height: 1;
  }
</style>
