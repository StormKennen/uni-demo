<template>
    <view class="ga-tags">
        <view 
            v-for="item in selectedTags" 
            :key="item.id"
            class="ga-tag-item"
        >
            <text class="ga-tag-text">{{ item.label }}</text>
            <view class="ga-tag-close" @click="handleClose(item)">
                <uni-icons type="closeempty" size="12" color="#435163"></uni-icons>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    modelValue: (number|string)[]
    options: {id: number|string, label: string}[]
}>()

const emit = defineEmits(['update:modelValue'])

const selectedTags = computed(() => {
    return props.options.filter(item => props.modelValue.includes(item.id))
})

const handleClose = (item: {id: number|string, label: string}) => {
    const newValue = props.modelValue.filter(id => id !== item.id)
    emit('update:modelValue', newValue)
}
</script>

<style lang="scss" scoped>
.ga-tags {
    display: flex;
    flex-wrap: wrap;
    line-height: normal;
}

.ga-tag-item {
    display: flex;
    align-items: center;
    background: #F5F6F8;
    padding: 16rpx;
    border-radius: 6rpx;
    margin-right: 16rpx;
    margin-bottom: 16rpx;
    
    .ga-tag-text {
        font-size: 24rpx;
        color: #121A26;
        margin-right: 8rpx;
    }
    
    .ga-tag-close {
        display: flex;
        align-items: center;
    }
}
</style>
