<template>
  <view class="family-tree-chart">
    <!-- 工具栏 -->
    <view class="chart-toolbar">
      <view class="toolbar-btn refresh-btn" @click="refreshChart">
        <uni-icons type="refreshempty" size="16" color="#667eea" />
        <text class="toolbar-text">刷新</text>
      </view>
    </view>

    <!-- 图谱升级占位（原 ECharts 树形图区域） -->
    <view class="chart-placeholder">
      <uni-icons type="info" size="44" color="#667eea" />
      <text class="placeholder-title">族谱图谱正在升级</text>
      <text class="placeholder-desc">成员数据、列表及编辑功能仍可继续使用。</text>
    </view>

    <!-- 成员详情弹窗 -->
    <MemberDetail
      :visible="showMemberDetail"
      :memberData="selectedNode"
      :parentName="selectedNodeParentName"
      :showEditBtn="false"
      @close="showMemberDetail = false" />

    <!-- 底部操作面板 -->
    <view class="bottom-panel" :class="{ 'panel-expanded': panelExpanded }">
      <!-- 折叠/展开按钮 -->
      <view class="panel-toggle" :class="{ 'has-selection': selectedMember }" @click="togglePanel">
        <view class="toggle-content">
          <text class="toggle-text" v-if="selectedMember">
            <text class="status-indicator">🎯</text> 已选中: {{ selectedMember.fullName }}
          </text>
          <text class="toggle-text" v-else> <text class="status-indicator">👆</text> 展开后可新增家族成员 </text>
        </view>
        <text class="toggle-icon">{{ panelExpanded ? '▼' : '▲' }}</text>
      </view>

      <!-- 面板内容 - 展开时显示 -->
      <view class="panel-content-wrapper" v-if="panelExpanded">
        <!-- 未登录提示 -->
        <view class="no-selection-tip" v-if="!isLoggedIn">
          <uni-icons type="info" size="48" color="#ccc" />
          <text class="tip-text">登录后可新增家族成员</text>
        </view>

        <!-- 新增成员表单 - 仅登录用户可见 -->
        <view class="panel-content edit-content" v-else>
          <!-- 父成员选择器 -->
          <view class="member-selector-panel" style="display: flex">
            <view class="selector-title">父成员</view>
            <picker
              class="member-picker"
              :value="selectedMemberIndex"
              :range="memberOptions"
              range-key="displayName"
              @change="onMemberSelect"
              :disabled="memberLoading">
              <view class="picker-text">
                {{ selectedMemberIndex >= 0 ? memberOptions[selectedMemberIndex]?.displayName : '请选择成员' }}
              </view>
            </picker>
          </view>

          <!-- 新增子节点表单 -->
          <view class="form-content">
            <view class="member-selector-panel" style="display: flex">
              <view class="selector-title">姓名</view>
              <view style="display: flex">
                <input class="input" v-model="newNode.surname" placeholder="姓氏" maxlength="20" style="flex: 1" />
                <input class="input" v-model="newNode.givenName" placeholder="名字" maxlength="50" style="margin-left: 16rpx; flex: 2" />
              </view>
            </view>

            <view class="member-selector-panel" style="display: flex">
              <view class="selector-title">性别</view>
              <picker
                :value="newNode.gender === 'male' ? 0 : newNode.gender === 'female' ? 1 : 2"
                :range="['男', '女', '未知']"
                @change="onGenderChange"
                class="picker">
                <view class="picker-text">
                  {{ newNode.gender === 'male' ? '男' : newNode.gender === 'female' ? '女' : '未知' }}
                </view>
              </picker>
            </view>

            <view class="form-actions">
              <button class="action-btn confirm-btn" style="width: 100%" :disabled="loading" @click="addChildNode">添加子节点</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import MemberDetail from './member-detail.vue'
  import { getToken } from '@/utils/storage'
  import { postFamiliesMembers, postFamiliesRelationshipsLink, getFamiliesMembers } from '@/services/apifox/NODEJSDEMO/FAMILIES/apifox'

  const loading = ref(false)
  // 默认姓氏
  const defaultSurname = ref('梁')
  // 成员选择器相关
  const memberOptions = ref([])
  const selectedMemberIndex = ref(-1)
  const memberLoading = ref(false)
  // 登录状态
  const isLoggedIn = computed(() => !!getToken())

  // 成员详情弹窗
  const showMemberDetail = ref(false)
  const selectedNode = ref(null)
  const selectedNodeParentName = ref('')

  // 底部面板相关
  const panelExpanded = ref(false)

  // 当前选中的父成员
  const selectedMember = computed(() => {
    if (selectedMemberIndex.value < 0) return null
    return memberOptions.value[selectedMemberIndex.value] || null
  })

  // 新增节点数据
  const newNode = ref({
    surname: '',
    givenName: '',
    gender: 'male',
  })

  // 选择父成员
  const onMemberSelect = e => {
    selectedMemberIndex.value = Number(e.detail.value)
  }

  // 性别切换
  const onGenderChange = e => {
    const genders = ['male', 'female', 'unknown']
    newNode.value.gender = genders[Number(e.detail.value)] || 'unknown'
  }

  // 加载家族成员列表
  const loadMembers = async () => {
    try {
      memberLoading.value = true

      const response = await getFamiliesMembers({
        limit: 100, // 获取前100个成员
        sortBy: 'surname', // 按姓氏排序
      })

      if (response?.items) {
        memberOptions.value = response.items.map(member => ({
          id: member.id,
          displayName: `${member.nameZh?.full || member.surname + member.givenName || '未知'}${member.gender === 'male' ? '(男)' : member.gender === 'female' ? '(女)' : ''}`,
          fullName: member.nameZh?.full || member.surname + member.givenName,
          surname: member.nameZh?.surname || member.surname,
          givenName: member.nameZh?.givenName || member.givenName,
          gender: member.gender,
          originalData: member,
          generation: member.generation || 0,
        }))
      } else {
        memberOptions.value = []
      }
    } catch (error) {
      console.error('加载家族成员失败:', error)
      memberOptions.value = []
      uni.showToast({
        title: '加载成员失败',
        icon: 'none',
      })
    } finally {
      memberLoading.value = false
    }
  }

  // 重置新增表单
  const resetForm = () => {
    newNode.value = {
      surname: defaultSurname.value,
      givenName: '',
      gender: 'male',
    }
  }

  // 切换底部面板
  const togglePanel = () => {
    panelExpanded.value = !panelExpanded.value
    if (panelExpanded.value) {
      resetForm()
      if (isLoggedIn.value && memberOptions.value.length === 0) {
        loadMembers()
      }
    }
  }

  // 添加子节点
  const addChildNode = async () => {
    if (!newNode.value.surname.trim() || !newNode.value.givenName.trim()) {
      uni.showToast({
        title: '请输入姓氏和名字',
        icon: 'none',
      })
      return
    }

    // 下拉列表选择的成员
    const parentMember = selectedMember.value
    if (!parentMember) {
      uni.showToast({
        title: '请先选择父节点',
        icon: 'none',
      })
      return
    }

    try {
      loading.value = true

      // 1. 创建新的家族成员
      const memberData = {
        surname: newNode.value.surname,
        givenName: newNode.value.givenName,
        gender: newNode.value.gender,
      }

      if (parentMember.generation && parentMember.generation !== -1) {
        memberData.generation = parentMember.generation + 1
      }

      const memberResponse = await postFamiliesMembers(memberData)

      // 2. 建立父子关系
      if (memberResponse.id) {
        try {
          const relationshipData = {
            parentIds: [parentMember.id],
            childId: memberResponse.id,
          }

          await postFamiliesRelationshipsLink(relationshipData)
          uni.showToast({
            title: '建立父子关系成功',
            icon: 'none',
          })
        } catch (relationError) {
          console.error('建立关系失败:', relationError)
          uni.showToast({
            title: '成员创建成功，但关系建立失败',
            icon: 'none',
          })
        }
      }

      // 3. 重新加载成员列表并重置表单
      await loadMembers()
      resetForm()

      uni.showToast({
        title: '添加成功',
        icon: 'success',
      })
    } catch (error) {
      console.error('添加节点失败:', error)
      uni.showToast({
        title: '添加失败',
        icon: 'none',
      })
    } finally {
      loading.value = false
    }
  }

  // 刷新成员数据（供父组件调用）
  const refreshChart = async () => {
    if (!isLoggedIn.value) return
    await loadMembers()
  }

  // 是否已初始化
  const isInitialized = ref(false)

  // 初始化（供父组件调用，保持原有调用契约）
  const initChart = async () => {
    if (isInitialized.value) return
    isInitialized.value = true
    resetForm()
    if (isLoggedIn.value) {
      await loadMembers()
    }
  }

  // 暴露方法给父组件
  defineExpose({
    refreshChart,
    initChart,
  })
</script>

<style lang="scss" scoped>
  .family-tree-chart {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--theme-bg);
    height: 100%;
    min-height: 0;
  }

  /* 工具栏 */
  .chart-toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 12rpx 24rpx;
    background-color: var(--theme-surface);
    border-bottom: 1rpx solid var(--theme-border);
    gap: 16rpx;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background-color: var(--theme-surface-2);
    border-radius: 32rpx;
    border: 1rpx solid #667eea;
  }

  .toolbar-text {
    font-size: 24rpx;
    color: #667eea;
  }

  /* 图谱升级占位 */
  .chart-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    padding: 48rpx 40rpx;
    min-height: 0;
  }

  .placeholder-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--theme-text);
  }

  .placeholder-desc {
    font-size: 26rpx;
    color: var(--theme-text-secondary, #999);
    text-align: center;
    line-height: 40rpx;
  }

  /* 底部面板 */
  .bottom-panel {
    position: relative;
    background-color: var(--theme-surface);
    border-top: 1rpx solid var(--theme-border);
    flex-shrink: 0;
  }

  .panel-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx;
    background-color: var(--theme-surface-2);
  }

  .toggle-content {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .toggle-text {
    font-size: 26rpx;
    color: var(--theme-text);
  }

  .status-indicator {
    margin-right: 8rpx;
  }

  .toggle-icon {
    font-size: 24rpx;
    color: #667eea;
  }

  .panel-content-wrapper {
    max-height: 60vh;
    overflow-y: auto;
  }

  .no-selection-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    padding: 48rpx 32rpx;
  }

  .tip-text {
    font-size: 26rpx;
    color: var(--theme-text-secondary, #999);
  }

  .panel-content {
    padding: 24rpx 32rpx 32rpx;
  }

  .member-selector-panel {
    flex-direction: column;
    gap: 12rpx;
    margin-bottom: 24rpx;
  }

  .selector-title {
    font-size: 28rpx;
    color: var(--theme-text);
    margin-bottom: 12rpx;
  }

  .member-picker {
    width: 100%;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background-color: var(--theme-surface);
  }

  .input {
    height: 64rpx;
    line-height: 64rpx;
    padding: 0 16rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    font-size: 28rpx;
    background-color: var(--theme-surface);
    transition: border-color 0.3s ease;
  }

  .input:focus {
    border-color: #007aff;
    outline: none;
  }

  .picker {
    width: 100%;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background-color: var(--theme-surface);
  }

  .picker-text {
    padding: 20rpx;
    font-size: 28rpx;
    color: var(--theme-text);
  }

  .form-actions {
    display: flex;
    justify-content: center;
    gap: 20rpx;
    margin-top: 32rpx;
  }

  .action-btn {
    padding: 20rpx 40rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
  }

  .confirm-btn {
    background-color: #007aff;
    color: #fff;
  }
</style>
