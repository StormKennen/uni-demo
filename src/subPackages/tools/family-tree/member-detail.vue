<template>
  <view class="member-detail-mask" v-if="visible" @click="onMaskClick">
    <view class="member-detail-popup" @click.stop>
      <!-- 头部 -->
      <view class="detail-header">
        <view class="header-left">
          <view class="member-avatar" :class="{ female: memberGender === 'female' }">
            <text class="avatar-text">{{ memberFullName?.charAt(memberFullName?.length - 1) || '?' }}</text>
          </view>
          <view class="header-info">
            <text class="member-name">{{ memberFullName }}</text>
            <view class="member-tags">
              <text class="gender-tag" :class="memberGender">
                {{ memberGender === 'male' ? '男' : memberGender === 'female' ? '女' : '未知' }}
              </text>
              <text class="generation-tag" v-if="memberGeneration">第{{ memberGeneration }}代</text>
            </view>
          </view>
        </view>
        <view class="close-btn" @click="onClose">
          <uni-icons type="close" size="20" color="#999" />
        </view>
      </view>

      <!-- 详情内容 -->
      <scroll-view class="detail-content" scroll-y>
        <!-- 基本信息 -->
        <view class="info-section">
          <view class="section-title">
            <uni-icons type="person" size="16" color="#667eea" />
            <text class="title-text">基本信息</text>
          </view>
          <view class="info-list">
            <view class="info-item">
              <text class="info-label">姓氏</text>
              <text class="info-value">{{ memberSurname || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">名字</text>
              <text class="info-value">{{ memberGivenName || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">全名</text>
              <text class="info-value">{{ memberFullName || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">性别</text>
              <text class="info-value">{{ memberGender === 'male' ? '男' : memberGender === 'female' ? '女' : '未知' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">代数</text>
              <text class="info-value">{{ memberGeneration ? `第${memberGeneration}代` : '-' }}</text>
            </view>
          </view>
        </view>

        <!-- 家族关系 -->
        <view class="info-section">
          <view class="section-title">
            <uni-icons type="staff" size="16" color="#667eea" />
            <text class="title-text">家族关系</text>
          </view>
          <view class="info-list">
            <view class="info-item">
              <text class="info-label">父亲</text>
              <text class="info-value">{{ parentName || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">子女数量</text>
              <text class="info-value">{{ childrenCount }}人</text>
            </view>
            <view class="info-item" v-if="childrenNames.length > 0">
              <text class="info-label">子女</text>
              <text class="info-value">{{ childrenNames.join('、') }}</text>
            </view>
          </view>
        </view>

        <!-- 其他信息 -->
        <view class="info-section" v-if="mergedData?.avatarUrl || mergedData?.spouseRelations?.length > 0">
          <view class="section-title">
            <uni-icons type="info" size="16" color="#667eea" />
            <text class="title-text">其他信息</text>
          </view>
          <view class="info-list">
            <view class="info-item" v-if="mergedData?.avatarUrl">
              <text class="info-label">头像</text>
              <image class="avatar-image" :src="mergedData.avatarUrl" mode="aspectFill" />
            </view>
            <view class="info-item" v-if="mergedData?.spouseRelations?.length > 0">
              <text class="info-label">配偶</text>
              <text class="info-value">{{ mergedData.spouseRelations.length }}人</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作 -->
      <view class="detail-footer" v-if="showEditBtn">
        <view class="footer-btn edit-btn" @click="onEdit">
          <uni-icons type="compose" size="16" color="#fff" />
          <text class="btn-text">编辑</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { getFamiliesMembersMemberId } from '@/services/apifox/NODEJSDEMO/FAMILIES/apifox';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  memberData: {
    type: Object,
    default: () => null
  },
  parentName: {
    type: String,
    default: ''
  },
  showEditBtn: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'edit']);

// 详情数据
const detailData = ref(null);
const loading = ref(false);

// 加载成员详情
const loadMemberDetail = async (memberId) => {
  if (!memberId) return;
  
  try {
    loading.value = true;
    const response = await getFamiliesMembersMemberId(memberId);
    console.log('成员详情:', response);
    detailData.value = response;
  } catch (error) {
    console.error('加载成员详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 监听弹窗打开，加载详情
watch(() => props.visible, (newVal) => {
  console.log('弹窗状态变化:', newVal, 'memberData:', props.memberData);
  if (newVal && props.memberData?.id) {
    console.log('加载成员详情, memberId:', props.memberData.id);
    loadMemberDetail(props.memberData.id);
  } else if (!newVal) {
    detailData.value = null;
  }
});

// 合并数据：优先使用接口返回的详情数据
const mergedData = computed(() => {
  return detailData.value || props.memberData;
});

// 计算属性
const memberGender = computed(() => {
  return mergedData.value?.gender || mergedData.value?.value?.gender || 'unknown';
});

const memberGeneration = computed(() => {
  return mergedData.value?.generation || mergedData.value?.value?.generation;
});

const memberSurname = computed(() => {
  return mergedData.value?.nameZh?.surname || mergedData.value?.surname || mergedData.value?.value?.surname;
});

const memberGivenName = computed(() => {
  return mergedData.value?.nameZh?.given || mergedData.value?.givenName || mergedData.value?.value?.givenName;
});

const memberFullName = computed(() => {
  return mergedData.value?.nameZh?.full || mergedData.value?.name || `${memberSurname.value || ''}${memberGivenName.value || ''}` || '未知';
});

const childrenCount = computed(() => {
  return mergedData.value?.children?.length || 0;
});

const childrenNames = computed(() => {
  if (!mergedData.value?.children) return [];
  // children 可能是 ID 数组，需要显示数量而非名称
  return mergedData.value.children.map(child => typeof child === 'string' ? child : child.name).filter(name => name);
});

const onMaskClick = () => {
  emit('close');
};

const onClose = () => {
  emit('close');
};

const onEdit = () => {
  emit('edit', mergedData.value);
};
</script>

<style scoped>
.member-detail-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.member-detail-popup {
  width: 100%;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.member-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #87CEEB 0%, #5BA3C6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-avatar.female {
  background: linear-gradient(135deg, #FFB6C1 0%, #FF8DA1 100%);
}

.avatar-text {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.member-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.member-tags {
  display: flex;
  gap: 12rpx;
}

.gender-tag {
  padding: 4rpx 16rpx;
  font-size: 24rpx;
  border-radius: 12rpx;
}

.gender-tag.male {
  color: #1890ff;
  background-color: #e6f7ff;
}

.gender-tag.female {
  color: #eb2f96;
  background-color: #fff0f6;
}

.gender-tag.unknown {
  color: #666;
  background-color: #f5f5f5;
}

.generation-tag {
  padding: 4rpx 16rpx;
  font-size: 24rpx;
  color: #667eea;
  background-color: #f0f0ff;
  border-radius: 12rpx;
}

.close-btn {
  padding: 16rpx;
}

.detail-content {
  flex: 1;
  max-height: 50vh;
  padding: 0 32rpx;
}

.info-section {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-section:last-child {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.info-label {
  width: 140rpx;
  font-size: 28rpx;
  color: #999;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
}

.avatar-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
}

.detail-footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee;
}

.footer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  cursor: pointer;
}

.edit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-text {
  font-size: 30rpx;
  color: #fff;
}
</style>
