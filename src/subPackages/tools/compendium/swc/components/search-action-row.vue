<template>
  <view class="search-action-row">
    <input
      :value="modelValue"
      class="search-input"
      :confirm-type="confirmType"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @confirm="emitSearch" />
    <button
      class="search-btn"
      :class="theme"
      :size="resolvedButtonSize"
      :loading="loading"
      :disabled="disabled || loading"
      @click="emitSearch">
      {{ buttonText }}
    </button>
  </view>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    modelValue?: string
    placeholder?: string
    buttonText?: string
    confirmType?: string
    theme?: 'amber' | 'teal' | 'violet'
    buttonSize?: 'default' | 'mini'
    disabled?: boolean
    loading?: boolean
  }>(), {
    modelValue: '',
    placeholder: '请输入关键词',
    buttonText: '搜索',
    confirmType: 'search',
    theme: 'violet',
    buttonSize: 'mini',
    disabled: false,
    loading: false,
  })

  const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
    (event: 'search'): void
  }>()

  const resolvedButtonSize = props.buttonSize === 'mini' ? 'mini' : undefined

  const handleInput = (event: any) => {
    emit('update:modelValue', event?.detail?.value || '')
  }

  const emitSearch = () => {
    if (props.disabled || props.loading) return
    emit('search')
  }
</script>

<style scoped lang="scss">
  .search-action-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .search-input {
    flex: 1;
    min-width: 0;
    height: 76rpx;
    padding: 0 24rpx;
    border-radius: 18rpx;
    background: #f3f5f9;
    font-size: 28rpx;
  }

  .search-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .search-btn.amber {
    background: #b45309;
    color: #fff;
  }

  .search-btn.teal {
    background: #0f766e;
    color: #fff;
  }

  .search-btn.violet {
    background: #7c3aed;
    color: #fff;
  }
</style>
