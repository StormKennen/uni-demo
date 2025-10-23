<template>
   <view style="width: 100%;">
    <view class="ga-picker-title" @click="handleClick">
        <slot>
            <view class="ga-picker-box">
                <text  
                   :class="{
                    'ga-picker-box-text': true,
                    'is-disabled': disabled, 
                    'is-select-normal': isSelect && !props.labelFontWeightBold,
                    'is-select-bold': isSelect && props.labelFontWeightBold
                   }">
                   {{ showLabel }}
                </text>
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
                <text class="ga-picker-confirm" :class="{'is-picking': picking}"  @click="handleConfirm">确定</text>
            </view>
            <!-- indicator-style="background:#EBF0F9;border-radius:12rpx;padding:24rpx;color:#222;line-height:normal;" -->
            <picker-view 
                v-if="range.length && !disabled"
                indicator-style="background:#EBF0F9;border-radius:12rpx;padding:24rpx 0;color:#222;line-height:normal;mix-blend-mode: multiply;"
                class="ga-picker-view"
                :value="tempIndex" 
                @change="handleChange"
                @pickstart="picking = true"
                @pickend="picking = false"
                >
                <picker-view-column>
                    <view class="ga-picker-item" v-for="(item,index) in range" :key="index">
                        {{item[props.rangeKey]}}
                    </view>
                </picker-view-column>
            </picker-view>
        </view>
    </uni-popup>
   </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import RightArrow from '@/static/image/right-arrow.svg'

const props = withDefaults(defineProps<{
    modelValue: string | number | undefined | null,
    rangeKey?: string,
    rangeValue?: string,
    placeholder?: string,
    range: any[],
    popupTitle: string,
    labelFontWeightBold?: boolean,
    disabled?: boolean
}>(), {
    rangeKey: 'label',
    rangeValue: 'value',
    placeholder: '请选择',
    popupTitle: '请选择',
    labelFontWeightBold: true
})


const picking = ref(false)

const showLabel = computed(() => {
    return currentLabel.value || props.placeholder
})
const isSelect = computed(() => {

  return showLabel.value !== props.placeholder
})

const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'cancel', 'open'])

const gaPickerPopup = ref()

// 当前选中的索引(已确认)
const currentIndex = computed(() => {
    const index = props.range.findIndex(item => item[props.rangeValue] === props.modelValue)
    return index > -1 ? [index] : []
})

// 当前显示的label
const currentLabel = computed(() => {
    const index = currentIndex.value[0]
    return props.range[index]?.[props.rangeKey] || ''
})

// 临时索引，用于选择过程中
const tempIndex = ref(currentIndex.value)

const handleClick = () => {
    if (props.disabled) return
    // 打开时将临时索引设为当前索引
    tempIndex.value = currentIndex.value.length ? [...currentIndex.value] : [0]
    gaPickerPopup.value.open()
}

const handleCancel = () => {
    gaPickerPopup.value.close()
}

const handleConfirm = () => {
    if (picking.value) return
    const selectedIndex = tempIndex.value[0]
    emit('update:modelValue', props.range[selectedIndex][props.rangeValue])
    emit('confirm', {
        value: props.range[selectedIndex][props.rangeValue],
        label: props.range[selectedIndex][props.rangeKey],
        index: selectedIndex
    })
    gaPickerPopup.value.close()
}

const handleChange = (e: any) => {
    tempIndex.value = e.detail.value
    emit('change', {
        value: props.range[e.detail.value[0]][props.rangeValue],
        label: props.range[e.detail.value[0]][props.rangeKey],
        index: e.detail.value[0]
    })
}

const popupChange = (e: any) => {
    // 修复滚动穿透问题
    // uni.setPageStyle({
    //     style:{
    //         overflow:e.show ? 'hidden' : 'visible'
    //     }
    // })
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
.ga-picker-title{
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
        line-height:normal;
        align-items: center;
        border-bottom: 1px solid #eee;
        .ga-picker-cancel {
            color: #222;
            font-size: 28rpx;
            font-weight: 500;
        }
        .ga-picker-tips{
            flex:1;
            text-align: center;
            font-size: 34rpx;
            font-weight: 500;
            color: #222;
        }
        .ga-picker-confirm {
            color: #0046B4;
            font-size: 28rpx;
            font-weight: 500;

            &.is-picking{
              opacity: 0.5;
            }
        }
    }
    .ga-picker-view {
        padding: 0 42rpx;
        height:500rpx;
    }
    .ga-picker-item {
        line-height: normal;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.ga-picker-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding-left: 10px;
        box-sizing:border-box;
        .ga-picker-box-text {
            flex: 1;
            color: #B9C1CC;
            line-height: 40rpx;
            font-size: 28rpx;
            font-weight: 400;
            &.is-select-normal{
              color: #121A26;
              font-weight: 400;
            }
            &.is-select-bold{
              color: #121A26;
              font-weight: 500;
            }
            &.is-disabled{
              color: #121a26;
            }
        }
}
</style>