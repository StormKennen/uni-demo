<template>
  <view class="calendar-page">
    <!-- 顶部导航栏 -->
    <nav-bar
      always-title
      title="万年历"
      custom-class="light"
      :custom-style="{ backgroundColor: '#C83C3C' }"
    />
    
    <!-- 头部操作栏 -->
    <view class="header">
      <view class="header-left">
        <view class="month-nav">
          <view class="nav-arrow" @click="prevMonth">‹</view>
          <picker mode="date" fields="month" :value="currentDateStr" @change="onDateChange">
            <view class="date-picker">
              <text class="year-month">{{ currentYear }}年{{ currentMonth }}月</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
          <view class="nav-arrow" @click="nextMonth">›</view>
        </view>
      </view>
      <view class="header-right">
        <view class="header-btn today-btn" @click="goToday">
          <text>今</text>
        </view>
        <view class="header-btn share-btn" @click="onShare">
          <text>分享</text>
        </view>
        <view class="header-btn festivals-btn" @click="goToFestivals">
          <text>节日</text>
        </view>
      </view>
    </view>

    <!-- 星期标题 -->
    <view class="week-header">
      <view 
        v-for="(day, index) in weekDays" 
        :key="index" 
        class="week-day"
        :class="{ 'weekend': index === 0 || index === 6 }"
      >
        {{ day }}
      </view>
    </view>

    <!-- 日历网格 -->
    <view class="calendar-grid">
      <view 
        v-for="(item, index) in calendarData" 
        :key="index"
        class="calendar-cell"
        :class="{
          'other-month': !item.isCurrentMonth,
          'selected': isSelected(item),
          'today': isToday(item),
          'has-festival': item.jieQi || item.festivals.length > 0
        }"
        @click="selectDate(item)"
      >
        <text class="solar-day">{{ item.solar.day }}</text>
        <text class="lunar-day">
          {{ item.jieQi || (item.festivals.length > 0 ? item.festivals[0] : item.lunar.day) }}
        </text>
        <!-- 假期标记 -->
        <text 
          v-if="getHolidayTag(item)" 
          class="holiday-tag"
          :class="getHolidayTag(item)?.type"
        >
          {{ getHolidayTag(item)?.type === 'rest' ? '休' : '班' }}
        </text>
      </view>
    </view>

    <!-- 选中日期详情卡片 -->
    <view class="detail-card" @click="goToDetail">
      <view class="card-content">
        <view class="card-left">
          <text class="big-day">{{ selectedData?.solar.day }}</text>
          <view class="day-info">
            <text class="month-text">{{ selectedData?.solar.month }}月</text>
            <text class="week-text">{{ selectedData?.solar.weekDayName }}</text>
          </view>
        </view>
        <view class="card-right">
          <view class="lunar-info">
            <text class="lunar-date">{{ selectedData?.lunar.dateStr }}</text>
            <text class="gan-zhi">第{{ selectedData?.week.weekOfYear }}周 {{ selectedData?.xingZuo }}座</text>
          </view>
          <view class="extra-info">
            <text>{{ selectedData?.ganZhi.year }}年 {{ selectedData?.ganZhi.month }}月 {{ selectedData?.ganZhi.day }}日 [{{ selectedData?.shengXiao }}]</text>
          </view>
        </view>
      </view>
      <!-- 宜忌独立行 -->
      <view class="yi-ji-wrapper">
        <view class="yi-section">
          <view class="yi-icon">宜</view>
          <view class="yi-list">
            <text v-for="(item, idx) in displayYi" :key="idx" class="yi-item">{{ item }}</text>
          </view>
        </view>
        <view class="ji-section">
          <view class="ji-icon">忌</view>
          <view class="ji-list">
            <text v-for="(item, idx) in displayJi" :key="idx" class="ji-item">{{ item }}</text>
          </view>
        </view>
      </view>
      <!-- 查看更多 -->
      <view class="card-footer">
        <text class="view-more">查看更多 ›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getCalendarMonth, getCalendarDetail } from '@/services/apifox/NODEJSDEMO/CALENDAR/apifox'
import { ref, computed, onMounted } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { formatDate, getTodayStr } from '@/utils/lunar'
import NavBar from '@/components/nav-bar.vue'
import { holidays } from './holidays'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDateStr = ref(getTodayStr())
const calendarData = ref<any[]>([])
const selectedData = ref<any>(null)
const loading = ref(false)

// 获取日期的假期标记
const getHolidayTag = (item: any) => {
  const dateStr = formatDate(item.solar.year, item.solar.month, item.solar.day)
  return holidays[dateStr] || null
}

const currentDateStr = computed(() => {
  return `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`
})

const displayYi = computed(() => {
  return selectedData.value?.yi?.slice(0, 4) || []
})

const displayJi = computed(() => {
  return selectedData.value?.ji?.slice(0, 4) || []
})

// 从后端获取月历数据
const loadCalendar = async () => {
  try {
    const res = await getCalendarMonth({ year: currentYear.value, month: currentMonth.value })
    if (res?.days) {
      calendarData.value = res.days
    }
  } catch (error) {
    console.error('获取月历数据失败:', error)
    uni.showToast({ title: '获取日历失败', icon: 'none' })
  }
}

// 从后端获取选中日期的黄历详情
const loadSelectedData = async () => {
  loading.value = true
  try {
    const res = await getCalendarDetail({ date: selectedDateStr.value })
    if (res) {
      selectedData.value = res
    }
  } catch (error) {
    console.error('获取黄历详情失败:', error)
    uni.showToast({ title: '获取详情失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const isSelected = (item: any) => {
  const dateStr = formatDate(item.solar.year, item.solar.month, item.solar.day)
  return dateStr === selectedDateStr.value
}

const isToday = (item: any) => {
  const dateStr = formatDate(item.solar.year, item.solar.month, item.solar.day)
  return dateStr === getTodayStr()
}

const selectDate = async (item: any) => {
  selectedDateStr.value = formatDate(item.solar.year, item.solar.month, item.solar.day)
  
  // 如果选择了其他月份的日期，切换到该月
  if (!item.isCurrentMonth) {
    currentYear.value = item.solar.year
    currentMonth.value = item.solar.month
    await loadCalendar()
  }
  
  await loadSelectedData()
}

const onDateChange = async (e: any) => {
  const [year, month] = e.detail.value.split('-').map(Number)
  currentYear.value = year
  currentMonth.value = month
  await loadCalendar()
}

// 上一月
const prevMonth = async () => {
  if (currentMonth.value === 1) {
    currentYear.value -= 1
    currentMonth.value = 12
  } else {
    currentMonth.value -= 1
  }
  await loadCalendar()
}

// 下一月
const nextMonth = async () => {
  if (currentMonth.value === 12) {
    currentYear.value += 1
    currentMonth.value = 1
  } else {
    currentMonth.value += 1
  }
  await loadCalendar()
}

// 回到今天
const goToday = async () => {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth() + 1
  selectedDateStr.value = getTodayStr()
  await loadCalendar()
  await loadSelectedData()
}

const goToDetail = () => {
  uni.navigateTo({
    url: `/subPackages/tools/calendar/detail?date=${selectedDateStr.value}`
  })
}

const goToFestivals = () => {
  uni.navigateTo({
    url: '/subPackages/tools/calendar/festivals'
  })
}

const onShare = () => {
  // #ifdef MP-WEIXIN
  uni.showToast({
    title: '请点击右上角分享',
    icon: 'none'
  })
  // #endif
  
  // #ifdef H5
  const shareUrl = `${window.location.origin}/#/subPackages/tools/calendar/index`
  // @ts-ignore
  if (navigator.clipboard) {
    // @ts-ignore
    navigator.clipboard.writeText(shareUrl).then(() => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success'
      })
    }).catch(() => {
      uni.showModal({
        title: '分享链接',
        content: shareUrl,
        showCancel: false
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

onMounted(async () => {
  await loadCalendar()
  await loadSelectedData()
})

// 微信小程序分享
// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  return {
    title: `${currentYear.value}年${currentMonth.value}月 万年历`,
    path: `/subPackages/tools/calendar/index`
  }
})

onShareTimeline(() => {
  return {
    title: `${currentYear.value}年${currentMonth.value}月 万年历`
  }
})
// #endif
</script>

<style lang="scss" scoped>
$primary-red: #C83C3C;
$taboo-green: #5A9A8B;
$gold: #D4B375;
$bg-color: #F8F8F8;
$card-bg: #FFFFFF;

.calendar-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: $primary-red;
  color: #fff;
}

.header-left {
  .month-nav {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
  .nav-arrow {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    font-weight: 300;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }
  
  .date-picker {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  
  .year-month {
    font-size: 32rpx;
    font-weight: 600;
  }
  
  .arrow {
    font-size: 20rpx;
  }
}

.header-right {
  display: flex;
  gap: 12rpx;
}

.header-btn {
  padding: 10rpx 20rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  
  &.today-btn {
    width: 48rpx;
    height: 48rpx;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #fff;
    border-radius: 8rpx;
    font-weight: 600;
  }
  
  &.share-btn {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &.festivals-btn {
    background-color: #fff;
    color: $primary-red;
    font-weight: 500;
  }
}

.week-header {
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.week-day {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  
  &.weekend {
    color: $primary-red;
  }
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;
}

.calendar-cell {
  width: calc(100% / 7);
  height: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &.other-month {
    .solar-day, .lunar-day {
      color: #ccc;
    }
  }
  
  &.selected {
    .solar-day {
      background-color: $primary-red;
      color: #fff;
      border-radius: 50%;
      width: 56rpx;
      height: 56rpx;
      line-height: 56rpx;
      text-align: center;
    }
  }
  
  &.today:not(.selected) {
    .solar-day {
      color: $primary-red;
      font-weight: 600;
    }
  }
  
  &.has-festival {
    .lunar-day {
      color: $primary-red;
    }
  }
}

.solar-day {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.lunar-day {
  font-size: 20rpx;
  color: #999;
  max-width: 90rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.holiday-tag {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  font-size: 18rpx;
  padding: 2rpx 6rpx;
  border-radius: 4rpx;
  
  &.rest {
    color: #52c41a;
  }
  
  &.work {
    color: #fa8c16;
  }
}

.detail-card {
  margin: 24rpx;
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.card-content {
  display: flex;
}

.card-left {
  display: flex;
  align-items: flex-end;
  margin-right: 32rpx;
  
  .big-day {
    font-size: 96rpx;
    font-weight: 300;
    color: $primary-red;
    line-height: 1;
  }
  
  .day-info {
    display: flex;
    flex-direction: column;
    margin-left: 8rpx;
    margin-bottom: 8rpx;
    
    .month-text {
      font-size: 28rpx;
      color: #333;
    }
    
    .week-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.card-right {
  flex: 1;
  
  .lunar-info {
    margin-bottom: 12rpx;
    
    .lunar-date {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-right: 16rpx;
    }
    
    .gan-zhi {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .extra-info {
    display: flex;
    gap: 16rpx;
    //margin-bottom: 16rpx;
    
    text {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.yi-ji-wrapper {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.yi-section, .ji-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
}

.yi-icon, .ji-icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #fff;
  flex-shrink: 0;
}

.yi-icon {
  background-color: $primary-red;
}

.ji-icon {
  background-color: $taboo-green;
}

.yi-list, .ji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  flex: 1;
}

.yi-item {
  font-size: 28rpx;
  color: $primary-red;
}

.ji-item {
  font-size: 28rpx;
  color: $taboo-green;
}

.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
  margin-top: 16rpx;
  
  .view-more {
    font-size: 26rpx;
    color: $primary-red;
  }
}
</style>
