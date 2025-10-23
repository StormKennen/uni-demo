<template>
    <view class="check-wrap" >
        <view class="check-item" 
            v-for="item in list" 
            @tap="handleClick(item)"
            :key="item[valueKey]"
            :style="getItemStyle(item)">
            <slot :item="item">
                {{ item[labelKey] }}
            </slot>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { withDefaults, defineProps, computed, defineEmits } from 'vue'

const props = withDefaults(defineProps<{
    list: any,
    modelValue: string | number |  undefined | any,
    labelKey?: string,
    valueKey?: string,
    width?: number,
    height?: number,
    checkedColor?: string,
    checkedBgColor?: string,
    checkedBorderColor?: string,
    color?: string,
    borderColor?: string,
    bgColor?: string,
    isMultiple ?: boolean
    disabled?: boolean
}>(), {
    list: [],
    modelValue: undefined,
    labelKey: 'label',
    valueKey: 'value',
    width: 138,
    height: 64,
    checkedColor: '#0046B4',
    checkedBgColor: '#EBF0F9',
    checkedBorderColor: '#0046B4',
    color: '#121A26',
    borderColor: '#F8F9FB',
    bgColor: '#F8F9FB',
    isMultiple: false,
})

const emit = defineEmits(['update:modelValue', 'change'])

const myValue = computed({
    get() {
        if(props.isMultiple && !props.modelValue) {
            myValue.value = []
        } else {
            return props.modelValue
        }
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

function handleClick(item: any) {
    if (props.disabled) return
    if (props.isMultiple) {
        const index = myValue.value?.findIndex((v: any) => v === item[props.valueKey])
        if (index !== -1) {
            myValue.value.splice(index, 1)
        } else {
            myValue.value.push(item[props.valueKey])
        }
    } else {
        myValue.value = myValue.value === item[props.valueKey] ? undefined : item[props.valueKey]
    }
    emit('change', myValue.value)
}

function isChecked(item: any) {
    if (props.isMultiple) {
        return  myValue.value?.includes(item[props.valueKey])
    }

    return myValue.value === item[props.valueKey]
}

function getItemStyle(item: any) {
    const checked = isChecked(item)
    return  {
        width: props.width + 'rpx',
        height: props.height + 'rpx',
        color: checked ? props.checkedColor : props.color,
        backgroundColor: checked ? props.checkedBgColor : props.bgColor,
        borderColor: checked ? props.checkedBorderColor : props.borderColor,
        borderWidth: '1px',
        borderStyle: 'solid'
    }
}


</script>


<style lang="scss" scoped>
.check-wrap {
    display: flex;
    flex-wrap: wrap;
    .check-item {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        border-radius: 41rpx;
        font-size: 26rpx;
        line-height: 40rpx;

        & + .check-item {
            margin-left: 16rpx;
        }
    }
}
</style>