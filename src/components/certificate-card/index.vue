<template>
  <BaseCard :tips="tips" @upload-item="showUploadItem" @delete-item="handleDelete" @handleExample="handleExample"
    :formItemProps="formItemProps" :title="title" :required="required" :cards="cards"
    :showExample="!!exampleImages.length" :disabled="disabled">
  </BaseCard>
  <!-- 示例弹窗 -->
  <MyPopup 
  v-model="visibleExample" 
  type="bottom"
  backgroundColor="inherit"
  :safe-area="false" 
  @change="popupChange">
    <view class="example-popup">
      <view class="example-title">
        <text>{{ title }}示例(仅供参考)</text>
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
        <button class="confirm-btn" @click="visibleExample = false">知道了</button>
      </view>

    </view>
  </MyPopup>
  <UploadPopup @success="uploadItem" :fileTypes="fileTypes" private v-model="visibleUploadPopup" :cdpUploadOptions="visibleUploadPopupData.cdpUploadOptions">
  </UploadPopup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseCard, { type CardItem } from './base.vue'
import type { ItemProps } from '@/components/form/item.vue'
import MyPopup from '@/components/popup.vue'
import { getFilenameAndExtension } from '@/utils/oss-util'
import { cdpOcrLoop } from '@/utils/upload/cdpOss'
import { useCertificateCard } from './hook'
import UploadPopup from '../upload-popup/index.vue'
export interface Props {
  required?: boolean
  formItemProps?: ItemProps,
  // 证件类型: 中国身份证，香港身份证，护照
  type: 'cn' | 'hk' | 'pass' | 'cn2' | 'hk2',
  fileTypes?: string[],
  disabled?: boolean
  hasOcr?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fileTypes: () => ['jpg', 'png', 'jpeg', 'pdf']
})

const visibleExample = ref(false)
const emit = defineEmits<{
  uploadItem: [url: string],
  deleteItem: [item: CardItem],
  handleExample: [],
  visibleChange: [show: boolean],
  ocrResult: [result: any]
}>()
const modelValues = defineModel<{
  // 1: 正面 front 2：反面 backend 3：手持 handheld
  sign?: string
  name: string
  url: string
}[]>({
  default: () => []
})

const { cards, title, tips, exampleTips, exampleImages } = useCertificateCard(props.type)

watch(modelValues, vals => {
  cards.value.forEach((item) => {
    const val = vals.find(val => val.sign === item.sign)
    if (val) {
      item.fileUrl = val.url
    } else {
      item.fileUrl = ''
    }
  })
}, {
  immediate: true,
  deep: true
})

const popupChange = (e: {
  show: boolean
}) => {
  emit('visibleChange', e.show)
}

const visibleUploadPopup = ref(false)
const visibleUploadPopupData = ref({})
let acitveUploadItem: CardItem | null = null
const uploadItem = async (data: { url: string; file_id: string; upload_at: string }) => {
  if (!acitveUploadItem) return
  const { url, file_id, upload_at } = data
  const { sign } = acitveUploadItem
  const { extension } = getFilenameAndExtension(url)
  
  const existingIndex = modelValues.value.findIndex(item => item.sign === acitveUploadItem?.sign)
  if (existingIndex > -1) {
    modelValues.value[existingIndex] = {
      sign: acitveUploadItem.sign,
      name: `${acitveUploadItem.title}${extension}`,
      url,
      file_id,
      upload_at,
      sign
    }
  } else {
    modelValues.value.push({
      sign: acitveUploadItem.sign,
      name: `${acitveUploadItem.title}${extension}`,
      url,
      file_id,
      upload_at,
      sign
    })
  }

  if (props.hasOcr && ['HK_ID_CARD', 'ID_CARD'].includes(acitveUploadItem.cdpUploadOptions?.fileType) && sign === 'front') {
    const res = await cdpOcrLoop(file_id)
    emit('ocrResult', res)
  }
  
  acitveUploadItem = null
  emit('uploadItem', url)
}
const showUploadItem = async (item: CardItem) => {
  visibleUploadPopupData.value = item
  visibleUploadPopup.value = true
  acitveUploadItem = item
}

const handleDelete = (item: CardItem) => {
  modelValues.value = modelValues.value.filter(val => val.sign !== item.sign)
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
    padding-bottom: 40rpx;
    padding-top: 40rpx;
    padding-left: 40rpx;
    padding-right: 60px;
    border-radius: 12rpx 12rpx 0 0;

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

    &::after {
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

