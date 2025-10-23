<template>
  <MyPopup v-model="visible" type="bottom">
    <view class="example-popup">
      <view class="example-title">
        <text>请选择下载方式</text>

        <button size="mini" class="close-btn" @click="visible = false">
          <uni-icons type="closeempty" size="16" color="#121A26"></uni-icons>
        </button>
      </view>

      <view class="item" @click="showEmail">发送至邮箱</view>
      <view class="item" v-if="showWeChat" @click="wechatShareFileMessage">发送至微信</view>
      <view class="item" @click="visible = false">取消</view>
    </view>
  </MyPopup>
  <MyPopup v-model="visibleEmail" type="center" :background-color="'transparent'">

    <view class="example-popup download-popup center">
      <view class="example-title">
        <text>填写要发送的邮箱</text>

        <button size="mini" class="close-btn" @click="visibleEmail = false">
          <uni-icons type="closeempty" size="16" color="#121A26"></uni-icons>
        </button>
      </view>
      <uni-forms ref="emailFormRef" :modelValue="formData" :rules="rules">
        <view class="email-item" v-if="visibleEmail">
          <FormItem name="email" :styles="{
            container: 'margin-left: 0; margin-right: 0;',
            box: 'min-height: unset'
          }" :label-width="0" :border-bottom="false">
            <uni-easyinput :inputBorder="false" v-model="formData.email" :maxlength="50" :clearable="false" type="text"
              placeholder="请输入邮箱" />
          </FormItem>
        </view>

      </uni-forms>

      <view class="button-group">
        <button class="btn-clear" @click="visibleEmail = false">取消</button>
        <button class="btn-submit" @click="showConfirmqEmail">确定</button>
      </view>

    </view>
  </MyPopup>
  <MyPopup v-model="visibleConfirmqEmail" type="center">

    <view class="example-popup center">
      <view class="example-tips">请确认接收邮箱是否为<view style="color: #0046b4;">{{ formData.email }}</view></view>

      <view class="button-group mt-24">
        <button class="btn-cancel" @click="visibleConfirmqEmail = false; visibleEmail = true">取消</button>
        <button class="btn-submit" @click="onEmailConfirm">确定</button>
      </view>

    </view>
  </MyPopup>
</template>

<script setup lang="ts">
import MyPopup from '@/components/popup.vue';
import FormItem from '@/components/form/item.vue'
import { ref } from 'vue'
import { getSystemInfo } from '@/utils/env'

const emit = defineEmits<{
  email: [email: string],
}>();


const props = withDefaults(defineProps<{
  fileUrl?: string
  showWeChat?: boolean
}>(), {
  showWeChat: () => {
    const sys = getSystemInfo()
    const isWeChat = sys.hostName === 'WeChat'
    return isWeChat
  }
})


const visible = defineModel<boolean>()

const visibleEmail = ref(false)

const visibleConfirmqEmail = ref(false)

const formData = ref({
  email: ''
})

const shareFile = (url: string) => {
  uni.showLoading()
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        console.log('wx下载成功 res', res);
        uni.hideLoading()
        uni.shareFileMessage({
          filePath: res.tempFilePath,
          success: (res) => {
            console.log('wx文件分享成功 res', res);
            resolve(res)
          },
          fail: err => {
            console.error('wx分享失败', err)
            reject(err)

          }
        })
      },
      fail: (err) => {
        console.error('wx下载失败', err);
        uni.hideLoading()
        reject(err)
        uni.showToast({
          title: '下载失败',
          icon: 'error',
        })
      }
    })
  })
}

const wechatShareFileMessage = async () => {
  visible.value = false
  if (!props.fileUrl) {
    uni.showToast({
      title: '文件地址为空',
      icon: 'error',
    })
    return
  }

  shareFile(props.fileUrl)
}


const rules = {
  email: {
    rules: [{
      required: true,
      errorMessage: '请输入email',
      validateFunction(rule: any, value: any, data: any, callback: any) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(value)) {
          return callback('email格式错误')
        }
        return true
      },
    }]
  }
}

const showEmail = () => {
  visible.value = false
  visibleEmail.value = true
}

const emailFormRef = ref()

const showConfirmqEmail = async () => {
  const res = await emailFormRef.value.validate()
  console.log(res)
  visibleEmail.value = false
  visibleConfirmqEmail.value = true
}

const onEmailConfirm = () => {
  visibleConfirmqEmail.value = false;
  visibleEmail.value = false
  emit('email', formData.value.email)
}


</script>

<style lang="scss" scoped>
.mt-24 {
  margin-top: 24rpx;
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

.email-item {
  // margin: 40rpx 0;
  margin-top: 40rpx;
  // background-color: #f8f9fb;
}
.download-popup{
  .button-group {
    padding-top: 62rpx;
  }
}

.button-group {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 24rpx;
  background-color: #fff;

  .btn-cancel,
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

  .btn-cancel{
    background-color: #fff;
    color: #333;
    margin-right: 24rpx;
    flex: 1;
    border-radius: 6rpx;
    color: #0046b4;
    border: 1px solid #0046b4;
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

.example-tips {
  color: #121A26;
  font-size: 32rpx;
  font-weight: 400;
  line-height: 50rpx;
}
</style>
