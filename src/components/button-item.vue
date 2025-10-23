<template>
  <view class="button-item" @click="handlerClick">
    <slot>
      <text class="button-item-text" :class="{ 'has-select': checkSelect(text), 'is-disabled': disabled }">
        {{ text }}
      </text>
    </slot>
    <slot name="icon">
      <uni-icons v-if="hasIcon" type="right" size="15" color="#B9C1CC"></uni-icons>
    </slot>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text?: string
  hasIcon?: boolean
  checkSelect?: (text: string) => boolean
  disabled?: boolean
}>(), {
  hasIcon: true,
  checkSelect: (text: string) => text !== '请选择'
})

const emits = defineEmits<{
  click: []
}>()

const handlerClick = () => {
  if (props.disabled) return
  emits('click')
}
</script>

<style scoped lang="scss">
.button-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.button-item-text {
  color: #B9C1CC;
  line-height: 34rpx;
  font-size: 28rpx;
  padding-left: 10px;
  margin: 32rpx 0;
  font-weight: 400;
  &.has-select {
    color: #121A26;
    font-weight: 500;
  }

  &.is-disabled {
    color: #121a26;
  }
}
</style>