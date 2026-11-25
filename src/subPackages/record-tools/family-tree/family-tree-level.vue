<template>
  <view class="lineage-levels">
    <view v-for="group in visibleGroups" :key="group.parent.id" class="lineage-group">
      <view class="group-parent-row">
        <view
          class="lineage-node"
          :class="[group.parent.gender || 'unknown', { selected: selectedId === group.parent.id }]"
          @click="$emit('select', group.parent)">
          <text class="node-name">{{ group.parent.fullName || group.parent.nameZh?.full }}</text>
          <text class="node-meta">第{{ group.parent.generation }}世 · {{ genderText(group.parent.gender) }}</text>
          <text class="node-meta">{{ group.parent.children.length }} 位子女</text>
        </view>
      </view>
      <view class="children-row">
        <view v-for="child in group.parent.children" :key="child.id" class="child-branch">
          <view class="branch-stem"></view>
          <view
            class="lineage-node"
            :class="[child.gender || 'unknown', { selected: selectedId === child.id }]"
            @click="$emit('select', child)">
            <text class="node-name vertical-name">{{ verticalName(child) }}</text>
            <text class="node-meta">第{{ child.generation }}世</text>
            <text class="node-meta">{{ genderText(child.gender) }}</text>
            <view v-if="child.children.length" class="expand-control" @click.stop="toggle(child.id)">
              {{ expandedIds.has(child.id) ? '收起后代' : `展开 ${child.children.length} 位子女` }}
            </view>
            <text v-else class="node-meta leaf">末代</text>
          </view>
        </view>
      </view>
      <view v-if="group.parent.children.some(child => expandedIds.has(child.id))" class="next-level-hint"> 已展开的支系显示在下方 </view>
    </view>
    <view v-if="visibleGroups.length === 0" class="empty-hint">暂无可展开的子代</view>
  </view>
</template>

<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    roots: { type: Array, default: () => [] },
    selectedId: { type: String, default: '' },
  })
  defineEmits(['select'])

  const expandedIds = ref(new Set())
  const visibleGroups = computed(() => {
    const groups = []
    const pending = [...props.roots]
    // 非递归遍历：仅把用户展开过的节点的子女加入后续层级。
    while (pending.length) {
      const parent = pending.shift()
      if (!parent?.children?.length) continue
      groups.push({ parent })
      parent.children.forEach(child => {
        if (expandedIds.value.has(child.id)) pending.push(child)
      })
    }
    return groups
  })

  const toggle = id => {
    const next = new Set(expandedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expandedIds.value = next
  }
  const verticalName = node => (node.givenName || node.fullName || '').replace(/^梁/, '').split('').join('\n')
  const genderText = gender => (gender === 'male' ? '男' : gender === 'female' ? '女' : '未标')
</script>

<style lang="scss" scoped>
  .lineage-levels {
    display: flex;
    flex-direction: column;
    gap: 36rpx;
    width: max-content;
    min-width: 100%;
    padding: 20rpx 24rpx 48rpx;
    box-sizing: border-box;
  }
  .lineage-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: max-content;
    min-width: 100%;
    padding-bottom: 20rpx;
  }
  .group-parent-row {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .lineage-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 112rpx;
    min-height: 128rpx;
    padding: 14rpx 16rpx;
    box-sizing: border-box;
    border: 2rpx solid #cbd5e1;
    border-radius: 14rpx;
    background: #f8fafc;
  }
  .lineage-node.male {
    border-color: #93c5fd;
    background: #eff6ff;
  }
  .lineage-node.female {
    border-color: #f9a8d4;
    background: #fdf2f8;
  }
  .lineage-node.selected {
    border-width: 4rpx;
    border-color: #4f46e5;
  }
  .node-name {
    color: #1e293b;
    font-size: 26rpx;
    font-weight: 700;
    white-space: nowrap;
  }
  .vertical-name {
    white-space: pre-line;
    text-align: center;
    line-height: 1.15;
  }
  .node-meta {
    margin-top: 5rpx;
    color: #64748b;
    font-size: 18rpx;
    white-space: nowrap;
  }
  .leaf {
    color: #94a3b8;
  }
  .children-row {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 22rpx;
    width: max-content;
    margin-top: 42rpx;
    padding: 0 18rpx;
  }
  .children-row::before {
    position: absolute;
    top: -42rpx;
    left: 50%;
    width: 2rpx;
    height: 22rpx;
    background: #94a3b8;
    content: '';
  }
  .children-row::after {
    position: absolute;
    top: -21rpx;
    left: 0;
    right: 0;
    height: 2rpx;
    background: #94a3b8;
    content: '';
  }
  .child-branch {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .branch-stem {
    position: absolute;
    top: -42rpx;
    width: 2rpx;
    height: 22rpx;
    background: #94a3b8;
  }
  .expand-control {
    margin-top: 8rpx;
    padding: 5rpx 10rpx;
    border-radius: 16rpx;
    color: #4f46e5;
    background: rgba(99, 102, 241, 0.1);
    font-size: 18rpx;
    white-space: nowrap;
  }
  .next-level-hint {
    align-self: flex-start;
    margin-top: 12rpx;
    color: #64748b;
    font-size: 18rpx;
  }
  .empty-hint {
    padding: 24rpx;
    color: #64748b;
  }
</style>
