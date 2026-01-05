<template>
  <view class="festivals-page">
    <!-- 顶部导航栏 -->
    <nav-bar
      always-title
      title="节日"
      custom-class="light"
      :custom-style="{ backgroundColor: '#C83C3C' }"
    />
    
    <!-- 法定节假日 -->
    <view class="section">
      <view class="section-header" @click="toggleHolidays">
        <view class="section-title">
          <view class="icon holiday-icon">●</view>
          <text>法定节假日</text>
        </view>
        <text class="arrow" :class="{ 'expanded': holidaysExpanded }">∨</text>
      </view>
      <view v-if="holidaysExpanded" class="section-content">
        <view 
          v-for="(item, index) in holidays" 
          :key="index" 
          class="festival-item"
          @click="goToDetail(item.date)"
        >
          <view class="festival-info">
            <text class="festival-name">{{ item.name }}</text>
            <text class="festival-date">{{ item.dateStr }}</text>
          </view>
          <text class="festival-countdown" :class="{ 'today': item.daysLeft === 0 }">
            {{ item.daysLeft === 0 ? '今天' : (item.daysLeft === 1 ? '明天' : `${item.daysLeft}天后`) }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- 二十四节气 -->
    <view class="section">
      <view class="section-header" @click="toggleSolarTerms">
        <view class="section-title">
          <view class="icon solar-icon">◐</view>
          <text>二十四节气</text>
        </view>
        <text class="arrow" :class="{ 'expanded': solarTermsExpanded }">∨</text>
      </view>
      <view v-if="solarTermsExpanded" class="section-content">
        <view 
          v-for="(item, index) in solarTerms" 
          :key="index" 
          class="festival-item"
          @click="goToDetail(item.date)"
        >
          <view class="festival-info">
            <text class="festival-name">{{ item.name }}</text>
            <text class="festival-date">{{ item.dateStr }}</text>
          </view>
          <text class="festival-countdown" :class="{ 'today': item.daysLeft === 0 }">
            {{ item.daysLeft === 0 ? '今天' : (item.daysLeft === 1 ? '明天' : `${item.daysLeft}天后`) }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- 热门节日 -->
    <view class="section">
      <view class="section-header" @click="togglePopular">
        <view class="section-title">
          <view class="icon popular-icon">★</view>
          <text>热门节日</text>
        </view>
        <text class="arrow" :class="{ 'expanded': popularExpanded }">∨</text>
      </view>
      <view v-if="popularExpanded" class="section-content">
        <view 
          v-for="(item, index) in popularFestivals" 
          :key="index" 
          class="festival-item"
          @click="goToDetail(item.date)"
        >
          <view class="festival-info">
            <text class="festival-name">{{ item.name }}</text>
            <text class="festival-date">{{ item.dateStr }}</text>
          </view>
          <text class="festival-countdown" :class="{ 'today': item.daysLeft === 0 }">
            {{ item.daysLeft === 0 ? '今天' : (item.daysLeft === 1 ? '明天' : `${item.daysLeft}天后`) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/nav-bar.vue'
import { holidayList, solarTermList, popularFestivalList } from './holidays'

const holidaysExpanded = ref(true)
const solarTermsExpanded = ref(false)
const popularExpanded = ref(false)

const holidays = ref<any[]>([])
const solarTerms = ref<any[]>([])
const popularFestivals = ref<any[]>([])

const toggleHolidays = () => {
  holidaysExpanded.value = !holidaysExpanded.value
}

const toggleSolarTerms = () => {
  solarTermsExpanded.value = !solarTermsExpanded.value
}

const togglePopular = () => {
  popularExpanded.value = !popularExpanded.value
}

const goToDetail = (date: string) => {
  uni.navigateTo({
    url: `/subPackages/tools/calendar/detail?date=${date}`
  })
}

// 格式化日期显示
const formatDateStr = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-')
  return `${year}年${month}月${day}日`
}

// 过滤未来的节日并计算天数
const processFestivals = (list: { name: string; date: string }[]) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return list
    .map(item => {
      const [year, month, day] = item.date.split('-').map(Number)
      const target = new Date(year, month - 1, day)
      const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...item,
        dateStr: formatDateStr(item.date),
        daysLeft
      }
    })
    .filter(item => item.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

// 加载节日数据（从通用数据文件）
const loadFestivals = () => {
  holidays.value = processFestivals(holidayList)
  solarTerms.value = processFestivals(solarTermList)
  popularFestivals.value = processFestivals(popularFestivalList)
}

onMounted(() => {
  loadFestivals()
})
</script>

<style lang="scss" scoped>
$primary-red: #C83C3C;
$bg-color: #F8F8F8;
$card-bg: #FFFFFF;

.festivals-page {
  min-height: 100vh;
  background-color: $bg-color;
}

.section {
  background-color: $card-bg;
  margin-bottom: 2rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.holiday-icon {
  color: #1890ff;
}

.solar-icon {
  color: #722ed1;
}

.popular-icon {
  color: $primary-red;
}

.arrow {
  font-size: 28rpx;
  color: #999;
  transition: transform 0.3s;
  
  &.expanded {
    transform: rotate(180deg);
  }
}

.section-content {
  padding: 0 32rpx;
}

.festival-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.festival-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.festival-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.festival-date {
  font-size: 24rpx;
  color: #999;
}

.festival-countdown {
  font-size: 28rpx;
  color: #666;
  
  &.today {
    color: $primary-red;
    font-weight: 500;
  }
}
</style>
