<template>
   <view class="ga-checkbox" style="width: 100%;line-height: normal;">
    <view class="ga-checkbox-title" @click="handleClick">
        <slot>
            <view class="ga-checkbox-box">
                <view class="ga-checkbox-box-text">
                    <text 
                        v-if="props.showLabel" 
                        class="ga-checkbox-box-text-label" 
                        style="color: #B9C1CC;">
                        {{ currentLabel || props.placeholder || '请选择' }}
                    </text>
                    <text v-else class="ga-checkbox-box-text-label">
                        <text v-if="currentLabel"></text>
                        <text v-else style="color: #B9C1CC;">{{ props.placeholder || '请选择' }}</text>
                    </text>
                </view>
                <uni-icons type="right" size="15" color="#B9C1CC"></uni-icons>
            </view>
        </slot>
    </view>
    <uni-popup type="bottom" ref="gaCheckboxPopup" backgroundColor="#fff" borderRadius="12rpx 12rpx 0 0" mask-background-color="rgba(0,0,0,0.68)">
        <view class="ga-checkbox-popup" @click.stop>
            <view class="ga-checkbox-header">
                <view class="ga-checkbox-tips" v-if="props.popupTitle">{{ props.popupTitle }}</view>
                <!-- <uni-icons type="closeempty" @click="handleCancel" size="30"></uni-icons> -->
                 <image src="@/static/image/close.png" mode="aspectFit" class="close-icon" @click="handleCancel" />
            </view>
            <view class="ga-checkbox-content">
                <checkbox-group @change="handleChange">
                    <label :class="['ga-checkbox-item', isChecked(item.id) ? 'ga-checkbox-item-active' : '']" v-for="item in props.options" :key="item.id" @click="handleChecked(item.id)">
                        <!-- <checkbox 
                            :value="item.id + ''" 
                            :checked="isChecked(item.id)" 
                            color="#0046B4"
                            @click.stop
                        /> -->
                        <image mode="aspectFit" v-if="isChecked(item.id)" src="@/static/image/checked1.svg" class="check-icon"/>
                        <image mode="aspectFit" v-else src="@/static/image/checked2.svg" class="check-icon" />
                        <text class="ga-checkbox-label">{{ item.label }}</text>
                    </label>
                </checkbox-group>
            </view>
            <view class="ga-checkbox-footer">
                <button class="ga-checkbox-footer-button" @click="handleConfirm">确定</button>
            </view>
        </view>
    </uni-popup>
   </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
    modelValue: number|string[],
    options: {id: number|string, label: string}[],
    placeholder?: string,
    popupTitle?: string,
    showLabel?: boolean
}>(), {
    placeholder: '请选择',
    popupTitle: '请选择',
    showLabel: true
})

const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'cancel'])

const gaCheckboxPopup = ref()
const tempValue = ref<number[]>([])

const currentLabel = computed(() => {
    if (!props.modelValue?.length) return ''
   
    return props.options
        .filter(item => props.modelValue.includes(item.id))
        .map(item => item.label)
        .join('、')
})

const isChecked = (id: number) => {
    return tempValue.value.includes(id)
}

const handleChecked = (id: number) => {
    if(tempValue.value.includes(id)){
        tempValue.value = tempValue.value.filter(item => item !== id)
    }else{
        tempValue.value = [...tempValue.value, id]
    }
}

const handleClick = () => {
    tempValue.value = [...props.modelValue]
    gaCheckboxPopup.value.open()
}

const handleCancel = () => {
    gaCheckboxPopup.value.close()
    emit('cancel')
}

const handleConfirm = () => {
    emit('update:modelValue', tempValue.value)
    emit('confirm', tempValue.value)
    gaCheckboxPopup.value.close()
}

const handleChange = (e: any) => {
    tempValue.value = e.detail.value.map((id: string) => parseInt(id))
    emit('change', tempValue.value)
}
</script>

<style lang="scss" scoped>
.ga-checkbox {
}

.ga-checkbox-title {
    width: 100%;
}

.ga-checkbox-popup {
    background-color: #fff;
    border-radius: 16rpx 16rpx 0 0;
    line-height: normal;
    
    .ga-checkbox-header {
        display: flex;
        justify-content: space-between;
        padding: 36rpx 42rpx;
        font-size: 32rpx;
        line-height: normal;
        align-items: center;
        border-bottom: 1px solid #eee;
        
        .ga-checkbox-tips {
            flex: 1;
            text-align: center;
            font-size: 34rpx;
            font-weight: 500;
            color: #121A26;
        }
    }
}

.ga-checkbox-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    
    .ga-checkbox-box-text {
        flex: 1;
        color: #121A26;
    }
}

.ga-checkbox-content {
    padding: 32rpx;
}

.ga-checkbox-item {
    display: flex;
    align-items: center;
    padding: 36rpx;
    background: #F8F9FB;
    margin-top:24rpx;
    border-radius: 6rpx;
    box-sizing: border-box;
    .ga-checkbox-label {
        margin-left: 16rpx;
        font-size: 28rpx;
    }
}

.ga-checkbox-item.ga-checkbox-item-active{
    background: #EBF0F9;
    border:1rpx solid #0046B4;
}

.ga-checkbox-item:first-child {
    margin-top: 0;
}

.ga-checkbox-footer {
    display: flex;
    justify-content: flex-end;
    padding: 36rpx 42rpx;
    border-top: 1px solid #eee;
}

.ga-checkbox-footer-button {
    width: 100%;
    background-color: #0046B4;
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 6rpx;
    height:92rpx;
    line-height: 92rpx;
    font-family: "PingFang SC";
}

.check-icon {
    width: 28rpx; // 勾选图标宽度
    height: 28rpx; // 勾选图标高度
    display: block; // 去除底部空隙
    margin-top:2rpx;
}

.close-icon{
    width:48rpx;
    height:48rpx;
}
</style>
