<template>
  <BaseCard :tips="tips" :formItemProps="formItemProps" :title="title" :required="required" :cards="cards"
    :showExample="!!exampleImages.length" :disabled="disabled" @upload-item="showUploadItem" @delete-item="handleDelete"
    @handleExample="handleExample">
  </BaseCard>
  <!-- 示例弹窗 -->
  <MyPopup v-model="visibleExample" type="bottom" :safe-area="false" backgroundColor="inherit">
    <view class="example-popup">
      <view class="example-title">
        <text style="text-align: left;">{{ title }}示例(仅供参考)</text>

        <button size="mini" class="close-btn" @click="visibleExample = false">
          <uni-icons type="closeempty" size="16" color="#121A26"></uni-icons>
        </button>
      </view>

      <view style="padding: 0 40rpx 60rpx;">
        <view class="example-requirements">
          <view class="requirement-item">
            <text class="dot"></text>
            <text>四角完整</text>
          </view>
          <view class="requirement-item">
            <text class="dot"></text>
            <text>照片清晰</text>
          </view>
          <view class="requirement-item">
            <text class="dot"></text>
            <text>亮度均匀</text>
          </view>
        </view>
        <view class="example-tips" v-if="exampleTips">{{ exampleTips }}</view>
        <view class="example-images">
          <image class="id-front" v-for="imgItem in exampleImages" :key="imgItem" :src="imgItem" mode="widthFix">
          </image>
        </view>

        <view v-if="hkImages.length">
          <view class="hk-item">
            <view class="hk-item-devider"></view>
            <view class="hk-item-title">港澳通行证</view>
          </view>

          <view class="example-requirements">
            <view class="requirement-item">
              <text class="dot"></text>
              <text>四角完整</text>
            </view>
            <view class="requirement-item">
              <text class="dot"></text>
              <text>照片清晰</text>
            </view>
            <view class="requirement-item">
              <text class="dot"></text>
              <text>亮度均匀</text>
            </view>
          </view>

          <view class="example-images">
            <image class="id-front" v-for="imgItem in hkImages" :key="imgItem" :src="imgItem" mode="widthFix">
            </image>
          </view>
        </view>

        <button class="confirm-btn" @click="visibleExample = false">知道了</button>
      </view>
    </view>
  </MyPopup>
  <UploadPopup @success="uploadItem" :fileTypes="fileTypes" private v-model="visibleUploadPopup" v-bind="$attrs"></UploadPopup>
</template>

<script setup lang="ts">
// 多文件上传、如“现实居住住址证明”
import { ref, watch } from 'vue';
import BaseCard, { type CardItem } from './base.vue'
import type { ItemProps } from '@/components/form/item.vue'
import MyPopup from '@/components/popup.vue'
import { getFilenameAndExtension } from '@/utils/oss-util'
import UploadPopup from '../upload-popup/index.vue'
import { generateRandomString } from '@/utils/uid'
export interface Props {
  // 是否显示必填符号
  required?: boolean
  formItemProps?: ItemProps,
  exampleTips?: string
  exampleImages?: string[]
  hkImages?: string[]
  title: string
  tips?: string
  disabled?: boolean
  /**
   * 最多上传数量，0，不限制，默认10
   * 
   */
  count?: number
  fileTypes?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  exampleImages: () => [],
  hkImages: () => [],
  count: 10,
  // 允许上传的文件类型 如: ['jpg', 'png', 'jpeg']
  fileTypes: () => []
})

const emit = defineEmits<{
  uploadItem: [url: string],
  deleteItem: [item: CardItem],
  handleExample: []
}>()

const visibleExample = ref(false)

const modelValues = defineModel<{
  name: string
  url: string
}[]>({
  default: () => []
})

const cards = ref<CardItem[]>()

watch(modelValues, vals => {
  const res: CardItem[] = vals.map((item, idx) => {

    return {
      title: `${props.title}-${idx + 1}`,
      fileUrl: item.url
    }
  })
  if (props.count === 0) {
    res.push({
      title: props.title,
      fileUrl: '',
      sign: 'addItem',
    })
  } else {
    if (vals.length < props.count) {
      res.push({
        title: props.title,
        fileUrl: '',
        sign: 'addItem',
      })
    }
  }
  cards.value = res
}, {
  immediate: true
})



const visibleUploadPopup = ref(false)
let acitveUploadItem: CardItem | null = null
const uploadItem = (data: { url: string; file_id: string; upload_at: string; sign: string }) => {
  if (!acitveUploadItem) return
  const { url, file_id, upload_at, sign } = data
  const { extension } = getFilenameAndExtension(url)
  modelValues.value = [
    ...modelValues.value,
    {
      name: `${props.title}-${generateRandomString(4)}${extension}`,
      url,
      file_id,
      upload_at,
      sign
    }
  ]
  acitveUploadItem = null
  emit('uploadItem', url)
}
const showUploadItem = async (item: CardItem) => {
  visibleUploadPopup.value = true
  acitveUploadItem = item
}

const handleDelete = (item: CardItem, idx: number) => {
  modelValues.value = modelValues.value.filter((val, i) => i !== idx)
  emit('deleteItem', item)
}



const handleExample = () => {
  // 处理示例模板点击
  visibleExample.value = true
}

defineExpose({
  getCards: () => cards
})
</script>

<style lang="scss" scoped>
.example-popup {
  border-radius: 24rpx 24rpx 0 0;
  background-color: #fff;
  position: relative;
  z-index: 99;



  .example-title {
    color: #121A26;
    text-align: center;
    font-size: 34rpx;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    display: flex;
    justify-content: center;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #fff;
    border-radius: 12rpx 12rpx 0 0;
    padding-bottom: 40rpx;
    padding-top: 40rpx;
    padding-left: 40rpx;
    padding-right: 60px;

    .close-btn {
      position: absolute;
      right: 40rpx;
      width: 48rpx;
      height: 48rpx;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;

      &::after {
        display: none;
      }
    }
    &::after{
      content: '';
      position: absolute;
      bottom: 0;
      left: 40rpx;
      right: 40rpx;
      height: 1px;
      background-color: #E9ECF0;
      transform: scaleY(0.5);
    }
  }

  .example-requirements {
    display: flex;
    gap: 32rpx;
    padding: 36rpx 0;

    .requirement-item {
      display: flex;
      align-items: center;

      .dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background-color: #0046B4;
        margin-right: 8rpx;
      }
    }
  }

  .example-tips {
    color: #B9C1CC;
    font-size: 28rpx;
    font-weight: 400;
    margin-bottom: 32rpx;
  }

  .example-images {

    image {
      width: 100%;
      margin-bottom: 24rpx;
    }
  }

  .confirm-btn {
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    background-color: #0046b4;
    color: #fff;
    border-radius: 8rpx;
    font-size: 32rpx;
  }
}

.hk-item {
  display: flex;
  align-items: center;

  .hk-item-devider {
    width: 6rpx;
    height: 24rpx;
    background: #0046B4;
  }

  .hk-item-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #121A26;
    margin-left: 16rpx;
  }
}
</style>
