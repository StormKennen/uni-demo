<!--
  SchemaForm —— 根据 SchemaField[] 自动渲染表单。
  Phase 1 实现的字段类型：input / switch / slider / radio / select
  通过 v-if 内联分发；后续要接更多类型时再抽离 fields/ 子目录。

  双向同步：组件接收 modelValue（draft 对象）。
  点击 / 切换字段时通过 setByPath 直接改 modelValue 的嵌套字段。
  父组件用 v-model 拿到响应式 draft 即可。
-->
<template>
  <view class="schema-form">
    <template v-for="field in visibleFields" :key="field.key">
      <view class="schema-field">
        <!-- 标签 + 说明 -->
        <view class="schema-field-header">
          <text class="schema-field-label">{{ field.label }}</text>
          <text v-if="field.hint" class="schema-field-hint">{{ field.hint }}</text>
        </view>

        <!-- input -->
        <input
          v-if="field.type === 'input'"
          class="schema-field-input"
          :value="readField(field)"
          :placeholder="field.placeholder || ''"
          @input="onInputChange(field, $event)"
        />

        <!-- switch -->
        <switch
          v-else-if="field.type === 'switch'"
          :checked="readField(field) === true"
          color="#667eea"
          @change="onSwitchChange(field, $event)"
        />

        <!-- slider -->
        <view v-else-if="field.type === 'slider'" class="schema-field-slider-wrap">
          <slider
            :value="Number(readField(field) ?? field.default ?? 0)"
            :min="field.min ?? 0"
            :max="field.max ?? 100"
            :step="field.step ?? 1"
            show-value
            activeColor="#667eea"
            @change="onSliderChange(field, $event)"
          />
        </view>

        <!-- radio -->
        <radio-group
          v-else-if="field.type === 'radio'"
          class="schema-field-radio-group"
          @change="onRadioChange(field, $event)"
        >
          <label
            v-for="opt in field.options || []"
            :key="String(opt.value)"
            class="schema-field-radio-item"
          >
            <radio
              :value="String(opt.value)"
              :checked="readField(field) === opt.value"
              color="#667eea"
            />
            <text class="schema-field-radio-text">{{ opt.label }}</text>
          </label>
        </radio-group>

        <!-- select（picker 实现，小程序友好） -->
        <picker
          v-else-if="field.type === 'select'"
          :value="getSelectIndex(field)"
          :range="field.options || []"
          range-key="label"
          @change="onSelectChange(field, $event)"
        >
          <view class="schema-field-select-btn">
            <text>{{ getSelectLabel(field) }}</text>
            <text class="schema-field-select-arrow">›</text>
          </view>
        </picker>

        <!-- textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          class="schema-field-textarea"
          :value="readField(field)"
          :placeholder="field.placeholder || ''"
          :auto-height="true"
          @input="onInputChange(field, $event)"
        />

        <!-- color：色板形式（options 必填，每项 value 是十六进制色） -->
        <view
          v-else-if="field.type === 'color'"
          class="schema-field-color-palette"
        >
          <view
            v-for="opt in field.options || []"
            :key="String(opt.value)"
            class="schema-field-color-swatch"
            :class="{ active: readField(field) === opt.value }"
            :style="{ backgroundColor: String(opt.value) || 'transparent' }"
            @click="writeField(field, opt.value)"
          >
            <text v-if="!opt.value" class="schema-field-color-empty">无</text>
          </view>
        </view>

        <!-- 未实现的类型：占位提示，方便后续扩展 -->
        <view v-else class="schema-field-todo">
          <text>[未实现的字段类型: {{ field.type }}]</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  type SchemaField,
  getByPath,
  setByPath,
} from '../schemas/schema-field'

interface Props {
  /** 待渲染的字段定义 */
  schema: SchemaField[]
  /** 受控数据对象（草稿）。组件直接修改它的嵌套字段。 */
  modelValue: any
}

const props = defineProps<Props>()

defineEmits<{
  // 仅为 Vue 类型友好；本组件直接在 modelValue 上原地修改
  (e: 'update:modelValue', value: any): void
}>()

// ============================================================
// 可见字段（计算 visible 条件）
// ============================================================
const visibleFields = computed(() =>
  props.schema.filter(
    (f) => typeof f.visible !== 'function' || f.visible(props.modelValue)
  )
)

// ============================================================
// 读 / 写工具
// ============================================================
const readField = (field: SchemaField) => {
  const v = getByPath(props.modelValue, field.key)
  return v === undefined ? field.default : v
}

const writeField = (field: SchemaField, value: any) => {
  setByPath(props.modelValue, field.key, value)
}

// ============================================================
// 各字段类型的 change handler
// ============================================================
const onInputChange = (field: SchemaField, e: any) => {
  writeField(field, e?.detail?.value ?? '')
}

const onSwitchChange = (field: SchemaField, e: any) => {
  writeField(field, !!e?.detail?.value)
}

const onSliderChange = (field: SchemaField, e: any) => {
  writeField(field, Number(e?.detail?.value ?? 0))
}

const onRadioChange = (field: SchemaField, e: any) => {
  // radio-group 的 detail.value 是字符串；要还原成原值类型
  const raw = e?.detail?.value
  const matched = (field.options || []).find((o) => String(o.value) === raw)
  writeField(field, matched ? matched.value : raw)
}

const onSelectChange = (field: SchemaField, e: any) => {
  const idx = Number(e?.detail?.value ?? 0)
  const opt = (field.options || [])[idx]
  if (opt) writeField(field, opt.value)
}

// select 显示当前选中项的 label / index
const getSelectIndex = (field: SchemaField): number => {
  const cur = readField(field)
  const idx = (field.options || []).findIndex((o) => o.value === cur)
  return idx < 0 ? 0 : idx
}

const getSelectLabel = (field: SchemaField): string => {
  const opts = field.options || []
  const cur = readField(field)
  const matched = opts.find((o) => o.value === cur)
  return matched ? matched.label : '请选择'
}
</script>

<style scoped>
.schema-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx;
}

.schema-field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.schema-field-header {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.schema-field-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.schema-field-hint {
  font-size: 22rpx;
  color: #888;
}

.schema-field-input {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  background: #fff;
}

.schema-field-slider-wrap {
  padding: 0 8rpx;
}

.schema-field-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.schema-field-radio-item {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
}

.schema-field-radio-text {
  font-size: 26rpx;
  color: #333;
}

.schema-field-select-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 14rpx 16rpx;
  font-size: 26rpx;
  background: #fff;
  color: #333;
}

.schema-field-select-arrow {
  color: #999;
  font-size: 28rpx;
}

.schema-field-todo {
  padding: 12rpx;
  background: #fff8e1;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #b07a00;
}

.schema-field-textarea {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  background: #fff;
  min-height: 120rpx;
  width: 100%;
  box-sizing: border-box;
}

.schema-field-color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.schema-field-color-swatch {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.schema-field-color-swatch.active {
  border-color: #667eea;
  transform: scale(1.1);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.schema-field-color-empty {
  font-size: 20rpx;
  color: #999;
}
</style>
