<template>
  <PageLayout
    title="家族族谱树形图（快照）"
    back-fallback="/subPackages/tools/family-tree/index"
    nav-gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <view class="snapshot-placeholder">
      <uni-icons type="info" size="44" color="#667eea" />
      <text class="placeholder-title">族谱图谱正在升级</text>
      <text class="placeholder-desc">成员数据、列表及编辑功能仍可继续使用。</text>
      <button class="back-button" @click="openFamilyTree">查看成员列表</button>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  const openFamilyTree = () => {
    uni.redirectTo({ url: '/subPackages/tools/family-tree/index' })
  }
</script>

<style scoped lang="scss">
  .snapshot-placeholder {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
    padding: 48rpx;
  }

  .placeholder-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--theme-text);
  }

  .placeholder-desc {
    font-size: 26rpx;
    line-height: 1.6;
    text-align: center;
    color: var(--theme-text-secondary);
  }

  .back-button {
    margin-top: 24rpx;
    padding: 0 40rpx;
    background: #667eea;
    color: #fff;
    font-size: 28rpx;
  }
</style>
