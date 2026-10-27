<template>
  <view class="tree-branch-container" :class="{ 'tree-root': !node.parents?.length }">
    <view class="tree-node-card" :class="[node.gender || 'unknown', { selected: selectedId === node.id }]" @click="onCardClick">
      <view class="node-name-column">
        <text class="node-name-vertical">{{ verticalName }}</text>
        <text class="node-gen-tag">{{ toChineseGeneration(node.generation) }}世</text>
        <text class="gender-label">{{ node.gender === 'male' ? '男' : node.gender === 'female' ? '女' : '未标' }}</text>
        <text class="node-child-count" :class="{ leaf: !node.children?.length }">
          {{ node.children?.length ? `${node.children.length} 子女` : '末代' }}
        </text>
      </view>
      <view v-if="node.children?.length" class="node-expand-btn" @click.stop="toggleCollapse">
        <text class="expand-btn-text">{{ isCollapsed ? '+' : '−' }}</text>
      </view>
    </view>

    <view class="tree-children-branch" v-if="node.children?.length && !isCollapsed">
      <FamilyTreeRecursive
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selectedId="selectedId"
        @select="node => $emit('select', node)" />
    </view>
    <view v-else-if="node.children?.length && isCollapsed" class="collapsed-summary">收起 {{ node.children.length }} 位子女</view>
  </view>
</template>

<script setup>
  import { computed, ref } from 'vue'

  // 显式命名，确保 uni-app / 微信小程序编译递归子组件时可解析自身。
  defineOptions({ name: 'FamilyTreeRecursive' })

  const props = defineProps({
    node: {
      type: Object,
      required: true,
    },
    selectedId: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['select'])
  // 首屏只展开谱系根节点；下一代及更深支系由用户按需展开，避免小程序递归渲染大量节点。
  const isCollapsed = ref(Boolean(props.node.parents?.length && props.node.children?.length))
  const verticalName = computed(() => (props.node.givenName || props.node.fullName || '未知').replace(/^梁/, '').split('').join('\n'))
  const toChineseGeneration = generation => {
    const chineseNumbers = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    const value = Number(generation) || 0
    if (value < 10) return chineseNumbers[value]
    if (value === 10) return '十'
    if (value < 20) return `十${chineseNumbers[value % 10]}`
    if (value % 10 === 0) return `${chineseNumbers[Math.floor(value / 10)]}十`
    return `${chineseNumbers[Math.floor(value / 10)]}十${chineseNumbers[value % 10]}`
  }

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
  }

  const onCardClick = () => emit('select', props.node)
</script>

<style lang="scss" scoped>
  .tree-branch-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding: 0 16rpx;
  }

  .tree-node-card {
    position: relative;
    display: flex;
    align-items: stretch;
    min-height: 188rpx;
    padding: 16rpx 12rpx;
    box-sizing: border-box;
    border: 2rpx solid #cbd5e1;
    border-radius: 16rpx;
    background: #f8fafc;
  }

  .tree-node-card.male {
    border-color: #93c5fd;
    background: #eff6ff;
  }

  .tree-node-card.female {
    border-color: #f9a8d4;
    background: #fdf2f8;
  }

  .tree-node-card.selected {
    border-width: 4rpx;
    border-color: #4f46e5;
  }

  .node-name-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .node-name-column {
    width: 62rpx;
    flex-shrink: 0;
    gap: 8rpx;
  }

  .node-name-vertical {
    color: #1e293b;
    font-size: 25rpx;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    white-space: pre-line;
  }

  .node-gen-tag,
  .gender-label {
    padding: 4rpx 8rpx;
    border-radius: 8rpx;
    color: #475569;
    background: rgba(255, 255, 255, 0.8);
    font-size: 18rpx;
    white-space: nowrap;
  }

  .node-child-count {
    color: #475569;
    font-size: 16rpx;
    white-space: nowrap;
  }

  .node-child-count.leaf {
    color: #94a3b8;
  }

  .node-expand-btn {
    position: absolute;
    right: -16rpx;
    top: -16rpx;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #64748b;
    border-radius: 50%;
    background: #fff;
  }

  .expand-btn-text {
    color: #334155;
    font-size: 24rpx;
    font-weight: 700;
  }

  .tree-children-branch {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 24rpx;
    width: max-content;
    min-width: 100%;
    margin-top: 48rpx;
    padding: 0 12rpx;
  }

  .tree-children-branch::before {
    position: absolute;
    top: -48rpx;
    left: 50%;
    width: 2rpx;
    height: 24rpx;
    background: #94a3b8;
    content: '';
  }

  .tree-children-branch::after {
    position: absolute;
    top: -25rpx;
    left: 0;
    width: 100%;
    height: 2rpx;
    background: #94a3b8;
    content: '';
  }

  .tree-children-branch > .tree-branch-container::before {
    position: absolute;
    top: -48rpx;
    left: 50%;
    width: 2rpx;
    height: 24rpx;
    background: #94a3b8;
    content: '';
  }

  .tree-root > .tree-node-card {
    min-height: 216rpx;
    border-width: 4rpx;
  }

  .collapsed-summary {
    margin-top: 12rpx;
    color: #64748b;
    font-size: 20rpx;
  }
</style>
