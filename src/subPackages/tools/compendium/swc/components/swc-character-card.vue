<template>
  <view
    class="swc-character-card"
    :class="[
      `card-element-${character.elementKey || 'neutral'}`,
      {
        'avatar-circle': avatarShape === 'circle',
        selectable,
        selected,
        removable: showRemove,
      },
    ]"
    :style="cardStyle"
    @click="handleClick">
    <view class="avatar-wrap" :class="{ 'avatar-wrap-circle': avatarShape === 'circle' }" :style="avatarWrapStyle">
      <image
        v-if="character.avatar"
        class="avatar"
        :class="{ circle: avatarShape === 'circle' }"
        :src="character.avatar"
        mode="aspectFill"
        lazy-load />
      <view v-else class="avatar-placeholder" :class="{ circle: avatarShape === 'circle' }">
        <text>{{ character.name.slice(0, 1) || '?' }}</text>
      </view>

      <view v-if="showElement && character.elementKey" class="element-badge">
        <SwcSquareIcon kind="element" :icon-key="character.elementKey" :size="40" :radius="8" />
      </view>

      <view v-if="showOrder && order > 0" class="order-badge">
        <text>{{ order }}</text>
      </view>

      <view v-if="showRemove" class="remove-badge" @click.stop="handleRemove">
        <text>×</text>
      </view>

      <view v-else-if="showEdit" class="edit-badge" @click.stop="handleEdit">
        <text>✎</text>
      </view>

      <view v-else-if="selectable && selected" class="selected-badge">
        <text class="selected-badge-text">{{ selectedIndex > 0 ? selectedIndex : '✓' }}</text>
      </view>

      <view v-if="showStars && character.displayStars > 0" class="stars" :class="{ 'stars-stacked': starLayout === 'stacked' }">
        <text v-for="i in character.displayStars" :key="i" class="star-icon">★</text>
      </view>

      <view v-if="showOriginalStars && character.stars" class="original-stars">
        <text>{{ character.stars }}★</text>
      </view>
    </view>

    <view v-if="hasInfo" class="character-info">
      <text v-if="showName" class="character-title">{{ character.name || '未知魔灵' }}</text>
      <text v-if="showFamily && !showName" class="character-title">{{ character.familyName || '未知家族' }}</text>
      <text v-if="showFamily && showName" class="character-family">{{ character.familyName || '未知家族' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SwcSquareIcon from './swc-square-icon.vue'
  import type { SwcCharacterView } from '../utils'

  type AvatarShape = 'square' | 'circle'
  type StarLayout = 'flat' | 'stacked'

  const props = withDefaults(
    defineProps<{
      character: SwcCharacterView
      avatarShape?: AvatarShape
      showName?: boolean
      showFamily?: boolean
      showElement?: boolean
      showStars?: boolean
      starLayout?: StarLayout
      showOriginalStars?: boolean
      showRemove?: boolean
      showOrder?: boolean
      order?: number
      selectable?: boolean
      selected?: boolean
      selectedIndex?: number
      avatarSize?: number
      showEdit?: boolean
    }>(),
    {
      avatarShape: 'square',
      showName: true,
      showFamily: false,
      showElement: true,
      showStars: true,
      starLayout: 'flat',
      showOriginalStars: false,
      showRemove: false,
      showOrder: false,
      order: 0,
      selectable: false,
      selected: false,
      selectedIndex: 0,
      avatarSize: 240,
      showEdit: false,
    },
  )

  const emit = defineEmits<{
    (event: 'click', character: SwcCharacterView): void
    (event: 'remove', characterId: string): void
    (event: 'edit', character: SwcCharacterView): void
  }>()

  const hasInfo = computed(() => props.showName || props.showFamily)

  const cardStyle = computed(() => ({
    '--avatar-size': `${props.avatarSize}rpx`,
  }))

  const avatarWrapStyle = computed(() => ({
    '--avatar-size': `${props.avatarSize}rpx`,
  }))

  const handleClick = () => {
    emit('click', props.character)
  }

  const handleRemove = () => {
    emit('remove', props.character.characterId)
  }

  const handleEdit = () => {
    emit('edit', props.character)
  }
</script>

<style scoped lang="scss">
  .swc-character-card {
    position: relative;
    min-width: 0;
    border-radius: 18rpx;
    background: #f7f8fb;
    border: 2rpx solid rgba(255, 255, 255, 0.36);
    overflow: hidden;
    color: #fff;
    display: flex;
    flex-direction: column;
  }

  .avatar-wrap {
    position: relative;
    width: 100%;
    height: var(--avatar-size);
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.02));
    overflow: hidden;
  }

  .avatar {
    width: 100%;
    height: 100%;
    display: block;
  }

  .avatar.circle,
  .avatar-placeholder.circle {
    border-radius: 50%;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 44rpx;
    font-weight: 800;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.26), rgba(15, 23, 42, 0.12));
  }

  .avatar-wrap-circle {
    padding: 12rpx;
    box-sizing: border-box;
  }

  .avatar-wrap-circle .avatar,
  .avatar-wrap-circle .avatar-placeholder {
    border-radius: 50%;
  }

  .order-badge,
  .remove-badge,
  .edit-badge,
  .selected-badge,
  .original-stars,
  .element-badge {
    position: absolute;
    z-index: 2;
  }

  .element-badge {
    right: 0rpx;
    bottom: ß0rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 4rpx 10rpx rgba(15, 23, 42, 0.28));
  }

  .order-badge {
    top: 10rpx;
    left: 10rpx;
    min-width: 34rpx;
    height: 34rpx;
    padding: 0 8rpx;
    border-radius: 999rpx;
    background: rgba(15, 23, 42, 0.7);
    color: #fff;
    font-size: 20rpx;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .remove-badge {
    top: 10rpx;
    right: 10rpx;
    width: 34rpx;
    height: 34rpx;
    border-radius: 999rpx;
    background: rgba(220, 38, 38, 0.92);
    color: #fff;
    font-size: 28rpx;
    font-weight: 800;
    line-height: 34rpx;
    text-align: center;
    box-shadow: 0 4rpx 12rpx rgba(220, 38, 38, 0.28);
  }

  .edit-badge {
    top: 10rpx;
    right: 10rpx;
    width: 34rpx;
    height: 34rpx;
    border-radius: 999rpx;
    background: rgba(59, 130, 246, 0.92);
    color: #fff;
    font-size: 22rpx;
    font-weight: 800;
    line-height: 34rpx;
    text-align: center;
    box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.28);
  }

  .selected-badge {
    top: 10rpx;
    right: 10rpx;
    min-width: 36rpx;
    height: 36rpx;
    padding: 0 8rpx;
    border-radius: 999rpx;
    background: rgba(15, 118, 110, 0.94);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(15, 118, 110, 0.28);
  }

  .selected-badge-text {
    font-size: 20rpx;
    font-weight: 800;
    line-height: 1;
  }

  .stars {
    position: absolute;
    left: 10rpx;
    top: 10rpx;
    display: flex;
    align-items: flex-end;
    gap: 4rpx;
    z-index: 1;
  }

  .star-icon {
    font-size: 20rpx;
    color: #fbbf24;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.25);
  }

  // 层叠样式：从左往右，右侧星星叠压在左侧星星约 1/3 处
  .stars-stacked {
    gap: 0;
  }

  .stars-stacked .star-icon + .star-icon {
    margin-left: -0.34em;
  }

  .original-stars {
    left: 10rpx;
    bottom: 10rpx;
    padding: 2rpx 10rpx;
    border-radius: 999rpx;
    background: rgba(15, 23, 42, 0.66);
    color: #fff;
    font-size: 20rpx;
    font-weight: 700;
  }

  .character-info {
    min-width: 0;
    padding: 12rpx 14rpx 14rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .character-title {
    min-width: 0;
    color: #172033;
    font-size: 24rpx;
    font-weight: 800;
    line-height: 1.3;
    word-break: break-word;
  }

  .character-family {
    color: #556174;
    font-size: 22rpx;
    font-weight: 700;
    line-height: 1.3;
    word-break: break-word;
  }

  .card-element-fire {
    background: linear-gradient(180deg, #fff4ea 0%, #fff 100%);
  }

  .card-element-water {
    background: linear-gradient(180deg, #edf6ff 0%, #fff 100%);
  }

  .card-element-wind {
    background: linear-gradient(180deg, #effaf2 0%, #fff 100%);
  }

  .card-element-light {
    background: linear-gradient(180deg, #fff8dd 0%, #fff 100%);
  }

  .card-element-dark {
    background: linear-gradient(180deg, #f3efff 0%, #fff 100%);
  }

  .card-element-neutral {
    background: #f7f8fb;
  }

  .selectable {
    cursor: pointer;
  }

  .selected {
    box-shadow: 0 0 0 2rpx rgba(15, 118, 110, 0.3) inset;
  }
</style>
