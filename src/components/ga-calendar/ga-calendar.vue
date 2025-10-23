<template>
   <view style="width: 100%;">
    <view class="ga-calendar-title" @click="handleClick">
        <slot>
            <view class="ga-calendar-box">
                <text class="ga-calendar-box-text">{{ currentLabel || props.placeholder || '请选择' }}</text>
                <uni-icons v-if="!props.disabled" type="right" size="15" color="#B9C1CC"></uni-icons>
            </view>
        </slot>
    </view>
    <uni-popup type="bottom" ref="gaCalendarPopup" backgroundColor="#fff" borderRadius="12rpx 12rpx 0 0" mask-background-color="rgba(0,0,0,0.68)">
        <view class="ga-calendar-popup">
            <view class="ga-calendar-header">
                <text class="ga-calendar-tips" v-if="props.popupTitle">{{ props.popupTitle }}</text>
                <!-- <uni-icons v-if="!props.disabled" type="closeempty" @click="handleCancel" size="30"></uni-icons> -->
                <image src="@/static/image/close.png" mode="aspectFit" class="close-icon" @click="handleCancel" />
            </view>
            <view class="ga-calendar-sub-tips" v-if="props.tips">
                <text>{{ props.tips }}</text>
            </view>
            <view class="ga-calendar-content">
                <uni-calendar 
                    :insert="true"
                    :lunar="props.lunar"
                    :date="date"
                    :start-date="props.enabledStartDate || currentDate"
                    :end-date="props.enabledEndDate"
                    :range="props.range"
                    :show-month="false"
                    @change="handleChange"
                    ref="calendar"
                />
            </view>
            <view class="ga-calendar-footer">
                <button class="ga-calendar-footer-button" @click="handleConfirm">确定</button>
            </view>
        </view>
    </uni-popup>
   </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { isWeekendOrHolidayInRange } from '@/utils/hk-holiday'

const props = withDefaults(defineProps<{
    modelValue: string | string[],
    placeholder?: string,
    popupTitle?: string,
    range?: boolean,
    lunar?: boolean,
    tips?: string,
    disabled?: boolean,
    disableHKHoliday?: boolean,
    limitDate?: boolean
    enabledStartDate?: string // 可选日期开始
    enabledEndDate?: string // 可选日期结束
}>(), {
    placeholder: '请选择日期',
    popupTitle: '请选择日期',
    range: false,
    lunar: false,
    tips: '',
    disabled: false,
    disableHKHoliday: false,
    limitDate: true
})

const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'cancel'])
const startDate = ref()
const endDate = ref()
const date = ref()
const gaCalendarPopup = ref()
const calendar = ref()
const tempValue = ref(props.modelValue)
const currentDate = ref()
if(props.limitDate){
    currentDate.value = new Date().toISOString().slice(0, 10)
}
const currentLabel = computed(() => {
    if (!props.modelValue) return ''
    if (props.range && Array.isArray(props.modelValue)) {
        return props.modelValue.join(' ~ ')
    }
    return props.modelValue
})

const handleClick = () => {
    if(props.disabled){
        return
    }
    tempValue.value = props.modelValue
    if(props.range){
        startDate.value = props.modelValue[0]
        endDate.value = props.modelValue[1]
    } else {
        date.value = props.modelValue
    }
    nextTick(() => {
        gaCalendarPopup.value.open()
    })
}

const handleCancel = () => {
    gaCalendarPopup.value.close()
    emit('cancel')
}

const handleConfirm = () => {
    if (props.disableHKHoliday && isWeekendOrHolidayInRange(tempValue.value[0], tempValue.value[1])) {
        uni.showToast({
            title: '香港法定节假日和周末不可预约',
            icon: 'none'
        })
        return
    }
    emit('update:modelValue', tempValue.value)
    emit('confirm', tempValue.value)
    startDate.value = null
    endDate.value = null
    date.value = null
    gaCalendarPopup.value.close()
}

const handleChange = (e: any) => {
    tempValue.value = props.range ? [e.range.data[0], e.range.data[e.range.data.length-1]] : e.fulldate
    emit('change', tempValue.value)
}
</script>

<style lang="scss" scoped>
.ga-calendar-title {
    width: 100%;
}

.ga-calendar-popup {
    background-color: #fff;
    border-radius: 16rpx 16rpx 0 0;
    line-height:normal;
    width: 100vw;
    
    .ga-calendar-header {
        display: flex;
        justify-content: space-between;
        padding: 36rpx 42rpx;
        font-size: 32rpx;
        line-height: normal;
        align-items: center;
        border-bottom: 1px solid #eee;
        
        .ga-calendar-cancel {
            color: #222;
            font-size: 28rpx;
            font-weight: 500;
        }
        
        .ga-calendar-tips {
            flex: 1;
            text-align: center;
            font-size: 34rpx;
            font-weight: 500;
            color: #222;
        }
        
        .ga-calendar-confirm {
            color: #0046B4;
            font-size: 28rpx;
            font-weight: 500;
        }
    }
}

.ga-calendar-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    
    .ga-calendar-box-text {
        flex: 1;
    }
}

.ga-calendar-footer {
    display: flex;
    justify-content: flex-end;
    padding: 36rpx 42rpx;
    border-top: 1px solid #eee;
}

.ga-calendar-footer-button {
    width: 100%;
    background-color: #0046B4;
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 6rpx;
}

.ga-calendar-content{
    padding: 0 28rpx;
}

.ga-calendar-sub-tips{
    border-radius: 6rpx;
    background-color:#FFF5EB;
    color:#FF8000;
    font-size: 24rpx;
    padding: 16rpx 24rpx;
    margin:24rpx 32rpx;
}

:deep(.uni-calendar-item--before-checked){
    background-color: #0046B4;
}

:deep(.uni-calendar-item--after-checked){
    background-color: #0046B4;
}

:deep(.uni-calendar-item--multiple:not(.uni-calendar-item--before-checked)){
    background-color: #EBF0F9;
    color:#121A26;
}

:deep(.uni-calendar-item--multiple:not(.uni-calendar-item--after-checked)){
    background-color: #EBF0F9;
    color:#121A26;
}

.close-icon{
    width:48rpx;
    height:48rpx;
}

:deep(.uni-calendar > .uni-calendar__content > .uni-calendar__header > uni-picker) {
    width: auto !important;
}
</style>

