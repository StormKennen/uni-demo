<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import { ref, nextTick } from 'vue'

  type Option = {
    title?: string
    url: string
    decodeUrl?: string
  }
  
  const webviewSrc = ref('')
  const pageTitle = ref('')
  const showError = ref(false)
  const errorMessage = ref('')
  const isLoading = ref(true)
  
  onLoad((option) => {
    console.log('🚀 ~ webview onLoad ~ option:', option)
    const _option = option || {} as Option
    
    pageTitle.value = _option.title || '网页浏览'
    uni.setNavigationBarTitle({
      title: pageTitle.value,
    })
    
    webviewSrc.value = _option.decodeUrl ? decodeURIComponent(_option.url) : _option.url
    console.log('🚀 ~ webview src:', webviewSrc.value)
    
    // 设置加载超时
    setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false
        showError.value = true
        errorMessage.value = '页面加载超时，请检查网络连接'
      }
    }, 10000)
  })
  
  const goBack = () => {
    uni.navigateBack()
  }
  
  const onIframeLoad = () => {
    console.log('🚀 ~ iframe loaded successfully')
    isLoading.value = false
    showError.value = false
  }
  
  const onIframeError = () => {
    console.log('🚀 ~ iframe load error')
    isLoading.value = false
    showError.value = true
    errorMessage.value = '页面加载失败，可能是网络问题或页面不支持嵌入显示'
  }
  
  const openInNewTab = () => {
    window.open(webviewSrc.value, '_blank')
  }
  
  const retry = () => {
    isLoading.value = true
    showError.value = false
    // 强制重新加载iframe
    const iframe = document.querySelector('.h5-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }
</script>

<template>
  <view class="webview-container">
    <!-- 自定义导航栏 -->
    <!-- #ifdef H5 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="20" color="#333" />
          <text class="back-text">返回</text>
        </view>
        <view class="navbar-title">{{ pageTitle }}</view>
        <view class="placeholder"></view>
      </view>
    </view>
    <!-- #endif -->
    
    <!-- webview内容 -->
    <view class="webview-content">
      <!-- #ifdef H5 -->
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载页面...</text>
      </view>
      
      <!-- 错误状态 -->
      <view v-if="showError" class="error-container">
        <view class="error-icon">⚠️</view>
        <text class="error-message">{{ errorMessage }}</text>
        <view class="error-actions">
          <button class="retry-btn" @click="retry">重试</button>
          <button class="open-btn" @click="openInNewTab">在新窗口打开</button>
        </view>
      </view>
      
      <!-- iframe内容 -->
      <iframe 
        v-if="webviewSrc && !showError" 
        :src="webviewSrc" 
        class="h5-iframe"
        frameborder="0"
        allowfullscreen
        @load="onIframeLoad"
        @error="onIframeError"
      ></iframe>
      <!-- #endif -->
      
      <!-- #ifndef H5 -->
      <web-view :src="webviewSrc" bindmessage=""></web-view>
      <!-- #endif -->
    </view>
  </view>
</template>

<style lang="scss" scoped>
.webview-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* #ifdef H5 */
.custom-navbar {
  height: 44px;
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  .navbar-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    
    .back-btn {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .back-text {
        margin-left: 4px;
        font-size: 16px;
        color: #333;
      }
    }
    
    .navbar-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      text-align: center;
      flex: 1;
    }
    
    .placeholder {
      width: 60px;
    }
  }
}

.webview-content {
   flex: 1;
   margin-top: 44px;
   position: relative;
   
   .h5-iframe {
     width: 100%;
     height: 100%;
     border: none;
   }
   
   .loading-container {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     text-align: center;
     
     .loading-spinner {
       width: 40px;
       height: 40px;
       border: 4px solid #f3f3f3;
       border-top: 4px solid #007aff;
       border-radius: 50%;
       animation: spin 1s linear infinite;
       margin: 0 auto 16px;
     }
     
     .loading-text {
       color: #666;
       font-size: 14px;
     }
   }
   
   .error-container {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     text-align: center;
     padding: 20px;
     
     .error-icon {
       font-size: 48px;
       margin-bottom: 16px;
     }
     
     .error-message {
       color: #666;
       font-size: 14px;
       line-height: 1.5;
       margin-bottom: 20px;
       display: block;
     }
     
     .error-actions {
       display: flex;
       gap: 12px;
       justify-content: center;
       
       button {
         padding: 8px 16px;
         border: none;
         border-radius: 6px;
         font-size: 14px;
         cursor: pointer;
         transition: all 0.3s;
         
         &.retry-btn {
           background-color: #007aff;
           color: white;
           
           &:hover {
             background-color: #0056cc;
           }
         }
         
         &.open-btn {
           background-color: #f0f0f0;
           color: #333;
           
           &:hover {
             background-color: #e0e0e0;
           }
         }
       }
     }
   }
   
   @keyframes spin {
     0% { transform: rotate(0deg); }
     100% { transform: rotate(360deg); }
   }
 }
/* #endif */

/* #ifndef H5 */
.webview-content {
  flex: 1;
}
/* #endif */
</style>
