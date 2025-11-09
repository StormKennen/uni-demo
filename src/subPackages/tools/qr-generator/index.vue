<template>
  <view class="qr-generator">
    <!-- 导航栏（统一样式） -->
    <nav-bar
      always-title
      title="二维码生成器"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #0046B4 0%, #1E40AF 100%)' }"
    />
    
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
      
      <!-- 二维码显示区域：生成中也渲染Canvas，避免DOM未挂载导致找不到元素 -->
      <view v-show="qrGenerated || isGenerating" class="qr-display">
        <view class="section-title">生成结果</view>
        <!-- 显示比例调节：用于微调避免右侧裁剪 -->
        <view class="scale-control">
          <text class="scale-label">显示比例</text>
          <slider 
            min="70" max="100" step="1"
            :value="Math.round(displayScale * 100)"
            @change="onScaleChanged"
            activeColor="#667eea"
          />
        </view>
        <view class="qr-container">
          <canvas 
            id="qrcode"
            canvas-id="qrcode" 
            :width="canvasPixelSize"
            :height="canvasPixelSize"
            :style="{ width: canvasDisplaySize + 'px', height: canvasDisplaySize + 'px' }"
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
import NavBar from '@/components/nav-bar.vue'
import UQRCode from 'uqrcodejs'

// H5图片二维码解析：改为运行时动态加载CDN，避免本地依赖

export default {
  name: 'QRGenerator',
  components: {
    NavBar
  },
  data() {
    return {
      inputContent: '',
      isGenerating: false,
      qrGenerated: false,
      // 展示与像素尺寸
      canvasDisplaySize: 300,
      canvasPixelSize: 300,
      // 展示比例（70%-100%），默认95%，可通过滑块调整
      displayScale: 0.95,
      
    }
  },
  mounted() {
    // 初始化自适应尺寸
    this.updateCanvasDisplaySize()
    // 监听窗口尺寸变化（H5）
    // #ifdef H5
    window.addEventListener('resize', this.updateCanvasDisplaySize)
    // #endif
  },
  beforeUnmount() {
    // #ifdef H5
    window.removeEventListener('resize', this.updateCanvasDisplaySize)
    // #endif
  },
  
  methods: {
    // 计算Canvas展示与像素尺寸，保证整图在屏幕完整显示且清晰
    updateCanvasDisplaySize() {
      const sys = uni.getSystemInfoSync()
      const vw = sys.windowWidth || sys.screenWidth || 375
      const vh = sys.windowHeight || sys.screenHeight || 667
      const pr = sys.pixelRatio || 2
      // 结合页面 rpx 内边距，避免容器裁剪（content:20rpx*2 + qr-display:30rpx*2）
      const rpxUnit = vw / 750
      const horizontalPaddingPx = Math.floor(rpxUnit * (20 * 2 + 30 * 2))
      const safeInset = Math.max(12, horizontalPaddingPx) // 额外留出12px安全边距
      const base = Math.floor(Math.min(vw - safeInset, vh - safeInset))
      const display = Math.floor(base * this.displayScale)
      const pixel = Math.min(Math.floor(display * pr), 1024) // 防止像素过大
      this.canvasDisplaySize = Math.max(220, display)
      this.canvasPixelSize = Math.max(220, pixel)
    },
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
      const domainPattern = /^[\w\-]+(\.[\w\-]+)+\.?$/
      
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
      // 生成时确保Canvas已渲染到DOM
      await this.$nextTick()
      // 更新自适应尺寸（防止横竖屏或窗口变化）
      this.updateCanvasDisplaySize()
      
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
        // 设置canvas像素尺寸并按设备像素比缩放，确保绘制坐标以CSS像素为基准
        const dpr = window.devicePixelRatio || 1
        canvas.width = Math.floor(this.canvasDisplaySize * dpr)
        canvas.height = Math.floor(this.canvasDisplaySize * dpr)
        // 重置变换矩阵到 dpr，避免累计缩放
        if (ctx.setTransform) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        } else {
          ctx.scale(dpr, dpr)
        }
        console.log('Canvas尺寸设置完成: display=', this.canvasDisplaySize, ' dpr=', dpr, ' pixel=', canvas.width)
        // #endif
        
        // #ifndef H5
        ctx = uni.createCanvasContext('qrcode', this)
        // #endif
        
        // 清空canvas（以CSS尺寸为基准）
        ctx.clearRect(0, 0, this.canvasDisplaySize, this.canvasDisplaySize)
        
        // 使用固定参数生成二维码
        console.log('创建UQRCode实例')
        const qr = new UQRCode()
        qr.data = content
        // 默认按CSS尺寸绘制，H5通过dpr缩放映射到像素；小程序仍用像素尺寸
        qr.size = this.canvasDisplaySize
        qr.margin = 10
        // 设置颜色与纠错等级（遵循官方API命名）
        qr.areaColor = '#FFFFFF'
        qr.backgroundColor = '#FFFFFF'
        qr.foregroundColor = '#000000'
        qr.errorCorrectLevel = UQRCode.errorCorrectLevel.M
        // 使用动态尺寸以避免小数像素导致的细缝
        qr.useDynamicSize = true
        
        console.log('开始生成二维码数据')
        qr.make()
        console.log('二维码数据生成完成')
        
        // 根据动态尺寸同步绘制大小（单位：CSS像素）
        const drawSize = qr.useDynamicSize && qr.dynamicSize ? qr.dynamicSize : qr.size
        console.log('绘制尺寸:', drawSize, '（dynamicSize:', qr.dynamicSize, '）')
        
        // 使用官方 drawCanvas 绘制到canvas
        // #ifdef H5
        // H5：同步canvas像素尺寸为 CSS尺寸*dpr，并禁用平滑
        const dpr2 = window.devicePixelRatio || 1
        canvas.width = Math.floor(drawSize * dpr2)
        canvas.height = Math.floor(drawSize * dpr2)
        if (ctx.setTransform) {
          ctx.setTransform(dpr2, 0, 0, dpr2, 0, 0)
        } else {
          ctx.scale(dpr2, dpr2)
        }
        if (ctx) {
          ctx.imageSmoothingEnabled = false
        }
        qr.canvasContext = ctx
        try {
          await Promise.resolve(qr.drawCanvas())
          console.log('二维码绘制完成（H5 drawCanvas）')
          this.qrGenerated = true
          this.isGenerating = false
          uni.showToast({
            title: '二维码生成成功',
            icon: 'success'
          })
        } catch (err) {
          console.warn('H5库绘制失败，回退到手绘逻辑:', err)
          // 回退手绘（使用整数像素单元，避免真值误判）
          const modules = qr.modules
          const moduleCount = modules && modules.length ? modules.length : qr.moduleCount
          const cell = Math.floor(drawSize / moduleCount)
          const offset = Math.floor((drawSize - cell * moduleCount) / 2)
          ctx.clearRect(0, 0, drawSize, drawSize)
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, drawSize, drawSize)
          ctx.fillStyle = '#000000'
          for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
              if (modules[row][col]) {
                ctx.fillRect(
                  offset + col * cell,
                  offset + row * cell,
                  cell,
                  cell
                )
              }
            }
          }
          console.log('二维码绘制完成（手绘回退）')
          this.qrGenerated = true
          this.isGenerating = false
          uni.showToast({
            title: '二维码生成成功',
            icon: 'success'
          })
        }
        // #endif
        
        // #ifndef H5
        qr.canvasContext = ctx
        qr.drawCanvas()
        ctx.draw(false, () => {
          console.log('二维码绘制完成（小程序）')
          this.qrGenerated = true
          this.isGenerating = false
          uni.showToast({
            title: '二维码生成成功',
            icon: 'success'
          })
        })
        // #endif
        
      } catch (error) {
        console.error('生成二维码失败:', error)
        this.isGenerating = false
        uni.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        })
      }
    },
    
    // 显示比例变化
    onScaleChanged(e) {
      this.displayScale = e.detail.value / 100
      this.updateCanvasDisplaySize()
      if (this.qrGenerated) {
        this.generateQRCode()
      }
    },
    
    // 下载二维码
    async downloadQRCode() {
      if (!this.qrGenerated) {
        uni.showToast({
          title: '请先生成二维码',
          icon: 'none'
        })
        return
      }
      
      try {
        // #ifdef H5
        const canvas = document.getElementById('qrcode') || 
                     document.querySelector('#qrcode') ||
                     document.querySelector('canvas[canvas-id="qrcode"]') ||
                     document.querySelector('.qr-canvas') ||
                     document.querySelector('canvas')
        
        if (!canvas) {
          throw new Error('Canvas元素未找到')
        }
        
        // 创建下载链接
        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = 'qrcode.png'
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        uni.showToast({
          title: '下载成功',
          icon: 'success'
        })
        // #endif
        
        // #ifndef H5
        uni.canvasToTempFilePath({
          canvasId: 'qrcode',
          success: (res) => {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.showToast({
                  title: '保存成功',
                  icon: 'success'
                })
              },
              fail: (err) => {
                console.error('保存失败:', err)
                uni.showToast({
                  title: '保存失败',
                  icon: 'none'
                })
              }
            })
          },
          fail: (err) => {
            console.error('生成临时文件失败:', err)
            uni.showToast({
              title: '下载失败',
              icon: 'none'
            })
          }
        }, this)
        // #endif
        
      } catch (error) {
        console.error('下载失败:', error)
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    },
    
    // 分享二维码
    async shareQRCode() {
      if (!this.qrGenerated) {
        uni.showToast({
          title: '请先生成二维码',
          icon: 'none'
        })
        return
      }
      
      try {
        // #ifdef H5
        const canvas = document.getElementById('qrcode') || 
                     document.querySelector('#qrcode') ||
                     document.querySelector('canvas[canvas-id="qrcode"]') ||
                     document.querySelector('.qr-canvas') ||
                     document.querySelector('canvas')
        
        if (!canvas) {
          throw new Error('Canvas元素未找到')
        }
        
        // 生成临时文件路径
        const dataUrl = canvas.toDataURL('image/png')
        const res = await uni.uploadFile({
          url: '', // 需要配置上传接口
          filePath: dataUrl,
          name: 'file'
        })
        
        if (res.statusCode === 200) {
          const fileUrl = JSON.parse(res.data).url
          await uni.share({
            type: 'image',
            imageUrl: fileUrl,
            title: '二维码分享'
          })
        }
        // #endif
        
        // #ifndef H5
        uni.canvasToTempFilePath({
          canvasId: 'qrcode',
          success: async (res) => {
            await uni.share({
              type: 'image',
              imageUrl: res.tempFilePath,
              title: '二维码分享'
            })
          },
          fail: (err) => {
            console.error('生成临时文件失败:', err)
            uni.showToast({
              title: '分享失败',
              icon: 'none'
            })
          }
        }, this)
        // #endif
        
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
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20rpx;
  padding-top: calc(32rpx + var(--nav-height, 120rpx));
  overflow-y: auto;
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
  overflow: visible;
}

.qr-canvas {
  max-width: 100%;
  height: auto;
  display: block;
  background: white;
  box-sizing: content-box;
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

.parse-btn {
  background: linear-gradient(45deg, #8E24AA, #AB47BC);
  color: white;
}

.scan-btn {
  background: linear-gradient(45deg, #FF7043, #FF8A65);
  color: white;
}

.qr-info {
  border-top: 2rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.scale-control {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.scale-label {
  font-size: 26rpx;
  color: #666;
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