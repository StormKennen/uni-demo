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
    <!-- 顶部导航栏（统一组件） -->
    <nav-bar
      always-title
      title="家族族谱树形图（快照）"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />
    

    
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

  </view>
</template>

<script setup>
import LEchart from '@/components/l-echart/l-echart.vue';
import NavBar from '@/components/nav-bar.vue';
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
const echarts = require('../../../static/echarts.min');

// 返回上一页：已由 nav-bar 默认行为提供

// 缩放控制相关
const currentZoom = ref(1); // 当前缩放比例
const zoomStep = 0.2; // 每次缩放的步长
const minZoom = 0.3; // 最小缩放比例
const maxZoom = 15; // 最大缩放比例（增加到8倍）

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
const selectedMemberIndex = ref(-1);
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
        max: 8
      },
      // 缩放灵敏度配置
       roamDetail: {
          zoomSensitivity: 0.03, // 降低缩放灵敏度，适应更高放大倍数
          moveSensitivity: 1.2, // 略微提高拖拽灵敏度，便于高倍数下的导航
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
        fontSize: 14,
        fontWeight: 'normal',
        color: '#333',
        // 竖向显示文本
        formatter: function(params) {
          // 将名字拆分成单个字符，用换行符连接实现竖排
          return params.name.split('').join('\n');
        },
        lineHeight: 18
      },
      leaves: {
        label: {
          position: 'bottom',
          verticalAlign: 'top',
          align: 'center',
          formatter: function(params) {
            return params.name.split('').join('\n');
          },
          lineHeight: 18
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
const res = {"code":200,"message":"获取姓氏家族树成功","data":{"surname":"梁","roots":["6900c968e4a8f27214f74177"],"trees":[{"id":"6900c968e4a8f27214f74177","name":"梁兆华","parentsLabel":"","value":{"fullName":"梁兆华","surname":"梁","givenName":"兆华","gender":"male","generation":27,"avatarUrl":"","spouseNames":[],"parentNames":[]},"children":[{"id":"6901a012df2e836acc1b19a6","name":"梁叶合","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁叶合","surname":"梁","givenName":"叶合","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[{"id":"690210c2bd410f1f744d3a89","name":"梁金耀","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁金耀","surname":"梁","givenName":"金耀","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"690445af367c7f1b32070984","name":"梁瑞球","fatherName":"梁金耀","parentsLabel":"梁金耀","value":{"fullName":"梁瑞球","surname":"梁","givenName":"瑞球","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁金耀"]},"children":[{"id":"69044647367c7f55a8070a0f","name":"梁智云","fatherName":"梁瑞球","parentsLabel":"梁瑞球","value":{"fullName":"梁智云","surname":"梁","givenName":"智云","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞球"]},"children":[{"id":"69057f8e367c7ffdd5075db7","name":"梁君泽","fatherName":"梁智云","parentsLabel":"梁智云","value":{"fullName":"梁君泽","surname":"梁","givenName":"君泽","gender":"male","generation":32,"avatarUrl":"","spouseNames":[],"parentNames":["梁智云"]},"children":[]}]},{"id":"6904465c367c7fedb1070a7d","name":"梁智开","fatherName":"梁瑞球","parentsLabel":"梁瑞球","value":{"fullName":"梁智开","surname":"梁","givenName":"智开","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞球"]},"children":[]}]},{"id":"6904f0a7367c7f821e070dec","name":"梁瑞庭","fatherName":"梁金耀","parentsLabel":"梁金耀","value":{"fullName":"梁瑞庭","surname":"梁","givenName":"瑞庭","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁金耀"]},"children":[{"id":"6904f0bf367c7f2664070ead","name":"梁俊杰","fatherName":"梁瑞庭","parentsLabel":"梁瑞庭","value":{"fullName":"梁俊杰","surname":"梁","givenName":"俊杰","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞庭"]},"children":[]},{"id":"6904f0cf367c7fd5d0070f3f","name":"梁俊创","fatherName":"梁瑞庭","parentsLabel":"梁瑞庭","value":{"fullName":"梁俊创","surname":"梁","givenName":"俊创","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞庭"]},"children":[]}]}]},{"id":"69036979dc46ee1c2cc019ab","name":"梁焕成","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁焕成","surname":"梁","givenName":"焕成","gender":"unknown","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"6904f0ed367c7f3a50071027","name":"梁卓敏","parentsLabel":"","value":{"fullName":"梁卓敏","surname":"梁","givenName":"卓敏","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁焕成"]},"children":[{"id":"6904f112367c7f137d0711e2","name":"梁振辉","fatherName":"梁卓敏","parentsLabel":"梁卓敏","value":{"fullName":"梁振辉","surname":"梁","givenName":"振辉","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁卓敏"]},"children":[]}]},{"id":"69057c57367c7f1f6e0751b5","name":"梁淑琴","parentsLabel":"","value":{"fullName":"梁淑琴","surname":"梁","givenName":"淑琴","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁焕成"]},"children":[]}]},{"id":"6904459e367c7fb1cc070936","name":"梁立成","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁立成","surname":"梁","givenName":"立成","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"6904f17a367c7f45350712a8","name":"梁瑞祥","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞祥","surname":"梁","givenName":"瑞祥","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[{"id":"69057c80367c7f79d9075343","name":"梁璋宁","fatherName":"梁瑞祥","parentsLabel":"梁瑞祥","value":{"fullName":"梁璋宁","surname":"梁","givenName":"璋宁","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞祥"]},"children":[]},{"id":"69057ed2367c7f5d94075847","name":"梁玮航","fatherName":"梁瑞祥","parentsLabel":"梁瑞祥","value":{"fullName":"梁玮航","surname":"梁","givenName":"玮航","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞祥"]},"children":[]}]},{"id":"6904f28e367c7fa1cb071450","name":"梁瑞益","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞益","surname":"梁","givenName":"瑞益","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[{"id":"69057c9a367c7f505a0754e1","name":"梁丰华","fatherName":"梁瑞益","parentsLabel":"梁瑞益","value":{"fullName":"梁丰华","surname":"梁","givenName":"丰华","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞益"]},"children":[]},{"id":"69057cec367c7fdcbc07568f","name":"梁国聪","fatherName":"梁瑞益","parentsLabel":"梁瑞益","value":{"fullName":"梁国聪","surname":"梁","givenName":"国聪","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞益"]},"children":[]}]},{"id":"6904f29c367c7f5c7c071530","name":"梁瑞欣","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞欣","surname":"梁","givenName":"瑞欣","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[{"id":"69057f0c367c7f072a075a09","name":"梁颖","fatherName":"梁瑞欣","parentsLabel":"梁瑞欣","value":{"fullName":"梁颖","surname":"梁","givenName":"颖","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞欣"]},"children":[]},{"id":"69057f1f367c7f2547075bdb","name":"梁芷怡","fatherName":"梁瑞欣","parentsLabel":"梁瑞欣","value":{"fullName":"梁芷怡","surname":"梁","givenName":"芷怡","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞欣"]},"children":[]}]},{"id":"6904fe44367c7f763d0730f0","name":"梁瑞丹","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞丹","surname":"梁","givenName":"瑞丹","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[]}]}]},{"id":"6901a07cdf2e836acc1b19b7","name":"梁叶培","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁叶培","surname":"梁","givenName":"叶培","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[]},{"id":"6901a0a1df2e836acc1b19d9","name":"梁庚贤","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁庚贤","surname":"梁","givenName":"庚贤","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[{"id":"6904f2f9367c7f552907170e","name":"梁李光","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁李光","surname":"梁","givenName":"李光","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f341367c7f2132071ac2","name":"梁锡沿","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁锡沿","surname":"梁","givenName":"锡沿","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fe58367c7ff88c07322e","name":"梁玉梅","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉梅","surname":"梁","givenName":"玉梅","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fe6b367c7f71c1073376","name":"梁玉婷","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉婷","surname":"梁","givenName":"玉婷","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fe81367c7f47850734c8","name":"梁玉洁","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉洁","surname":"梁","givenName":"玉洁","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fea2367c7f0418073624","name":"梁玉玲","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉玲","surname":"梁","givenName":"玉玲","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904febd367c7f8cb707378a","name":"梁玉娴","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉娴","surname":"梁","givenName":"玉娴","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fec9367c7f32930738fa","name":"梁玉兰","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉兰","surname":"梁","givenName":"玉兰","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]}]},{"id":"6904f308367c7fca75071812","name":"梁雨南","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁雨南","surname":"梁","givenName":"雨南","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f35e367c7f73a3071bea","name":"梁侃","fatherName":"梁雨南","parentsLabel":"梁雨南","value":{"fullName":"梁侃","surname":"梁","givenName":"侃","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨南"]},"children":[]}]},{"id":"6904f317367c7f76e8071920","name":"梁雨荣","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁雨荣","surname":"梁","givenName":"雨荣","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f37c367c7fe62f071d22","name":"梁显诚","fatherName":"梁雨荣","parentsLabel":"梁雨荣","value":{"fullName":"梁显诚","surname":"梁","givenName":"显诚","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨荣"]},"children":[]},{"id":"6904fee5367c7f0cb3073a74","name":"梁显妍","fatherName":"梁雨荣","parentsLabel":"梁雨荣","value":{"fullName":"梁显妍","surname":"梁","givenName":"显妍","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨荣"]},"children":[]}]}]}]}]},"requestId":"29f05088-1e59-4bbe-8ca9-e63b7830cce5","timestamp":1761968395254};
          treeData.value = transformApiDataToTreeData(res.data);

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
const res = {"code":200,"message":"获取姓氏家族树成功","data":{"surname":"梁","roots":["6900c968e4a8f27214f74177"],"trees":[{"id":"6900c968e4a8f27214f74177","name":"梁兆华","parentsLabel":"","value":{"fullName":"梁兆华","surname":"梁","givenName":"兆华","gender":"male","generation":27,"avatarUrl":"","spouseNames":[],"parentNames":[]},"children":[{"id":"6901a012df2e836acc1b19a6","name":"梁叶合","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁叶合","surname":"梁","givenName":"叶合","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[{"id":"690210c2bd410f1f744d3a89","name":"梁金耀","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁金耀","surname":"梁","givenName":"金耀","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"690445af367c7f1b32070984","name":"梁瑞球","fatherName":"梁金耀","parentsLabel":"梁金耀","value":{"fullName":"梁瑞球","surname":"梁","givenName":"瑞球","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁金耀"]},"children":[{"id":"69044647367c7f55a8070a0f","name":"梁智云","fatherName":"梁瑞球","parentsLabel":"梁瑞球","value":{"fullName":"梁智云","surname":"梁","givenName":"智云","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞球"]},"children":[{"id":"69057f8e367c7ffdd5075db7","name":"梁君泽","fatherName":"梁智云","parentsLabel":"梁智云","value":{"fullName":"梁君泽","surname":"梁","givenName":"君泽","gender":"male","generation":32,"avatarUrl":"","spouseNames":[],"parentNames":["梁智云"]},"children":[]}]},{"id":"6904465c367c7fedb1070a7d","name":"梁智开","fatherName":"梁瑞球","parentsLabel":"梁瑞球","value":{"fullName":"梁智开","surname":"梁","givenName":"智开","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞球"]},"children":[]}]},{"id":"6904f0a7367c7f821e070dec","name":"梁瑞庭","fatherName":"梁金耀","parentsLabel":"梁金耀","value":{"fullName":"梁瑞庭","surname":"梁","givenName":"瑞庭","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁金耀"]},"children":[{"id":"6904f0bf367c7f2664070ead","name":"梁俊杰","fatherName":"梁瑞庭","parentsLabel":"梁瑞庭","value":{"fullName":"梁俊杰","surname":"梁","givenName":"俊杰","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞庭"]},"children":[]},{"id":"6904f0cf367c7fd5d0070f3f","name":"梁俊创","fatherName":"梁瑞庭","parentsLabel":"梁瑞庭","value":{"fullName":"梁俊创","surname":"梁","givenName":"俊创","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞庭"]},"children":[]}]}]},{"id":"69036979dc46ee1c2cc019ab","name":"梁焕成","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁焕成","surname":"梁","givenName":"焕成","gender":"unknown","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"6904f0ed367c7f3a50071027","name":"梁卓敏","parentsLabel":"","value":{"fullName":"梁卓敏","surname":"梁","givenName":"卓敏","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁焕成"]},"children":[{"id":"6904f112367c7f137d0711e2","name":"梁振辉","fatherName":"梁卓敏","parentsLabel":"梁卓敏","value":{"fullName":"梁振辉","surname":"梁","givenName":"振辉","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁卓敏"]},"children":[]}]},{"id":"69057c57367c7f1f6e0751b5","name":"梁淑琴","parentsLabel":"","value":{"fullName":"梁淑琴","surname":"梁","givenName":"淑琴","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁焕成"]},"children":[]}]},{"id":"6904459e367c7fb1cc070936","name":"梁立成","fatherName":"梁叶合","parentsLabel":"梁叶合","value":{"fullName":"梁立成","surname":"梁","givenName":"立成","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁叶合"]},"children":[{"id":"6904f17a367c7f45350712a8","name":"梁瑞祥","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞祥","surname":"梁","givenName":"瑞祥","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[{"id":"69057c80367c7f79d9075343","name":"梁璋宁","fatherName":"梁瑞祥","parentsLabel":"梁瑞祥","value":{"fullName":"梁璋宁","surname":"梁","givenName":"璋宁","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞祥"]},"children":[]},{"id":"69057ed2367c7f5d94075847","name":"梁玮航","fatherName":"梁瑞祥","parentsLabel":"梁瑞祥","value":{"fullName":"梁玮航","surname":"梁","givenName":"玮航","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞祥"]},"children":[]}]},{"id":"6904f28e367c7fa1cb071450","name":"梁瑞益","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞益","surname":"梁","givenName":"瑞益","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[{"id":"69057c9a367c7f505a0754e1","name":"梁丰华","fatherName":"梁瑞益","parentsLabel":"梁瑞益","value":{"fullName":"梁丰华","surname":"梁","givenName":"丰华","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞益"]},"children":[]},{"id":"69057cec367c7fdcbc07568f","name":"梁国聪","fatherName":"梁瑞益","parentsLabel":"梁瑞益","value":{"fullName":"梁国聪","surname":"梁","givenName":"国聪","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞益"]},"children":[]}]},{"id":"6904f29c367c7f5c7c071530","name":"梁瑞欣","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞欣","surname":"梁","givenName":"瑞欣","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[{"id":"69057f0c367c7f072a075a09","name":"梁颖","fatherName":"梁瑞欣","parentsLabel":"梁瑞欣","value":{"fullName":"梁颖","surname":"梁","givenName":"颖","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞欣"]},"children":[]},{"id":"69057f1f367c7f2547075bdb","name":"梁芷怡","fatherName":"梁瑞欣","parentsLabel":"梁瑞欣","value":{"fullName":"梁芷怡","surname":"梁","givenName":"芷怡","gender":"male","generation":31,"avatarUrl":"","spouseNames":[],"parentNames":["梁瑞欣"]},"children":[]}]},{"id":"6904fe44367c7f763d0730f0","name":"梁瑞丹","fatherName":"梁立成","parentsLabel":"梁立成","value":{"fullName":"梁瑞丹","surname":"梁","givenName":"瑞丹","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁立成"]},"children":[]}]}]},{"id":"6901a07cdf2e836acc1b19b7","name":"梁叶培","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁叶培","surname":"梁","givenName":"叶培","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[]},{"id":"6901a0a1df2e836acc1b19d9","name":"梁庚贤","fatherName":"梁兆华","parentsLabel":"梁兆华","value":{"fullName":"梁庚贤","surname":"梁","givenName":"庚贤","gender":"male","generation":28,"avatarUrl":"","spouseNames":[],"parentNames":["梁兆华"]},"children":[{"id":"6904f2f9367c7f552907170e","name":"梁李光","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁李光","surname":"梁","givenName":"李光","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f341367c7f2132071ac2","name":"梁锡沿","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁锡沿","surname":"梁","givenName":"锡沿","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fe58367c7ff88c07322e","name":"梁玉梅","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉梅","surname":"梁","givenName":"玉梅","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fe6b367c7f71c1073376","name":"梁玉婷","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉婷","surname":"梁","givenName":"玉婷","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fe81367c7f47850734c8","name":"梁玉洁","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉洁","surname":"梁","givenName":"玉洁","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fea2367c7f0418073624","name":"梁玉玲","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉玲","surname":"梁","givenName":"玉玲","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904febd367c7f8cb707378a","name":"梁玉娴","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉娴","surname":"梁","givenName":"玉娴","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]},{"id":"6904fec9367c7f32930738fa","name":"梁玉兰","fatherName":"梁李光","parentsLabel":"梁李光","value":{"fullName":"梁玉兰","surname":"梁","givenName":"玉兰","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁李光"]},"children":[]}]},{"id":"6904f308367c7fca75071812","name":"梁雨南","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁雨南","surname":"梁","givenName":"雨南","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f35e367c7f73a3071bea","name":"梁侃","fatherName":"梁雨南","parentsLabel":"梁雨南","value":{"fullName":"梁侃","surname":"梁","givenName":"侃","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨南"]},"children":[]}]},{"id":"6904f317367c7f76e8071920","name":"梁雨荣","fatherName":"梁庚贤","parentsLabel":"梁庚贤","value":{"fullName":"梁雨荣","surname":"梁","givenName":"雨荣","gender":"male","generation":29,"avatarUrl":"","spouseNames":[],"parentNames":["梁庚贤"]},"children":[{"id":"6904f37c367c7fe62f071d22","name":"梁显诚","fatherName":"梁雨荣","parentsLabel":"梁雨荣","value":{"fullName":"梁显诚","surname":"梁","givenName":"显诚","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨荣"]},"children":[]},{"id":"6904fee5367c7f0cb3073a74","name":"梁显妍","fatherName":"梁雨荣","parentsLabel":"梁雨荣","value":{"fullName":"梁显妍","surname":"梁","givenName":"显妍","gender":"male","generation":30,"avatarUrl":"","spouseNames":[],"parentNames":["梁雨荣"]},"children":[]}]}]}]}]},"requestId":"29f05088-1e59-4bbe-8ca9-e63b7830cce5","timestamp":1761968395254};
          treeData.value = transformApiDataToTreeData(res.data);

  } finally {
    loading.value = false;
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

const init = async () => {
  
  await loadFamilyTree();
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

// 渲染完成

</script>

<style lang="scss" scoped>
.family-tree-page {
  position: relative;
  min-height: 100vh;
  background-color: #f5f5f5;
  z-index: 0;
}

/* 顶部统一使用 nav-bar 组件，移除旧 header 样式 */

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

