<script setup lang="ts">
  import { computed } from 'vue'
  import type { InputOnInputEvent, TextareaOnInputEvent } from '@uni-helper/uni-app-types'
  import type { RelayFieldValue, RelayFieldViewModel } from '../types'

  const props = withDefaults(
    defineProps<{
      field: RelayFieldViewModel
      modelValue: RelayFieldValue
      disabled?: boolean
      error?: string
    }>(),
    { disabled: false, error: '' },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: RelayFieldValue]
  }>()

  const displayValue = computed(() => (typeof props.modelValue === 'string' ? props.modelValue : ''))
  const displayNumber = computed(() => (typeof props.modelValue === 'number' ? String(props.modelValue) : ''))

  type RelayInputEvent = InputOnInputEvent | TextareaOnInputEvent

  const readInputValue = (event: RelayInputEvent): string => String(event.detail?.value ?? '')

  const updateText = (event: RelayInputEvent) => emit('update:modelValue', readInputValue(event))

  const normalizeNumber = (value: number): number => {
    const min = props.field.config.min ?? 0
    const max = props.field.config.max ?? Number.MAX_SAFE_INTEGER
    return Math.min(max, Math.max(min, value))
  }

  const updateNumber = (value: number) => emit('update:modelValue', normalizeNumber(value))

  const updateNumberInput = (event: InputOnInputEvent) => {
    const value = Number(readInputValue(event))
    if (Number.isFinite(value)) updateNumber(value)
  }

  const stepNumber = (delta: number) => {
    const current = typeof props.modelValue === 'number' ? props.modelValue : props.field.config.min ?? 0
    updateNumber(current + delta)
  }

  const selectOption = (value: string) => emit('update:modelValue', value)
</script>

<template>
  <view class="field-input">
    <view class="field-label-row">
      <text class="field-label">{{ field.label }}</text>
      <text v-if="field.required" class="required-mark">必填</text>
    </view>

    <input
      v-if="field.type === 'text'"
      class="field-control"
      :value="displayValue"
      :maxlength="field.config.maxLength"
      :disabled="disabled"
      placeholder="请输入"
      @input="updateText" />

    <textarea
      v-else-if="field.type === 'textarea'"
      class="field-control field-textarea"
      :value="displayValue"
      :maxlength="field.config.maxLength"
      :disabled="disabled"
      placeholder="请输入"
      auto-height
      @input="updateText" />

    <view v-else-if="field.type === 'number'" class="number-control">
      <button class="step-button" :disabled="disabled" @click="stepNumber(-1)">−</button>
      <input class="number-input" type="number" :value="displayNumber" :disabled="disabled" @input="updateNumberInput" />
      <button class="step-button" :disabled="disabled" @click="stepNumber(1)">＋</button>
    </view>

    <view v-else class="option-list">
      <button
        v-for="option in field.options"
        :key="option.value"
        class="option-chip"
        :class="{ selected: modelValue === option.value }"
        :disabled="disabled"
        @click="selectOption(option.value)">
        {{ option.label }}
      </button>
    </view>

    <view class="field-footer">
      <text v-if="error" class="field-error">{{ error }}</text>
      <text v-if="field.type === 'textarea' && field.config.maxLength" class="field-counter">
        {{ displayValue.length }} / {{ field.config.maxLength }}
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .field-input {
    margin-bottom: 28rpx;
  }

  .field-label-row,
  .field-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .field-label {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .required-mark,
  .field-error {
    color: var(--theme-danger);
    font-size: 22rpx;
  }

  .field-control {
    width: 100%;
    min-height: 84rpx;
    margin-top: 14rpx;
    padding: 0 22rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 27rpx;
  }

  .field-textarea {
    min-height: 180rpx;
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    line-height: 1.6;
  }

  .field-footer {
    min-height: 32rpx;
    padding-top: 6rpx;
  }

  .field-counter {
    margin-left: auto;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .number-control {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 14rpx;
  }

  .step-button {
    width: 78rpx;
    height: 72rpx;
    padding: 0;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 34rpx;
    line-height: 70rpx;
  }

  .step-button::after,
  .option-chip::after {
    display: none;
  }

  .number-input {
    flex: 1;
    height: 72rpx;
    margin: 0 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    text-align: center;
    font-size: 29rpx;
    font-weight: 700;
  }

  .option-list {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
    margin-top: 14rpx;
  }

  .option-chip {
    min-width: 120rpx;
    min-height: 64rpx;
    margin: 0;
    padding: 0 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 62rpx;
  }

  .option-chip.selected {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: var(--theme-bg);
  }
</style>
