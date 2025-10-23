<template>
  <view 
    class="family-tree-node"
    :class="[
      `gender-${node.gender}`,
      { 
        'selected': selected,
        'deceased': !node.isAlive,
        'has-spouse': !!node.spouse
      }
    ]"
    :style="nodeStyle"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 节点主体 -->
    <view class="node-main">
      <!-- 头像 -->
      <view class="avatar-container">
        <image 
          v-if="node.avatar"
          :src="node.avatar"
          class="avatar"
          mode="aspectFill"
        />
        <view v-else class="avatar-placeholder">
          <text class="avatar-text">{{ getAvatarText(node.name) }}</text>
        </view>
        
        <!-- 性别标识 -->
        <view class="gender-badge" :class="node.gender">
          <text class="gender-icon">{{ getGenderIcon(node.gender) }}</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="node-info">
        <text class="name">{{ node.name }}</text>
        <text v-if="node.birthDate || node.deathDate" class="dates">
          {{ formatDates(node.birthDate, node.deathDate) }}
        </text>
        <text v-if="node.occupation" class="occupation">{{ node.occupation }}</text>
      </view>

      <!-- 世代标识 -->
      <view class="generation-badge">
        <text class="generation-text">第{{ node.generation }}代</text>
      </view>
    </view>

    <!-- 配偶信息 -->
    <view v-if="node.spouse && config.showSpouses" class="spouse-container">
      <view class="spouse-connector"></view>
      <view class="spouse-node" :class="`gender-${node.spouse.gender}`">
        <view class="spouse-avatar">
          <image 
            v-if="node.spouse.avatar"
            :src="node.spouse.avatar"
            class="avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-text">{{ getAvatarText(node.spouse.name) }}</text>
          </view>
        </view>
        <view class="spouse-info">
          <text class="spouse-name">{{ node.spouse.name }}</text>
          <text v-if="node.spouse.birthDate" class="spouse-dates">
            {{ formatDates(node.spouse.birthDate, node.spouse.deathDate) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 子节点展开/收起按钮 -->
    <view 
      v-if="node.children.length > 0"
      class="expand-btn"
      @click.stop="toggleExpand"
    >
      <text class="expand-icon">{{ node.isExpanded ? '−' : '+' }}</text>
      <text class="children-count">{{ node.children.length }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { FamilyTreeNode, FamilyTreeConfig, Gender } from '@/types/family-tree'

// Props定义
interface Props {
  node: FamilyTreeNode
  config: FamilyTreeConfig
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
})

// Emits定义
const emit = defineEmits<{
  click: [node: FamilyTreeNode]
  doubleClick: [node: FamilyTreeNode]
  hover: [node: FamilyTreeNode | null]
  expand: [node: FamilyTreeNode]
}>()

// 双击检测
let clickTimer: number | null = null
let clickCount = 0

// 计算属性
const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
  width: `${props.node.position.width}px`,
  minHeight: `${props.node.position.height}px`
}))

// 方法
const getAvatarText = (name: string): string => {
  return name.slice(-2) // 取姓名最后两个字符
}

const getGenderIcon = (gender: Gender): string => {
  switch (gender) {
    case 'male':
      return '♂'
    case 'female':
      return '♀'
    default:
      return '?'
  }
}

const formatDates = (birthDate?: string, deathDate?: string): string => {
  if (!birthDate && !deathDate) return ''
  
  const birth = birthDate ? new Date(birthDate).getFullYear() : '?'
  const death = deathDate ? new Date(deathDate).getFullYear() : ''
  
  if (death) {
    return `${birth} - ${death}`
  } else {
    return `${birth} -`
  }
}

const handleClick = () => {
  clickCount++
  
  if (clickCount === 1) {
    clickTimer = setTimeout(() => {
      emit('click', props.node)
      clickCount = 0
    }, 300)
  } else if (clickCount === 2) {
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
    }
    emit('doubleClick', props.node)
    clickCount = 0
  }
}

const handleTouchStart = () => {
  emit('hover', props.node)
}

const handleTouchEnd = () => {
  emit('hover', null)
}

const toggleExpand = () => {
  emit('expand', props.node)
}
</script>

<style lang="scss" scoped>
.family-tree-node {
  position: absolute;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  z-index: 10;

  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  }

  &.selected {
    border-color: #007aff;
    box-shadow: 0 0 0 4rpx rgba(0, 122, 255, 0.2);
  }

  &.deceased {
    opacity: 0.7;
    
    .node-main {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
  }

  &.gender-male {
    .node-main {
      border-left: 6rpx solid #007aff;
    }
  }

  &.gender-female {
    .node-main {
      border-left: 6rpx solid #ff3b30;
    }
  }
}

.node-main {
  padding: 24rpx;
  position: relative;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 16rpx;
}

.avatar-container {
  position: relative;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: center;

  .avatar,
  .avatar-placeholder {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    overflow: hidden;
  }

  .avatar-placeholder {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .avatar-text {
      color: #fff;
      font-size: 28rpx;
      font-weight: 500;
    }
  }

  .gender-badge {
    position: absolute;
    bottom: -4rpx;
    right: -4rpx;
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #fff;

    &.male {
      background: #007aff;
    }

    &.female {
      background: #ff3b30;
    }

    &.unknown {
      background: #8e8e93;
    }

    .gender-icon {
      color: #fff;
      font-size: 20rpx;
      font-weight: bold;
    }
  }
}

.node-info {
  text-align: center;

  .name {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 8rpx;
    line-height: 1.2;
  }

  .dates {
    display: block;
    font-size: 24rpx;
    color: #8e8e93;
    margin-bottom: 4rpx;
  }

  .occupation {
    display: block;
    font-size: 22rpx;
    color: #007aff;
    background: rgba(0, 122, 255, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    margin-top: 8rpx;
  }
}

.generation-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background: rgba(0, 0, 0, 0.1);
  padding: 4rpx 8rpx;
  border-radius: 8rpx;

  .generation-text {
    font-size: 20rpx;
    color: #666;
  }
}

.spouse-container {
  position: relative;
  margin-top: 16rpx;
  padding-top: 16rpx;

  .spouse-connector {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 2rpx;
    background: #ff3b30;
  }

  .spouse-node {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx;
    background: rgba(255, 59, 48, 0.05);
    border-radius: 12rpx;
    border: 1rpx solid rgba(255, 59, 48, 0.2);

    &.gender-male {
      background: rgba(0, 122, 255, 0.05);
      border-color: rgba(0, 122, 255, 0.2);
    }

    .spouse-avatar {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        display: flex;
        align-items: center;
        justify-content: center;

        .avatar-text {
          color: #fff;
          font-size: 24rpx;
          font-weight: 500;
        }
      }
    }

    .spouse-info {
      flex: 1;

      .spouse-name {
        display: block;
        font-size: 28rpx;
        font-weight: 500;
        color: #1d1d1f;
        margin-bottom: 4rpx;
      }

      .spouse-dates {
        display: block;
        font-size: 22rpx;
        color: #8e8e93;
      }
    }
  }
}

.expand-btn {
  position: absolute;
  bottom: -16rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 48rpx;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
  z-index: 20;

  .expand-icon {
    color: #fff;
    font-size: 24rpx;
    font-weight: bold;
    line-height: 1;
  }

  .children-count {
    color: #fff;
    font-size: 18rpx;
    line-height: 1;
    margin-top: 2rpx;
  }
}
</style>