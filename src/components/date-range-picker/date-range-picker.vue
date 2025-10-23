<template>
  <view class="date-range-picker">
    <view class="picker-header">
      <text class="title">{{ title }}</text>
      <img src="@/static/image/close.png" alt="" class="close-icon" @click="handleClose"></img>
    </view>

    <view class="picker-content">
      <view v-if="subTitle" class="sub-title">{{ subTitle }}</view>
      <view class="flex align-center">
        <!-- 开始时间 -->
        <view class="date-section">
          <view class="date-picker">
            <picker mode="date" :value="startTime" :fields="fields" :start="start" :end="endTime" @change="changeStartTime">
              <view class="picker-value">
                <text v-if="startTime" class="picker-value__time">{{ startTime }}</text>
                <text v-else class="picker-value__placeholder">{{ startPlaceholder }}</text>
              </view>
            </picker>
          </view>
        </view>

        <!-- 分割线 -->
        <view class="date-range-divider">至</view>

        <!-- 结束时间 -->
        <view class="date-section">
          <view class="date-picker">
            <picker mode="date" :value="endTime" :fields="fields" :start="startTime" :end="end" @change="changeEndTime">
              <view class="picker-value">
                <text v-if="endTime" class="picker-value__time">{{ endTime }}</text>
                <text v-else class="picker-value__placeholder">{{ endPlaceholder }}</text>
              </view>
            </picker>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="picker-footer">
      <button class="btn-cancel" @click="handleCancel">取消</button>
      <button class="btn-confirm" @click="handleConfirm">确定</button>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  const props = defineProps({
    title: {
      type: String,
      default: '选择时间范围',
    },
    subTitle: {
      type: String,
      default: '请选择自定义范围',
    },
    fields: {
      type: String,
      default: 'day',
    },
    start: {
      type: String,
      default: '',
    },
    end: {
      type: String,
      default: '',
    },
    startPlaceholder: {
      type: String,
      default: '开始时间',
    },
    endPlaceholder: {
      type: String,
      default: '结束时间',
    },
  })

  const emit = defineEmits(['update:modelValue', 'update:startDate', 'update:endDate', 'confirm', 'cancel', 'close'])

  const startTime = ref(null)
  const endTime = ref(null)

  const changeStartTime = (e: any) => {
    startTime.value = e.detail.value
    // 检查结束时间是否小于开始时间，如果是则调整
    if (endTime.value && new Date(endTime.value) < new Date(startTime.value)) {
      endTime.value = startTime.value
    }
  }
  const changeEndTime = (e: any) => {
    endTime.value = e.detail.value
    // 检查开始时间是否大于结束时间，如果是则调整
    if (startTime.value && new Date(startTime.value) > new Date(endTime.value)) {
      startTime.value = endTime.value
    }
  }

  // 确认选择
  const handleConfirm = () => {
    const result = [startTime.value, endTime.value]
    emit('update:modelValue', result)
    emit('confirm', result)
    handleClose()
  }

  // 取消选择
  const handleCancel = () => {
    startTime.value = ''
    endTime.value = ''
    const result = [startTime.value, endTime.value]
    emit('update:modelValue', result)
    emit('cancel')
  }

  // 关闭弹窗
  const handleClose = () => {
    emit('close')
  }
</script>

<style lang="scss" scoped>
  .flex {
    display: flex;
  }

  .align-center {
    align-items: center;
  }

  .date-range-picker {
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    font-size: 28rpx;
  }

  .picker-header {
    padding: 32rpx;
    position: relative;
    text-align: center;
    .title {
      font-size: 32rpx;
      font-weight: 500;
      color: $ga-gray-8;
      text-align: center;
    }

    .close-icon {
      width: 42rpx;
      height: 42rpx;
      position: absolute;
      right: 32rpx;
      top: 32rpx;
    }
  }

  .picker-header::after{
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    transform: scaleY(0.5);
    transform-origin: 0 100%;
  }



  .sub-title {
    margin-bottom: 24rpx;
    color: $ga-gray-7;
  }

  .picker-content {
    padding: 32rpx 32rpx 300rpx;
  }

  .date-section {
    flex: 1;
    .date-picker {
      .picker-value {
        padding: 24rpx;
        text-align: center;
        background-color: $ga-gray-1;
        border-radius: 8rpx;
        font-size: 28rpx;
      }

      .picker-value__time {
        color: $ga-gray-8;
      }

      .picker-value__placeholder {
        color: $ga-gray-5;
      }
    }
  }

  .date-range-divider {
    text-align: center;
    color: $ga-gray-6;
    font-size: 28rpx;
    padding: 0 24rpx;
  }

  .picker-footer {
    display: flex;
    padding: 32rpx 32rpx 88rpx 32rpx;

    button {
      height: 88rpx;
      line-height: 88rpx;
      text-align: center;
      font-size: 32rpx;
      border-radius: 8rpx;

      &::after {
        border: none;
      }
    }

    .btn-cancel {
      flex: 1;
      margin-right: 20rpx;
      background-color: $ga-gray-2;
      color: $ga-gray-8;
    }

    .btn-confirm {
      flex: 2;
      background-color: $ga-brand-4;
      color: $ga-gray-0;
    }
  }
</style>
