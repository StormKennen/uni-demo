<template>
  <PageLayout title="魔灵召唤" :nav-back="true">
    <view class="swc-portal-page">
      <view class="hero-section">
        <view class="hero-icon">
          <uni-icons type="star" size="28" color="#fff" />
        </view>
        <view class="hero-copy">
          <text class="hero-title">魔灵召唤</text>
          <text class="hero-subtitle">图鉴、兑换券、阵容与映射统一入口</text>
        </view>
      </view>

      <view class="portal-list">
        <view v-for="entry in portalEntries" :key="entry.id" class="portal-card" @click="openEntry(entry.path)">
          <view class="entry-icon" :style="{ background: entry.accentSoft }">
            <uni-icons :type="entry.icon" size="22" :color="entry.accent" />
          </view>
          <view class="entry-main">
            <text class="entry-title">{{ entry.title }}</text>
            <text class="entry-desc">{{ entry.desc }}</text>
          </view>
          <uni-icons type="right" size="15" color="var(--theme-text-tertiary)" />
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { onShow } from '@dcloudio/uni-app'
  import { reportToolVisit } from '@/utils/tracker'

  interface PortalEntry {
    id: string
    title: string
    desc: string
    icon: string
    accent: string
    accentSoft: string
    path: string
  }

  const portalEntries: PortalEntry[] = [
    {
      id: 'bestiary',
      title: '魔灵图鉴',
      desc: '检索人物、筛选属性、查看详情',
      icon: 'star',
      accent: '#f97316',
      accentSoft: 'rgba(249, 115, 22, 0.14)',
      path: '/subPackages/tools/compendium/swc/list',
    },
    {
      id: 'coupons',
      title: '魔灵兑换券',
      desc: '管理账号并快速兑换礼包码',
      icon: 'gift',
      accent: '#e11d48',
      accentSoft: 'rgba(225, 29, 72, 0.13)',
      path: '/subPackages/tools/game-coupons/index?gameId=swc&compendiumId=swc',
    },
    {
      id: 'lineups',
      title: '魔灵阵容',
      desc: '浏览、发布与管理阵容组合',
      icon: 'flag',
      accent: '#d97706',
      accentSoft: 'rgba(217, 119, 6, 0.14)',
      path: '/subPackages/tools/compendium/swc/lineups?compendiumId=swc',
    },
    {
      id: 'mappings',
      title: '阵容映射',
      desc: '维护源阵容与目标阵容关系',
      icon: 'link',
      accent: '#0f766e',
      accentSoft: 'rgba(15, 118, 110, 0.14)',
      path: '/subPackages/tools/compendium/swc/lineup-mappings?compendiumId=swc',
    },
  ]

  function openEntry(path: string) {
    uni.navigateTo({ url: path })
  }

  onShow(() => {
    reportToolVisit('compendium-swc')
  })
</script>

<style scoped lang="scss">
  .swc-portal-page {
    min-height: 100vh;
    padding: 28rpx 24rpx 56rpx;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .hero-section {
    display: flex;
    align-items: center;
    gap: 22rpx;
    padding: 28rpx;
    border-radius: 24rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
    box-shadow: 0 10rpx 32rpx var(--theme-shadow-xs);
  }

  .hero-icon {
    width: 76rpx;
    height: 76rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: linear-gradient(135deg, #ff7a59 0%, #f2c94c 100%);
  }

  .hero-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .hero-title {
    color: var(--theme-text);
    font-size: 34rpx;
    font-weight: 700;
    line-height: 1.3;
  }

  .hero-subtitle {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.45;
  }

  .portal-list {
    display: grid;
    gap: 16rpx;
    margin-top: 24rpx;
  }

  .portal-card {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 24rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:active {
      border-color: var(--theme-brand);
      background: var(--theme-surface-2);
    }
  }

  .entry-icon {
    width: 64rpx;
    height: 64rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .entry-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .entry-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 650;
    line-height: 1.35;
  }

  .entry-desc {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    line-height: 1.45;
  }
</style>
