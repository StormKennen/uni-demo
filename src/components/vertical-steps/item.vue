<template>
  <view class="vertical-step-item">
    <view>
      <slot name="left"></slot>
    </view>
    <view class="vertical-step-icon-box">
      <view :style="beforeLineStyle" class="vertical-step-line"
        :class="{ 'is-hide': stepIndex === 0, 'solid': isBeforStep(stepIndex), 'dashed': isAfterStep(stepIndex) }">
      </view>
      <view class="vertical-step-outer-icon">
        <view class="vertical-step-inner-icon" :class="getIconStatus">
          <image class="icon-image" :src="CheckedIcon" mode="scaleToFill" v-if="getIconStatus === 'complete'" />
        </view>
      </view>
      <view class="vertical-step-line"
        :class="{ 'is-hide': isLast, 'solid': isBeforStep(stepIndex + 1), 'dashed': isAfterStep(stepIndex + 1) && (getIconStatus !== 'complete') }">
      </view>
    </view>
    <view class="vertical-step-item-content">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useVerticalStepInject } from './hook'
const { addStep, removeStep, steps, activeStep } = useVerticalStepInject()
import CheckedIcon from '@/static/image/step-success-icon.svg'

const props = defineProps<{
  beforeLineStyle?: Record<string, string | number> | string
  iconStatus?: 'complete' | 'process' | 'wait'
}>()



const stepIndex = ref(-1)


const getIconStatus = computed(() => {
  if (props.iconStatus) {
    return props.iconStatus
  }
  if (isAfterStep(stepIndex.value)) {
    return 'wait'
  }
  if (isBeforStep(stepIndex.value)) {
    return 'complete'
  }
  return 'process'
})



const isLast = computed(() => stepIndex.value === steps.size - 1)

const isBeforStep = (index: number) => activeStep.value > index

const isAfterStep = (index: number) => activeStep.value < index


const stepKey = Symbol('VerticalStepKey')
const checkUpdateActive = () => {
  stepIndex.value = Array.from(steps || []).findIndex(item => item === stepKey)
}
onMounted(() => {
  addStep?.(stepKey)
  checkUpdateActive()
})

onUnmounted(() => {
  removeStep?.(stepKey)
})


watch(() => steps, checkUpdateActive)

</script>

<style scoped lang="scss">
.vertical-step-item {
  display: flex;

}


.vertical-step-line {
  flex: 1;
  border-left: 2px solid #0046B4;

  &.solid {
    border-left-style: solid;
  }

  &.dashed {
    border-left-color: #D6E1F3;
  }

  &.is-hide {
    opacity: 0
  }
}

.vertical-step-icon-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
}

.vertical-step-outer-icon {
  flex-shrink: 0;
  box-sizing: border-box;
  border: 8rpx solid transparent;
  width: 44rpx;
  height: 44rpx;
  margin-right: 24rpx;
  margin-left: 24rpx;
  position: relative;

}

.vertical-step-inner-icon {
  box-sizing: border-box;
  border: 6rpx solid #0046B4;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 10px;

  &.wait {
    border-color: #D6E1F3;
  }

  &.complete {
    border: none;
  }

  .icon-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.vertical-step-item-content {
  flex: 1;
  overflow: hidden;
}
</style>