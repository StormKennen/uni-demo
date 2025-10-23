<template>
    <view  class="nav-wrap" :style="{paddingTop: statusBarHeight + 'px', color, background }">
        <uni-icons 
            v-if="pages.length > 1"
            class="nav-icon" 
            type="left" 
            size="16" 
            :color="color" 
            @click="back">
        </uni-icons>
        <view class="nav-title">
            <slot>
                <text>{{ props.title }}</text>  
            </slot>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'


const props = withDefaults(defineProps<{
    title?: string;
    color?: string;
    background?: string;
}>(), {
    title: '',
    color: '#FFF',
    background: 'transparent'
})

const pages = getCurrentPages();
console.log(pages, 'pages')

const statusBarHeight = ref(0)

function back() {
    uni.navigateBack()
}

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0 as number;
})
</script>


<style lang="scss" scoped>
.nav-wrap {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 88rpx;
    display: flex;
    align-items: center;
    color: white;
    background: transparent;
    z-index: 99;
    .nav-icon {
        margin-top: -2rpx;
        position: absolute;
        left: 20rpx;
    }
    .nav-title {
        font-weight: 500;
        text-align: center;
        line-height: 46rpx;
        font-size: 34rpx;
        width: 100vw;
        margin: 0 100rpx;
    }
}
</style>