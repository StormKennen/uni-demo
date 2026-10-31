<template>
  <view class="family-tree-chart">
    <!-- 工具栏与模式切换 -->
    <view class="chart-toolbar">
      <view class="toolbar-info">
        <text class="toolbar-title">家族图谱全景</text>
        <text class="toolbar-subtitle">梁姓第24至31世 · 共 {{ allMembers.length }} 位成员</text>
      </view>

      <!-- 视图样式切换：树形血缘分支 vs 代际泳道 -->
      <view class="chart-mode-pills">
        <view class="pill-tab" :class="{ active: chartDisplayMode === 'tree' }" @click="chartDisplayMode = 'tree'">
          <uni-icons type="staff" size="14" :color="chartDisplayMode === 'tree' ? '#fff' : '#667eea'" />
          <text class="pill-text">血缘树形</text>
        </view>
        <view class="pill-tab" :class="{ active: chartDisplayMode === 'swimlane' }" @click="chartDisplayMode = 'swimlane'">
          <uni-icons type="bars" size="14" :color="chartDisplayMode === 'swimlane' ? '#fff' : '#667eea'" />
          <text class="pill-text">代际泳道</text>
        </view>
      </view>

      <view class="toolbar-btn refresh-btn" @click="refreshChart">
        <uni-icons type="refreshempty" size="16" color="#667eea" />
        <text class="toolbar-text">刷新</text>
      </view>
    </view>

    <!-- 图谱主体：滚动视窗 -->
    <scroll-view class="tree-scroll-container" :scroll-y="true" :scroll-x="false" :enable-flex="true">
      <!-- 加载中 -->
      <view v-if="loading && allMembers.length === 0" class="loading-state">
        <uni-icons type="spinner-cycle" size="36" color="#667eea" />
        <text class="loading-text">正在加载家族图谱...</text>
      </view>

      <!-- 空数据 -->
      <view v-else-if="!loading && allMembers.length === 0" class="empty-state">
        <uni-icons type="info" size="48" color="#ccc" />
        <text class="empty-text">暂无家族图谱数据</text>
      </view>

      <!-- 模式 A：完整家族关系树 -->
      <view class="tree-branch-root-wrap" v-else-if="chartDisplayMode === 'tree'">
        <view class="tree-root-notice">
          <text class="notice-text">
            梁姓第24至31世 · {{ treeMemberCount }} 位成员 · 首屏仅展开根节点，点击子女数按支系逐层查看；男女节点以淡蓝/淡粉区分，
            子女较多时可横向滑动。
          </text>
        </view>
        <view class="lineage-tree">
          <FamilyTreeCanvas :roots="rootTreeNodes" :selectedId="selectedMember?.id || ''" @select="onMemberCardClick" />
        </view>
      </view>

      <!-- 模式 B：代际泳道矩阵视图 (Generational Swimlane View) -->
      <view class="generations-wrapper" v-else>
        <view class="generation-section" v-for="genGroup in generationsData" :key="genGroup.generation">
          <!-- 代际标题栏 (可折叠) -->
          <view class="generation-header" @click="toggleGeneration(genGroup.generation)">
            <view class="gen-title-left">
              <view class="gen-badge">第 {{ genGroup.generation }} 代</view>
              <text class="gen-count">({{ genGroup.members.length }}人)</text>
            </view>
            <view class="gen-title-right">
              <text class="collapse-hint">{{ isGenCollapsed(genGroup.generation) ? '[+] 展开' : '[-] 折叠' }}</text>
            </view>
          </view>

          <!-- 成员卡片网格 -->
          <view class="generation-members-grid" v-if="!isGenCollapsed(genGroup.generation)">
            <view
              class="tree-member-card"
              v-for="member in genGroup.members"
              :key="member.id"
              :class="[member.gender || 'unknown', { selected: selectedMember?.id === member.id }]"
              @click="onMemberCardClick(member)">
              <view class="card-top-row">
                <view class="gender-tag-pill" :class="member.gender">
                  {{ member.gender === 'male' ? '男' : member.gender === 'female' ? '女' : '未知' }}
                </view>
              </view>

              <view class="member-avatar-box" :class="member.gender">
                <text class="avatar-letter">{{ member.fullName?.charAt(member.fullName?.length - 1) || '?' }}</text>
              </view>

              <view class="member-info-box">
                <text class="member-card-name">{{ member.fullName }}</text>
                <view class="member-meta-info" v-if="member.parentName || member.childrenCount">
                  <text class="meta-snippet" v-if="member.parentName">父: {{ member.parentName }}</text>
                  <text class="meta-snippet" v-if="member.childrenCount">子: {{ member.childrenCount }}人</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 成员详情弹窗 -->
    <MemberDetail
      :visible="showMemberDetail"
      :memberData="selectedNode"
      :parentName="selectedNodeParentName"
      :showEditBtn="isLoggedIn"
      @close="showMemberDetail = false"
      @edit="startEdit" />

    <!-- 底部操作面板 -->
    <view class="bottom-panel" :class="{ 'panel-expanded': panelExpanded }">
      <view class="panel-toggle" :class="{ 'has-selection': selectedMember }" @click="togglePanel">
        <view class="toggle-content">
          <text class="toggle-text" v-if="selectedMember">
            <text class="status-indicator">🎯</text> 已选中: {{ selectedMember.fullName }}
          </text>
          <text class="toggle-text" v-else> <text class="status-indicator">👆</text> 点击成员或展开面板新增/编辑家族成员 </text>
        </view>
        <text class="toggle-icon">{{ panelExpanded ? '▼' : '▲' }}</text>
      </view>

      <view class="panel-content-wrapper" v-if="panelExpanded">
        <view class="no-selection-tip" v-if="!isLoggedIn">
          <uni-icons type="info" size="48" color="#ccc" />
          <text class="tip-text">登录后可新增与管理家族成员</text>
        </view>

        <view class="panel-content edit-content" v-else>
          <view class="member-selector-panel" style="display: flex">
            <view class="selector-title">父成员节点</view>
            <picker
              class="member-picker"
              :value="selectedMemberIndex"
              :range="memberOptions"
              range-key="displayName"
              @change="onMemberSelect"
              :disabled="memberLoading">
              <view class="picker-text">
                {{ selectedMemberIndex >= 0 ? memberOptions[selectedMemberIndex]?.displayName : '请选择父成员（将在此成员下添加子嗣）' }}
              </view>
            </picker>
            <view v-if="selectedMember" class="member-actions">
              <button class="action-btn secondary-btn" @click="showSelectedMemberDetail">查看详情</button>
              <button class="action-btn secondary-btn" @click="startEdit(selectedMember.originalData)">编辑成员</button>
            </view>
          </view>

          <!-- 编辑表单 -->
          <view v-if="editingMember" class="form-content edit-member-form">
            <view class="form-title">编辑成员档案</view>
            <view class="member-selector-panel" style="display: flex">
              <view class="selector-title">姓名</view>
              <view style="display: flex">
                <input class="input" v-model="editNode.surname" placeholder="姓氏" maxlength="20" style="flex: 1" />
                <input class="input" v-model="editNode.givenName" placeholder="名字" maxlength="50" style="margin-left: 16rpx; flex: 2" />
              </view>
            </view>
            <view class="member-selector-panel" style="display: flex">
              <view class="selector-title">性别</view>
              <picker
                :value="editNode.gender === 'male' ? 0 : editNode.gender === 'female' ? 1 : 2"
                :range="['男', '女', '未知']"
                @change="onEditGenderChange"
                class="picker">
                <view class="picker-text">
                  {{ editNode.gender === 'male' ? '男' : editNode.gender === 'female' ? '女' : '未知' }}
                </view>
              </picker>
            </view>
            <view class="form-actions">
              <button class="action-btn secondary-btn" @click="cancelEdit">取消</button>
              <button class="action-btn confirm-btn" :disabled="loading" @click="saveEdit">保存修改</button>
            </view>
          </view>

          <!-- 新增表单 -->
          <view v-else class="form-content">
            <view class="member-selector-panel" style="display: flex">
              <view class="selector-title">新成员姓名</view>
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
              <button class="action-btn confirm-btn" style="width: 100%" :disabled="loading" @click="addChildNode">添加子嗣节点</button>
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
  import FamilyTreeCanvas from './family-tree-canvas.vue'
  import { staticFamilyMembers } from './family-static-data'
  import { linkFamilyRelationship, updateFamilyMember } from '@/api/family-tree'
  import { getToken } from '@/utils/storage'
  import { postFamiliesMembers } from '@/services/apifox/NODEJSDEMO/FAMILIES/apifox'

  const loading = ref(false)
  const allMembers = ref([])
  const collapsedGenerations = ref(new Set())

  // 显示模式：tree (血缘树形分支) | swimlane (代际分层泳道)
  const chartDisplayMode = ref('tree')

  const defaultSurname = ref('梁')
  const memberOptions = ref([])
  const selectedMemberIndex = ref(-1)
  const memberLoading = ref(false)
  const isLoggedIn = computed(() => !!getToken())

  const showMemberDetail = ref(false)
  const selectedNode = ref(null)
  const selectedNodeParentName = ref('')
  const editingMember = ref(null)
  const panelExpanded = ref(false)

  const selectedMember = computed(() => {
    if (selectedMemberIndex.value < 0) return null
    return memberOptions.value[selectedMemberIndex.value] || null
  })

  // 构建真实的树形血缘根节点数据
  const rootTreeNodes = computed(() => {
    if (!allMembers.value || allMembers.value.length === 0) return []

    const nodeMap = new Map()
    const nameMap = new Map()
    const sourceMap = new Map()

    allMembers.value.forEach(member => {
      if (member?.id) sourceMap.set(String(member.id), member)
    })

    allMembers.value.forEach(member => {
      if (!member?.id) return
      const fullName = member.nameZh?.full || `${member.surname || ''}${member.givenName || ''}` || '未知'
      nameMap.set(String(member.id), fullName)
    })

    allMembers.value.forEach(member => {
      if (!member?.id) return
      const id = String(member.id)
      const parents = Array.isArray(member.parents) ? member.parents : []
      const fullName = member.nameZh?.full || `${member.surname || ''}${member.givenName || ''}` || '未知'
      const parentName = parents
        .map(parentId => nameMap.get(String(parentId)))
        .filter(Boolean)
        .join('、')

      nodeMap.set(id, {
        ...member,
        id,
        fullName,
        parentName,
        children: [],
        parents: parents.map(String),
      })
    })

    const roots = []
    const attachedIds = new Set()
    const createsCycle = (parentNode, childNode) => {
      const pending = [childNode]
      const visited = new Set()
      while (pending.length > 0) {
        const current = pending.pop()
        if (current.id === parentNode.id) return true
        if (visited.has(current.id)) continue
        visited.add(current.id)
        pending.push(...current.children)
      }
      return false
    }
    const attachChild = (parentNode, childNode) => {
      if (!parentNode || !childNode || parentNode.id === childNode.id || createsCycle(parentNode, childNode)) return false
      if (!parentNode.children.some(child => child.id === childNode.id)) parentNode.children.push(childNode)
      attachedIds.add(childNode.id)
      return true
    }

    nodeMap.forEach(node => {
      node.parents.forEach(parentId => attachChild(nodeMap.get(parentId), node))
    })

    // 若父子关系字段不完整，使用接口 children 字段补建缺失的父子边。
    nodeMap.forEach(parentNode => {
      const childIds = Array.isArray(parentNode.children) ? parentNode.children.map(child => child.id) : []
      const rawChildren = sourceMap.get(parentNode.id)?.children
      if (!Array.isArray(rawChildren)) return
      rawChildren.forEach(childId => {
        const childNode = nodeMap.get(String(childId))
        if (!childNode || childNode.id === parentNode.id || childIds.includes(childNode.id)) return
        // 以 parents 为权威关系；仅在孩子未声明其他父节点时补充 children 反向关系，
        // 避免接口两侧字段不一致时重复挂入其他家系分支。
        if (childNode.parents.length > 0 && !childNode.parents.includes(parentNode.id)) return
        attachChild(parentNode, childNode)
      })
    })

    nodeMap.forEach(node => {
      if (!attachedIds.has(node.id)) roots.push(node)
    })

    // 用可达性校验保证每个接口成员都有树图入口；脏数据/环关系
    // 导致不可达的成员单独作为补充根节点展示，不静默丢失。
    const reachableIds = new Set()
    const pending = [...roots]
    while (pending.length > 0) {
      const node = pending.pop()
      if (!node || reachableIds.has(node.id)) continue
      reachableIds.add(node.id)
      pending.push(...node.children)
    }

    nodeMap.forEach(node => {
      if (!reachableIds.has(node.id)) {
        roots.push(node)
        reachableIds.add(node.id)
      }
    })

    return roots
  })

  const treeMemberCount = computed(() => {
    const visited = new Set()
    const pending = [...rootTreeNodes.value]
    while (pending.length > 0) {
      const node = pending.pop()
      if (!node || visited.has(node.id)) continue
      visited.add(node.id)
      pending.push(...node.children)
    }
    return visited.size
  })

  // 代际泳道分组数据
  const generationsData = computed(() => {
    const map = new Map()
    const nameMap = new Map()

    allMembers.value.forEach(m => {
      const fullName = m.nameZh?.full || `${m.surname || ''}${m.givenName || ''}`
      nameMap.set(m.id, fullName)
    })

    allMembers.value.forEach(member => {
      const gen = member.generation !== undefined && member.generation !== null ? member.generation : 0
      if (!map.has(gen)) {
        map.set(gen, [])
      }

      let parentName = ''
      if (member.parents && member.parents.length > 0) {
        parentName = member.parents
          .map(pid => nameMap.get(pid))
          .filter(Boolean)
          .join('、')
      }

      const fullName = member.nameZh?.full || `${member.surname || ''}${member.givenName || ''}`

      map.get(gen).push({
        ...member,
        fullName,
        parentName,
        childrenCount: member.children?.length || 0,
      })
    })

    const result = []
    map.forEach((members, generation) => {
      result.push({ generation, members })
    })

    result.sort((a, b) => b.generation - a.generation)
    return result
  })

  const isGenCollapsed = gen => collapsedGenerations.value.has(gen)
  const toggleGeneration = gen => {
    if (collapsedGenerations.value.has(gen)) {
      collapsedGenerations.value.delete(gen)
    } else {
      collapsedGenerations.value.add(gen)
    }
  }

  const onMemberCardClick = member => {
    if (!member?.id) return
    // 暂时屏蔽点击跳转到详情页
    // uni.navigateTo({
    //   url: `/subPackages/tools/family-tree/detail?id=${member.id}`,
    // })
  }

  const newNode = ref({
    surname: '',
    givenName: '',
    gender: 'male',
  })
  const editNode = ref({
    surname: '',
    givenName: '',
    gender: 'unknown',
  })

  const onMemberSelect = e => {
    selectedMemberIndex.value = Number(e.detail.value)
    editingMember.value = null
  }

  const onGenderChange = e => {
    const genders = ['male', 'female', 'unknown']
    newNode.value.gender = genders[Number(e.detail.value)] || 'unknown'
  }

  const onEditGenderChange = e => {
    const genders = ['male', 'female', 'unknown']
    editNode.value.gender = genders[Number(e.detail.value)] || 'unknown'
  }

  const showSelectedMemberDetail = () => {
    if (!selectedMember.value) return
    selectedNode.value = selectedMember.value.originalData
    selectedNodeParentName.value = ''
    showMemberDetail.value = true
  }

  const startEdit = member => {
    if (!member?.id) return
    showMemberDetail.value = false
    editingMember.value = member
    editNode.value = {
      surname: member.nameZh?.surname || member.surname || '',
      givenName: member.nameZh?.givenName || member.givenName || '',
      gender: member.gender || 'unknown',
    }
  }

  const cancelEdit = () => {
    editingMember.value = null
  }

  const saveEdit = async () => {
    const memberId = editingMember.value?.id
    if (!memberId || !editNode.value.surname.trim() || !editNode.value.givenName.trim()) {
      uni.showToast({ title: '请输入姓氏和名字', icon: 'none' })
      return
    }

    try {
      loading.value = true
      await updateFamilyMember(memberId, {
        surname: editNode.value.surname.trim(),
        givenName: editNode.value.givenName.trim(),
        gender: editNode.value.gender,
      })
      await loadMembers(memberId)
      editingMember.value = null
      uni.showToast({ title: '修改成功', icon: 'success' })
    } catch (error) {
      console.error('更新成员失败:', error)
      uni.showToast({ title: '修改失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  const loadMembers = async selectedId => {
    try {
      loading.value = true
      memberLoading.value = true

      // 当前族谱查询以用户提供的谱页静态校订数据为唯一数据源；网络数据和旧缓存
      // 暂不覆盖该数据，后续接入正式入库数据时再增加可切换的数据源策略。
      const items = staticFamilyMembers
      allMembers.value = items
      memberOptions.value = items.map(member => ({
        id: member.id,
        displayName: `第${member.generation || 0}代 - ${member.nameZh?.full || member.surname + member.givenName || '未知'}${member.gender === 'male' ? '(男)' : member.gender === 'female' ? '(女)' : ''}`,
        fullName: member.nameZh?.full || `${member.surname || ''}${member.givenName || ''}`,
        surname: member.nameZh?.surname || member.surname,
        givenName: member.nameZh?.givenName || member.givenName,
        gender: member.gender,
        originalData: member,
        generation: member.generation || 0,
      }))

      if (selectedId) {
        selectedMemberIndex.value = memberOptions.value.findIndex(member => member.id === selectedId)
      }
    } catch (error) {
      console.error('加载家族成员异常:', error)
      const items = staticFamilyMembers
      allMembers.value = items
      memberOptions.value = items.map(member => ({
        id: member.id,
        displayName: `第${member.generation || 0}代 - ${member.nameZh?.full || member.surname + member.givenName || '未知'}`,
        fullName: member.nameZh?.full || `${member.surname || ''}${member.givenName || ''}`,
        surname: member.nameZh?.surname || member.surname,
        givenName: member.nameZh?.givenName || member.givenName,
        gender: member.gender,
        originalData: member,
        generation: member.generation || 0,
      }))
    } finally {
      loading.value = false
      memberLoading.value = false
    }
  }

  const resetForm = () => {
    newNode.value = {
      surname: defaultSurname.value,
      givenName: '',
      gender: 'male',
    }
  }

  const togglePanel = () => {
    panelExpanded.value = !panelExpanded.value
    if (panelExpanded.value) {
      resetForm()
      if (allMembers.value.length === 0) {
        loadMembers()
      }
    }
  }

  const addChildNode = async () => {
    if (!newNode.value.surname.trim() || !newNode.value.givenName.trim()) {
      uni.showToast({
        title: '请输入姓氏和名字',
        icon: 'none',
      })
      return
    }

    const parentMember = selectedMember.value
    if (!parentMember) {
      uni.showToast({
        title: '请先选择父节点成员',
        icon: 'none',
      })
      return
    }

    try {
      loading.value = true

      const memberData = {
        surname: newNode.value.surname,
        givenName: newNode.value.givenName,
        gender: newNode.value.gender,
      }

      if (parentMember.generation && parentMember.generation !== -1) {
        memberData.generation = parentMember.generation + 1
      }

      const memberResponse = await postFamiliesMembers(memberData)

      if (memberResponse.id) {
        try {
          const relationshipData = {
            parentIds: [parentMember.id],
            childId: memberResponse.id,
          }

          await linkFamilyRelationship(relationshipData)
        } catch (relationError) {
          console.error('建立关系失败:', relationError)
        }
      }

      await loadMembers()
      resetForm()

      uni.showToast({
        title: '添加子嗣成功',
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

  const refreshChart = async () => {
    await loadMembers()
  }

  const isInitialized = ref(false)
  const initChart = async () => {
    if (isInitialized.value) return
    isInitialized.value = true
    resetForm()
    await loadMembers()
  }

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
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 24rpx;
    background-color: var(--theme-surface);
    border-bottom: 1rpx solid var(--theme-border);
    gap: 16rpx;
    flex-wrap: wrap;
  }

  .toolbar-info {
    display: flex;
    flex-direction: column;
  }

  .toolbar-title {
    font-size: 28rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .toolbar-subtitle {
    font-size: 20rpx;
    color: var(--theme-text-secondary);
    margin-top: 2rpx;
  }

  .chart-mode-pills {
    display: flex;
    background-color: var(--theme-surface-2);
    border-radius: 32rpx;
    padding: 4rpx;
    gap: 4rpx;
  }

  .pill-tab {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 10rpx 20rpx;
    border-radius: 28rpx;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);

      .pill-text {
        color: #fff;
        font-weight: 600;
      }
    }
  }

  .pill-text {
    font-size: 24rpx;
    color: #667eea;
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

  /* 滚动视图容器 */
  .tree-scroll-container {
    display: block;
    flex: 1;
    width: 100%;
    height: 0;
    min-height: 0;
    padding: 20rpx;
    box-sizing: border-box;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    padding: 120rpx 0;
  }

  .loading-text,
  .empty-text {
    font-size: 26rpx;
    color: var(--theme-text-secondary);
  }

  .tree-branch-root-wrap {
    width: max-content;
    min-width: 100%;
    padding: 0 0 40rpx;
    box-sizing: border-box;
  }

  .lineage-tree {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 40rpx;
    width: max-content;
    min-width: 100%;
    padding: 20rpx 24rpx 48rpx;
    box-sizing: border-box;
  }

  .tree-root-notice {
    padding: 16rpx 24rpx;
    margin-bottom: 20rpx;
    border-radius: 12rpx;
    background: rgba(102, 126, 234, 0.08);
    border: 1rpx solid rgba(102, 126, 234, 0.2);
  }

  .notice-text {
    font-size: 22rpx;
    color: #667eea;
    line-height: 1.4;
  }

  /* 代际泳道视图 */
  .generations-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    padding-bottom: 40rpx;
  }

  .generation-section {
    background: var(--theme-surface);
    border-radius: 16rpx;
    border: 1rpx solid var(--theme-border);
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx var(--theme-shadow-sm);
  }

  .generation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;
    background-color: var(--theme-surface-2);
    border-bottom: 1rpx solid var(--theme-border);
    cursor: pointer;
  }

  .gen-title-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .gen-badge {
    font-size: 26rpx;
    font-weight: 700;
    color: #667eea;
    padding: 4rpx 16rpx;
    background: rgba(102, 126, 234, 0.12);
    border-radius: 8rpx;
  }

  .gen-count {
    font-size: 22rpx;
    color: var(--theme-text-secondary);
  }

  .collapse-hint {
    font-size: 22rpx;
    color: #667eea;
    font-weight: 600;
  }

  .generation-members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280rpx, 1fr));
    gap: 16rpx;
    padding: 20rpx;
  }

  .tree-member-card {
    position: relative;
    display: flex;
    align-items: center;
    padding: 16rpx;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2rpx);
      box-shadow: 0 6rpx 16rpx var(--theme-shadow-md);
    }

    &.selected {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3rpx rgba(59, 130, 246, 0.25);
    }

    &.male {
      background: linear-gradient(135deg, #f0f7ff 0%, #e0edff 100%);
      border-color: #93c5fd;
    }

    &.female {
      background: linear-gradient(135deg, #fff5f7 0%, #ffe4e6 100%);
      border-color: #fbcfe8;
    }
  }

  .card-top-row {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
  }

  .gender-tag-pill {
    font-size: 18rpx;
    padding: 2rpx 10rpx;
    border-radius: 20rpx;
    font-weight: 600;

    &.male {
      background: rgba(59, 130, 246, 0.15);
      color: #2563eb;
    }
    &.female {
      background: rgba(236, 72, 153, 0.15);
      color: #db2777;
    }
    &.unknown {
      background: rgba(148, 163, 184, 0.15);
      color: #64748b;
    }
  }

  .member-avatar-box {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 24rpx;
    flex-shrink: 0;
    margin-right: 16rpx;

    &.male {
      background: #3b82f6;
      color: #fff;
    }
    &.female {
      background: #ec4899;
      color: #fff;
    }
    &.unknown {
      background: #94a3b8;
      color: #fff;
    }
  }

  .member-info-box {
    flex: 1;
    min-width: 0;
  }

  .member-card-name {
    font-size: 26rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .member-meta-info {
    display: flex;
    gap: 12rpx;
    margin-top: 4rpx;
  }

  .meta-snippet {
    font-size: 20rpx;
    color: var(--theme-text-secondary);
  }

  /* 底部操作面板样式保持一致 */
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
    cursor: pointer;
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

  .member-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 12rpx;
  }

  .form-title {
    margin-bottom: 24rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: var(--theme-text);
  }

  .edit-member-form {
    padding-top: 24rpx;
    border-top: 1rpx solid var(--theme-border);
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

    &:focus {
      border-color: #007aff;
      outline: none;
    }
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

  .secondary-btn {
    flex: 1;
    background-color: var(--theme-surface-2);
    color: #667eea;
  }
</style>
