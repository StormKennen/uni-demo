<template>
  <view class="detail-page">
    <nav-bar
      always-title
      title="黄历"
      custom-class="light"
      :custom-style="{ backgroundColor: '#C83C3C' }"
    />

    <!-- 顶部导航 -->
    <view class="nav-header">
      <!-- <view class="nav-back" @click="goBack">
        <text>‹</text>
      </view> -->
      <view class="nav-center">
        <view class="nav-arrow" @click="prevDay">
          <text>‹</text>
        </view>
        <picker mode="date" :value="currentDate" @change="onDateChange">
          <view class="nav-date">
            <text>{{ solarDateStr }}</text>
            <text class="arrow">▼</text>
          </view>
        </picker>
        <view class="nav-arrow" @click="nextDay">
          <text>›</text>
        </view>
      </view>
      <view class="nav-today" @click="goToday">
        <text>今</text>
      </view>
    </view>
    
    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 核心信息区 -->
    <view class="main-section">
      <view class="lunar-big">
        <text class="lunar-month">{{ data?.lunar.monthName }}月</text>
        <text class="lunar-day">{{ data?.lunar.dayName }}</text>
      </view>
      <view class="gan-zhi-row">
        <text class="gan-zhi">{{ data?.ganZhi.year }}年</text>
        <text class="gan-zhi">{{ data?.ganZhi.month }}月</text>
        <text class="gan-zhi">{{ data?.ganZhi.day }}日</text>
      </view>
      <view class="extra-row">
        <text>{{ data?.shengXiao }}年</text>
        <text>第{{ data?.week.weekOfYear }}周</text>
        <text>{{ data?.xingZuo }}座</text>
      </view>
    </view>

    <!-- 宜忌板块 -->
    <view class="yi-ji-section">
      <view class="yi-card">
        <view class="card-title yi-title">
          <text class="title-icon">宜</text>
          <text class="title-text">今日宜</text>
        </view>
        <view class="card-content">
          <text v-for="(item, idx) in data?.yi" :key="idx" class="yi-item">{{ item }}</text>
        </view>
      </view>
      <view class="ji-card">
        <view class="card-title ji-title">
          <text class="title-icon">忌</text>
          <text class="title-text">今日忌</text>
        </view>
        <view class="card-content">
          <text v-for="(item, idx) in data?.ji" :key="idx" class="ji-item">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 五行/冲煞/值神 -->
    <view class="info-row">
      <view class="info-item">
        <text class="info-label">五行</text>
        <text class="info-value">{{ data?.wuXing.riNaYin }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">冲煞</text>
        <text class="info-value">冲{{ data?.chongSha.chongShengXiao }} 煞{{ data?.chongSha.sha }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">值神</text>
        <text class="info-value">{{ data?.zhiShen }}</text>
      </view>
    </view>

    <!-- 时辰吉凶 -->
    <view class="time-section">
      <view class="section-title">
        <text class="title-icon">⏰</text>
        <text>时辰吉凶</text>
      </view>
      <scroll-view scroll-x class="time-scroll">
        <view class="time-list">
          <view 
            v-for="(time, idx) in data?.timeList" 
            :key="idx" 
            class="time-item"
            :class="{ 'is-ji': time.luck === '吉', 'is-xiong': time.luck === '凶' }"
          >
            <text class="time-name">{{ time.name }}时</text>
            <text class="time-range">{{ time.range }}</text>
            <text class="time-ganzhi">{{ time.ganZhi }}</text>
            <text class="time-luck">{{ time.luck }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 神位信息 -->
    <view class="god-section">
      <view class="god-item">
        <view class="god-title">
          <text class="god-icon">🔮</text>
          <text>吉神宜趋</text>
        </view>
        <view class="god-content">
          <text v-for="(item, idx) in data?.jiShen" :key="idx" class="god-tag ji-tag">{{ item }}</text>
        </view>
      </view>

      <view class="god-item">
        <view class="god-title">
          <text class="god-icon">👶</text>
          <text>今日胎神</text>
        </view>
        <view class="god-content">
          <text class="god-text">{{ data?.taiShen }}</text>
        </view>
      </view>

      <view class="god-item">
        <view class="god-title">
          <text class="god-icon">⚠️</text>
          <text>凶神宜忌</text>
        </view>
        <view class="god-content">
          <text v-for="(item, idx) in data?.xiongSha" :key="idx" class="god-tag xiong-tag">{{ item }}</text>
        </view>
      </view>

      <view class="god-item">
        <view class="god-title">
          <text class="god-icon">⭐</text>
          <text>二十八星宿</text>
        </view>
        <view class="god-content">
          <text class="god-text gold">{{ data?.xiu.name }}宿 - {{ data?.xiu.luck }}</text>
        </view>
      </view>

      <view class="god-item">
        <view class="god-title">
          <text class="god-icon">📅</text>
          <text>建除十二神</text>
        </view>
        <view class="god-content">
          <text class="god-text">{{ data?.jianChu }}</text>
        </view>
      </view>

      <view class="god-item">
        <view class="god-title">
          <text class="god-icon">📜</text>
          <text>彭祖百忌</text>
        </view>
        <view class="god-content">
          <text class="god-text">{{ data?.pengZu.gan }}</text>
          <text class="god-text">{{ data?.pengZu.zhi }}</text>
        </view>
      </view>

      <view class="god-item">
        <view class="god-title">
          <text class="god-icon">🧭</text>
          <text>神位方向</text>
        </view>
        <view class="god-content positions">
          <view class="position-item">
            <text class="pos-label">喜神</text>
            <text class="pos-value">{{ data?.positions.xiDesc }}</text>
          </view>
          <view class="position-item">
            <text class="pos-label">福神</text>
            <text class="pos-value">{{ data?.positions.fuDesc }}</text>
          </view>
          <view class="position-item">
            <text class="pos-label">财神</text>
            <text class="pos-value">{{ data?.positions.caiDesc }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getCalendarDetail } from '@/services/apifox/NODEJSDEMO/CALENDAR/apifox'
import { ref, computed } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getTodayStr, formatDate } from '@/utils/lunar'
import NavBar from '@/components/nav-bar.vue'

const currentDate = ref(getTodayStr())
const data = ref<any>(null)
const loading = ref(false)

const solarDateStr = computed(() => {
  if (!data.value) return ''
  const s = data.value.solar
  return `${s.month}月${s.day}日 ${s.weekDayName}`
})

// 最小加载时间（毫秒）
const MIN_LOADING_TIME = 1500

// 从后端获取黄历详情（带最小加载时间）
const loadData = async () => {
  loading.value = true
  const startTime = Date.now()
  
  try {
    const res = await getCalendarDetail({ date: currentDate.value })
    
    // 计算已经过去的时间
    const elapsed = Date.now() - startTime
    // 如果加载太快，等待剩余时间
    if (elapsed < MIN_LOADING_TIME) {
      await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed))
    }
    
    if (res) {
      data.value = res
    }
  } catch (error) {
    console.error('加载黄历数据失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const prevDay = async () => {
  const [year, month, day] = currentDate.value.split('-').map(Number)
  const date = new Date(year, month - 1, day - 1)
  currentDate.value = formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  await loadData()
}

const nextDay = async () => {
  const [year, month, day] = currentDate.value.split('-').map(Number)
  const date = new Date(year, month - 1, day + 1)
  currentDate.value = formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  await loadData()
}

const goToday = async () => {
  currentDate.value = getTodayStr()
  await loadData()
}

const goBack = () => {
  uni.navigateBack()
}

const onDateChange = async (e: any) => {
  currentDate.value = e.detail.value
  await loadData()
}

onLoad(async (options: any) => {
  if (options?.date) {
    currentDate.value = options.date
  }
  await loadData()
})

// 微信小程序分享
// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  const lunar = data.value?.lunar
  return {
    title: `${solarDateStr.value} ${lunar?.dateStr || ''} 黄历`,
    path: `/subPackages/tools/calendar/detail?date=${currentDate.value}`
  }
})

onShareTimeline(() => {
  const lunar = data.value?.lunar
  return {
    title: `${solarDateStr.value} ${lunar?.dateStr || ''} 黄历`,
    query: `date=${currentDate.value}`
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

.detail-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 40rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background-color: $primary-red;
  color: #fff;
  position: relative;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  font-weight: 300;
}

.nav-center {
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

.nav-date {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 30rpx;
  font-weight: 500;
  
  .arrow {
    font-size: 20rpx;
  }
}

.nav-today {
  width: 56rpx;
  height: 56rpx;
  border: 2rpx solid #fff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx;
  gap: 24rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: $primary-red;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #999;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.main-section {
  background-color: $card-bg;
  padding: 48rpx 32rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.lunar-big {
  margin-bottom: 24rpx;
  
  .lunar-month {
    font-size: 36rpx;
    color: #666;
  }
  
  .lunar-day {
    font-size: 72rpx;
    font-weight: 600;
    color: #333;
    margin-left: 16rpx;
  }
}

.gan-zhi-row {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-bottom: 16rpx;
  
  .gan-zhi {
    font-size: 30rpx;
    color: $primary-red;
    font-weight: 500;
  }
}

.extra-row {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  
  text {
    font-size: 26rpx;
    color: #999;
  }
}

.yi-ji-section {
  display: flex;
  gap: 20rpx;
  padding: 0 24rpx;
  margin-bottom: 20rpx;
}

.yi-card, .ji-card {
  flex: 1;
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 24rpx;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  
  .title-icon {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 28rpx;
    font-weight: 600;
  }
  
  .title-text {
    font-size: 28rpx;
    font-weight: 500;
  }
}

.yi-title {
  .title-icon {
    background-color: $primary-red;
  }
  .title-text {
    color: $primary-red;
  }
}

.ji-title {
  .title-icon {
    background-color: $taboo-green;
  }
  .title-text {
    color: $taboo-green;
  }
}

.card-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.yi-item {
  font-size: 26rpx;
  color: $primary-red;
}

.ji-item {
  font-size: 26rpx;
  color: $taboo-green;
}

.info-row {
  display: flex;
  background-color: $card-bg;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.info-item {
  flex: 1;
  text-align: center;
  
  .info-label {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }
  
  .info-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

.time-section {
  background-color: $card-bg;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  
  .title-icon {
    font-size: 32rpx;
  }
}

.time-scroll {
  white-space: nowrap;
}

.time-list {
  display: inline-flex;
  gap: 16rpx;
}

.time-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  min-width: 120rpx;
  
  &.is-ji {
    background-color: rgba($primary-red, 0.1);
    
    .time-luck {
      color: $primary-red;
    }
  }
  
  &.is-xiong {
    background-color: rgba($taboo-green, 0.1);
    
    .time-luck {
      color: $taboo-green;
    }
  }
}

.time-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.time-range {
  font-size: 20rpx;
  color: #999;
  margin: 4rpx 0;
}

.time-ganzhi {
  font-size: 24rpx;
  color: #666;
}

.time-luck {
  font-size: 28rpx;
  font-weight: 600;
  margin-top: 8rpx;
}

.god-section {
  padding: 0 24rpx;
}

.god-item {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.god-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  
  .god-icon {
    font-size: 32rpx;
  }
}

.god-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  
  &.positions {
    flex-direction: column;
    gap: 8rpx;
  }
}

.god-tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  
  &.ji-tag {
    background-color: rgba($primary-red, 0.1);
    color: $primary-red;
  }
  
  &.xiong-tag {
    background-color: rgba($taboo-green, 0.1);
    color: $taboo-green;
  }
}

.god-text {
  font-size: 26rpx;
  color: #666;
  
  &.gold {
    color: $gold;
    font-weight: 500;
  }
}

.position-item {
  display: flex;
  gap: 16rpx;
  
  .pos-label {
    font-size: 24rpx;
    color: #999;
    width: 80rpx;
  }
  
  .pos-value {
    font-size: 26rpx;
    color: #333;
  }
}
</style>
