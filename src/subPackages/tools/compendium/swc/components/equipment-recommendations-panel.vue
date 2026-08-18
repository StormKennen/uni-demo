<template>
  <view class="equipment-panel">
    <view v-if="loading" class="equipment-state">
      <text>加载推荐符文与神器中...</text>
    </view>
    <view v-else-if="errorMessage" class="equipment-state equipment-state--error">
      <text>{{ errorMessage }}</text>
      <button class="equipment-retry" @click="emit('retry')">重试</button>
    </view>
    <template v-else>
      <view class="equipment-mode-tabs">
        <view class="equipment-mode-tab" :class="{ active: activeMode === 'runes' }" @click="activeMode = 'runes'">
          <text>推荐符文</text>
        </view>
        <view class="equipment-mode-tab" :class="{ active: activeMode === 'artifacts' }" @click="activeMode = 'artifacts'">
          <text>推荐神器</text>
        </view>
      </view>

      <view v-if="activeMode === 'runes'" class="equipment-content">
        <view v-if="runes.length === 0" class="equipment-state"><text>暂无推荐符文数据</text></view>
        <view v-for="recommendation in runes" :key="recommendation.key" class="equipment-context">
          <view class="equipment-context-head">
            <text class="equipment-context-title">{{ recommendation.label }}</text>
            <text class="equipment-context-code">{{ recommendation.context.toUpperCase() }}</text>
          </view>

          <view v-if="recommendation.sets.length" class="equipment-group">
            <text class="equipment-group-title">套装组合</text>
            <view class="rune-set-list">
              <view v-for="set in recommendation.sets" :key="set.key" class="rune-set-row">
                <text v-if="set.rank" class="equipment-rank">#{{ set.rank }}</text>
                <view class="rune-set-icons">
                  <view v-for="rune in set.runes" :key="rune.key" class="rune-set-item">
                    <SwcSquareIcon kind="rune" :icon-key="rune.key" :size="58" :radius="8" />
                    <text>{{ rune.label }}</text>
                  </view>
                </view>
                <text v-if="set.usage.text" class="equipment-usage">{{ set.usage.text }}</text>
              </view>
            </view>
          </view>

          <view class="equipment-group">
            <text class="equipment-group-title">2 / 4 / 6 号位主属性</text>
            <view class="rune-slot-grid">
              <view v-for="slot in recommendation.slots" :key="slot.slot" class="rune-slot-column">
                <view class="rune-slot-head">
                  <SwcSquareIcon kind="rune-slot" :icon-key="slot.slot" :size="64" :radius="8" />
                  <text>{{ slot.slot }}号位</text>
                </view>
                <view v-if="slot.stats.length" class="ranked-text-list">
                  <view v-for="stat in slot.stats" :key="stat.key" class="ranked-text-row">
                    <text class="ranked-text-label">{{ stat.label }}</text>
                    <text v-if="stat.usage.text" class="ranked-text-usage">{{ stat.usage.text }}</text>
                  </view>
                </view>
                <text v-else class="ranked-text-empty">暂无</text>
              </view>
            </view>
          </view>

          <view v-if="recommendation.priorityStats.length" class="equipment-group">
            <text class="equipment-group-title">副属性优先级</text>
            <view class="priority-stat-list">
              <view v-for="stat in recommendation.priorityStats" :key="stat.key" class="priority-stat-row">
                <text class="priority-stat-rank">{{ stat.rank || '·' }}</text>
                <text class="priority-stat-label">{{ stat.label }}</text>
                <text v-if="stat.usage.text" class="equipment-usage">{{ stat.usage.text }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="equipment-content">
        <view v-if="artifacts.length === 0" class="equipment-state"><text>暂无推荐神器数据</text></view>
        <view v-for="recommendation in artifacts" :key="recommendation.key" class="equipment-context">
          <view class="equipment-context-head">
            <text class="equipment-context-title">{{ recommendation.label }}</text>
            <text class="equipment-context-code">{{ recommendation.context.toUpperCase() }}</text>
          </view>
          <view v-for="group in recommendation.groups" :key="group.key" class="artifact-group">
            <view class="artifact-group-head">
              <view class="artifact-icon-stack">
                <SwcSquareIcon v-if="group.key !== 'unspecified'" kind="artifact-slot" :icon-key="group.key" :size="72" :radius="10" />
                <SwcSquareIcon
                  class="artifact-corner-icon"
                  v-if="group.key === 'attribute' && elementKey"
                  kind="artifact-attribute"
                  :icon-key="elementKey"
                  :size="34"
                  :radius="4"
                  background="var(--theme-surface)" />
                <SwcSquareIcon
                  class="artifact-corner-icon"
                  v-if="group.key === 'type' && archetype"
                  kind="artifact-type"
                  :icon-key="archetype"
                  :size="34"
                  :radius="4"
                  background="var(--theme-surface)" />
              </view>
              <text class="artifact-group-title">{{ group.label }}</text>
            </view>
            <view v-if="group.primaries.length" class="artifact-effect-section">
              <text class="artifact-effect-label">主属性</text>
              <view class="artifact-effect-list">
                <view v-for="effect in group.primaries" :key="effect.key" class="artifact-effect-row">
                  <text>{{ effect.label }}</text>
                  <text v-if="effect.usage.text" class="equipment-usage">{{ effect.usage.text }}</text>
                </view>
              </view>
            </view>
            <view v-if="group.preferredEffects.length" class="artifact-effect-section">
              <text class="artifact-effect-label">推荐副属性</text>
              <view class="artifact-effect-list">
                <view v-for="effect in group.preferredEffects" :key="effect.key" class="artifact-effect-row">
                  <text>{{ effect.label }}</text>
                  <text v-if="effect.usage.text" class="equipment-usage">{{ effect.usage.text }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { ArtifactRecommendationViewModel, RuneRecommendationViewModel } from '../equipment-normalizers'
  import SwcSquareIcon from './swc-square-icon.vue'

  withDefaults(
    defineProps<{
      loading?: boolean
      errorMessage?: string
      runes?: RuneRecommendationViewModel[]
      artifacts?: ArtifactRecommendationViewModel[]
      elementKey?: string
      archetype?: string
    }>(),
    {
      loading: false,
      errorMessage: '',
      runes: () => [],
      artifacts: () => [],
      elementKey: '',
      archetype: '',
    },
  )

  const emit = defineEmits<{
    retry: []
  }>()

  const activeMode = ref<'runes' | 'artifacts'>('runes')
</script>

<style scoped lang="scss">
  .equipment-panel {
    padding: 14rpx 20rpx 24rpx;
  }

  .equipment-mode-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5rpx;
    padding: 5rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
    background: var(--theme-surface-2);
  }

  .equipment-mode-tab {
    height: 58rpx;
    border-radius: 9rpx;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .equipment-mode-tab.active {
    color: #fff;
    background: var(--theme-brand);
  }

  .equipment-content {
    margin-top: 14rpx;
  }

  .equipment-context {
    margin-bottom: 16rpx;
    padding: 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    background: var(--theme-surface);
  }

  .equipment-context-head,
  .rune-set-row,
  .priority-stat-row,
  .artifact-effect-row {
    display: flex;
    align-items: center;
  }

  .equipment-context-head {
    justify-content: space-between;
    gap: 16rpx;
  }

  .equipment-context-title {
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 800;
  }

  .equipment-context-code {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    font-weight: 700;
  }

  .equipment-group,
  .artifact-group {
    margin-top: 18rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .equipment-group-title,
  .artifact-group-title {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 800;
  }

  .rune-set-list,
  .ranked-text-list,
  .priority-stat-list,
  .artifact-effect-list {
    margin-top: 12rpx;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .rune-set-row {
    min-height: 68rpx;
    gap: 12rpx;
  }

  .equipment-rank {
    width: 38rpx;
    color: var(--theme-brand);
    font-size: 21rpx;
    font-weight: 800;
    flex: none;
  }

  .rune-set-icons {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .rune-set-item {
    display: inline-flex;
    align-items: center;
    gap: 7rpx;
    color: var(--theme-text);
    font-size: 23rpx;
    font-weight: 700;
  }

  .equipment-usage,
  .ranked-text-usage {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    flex: none;
  }

  .rune-slot-grid {
    margin-top: 12rpx;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10rpx;
  }

  .rune-slot-column {
    min-width: 0;
    padding: 12rpx 10rpx;
    border-radius: 10rpx;
    background: var(--theme-surface-2);
  }

  .rune-slot-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    font-weight: 700;
  }

  .ranked-text-row {
    min-width: 0;
    text-align: center;
  }

  .ranked-text-label,
  .ranked-text-usage {
    display: block;
    overflow-wrap: anywhere;
  }

  .ranked-text-label {
    color: var(--theme-text);
    font-size: 22rpx;
    font-weight: 700;
  }

  .ranked-text-usage {
    margin-top: 3rpx;
  }

  .ranked-text-empty {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    text-align: center;
  }

  .priority-stat-row {
    min-height: 52rpx;
    gap: 12rpx;
  }

  .priority-stat-rank {
    width: 34rpx;
    height: 34rpx;
    border-radius: 50%;
    color: #fff;
    background: var(--theme-brand);
    font-size: 19rpx;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }

  .priority-stat-label {
    min-width: 0;
    flex: 1;
    color: var(--theme-text);
    font-size: 23rpx;
    font-weight: 700;
  }

  .artifact-group-head {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .artifact-icon-stack {
    position: relative;
    width: 72rpx;
    height: 72rpx;
    flex: none;
  }

  .artifact-corner-icon {
    position: absolute;
    right: -4rpx;
    bottom: -4rpx;
    border: 2rpx solid var(--theme-surface);
  }

  .artifact-effect-section {
    margin-top: 14rpx;
  }

  .artifact-effect-label {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    font-weight: 700;
  }

  .artifact-effect-row {
    min-height: 48rpx;
    justify-content: space-between;
    gap: 16rpx;
    color: var(--theme-text);
    font-size: 23rpx;
  }

  .equipment-state {
    min-height: 180rpx;
    padding: 24rpx;
    color: var(--theme-text-tertiary);
    font-size: 25rpx;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .equipment-state--error {
    color: var(--theme-text-secondary);
  }

  .equipment-retry {
    min-width: 132rpx;
    height: 58rpx;
    margin-top: 16rpx;
    border: 1rpx solid var(--theme-brand);
    border-radius: 10rpx;
    color: var(--theme-brand);
    background: var(--theme-surface);
    font-size: 23rpx;
    line-height: 58rpx;
  }

  .equipment-retry::after {
    border: 0;
  }
</style>
