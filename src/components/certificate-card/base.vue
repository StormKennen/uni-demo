<template>
  <BusinessCard :styles="{
    container: {
      width: '100%'
    }
  }">
    <template #header>
      <view class="header">
        <view class="title">
          <text class="required" v-if="required">*</text>
          <text>{{ title }}</text>
          <text class="example" v-if="showExample" @click="handleExample">示例模板</text>
        </view>
        <view v-if="tips" class="tips">{{ tips }}</view>
      </view>
    </template>

    <view class="certificate-card-form-item">
      <FormItem :label-width="0" :border-bottom="false" label-position="top" :styles="{
        content: 'margin-bottom: 0'
      }" v-bind="formItemProps">
        <view class="content">
          <view class="upload-list">
            <!-- 身份证正面 -->
            <view class="upload-item" :class="{ 'margin-left': idx % 2 }" v-for="(item, idx) in showCards"
              :key="item.title">
              <text class="upload-title">{{ item.title }}</text>
              <view class="upload-box" v-if="item.fileUrl" @click="previewFile(item.fileUrl)">
                <image v-if="item.isImage" :src="item.previewUrl" mode="scaleToFill" class="preview-image" />
                <view v-else class="upload-file-box">
                  <image class="upload-file-icon" :src="item.fileIcon" mode="aspectFit" />
                  <view class="upload-file-text">
                    <text class="upload-file-filename">{{ item.filename }}</text>
                    <text class="upload-file-extension">{{ item.extension }}</text>
                  </view>
                </view>
                <view class="delete-btn" @click.stop="handleDelete(item, idx)" v-if="!disabled">
                  <uni-icons type="closeempty" size="12" color="#fff"></uni-icons>
                </view>
              </view>
              <!-- <view class="upload-box" v-else-if="item.status === 'pending'"
              :style="item.bgUrl ? `background-image: url('${item.bgUrl}');` : undefined">
              <uni-icons type="spinner-cycle" class="rotate" size="24" color="#0046B4"></uni-icons>
              <text class="upload-text">上传中</text>
            </view>
            <view class="upload-box" v-else-if="item.status === 'success'" :style="item.bgUrl ? `background-image: url('${item.bgUrl}');` : undefined">
              <uni-icons type="checkmarkempty" size="24" color="#3CC694"></uni-icons>
              <text class="upload-text" style="color: #3CC694;">上传成功</text>
            </view>
            <view class="upload-box" v-else-if="item.status === 'error'" @click.stop="handleUpload(item)" :style="item.bgUrl ? `background-image: url('${item.bgUrl}');` : undefined">
              <uni-icons type="closeempty" size="24" color="#F81D22"></uni-icons>
              <text class="upload-text" style="color: #F81D22;">上传失败,点击重新上传</text>
            </view> -->
              <view class="upload-box" v-else @click.stop="handleUpload(item)"
                :style="item.bgUrl ? `background-image: url('${item.bgUrl}');` : undefined">
                <uni-icons type="plus-filled" size="24" color="#0046B4" style="line-height: 68rpx;"></uni-icons>
                <text class="upload-text">点击上传</text>
              </view>
            </view>
          </view>
        </view>
      </FormItem>
    </view>
  </BusinessCard>
</template>

<script setup lang="ts">
import BusinessCard from '@/components/card/index.vue'
import FormItem from '@/components/form/item.vue'
import type { ItemProps } from '@/components/form/item.vue'
import { toOss, getFilenameAndExtension, } from '@/utils/oss-util'
import { isImageType, getFileTypeImage, previewFile } from '@/utils/file'
import { computed } from 'vue'

export type CardItem = {
  title: string
  fileUrl: string
  bgUrl?: string
  // 1: 正面 front 2：反面 backend 3：手持 handheld
  sign?: string
  // status?: 'pending' | 'success' | 'error'
}


export interface Props {
  formItemProps?: ItemProps,
  required?: boolean
  title: string
  tips?: string
  cards: CardItem[]
  showExample?: boolean
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleteItem: [item: CardItem, index: number]
  uploadItem: [item: CardItem],
  handleExample: []
}>()



const showCards = computed(() => {
  return props.cards.map(item => {
    let { filename, extension } = getFilenameAndExtension(item.fileUrl)
    extension = extension.replace('.', '')
    const isImage = isImageType(extension)
    return {
      ...item,
      isImage,
      filename,
      extension,
      fileIcon: !isImage ? getFileTypeImage(extension) : '',
      previewUrl: toOss(item.fileUrl)
    }
  }).filter((item) => {
    // 禁用了就不可以再添加了
    if (item.sign === 'addItem' && props.disabled) {
      return false
    }
    return true
  })
})


const handleDelete = (item: CardItem, i: number) => {
  emit('deleteItem', item, i)
}

const handleUpload = (item: CardItem) => {
  emit('uploadItem', item)
}

const handleExample = () => {
  emit('handleExample')
}


</script>

<style scoped lang="scss">
business-card {
  width: 100%;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.rotate {
  animation: spin 2s linear infinite;
}

.title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  line-height: normal;
}

.required {
  color: #F81D22;
}

.example {
  margin-left: 16rpx;
  font-size: 20rpx;
  color: #0046B4;
  background-color: #e6ecf5;
  border-radius: 4rpx;
  padding: 2rpx 8rpx;
  font-size: 500;
}

.tips {
  font-size: 24rpx;
  color: #8993A2;
  margin-top: 8rpx;
  line-height: normal;
  font-weight: normal;
}

.content {
  padding-top: 24rpx;
  box-sizing: border-box;
  width: 100%;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
}

.upload-item {
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  width: calc(50% - 10px);
  margin-bottom: 32rpx;

  &.margin-left {
    margin-left: 20px;
  }
}

.upload-title {
  color: #8993A2;
  font-size: 24rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 40rpx;
  height: 40rpx;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 24rpx;
}

.upload-box {
  position: relative;
  width: 100%;
  height: 180rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('https://cdn-public.galaxy-immi.com/business/common/certificate-card.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.upload-file-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fb;
  overflow: hidden;
}

.upload-file-text {
  box-sizing: border-box;
  max-width: 100%;
  padding: 0 20rpx;
  color: #435163;
  text-align: center;
  font-size: 24rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 40rpx;
  display: flex;
  align-items: center;
}

.upload-file-filename {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-file-extension {
  flex-shrink: 0;
}

.upload-file-icon {
  width: 62rpx;
  height: 62rpx;
  margin-bottom: 16rpx;
}

.upload-text {
  color: #0046B4;
  text-align: center;
  font-size: 24rpx;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 6rpx;
}

.delete-btn {
  position: absolute;
  right: -21rpx;
  top: -21rpx;
  width: 42rpx;
  height: 42rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #222222;
  border-radius: 50%;
}
</style>