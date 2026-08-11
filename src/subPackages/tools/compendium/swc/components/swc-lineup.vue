<template>
  <view class="swc-lineup">
    <view v-if="showHeader" class="lineup-head">
      <view class="lineup-title-wrap">
        <text v-if="showName && name" class="lineup-name">{{ name }}</text>
        <text v-if="showType && typeLabel" class="type-badge">{{ typeLabel }}</text>
      </view>
      <text v-if="showDescription && description" class="lineup-desc">{{ description }}</text>
    </view>

    <StateBlock v-if="!characters.length" class="lineup-empty" :text="emptyText" />

    <view v-else class="lineup-grid" :style="gridStyle">
      <SwcCharacterCard
        v-for="(character, index) in characters"
        :key="character.characterId || `${index}`"
        :character="character"
        :avatar-shape="avatarShape"
        :avatar-size="avatarSize"
        :show-name="showMemberName"
        :show-family="showFamily"
        :show-element="showElement"
        :show-type="showMemberType"
        :show-stars="showStars"
        :star-position="starPosition"
        :star-layout="starLayout"
        :show-original-stars="showOriginalStars"
        :show-remove="editable"
        :show-order="showOrder"
        :order="index + 1"
        :selectable="false"
        @click="handleCardClick"
        @remove="handleRemove" />
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getLineupTypeLabel } from '../lineup-meta'
  import type { SwcCharacterView } from '../utils'
  import StateBlock from './state-block.vue'
  import SwcCharacterCard from './swc-character-card.vue'

  type AvatarShape = 'square' | 'circle'
  type StarLayout = 'flat' | 'stacked'
  type StarPosition = 'overlay' | 'above'

  const props = withDefaults(
    defineProps<{
      characters?: SwcCharacterView[]
      name?: string
      description?: string
      type?: string
      showName?: boolean
      showDescription?: boolean
      showType?: boolean
      editable?: boolean
      columns?: number
      emptyText?: string
      showMemberName?: boolean
      showFamily?: boolean
      showMemberType?: boolean
      showStars?: boolean
      starPosition?: StarPosition
      starLayout?: StarLayout
      showOriginalStars?: boolean
      showElement?: boolean
      avatarShape?: AvatarShape
      avatarSize?: number
      showOrder?: boolean
    }>(),
    {
      characters: () => [],
      name: '',
      description: '',
      type: '',
      showName: false,
      showDescription: false,
      showType: false,
      editable: false,
      columns: 5,
      emptyText: '暂无角色',
      showMemberName: true,
      showFamily: false,
      showMemberType: false,
      showStars: true,
      starPosition: 'overlay',
      starLayout: 'flat',
      showOriginalStars: false,
      showElement: true,
      avatarShape: 'square',
      avatarSize: 92,
      showOrder: false,
    },
  )

  const emit = defineEmits<{
    (event: 'remove', characterId: string): void
    (event: 'card-click', character: SwcCharacterView): void
  }>()

  const typeLabel = computed(() => (props.type ? getLineupTypeLabel(props.type) : ''))
  const showHeader = computed(() => props.showName || props.showDescription || Boolean(typeLabel.value))
  const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${Math.max(props.columns, 1)}, minmax(0, 1fr))`,
  }))

  const handleCardClick = (character: SwcCharacterView) => {
    emit('card-click', character)
  }

  const handleRemove = (characterId: string) => {
    emit('remove', characterId)
  }
</script>

<style scoped lang="scss">
  .swc-lineup {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .lineup-head {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .lineup-title-wrap {
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10rpx;
  }

  .lineup-name {
    color: #172033;
    font-size: 28rpx;
    font-weight: 800;
    line-height: 1.3;
    word-break: break-word;
  }

  .lineup-desc {
    color: #667085;
    font-size: 22rpx;
    line-height: 1.5;
    word-break: break-word;
  }

  .type-badge {
    padding: 4rpx 12rpx;
    border-radius: 999rpx;
    background: #eef2ff;
    color: #4338ca;
    font-size: 20rpx;
    font-weight: 700;
  }

  .lineup-empty {
    border-radius: 18rpx;
  }

  .lineup-grid {
    display: grid;
    gap: 14rpx;
    align-items: stretch;
  }

  .lineup-grid :deep(.swc-character-card) {
    height: 100%;
  }
</style>
