<template>
  <view class="auspicious-page">
    <!-- 顶部导航栏 -->
    <nav-bar
      always-title
      title="择吉日"
      custom-class="light"
      :custom-style="{ backgroundColor: '#C83C3C' }"
    />
    
    <!-- 操作按钮栏 -->
    <view class="action-bar">
      <view class="action-left">
        <text class="selected-count" v-if="selectedDays.size > 0">已选 {{ selectedDays.size }} 天</text>
      </view>
      <view class="action-right">
        <view class="action-btn" @click="onCopy">
          <uni-icons type="copy" size="16" color="#666" />
          <text class="action-text">复制</text>
        </view>
        <view class="action-btn" @click="onExport">
          <uni-icons type="download" size="16" color="#666" />
          <text class="action-text">导出</text>
        </view>
        <view class="action-btn" @click="onShare">
          <uni-icons type="redo" size="16" color="#666" />
          <text class="action-text">分享</text>
        </view>
      </view>
    </view>
    
    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-title">选择事件类型</view>
      <view class="filter-tags">
        <view 
          v-for="tag in luckyTags" 
          :key="tag.key"
          class="filter-tag"
          :class="{ active: selectedTag === tag.key }"
          @click="selectTag(tag.key)"
        >
          {{ tag.label }}
        </view>
      </view>
    </view>

    <view class="auspicious-main">
      <!-- 事件说明 -->
      <view class="event-desc" v-if="selectedTag">
        <text class="desc-text">{{ currentTagDesc }}</text>
      </view>
      
      <!-- 统计信息 -->
      <view class="stats-info" v-if="selectedTag && !loading">
        <text class="stats-text">
          近期宜{{ currentTagLabel }}的日子共有 
          <text class="stats-count">{{ selectedDays.size || filteredDays.length }}</text> 天
        </text>
      </view>
      
      <!-- 日期范围和过滤选项 -->
      <view class="options-bar" v-if="selectedTag">
        <view class="date-range">
          <view class="range-item" @click="showStartPicker = true">
            <text class="range-label">开始</text>
            <text class="range-value">{{ formatDisplayDate(startDate) }}</text>
          </view>
          <view class="range-item" @click="showEndPicker = true">
            <text class="range-label">结束</text>
            <text class="range-value">{{ formatDisplayDate(endDate) }}</text>
          </view>
        </view>
        <view class="weekend-filter" @click="onlyWeekend = !onlyWeekend">
          <text class="filter-label">只看周末</text>
          <switch :checked="onlyWeekend" color="#C83C3C" style="transform: scale(0.7);" />
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-wrapper" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 结果列表 -->
      <scroll-view 
        v-else-if="selectedTag && filteredDays.length > 0"
        scroll-y 
        class="result-list"
      >
        <view 
          v-for="(day, index) in filteredDays" 
          :key="index"
          class="result-card"
          :class="{ 'export-hidden': shouldHideForExport(day) }"
          @click="goToDetail(day)"
        >
          <!-- 左侧日期区域 -->
          <view class="card-date">
            <view class="date-day">{{ String(day.solar.day).padStart(2, '0') }}</view>
            <view class="date-month">{{ day.solar.year }}.{{ String(day.solar.month).padStart(2, '0') }}</view>
            <view class="date-week" :class="{ weekend: isWeekend(day) }">{{ getWeekDay(day) }}</view>
          </view>
          
          <!-- 右侧信息区域 -->
          <view class="card-info">
            <view class="info-header">
              <text class="lunar-text">农历 {{ day.lunar.month }}月{{ day.lunar.day }}</text>
              <text class="days-badge" :class="getDaysClass(day)">{{ getDaysFromNow(day) }}</text>
            </view>
            <view class="info-ganzhi">
              <text class="ganzhi-year">{{ day.ganZhi }}</text>
              <text class="shengxiao">{{ day.shengXiao || '属蛇' }}</text>
            </view>
            <view class="info-extra" v-if="day.shenSha || day.xingXiu">
              <text class="extra-item" v-if="day.shenSha">值神: {{ day.shenSha }}</text>
              <text class="extra-item" v-if="day.xingXiu">星宿: {{ day.xingXiu }}</text>
            </view>
          </view>
          
          <!-- 复选框 -->
          <view class="card-checkbox" @click.stop="toggleSelect(day)">
            <view class="checkbox" :class="{ checked: isSelected(day) }">
              <uni-icons v-if="isSelected(day)" type="checkmarkempty" size="14" color="#fff" />
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-else-if="selectedTag && !loading">
        <text class="empty-text">暂无符合条件的吉日</text>
      </view>
      
      <!-- 未选择状态 -->
      <view class="empty-state" v-else-if="!selectedTag">
        <text class="empty-text">请选择事件类型</text>
      </view>

    </view>
    
    <!-- 日期选择器 -->
    <uni-popup ref="startPickerPopup" type="bottom">
      <view class="picker-wrapper">
        <view class="picker-header">
          <text class="picker-cancel" @click="startPickerPopup?.close()">取消</text>
          <text class="picker-title">选择开始日期</text>
          <text class="picker-confirm" @click="confirmStartDate">确定</text>
        </view>
        <picker-view :value="startPickerValue" @change="onStartPickerChange" class="picker-view">
          <picker-view-column>
            <view v-for="year in yearRange" :key="year" class="picker-item">{{ year }}年</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="month in 12" :key="month" class="picker-item">{{ month }}月</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="day in 31" :key="day" class="picker-item">{{ day }}日</view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>
    
    <uni-popup ref="endPickerPopup" type="bottom">
      <view class="picker-wrapper">
        <view class="picker-header">
          <text class="picker-cancel" @click="endPickerPopup?.close()">取消</text>
          <text class="picker-title">选择结束日期</text>
          <text class="picker-confirm" @click="confirmEndDate">确定</text>
        </view>
        <picker-view :value="endPickerValue" @change="onEndPickerChange" class="picker-view">
          <picker-view-column>
            <view v-for="year in yearRange" :key="year" class="picker-item">{{ year }}年</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="month in 12" :key="month" class="picker-item">{{ month }}月</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="day in 31" :key="day" class="picker-item">{{ day }}日</view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import { getCalendarAuspicious } from '@/services/apifox/NODEJSDEMO/CALENDAR/apifox'
import { postPainterGenerateInfo } from '@/services/apifox/NODEJSDEMO/PAINTER/apifox'
import { formatDate } from '@/utils/lunar'

// 择吉日标签配置
const luckyTags = [
  { key: 'marry', label: '结婚', keywords: ['嫁娶', '结婚'], desc: '结婚：老黄历中"嫁娶"。男娶女嫁，举行结婚大典的吉日。' },
  { key: 'travel', label: '出行', keywords: ['出行'], desc: '出行：外出旅行、出差、远行的吉日。' },
  { key: 'move', label: '搬新房', keywords: ['入宅'], desc: '搬新房：老黄历中"入宅"。搬入新居、乔迁新居的吉日。' },
  { key: 'engagement', label: '订盟', keywords: ['订盟', '订婚'], desc: '订盟：订婚、订立婚约的吉日。' },
  { key: 'haircut', label: '理发', keywords: ['理发', '剃头'], desc: '理发：剪发、理发的吉日。' },
  { key: 'business', label: '开业', keywords: ['开市', '开业'], desc: '开业：老黄历中"开市"。开张营业、开业大吉的吉日。' }
]

const selectedTag = ref<string | null>(null)
const loading = ref(false)
const auspiciousDays = ref<any[]>([])
const onlyWeekend = ref(false)
// 选中的日期列表（用于导出）
const selectedDays = ref<Set<string>>(new Set())

// 切换选中状态
const toggleSelect = (day: any) => {
  const dateStr = formatDate(day.solar.year, day.solar.month, day.solar.day)
  if (selectedDays.value.has(dateStr)) {
    selectedDays.value.delete(dateStr)
  } else {
    selectedDays.value.add(dateStr)
  }
  // 触发响应式更新
  selectedDays.value = new Set(selectedDays.value)
}

// 判断日期是否被选中
const isSelected = (day: any) => {
  const dateStr = formatDate(day.solar.year, day.solar.month, day.solar.day)
  return selectedDays.value.has(dateStr)
}

// 获取要导出的日期列表（选中的或全部）
const getExportDays = () => {
  if (selectedDays.value.size === 0) {
    return filteredDays.value
  }
  return filteredDays.value.filter(day => {
    const dateStr = formatDate(day.solar.year, day.solar.month, day.solar.day)
    return selectedDays.value.has(dateStr)
  })
}

// 日期范围（默认从今天开始，一年内）
const today = new Date()
const startDate = ref(formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate()))
const endDateObj = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)
const endDate = ref(formatDate(endDateObj.getFullYear(), endDateObj.getMonth() + 1, endDateObj.getDate()))

// 日期选择器
const showStartPicker = ref(false)
const showEndPicker = ref(false)
const startPickerPopup = ref<any>(null)
const endPickerPopup = ref<any>(null)
const yearRange = [2025, 2026, 2027, 2028]
const startPickerValue = ref([1, today.getMonth(), today.getDate() - 1])
const endPickerValue = ref([1, endDateObj.getMonth(), endDateObj.getDate() - 1])
const tempStartDate = ref('')
const tempEndDate = ref('')

// 当前选中标签的描述
const currentTagDesc = computed(() => {
  const tag = luckyTags.find(t => t.key === selectedTag.value)
  return tag?.desc || ''
})

// 当前选中标签的名称
const currentTagLabel = computed(() => {
  const tag = luckyTags.find(t => t.key === selectedTag.value)
  return tag?.label || ''
})

// 过滤后的吉日列表
const filteredDays = computed(() => {
  let days = auspiciousDays.value
  
  // 过滤日期范围
  days = days.filter(day => {
    const dateStr = formatDate(day.solar.year, day.solar.month, day.solar.day)
    return dateStr >= startDate.value && dateStr <= endDate.value
  })
  
  // 只看周末
  if (onlyWeekend.value) {
    days = days.filter(day => isWeekend(day))
  }
  
  return days
})

// 判断是否为周末
const isWeekend = (day: any) => {
  const date = new Date(day.solar.year, day.solar.month - 1, day.solar.day)
  const weekDay = date.getDay()
  return weekDay === 0 || weekDay === 6
}

// 获取星期几
const getWeekDay = (day: any) => {
  const date = new Date(day.solar.year, day.solar.month - 1, day.solar.day)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekDays[date.getDay()]
}

// 计算距今天数
const getDaysFromNow = (day: any) => {
  const date = new Date(day.solar.year, day.solar.month - 1, day.solar.day)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diff = Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff < 0) return `${Math.abs(diff)}天前`
  return `${diff}天后`
}

// 获取天数标签的样式类
const getDaysClass = (day: any) => {
  const date = new Date(day.solar.year, day.solar.month - 1, day.solar.day)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diff = Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  if (diff <= 7) return 'week'
  return 'normal'
}

// 格式化显示日期
const formatDisplayDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-')
  return `${year}.${month}.${day}`
}

// 选择标签
const selectTag = async (key: string) => {
  if (selectedTag.value === key) return
  selectedTag.value = key
  await loadAuspiciousDays()
}

// 加载吉日数据（一年内）
const loadAuspiciousDays = async () => {
  if (!selectedTag.value) return
  
  const tag = luckyTags.find(t => t.key === selectedTag.value)
  if (!tag) return
  
  loading.value = true
  auspiciousDays.value = []
  
  try {
    // 获取一年内的数据（按月请求）
    const startYear = today.getFullYear()
    const startMonth = today.getMonth() + 1
    const promises = []
    
    for (let i = 0; i < 12; i++) {
      let year = startYear
      let month = startMonth + i
      if (month > 12) {
        year += 1
        month -= 12
      }
      promises.push(
        getCalendarAuspicious({
          year,
          month,
          event: tag.keywords[0]
        })
      )
    }
    
    const results = await Promise.all(promises)
    const allDays: any[] = []
    
    results.forEach(res => {
      if (res?.days && Array.isArray(res.days)) {
        allDays.push(...res.days)
      }
    })
    
    // 按日期排序
    allDays.sort((a, b) => {
      const dateA = new Date(a.solar.year, a.solar.month - 1, a.solar.day)
      const dateB = new Date(b.solar.year, b.solar.month - 1, b.solar.day)
      return dateA.getTime() - dateB.getTime()
    })
    
    auspiciousDays.value = allDays
  } catch (error) {
    console.error('获取吉日数据失败:', error)
    uni.showToast({ title: '获取数据失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 跳转详情
const goToDetail = (day: any) => {
  const dateStr = formatDate(day.solar.year, day.solar.month, day.solar.day)
  uni.navigateTo({
    url: `/subPackages/tools/calendar/detail?date=${dateStr}`
  })
}

// 日期选择器相关
const onStartPickerChange = (e: any) => {
  const values = e.detail.value
  const year = yearRange[values[0]]
  const month = values[1] + 1
  const day = values[2] + 1
  tempStartDate.value = formatDate(year, month, day)
}

const onEndPickerChange = (e: any) => {
  const values = e.detail.value
  const year = yearRange[values[0]]
  const month = values[1] + 1
  const day = values[2] + 1
  tempEndDate.value = formatDate(year, month, day)
}

const confirmStartDate = () => {
  if (tempStartDate.value) {
    startDate.value = tempStartDate.value
  }
  startPickerPopup.value?.close()
}

const confirmEndDate = () => {
  if (tempEndDate.value) {
    endDate.value = tempEndDate.value
  }
  endPickerPopup.value?.close()
}

// 监听日期选择器显示
watch(showStartPicker, (val) => {
  if (val) {
    startPickerPopup.value?.open()
  }
})

watch(showEndPicker, (val) => {
  if (val) {
    endPickerPopup.value?.open()
  }
})

// 导出功能
const exportLoading = ref(false)

const onExport = async () => {
  if (!selectedTag.value || filteredDays.value.length === 0) {
    uni.showToast({ title: '请先选择事件类型', icon: 'none' })
    return
  }
  
  if (exportLoading.value) {
    uni.showToast({ title: '正在处理中...', icon: 'none' })
    return
  }
  
  try {
    exportLoading.value = true
    uni.showLoading({ title: '正在生成图片...', mask: true })
    
    // 构建目标URL，传递勾选的日期
    const baseUrl = String(import.meta.env.VITE_PUBLIC_THIS_H5_URL || '').replace(/['"]/g, '')
    let targetUrl = `${baseUrl}/subPackages/tools/calendar/auspicious?tag=${selectedTag.value}&weekend=${onlyWeekend.value ? '1' : '0'}`
    
    // 如果有勾选的日期，传递给页面
    if (selectedDays.value.size > 0) {
      const selectedDatesStr = Array.from(selectedDays.value).join(',')
      targetUrl += `&selected=${encodeURIComponent(selectedDatesStr)}`
    }
    
    const posterId = `auspicious_${selectedTag.value}_${Date.now()}`
    
    // 调用后端海报生成接口（超时时间3分钟）
    const generateRes = await postPainterGenerateInfo({
      id: posterId,
      targetUrl: targetUrl,
      selector: '.auspicious-main',
      options: {
        width: 375,
        deviceScaleFactor: 2,
        readySelector: '.result-card',
        timeout: 180000, // 3分钟超时
        extraWaitTime: 5000, // 额外等待5秒
        hideSelectors: ['.export-hidden', '.options-bar'] // 隐藏未勾选的元素
      }
    })
    
    if (!generateRes?.id) {
      throw new Error('生成海报失败，服务器未返回有效数据')
    }
    
    // 下载图片
    // #ifdef H5
    await downloadImageForH5(posterId)
    // #endif
    
    // #ifndef H5
    await downloadImageForMp(posterId)
    // #endif
    
  } catch (error: any) {
    console.error('导出图片失败:', error)
    uni.hideLoading()
    uni.showToast({ title: error?.message || '导出失败', icon: 'none' })
  } finally {
    exportLoading.value = false
  }
}

// H5端下载图片
const downloadImageForH5 = async (posterId: string) => {
  const imageUrl = `${import.meta.env.VITE_APP_BASE_URL}/painter/${posterId}`
  
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`下载失败，状态码: ${response.status}`)
  }
  
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `吉日列表_${selectedTag.value}_${Date.now()}.png`
  link.click()
  
  URL.revokeObjectURL(url)
  
  uni.hideLoading()
  uni.showToast({ title: '图片已下载', icon: 'success' })
}

// 小程序端下载并保存图片
const downloadImageForMp = async (posterId: string) => {
  const baseUrl = String(import.meta.env.VITE_APP_BASE_URL || '').replace(/['"]/g, '')
  const imageUrl = `${baseUrl}/painter/${posterId}`
  
  let tempFilePath: string
  
  try {
    const imageInfo = await new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
      uni.getImageInfo({
        src: imageUrl,
        success: (res) => resolve(res),
        fail: (err) => reject(new Error(err.errMsg || '获取图片失败'))
      })
    })
    tempFilePath = imageInfo.path
  } catch (err: any) {
    // 如果getImageInfo失败，尝试使用downloadFile
    const downloadRes = await new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
      uni.downloadFile({
        url: imageUrl,
        success: resolve,
        fail: (err) => reject(new Error(err.errMsg || '下载失败'))
      })
    })
    
    if (downloadRes.statusCode !== 200 || !downloadRes.tempFilePath) {
      throw new Error(`下载失败，状态码: ${downloadRes.statusCode}`)
    }
    tempFilePath = downloadRes.tempFilePath
  }
  
  uni.hideLoading()
  
  // 保存到相册
  await new Promise<void>((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        uni.showToast({ title: '已保存到相册', icon: 'success' })
        resolve()
      },
      fail: (err) => {
        if (err.errMsg?.includes('auth deny')) {
          uni.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting({})
              }
            }
          })
        }
        reject(new Error(err.errMsg || '保存失败'))
      }
    })
  })
}

// 分享按钮点击
const onShare = () => {
  // #ifdef MP-WEIXIN
  uni.showToast({
    title: '请点击右上角分享',
    icon: 'none'
  })
  // #endif
  
  // #ifdef H5
  const tag = luckyTags.find(t => t.key === selectedTag.value)
  const shareUrl = `${window.location.origin}/#/subPackages/tools/calendar/auspicious?tag=${selectedTag.value || ''}&weekend=${onlyWeekend.value ? '1' : '0'}`
  // @ts-ignore
  if (navigator.clipboard) {
    // @ts-ignore
    navigator.clipboard.writeText(shareUrl).then(() => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success'
      })
    })
  } else {
    uni.showModal({
      title: '分享链接',
      content: shareUrl,
      showCancel: false
    })
  }
  // #endif
}

// 导出模式下需要隐藏的日期（从URL参数解析）
const exportSelectedDates = ref<Set<string>>(new Set())
const isExportMode = ref(false)

// 判断元素是否需要在导出时隐藏
const shouldHideForExport = (day: any) => {
  if (!isExportMode.value || exportSelectedDates.value.size === 0) {
    return false
  }
  const dateStr = formatDate(day.solar.year, day.solar.month, day.solar.day)
  return !exportSelectedDates.value.has(dateStr)
}

// 页面加载时解析参数
onLoad((options: any) => {
  if (options?.tag) {
    selectedTag.value = options.tag
    loadAuspiciousDays()
  }
  if (options?.weekend === '1') {
    onlyWeekend.value = true
  }
  // 解析导出模式下的勾选日期
  if (options?.selected) {
    isExportMode.value = true
    const selectedStr = decodeURIComponent(options.selected)
    const dates = selectedStr.split(',')
    exportSelectedDates.value = new Set(dates)
    selectedDays.value = new Set(dates)
  }
})

// 微信小程序分享
// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  const tag = luckyTags.find(t => t.key === selectedTag.value)
  const title = tag ? `${tag.label}吉日查询 - 共${filteredDays.value.length}天` : '择吉日查询'
  const path = `/subPackages/tools/calendar/auspicious?tag=${selectedTag.value || ''}&weekend=${onlyWeekend.value ? '1' : '0'}`
  return { title, path }
})

onShareTimeline(() => {
  const tag = luckyTags.find(t => t.key === selectedTag.value)
  return {
    title: tag ? `${tag.label}吉日查询` : '择吉日查询'
  }
})
// #endif
</script>

<style lang="scss" scoped>
$primary-red: #C83C3C;

.nav-right-btns {
  display: flex;
  gap: 16rpx;
}

.nav-btn {
  padding: 8rpx 20rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
}

.btn-text {
  font-size: 24rpx;
  color: #fff;
}

.auspicious-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.action-left {
  .selected-count {
    font-size: 24rpx;
    color: $primary-red;
    font-weight: 500;
  }
}

.action-right {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 24rpx;
  
  .action-text {
    font-size: 24rpx;
    color: #666;
  }
}

.filter-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.filter-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.filter-tag {
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f5f5f5;
  border: 2rpx solid #e0e0e0;
  
  &.active {
    color: #fff;
    background-color: $primary-red;
    border-color: $primary-red;
  }
}

.event-desc {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.desc-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.stats-info {
  background-color: #fff;
  padding: 24rpx;
  text-align: center;
  margin-bottom: 16rpx;
}

.stats-text {
  font-size: 28rpx;
  color: #666;
}

.stats-count {
  font-size: 48rpx;
  color: $primary-red;
  font-weight: 600;
}

.options-bar {
  background-color: #fff;
  padding: 20rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.date-range {
  display: flex;
  gap: 24rpx;
}

.range-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.range-label {
  font-size: 24rpx;
  color: $primary-red;
}

.range-value {
  font-size: 24rpx;
  color: #333;
}

.weekend-filter {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.filter-label {
  font-size: 24rpx;
  color: #666;
}

.loading-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.result-list {
  flex: 1;
  padding: 16rpx;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.result-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100rpx;
  padding-right: 24rpx;
  border-right: 2rpx solid #f0f0f0;
  margin-right: 24rpx;
}

.date-day {
  font-size: 64rpx;
  font-weight: 300;
  color: $primary-red;
  line-height: 1;
}

.date-month {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.date-week {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
  
  &.weekend {
    color: $primary-red;
    font-weight: 500;
  }
}

.card-info {
  flex: 1;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.lunar-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.days-badge {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  background-color: #f5f5f5;
  color: #999;
  
  &.today {
    background-color: $primary-red;
    color: #fff;
  }
  
  &.tomorrow {
    background-color: #ff9800;
    color: #fff;
  }
  
  &.week {
    background-color: #e8f5e9;
    color: #4caf50;
  }
}

.info-ganzhi {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.ganzhi-year {
  font-size: 26rpx;
  color: #666;
}

.shengxiao {
  font-size: 24rpx;
  color: #999;
  padding: 2rpx 12rpx;
  background-color: #fff3e0;
  border-radius: 8rpx;
}

.info-extra {
  display: flex;
  gap: 16rpx;
}

.extra-item {
  font-size: 22rpx;
  color: #999;
}

.card-checkbox {
  padding-left: 16rpx;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.checked {
    background-color: $primary-red;
    border-color: $primary-red;
  }
}

.lunar-label {
  font-size: 24rpx;
  color: #999;
}

.lunar-value {
  font-size: 28rpx;
  color: #333;
}

.ganzhi-row {
  margin-bottom: 8rpx;
}

.ganzhi-text {
  font-size: 26rpx;
  color: #333;
}

.extra-row {
  display: flex;
  gap: 16rpx;
}

.extra-text {
  font-size: 22rpx;
  color: #999;
}

.item-days {
  margin-right: 16rpx;
}

.days-text {
  font-size: 22rpx;
  color: #999;
}

.item-check {
  .check-circle {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #ddd;
    border-radius: 50%;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.picker-wrapper {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.picker-cancel {
  font-size: 28rpx;
  color: #999;
}

.picker-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.picker-confirm {
  font-size: 28rpx;
  color: $primary-red;
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}
</style>
