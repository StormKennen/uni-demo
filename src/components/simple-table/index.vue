<!--
 * @Author: George
 * @Description: 简易表格
-->

<script setup lang="ts">

interface Column {
    label: string
    prop: string | number // 对应字段名，支持'a.b'形式
    width: number
    fixed?: boolean
    align?: 'left' | 'center' | 'right'
    headerAlign?: 'left' | 'center' | 'right'
    isDefaultValue?: boolean // 是否默认显示默认值
    cellClassName?: string // 单元格类名
    headerClassName?: string // 表头类名
}


const props = withDefaults(defineProps<{
    tableData: any
    columns: Column[],
    cellEmptyText?: string
    overFlowX?: boolean // 是否超出显示滚动条
}>(), {
    tableData: [],
    columns: () => [] as Column[],
    cellEmptyText: '-',
    overFlowX: true
})

console.log('columns', props.columns)



// 判断值是否为空,null,undefined
function isEmpty(obj: any) {
    if (typeof obj === 'undefined' || obj === null || obj === '')
        return true
    return false
}

function getLabel(row: any, prop: any) {
    if (prop && typeof prop === 'string') {
        const propArr = prop?.split('.')
        // 为了支持'a.b' 形式
        const label = propArr.reduce((prev, cur, index) => {
            if (index === propArr.length - 1)
                prev = isEmpty(prev[cur]) ? '-' : prev[cur]

            else
                prev = prev[cur] || {}
            return prev
        }, row)
        return label
    }
    else {
        return row[prop] || props.cellEmptyText
    }
}
</script>

<template>
    <view class="simple-table" :style="{
        overflowX: overFlowX ? 'auto' : 'hidden',
    }">
        <view class="simple-table-header">
            <view
                v-for="column in columns"
                :key="column.prop"
                class="simple-table-cell"
                :class="[
                    column.fixed ? 'fixed' : '',
                    column.headerAlign || 'center',
                    column.headerClassName ? column.headerClassName : '',
                ]"
                :style="{ width: `${column.width}rpx` }"
            >
                <slot name="headSlot" :column="column"> 
                    {{ column.label }}
                </slot>      
            </view>
        </view>
        <view v-if="tableData.length" class="simple-table-content">
            <view
                v-for="(row, index) in tableData"
                :key="index"
                class="simple-table-item"
            >
                <view
                    v-for="column of columns"
                    :key="column.prop"
                    class="simple-table-cell"
                    :class="[
                        column.fixed ? 'fixed' : '',
                        column.align || 'center',
                        column.cellClassName ? column.cellClassName : '',
                    ]"
                    :style="{ width: `${column.width}rpx` }"
                >
                    <slot 
                        name="cellSlot" 
                        :column="column" 
                        :row="row" 
                        :index="index" 
                        :isDefaultValue="column.isDefaultValue || false" 
                        :value="getLabel(row, column.prop)"> 
                        {{ getLabel(row, column.prop) }}
                    </slot>  
                </view>
            </view>
        </view>
        <view class="empty-wrap" v-else>
            暂无数据
        </view>
    </view>
</template>

<style lang="scss" scoped>
.simple-table{
    border-radius: 16rpx;
    overflow-x: auto;
    overflow-y: hidden;
    font-size: 24rpx;
    line-height: 40rpx;
    color: #121A26;
    border: 1rpx solid #E9ECF0;
    background: white;
   .simple-table-header{
        min-height: 106rpx;
        display: flex;
        align-items: stretch;
        position: relative;
        font-size: 28rpx;
        font-weight: 500;
        background: rgba(186, 186, 186, 0.08);
   }
   .simple-table-content{
        .simple-table-item{
            min-height: 106rpx;
            display: flex;
            position: relative;
            align-items: stretch;
            &:nth-child(2n){
                background: rgba(186, 186, 186, 0.08);
            }
        }
   }
   .simple-table-cell{
        padding: 10rpx 12rpx;
        box-sizing: border-box;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

   .fixed{
        position: sticky;
        right: 0;
        top: 0;
        background: white;
    }
    .center{
        text-align: center;
    }
    .left{
        text-align: left;
    }
    .right{
        text-align: right;
    }

    .empty-wrap {
        text-align: center;
        padding: 20rpx;
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: center;
    }   
}
</style>
