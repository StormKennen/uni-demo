<template>
  <view class="family-tree-detail-overlay" @click="handleOverlayClick">
    <view class="detail-modal" @click.stop>
      <!-- 头部 -->
      <view class="modal-header">
        <text class="modal-title">族谱详情</text>
        <view class="close-btn" @click="$emit('close')">
          <text class="close-icon">×</text>
        </view>
      </view>

      <!-- 内容 -->
      <scroll-view class="modal-content" scroll-y>
        <!-- 基本信息 -->
        <view class="info-section">
          <view class="section-header">
            <text class="section-title">基本信息</text>
          </view>
          
          <view class="person-card">
            <!-- 头像和基本信息 -->
            <view class="person-header">
              <view class="avatar-large">
                <image 
                  v-if="node.avatar"
                  :src="node.avatar"
                  class="avatar-img"
                  mode="aspectFill"
                />
                <view v-else class="avatar-placeholder">
                  <text class="avatar-text">{{ getAvatarText(node.name) }}</text>
                </view>
                
                <!-- 性别和状态标识 -->
                <view class="status-badges">
                  <view class="gender-badge" :class="node.gender">
                    <text class="badge-text">{{ getGenderText(node.gender) }}</text>
                  </view>
                  <view v-if="!node.isAlive" class="status-badge deceased">
                    <text class="badge-text">已故</text>
                  </view>
                </view>
              </view>

              <view class="person-basic">
                <text class="person-name">{{ node.name }}</text>
                <text class="person-generation">第{{ node.generation }}代</text>
                <text v-if="node.occupation" class="person-occupation">{{ node.occupation }}</text>
                <text v-if="node.location" class="person-location">📍 {{ node.location }}</text>
              </view>
            </view>

            <!-- 详细信息 -->
            <view class="person-details">
              <view v-if="node.birthDate" class="detail-item">
                <text class="detail-label">出生日期</text>
                <text class="detail-value">{{ formatDate(node.birthDate) }}</text>
              </view>
              
              <view v-if="node.deathDate" class="detail-item">
                <text class="detail-label">去世日期</text>
                <text class="detail-value">{{ formatDate(node.deathDate) }}</text>
              </view>
              
              <view v-if="node.birthDate" class="detail-item">
                <text class="detail-label">年龄</text>
                <text class="detail-value">{{ calculateAge(node.birthDate, node.deathDate) }}</text>
              </view>
              
              <view v-if="node.description" class="detail-item full-width">
                <text class="detail-label">描述</text>
                <text class="detail-value description">{{ node.description }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 配偶信息 -->
        <view v-if="node.spouse" class="info-section">
          <view class="section-header">
            <text class="section-title">配偶信息</text>
          </view>
          
          <view class="spouse-card">
            <view class="spouse-info">
              <view class="spouse-avatar">
                <image 
                  v-if="node.spouse.avatar"
                  :src="node.spouse.avatar"
                  class="avatar-img"
                  mode="aspectFill"
                />
                <view v-else class="avatar-placeholder">
                  <text class="avatar-text">{{ getAvatarText(node.spouse.name) }}</text>
                </view>
              </view>
              
              <view class="spouse-details">
                <text class="spouse-name">{{ node.spouse.name }}</text>
                <text v-if="node.spouse.birthDate" class="spouse-dates">
                  {{ formatDate(node.spouse.birthDate) }}
                  <text v-if="node.spouse.deathDate"> - {{ formatDate(node.spouse.deathDate) }}</text>
                </text>
                <text v-if="node.spouse.occupation" class="spouse-occupation">{{ node.spouse.occupation }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 家庭关系 -->
        <view class="info-section">
          <view class="section-header">
            <text class="section-title">家庭关系</text>
          </view>
          
          <!-- 父母 -->
          <view v-if="node.parents.length > 0" class="relation-group">
            <text class="relation-title">父母</text>
            <view class="relation-list">
              <view 
                v-for="parent in node.parents" 
                :key="parent.id"
                class="relation-item"
                @click="$emit('nodeSelect', parent)"
              >
                <text class="relation-name">{{ parent.name }}</text>
                <text class="relation-role">{{ getGenderText(parent.gender) === '男' ? '父亲' : '母亲' }}</text>
              </view>
            </view>
          </view>

          <!-- 子女 -->
          <view v-if="node.children.length > 0" class="relation-group">
            <text class="relation-title">子女 ({{ node.children.length }}人)</text>
            <view class="relation-list">
              <view 
                v-for="child in node.children" 
                :key="child.id"
                class="relation-item"
                @click="$emit('nodeSelect', child)"
              >
                <text class="relation-name">{{ child.name }}</text>
                <text class="relation-role">{{ getGenderText(child.gender) === '男' ? '儿子' : '女儿' }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作 -->
      <view class="modal-footer">
        <button class="action-btn secondary" @click="$emit('close')">
          关闭
        </button>
        <button class="action-btn primary" @click="$emit('edit', node)">
          编辑
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { FamilyTreeNode, Gender } from '@/types/family-tree'

// Props定义
interface Props {
  node: FamilyTreeNode
}

defineProps<Props>()

// Emits定义
const emit = defineEmits<{
  close: []
  edit: [node: FamilyTreeNode]
  nodeSelect: [node: FamilyTreeNode]
}>()

// 方法
const getAvatarText = (name: string): string => {
  return name.slice(-2)
}

const getGenderText = (gender: Gender): string => {
  switch (gender) {
    case 'male':
      return '男'
    case 'female':
      return '女'
    default:
      return '未知'
  }
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const calculateAge = (birthDate: string, deathDate?: string): string => {
  const birth = new Date(birthDate)
  const end = deathDate ? new Date(deathDate) : new Date()
  const age = end.getFullYear() - birth.getFullYear()
  
  if (deathDate) {
    return `享年${age}岁`
  } else {
    return `${age}岁`
  }
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.family-tree-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.detail-modal {
  background: #fff;
  border-radius: 24rpx;
  width: 100%;
  max-width: 640rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1d1d1f;
  }

  .close-btn {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: #f5f5f7;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .close-icon {
      font-size: 32rpx;
      color: #666;
      font-weight: bold;
    }
  }
}

.modal-content {
  flex: 1;
  padding: 0 40rpx;
}

.info-section {
  margin-bottom: 48rpx;

  .section-header {
    margin-bottom: 24rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1d1d1f;
    }
  }
}

.person-card {
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 32rpx;
}

.person-header {
  display: flex;
  gap: 32rpx;
  margin-bottom: 32rpx;

  .avatar-large {
    position: relative;
    flex-shrink: 0;

    .avatar-img,
    .avatar-placeholder {
      width: 120rpx;
      height: 120rpx;
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
        font-size: 36rpx;
        font-weight: 600;
      }
    }

    .status-badges {
      position: absolute;
      bottom: -8rpx;
      right: -8rpx;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .gender-badge,
      .status-badge {
        padding: 6rpx 12rpx;
        border-radius: 12rpx;
        border: 2rpx solid #fff;

        .badge-text {
          font-size: 20rpx;
          font-weight: 500;
          color: #fff;
        }
      }

      .gender-badge {
        &.male {
          background: #007aff;
        }

        &.female {
          background: #ff3b30;
        }

        &.unknown {
          background: #8e8e93;
        }
      }

      .status-badge.deceased {
        background: #666;
      }
    }
  }

  .person-basic {
    flex: 1;

    .person-name {
      display: block;
      font-size: 40rpx;
      font-weight: 700;
      color: #1d1d1f;
      margin-bottom: 8rpx;
    }

    .person-generation {
      display: block;
      font-size: 28rpx;
      color: #007aff;
      margin-bottom: 8rpx;
    }

    .person-occupation {
      display: block;
      font-size: 26rpx;
      color: #666;
      margin-bottom: 8rpx;
    }

    .person-location {
      display: block;
      font-size: 24rpx;
      color: #8e8e93;
    }
  }
}

.person-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;

  .detail-item {
    &.full-width {
      grid-column: 1 / -1;
    }

    .detail-label {
      display: block;
      font-size: 24rpx;
      color: #8e8e93;
      margin-bottom: 8rpx;
    }

    .detail-value {
      display: block;
      font-size: 28rpx;
      color: #1d1d1f;
      font-weight: 500;

      &.description {
        line-height: 1.5;
        font-weight: 400;
      }
    }
  }
}

.spouse-card {
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 32rpx;

  .spouse-info {
    display: flex;
    gap: 24rpx;
    align-items: center;

    .spouse-avatar {
      width: 80rpx;
      height: 80rpx;
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
          font-size: 28rpx;
          font-weight: 600;
        }
      }
    }

    .spouse-details {
      flex: 1;

      .spouse-name {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #1d1d1f;
        margin-bottom: 8rpx;
      }

      .spouse-dates {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 4rpx;
      }

      .spouse-occupation {
        display: block;
        font-size: 24rpx;
        color: #8e8e93;
      }
    }
  }
}

.relation-group {
  margin-bottom: 32rpx;

  .relation-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 16rpx;
  }

  .relation-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .relation-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 20rpx;
      background: #fff;
      border-radius: 12rpx;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f0f2f5;
      }

      .relation-name {
        font-size: 28rpx;
        color: #1d1d1f;
        font-weight: 500;
      }

      .relation-role {
        font-size: 24rpx;
        color: #8e8e93;
      }
    }
  }
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 32rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s;

    &.secondary {
      background: #f5f5f7;
      color: #666;

      &:hover {
        background: #e8e8ed;
      }
    }

    &.primary {
      background: #007aff;
      color: #fff;

      &:hover {
        background: #0056cc;
      }
    }
  }
}
</style>