<template>
  <view class="business-form-item" :style="styles?.container" :class="[{ 'border-bottom': borderBottom }, containerClass]">
    <uni-forms-item :name="name" :label="''" :label-width="0" :rules="rules">
      <view class="business-form-item-box" :class="labelPosition" :style="styles?.box">
        <view 
        :class="['form-item-label', labelClass]" 
        v-if="label || slots.label" 
        :style="{
          width: typeof labelWidth === 'number' ? labelWidth + 'px' : labelWidth
        }">
          <text v-if="required" style="color:#F81D22;">*</text>
          <slot name="label">{{ label }}</slot>
        </view>
        <view class="business-form-item-content" :style="styles?.content">
          <slot></slot>
          <view class="form-item-suffix" v-if="suffix || slots.suffix">
            <slot name="suffix">{{ suffix }}</slot>
          </view>
        </view>
      </view>

      <slot name="extra"></slot>
    </uni-forms-item>
    <view class="form-item-tips" v-if="tips || slots.tips">
      <view class="form-item-tips-text">
        <slot name="tips">{{ tips }}</slot>
      </view>
    </view>
  </view>

</template>

<script lang="ts" setup>
import { useSlots, getCurrentInstance, watch } from 'vue';
import { useFormInject } from '@/hooks/form'
import { useLayoutPageInject } from '@/hooks/layout-page'
import type { UniFormsItemProps } from '@uni-helper/uni-ui-types'

export type ItemProps = {
  styles?: {
    container?: string | Record<string, string | number>,
    content?: string | Record<string, string | number>,
    box?: string | Record<string, string | number>,
  },
  label?: string
  suffix?: string
  name?: UniFormsItemProps['name']
  labelWidth?: number | string
  required?: boolean
  borderBottom?: boolean
  tips?: string,
  labelPosition?: 'left' | 'top',
  rules?: UniFormsItemProps['rules']
  labelClass?: string
  containerClass?: string
}


const props = withDefaults(defineProps<ItemProps>(), {
  labelPosition: 'left',
  labelWidth: 70,
  borderBottom: true,
  alignItems: 'center'
})

const slots = useSlots()

const instance = getCurrentInstance();

const formInject = useFormInject()

const layoutPageInject = useLayoutPageInject()





const scrollToError = async () => {
  if (!layoutPageInject) return
  const point = await layoutPageInject.getLayoutPageContentClientRect()

  const query = uni.createSelectorQuery().in(instance.proxy);
  query
    .select('.business-form-item')
    .boundingClientRect((data) => {
      if (Array.isArray(data)) {
        data = data[0]
      }
      
      const scrollTop = Math.abs(Number.parseInt(data.top.toString()) - Number.parseInt(point.top.toString()))
      uni.pageScrollTo({
        scrollTop,
        duration: 100
      })
    })
    .exec()
}

watch(() => formInject?.errorMessages.value, val => {
  if (!val?.length) return

  let formItemName = Array.isArray(props.name) ? props.name.join('#') : props.name
  formItemName = formItemName.replaceAll('.', '#')
  const isActive = val.some(item => {
    if (item.key.startsWith('_formdata_')) {
      return item.key === `_formdata_#${formItemName}`
    }
    return item.key === formItemName
  })
  if (isActive) {
    formInject?.clearErrorMessages()
    scrollToError()
  }
})




</script>

<style scoped lang="scss">
.business-form-item {

  margin-left: 36rpx;
  margin-right: 36rpx;

  &.border-bottom {
    border-bottom: 1rpx solid #e9ecf0;
  }
}

.business-form-item-box {
  display: flex;
  min-height: 104rpx;
  align-items: center;
  box-sizing: border-box;

  .form-item-label {
    margin: 32rpx 0;
  }

  &.top {
    flex-direction: column;
    align-items: flex-start;

    .business-form-item-content {
      width: 100%;
      margin-bottom: 32rpx;
    }

    .form-item-label {
      min-height: 104rpx;
      align-items: center;
    }
  }
}

.business-form-item-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.form-item-label {
  display: flex;

}

.form-item-label,
.form-item-suffix {
  flex-shrink: 0;
  color: #121A26;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.2;
}


.form-item-tips {
  // padding-top: 8rpx;
  padding-bottom: 32rpx;

  .form-item-tips-text {
    padding: 16rpx 20rpx;
    background-color: #f8f9fb;
    line-height: 28rpx;
    color: #8993A2;
    font-size: 24rpx;
    font-weight: 400;
  }


}

.label-class {
  display: flex;
  align-items: center;
}
</style>