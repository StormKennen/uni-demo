<template>
  <view class="qr-generator">
    <!-- 导航栏 -->
    <nav-bar title="二维码生成器" />
    
    <!-- 内容区域 -->
    <view class="content">
      <!-- 输入区域 -->
      <view class="input-section">
        <view class="section-title">输入内容</view>
        
        <!-- 大文本输入框 -->
        <textarea
          v-model="inputContent"
          class="input-textarea"
          placeholder="请输入要生成二维码的文本内容或链接地址..."
          :maxlength="500"
          auto-height
        />
        <view class="input-counter">{{ inputContent.length }}/500</view>
      </view>
      

      
      <!-- 生成按钮 -->
      <button 
        class="generate-btn" 
        :class="{ loading: isGenerating }"
        :disabled="!inputContent.trim() || isGenerating"
        @click="generateQRCode"
      >
        {{ isGenerating ? '生成中...' : '生成二维码' }}
      </button>
      
      <!-- 二维码显示区域 -->
      <view v-if="qrGenerated" class="qr-display">
        <view class="section-title">生成结果</view>
        <view class="qr-container">
          <canvas 
            id="qrcode"
            canvas-id="qrcode" 
            width="300"
            height="300"
            style="width: 300px; height: 300px; max-width: 100%;"
            class="qr-canvas"
          />
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button class="action-btn download-btn" @click="downloadQRCode">
            下载二维码
          </button>
          <button class="action-btn share-btn" @click="shareQRCode">
            分享二维码
          </button>
        </view>
        
        <!-- 信息显示 -->
        <view class="qr-info">
          <view class="info-item">
            <text class="info-label">内容长度：</text>
            <text class="info-value">{{ inputContent.length }} 字符</text>
          </view>
        </view>
      </view>
    </view>
    

  </view>
</template>

<script>
import UQRCode from 'uqrcodejs'

export default {
  name: 'QRGenerator',
  data() {
    return {
      inputContent: '',
      isGenerating: false,
      qrGenerated: false
    }
  },
  
  methods: {
    // 生成二维码
    async generateQRCode() {
      if (!this.inputContent.trim()) {
        uni.showToast({
          title: '请输入内容',
          icon: 'none'
        })
        return
      }
      
      // URL格式自动补全和验证
      let content = this.inputContent.trim()
      
      // 检测是否为URL格式（包含域名特征）
      const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/.*)?$/
      const domainPattern = /^[\w\-]+(\.[\w\-]+)+/
      
      if (domainPattern.test(content) && !content.startsWith('http')) {
        // 自动补全协议
        if (content.startsWith('www.')) {
          content = 'https://' + content
        } else {
          // 对于类似 "baiducom" 的输入，自动添加点和协议
          if (!content.includes('.') && content.length > 3) {
            // 尝试智能补全常见域名
            if (content.toLowerCase().includes('baidu')) {
              content = 'https://www.baidu.com'
            } else if (content.toLowerCase().includes('google')) {
              content = 'https://www.google.com'
            } else {
              content = 'https://www.' + content + '.com'
            }
          } else {
            content = 'https://' + content
          }
        }
        
        // 更新输入框内容
        this.inputContent = content
        
        uni.showToast({
          title: '已自动补全URL格式',
          icon: 'none',
          duration: 1500
        })
      }
      
      this.isGenerating = true
      
      try {
        // 获取canvas上下文
        let ctx
        // #ifdef H5
        // H5环境使用原生Canvas API
        console.log('H5环境：尝试获取Canvas元素')
        console.log('所有Canvas元素:', document.querySelectorAll('canvas'))
        
        // 尝试多种方式获取Canvas元素
        let canvas = document.getElementById('qrcode') || 
                    document.querySelector('#qrcode') ||
                    document.querySelector('canvas[canvas-id="qrcode"]') ||
                    document.querySelector('.qr-canvas') ||
                    document.querySelector('canvas')
        
        console.log('Canvas元素:', canvas)
        if (!canvas) {
          console.error('Canvas元素未找到，尝试等待DOM更新')
          // 等待DOM更新后再次尝试
          await this.$nextTick()
          canvas = document.getElementById('qrcode') || 
                  document.querySelector('#qrcode') ||
                  document.querySelector('canvas[canvas-id="qrcode"]') ||
                  document.querySelector('.qr-canvas') ||
                  document.querySelector('canvas')
          
          if (!canvas) {
            console.error('仍然无法找到Canvas元素')
            throw new Error('Canvas元素未找到')
          }
        }
        ctx = canvas.getContext('2d')
        console.log('Canvas上下文:', ctx)
        // 设置canvas尺寸
        canvas.width = 300
        canvas.height = 300
        console.log('Canvas尺寸设置完成: 300x300')
        // #endif
        
        // #ifndef H5
        ctx = uni.createCanvasContext('qrcode', this)
        // #endif
        
        // 清空canvas
        ctx.clearRect(0, 0, 300, 300)
        
        // 使用固定参数生成二维码
        console.log('创建UQRCode实例')
        const qr = new UQRCode()
        qr.data = content
        qr.size = 300
        qr.margin = 10
        qr.backgroundColor = '#FFFFFF'
        qr.foregroundColor = '#000000'
        qr.errorCorrectionLevel = 2
        
        console.log('开始生成二维码数据')
        qr.make()
        console.log('二维码数据生成完成')
        
        // 获取二维码的模块数据
        const modules = qr.modules
        const moduleCount = qr.moduleCount
        const tileW = 300 / moduleCount
        const tileH = 300 / moduleCount
        
        console.log('二维码模块数:', moduleCount, '瓦片大小:', tileW)
        
        // 手动绘制二维码到canvas
        // #ifdef H5
        // H5环境使用原生Canvas API
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, 300, 300)
        
        ctx.fillStyle = '#000000'
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (modules[row][col]) {
              ctx.fillRect(col * tileW, row * tileH, tileW, tileH)
            }
          }
        }
        
        console.log('二维码绘制完成')
        
        // H5环境直接完成
        this.qrGenerated = true
        this.isGenerating = false
        uni.showToast({
          title: '二维码生成成功',
          icon: 'success'
        })
        // #endif
        
        // #ifndef H5
        // 小程序环境使用uni-app Canvas API
        ctx.setFillStyle('#FFFFFF')
        ctx.fillRect(0, 0, 300, 300)
        
        ctx.setFillStyle('#000000')
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (modules[row][col]) {
              ctx.fillRect(col * tileW, row * tileH, tileW, tileH)
            }
          }
        }
        
        console.log('二维码绘制完成')
        
        // 绘制到canvas
        ctx.draw(false, () => {
          this.qrGenerated = true
          this.isGenerating = false
          uni.showToast({
            title: '二维码生成成功',
            icon: 'success'
          })
        })
        // #endif
        
        // 备用超时机制
        setTimeout(() => {
          if (this.isGenerating) {
            this.qrGenerated = true
            this.isGenerating = false
            uni.showToast({
              title: '二维码生成完成',
              icon: 'success'
            })
          }
        }, 1000)
        
      } catch (error) {
        console.error('生成二维码失败:', error)
        this.isGenerating = false
        uni.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        })
      }
    },
    
    // 检查颜色对比度是否足够

    
    // 下载二维码
    async downloadQRCode() {
      try {
        uni.showLoading({
          title: '准备下载...'
        })
        
        // 将canvas转换为临时文件
        const res = await new Promise((resolve, reject) => {
          uni.canvasToTempFilePath({
            canvasId: 'qrcode',
            success: resolve,
            fail: reject
          }, this)
        })
        
        // 保存到相册
        await uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath
        })
        
        uni.hideLoading()
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
      } catch (error) {
        uni.hideLoading()
        console.error('下载失败:', error)
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    },
    
    // 分享二维码
    async shareQRCode() {
      try {
        // 将canvas转换为临时文件
        const res = await new Promise((resolve, reject) => {
          uni.canvasToTempFilePath({
            canvasId: 'qrcode',
            success: resolve,
            fail: reject
          }, this)
        })
        
        // 分享图片
        await uni.share({
          type: 'image',
          imageUrl: res.tempFilePath,
          title: '二维码分享'
        })
        
      } catch (error) {
        console.error('分享失败:', error)
        uni.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    },

    // 微信小程序分享功能
    onShareAppMessage() {
      return {
        title: '二维码生成器 - 快速生成二维码',
        path: '/subPackages/tools/qr-generator/index',
        imageUrl: '/static/logo.png'
      }
    },

    // 朋友圈分享功能
    onShareTimeline() {
      return {
        title: '二维码生成器 - 快速生成二维码',
        path: '/subPackages/tools/qr-generator/index',
        imageUrl: '/static/logo.png'
      }
    }
  }
}
</script>

<style scoped>
.qr-generator {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

/* 输入区域 */
.input-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.input-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 1.5;
  background: #fafafa;
  box-sizing: border-box;
}

.input-counter {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}



/* 生成按钮 */
.generate-btn {
  width: 100%;
  padding: 25rpx;
  background: linear-gradient(45deg, #FF6600, #FF8800);
  color: white;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(255, 102, 0, 0.3);
}

.generate-btn:disabled {
  background: #ccc;
  box-shadow: none;
}

.generate-btn.loading {
  background: #999;
}

/* 二维码显示区域 */
.qr-display {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.qr-container {
  display: flex;
  justify-content: center;
  margin: 30rpx 0;
  width: 100%;
  overflow: hidden;
}

.qr-canvas {
  max-width: 100%;
  height: auto;
  display: block;
  background: white;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin: 30rpx 0;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 25rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.download-btn {
  background: linear-gradient(45deg, #4CAF50, #66BB6A);
  color: white;
}

.share-btn {
  background: linear-gradient(45deg, #2196F3, #42A5F5);
  color: white;
}

.qr-info {
  border-top: 2rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.info-label {
  font-size: 26rpx;
  color: #666;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}


</style>