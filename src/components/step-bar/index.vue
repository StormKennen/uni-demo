<template>
    <view class="step-bar">
      <view class="step-container" :style="styles?.container">
        <view 
          v-for="(step, i) in data" 
          :key="i" 
          :class="['step', { 'step-last': i === data.length -1 }]"
        >
          <view class="circle"  @click="setStep(i)">
            <image v-if="currentStep > i" mode="scaleToFill" :src="CheckedIcon" class="check-icon" />
            <view v-else :class="['step-icon', { 'current-step': currentStep === i }]" />
            <view  :class="['step-title', { 'current-title': currentStep === i }, { 'completed-title': currentStep > i }]" :style="styles?.title">
              {{ step.title }}
            </view>
          </view>
          <view v-if="i < data.length - 1" :class="['line', { 'is-before': currentStep > i } ]"></view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  import CheckedIcon from '@/static/image/step-success-icon.svg'
  const props = defineProps<{
    data: { title: string }[];
    maxStep: number;
    currentStep: number;
    styles?: {
      container?: any;
      title?: any;
    };
  }>();
  
  const emit = defineEmits<{
    (e: 'update:currentStep', stepIndex: number): void;
    (e: 'handleClick', stepIndex: number): void;
  }>();
  
  const setStep = (stepIndex: number) => {
    if (stepIndex <= props.maxStep) {
      emit('update:currentStep', stepIndex);
      emit('handleClick', stepIndex);
    }
  };
  </script>
  
  <style lang="scss" scoped>
.step-bar {
  //height: 100vh; // 设置步骤条高度
  overflow-y: auto; // 允许垂直滚动
  background: #f5f5f5; // 背景颜色
}

.step-container {
  padding: 56rpx 178rpx 124rpx; // 内边距
  display: flex; // 使用flex布局
  background: #fff; // 背景颜色

  .step {
    display: flex; // 使用flex布局
    align-items: center; // 垂直居中
    flex: 1; // 使每个步骤均匀分布

    .circle {
      position: relative; // 相对定位
      flex-shrink: 0;

      .step-icon,
      .current-step {
        width: 28rpx; // 步骤图标宽度
        height: 28rpx; // 步骤图标高度
        border-radius: 14rpx; // 圆角
        box-sizing: border-box;
      }

      .step-icon {
        border: 4rpx solid #D5DAE1; // 步骤图标边框样式
      }

      .check-icon {
        width: 28rpx; // 勾选图标宽度
        height: 28rpx; // 勾选图标高度
        display: block; // 去除底部空隙
        border-radius: 14rpx;
        overflow: hidden;
      }

      .current-step {
        border: 6rpx solid #0046B4; // 当前步骤边框样式
      }
      &::after{
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200rpx;
        height: 200rpx;
      }
    }

    .line {
      height: 0; // 线条高度
      border-bottom: 2px dashed #E9ECF0; // 虚线样式
      flex: 1; // 使线条均匀分布
      align-self: center; // 垂直居中
      margin: 0 8rpx; // 外边距

   
      &.is-before{
        border-bottom-style: solid; // 当前步骤的实线样式
      }
    }

    .step-title {
      width: 170rpx; // 步骤标题宽度
      position: absolute; // 绝对定位
      top: 28rpx + 28rpx; // 距离顶部的距离
      left: 0; // 左侧对齐
      font-size: 26rpx; // 字体大小
      color: #B9C1CC; // 默认字体颜色
      transform: translateX(-40%); // 水平居中
      word-break: keep-all; // 不换行
      text-align: center; // 文本居中

      &.current-title {
        color: #0046B4; // 当前步骤标题颜色
      }

      &.completed-title {
        color: #222; // 已完成步骤标题颜色
      }
    }
  }

  .step-last {
    flex-grow: 0; // 最后一步不扩展
  }
}
</style>