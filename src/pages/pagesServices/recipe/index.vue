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
            placeholder="搜索食谱、食材、做法..."
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
import { isYinheAppEnv, getAppTokenFromSession } from '@/utilsH5/env'
import { getSystemInfo } from '@/utils/env';
import NavBar from '@/components/nav-bar-base.vue';
// 声明uni全局对象
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
const recipes = ref<Recipe[]>([])
const hotRecipes = ref<Recipe[]>([])
const hasMore = ref(true)
const currentPage = ref(1)

// 食材筛选相关数据
const currentIngredient = ref('')
const selectedIngredients = ref<string[]>([])
const searchMode = ref<'fuzzy' | 'strict'>('fuzzy')
const includeAllIngredients = ref(false)
const showMatchPercentage = ref(true)

// 分类数据
const categories = ref<Category[]>([
  { id: 'all', name: '全部', icon: '🍽️' },
  { id: 'chinese', name: '中餐', icon: '🥢' },
  { id: 'western', name: '西餐', icon: '🍴' },
  { id: 'japanese', name: '日料', icon: '🍱' },
  { id: 'korean', name: '韩料', icon: '🍜' },
  { id: 'dessert', name: '甜点', icon: '🍰' },
  { id: 'drink', name: '饮品', icon: '🥤' },
  { id: 'snack', name: '小吃', icon: '🍿' }
])

// 计算属性
const filteredRecipes = computed(() => {
  let filtered = recipes.value
  
  // 按分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(recipe => recipe.category === activeCategory.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(recipe => 
      recipe.name.toLowerCase().includes(keyword) ||
      recipe.description.toLowerCase().includes(keyword) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(keyword))
    )
  }
  
  // 按食材筛选
  if (selectedIngredients.value.length > 0) {
    filtered = filtered.filter(recipe => {
      if (includeAllIngredients.value) {
        // 严格模式：必须包含所有选择的食材
        return selectedIngredients.value.every(selected => 
          recipe.ingredients.some(ingredient => 
            searchMode.value === 'strict' 
              ? ingredient.toLowerCase() === selected.toLowerCase()
              : ingredient.toLowerCase().includes(selected.toLowerCase())
          )
        )
      } else {
        // 宽松模式：包含任意一个选择的食材即可
        return selectedIngredients.value.some(selected => 
          recipe.ingredients.some(ingredient => 
            searchMode.value === 'strict' 
              ? ingredient.toLowerCase() === selected.toLowerCase()
              : ingredient.toLowerCase().includes(selected.toLowerCase())
          )
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
  }else {
    uni.navigateBack()
  }
}

// 生命周期
onMounted(() => {
  loadRecipes()
  loadHotRecipes()
})

// 方法
const loadRecipes = () => {
  // 模拟数据加载
  const mockRecipes: Recipe[] = [
    {
      id: '1',
      name: '红烧肉',
      description: '经典美味的红烧肉，肥而不腻，入口即化',
      image: '/static/image/home/cooking.jpg',
      cookTime: 60,
      difficulty: '中等',
      rating: 4.8,
      calories: 450,
      servings: 4,
      tags: ['家常菜', '肉类', '红烧'],
      category: 'chinese',
      ingredients: ['五花肉', '生抽', '老抽', '料酒', '冰糖', '葱姜蒜'],
      steps: ['五花肉切块', '焯水去腥', '炒糖色', '加入调料', '炖煮收汁']
    },
    {
      id: '2',
      name: '宫保鸡丁',
      description: '川菜经典，鸡肉嫩滑，花生香脆，麻辣鲜香',
      image: '/static/image/home/cooking.jpg',
      cookTime: 30,
      difficulty: '简单',
      rating: 4.6,
      calories: 320,
      servings: 3,
      tags: ['川菜', '鸡肉', '快手菜'],
      category: 'chinese',
      ingredients: ['鸡胸肉', '花生米', '干辣椒', '花椒', '生抽', '醋'],
      steps: ['鸡肉切丁', '腌制入味', '炒制花生', '爆炒鸡丁', '调味出锅']
    },
    {
      id: '3',
      name: '番茄炒蛋',
      description: '简单易做的家常菜，酸甜可口，营养丰富',
      image: '/static/image/home/liucheng.svg',
      cookTime: 15,
      difficulty: '简单',
      rating: 4.4,
      calories: 180,
      servings: 2,
      tags: ['家常菜', '素菜', '快手菜'],
      category: 'chinese',
      ingredients: ['番茄', '鸡蛋', '葱花', '盐', '糖'],
      steps: ['番茄切块', '鸡蛋打散', '炒制鸡蛋', '加入番茄', '调味出锅']
    },
    {
      id: '4',
      name: '意大利面',
      description: '经典意式料理，面条劲道，酱汁浓郁',
      image: '/static/image/home/shuishou.svg',
      cookTime: 25,
      difficulty: '中等',
      rating: 4.5,
      calories: 380,
      servings: 2,
      tags: ['西餐', '面食', '意式'],
      category: 'western',
      ingredients: ['意大利面', '番茄', '洋葱', '蒜末', '橄榄油', '罗勒'],
      steps: ['煮面', '炒制酱料', '混合面条', '调味装盘']
    },
    {
      id: '5',
      name: '提拉米苏',
      description: '经典意式甜点，咖啡香浓，口感细腻',
      image: '/static/image/home/youshi.svg',
      cookTime: 45,
      difficulty: '困难',
      rating: 4.9,
      calories: 280,
      servings: 6,
      tags: ['甜点', '意式', '咖啡'],
      category: 'dessert',
      ingredients: ['马斯卡彭奶酪', '手指饼干', '咖啡', '鸡蛋', '糖', '可可粉'],
      steps: ['制作奶酪糊', '浸泡饼干', '层层叠加', '冷藏定型', '撒可可粉']
    }
  ]
  
  recipes.value = mockRecipes
}

const loadHotRecipes = () => {
  // 模拟热门食谱数据
  hotRecipes.value = recipes.value.slice(0, 3)
}

const handleSearch = () => {
  // 实时搜索逻辑
  if (searchKeyword.value.length > 0) {
    // 可以在这里添加防抖搜索
  }
}

const handleSearchConfirm = () => {
  if (searchKeyword.value.trim()) {
    // 执行搜索
    console.log('搜索关键词:', searchKeyword.value)
  }
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
  // 跳转到食谱详情页
  uni.navigateTo({
    url: `/pages/pagesServices/recipe/detail?id=${recipe.id}`
  })
}

const loadMore = () => {
  // 加载更多食谱
  currentPage.value++
  // 这里可以调用API加载更多数据
  hasMore.value = false // 暂时设置为false
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
    const hasMatch = recipe.ingredients.some(ingredient => {
      if (searchMode.value === 'strict') {
        return ingredient.toLowerCase() === selected.toLowerCase()
      } else {
        return ingredient.toLowerCase().includes(selected.toLowerCase())
      }
    })
    if (hasMatch) matchCount++
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
