<template>
  <view class="recipe-page">
    <shareApp v-if="isH5" :goDefault="true"></shareApp>
    <NavBar 
        v-else
        :custom-style="{position: 'sticky', color: '#fff'}" 
        :custom-go-back="true"
        title="食谱"  
        custom-class="light"
        @back="goBack"
        bgColor="#062577" />
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <view class="search-container">
        <view class="search-input-wrapper">
          <uni-icons type="search" size="20" color="#999" />
          <input 
            class="search-input" 
            v-model="searchKeyword" 
            placeholder="搜索食谱、食材..."
            @input="handleSearch"
            @confirm="handleSearchConfirm"
          />
          <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
            <uni-icons type="close" size="16" color="#999" />
          </view>
        </view>
        <view class="search-btn" @click="handleSearchConfirm">
          搜索
        </view>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <scroll-view class="tabs-scroll" scroll-x="true" show-scrollbar="false">
        <view class="tabs-container">
          <view 
            class="tab-item" 
            :class="{ active: activeCategory === category.id }"
            v-for="category in categories" 
            :key="category.id"
            @click="selectCategory(category)"
          >
            <text class="tab-text">{{ category.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 食材筛选 -->
    <view class="ingredient-filter">
      <view class="filter-header">
        <text class="filter-title">🥘 食材筛选</text>
        <view class="filter-mode">
          <text class="mode-label">搜索模式:</text>
          <view class="mode-switch">
            <view 
              class="mode-btn" 
              :class="{ active: searchMode === 'fuzzy' }"
              @click="setSearchMode('fuzzy')"
            >
              模糊
            </view>
            <view 
              class="mode-btn" 
              :class="{ active: searchMode === 'strict' }"
              @click="setSearchMode('strict')"
            >
              严格
            </view>
          </view>
        </view>
      </view>
      
      <view class="ingredient-input-section">
        <view class="ingredient-input-wrapper">
          <uni-icons type="plus" size="20" color="#0046B4" />
          <input 
            class="ingredient-input" 
            v-model="currentIngredient" 
            placeholder="输入食材名称..."
            @confirm="addIngredient"
          />
          <view class="add-btn" @click="addIngredient">
            添加
          </view>
        </view>
      </view>
      
      <view class="selected-ingredients" v-if="selectedIngredients.length > 0">
        <view class="ingredients-tags">
          <view 
            class="ingredient-tag" 
            v-for="(ingredient, index) in selectedIngredients" 
            :key="index"
          >
            <text class="tag-text">{{ ingredient }}</text>
            <view class="remove-btn" @click="removeIngredient(index)">
              <uni-icons type="close" size="14" color="#999" />
            </view>
          </view>
        </view>
        <view class="clear-all" @click="clearAllIngredients">
          <text class="clear-text">清空全部</text>
        </view>
      </view>
      
      <view class="filter-options">
        <view class="option-item">
          <view class="option-label">
            <text class="label-text">包含所有食材</text>
            <text class="label-desc">(必须包含所有选择的食材)</text>
          </view>
          <switch 
            :checked="includeAllIngredients" 
            @change="toggleIncludeAllIngredients"
            color="#0046B4"
          />
        </view>
        <view class="option-item">
          <view class="option-label">
            <text class="label-text">显示匹配度</text>
            <text class="label-desc">(显示食材匹配百分比)</text>
          </view>
          <switch 
            :checked="showMatchPercentage" 
            @change="toggleShowMatchPercentage"
            color="#0046B4"
          />
        </view>
      </view>
    </view>

    <!-- 热门推荐 -->
    <view class="hot-recommend" v-if="!searchKeyword && activeCategory === 'all'">
      <view class="section-title">
        <text class="title-text">🔥 热门推荐</text>
      </view>
      <view class="hot-grid">
        <view 
          class="hot-item" 
          v-for="recipe in hotRecipes" 
          :key="recipe.id"
          @click="goToRecipeDetail(recipe)"
        >
          <image class="hot-image" :src="recipe.image" mode="aspectFill" />
          <view class="hot-info">
            <text class="hot-name">{{ recipe.name }}</text>
            <view class="hot-stats">
              <text class="stats-item">{{ recipe.cookTime }}分钟</text>
              <text class="stats-item">{{ recipe.difficulty }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 食谱列表 -->
    <view class="recipe-list">
      <view class="section-title" v-if="!searchKeyword">
        <text class="title-text">{{ getCategoryTitle() }}</text>
        <text class="recipe-count">{{ filteredRecipes.length }}道菜</text>
      </view>
      
      <view class="list-container">
        <view 
          class="recipe-card" 
          v-for="recipe in filteredRecipes" 
          :key="recipe.id"
          @click="goToRecipeDetail(recipe)"
        >
          <image class="recipe-image" :src="recipe.image" mode="aspectFill" />
                     <view class="recipe-content">
             <view class="recipe-header">
               <text class="recipe-name">{{ recipe.name }}</text>
               <view class="recipe-rating">
                 <uni-icons type="star-filled" size="14" color="#FFD700" />
                 <text class="rating-text">{{ recipe.rating }}</text>
               </view>
             </view>
             
             <!-- 食材匹配度 -->
             <view class="ingredient-match" v-if="showMatchPercentage && selectedIngredients.length > 0">
               <view class="match-bar">
                 <view class="match-fill" :style="{ width: getMatchPercentage(recipe) + '%' }"></view>
               </view>
               <text class="match-text">{{ getMatchPercentage(recipe) }}% 食材匹配</text>
             </view>
            
            <text class="recipe-desc">{{ recipe.description }}</text>
            
            <view class="recipe-meta">
              <view class="meta-item">
                <uni-icons type="clock" size="14" color="#666" />
                <text class="meta-text">{{ recipe.cookTime }}分钟</text>
              </view>
              <view class="meta-item">
                <uni-icons type="fire" size="14" color="#FF6B35" />
                <text class="meta-text">{{ recipe.calories }}千卡</text>
              </view>
              <view class="meta-item">
                <uni-icons type="person" size="14" color="#666" />
                <text class="meta-text">{{ recipe.servings }}人份</text>
              </view>
            </view>
            
            <view class="recipe-tags">
              <text 
                class="recipe-tag" 
                v-for="tag in recipe.tags" 
                :key="tag"
              >
                {{ tag }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredRecipes.length === 0 && searchKeyword">
      <image class="empty-image" src="/static/image/empty.svg" mode="aspectFit" />
      <text class="empty-text">没有找到相关食谱</text>
      <text class="empty-desc">试试其他关键词或分类</text>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && filteredRecipes.length > 0">
      <view class="load-btn" @click="loadMore">
        <text class="load-text">加载更多</text>
        <uni-icons type="down" size="16" color="#0046B4" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, computed, onMounted } from 'vue'
import appDsBridge from '@/utilsH5/appDsBridge'
import { isYinheAppEnv } from '@/utilsH5/env'
import { getSystemInfo } from '@/utils/env';
import NavBar from '@/components/nav-bar-base.vue';

declare const uni: any

// 定义类型
interface Recipe {
  id: string
  name: string
  description: string
  image: string
  cookTime: number
  difficulty: string
  rating: number
  calories: number
  servings: number
  tags: string[]
  category: string
  ingredients: string[]
  steps: string[]
}

interface Category {
  id: string
  name: string
  icon: string
}

// 响应式数据
const searchKeyword = ref('')
const activeCategory = ref('all')
const allRecipes = ref<Recipe[]>([]) // 所有食谱数据
const hotRecipes = ref<Recipe[]>([])
const hasMore = ref(false)

// 食材筛选相关数据
const currentIngredient = ref('')
const selectedIngredients = ref<string[]>([])
const searchMode = ref<'fuzzy' | 'strict'>('fuzzy')
const includeAllIngredients = ref(false)
const showMatchPercentage = ref(true)

// 分类数据
const categories = ref<Category[]>([
  { id: 'all', name: '全部', icon: '🍽️' },
  { id: 'meat', name: '肉类', icon: '🥩' },
  { id: 'seafood', name: '海鲜', icon: '🦐' },
  { id: 'vegetable', name: '素菜', icon: '🥗' },
  { id: 'soup', name: '汤羹', icon: '🍲' },
  { id: 'staple', name: '主食', icon: '🍚' },
  { id: 'dessert', name: '甜点', icon: '🍰' },
  { id: 'drink', name: '饮品', icon: '🥤' }
])

// 中文静态食谱数据（使用 Unsplash 免费图片）
const recipeData: Recipe[] = [
  {
    id: '1', name: '红烧肉', category: 'meat',
    description: '经典美味的红烧肉，肥而不腻，入口即化',
    image: 'https://images.unsplash.com/photo-1623595119708-26b1f7300075?w=400&q=80',
    cookTime: 60, difficulty: '中等', rating: 4.8, calories: 450, servings: 4,
    tags: ['家常菜', '肉类', '红烧'],
    ingredients: ['五花肉 500g', '生抽 2勺', '老抽 1勺', '料酒 2勺', '冰糖 30g', '葱姜蒜'],
    steps: ['五花肉切块焯水', '炒糖色', '放入五花肉翻炒', '加调料和水', '小火炖煮1小时', '大火收汁']
  },
  {
    id: '2', name: '宫保鸡丁', category: 'meat',
    description: '川菜经典，鸡肉嫩滑，花生香脆，麻辣鲜香',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=80',
    cookTime: 25, difficulty: '简单', rating: 4.6, calories: 320, servings: 3,
    tags: ['川菜', '鸡肉', '快手菜'],
    ingredients: ['鸡胸肉 300g', '花生米 50g', '干辣椒', '花椒', '葱姜蒜', '生抽', '醋'],
    steps: ['鸡肉切丁腌制', '炸花生米备用', '爆香辣椒花椒', '炒鸡丁', '加调料翻炒', '放花生米出锅']
  },
  {
    id: '3', name: '番茄炒蛋', category: 'vegetable',
    description: '简单易做的家常菜，酸甜可口，营养丰富',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    cookTime: 10, difficulty: '简单', rating: 4.4, calories: 180, servings: 2,
    tags: ['家常菜', '快手菜', '下饭'],
    ingredients: ['番茄 2个', '鸡蛋 3个', '葱花', '盐', '糖'],
    steps: ['番茄切块', '鸡蛋打散炒熟盛出', '炒番茄出汁', '放入鸡蛋', '加盐糖调味', '撒葱花出锅']
  },
  {
    id: '4', name: '糖醋排骨', category: 'meat',
    description: '酸甜可口，外酥里嫩，色泽红亮',
    image: 'https://images.unsplash.com/photo-1544025162-d76978e8e5e0?w=400&q=80',
    cookTime: 40, difficulty: '中等', rating: 4.7, calories: 420, servings: 3,
    tags: ['家常菜', '肉类', '糖醋'],
    ingredients: ['排骨 500g', '白糖', '醋', '生抽', '料酒', '姜片'],
    steps: ['排骨焯水', '油炸至金黄', '调糖醋汁', '倒入排骨翻炒', '收汁装盘', '撒芝麻点缀']
  },
  {
    id: '5', name: '麻婆豆腐', category: 'vegetable',
    description: '川菜代表，麻辣鲜香，豆腐嫩滑',
    image: 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=400&q=80',
    cookTime: 20, difficulty: '简单', rating: 4.5, calories: 220, servings: 2,
    tags: ['川菜', '豆腐', '下饭菜'],
    ingredients: ['豆腐 1块', '肉末 100g', '豆瓣酱', '花椒粉', '葱花', '生抽'],
    steps: ['豆腐切块焯水', '炒肉末', '加豆瓣酱炒香', '放入豆腐', '加水煮入味', '勾芡撒花椒粉']
  },
  {
    id: '6', name: '清蒸鲈鱼', category: 'seafood',
    description: '鲜嫩爽滑，原汁原味，营养健康',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
    cookTime: 20, difficulty: '简单', rating: 4.7, calories: 180, servings: 3,
    tags: ['海鲜', '清蒸', '健康'],
    ingredients: ['鲈鱼 1条', '葱姜丝', '蒸鱼豉油', '料酒', '油'],
    steps: ['鱼处理干净', '放葱姜料酒腌制', '大火蒸8分钟', '倒掉汤汁', '放葱姜丝淋热油', '浇蒸鱼豉油']
  },
  {
    id: '7', name: '蒜蓉虾', category: 'seafood',
    description: '蒜香浓郁，虾肉鲜嫩，简单美味',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&q=80',
    cookTime: 15, difficulty: '简单', rating: 4.6, calories: 200, servings: 2,
    tags: ['海鲜', '蒜蓉', '快手菜'],
    ingredients: ['大虾 300g', '蒜末', '葱花', '生抽', '料酒', '油'],
    steps: ['虾开背去虾线', '蒜末炒香', '放入虾煎至变色', '加料酒生抽', '翻炒均匀', '撒葱花出锅']
  },
  {
    id: '8', name: '酸辣土豆丝', category: 'vegetable',
    description: '爽脆可口，酸辣开胃，下饭神器',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80',
    cookTime: 15, difficulty: '简单', rating: 4.4, calories: 120, servings: 2,
    tags: ['家常菜', '素菜', '快手菜'],
    ingredients: ['土豆 2个', '干辣椒', '醋', '花椒', '葱蒜'],
    steps: ['土豆切丝泡水', '热锅爆香花椒辣椒', '下土豆丝快炒', '加醋调味', '翻炒断生', '出锅装盘']
  },
  {
    id: '9', name: '蛋炒饭', category: 'staple',
    description: '简单快手，粒粒分明，香气四溢',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
    cookTime: 10, difficulty: '简单', rating: 4.3, calories: 380, servings: 1,
    tags: ['主食', '快手菜', '家常'],
    ingredients: ['米饭 1碗', '鸡蛋 2个', '葱花', '盐', '油'],
    steps: ['鸡蛋打散', '热锅炒蛋', '加入米饭翻炒', '加盐调味', '炒至粒粒分明', '撒葱花出锅']
  },
  {
    id: '10', name: '西红柿蛋汤', category: 'soup',
    description: '酸甜开胃，营养丰富，老少皆宜',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    cookTime: 15, difficulty: '简单', rating: 4.5, calories: 100, servings: 3,
    tags: ['汤羹', '快手菜', '健康'],
    ingredients: ['番茄 2个', '鸡蛋 2个', '葱花', '盐', '香油'],
    steps: ['番茄切块', '热锅炒番茄出汁', '加水煮开', '淋入蛋液', '加盐调味', '滴香油撒葱花']
  },
  {
    id: '11', name: '可乐鸡翅', category: 'meat',
    description: '甜香入味，色泽诱人，老少皆宜',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80',
    cookTime: 30, difficulty: '简单', rating: 4.6, calories: 350, servings: 3,
    tags: ['家常菜', '鸡肉', '甜口'],
    ingredients: ['鸡翅 8个', '可乐 1罐', '生抽', '姜片', '葱段'],
    steps: ['鸡翅划刀焯水', '煎至两面金黄', '加姜葱炒香', '倒入可乐和生抽', '小火炖煮', '大火收汁']
  },
  {
    id: '12', name: '青椒肉丝', category: 'meat',
    description: '家常下饭菜，肉嫩椒脆，简单美味',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    cookTime: 15, difficulty: '简单', rating: 4.4, calories: 280, servings: 2,
    tags: ['家常菜', '快手菜', '下饭'],
    ingredients: ['猪肉 200g', '青椒 2个', '葱姜蒜', '生抽', '淀粉'],
    steps: ['肉切丝腌制', '青椒切丝', '热锅炒肉丝', '加青椒翻炒', '调味出锅']
  },
  {
    id: '13', name: '红烧茄子', category: 'vegetable',
    description: '软糯入味，酱香浓郁，超级下饭',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    cookTime: 20, difficulty: '简单', rating: 4.5, calories: 200, servings: 2,
    tags: ['家常菜', '素菜', '下饭'],
    ingredients: ['茄子 2根', '蒜末', '生抽', '老抽', '糖', '淀粉'],
    steps: ['茄子切条', '油炸至软', '蒜末爆香', '加调料和水', '放入茄子', '收汁装盘']
  },
  {
    id: '14', name: '紫菜蛋花汤', category: 'soup',
    description: '清淡鲜美，营养快手，简单易做',
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80',
    cookTime: 10, difficulty: '简单', rating: 4.3, calories: 80, servings: 2,
    tags: ['汤羹', '快手菜', '健康'],
    ingredients: ['紫菜', '鸡蛋 1个', '葱花', '盐', '香油'],
    steps: ['水烧开', '放入紫菜', '淋入蛋液', '加盐调味', '滴香油', '撒葱花出锅']
  },
  {
    id: '15', name: '珍珠奶茶', category: 'drink',
    description: '台式经典饮品，Q弹珍珠，奶香浓郁',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&q=80',
    cookTime: 30, difficulty: '中等', rating: 4.7, calories: 350, servings: 2,
    tags: ['饮品', '奶茶', '甜品'],
    ingredients: ['红茶', '牛奶', '珍珠', '黑糖', '冰块'],
    steps: ['煮珍珠至透明', '泡红茶', '加入牛奶', '放黑糖调味', '加冰块', '放入珍珠']
  },
  {
    id: '16', name: '双皮奶', category: 'dessert',
    description: '香滑细腻，奶香浓郁，经典甜品',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    cookTime: 40, difficulty: '中等', rating: 4.8, calories: 200, servings: 3,
    tags: ['甜点', '广式', '奶制品'],
    ingredients: ['牛奶 500ml', '蛋清 2个', '糖 30g'],
    steps: ['牛奶煮开放凉结皮', '蛋清加糖打匀', '混合牛奶', '过滤入碗', '蒸15分钟', '冷藏后食用']
  }
]

// 计算属性 - 根据搜索和分类过滤食谱
const recipes = computed(() => allRecipes.value)

const filteredRecipes = computed(() => {
  let filtered = allRecipes.value
  
  // 按分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(recipe => recipe.category === activeCategory.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(recipe => 
      recipe.name.includes(keyword) ||
      recipe.description.includes(keyword) ||
      recipe.tags.some(tag => tag.includes(keyword)) ||
      recipe.ingredients.some(ingredient => ingredient.includes(keyword))
    )
  }
  
  // 按食材筛选
  if (selectedIngredients.value.length > 0) {
    filtered = filtered.filter(recipe => {
      if (includeAllIngredients.value) {
        return selectedIngredients.value.every(selected => 
          recipe.ingredients.some(ingredient => ingredient.includes(selected))
        )
      } else {
        return selectedIngredients.value.some(selected => 
          recipe.ingredients.some(ingredient => ingredient.includes(selected))
        )
      }
    })
  }
  
  return filtered
})

const isH5 = ref(false)
function init() {
  if(isYinheAppEnv()) { 
    appDsBridge.hideNavigationBarSyn('1')
  } else if(getSystemInfo()?.hostName !== 'WeChat'){
    isH5.value = true;
  }
}

const goBack = () => {
  if(isYinheAppEnv()) {
    appDsBridge.backToAppPreView()
  } else {
    uni.navigateBack()
  }
}

// 生命周期
onMounted(() => {
  init()
  loadRecipes()
})

// 加载食谱数据
const loadRecipes = () => {
  allRecipes.value = recipeData
  hotRecipes.value = recipeData.slice(0, 3)
}

// 搜索处理
const handleSearch = () => {
  // 本地搜索，无需防抖
}

const handleSearchConfirm = () => {
  // 本地搜索，直接通过 computed 过滤
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const selectCategory = (category: Category) => {
  activeCategory.value = category.id
}

const getCategoryTitle = () => {
  if (activeCategory.value === 'all') return '全部食谱'
  const category = categories.value.find(c => c.id === activeCategory.value)
  return category ? category.name : '食谱'
}

const goToRecipeDetail = (recipe: Recipe) => {
  // 将食谱数据存储到本地，详情页读取
  uni.setStorageSync('currentRecipe', JSON.stringify(recipe))
  uni.navigateTo({
    url: `/subPackages/services/recipe/detail?id=${recipe.id}`
  })
}

const loadMore = () => {
  hasMore.value = false
}

// 食材筛选相关方法
const addIngredient = () => {
  if (currentIngredient.value.trim()) {
    const ingredient = currentIngredient.value.trim()
    if (!selectedIngredients.value.includes(ingredient)) {
      selectedIngredients.value.push(ingredient)
    }
    currentIngredient.value = ''
  }
}

const removeIngredient = (index: number) => {
  selectedIngredients.value.splice(index, 1)
}

const clearAllIngredients = () => {
  selectedIngredients.value = []
}

const setSearchMode = (mode: 'fuzzy' | 'strict') => {
  searchMode.value = mode
}

const toggleIncludeAllIngredients = (e: any) => {
  includeAllIngredients.value = e.detail.value
}

const toggleShowMatchPercentage = (e: any) => {
  showMatchPercentage.value = e.detail.value
}

// 计算食材匹配度
const getMatchPercentage = (recipe: Recipe) => {
  if (selectedIngredients.value.length === 0) return 100
  
  let matchCount = 0
  selectedIngredients.value.forEach(selected => {
    if (recipe.ingredients.some(ingredient => ingredient.includes(selected))) {
      matchCount++
    }
  })
  
  return Math.round((matchCount / selectedIngredients.value.length) * 100)
}
</script>

<style lang="scss" scoped>
.recipe-page {
  min-height: 100vh;
  background: #F8F9FA;
}

.search-header {
  background: white;
  padding: 20rpx 32rpx;
  border-bottom: 1rpx solid #F0F0F0;
  
  .search-container {
    display: flex;
    align-items: center;
    gap: 24rpx;
    
    .search-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      background: #F8F9FA;
      border-radius: 24rpx;
      padding: 20rpx 24rpx;
      position: relative;
      
      .search-input {
        flex: 1;
        margin-left: 16rpx;
        font-size: 28rpx;
        color: #333;
        
        &::placeholder {
          color: #999;
        }
      }
      
      .clear-btn {
        padding: 8rpx;
        margin-left: 16rpx;
      }
    }
    
    .search-btn {
      padding: 20rpx 32rpx;
      background: #0046B4;
      color: white;
      border-radius: 24rpx;
      font-size: 28rpx;
      font-weight: 500;
    }
  }
}

.category-tabs {
  background: white;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
  
  .tabs-scroll {
    white-space: nowrap;
    
    .tabs-container {
      display: flex;
      padding: 0 32rpx;
      gap: 32rpx;
      
      .tab-item {
        padding: 16rpx 32rpx;
        border-radius: 24rpx;
        background: #F8F9FA;
        transition: all 0.3s ease;
        white-space: nowrap;
        
        &.active {
          background: #0046B4;
          color: white;
        }
        
        .tab-text {
          font-size: 28rpx;
          font-weight: 500;
        }
      }
    }
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  
  .title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .recipe-count {
    font-size: 26rpx;
    color: #666;
  }
}

.hot-recommend {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .hot-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
    
    .hot-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      
      .hot-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
      }
      
      .hot-info {
        .hot-name {
          font-size: 26rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .hot-stats {
          display: flex;
          flex-direction: column;
          gap: 4rpx;
          
          .stats-item {
            font-size: 22rpx;
            color: #666;
          }
        }
      }
    }
  }
}

.recipe-list {
  .list-container {
    padding: 0 32rpx;
    
    .recipe-card {
      background: white;
      border-radius: 16rpx;
      margin-bottom: 24rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
      
      .recipe-image {
        width: 100%;
        height: 320rpx;
      }
      
      .recipe-content {
        padding: 24rpx;
        
        .recipe-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16rpx;
          
          .recipe-name {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
            flex: 1;
          }
          
          .recipe-rating {
            display: flex;
            align-items: center;
            gap: 8rpx;
            
            .rating-text {
              font-size: 26rpx;
              color: #666;
            }
          }
        }
        
        .recipe-desc {
          font-size: 26rpx;
          color: #666;
          line-height: 1.5;
          margin-bottom: 20rpx;
          display: block;
        }
        
        .recipe-meta {
          display: flex;
          gap: 32rpx;
          margin-bottom: 20rpx;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8rpx;
            
            .meta-text {
              font-size: 24rpx;
              color: #666;
            }
          }
        }
        
        .recipe-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12rpx;
          
          .recipe-tag {
            padding: 8rpx 16rpx;
            background: #F0F9FF;
            color: #0046B4;
            font-size: 22rpx;
            border-radius: 16rpx;
          }
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 32rpx;
  
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 32rpx;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: #999;
  }
}

.load-more {
  padding: 48rpx 32rpx;
  text-align: center;
  
  .load-btn {
    display: inline-flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx 48rpx;
    background: white;
    border: 2rpx solid #E5E7EB;
    border-radius: 24rpx;
    
    .load-text {
      font-size: 28rpx;
      color: #0046B4;
    }
  }
}

// 食材筛选样式
.ingredient-filter {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .filter-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .filter-mode {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .mode-label {
        font-size: 24rpx;
        color: #666;
      }
      
      .mode-switch {
        display: flex;
        background: #F8F9FA;
        border-radius: 20rpx;
        padding: 4rpx;
        
        .mode-btn {
          padding: 8rpx 16rpx;
          border-radius: 16rpx;
          font-size: 24rpx;
          color: #666;
          transition: all 0.3s ease;
          
          &.active {
            background: #0046B4;
            color: white;
          }
        }
      }
    }
  }
  
  .ingredient-input-section {
    margin-bottom: 24rpx;
    
    .ingredient-input-wrapper {
      display: flex;
      align-items: center;
      background: #F8F9FA;
      border-radius: 24rpx;
      padding: 20rpx 24rpx;
      gap: 16rpx;
      
      .ingredient-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        
        &::placeholder {
          color: #999;
        }
      }
      
      .add-btn {
        padding: 12rpx 24rpx;
        background: #0046B4;
        color: white;
        border-radius: 20rpx;
        font-size: 26rpx;
        font-weight: 500;
      }
    }
  }
  
  .selected-ingredients {
    margin-bottom: 24rpx;
    
    .ingredients-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      margin-bottom: 16rpx;
      
      .ingredient-tag {
        display: flex;
        align-items: center;
        gap: 12rpx;
        padding: 12rpx 20rpx;
        background: #F0F9FF;
        color: #0046B4;
        border-radius: 20rpx;
        font-size: 26rpx;
        
        .remove-btn {
          padding: 4rpx;
        }
      }
    }
    
    .clear-all {
      text-align: center;
      
      .clear-text {
        font-size: 26rpx;
        color: #999;
        text-decoration: underline;
      }
    }
  }
  
  .filter-options {
    .option-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #F0F0F0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .option-label {
        .label-text {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 4rpx;
          display: block;
        }
        
        .label-desc {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}

// 食材匹配度样式
.ingredient-match {
  margin-bottom: 16rpx;
  
  .match-bar {
    width: 100%;
    height: 8rpx;
    background: #F0F0F0;
    border-radius: 4rpx;
    overflow: hidden;
    margin-bottom: 8rpx;
    
    .match-fill {
      height: 100%;
      background: linear-gradient(90deg, #55CBA0 0%, #0046B4 100%);
      border-radius: 4rpx;
      transition: width 0.3s ease;
    }
  }
  
  .match-text {
    font-size: 24rpx;
    color: #666;
  }
}

// 响应式设计
@media screen and (max-width: 750rpx) {
  .hot-recommend .hot-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ingredient-filter .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16rpx;
  }
}
</style>
