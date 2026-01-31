<template>
  <view class="family-tree-chart">
    <!-- 工具栏 -->
    <view class="chart-toolbar">
      <view class="toolbar-btn" :class="{ active: autoFitMode }" @click="toggleAutoFit">
        <uni-icons :type="autoFitMode ? 'eye' : 'eye-slash'" size="16" :color="autoFitMode ? '#fff' : '#667eea'" />
        <text class="toolbar-text" :class="{ active: autoFitMode }">{{ autoFitMode ? '适应' : '原始' }}</text>
      </view>
      <view class="toolbar-btn refresh-btn" @click="refreshChart">
        <uni-icons type="refreshempty" size="16" color="#667eea" />
        <text class="toolbar-text">刷新</text>
      </view>
      <view class="export-btn" @click="exportToImage">
        <uni-icons type="download" size="16" color="#fff" />
        <text class="export-text">导出</text>
      </view>
    </view>

    <!-- 树形图 -->
    <view class="chart-container">
      <LEchart class="echart" ref="chart" :custom-style="{
        width: '100vw',
        height: '100%',
        minHeight: '300px',
        backgroundColor: '#ffffff'
      }" :webview-styles="{
          progress: false,
          bounce: false,
          scrollIndicator: false
        }"></LEchart>
    </view>

    <!-- 成员详情弹窗 -->
    <MemberDetail :visible="showMemberDetail" :memberData="selectedNode" :parentName="selectedNodeParentName"
      :showEditBtn="isLoggedIn" @close="showMemberDetail = false" @edit="onEditMember" />

    <!-- 导出用的隐藏Canvas -->
    <canvas v-if="exportLoading" type="2d" id="exportCanvas" class="export-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"></canvas>

    <!-- 底部操作面板 -->
    <view class="bottom-panel" :class="{ 'panel-expanded': panelExpanded }">
      <!-- 折叠/展开按钮 -->
      <view class="panel-toggle" :class="{ 'has-selection': selectedNode }" @click="togglePanel">
        <view class="toggle-content">
          <text class="toggle-text" v-if="selectedNode">
            <text class="status-indicator">🎯</text> 已选中: {{ selectedNode.name }}
          </text>
          <text class="toggle-text" v-else>
            <text class="status-indicator">👆</text> 点击图表节点进行操作
          </text>
        </view>
        <text class="toggle-icon">{{ panelExpanded ? '▼' : '▲' }}</text>
      </view>

      <!-- 面板内容 - 展开时显示 -->
      <view class="panel-content-wrapper" v-if="panelExpanded">
        <!-- 头部：模式切换（仅登录用户且选中节点时显示，定位在右上角） -->
        <view class="mode-toggle-float" v-if="selectedNode && isLoggedIn">
          <view class="mode-toggle-btn" :class="{ active: bottomPanelMode === 'detail' }"
            @click="bottomPanelMode = 'detail'">详情</view>
          <view class="mode-toggle-btn" :class="{ active: bottomPanelMode === 'edit' }"
            @click="bottomPanelMode = 'edit'">编辑</view>
        </view>

        <!-- 未选中节点时的提示 -->
        <view class="no-selection-tip" v-if="!selectedNode">
          <uni-icons type="info" size="48" color="#ccc" />
          <text class="tip-text">请点击图表中的节点进行选择</text>
        </view>

        <!-- 详情模式 -->
        <scroll-view class="panel-content detail-content" scroll-y v-if="selectedNode && bottomPanelMode === 'detail'">
          <!-- 基本信息 -->
          <view class="info-section">
            <view class="section-title">基本信息</view>
            <view class="info-grid">
              <view class="info-item">
                <text class="info-label">姓氏</text>
                <text class="info-value">{{ selectedNode.surname || selectedNode.value?.surname || '-' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">名字</text>
                <text class="info-value">{{ selectedNode.givenName || selectedNode.value?.givenName || '-' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">代数</text>
                <text class="info-value">{{ selectedNodeGeneration ? `第${selectedNodeGeneration}代` : '-' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">性别</text>
                <text class="info-value">{{ selectedNodeGender === 'male' ? '男' : selectedNodeGender === 'female' ? '女'
                  : '未知' }}</text>
              </view>
            </view>
          </view>

          <!-- 家族关系 -->
          <view class="info-section">
            <view class="section-title">家族关系</view>
            <view class="info-grid">
              <view class="info-item">
                <text class="info-label">父亲</text>
                <text class="info-value">{{ selectedNodeParentName || '-' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">子女</text>
                <text class="info-value">{{ selectedNode.children?.length || 0 }}人</text>
              </view>
            </view>
            <view class="children-list" v-if="selectedNode.children?.length > 0">
              <text class="children-label">子女名单：</text>
              <text class="children-names">{{selectedNode.children.map(c => c.name).join('、')}}</text>
            </view>
          </view>

          <!-- TODO: 这里可以添加接口请求获取更多详情数据 -->
        </scroll-view>

        <!-- 编辑模式 - 仅登录用户可见 -->
        <view class="panel-content edit-content" v-if="selectedNode && bottomPanelMode === 'edit' && isLoggedIn">
          <!-- 成员选择器 -->
          <view class="member-selector-panel" style="display: flex;">
            <view class="selector-title">成员</view>
            <!-- <view class="selector-header">
            <view class="selector-title">选择成员</view>
            <view class="refresh-members">
              <text class="refresh-icon">🔄</text>
            </view>
          </view> -->
            <picker class="member-picker" :value="selectedMemberIndex" :range="memberOptions" range-key="displayName"
              @change="onMemberSelect" :disabled="memberLoading">
              <view class="picker-text">
                {{ selectedMemberIndex >= 0 ? memberOptions[selectedMemberIndex]?.displayName : '请选择成员' }}
              </view>
            </picker>
          </view>

          <!-- 新增子节点表单 -->
          <view class="form-content" v-if="activeTab === 'add'">
            <view class="member-selector-panel" style="display: flex;">
              <view class="selector-title">姓名</view>
              <view style="display: flex;">
                <input class="input" v-model="newNode.surname" placeholder="姓氏" maxlength="20" style="flex:1;" />
                <input class="input" v-model="newNode.givenName" placeholder="名字" maxlength="50"
                  style="margin-left: 16rpx;flex:2;" />
              </view>
              <!-- <text class="label">姓氏：</text>
            <input 
              class="input" 
              v-model="newNode.surname" 
              placeholder="姓氏"
              maxlength="20"
            /> -->
            </view>

            <!-- <view class="form-item">
            <text class="label">名字：</text>
            <input 
              class="input" 
              v-model="newNode.givenName" 
              placeholder="名字"
              maxlength="50"
            />
          </view> -->

            <view class="member-selector-panel" style="display: flex;">
              <view class="selector-title">性别</view>
              <picker :value="newNode.gender === 'male' ? 0 : newNode.gender === 'female' ? 1 : 2"
                :range="['男', '女', '未知']" @change="onGenderChange" class="picker">
                <view class="picker-text">
                  {{ newNode.gender === 'male' ? '男' : newNode.gender === 'female' ? '女' : '未知' }}
                </view>
              </picker>
            </view>

            <!-- <view class="form-item">
            <text class="label">性别：</text>
            <picker 
              :value="newNode.gender === 'male' ? 0 : newNode.gender === 'female' ? 1 : 2"
              :range="['男', '女', '未知']"
              @change="onGenderChange"
              class="picker"
            >
              <view class="picker-text">
                {{ newNode.gender === 'male' ? '男' : newNode.gender === 'female' ? '女' : '未知' }}
              </view>
            </picker>
          </view> -->

            <view class="form-actions">
              <!-- <button class="action-btn cancel-btn" @click="resetForm">重置</button> -->
              <button class="action-btn confirm-btn" style="width: 100%;" @click="addChildNode">添加子节点</button>
            </view>
          </view>

          <!-- 编辑节点表单 -->
          <view class="form-content" v-if="activeTab === 'edit' && selectedNode">
            <view style="display: flex;">
              <view class="form-item">
                <text class="label">姓氏：</text>
                <input class="input" v-model="editNode.surname" placeholder="请输入姓氏" maxlength="20" />
              </view>
              <view class="form-item">
                <text class="label">名字：</text>
                <input class="input" v-model="editNode.givenName" placeholder="请输入名字" maxlength="50" />
              </view>
            </view>


            <view class="form-item">
              <text class="label">性别：</text>
              <picker :value="editNode.gender === 'male' ? 0 : editNode.gender === 'female' ? 1 : 2"
                :range="['男', '女', '未知']" @change="onEditGenderChange" class="picker">
                <view class="picker-text">
                  {{ editNode.gender === 'male' ? '男' : editNode.gender === 'female' ? '女' : '未知' }}
                </view>
              </picker>
            </view>

            <view class="form-actions">
              <button class="action-btn cancel-btn" @click="cancelEdit">取消</button>
              <button class="action-btn confirm-btn" @click="updateNode">保存修改</button>
            </view>
          </view>

          <!-- 设置关系表单 -->
          <view class="form-content" v-if="activeTab === 'relation' && selectedNode">
            <view class="form-item">
              <text class="label">选择新的父节点：</text>
              <picker class="picker" :value="relationParentIndex" :range="availableParentNodes" range-key="name"
                @change="onRelationParentChange">
                <view class="picker-text">
                  {{ selectedRelationParent || '请选择父节点' }}
                </view>
              </picker>
            </view>

            <view class="form-actions">
              <button class="action-btn cancel-btn" @click="resetRelation">重置</button>
              <button class="action-btn confirm-btn" @click="updateRelation">更新关系</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import LEchart from '@/components/l-echart/l-echart.vue';
import MemberDetail from './member-detail.vue';
import { onBeforeMount, onMounted, reactive, ref, computed, nextTick } from 'vue';
import { getToken } from '@/utils/storage';
import { getFamiliesTrees, postFamiliesMembers, postFamiliesRelationshipsLink, getFamiliesMembers } from '@/services/apifox/NODEJSDEMO/FAMILIES/apifox';
const echarts = require('../../../static/echarts.min');

// 返回上一页：已由 nav-bar 默认行为提供

// 缩放控制相关
const currentZoom = ref(1); // 当前缩放比例
const zoomStep = 0.2; // 每次缩放的步长
const minZoom = 0.3; // 最小缩放比例
const maxZoom = 3; // 最大缩放比例

// 放大
const zoomIn = () => {
  if (chartInstance && currentZoom.value < maxZoom) {
    currentZoom.value = Math.min(currentZoom.value + zoomStep, maxZoom);
    applyZoom();
  }
};

// 缩小
const zoomOut = () => {
  if (chartInstance && currentZoom.value > minZoom) {
    currentZoom.value = Math.max(currentZoom.value - zoomStep, minZoom);
    applyZoom();
  }
};

// 重置缩放
const resetZoom = () => {
  if (chartInstance) {
    currentZoom.value = 1;
    // 重置缩放和位置
    chartInstance.dispatchAction({
      type: 'restore'
    });
  }
};

// 切换自动缩放模式
const toggleAutoFit = () => {
  autoFitMode.value = !autoFitMode.value;
  
  // 更新图表配置
  if (autoFitMode.value) {
    // 自动缩放模式：使用百分比，让图表自动适应容器
    state.option.series[0].left = '5%';
    state.option.series[0].right = '5%';
    state.option.series[0].top = '10%';
    state.option.series[0].bottom = '10%';
    state.option.series[0].width = null;
    state.option.series[0].height = null;
  } else {
    // 原始间距模式：使用固定像素值和较大宽高
    state.option.series[0].left = 50;
    state.option.series[0].right = 50;
    state.option.series[0].top = 50;
    state.option.series[0].bottom = 50;
    state.option.series[0].width = '200%';
    state.option.series[0].height = '200%';
  }
  
  // 重新渲染图表
  if (chartInstance) {
    chartInstance.setOption(state.option, true);
  }
};

// 刷新图表
const refreshChart = async () => {
  if (chartInstance) {
    try {
      // 重置缩放比例
      currentZoom.value = 1;

      // 重新加载数据
      await loadFamilyTree();
      updateChartOption(treeData.value);

      // 重新设置图表选项
      chartInstance.setOption(state.option, true); // true表示不合并，完全替换

      // 重置视图
      chartInstance.dispatchAction({
        type: 'restore'
      });

      // 清除选中状态
      selectedNode.value = null;
      selectedMemberIndex.value = -1;

      console.log('图表已刷新重置');
    } catch (error) {
      console.error('刷新图表失败:', error);
    }
  }
};

// 应用缩放
const applyZoom = () => {
  if (chartInstance) {
    // 对于树形图，使用 graphRoam 来实现缩放
    chartInstance.dispatchAction({
      type: 'graphRoam',
      seriesIndex: 0,
      zoom: currentZoom.value,
      x: chartInstance.getWidth() / 2,
      y: chartInstance.getHeight() / 2
    });
  }
};

const loading = ref(false);
// 默认姓氏
const defaultSurname = ref('梁');
// 成员选择器相关
const memberOptions = ref([]);
const selectedMemberIndex = ref(0);
const memberLoading = ref(false);
// 登录状态
const isLoggedIn = computed(() => !!getToken());

// 成员详情弹窗
const showMemberDetail = ref(false);

// 选中节点的性别
const selectedNodeGender = computed(() => {
  if (!selectedNode.value) return 'unknown';
  return selectedNode.value.gender || selectedNode.value.value?.gender || 'unknown';
});

// 选中节点的父节点名称
const selectedNodeParentName = computed(() => {
  if (!selectedNode.value || !treeData.value) return '';
  // 递归查找父节点
  const findParent = (node, targetId) => {
    if (!node || !node.children) return null;
    for (const child of node.children) {
      if (child.id === targetId || child.originalId === targetId) {
        return node.name;
      }
      const found = findParent(child, targetId);
      if (found) return found;
    }
    return null;
  };
  return findParent(treeData.value, selectedNode.value.id || selectedNode.value.originalId) || '';
});

// 编辑成员
const onEditMember = (member) => {
  showMemberDetail.value = false;
  // 展开编辑面板
  panelExpanded.value = true;
  activeTab.value = 'edit';
};

// 导出相关
const exportLoading = ref(false);
const canvasWidth = ref(800);
const canvasHeight = ref(600);

// 底部面板相关
const panelExpanded = ref(false);
const activeTab = ref('add');
const selectedNode = ref(null);
const bottomPanelMode = ref('detail'); // 'detail' 详情模式 | 'edit' 编辑模式

// 图表高度（用于避让底部面板）
const chartHeight = ref('80vh');

// 自动缩放模式（true: 自动缩放适应容器, false: 按原始间距渲染）
// 默认为 true，初始配置也需要对应修改
const autoFitMode = ref(true);

// 选中节点的代数
const selectedNodeGeneration = computed(() => {
  if (!selectedNode.value) return null;
  return selectedNode.value.generation || selectedNode.value.value?.generation;
});

// 新增节点数据
const newNode = ref({
  surname: '',
  givenName: '',
  gender: 'male'
});

// 编辑节点数据
const editNode = ref({
  surname: '',
  givenName: '',
  gender: 'male'
});

// 关系设置相关
const relationParentIndex = ref(0);
const selectedRelationParent = ref('');

// 图表
let chart = ref();
let chartInstance = null; // 保存ECharts实例
const state = reactive({
  option: {}
});

// 简单的树形数据
const treeData = ref({
  name: '根节点',
  children: [
    {
      name: '子节点1',
      children: [
        // {
        //   name: '孙节点1-1',
        //   children: [
        //     { name: '曾孙节点1-1-1' },
        //     { name: '曾孙节点1-1-2' }
        //   ]
        // },
        { name: '孙节点1-2' }
      ]
    },
    {
      name: '子节点2',
      children: [
        {
          name: '孙节点2-1',
          children: [
            { name: '曾孙节点2-1-1' },
            { name: '曾孙节点2-1-2' },
            { name: '曾孙节点2-1-3' }
          ]
        },
        { name: '孙节点2-2' },
        { name: '孙节点2-3' }
      ]
    },
    {
      name: '子节点3',
      children: [
        { name: '孙节点3-1' },
        { name: '孙节点3-2' }
      ]
    }
  ]
});
state.option = {
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: [
    {
      type: 'tree',
      data: [treeData.value],
      // 默认使用百分比布局（适应模式）
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '10%',
      symbol: 'circle',
      symbolSize: 8,
      orient: 'vertical',
      // 支持拖拽移动画布
      roam: 'move',
      // 锁定缩放比例为1
      scaleLimit: {
        min: 1,
        max: 1
      },
      expandAndCollapse: true,
      initialTreeDepth: 3, // 初始显示3层
      animationDuration: 300,
      animationDurationUpdate: 300,
      // 节点间距配置（按此间距渲染，不自动缩放）
      nodeGap: 30,       // 同层节点间距
      layerPadding: 100, // 层与层之间的间距
      itemStyle: {
        // 默认蓝色，具体颜色由每个节点的 itemStyle 覆盖
        color: '#87CEEB'
      },
      label: {
        show: true,
        position: 'bottom',
        verticalAlign: 'top',
        align: 'center',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#333',
        // 竖向显示文本
        formatter: function (params) {
          // 将名字拆分成单个字符，用换行符连接实现竖排
          return params.name.split('').join('\n');
        },
        lineHeight: 16
      },
      leaves: {
        label: {
          position: 'bottom',
          verticalAlign: 'top',
          align: 'center',
          formatter: function (params) {
            return params.name.split('').join('\n');
          },
          lineHeight: 16
        }
      },
      lineStyle: {
        color: 'rgba(0,0,0,0.1)',
        width: 1
      }
    }
  ]
};

// 默认展示数据（游客模式和请求失败时使用）
const getDefaultFamilyTreeData = () => {
  return {
    "surname": "梁",
    "roots": ["6900c968e4a8f27214f74177"],
    "trees": [{
      "id": "6900c968e4a8f27214f74177",
      "name": "梁兆华",
      "value": { "fullName": "梁兆华", "surname": "梁", "givenName": "兆华", "gender": "male", "generation": 27 },
      "children": [{
        "id": "6901a012df2e836acc1b19a6",
        "name": "梁叶合",
        "value": { "fullName": "梁叶合", "surname": "梁", "givenName": "叶合", "gender": "male", "generation": 28 },
        "children": [{
          "id": "690210c2bd410f1f744d3a89",
          "name": "梁金耀",
          "value": { "fullName": "梁金耀", "surname": "梁", "givenName": "金耀", "gender": "male", "generation": 29 },
          "children": [{
            "id": "690445af367c7f1b32070984",
            "name": "梁瑞球",
            "value": { "gender": "male", "generation": 30 },
            "children": [
              { "id": "69044647367c7f55a8070a0f", "name": "梁智云", "value": { "gender": "male", "generation": 31 }, "children": [] },
              { "id": "6904465c367c7fedb1070a7d", "name": "梁智开", "value": { "gender": "male", "generation": 31 }, "children": [] }
            ]
          }, {
            "id": "6904f0a7367c7f821e070dec",
            "name": "梁瑞庭",
            "value": { "gender": "male", "generation": 30 },
            "children": [
              { "id": "6904f0bf367c7f2664070ead", "name": "梁俊杰", "value": { "gender": "male", "generation": 31 }, "children": [] },
              { "id": "6904f0cf367c7fd5d0070f3f", "name": "梁俊创", "value": { "gender": "male", "generation": 31 }, "children": [] }
            ]
          }]
        }, {
          "id": "69036979dc46ee1c2cc019ab",
          "name": "梁焕成",
          "value": { "gender": "unknown", "generation": 29 },
          "children": [{
            "id": "6904f0ed367c7f3a50071027",
            "name": "梁卓敏",
            "value": { "gender": "male", "generation": 30 },
            "children": [{ "id": "6904f112367c7f137d0711e2", "name": "梁振辉", "value": { "gender": "male", "generation": 31 }, "children": [] }]
          }]
        }, {
          "id": "6904459e367c7fb1cc070936",
          "name": "梁立成",
          "value": { "gender": "male", "generation": 29 },
          "children": [
            { "id": "6904f17a367c7f45350712a8", "name": "梁瑞祥", "value": { "gender": "male", "generation": 30 }, "children": [] },
            { "id": "6904f28e367c7fa1cb071450", "name": "梁瑞益", "value": { "gender": "male", "generation": 30 }, "children": [] },
            { "id": "6904f29c367c7f5c7c071530", "name": "梁瑞欣", "value": { "gender": "female", "generation": 30 }, "children": [] }
          ]
        }]
      }, {
        "id": "6901a07cdf2e836acc1b19b7",
        "name": "梁叶培",
        "value": { "gender": "male", "generation": 28 },
        "children": []
      }, {
        "id": "6901a0a1df2e836acc1b19d9",
        "name": "梁庚贤",
        "value": { "gender": "male", "generation": 28 },
        "children": [{
          "id": "6904f2f9367c7f552907170e",
          "name": "梁李光",
          "value": { "gender": "male", "generation": 29 },
          "children": [{ "id": "6904f341367c7f2132071ac2", "name": "梁锡沿", "value": { "gender": "male", "generation": 30 }, "children": [] }]
        }, {
          "id": "6904f308367c7fca75071812",
          "name": "梁雨南",
          "value": { "gender": "male", "generation": 29 },
          "children": [{ "id": "6904f35e367c7f73a3071bea", "name": "梁侃", "value": { "gender": "male", "generation": 30 }, "children": [] }]
        }, {
          "id": "6904f317367c7f76e8071920",
          "name": "梁雨荣",
          "value": { "gender": "male", "generation": 29 },
          "children": [{ "id": "6904f37c367c7fe62f071d22", "name": "梁显诚", "value": { "gender": "male", "generation": 30 }, "children": [] }]
        }]
      }]
    }]
  };
};

// 转换API数据为ECharts树形数据格式
const transformApiDataToTreeData = (apiData) => {
  console.log('开始转换API数据:', apiData);

  // 递归转换节点，保留原始ID
  const transformNode = (node, depth = 0) => {
    console.log(`转换节点 (深度${depth}):`, node);

    if (!node || !node.name) {
      console.warn('节点数据无效:', node);
      return null;
    }

    // 获取性别信息（可能在 node.gender 或 node.value.gender）
    const gender = node.gender || node.value?.gender;

    const transformed = {
      id: node.id || `node_${Date.now()}_${Math.random()}`, // ECharts显示用的ID
      originalId: node.id, // 保留原始数据ID
      name: node.name,
      value: node.name + (gender ? `\n${gender === 'male' ? '男' : '女'}` : ''),
      // 保留所有原始数据字段
      surname: node.surname || node.value?.surname,
      givenName: node.givenName || node.value?.givenName,
      gender: gender,
      // parentId: node.parentId,
      generation: node.generation || node.value?.generation,
      // 添加展开状态，确保所有节点默认展开
      collapsed: false,
      // 根据性别设置节点颜色
      itemStyle: {
        color: gender === 'female' ? '#FFB6C1' : '#87CEEB'
      }
    };

    // 递归处理子节点
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      console.log(`节点 ${node.name} 有 ${node.children.length} 个子节点`);
      const validChildren = node.children
        .map(child => transformNode(child, depth + 1))
        .filter(child => child !== null);

      if (validChildren.length > 0) {
        transformed.children = validChildren;
        console.log(`节点 ${node.name} 成功转换了 ${validChildren.length} 个子节点`);
      }
    } else {
      console.log(`节点 ${node.name} 没有子节点`);
    }

    return transformed;
  };

  // 根据实际API返回的数据结构进行转换
  if (apiData && apiData.trees && Array.isArray(apiData.trees) && apiData.trees.length > 0) {
    console.log('使用API返回的树形数据，共有', apiData.trees.length, '棵树');

    // 如果只有一棵树，直接返回
    if (apiData.trees.length === 1) {
      const result = transformNode(apiData.trees[0]);
      console.log('单棵树转换结果:', result);
      return result;
    }

    // 如果有多棵树，创建虚拟根节点合并
    const transformedTrees = apiData.trees
      .map(tree => transformNode(tree))
      .filter(tree => tree !== null);

    const virtualRoot = {
      id: 'virtual_root',
      originalId: 'virtual_root',
      name: `${apiData.surname || defaultSurname.value}氏族谱`,
      value: `${apiData.surname || defaultSurname.value}氏族谱`,
      surname: apiData.surname,
      isVirtualRoot: true, // 标记为虚拟根节点
      collapsed: false,
      children: transformedTrees
    };

    console.log('多棵树合并结果:', virtualRoot);
    return virtualRoot;
  } else if (apiData && apiData.name) {
    // 如果API直接返回根节点数据
    console.log('API直接返回根节点数据');
    const result = transformNode(apiData);
    console.log('转换结果:', result);
    return result;
  } else {
    // 如果没有数据，返回默认根节点
    console.log('没有有效数据，创建默认根节点');
    const defaultRoot = {
      id: 'root',
      originalId: 'root',
      name: `${apiData?.surname || defaultSurname.value}氏族谱`,
      value: `${apiData?.surname || defaultSurname.value}氏族谱`,
      children: [],
      collapsed: false
    };
    console.log('默认根节点:', defaultRoot);
    return defaultRoot;
  }
};

// 更新图表配置
const updateChartOption = (data) => {
  // 确保数据存在且有效
  if (!data || !data.name) {
    console.warn('树形数据无效，跳过图表更新');
    return;
  }

  state.option.series[0].data = [data];

  // chart.setOption(state.option);
};

// 获取家族树数据
const loadFamilyTree = async () => {
  try {
    loading.value = true;

    // 未登录用户直接使用默认数据
    if (!isLoggedIn.value) {
      console.log('游客模式，使用默认数据');
      treeData.value = transformApiDataToTreeData(getDefaultFamilyTreeData());
      return;
    }

    const response = await getFamiliesTrees({
      surname: defaultSurname.value,
      maxDepth: 10,
      format: 'echarts'
    });
    console.log('response', response);

    if (response) {
      treeData.value = transformApiDataToTreeData(response);
    } else {
      uni.showToast({
        title: response.message || '获取数据失败',
        icon: 'none'
      });
      // 请求失败时使用默认数据
      treeData.value = transformApiDataToTreeData(getDefaultFamilyTreeData());
    }
  } catch (error) {
    console.error('获取家族树数据失败:', error);
    uni.showToast({
      title: '获取数据失败，使用默认数据',
      icon: 'none'
    });
    // 请求失败时使用默认数据
    treeData.value = transformApiDataToTreeData(getDefaultFamilyTreeData());
  } finally {
    loading.value = false;
  }
};

// ========== 导出图片功能 ==========
// 导出为图片
const exportToImage = async () => {
  if (exportLoading.value || !chartInstance) return;

  try {
    exportLoading.value = true;
    uni.showLoading({
      title: '正在生成图片...',
      mask: true
    });

    // 获取图表的 DataURL
    const dataURL = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });

    // #ifdef H5
    await exportWithH5(dataURL);
    // #endif

    // #ifndef H5
    await exportWithMp(dataURL);
    // #endif

  } catch (error) {
    console.error('导出图片失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '导出失败，请重试',
      icon: 'none'
    });
    exportLoading.value = false;
  }
};

// H5端导出
const exportWithH5 = async (dataURL) => {
  const link = document.createElement('a');
  link.download = `家族树_${formatExportDate()}.png`;
  link.href = dataURL;
  link.click();

  uni.hideLoading();
  uni.showToast({
    title: '图片已下载',
    icon: 'success'
  });
  exportLoading.value = false;
};

// 小程序端导出
const exportWithMp = async (dataURL) => {
  // 小程序端需要先将 base64 转为临时文件再保存
  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
  const filePath = `${wx.env.USER_DATA_PATH}/family_tree_${Date.now()}.png`;

  const fs = wx.getFileSystemManager();
  fs.writeFile({
    filePath: filePath,
    data: base64Data,
    encoding: 'base64',
    success: () => {
      saveImageToAlbum(filePath);
    },
    fail: (err) => {
      console.error('写入文件失败:', err);
      uni.hideLoading();
      uni.showToast({ title: '导出失败', icon: 'none' });
      exportLoading.value = false;
    }
  });
};

// 保存图片到相册
const saveImageToAlbum = (tempFilePath) => {
  uni.saveImageToPhotosAlbum({
    filePath: tempFilePath,
    success: () => {
      uni.hideLoading();
      uni.showToast({
        title: '已保存到相册',
        icon: 'success'
      });
      exportLoading.value = false;
    },
    fail: (err) => {
      console.error('保存到相册失败:', err);
      uni.hideLoading();
      if (err.errMsg && err.errMsg.includes('auth deny')) {
        uni.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting['scope.writePhotosAlbum']) {
                    saveImageToAlbum(tempFilePath);
                  } else {
                    exportLoading.value = false;
                  }
                }
              });
            } else {
              exportLoading.value = false;
            }
          }
        });
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' });
        exportLoading.value = false;
      }
    }
  });
};

// 格式化导出日期
const formatExportDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}_${hour}${minute}`;
};

// 列表模式成员点击处理
const onMemberClick = (member) => {
  console.log('成员点击:', member);
  selectedNode.value = member.originalData;
  // 切换到树形图模式并选中该节点
  viewMode.value = 'tree';
  uni.showToast({
    title: `已选中: ${member.name}`,
    icon: 'none'
  });
};

// 加载家族成员列表
const loadMembers = async () => {
  try {
    memberLoading.value = true;
    console.log('开始加载家族成员列表...');

    const response = await getFamiliesMembers({
      limit: 100, // 获取前100个成员
      sortBy: 'surname' // 按姓氏排序
    });

    console.log('家族成员数据:', response);

    if (response?.items) {
      memberOptions.value = response.items.map(member => ({
        id: member.id,
        displayName: `${member.nameZh?.full || member.surname + member.givenName || '未知'}${member.gender === 'male' ? '(男)' : member.gender === 'female' ? '(女)' : ''}`,
        fullName: member.nameZh?.full || member.surname + member.givenName,
        surname: member.nameZh?.surname || member.surname,
        givenName: member.nameZh?.givenName || member.givenName,
        gender: member.gender,
        originalData: member,
        generation: member.generation || 0
      })).filter(item => item.fullName.includes("浚鸿")) || [];

      console.log('处理后的成员选项:', memberOptions.value);

      // uni.showToast({
      //   title: `已加载${memberOptions.value.length}个成员`,
      //   icon: 'success'
      // });
    } else {
      memberOptions.value = [];
      uni.showToast({
        title: '暂无成员数据',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('加载家族成员失败:', error);
    memberOptions.value = [];
    uni.showToast({
      title: '加载成员失败',
      icon: 'none'
    });
  } finally {
    memberLoading.value = false;
  }
};

function refreshCharts() {
  chart.value.setOption(state.option);
}

// 切换底部面板
const togglePanel = () => {
  panelExpanded.value = !panelExpanded.value;
  // 每次展开面板时，默认显示详情模式
  if (panelExpanded.value) {
    bottomPanelMode.value = 'detail';
  }
  
  // 高度变化后，调用 resize 让图表自适应
  // 需要等待 DOM 更新和 CSS transition 完成
  setTimeout(() => {
    nextTick(() => {
      // 调用组件的 resize 方法，它会重新查询容器尺寸
      if (chart.value && chart.value.resize) {
        chart.value.resize();
      }
    });
  }, 400); // 等待 CSS transition 动画完成
  
  resetForm();
};

// 重置新增表单
const resetForm = () => {
  newNode.value = {
    surname: defaultSurname.value,
    givenName: '',
    gender: 'male'
  };
};

// 添加子节点
const addChildNode = async () => {
  if (!newNode.value.surname.trim() || !newNode.value.givenName.trim()) {
    uni.showToast({
      title: '请输入姓氏和名字',
      icon: 'none'
    });
    return;
  }

  // 下拉列表选择的成员
  const selectedMember = memberOptions.value[selectedMemberIndex.value];
  if (!selectedMember) {
    uni.showToast({
      title: '请先选择父节点',
      icon: 'none'
    });
    return;
  }

  try {
    loading.value = true;

    // 1. 创建新的家族成员
    const memberData = {
      surname: newNode.value.surname,
      givenName: newNode.value.givenName,
      gender: newNode.value.gender,
    };

    if (selectedMember.generation && selectedMember.generation !== -1) {
      memberData.generation = selectedMember.generation + 1;
    }

    console.log('创建家族成员:', memberData);
    const memberResponse = await postFamiliesMembers(memberData);
    console.log('创建成员响应:', memberResponse);

    // 2. 建立父子关系
    if (memberResponse.id) {
      try {
        // const relationshipData = {
        //   parentId: selectedNode.value.id,
        //   childId: memberResponse.id,
        //   relationshipType: 'parent-child'
        // };
        const relationshipData = {
          "parentIds": [selectedMember.id],
          "childId": memberResponse.id
        }

        console.log('建立父子关系:', relationshipData);
        const relationshipResponse = await postFamiliesRelationshipsLink(relationshipData);
        console.log('关系建立响应:', relationshipResponse);
        uni.showToast({
          title: '建立父子关系成功',
          icon: 'none'
        });
        // 刷新图表
        await loadFamilyTree();
        // 刷新表单
        updateChartOption(treeData.value);
        refreshCharts();
        togglePanel();
      } catch (relationError) {
        console.error('建立关系失败:', relationError);
        uni.showToast({
          title: '成员创建成功，但关系建立失败',
          icon: 'none'
        });
      }
    }

    // 3. 重新加载家族树数据
    await loadFamilyTree();

    // 重置表单
    resetForm();

    uni.showToast({
      title: '添加成功',
      icon: 'success'
    });
    // 刷新表单
    updateChartOption(treeData.value);
    refreshCharts();
  } catch (error) {
    console.error('添加节点失败:', error);
    uni.showToast({
      title: '添加失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 更新关系
const updateRelation = async () => {
  try {
    // 删除原有的父节点
    const relationshipData = {
      "parentIds": [selectedMember.id],
      "childId": memberResponse.id
    }

    console.log('建立父子关系:', relationshipData);
    const relationshipResponse = await postFamiliesRelationshipsLink(relationshipData);
    console.log('关系建立响应:', relationshipResponse);
    uni.showToast({
      title: '建立父子关系成功',
      icon: 'none'
    });
    // 刷新图表
    await loadFamilyTree();
  } catch (error) {

  }
}

const init = async () => {
  loading.value = true;
  await loadFamilyTree();
  await loadMembers();
  updateChartOption(treeData.value);
  console.log('state.option', state.option);

  chart.value.init(echarts, (chartRef) => {
    console.log('图表初始化完成');

    // 保存ECharts实例以供缩放控制使用
    chartInstance = chartRef;

    chartRef.setOption(state.option);

    // 添加事件监听器测试折叠展开功能
    if (chartRef && chartRef.on) {
      chartRef.on('click', function (params) {
        console.log('节点点击事件:', params);
        selectedNode.value = params.data; // 选中的节点
        // 触发选中成员选择列表
        console.log('memberOptions.value', memberOptions.value, selectedNode.value);

        const findNodeMemberIndex = memberOptions.value.findIndex(member => member.id === selectedNode.value.id);
        if (findNodeMemberIndex !== -1) {
          selectedMemberIndex.value = findNodeMemberIndex;
        }
      });

      // 监听树形图展开/折叠事件，自动调整图表大小
      chartRef.on('click', { seriesType: 'tree' }, function () {
        // 延迟执行 resize，等待动画完成
        setTimeout(() => {
          if (chartInstance) {
            chartInstance.resize();
          }
        }, 350);
      });
    }
  });
  loading.value = false;
};



// 是否已初始化
const isInitialized = ref(false);

// 初始化图表（供父组件调用）
const initChart = async () => {
  if (isInitialized.value) return;
  isInitialized.value = true;
  init();
};

// 暴露方法给父组件
defineExpose({
  refreshChart,
  initChart
});

// 渲染完成

</script>

<style lang="scss" scoped>
.family-tree-chart {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  height: 100%;
  min-height: 0;
}

/* 工具栏 */
.chart-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  gap: 16rpx;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
  border: 1rpx solid #667eea;
}

.toolbar-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toolbar-text {
  font-size: 24rpx;
  color: #667eea;
}

.toolbar-text.active {
  color: #fff;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  cursor: pointer;
}

.export-text {
  font-size: 26rpx;
  color: #fff;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.add-btn,
.refresh-btn {
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
  cursor: pointer;
}

.add-btn {
  background-color: #007aff;
  color: #fff;
}

.refresh-btn {
  background-color: #f0f0f0;
  color: #333;
}

/* 成员选择器面板样式 */
.member-selector-panel {
  padding: 24rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e9ecef;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.selector-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 成员选择器样式 */
.member-selector {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  gap: 20rpx;
}

.selector-label {
  font-size: 28rpx;
  color: #333;
  white-space: nowrap;
}

.member-picker {
  flex: 1;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  background-color: #fff;
  width: 100%;
}

.picker-text {
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  text-align: left;
}

.refresh-members {
  padding: 16rpx;
  background-color: #007aff;
  border-radius: 8rpx;
  cursor: pointer;
}

.refresh-icon {
  font-size: 24rpx;
  color: #fff;
}

/* 操作栏样式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #f8f9fa;
}

.mode-switch {
  display: flex;
  background-color: #fff;
  border-radius: 32rpx;
  padding: 4rpx;
  border: 1rpx solid #667eea;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 28rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.mode-btn .mode-text {
  font-size: 26rpx;
  color: #667eea;
}

.mode-btn.active .mode-text {
  color: #fff;
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  cursor: pointer;
}

.export-text {
  font-size: 26rpx;
  color: #fff;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background-color: #fff;
  border: 1rpx solid #667eea;
  border-radius: 32rpx;
  cursor: pointer;
}

.refresh-text {
  font-size: 26rpx;
  color: #667eea;
}

/* 节点信息栏样式 */
.node-info-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #f8f9fa;
  border-bottom: 1rpx solid #eee;
}

.edit-toggle {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border: 1rpx solid #667eea;
  border-radius: 32rpx;
  cursor: pointer;
}

.edit-toggle-text {
  font-size: 26rpx;
  color: #667eea;
}

.node-info-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
  cursor: pointer;
}

.node-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #87CEEB 0%, #5BA3C6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-avatar.female {
  background: linear-gradient(135deg, #FFB6C1 0%, #FF8DA1 100%);
}

.node-avatar .avatar-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.node-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.node-info .node-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.node-info .node-hint {
  font-size: 24rpx;
  color: #999;
}

.chart-container {
  position: relative;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  overflow: visible;
  width: 100vw;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  transition: flex 0.3s ease;
}

.echart {
  width: 100vw !important;
  height: 100% !important;
  min-height: 300px !important;
}

/* 控制按钮样式 */
.zoom-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 导出Canvas隐藏样式 */
.export-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
}

.zoom-btn {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1rpx solid #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.zoom-btn:hover {
  background-color: #f5f5f5;
  transform: scale(1.05);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.2);
}

.zoom-btn:active {
  transform: scale(0.95);
  background-color: #e8e8e8;
}

.zoom-in {
  background-color: rgba(76, 175, 80, 0.1);
}

.zoom-out {
  background-color: rgba(244, 67, 54, 0.1);
}

.zoom-reset {
  background-color: rgba(33, 150, 243, 0.1);
}

.zoom-refresh {
  background-color: rgba(156, 39, 176, 0.1);
}

.zoom-export {
  background-color: rgba(255, 152, 0, 0.1);
}

/* 底部面板样式 */
.bottom-panel {
  background-color: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: max-height 0.3s ease;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.bottom-panel.panel-expanded {
  max-height: 50vh;
}

.bottom-panel:not(.panel-expanded) {
  max-height: 120rpx;
}

/* 面板内容包装器 */
.panel-content-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 50vh;
  overflow: hidden;
}

/* 未选中节点提示 */
.no-selection-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.no-selection-tip .tip-text {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #999;
}

/* 面板头部 */
.panel-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #f8f9fa;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0;
}

.node-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.gender-tag {
  padding: 4rpx 16rpx;
  font-size: 22rpx;
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
  font-size: 22rpx;
  color: #667eea;
  background-color: #f0f0ff;
  border-radius: 12rpx;
}

/* 模式切换按钮 - 浮动定位在右上角 */
.mode-toggle-float {
  position: absolute;
  top: 16rpx;
  right: 24rpx;
  display: flex;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 4rpx;
  border: 1rpx solid #667eea;
  z-index: 10;
}

.mode-toggle-btn {
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  color: #667eea;
  border-radius: 20rpx;
  cursor: pointer;
}

.mode-toggle-btn.active {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 详情内容 */
.detail-content {
  flex: 1;
  padding: 20rpx 24rpx;
  max-height: 40vh;
}

.info-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  padding-left: 16rpx;
  border-left: 4rpx solid #667eea;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.info-grid .info-item {
  width: calc(50% - 8rpx);
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding: 16rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.info-grid .info-label {
  font-size: 24rpx;
  color: #999;
}

.info-grid .info-value {
  font-size: 28rpx;
  color: #333;
}

.children-list {
  margin-top: 16rpx;
  padding: 16rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.children-label {
  font-size: 24rpx;
  color: #999;
}

.children-names {
  font-size: 26rpx;
  color: #333;
  margin-left: 8rpx;
}

/* 编辑内容 */
.edit-content {
  flex: 1;
  max-height: 50vh;
  overflow-y: auto;
}

.panel-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  padding: 0 32rpx;
  background-color: #f8f8f8;
  border-bottom: 1rpx solid #eee;
  cursor: pointer;
  transition: all 0.3s ease;
}

.panel-toggle.has-selection {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
  border-bottom: 2rpx solid #007aff;
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.15);
}

.panel-toggle.has-selection .toggle-text {
  color: #007aff;
  font-weight: 500;
}

.toggle-content {
  flex: 1;
}

.toggle-text {
  font-size: 28rpx;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.status-indicator {
  font-size: 24rpx;
  display: inline-block;
}

.toggle-icon {
  font-size: 32rpx;
  color: #666;
  transition: transform 0.3s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.panel-content {
  max-height: 600rpx;
  overflow-y: auto;
}

/* 未选中节点提示 */
.no-selection {
  padding: 60rpx 32rpx;
  text-align: center;
  background-color: #fafafa;
}

.tip-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.tip-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.tip-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

/* 手动选择根节点 */
.manual-select {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0e0;
}

.manual-select-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.manual-select-btn {
  width: 100%;
  padding: 16rpx 24rpx;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: bold;
}

/* 选中节点信息 */
.selected-node-info {
  padding: 32rpx;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-left: 8rpx solid #007aff;
  border-bottom: 1rpx solid #eee;
  position: relative;
}

.selected-node-info::before {
  content: '✓';
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  font-size: 32rpx;
  color: #007aff;
  font-weight: bold;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #007aff;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.info-title::before {
  content: '🎯';
  font-size: 24rpx;
}

.clear-selection {
  font-size: 24rpx;
  color: #ff4757;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background-color: rgba(255, 71, 87, 0.1);
  border: 1rpx solid rgba(255, 71, 87, 0.3);
  transition: all 0.3s ease;
}

.clear-selection:hover {
  background-color: rgba(255, 71, 87, 0.2);
  transform: scale(1.05);
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 16rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.node-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.node-id {
  font-size: 24rpx;
  color: #666;
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  display: inline-block;
}

/* 操作选项卡 */
.operation-tabs {
  display: flex;
  background-color: #f8f8f8;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2rpx solid transparent;
}

.tab-item.active {
  color: #007aff;
  background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
  border-bottom-color: #007aff;
  font-weight: 600;
  box-shadow: 0 -2rpx 8rpx rgba(0, 122, 255, 0.2);
  position: relative;
}

.tab-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 4rpx;
  background: linear-gradient(90deg, #007aff, #00d4ff);
  border-radius: 2rpx;
}

.tab-content {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.input {
  width: 100%;
  height: 64rpx;
  line-height: 64rpx;
  box-sizing: border-box;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #fff;
  transition: border-color 0.3s ease;
}

.input:focus {
  border-color: #007aff;
  outline: none;
}

.picker {
  width: 100%;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  background-color: #fff;
}

.picker-text {
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 32rpx;
  padding: 0 20rpx 32rpx;
}

.cancel-btn,
.confirm-btn {
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
}

.confirm-btn {
  background-color: #007aff;
  color: #fff;
}
</style>
