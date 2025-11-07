<!-- <template>
  <view>
    <view class="title">树形图折叠展开测试</view>
    <view>
      <LEchart class="echart" ref="chart" @finished="init"></LEchart>
    </view>
  </view>
</template> -->
<template>
  <view class="family-tree-page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="20" color="white" />
        </view>
        <text class="header-title">家族族谱树形图</text>
        <view class="header-placeholder"></view>
      </view>
    </view>
    

    
    <view class="chart-container">
      <LEchart 
        class="echart" 
        ref="chart" 
        :custom-style="{
          width: '100vw',
          height: '90vh',
          minHeight: '600px',
          backgroundColor: '#ffffff'
        }"
        :webview-styles="{
          progress: false,
          bounce: false,
          scrollIndicator: false
        }"
      ></LEchart>
      
      <!-- 刷新控制面板 -->
      <view class="zoom-controls">
        <view class="zoom-btn zoom-refresh" @click="refreshChart">
          <uni-icons type="refreshempty" size="18" color="#333" />
        </view>
      </view>
    </view>

    <!-- 底部操作面板 -->
    <view class="bottom-panel" :class="{ 'panel-expanded': panelExpanded }">
      <!-- 折叠/展开按钮 -->
      <view class="panel-toggle" :class="{ 'has-selection': selectedNode }" @click="togglePanel">
        <view class="toggle-content">
          <text class="toggle-text" v-if="!panelExpanded && selectedNode">
            <text class="status-indicator">🎯</text> 已选中: {{ selectedNode.name }}
          </text>
          <text class="toggle-text" v-if="!panelExpanded && !selectedNode">
            <text class="status-indicator">👆</text> 双击图表节点进行操作
          </text>
          <text class="toggle-text" v-if="panelExpanded && selectedNode">
            <text class="status-indicator">✓</text> 节点操作面板 - {{ selectedNode.name }}
          </text>
          <text class="toggle-text" v-if="panelExpanded && !selectedNode">
            节点操作面板
          </text>
        </view>
        <text class="toggle-icon">{{ panelExpanded ? '▼' : '▲' }}</text>
      </view>
      
      <!-- 面板内容 -->
      <view class="panel-content" v-show="panelExpanded">

        
        <!-- 未选中节点时的提示 -->
        <!-- <view class="no-selection" v-if="!selectedNode">
          <view class="tip-icon">👆</view>
          <view class="tip-text">请单击图表中的节点进行选择</view>
          <view class="tip-desc">单击节点可以展开/折叠子节点，同时选中节点进行编辑操作</view>
          
          <view class="manual-select" v-if="treeData">
            <text class="manual-select-text">如果点击无效，可以手动选择根节点：</text>
            <button class="manual-select-btn" @click="selectRootNode">选择根节点: {{ treeData.name }}</button>
          </view>
        </view> -->
        
        <!-- 选中节点时显示操作功能 -->
        <template v-if="selectedNode">
          <!-- 当前选中节点信息 -->
          <!-- <view class="selected-node-info">
            <view class="info-header">
              <view class="info-title">当前选中节点</view>
              <view class="clear-selection" @click="clearSelection">清除选择</view>
            </view>
            <view class="node-details">
              <text class="node-name">{{ selectedNode.name }}</text>
              <text class="node-id">ID: {{ selectedNode.id }}</text>
            </view>
          </view> -->
          
          <!-- 操作选项卡 -->
          <!--<view class="operation-tabs">
            <view 
              class="tab-item" 
              :class="{ 'active': activeTab === 'add' }"
              @click="activeTab = 'add'"
            >
              新增孩子
            </view>
            <view 
              class="tab-item" 
              :class="{ 'active': activeTab === 'edit' }"
              @click="activeTab = 'edit'"
              v-if="selectedNode.id !== 'root'"
            >
              编辑
            </view>
            <view 
              class="tab-item" 
              :class="{ 'active': activeTab === 'relation' }"
              @click="activeTab = 'relation'"
            >
              设置关系
            </view>
          </view>-->
        </template>

        <!-- 成员选择器 -->
        <view class="member-selector-panel" style="display: flex;">
          <view class="selector-title">成员</view>
          <!-- <view class="selector-header">
            <view class="selector-title">选择成员</view>
            <view class="refresh-members">
              <text class="refresh-icon">🔄</text>
            </view>
          </view> -->
          <picker 
            class="member-picker"
            :value="selectedMemberIndex" 
            :range="memberOptions" 
            range-key="displayName"
            @change="onMemberSelect"
            :disabled="memberLoading"
          >
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
              <input 
                class="input" 
                v-model="newNode.surname" 
                placeholder="姓氏"
                maxlength="20"
                style="flex:1;"                
              />
              <input 
                class="input" 
                v-model="newNode.givenName" 
                placeholder="名字"
                maxlength="50"
                style="margin-left: 16rpx;flex:2;"
              />
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
              <input 
                class="input" 
                v-model="editNode.surname" 
                placeholder="请输入姓氏"
                maxlength="20"
              />
            </view>
            <view class="form-item">
              <text class="label">名字：</text>
              <input 
                class="input" 
                v-model="editNode.givenName" 
                placeholder="请输入名字"
                maxlength="50"
              />
            </view>
          </view>  
          
          
          <view class="form-item">
            <text class="label">性别：</text>
            <picker 
              :value="editNode.gender === 'male' ? 0 : editNode.gender === 'female' ? 1 : 2"
              :range="['男', '女', '未知']"
              @change="onEditGenderChange"
              class="picker"
            >
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
            <picker 
              class="picker"
              :value="relationParentIndex" 
              :range="availableParentNodes" 
              range-key="name"
              @change="onRelationParentChange"
            >
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
</template>

<script setup>
import LEchart from '@/components/l-echart/l-echart.vue';
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
import { getFamiliesTrees, postFamiliesMembers, postFamiliesRelationshipsLink, getFamiliesMembers } from '@/services/apifox/NODEJSDEMO/FAMILIES/apifox';
import { useShare } from '@/utils/share';
const echarts = require('../../../static/echarts.min');

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    delta: 1
  });
};

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
// 底部面板相关
const panelExpanded = ref(false);
const activeTab = ref('add');
const selectedNode = ref(null);

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
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%',
      symbol: 'circle',
      symbolSize: 7,
      orient: 'vertical',
      // 启用树形图的缩放和拖拽
      roam: true,
      // 设置缩放范围和灵敏度
      scaleLimit: {
        min: 0.3,
        max: 3
      },
      // 缩放灵敏度配置
       roamDetail: {
          zoomSensitivity: 0.05, // 进一步降低双指缩放灵敏度
          moveSensitivity: 1, // 保持拖拽灵敏度
          zoomLock: false, // 允许缩放
          panLock: false // 允许平移
        },
      expandAndCollapse: true,
      initialTreeDepth: 2, // 初始只显示2层
      animationDuration: 300,
      animationDurationUpdate: 300,
      itemStyle: {
        color: '#87CEEB'
      },
      label: {
        show: true,
        position: 'bottom',
        verticalAlign: 'top',
        align: 'center',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#333'
      },
      leaves: {
        label: {
          position: 'bottom',
          verticalAlign: 'top',
          align: 'center'
        }
      },
      lineStyle: {
        color: '#ccc',
        width: 1.5
      }
    }
  ]
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
    
    const transformed = {
      id: node.id || `node_${Date.now()}_${Math.random()}`, // ECharts显示用的ID
      originalId: node.id, // 保留原始数据ID
      name: node.name,
      value: node.name + (node.gender ? `\n${node.gender === 'male' ? '男' : '女'}` : ''),
      // 保留所有原始数据字段
      surname: node.surname,
      givenName: node.givenName,
      gender: node.gender,
      // parentId: node.parentId,
      generation: node.generation || node.value?.generation,
      // 添加展开状态，确保所有节点默认展开
      collapsed: false
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
    console.log('使用API返回的树形数据');
    const result = transformNode(apiData.trees[0]);
    console.log('转换结果:', result);
    return result;
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
      name: `${apiData?.surname || defaultSurname.value}氏家族`,
      value: `${apiData?.surname || defaultSurname.value}氏家族`,
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
        const res = {"code":200,"message":"获取姓氏家族树成功","data":{"surname":"梁","roots":["6900c968e4a8f27214f74177"],"trees":[{"id":"6900c968e4a8f27214f74177","name":"梁兆华","parentsLabel":"","value":{"fullName":"梁兆华","surname":"梁","givenName":"兆华","gender":"male","generation":27,"avatarUrl":"","spouseNames":[],"parentNames":[]},"children":[{"id":"6901a012df2e836acc1b19a6","name":"梁叶合","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁叶合","surname":"梁","givenName":"叶合","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[{"id":"690210c2bd410f1f744d3a89","name":"梁金耀","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁金耀","surname":"梁","givenName":"金耀","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"690445af367c7f1b32070984","name":"梁瑞球","fatherName":"梁金耀","parentsLabel":"梁金耀","value":{"fullName":"梁瑞球","surname":"梁","givenName":"瑞球","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁金耀"]},"children":[{"id":"69044647367c7f55a8070a0f","name":"梁智云","fatherName":"梁瑞球","parentsLabel":"梁瑞球","value":{"fullName":"梁智云","surname":"梁","givenName":"智云","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞球"]},"children":[]},{"id":"6904465c367c7fedb1070a7d","name":"梁智开","fatherName":"梁瑞球","parentsLabel":"梁瑞球","value":{"fullName":"梁智开","surname":"梁","givenName":"智开","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞球"]},"children":[]}]},{"id":"6904f0a7367c7f821e070dec","name":"梁瑞庭","fatherName":"梁金耀","parentsLabel":"梁金耀","value":{"fullName":"梁瑞庭","surname":"梁","givenName":"瑞庭","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁金耀"]},"children":[{"id":"6904f0bf367c7f2664070ead","name":"梁俊杰","fatherName":"梁瑞庭","parentsLabel":"梁瑞庭","value":{"fullName":"梁俊杰","surname":"梁","givenName":"俊杰","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞庭"]},"children":[]},{"id":"6904f0cf367c7fd5d0070f3f","name":"梁俊创","fatherName":"梁瑞庭","parentsLabel":"梁瑞庭","value":{"fullName":"梁俊创","surname":"梁","givenName":"俊创","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞庭"]},"children":[]}]}]},{"id":"69036979dc46ee1c2cc019ab","name":"梁焕成","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁焕成","surname":"梁","givenName":"焕成","gender":"unknown","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"6904f0ed367c7f3a50071027","name":"梁卓敏","parentsLabel":"","value":{"fullName":"梁卓敏","surname":"梁","givenName":"卓敏","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁焕成"]},"children":[{"id":"6904f112367c7f137d0711e2","name":"梁振辉","fatherName":"梁卓敏","parentsLabel":"梁卓敏","value":{"fullName":"梁振辉","surname":"梁","givenName":"振辉","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁卓敏"]},"children":[]}]}]},{"id":"6904459e367c7fb1cc070936","name":"梁立成","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁立成","surname":"梁","givenName":"立成","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"6904f17a367c7f45350712a8","name":"梁瑞祥","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞祥","surname":"梁","givenName":"瑞祥","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[]},{"id":"6904f28e367c7fa1cb071450","name":"梁瑞益","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞益","surname":"梁","givenName":"瑞益","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[]},{"id":"6904f29c367c7f5c7c071530","name":"梁瑞欣","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞欣","surname":"梁","givenName":"瑞欣","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[]}]}]},{"id":"6901a07cdf2e836acc1b19b7","name":"梁叶培","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁叶培","surname":"梁","givenName":"叶培","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[]},{"id":"6901a0a1df2e836acc1b19d9","name":"梁庚贤","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁庚贤","surname":"梁","givenName":"庚贤","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[{"id":"6904f2f9367c7f552907170e","name":"梁李光","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁李光","surname":"梁","givenName":"李光","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f341367c7f2132071ac2","name":"梁锡沿","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁锡沿","surname":"梁","givenName":"锡沿","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]}]},{"id":"6904f308367c7fca75071812","name":"梁雨南","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁雨南","surname":"梁","givenName":"雨南","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f35e367c7f73a3071bea","name":"梁侃","fatherName":"梁雨南","parentsLabel":"梁雨南","value":{"fullName":"梁侃","surname":"梁","givenName":"侃","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨南"]},"children":[]}]},{"id":"6904f317367c7f76e8071920","name":"梁雨荣","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁雨荣","surname":"梁","givenName":"雨荣","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f37c367c7fe62f071d22","name":"梁显诚","fatherName":"梁雨荣","parentsLabel":"梁雨荣","value":{"fullName":"梁显诚","surname":"梁","givenName":"显诚","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨荣"]},"children":[]}]}]}]}]},"requestId":"6ff69e4e-086c-4930-aa68-73082fb1fbc0","timestamp":1761934265024};
          treeData.value = transformApiDataToTreeData(res.data);

    const response = await getFamiliesTrees({
      surname: defaultSurname.value,
      maxDepth: 10,
      format: 'echarts'
    });
    
    console.log('家族树数据:', response);
    
    // 转换API数据为ECharts树形数据格式
    if (response && response.trees && response.trees.length > 0) {
      delete response.trees[0];
      treeData.value = transformApiDataToTreeData(response);
    }
    // updateChartOption(transformApiDataToTreeData(response));
    // console.log('chartInstance.value', chartInstance.value);
    
    // if (chartInstance.value) {
    //   chartInstance.value.setOption(state.option, true);
    // }
  } catch (error) {
    console.error('获取家族树数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    });
    const res = {"code":200,"message":"获取姓氏家族树成功","data":{"surname":"梁","roots":["6900c968e4a8f27214f74177"],"trees":[{"id":"6900c968e4a8f27214f74177","name":"梁兆华","parentsLabel":"","value":{"fullName":"梁兆华","surname":"梁","givenName":"兆华","gender":"male","generation":27,"avatarUrl":"","spouseNames":[],"parentNames":[]},"children":[{"id":"6901a012df2e836acc1b19a6","name":"梁叶合","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁叶合","surname":"梁","givenName":"叶合","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[{"id":"690210c2bd410f1f744d3a89","name":"梁金耀","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁金耀","surname":"梁","givenName":"金耀","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"690445af367c7f1b32070984","name":"梁瑞球","fatherName":"梁金耀","parentsLabel":"梁金耀","value":{"fullName":"梁瑞球","surname":"梁","givenName":"瑞球","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁金耀"]},"children":[{"id":"69044647367c7f55a8070a0f","name":"梁智云","fatherName":"梁瑞球","parentsLabel":"梁瑞球","value":{"fullName":"梁智云","surname":"梁","givenName":"智云","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞球"]},"children":[]},{"id":"6904465c367c7fedb1070a7d","name":"梁智开","fatherName":"梁瑞球","parentsLabel":"梁瑞球","value":{"fullName":"梁智开","surname":"梁","givenName":"智开","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞球"]},"children":[]}]},{"id":"6904f0a7367c7f821e070dec","name":"梁瑞庭","fatherName":"梁金耀","parentsLabel":"梁金耀","value":{"fullName":"梁瑞庭","surname":"梁","givenName":"瑞庭","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁金耀"]},"children":[{"id":"6904f0bf367c7f2664070ead","name":"梁俊杰","fatherName":"梁瑞庭","parentsLabel":"梁瑞庭","value":{"fullName":"梁俊杰","surname":"梁","givenName":"俊杰","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞庭"]},"children":[]},{"id":"6904f0cf367c7fd5d0070f3f","name":"梁俊创","fatherName":"梁瑞庭","parentsLabel":"梁瑞庭","value":{"fullName":"梁俊创","surname":"梁","givenName":"俊创","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞庭"]},"children":[]}]}]},{"id":"69036979dc46ee1c2cc019ab","name":"梁焕成","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁焕成","surname":"梁","givenName":"焕成","gender":"unknown","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"6904f0ed367c7f3a50071027","name":"梁卓敏","parentsLabel":"","value":{"fullName":"梁卓敏","surname":"梁","givenName":"卓敏","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁焕成"]},"children":[{"id":"6904f112367c7f137d0711e2","name":"梁振辉","fatherName":"梁卓敏","parentsLabel":"梁卓敏","value":{"fullName":"梁振辉","surname":"梁","givenName":"振辉","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁卓敏"]},"children":[]}]}]},{"id":"6904459e367c7fb1cc070936","name":"梁立成","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁立成","surname":"梁","givenName":"立成","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"6904f17a367c7f45350712a8","name":"梁瑞祥","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞祥","surname":"梁","givenName":"瑞祥","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[]},{"id":"6904f28e367c7fa1cb071450","name":"梁瑞益","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞益","surname":"梁","givenName":"瑞益","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[]},{"id":"6904f29c367c7f5c7c071530","name":"梁瑞欣","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞欣","surname":"梁","givenName":"瑞欣","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[]}]}]},{"id":"6901a07cdf2e836acc1b19b7","name":"梁叶培","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁叶培","surname":"梁","givenName":"叶培","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[]},{"id":"6901a0a1df2e836acc1b19d9","name":"梁庚贤","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁庚贤","surname":"梁","givenName":"庚贤","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[{"id":"6904f2f9367c7f552907170e","name":"梁李光","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁李光","surname":"梁","givenName":"李光","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f341367c7f2132071ac2","name":"梁锡沿","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁锡沿","surname":"梁","givenName":"锡沿","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]}]},{"id":"6904f308367c7fca75071812","name":"梁雨南","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁雨南","surname":"梁","givenName":"雨南","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f35e367c7f73a3071bea","name":"梁侃","fatherName":"梁雨南","parentsLabel":"梁雨南","value":{"fullName":"梁侃","surname":"梁","givenName":"侃","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨南"]},"children":[]}]},{"id":"6904f317367c7f76e8071920","name":"梁雨荣","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁雨荣","surname":"梁","givenName":"雨荣","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f37c367c7fe62f071d22","name":"梁显诚","fatherName":"梁雨荣","parentsLabel":"梁雨荣","value":{"fullName":"梁显诚","surname":"梁","givenName":"显诚","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨荣"]},"children":[]}]}]}]}]},"requestId":"6ff69e4e-086c-4930-aa68-73082fb1fbc0","timestamp":1761934265024};
          treeData.value = transformApiDataToTreeData(res.data);

  } finally {
    loading.value = false;
  }
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
      
      uni.showToast({
        title: `已加载${memberOptions.value.length}个成员`,
        icon: 'success'
      });
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
    
    chartRef.on('treeselectchanged', function (params) {
      console.log('树形图折叠展开事件:', params);
      console.log('节点名称:', params.data?.name);
      console.log('展开状态:', params.data?.collapsed ? '折叠' : '展开');
    });
  });
  loading.value = false;
};



// 组件能被调用必须是组件的节点已经被渲染到页面上
onMounted(async () => {
  init();
  // await loadFamilyTree();
  // await loadMembers();
  // await loadFamilyTree();
  // updateChartOption(transformApiDataToTreeData(response));
  // console.log('chartInstance.value', chartInstance.value);
});

// 分享功能
const { onShareAppMessage, onShareTimeline } = useShare('family-tree');

// 导出分享方法供微信小程序调用
defineExpose({
  onShareAppMessage,
  onShareTimeline
});

// 渲染完成

</script>

<style lang="scss" scoped>
.family-tree-page {
  position: relative;
  min-height: 100vh;
  background-color: #f5f5f5;
  z-index: 0;
}

.header {
  background: linear-gradient(135deg, #0046B4 0%, #1E40AF 100%);
  padding: 88rpx 32rpx 32rpx;
  color: white;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .back-btn {
      width: 64rpx;
      height: 64rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .header-title {
      font-size: 36rpx;
      font-weight: 600;
    }
    
    .header-placeholder {
      width: 64rpx;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.add-btn, .refresh-btn {
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

.chart-container {
  position: relative;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  overflow: visible;
  z-index: 999;
  width: 100vw;
  height: 90vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.echart {
  width: 100vw !important;
  height: 90vh !important;
  min-height: 600px !important;
}

/* 刷新控制按钮样式 */
.zoom-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
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

/* 底部面板样式 */
.bottom-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: transform 0.3s ease;
}

.bottom-panel.collapsed {
  transform: translateY(calc(100% - 100rpx));
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

.cancel-btn, .confirm-btn {
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

