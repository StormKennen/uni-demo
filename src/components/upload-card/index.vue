<template>
  <MyCard v-if="type === 'card'">
    <template v-if="title || slots.title" #header>
      <slot name="title">
        {{ title }}
      </slot>
    </template>
    <view class="upload-file-card">
      <view class="file-item" :class="{ border: idx }" v-for="(doc, idx) in signed_document" :key="doc.url"
        @click="showFileItemPopup(idx)">
        <image class="file-icon" :src="getFileIcon(doc.url)" mode="scaleToFill" />
        <view class="file-name"><slot name="file-name" :scope="{ item: doc, index: idx }">{{ doc.name }}</slot></view>
        <uni-icons style="transform: rotate(90deg);margin-left: auto;" type="more-filled" size="16"
          color="rgba(18, 26, 38, 0.5)"></uni-icons>
      </view>

      <button v-if="!disabled && (!maxCount || (signed_document.length < maxCount))" class="upload-btn"
        :class="{ 'margin-top': !signed_document.length }" @click="upload">
        <!-- <uni-icons type="upload" size="18" color="#0046B4"></uni-icons> -->
        <img class="upload-icon" src="@/static/image/upload.png" alt="">
        <text style="margin-left: 10rpx;">{{ signed_document.length ? '继续上传' : '上传' }}</text>
      </button>

      <view class="upload-tips" v-if="uploadTips">
        {{ uploadTips }}
      </view>
    </view>
  </MyCard>
  <view class="business-card-section upload-file-card-list" v-else-if="type === 'list'">
    <view class="business-card-header">
      <slot name="title">
        {{ title }}
      </slot>
    </view>
    <view class="upload-tips" v-if="uploadTips">
      {{ uploadTips }}
    </view>
    <view class="file-item" :class="{ border: idx }" v-for="(doc, idx) in show_signed_document" :key="doc.url"
      @click="showFileItemPopup(idx)">
      <image class="file-icon" :src="getFileIcon(doc.url)" mode="scaleToFill" />
      <view class="file-content">

        <view class="file-name-container">
          <view class="file-name">{{ doc.showName }}</view>
          <view>{{ doc.extension }}</view>
        </view>
        <view class="file-upload-at" v-if="doc.upload_at">
          上传于{{ doc.upload_at }}
        </view>

      </view>
      <uni-icons style="transform: rotate(90deg);margin-left: auto;" type="more-filled" size="16"
        color="rgba(18, 26, 38, 0.5)"></uni-icons>
    </view>
    <view class="uploaded-text" v-if="maxCount">
      已上传 <text style="color: #121A26; font-weight: 500;">{{ show_signed_document.length }}/{{ maxCount }}</text> 张图片或文件
    </view>
  </view>

  <UploadPopup @success="uploadFileItem" @fail="emit('fail')" @beforeSelectFile="emit('beforeSelectFile')" :fileTypes="fileTypes" private v-model="visibleUploadPopup">
  </UploadPopup>

  <MyPopup v-model="visibleFileItemPopup" type="bottom">
    <view class="example-popup">
      <view class="example-title">
        <text>请选择操作</text>

        <button size="mini" class="close-btn" @click="visibleFileItemPopup = false">
          <uni-icons type="closeempty" size="16" color="#121A26"></uni-icons>
        </button>
      </view>

      <view class="item" @click="renameFile" v-if="!disabled && hasRename">重命名</view>
      <view class="item" @click="previewItem">预览</view>
      <view class="item" @click="destroyItem" v-if="!disabled"> <text style="color: #F81D22;">删除</text></view>
      <view class="item" @click="visibleFileItemPopup = false"> <text style="color: #8993A2;">取消</text></view>
    </view>
  </MyPopup>
  <MyPopup v-model="visibleReNamePopup" v-if="!disabled" type="center" :background-color="'transparent'">

    <view class="example-popup download-popup center">
      <view class="example-title">
        <text>文件重命名</text>

        <button size="mini" class="close-btn" @click="visibleReNamePopup = false">
          <uni-icons type="closeempty" size="16" color="#121A26"></uni-icons>
        </button>
      </view>
      <uni-forms ref="emailFormRef" :modelValue="formData" :rules="rules">
        <view class="email-item" v-if="visibleReNamePopup">
          <FormItem name="flieName" :styles="{
            container: 'margin-left: 0; margin-right: 0;'
          }" :label-width="0" :border-bottom="false">
            <uni-easyinput :inputBorder="false" v-model="formData.flieName" :maxlength="200" type="text"
              placeholder="请输入文件名" clearable />
          </FormItem>
        </view>

      </uni-forms>

      <view class="button-group">
        <button class="btn-clear" @click="visibleReNamePopup = false">取消</button>
        <button class="btn-submit" @click="showConfirmqFileName">确定</button>
      </view>

    </view>
  </MyPopup>
  <MyPopup v-model="visibleConfirmRemovePopup" type="center" v-if="!disabled">
    <view class="remove-popup-box">
      <view class="remove-popup-content" v-if="visibleConfirmRemovePopup">
        您确定要删除文档<text style="color: #0046B4;word-break: break-all;font-weight: 500;">{{
          signed_document[visibleFileItemIndex].name }}</text>吗？
      </view>
      <view class="remove-popup-button-group">
        <button class="btn-cancel" @click="visibleConfirmRemovePopup = false">取消</button>
        <button class="btn-submit" @click="confirmRemove">确认</button>
      </view>
    </view>

  </MyPopup>
</template>

<script setup lang="ts">
import MyCard from '../card/index.vue'
import MyPopup from '../popup.vue'
import UploadPopup from '../upload-popup/index.vue'
import { getFilenameAndExtension } from "@/utils/oss-util"
import { computed, ref } from 'vue';
import { getFileTypeImage, previewFile } from '@/utils/file'
import FormItem from '@/components/form/item.vue'
import { format } from "date-fns";
import { useSlots } from 'vue'
type FileItem = {
  name: string
  url: string
  upload_at?: string
}

const slots = useSlots()
const props = withDefaults(defineProps<{
  hasRename?: boolean
  disabled?: boolean
  type?: 'card' | 'list',
  title?: string
  uploadTips?: string
  // 允许上传的文件类型
  fileTypes: string[]
  uploadItem?: (url: string, file_id: string, time: string, extension: string) => FileItem
  // 最大上传数, 默认0, 不限制
  maxCount?: number
}>(), {
  type: 'card',
  uploadItem: (url: string, file_id: string, time: string, extension: string) => {
    const upload_at = format(time || new Date(), 'yyyy-MM-dd HH:mm:ss')
    return {
      name: url,
      url,
      file_id,
      upload_at,
      extension
    }
  },
  maxCount: 0
})



const emit = defineEmits<{
  (e: 'change', files: FileItem[]): void
  (e: 'fail', files: FileItem[]): void
  (e: 'beforeSelectFile'): void
}>()

const signed_document = defineModel<Array<FileItem>>({
  required: true
})
const show_signed_document = computed(() => {
  return signed_document.value?.map(item => {
    const extension = getFileExtension(item.url)
    return {
      ...item,
      showName: item.name.replace(extension, ''),
      extension
    }
  }) ?? []
})


const getFileExtension = (url: string) => {
  const { extension } = getFilenameAndExtension(url)
  return extension
}


const getFileIcon = (url: string) => {
  const extension = getFileExtension(url)
  return getFileTypeImage(extension.replace('.', ''))
}

const visibleUploadPopup = ref(false)

const uploadFileItem = (cdpRes: any) => {
  const { url, file_id, upload_at } = cdpRes
  const { extension } = getFilenameAndExtension(url)
  signed_document.value.push(props.uploadItem(url, file_id, upload_at, extension))
  emit('change', [...signed_document.value])
}


const visibleFileItemPopup = ref(false)
let visibleFileItemIndex = -1
const showFileItemPopup = (idx: number) => {
  visibleFileItemPopup.value = true
  visibleFileItemIndex = idx
}

const visibleConfirmRemovePopup = ref(false)

const destroyItem = () => {
  visibleFileItemPopup.value = false
  visibleConfirmRemovePopup.value = true

}

const confirmRemove = () => {
  visibleConfirmRemovePopup.value = false
  signed_document.value.splice(visibleFileItemIndex, 1)

  emit('change', [...signed_document.value])
}

const previewItem = () => {
  visibleFileItemPopup.value = false
  previewFile(signed_document.value[visibleFileItemIndex].url)
}
const visibleReNamePopup = ref(false)

const renameFile = () => {
  visibleFileItemPopup.value = false
  visibleReNamePopup.value = true
  const { name, url } = signed_document.value[visibleFileItemIndex]
  const extension = getFileExtension(url)
  formData.value.flieName = name.replace(extension, '')

}


const formData = ref({
  flieName: ''
})



const rules = {
  flieName: {
    rules: [{
      required: true,
      errorMessage: '请输入文件名',
    }]
  }
}

const emailFormRef = ref()
const showConfirmqFileName = async () => {
  const res = await emailFormRef.value.validate()
  const { url } = signed_document.value[visibleFileItemIndex]
  const extension = getFileExtension(url)
  signed_document.value[visibleFileItemIndex].name = `${res.flieName}${extension}`
  visibleReNamePopup.value = false

  emit('change', [...signed_document.value])
}

const upload = () => {
  visibleUploadPopup.value = true
}

defineExpose({
  upload
})
</script>

<style scoped lang="scss">
.upload-file-card {
  padding: 0 36rpx;
  .upload-icon {
    position: relative;
    width: 32rpx;
    height: 32rpx;
    top: -3rpx;
  }

  .file-item {
    padding-top: 32rpx;
    padding-bottom: 32rpx;
    display: flex;
    align-items: center;
    color: #121A26;
    font-size: 28rpx;
    font-weight: 500;
    line-height: normal;

    &.padding-h {
      padding-left: 32rpx;
      padding-right: 32rpx;
    }

  }

  .upload-btn {
    border: 1px dashed #0046B4;
    background-color: transparent;
    color: #0046B4;
    line-height: 90rpx;
    padding: 0;
    font-size: 28rpx;
    display: flex;
    justify-content: center;
    align-items: center;

    &.margin-top {
      margin-top: 32rpx;
    }

    &::after {
      display: none;
    }
  }

  .file-name {
    word-break: break-word;
  }

  .upload-tips {
    color: #8993A2;
    font-size: 24rpx;
    font-weight: 400;
    line-height: 40rpx;
    padding-top: 32rpx;
    padding-bottom: 32rpx;
  }

}


.file-icon {
  width: 62rpx;
  height: 62rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}






.example-popup {
  padding: 32rpx 40rpx 42rpx;
  border-radius: 24rpx;
  background-color: #fff;
  position: relative;
  z-index: 99;

  &.center {
    border-radius: 24rpx;
    width: 600rpx;
  }

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
    position: relative;
    border-bottom: 1px solid #E9ECF0;
    padding-bottom: 40rpx;

    .close-btn {
      position: absolute;
      right: 0;
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
  }

}

.item {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  position: relative;
  justify-content: center;
  color: #222;
  font-size: 28rpx;
  font-weight: 500;

  /* 142.857% */
  &:first-child {
    border-bottom: 1px solid #E9ECF0;
  }

  &::after {
    position: absolute;
    content: '';
    bottom: 0;
    left: 0;
    right: 0;
    border-bottom: 1px solid #E9ECF0;
  }

  &:last-child,
  &:first-child {
    &::after {
      display: none;
    }
  }

  &:last-child {
    color: #8993A2;
  }
}


.button-group {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 24rpx;
  background-color: #fff;

  .btn-clear,
  .btn-submit {
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 6rpx;
    font-size: 32rpx;
    border: none;
  }

  .btn-clear {
    background-color: #f8f9fb;
    color: #333;
    margin-right: 24rpx;
    flex: 1;
    border-radius: 6rpx;

    &::after {
      display: none;
    }
  }

  .btn-submit {
    background-color: #0046b4;
    color: #fff;
    flex: 1;
    border-radius: 6rpx;

    &::after {
      display: none;
    }
  }
}

.remove-popup-box {
  width: 598rpx;
  padding: 32rpx;
  box-sizing: border-box;
}

.remove-popup-content {
  padding: 16rpx 52rpx - 32rpx 38rpx;
  font-size: 32rpx;
}

.remove-popup-button-group {
  display: flex;
  align-items: center;

  .btn-cancel {
    background-color: #fff;
    color: #0046b4;
    flex: 1;
    border-radius: 6rpx;
    margin-left: unset;
    margin-right: unset;

    &::after {
      border-color: #0046b4;
      width: 199%;

    }
  }

  .btn-submit {
    background-color: #0046b4;
    color: #fff;
    flex: 1;
    border-radius: 6rpx;
    margin-left: 20rpx;
    margin-right: unset;

    &::after {
      display: none;
    }


  }
}

.business-card-section {
  background-color: #fff;
  border-radius: 12rpx;
}

.business-card-header {
  color: #121a26;
  position: relative;
  padding-top: 32rpx;
  font-size: 34rpx;
  font-weight: 500;
}

.upload-file-card-list {
  overflow: hidden;

  .file-item {
    padding: 12rpx 14rpx;
    display: flex;
    align-items: center;
    color: #121A26;
    font-size: 28rpx;
    font-weight: 500;
    margin-bottom: 40rpx;
  }

  .file-name-container {

    color: #121A26;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 40rpx;
    display: flex;
  }

  .file-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .file-upload-at {
    color: #435163;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 40rpx;
  }

  .upload-tips {
    color: #8993A2;
    font-size: 28rpx;
    font-weight: 400;
    line-height: 40rpx;
    padding-top: 16rpx;
    padding-bottom: 24rpx;
  }


  .file-content {
    overflow: hidden;
  }

  .uploaded-text {
    color: #435163;
    font-size: 24rpx;
    font-style: normal;
    font-weight: 400;
    text-align: center;
    padding-bottom: 24rpx;

  }
}

.download-popup{
  .button-group {
    padding-top: 62rpx;
  }
}

.email-item {
  // margin: 40rpx 0;
  margin-top: 40rpx;
  // background-color: #f8f9fb;
}
</style>
