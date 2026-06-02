<template>
  <view v-if="visible" class="poster-mask" @click.self="onClose">
    <view class="poster-sheet">
      <view class="poster-header">
        <text class="poster-title">🎨 生成海报</text>
        <view class="poster-close" @click="onClose">×</view>
      </view>

      <!-- Canvas 预览区 -->
      <view class="poster-canvas-wrap">
        <canvas canvas-id="posterCanvas" class="poster-canvas" />
      </view>

      <!-- 主题选择 -->
      <scroll-view class="poster-themes" scroll-x>
        <view class="themes-inner">
          <view
            v-for="theme in themes"
            :key="theme.id"
            class="theme-chip"
            :class="{ active: activeTheme === theme.id }"
            @click="selectTheme(theme.id)"
          >
            <view class="theme-dot" :style="{ background: theme.color }" />
            <text class="theme-name">{{ theme.label }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="poster-footer">
        <view class="poster-btn cancel" @click="onClose">关闭</view>
        <view class="poster-btn save" @click="savePoster">保存到相册</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, getCurrentInstance } from 'vue'

const props = defineProps<{
  visible: boolean
  memoName: string
  tags: string[]
  content: any[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

const instance = getCurrentInstance()
const activeTheme = ref('violet')

const CANVAS_W = 375
const CANVAS_H = 560

const themes = [
  { id: 'violet', label: '紫幻', color: '#667eea', from: '#667eea', to: '#764ba2' },
  { id: 'ocean',  label: '深海', color: '#0099f7', from: '#0099f7', to: '#2c5364' },
  { id: 'forest', label: '森林', color: '#43a047', from: '#56ab2f', to: '#a8e063' },
  { id: 'rose',   label: '玫瑰', color: '#f5576c', from: '#f093fb', to: '#f5576c' },
  { id: 'night',  label: '夜空', color: '#2c3e50', from: '#2c3e50', to: '#3498db' },
]

const getTheme = () => themes.find(t => t.id === activeTheme.value) || themes[0]

const getTextPreview = (): string => {
  const parts: string[] = []
  for (const block of props.content) {
    if (block.type === 'text' && Array.isArray(block.children)) {
      for (const item of block.children) {
        if (item.value) parts.push(String(item.value))
        if (parts.join('').length > 140) break
      }
    }
    if (parts.join('').length > 140) break
  }
  return parts.join(' ').slice(0, 140)
}

const splitToLines = (text: string, maxChars: number): string[] => {
  const lines: string[] = []
  let buf = ''
  for (const ch of text) {
    buf += ch
    if (buf.length >= maxChars) { lines.push(buf); buf = '' }
  }
  if (buf) lines.push(buf)
  return lines
}

const drawPoster = () => {
  const ctx = uni.createCanvasContext('posterCanvas', instance)
  const theme = getTheme()

  // ── 渐变背景 ────────────────────────────────────────
  const grd = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H)
  grd.addColorStop(0, theme.from)
  grd.addColorStop(1, theme.to)
  ctx.setFillStyle(grd)
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // ── 装饰圆 ──────────────────────────────────────────
  ctx.setGlobalAlpha(0.1)
  ctx.setFillStyle('#ffffff')
  ctx.beginPath(); ctx.arc(CANVAS_W - 50, 50, 110, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(30, CANVAS_H - 60, 80, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(CANVAS_W / 2, CANVAS_H / 2, 180, 0, Math.PI * 2); ctx.fill()
  ctx.setGlobalAlpha(1)

  // ── 装饰字符 ─────────────────────────────────────────
  ctx.setGlobalAlpha(0.2)
  ctx.setFillStyle('#ffffff')
  ctx.setFontSize(18)
  const decos = ['♥', '✦', '✧', '♡', '✨']
  const dPos = [[28, 110], [CANVAS_W - 44, 200], [55, CANVAS_H - 130], [CANVAS_W - 72, CANVAS_H - 90], [CANVAS_W * 0.35, 72]]
  dPos.forEach(([x, y], i) => ctx.fillText(decos[i % decos.length], x, y))
  ctx.setGlobalAlpha(1)

  // ── 标题 ─────────────────────────────────────────────
  ctx.setFillStyle('#ffffff')
  ctx.setFontSize(24)
  ctx.setTextAlign('center')
  const titleText = (props.memoName || '无标题备忘录').slice(0, 20)
  ctx.fillText(titleText, CANVAS_W / 2, 72)

  // 分割线
  ctx.setGlobalAlpha(0.4)
  ctx.setStrokeStyle('#ffffff')
  ctx.setLineWidth(1)
  ctx.beginPath()
  ctx.moveTo(CANVAS_W * 0.22, 86)
  ctx.lineTo(CANVAS_W * 0.78, 86)
  ctx.stroke()
  ctx.setGlobalAlpha(1)

  // ── 标签 ─────────────────────────────────────────────
  if (props.tags.length > 0) {
    ctx.setFontSize(13)
    ctx.setFillStyle('rgba(255,255,255,0.8)')
    ctx.setTextAlign('center')
    const tagLine = props.tags.slice(0, 5).map(t => `#${t}`).join('  ')
    ctx.fillText(tagLine, CANVAS_W / 2, 108)
  }

  // ── 内容卡片背景 ──────────────────────────────────────
  const cardX = 28; const cardY = 130; const cardW = CANVAS_W - 56; const cardH = 300; const r = 12
  ctx.setGlobalAlpha(0.18)
  ctx.setFillStyle('#ffffff')
  ctx.beginPath()
  ctx.arc(cardX + r, cardY + r, r, Math.PI, Math.PI * 1.5)
  ctx.arc(cardX + cardW - r, cardY + r, r, Math.PI * 1.5, 0)
  ctx.arc(cardX + cardW - r, cardY + cardH - r, r, 0, Math.PI * 0.5)
  ctx.arc(cardX + r, cardY + cardH - r, r, Math.PI * 0.5, Math.PI)
  ctx.closePath()
  ctx.fill()
  ctx.setGlobalAlpha(1)

  // ── 内容文字 ─────────────────────────────────────────
  const preview = getTextPreview()
  if (preview) {
    ctx.setFillStyle('rgba(255,255,255,0.92)')
    ctx.setFontSize(14)
    ctx.setTextAlign('left')
    const lines = splitToLines(preview, 22).slice(0, 12)
    lines.forEach((line, i) => {
      ctx.fillText(line, cardX + 16, cardY + 26 + i * 22)
    })
  } else {
    ctx.setFillStyle('rgba(255,255,255,0.5)')
    ctx.setFontSize(14)
    ctx.setTextAlign('center')
    ctx.fillText('（暂无文字内容）', CANVAS_W / 2, cardY + cardH / 2)
  }

  // ── 底部日期 ─────────────────────────────────────────
  ctx.setFillStyle('rgba(255,255,255,0.65)')
  ctx.setFontSize(12)
  ctx.setTextAlign('center')
  const d = new Date()
  const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  ctx.fillText(dateStr, CANVAS_W / 2, CANVAS_H - 20)

  ctx.draw()
}

const selectTheme = (id: string) => {
  activeTheme.value = id
  nextTick(drawPoster)
}

const savePoster = () => {
  uni.canvasToTempFilePath(
    {
      canvasId: 'posterCanvas',
      success: (res) => {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: () => uni.showToast({ title: '请授权相册权限后重试', icon: 'none' }),
        })
      },
      fail: () => uni.showToast({ title: '生成海报失败，请重试', icon: 'none' }),
    },
    instance
  )
}

const onClose = () => emit('update:visible', false)

watch(
  () => props.visible,
  (v) => { if (v) nextTick(drawPoster) }
)
</script>

<style scoped>
.poster-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-end;
  z-index: 1010;
}

.poster-sheet {
  width: 100%;
  background: #fff;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  padding-bottom: env(safe-area-inset-bottom);
}

.poster-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 16rpx;
  border-bottom: 1rpx solid #eee;
}

.poster-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.poster-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
}

.poster-canvas-wrap {
  display: flex;
  justify-content: center;
  padding: 20rpx 0 12rpx;
  background: #f5f5f5;
}

.poster-canvas {
  width: 375px;
  height: 560px;
  border-radius: 8rpx;
  overflow: hidden;
}

.poster-themes {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.themes-inner {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  padding: 0 24rpx;
}

.theme-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: 40rpx;
  border: 2rpx solid #eee;
  background: #fff;
  white-space: nowrap;
  transition: all 0.2s;
}

.theme-chip.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.08);
}

.theme-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.theme-name {
  font-size: 24rpx;
  color: #444;
}

.poster-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 32rpx 32rpx;
}

.poster-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.poster-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.poster-btn.save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
