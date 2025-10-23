<template>
  <view style="width: 100%;">
    <view class="ga-picker-title" @click="handleClick">
      <slot>
        <view class="ga-picker-box">
          <text class="ga-picker-box-text" :class="{'is-disabled': disabled, 'is-select': isSelect}">{{ showLabel }}</text>
          <view class="icon">
            <image class="icon-image" :src="RightArrow" mode="scaleToFill" />
          </view>
        </view>
      </slot>
    </view>
    <uni-popup 
      type="bottom" 
      ref="gaPickerPopup" 
      @change="popupChange" 
      backgroundColor="#fff" 
      borderRadius="12rpx 12rpx 0 0" 
      mask-background-color="rgba(0,0,0,0.68)">
      <view class="ga-picker-popup" @touchmove.prevent>
        <view class="ga-picker-header">
          <text class="ga-picker-cancel" @click="handleCancel">取消</text>
          <text class="ga-picker-tips" v-if="props.popupTitle">{{ props.popupTitle }}</text>
          <text class="ga-picker-confirm" @click="handleConfirm">确定</text>
        </view>
        <picker-view 
          :value="pickerValue"
          class="ga-picker-view"
          @change="handleChange"
        >
          <picker-view-column>
            <view class="picker-item picker-item-year" 
                  v-for="(item, index) in years" 
                  :key="item"
                  :class="{'active': index === pickerValue[0]}">
              {{item}}年
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item picker-item-month" 
                  v-for="(item, index) in months" 
                  :key="item"
                  :class="{'active': index === pickerValue[1]}">
              {{item}}月
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item picker-item-day" 
                  v-for="(item, index) in days" 
                  :key="item"
                  :class="{'active': index === pickerValue[2]}">
              {{item}}日
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RightArrow from '@/static/image/right-arrow.svg'

const props = withDefaults(defineProps<{
  modelValue: string,
  placeholder?: string,
  popupTitle?: string,
  disabled?: boolean,
  history?: boolean
}>(), {
  placeholder: '请选择日期',
  popupTitle: '请选择日期',
  disabled: false,
  history: true
})

const showLabel = computed(() => {
  return props.modelValue || props.placeholder
})

const isSelect = computed(() => {
  return showLabel.value !== props.placeholder
})

const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'cancel', 'open'])

const gaPickerPopup = ref()

// 年月日数据
const years = ref<number[]>([])
const months = ref<number[]>([])
const days = ref<number[]>([])

// picker-view的选中值
const pickerValue = ref<number[]>([0, 0, 0])

// 初始化年月日数据
onMounted(() => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  
  if (props.history) {
    // 历史模式：今天往前推120年，从小到大排序
    const startYear = currentYear - 120
    for(let i = startYear; i <= currentYear; i++) {
      years.value.push(i)
    }
  } else {
    // 未来模式：今天往后推20年
    const endYear = currentYear + 20
    for(let i = currentYear; i <= endYear; i++) {
      years.value.push(i)
    }
  }

  updateMonths()
  updateDays()
  
  if(props.modelValue) {
    const [year, month, day] = props.modelValue.split('-')
    pickerValue.value = [
      years.value.indexOf(parseInt(year)),
      months.value.indexOf(parseInt(month)),
      days.value.indexOf(parseInt(day))
    ]
  } else {
    pickerValue.value = [
      years.value.indexOf(currentYear),
      months.value.indexOf(currentMonth),
      days.value.indexOf(currentDay)
    ]
  }
})

// 新增更新月份的函数
const updateMonths = () => {
  months.value = []
  const selectedYear = years.value[pickerValue.value[0]]
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  if (props.history) {
    // 历史模式
    if (selectedYear === currentYear) {
      // 当前年份只显示到当前月份
      for(let i = 1; i <= currentMonth; i++) {
        months.value.push(i)
      }
    } else {
      // 历史年份显示所有月份
      for(let i = 1; i <= 12; i++) {
        months.value.push(i)
      }
    }
  } else {
    // 未来模式
    if (selectedYear === currentYear) {
      // 当前年份从当前月份开始
      for(let i = currentMonth; i <= 12; i++) {
        months.value.push(i)
      }
    } else {
      // 未来年份显示所有月份
      for(let i = 1; i <= 12; i++) {
        months.value.push(i)
      }
    }
  }
}

// 更新天数
const updateDays = () => {
  days.value = []
  const year = years.value[pickerValue.value[0]]
  const month = months.value[pickerValue.value[1]]
  const daysInMonth = new Date(year, month, 0).getDate()
  
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  
  // 根据 history 模式决定日期范围
  if (props.history) {
    // 历史模式
    if (year === currentYear && month === currentMonth) {
      // 当前月份只显示到今天
      for(let i = 1; i <= currentDay; i++) {
        days.value.push(i)
      }
    } else {
      // 非当前月份显示全部天数
      for(let i = 1; i <= daysInMonth; i++) {
        days.value.push(i)
      }
    }
  } else {
    // 未来模式
    if (year === currentYear && month === currentMonth) {
      // 当前月份从今天开始显示
      for(let i = currentDay; i <= daysInMonth; i++) {
        days.value.push(i)
      }
    } else {
      // 非当前月份显示全部天数
      for(let i = 1; i <= daysInMonth; i++) {
        days.value.push(i)
      }
    }
  }
}

const handleClick = () => {
  if (props.disabled) return
  gaPickerPopup.value.open()
}

const handleCancel = () => {
  gaPickerPopup.value.close()
}

const handleConfirm = () => {
  const year = years.value[pickerValue.value[0]]
  const month = String(months.value[pickerValue.value[1]]).padStart(2, '0')
  const day = String(days.value[pickerValue.value[2]]).padStart(2, '0')
  const date = `${year}-${month}-${day}`
  emit('update:modelValue', date)
  emit('confirm', date)
  gaPickerPopup.value.close()
}

const handleChange = (e: any) => {
  const val = e.detail.value
  const oldYear = years.value[pickerValue.value[0]]
  const newYear = years.value[val[0]]
  
  // 年份改变时更新月份列表
  if (oldYear !== newYear) {
    pickerValue.value[0] = val[0]
    updateMonths()
    // 重置月份选择索引为0
    val[1] = 0
  }
  
  pickerValue.value = val
  updateDays()
  
  const year = years.value[pickerValue.value[0]]
  const month = String(months.value[pickerValue.value[1]]).padStart(2, '0')
  const day = String(days.value[pickerValue.value[2]]).padStart(2, '0')
  const date = `${year}-${month}-${day}`
  emit('change', date)
}

const popupChange = (e: any) => {
  if (e.show) {
    emit('open')
  } else {
    emit('cancel')
  }
}
</script>

<style lang="scss" scoped>
.icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  .icon-image {
    width: 100%;
    height: 100%;
  }
}

.ga-picker-title {
  width: 100%;
}

.ga-picker-popup {
  background-color: #fff;
  border-radius: 16rpx 16rpx 0 0;
  .ga-picker-header {
    display: flex;
    justify-content: space-between;
    padding: 36rpx 42rpx;
    font-size: 32rpx;
    line-height: normal;
    align-items: center;
    border-bottom: 1px solid #eee;
    .ga-picker-cancel {
      color: #222;
      font-size: 28rpx;
      font-weight: 500;
    }
    .ga-picker-tips {
      flex: 1;
      text-align: center;
      font-size: 34rpx;
      font-weight: 500;
      color: #222;
    }
    .ga-picker-confirm {
      color: #0046B4;
      font-size: 28rpx;
      font-weight: 500;
    }
  }
  .ga-picker-view {
    padding: 0 42rpx;
    height: 500rpx;
  }
}

.ga-picker-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: 10px;
  box-sizing: border-box;
  .ga-picker-box-text {
    flex: 1;
    color: #B9C1CC;
    line-height: 40rpx;
    font-size: 28rpx;
    font-weight: 400;
    &.is-select {
      color: #121A26;
      font-weight: 500;
    }
    &.is-disabled {
      color: #121a26;
    }
  }
}

.picker-item {
  line-height: 64rpx;
  text-align: center;
  &.active {
    background-color: #EBF0F9;
  }
}

.picker-item.picker-item-year {
  &.active {
    border-radius: 8rpx 0 0 8rpx !important;
  }
}

.picker-item.picker-item-month {
  &.active {
    border-radius: 0 !important;
  }
}

.picker-item.picker-item-day {
  &.active {
    border-radius: 0 8rpx 8rpx 0rpx !important;
  }
}

</style>
