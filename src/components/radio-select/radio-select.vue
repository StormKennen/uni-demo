<script setup lang="ts">
  interface Option {
    id: number | string
    name: string
  }

  interface Props {
    modelValue: number | string
    options: Option[]
    disabled?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:modelValue', 'change'])

  const handleSelect = (id: number | string) => {
    if (props.disabled) return
    emit('update:modelValue', id)
    emit('change', id)
  }
</script>

<template>
  <view class="radio-select">
    <view
      v-for="item in options"
      :key="item.id"
      class="radio-item"
      :class="{ active: modelValue === item.id }"
      @click="handleSelect(item.id)">
      <text class="radio-text">{{ item.name }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
  .radio-select {
    display: flex;
  }

  .radio-item {
    background: var(--theme-surface-2);
    border-radius: 41rpx;
    margin-left: 16rpx;
    width: 138rpx;
    height: 64rpx;
    line-height: 64rpx;
    border: 1px solid transparent;
    text-align: center;
    &.active {
      background: #ebf0f9;
      border-color: #0046b4;
      .radio-text {
        color: #0046b4;
      }
    }
  }
  .radio-item:first-child {
    margin-left: 0;
  }

  .radio-text {
    font-size: 26rpx;
    color: var(--theme-text);
  }
</style>
