<template>
  <view class="ga-check" @click="handleClick">
    <view class="ga-check-box">
      <slot v-if="modelValue" name="checked">
        <image 
          mode="aspectFit" 
          src="@/static/image/checked1.svg" 
          class="check-icon"
        />
      </slot>
      <slot v-if="!modelValue"  name="unchecked">
        <image 
          mode="aspectFit" 
          src="@/static/image/checked2.svg" 
          class="check-icon" 
        />
      </slot>
    </view>
    <view class="ga-check-label">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean,
  disabled?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const handleClick = () => {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
  emit('change', !props.modelValue)
}
</script>

<style lang="scss" scoped>
.ga-check {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.ga-check-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 28rpx;
  height: 28rpx;
  display: block;
  margin-top: 2rpx;
}

.ga-check-label {
  margin-left: 16rpx;
  font-size: 28rpx;
}
</style>
