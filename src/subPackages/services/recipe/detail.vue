<template>
  <view class="recipe-detail-page">
    <!-- 顶部图片 -->
    <view class="recipe-header">
      <image class="recipe-cover" :src="recipe.image" mode="aspectFill" />
      <view class="header-overlay">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="24" color="white" />
        </view>
        <view class="action-btns">
          <view class="action-btn" @click="toggleFavorite">
            <uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="24" :color="isFavorite ? '#FF4757' : 'white'" />
          </view>
          <view class="action-btn" @click="shareRecipe">
            <uni-icons type="redo" size="24" color="white" />
          </view>
        </view>
      </view>
    </view>

    <!-- 食谱基本信息 -->
    <view class="recipe-info">
      <view class="recipe-title">
        <text class="title-text">{{ recipe.name }}</text>
        <view class="recipe-rating">
          <uni-icons type="star-filled" size="20" color="#FFD700" />
          <text class="rating-text">{{ recipe.rating }}</text>
          <text class="rating-count">({{ recipe.ratingCount }}人评价)</text>
        </view>
      </view>
      
      <text class="recipe-desc">{{ recipe.description }}</text>
      
      <view class="recipe-stats">
        <view class="stat-item">
          <uni-icons type="clock" size="20" color="#0046B4" />
          <text class="stat-label">烹饪时间</text>
          <text class="stat-value">{{ recipe.cookTime }}分钟</text>
        </view>
        <view class="stat-item">
          <uni-icons type="fire" size="20" color="#FF6B35" />
          <text class="stat-label">热量</text>
          <text class="stat-value">{{ recipe.calories }}千卡</text>
        </view>
        <view class="stat-item">
          <uni-icons type="person" size="20" color="#55CBA0" />
          <text class="stat-label">份量</text>
          <text class="stat-value">{{ recipe.servings }}人份</text>
        </view>
        <view class="stat-item">
          <uni-icons type="star" size="20" color="#8B5CF6" />
          <text class="stat-label">难度</text>
          <text class="stat-value">{{ recipe.difficulty }}</text>
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

    <!-- 食材清单 -->
    <view class="ingredients-section">
      <view class="section-header">
        <text class="section-title">🥘 食材清单</text>
        <text class="section-subtitle">准备以下食材</text>
      </view>
      
      <view class="ingredients-list">
        <view 
          class="ingredient-item" 
          v-for="(ingredient, index) in recipe.ingredients" 
          :key="index"
        >
          <view class="ingredient-checkbox" @click="toggleIngredient(index)">
            <uni-icons 
              :type="checkedIngredients[index] ? 'checkbox-filled' : 'circle'" 
              size="20" 
              :color="checkedIngredients[index] ? '#55CBA0' : '#DDD'" 
            />
          </view>
          <text class="ingredient-name" :class="{ checked: checkedIngredients[index] }">
            {{ ingredient.name }}
          </text>
          <text class="ingredient-amount">{{ ingredient.amount }}</text>
        </view>
      </view>
    </view>

    <!-- 烹饪步骤 -->
    <view class="steps-section">
      <view class="section-header">
        <text class="section-title">👨‍🍳 烹饪步骤</text>
        <text class="section-subtitle">按照步骤操作</text>
      </view>
      
      <view class="steps-list">
        <view 
          class="step-item" 
          v-for="(step, index) in recipe.steps" 
          :key="index"
        >
          <view class="step-number">
            <text class="number-text">{{ index + 1 }}</text>
          </view>
          <view class="step-content">
            <text class="step-text">{{ step.description }}</text>
            <view class="step-tips" v-if="step.tips">
              <text class="tips-text">💡 {{ step.tips }}</text>
            </view>
            <image 
              v-if="step.image" 
              class="step-image" 
              :src="step.image" 
              mode="aspectFill" 
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 营养信息 -->
    <view class="nutrition-section">
      <view class="section-header">
        <text class="section-title">📊 营养信息</text>
        <text class="section-subtitle">每份的营养含量</text>
      </view>
      
      <view class="nutrition-grid">
        <view 
          class="nutrition-item" 
          v-for="nutrition in recipe.nutrition" 
          :key="nutrition.name"
        >
          <text class="nutrition-name">{{ nutrition.name }}</text>
          <text class="nutrition-value">{{ nutrition.value }}</text>
          <text class="nutrition-unit">{{ nutrition.unit }}</text>
        </view>
      </view>
    </view>

    <!-- 小贴士 -->
    <view class="tips-section" v-if="recipe.tips && recipe.tips.length > 0">
      <view class="section-header">
        <text class="section-title">💡 小贴士</text>
      </view>
      
      <view class="tips-list">
        <view 
          class="tip-item" 
          v-for="(tip, index) in recipe.tips" 
          :key="index"
        >
          <text class="tip-text">{{ tip }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-group">
        <view class="action-btn" @click="startCooking">
          <uni-icons type="play" size="20" color="white" />
          <text class="btn-text">开始烹饪</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, onMounted, computed } from 'vue'

declare const uni: any

// 定义类型
interface Ingredient {
  name: string
  amount: string
}

interface Step {
  description: string
}

interface Nutrition {
  name: string
  value: number
  unit: string
}

interface RecipeDetail {
  id: string
  name: string
  description: string
  image: string
  cookTime: number
  difficulty: string
  rating: number
  ratingCount: number
  calories: number
  servings: number
  tags: string[]
  ingredients: Ingredient[]
  steps: Step[]
  nutrition: Nutrition[]
  tips?: string[]
}

// 响应式数据
const recipe = ref<RecipeDetail>({} as RecipeDetail)
const isFavorite = ref(false)
const checkedIngredients = ref<boolean[]>([])

// 计算属性
const progressPercentage = computed(() => {
  if (checkedIngredients.value.length === 0) return 0
  const checked = checkedIngredients.value.filter(Boolean).length
  return Math.round((checked / checkedIngredients.value.length) * 100)
})

// 生命周期
onMounted(() => {
  loadRecipeDetail()
})

// 从本地存储加载食谱详情
const loadRecipeDetail = () => {
  try {
    const storedRecipe = uni.getStorageSync('currentRecipe')
    if (storedRecipe) {
      const data = JSON.parse(storedRecipe)
      
      // 转换食材格式
      const ingredients: Ingredient[] = data.ingredients.map((ing: string) => {
        const parts = ing.split(' ')
        if (parts.length > 1) {
          return { name: parts.slice(0, -1).join(' '), amount: parts[parts.length - 1] }
        }
        return { name: ing, amount: '' }
      })
      
      // 转换步骤格式
      const steps: Step[] = data.steps.map((step: string) => ({
        description: step
      }))
      
      recipe.value = {
        id: data.id,
        name: data.name,
        description: data.description,
        image: data.image,
        cookTime: data.cookTime,
        difficulty: data.difficulty,
        rating: data.rating,
        ratingCount: Math.floor(Math.random() * 1000) + 500,
        calories: data.calories,
        servings: data.servings,
        tags: data.tags,
        ingredients,
        steps,
        nutrition: [
          { name: '蛋白质', value: Math.floor(data.calories * 0.15 / 4), unit: 'g' },
          { name: '脂肪', value: Math.floor(data.calories * 0.3 / 9), unit: 'g' },
          { name: '碳水', value: Math.floor(data.calories * 0.55 / 4), unit: 'g' }
        ],
        tips: []
      }
      
      checkedIngredients.value = new Array(ingredients.length).fill(false)
    }
  } catch (error) {
    console.error('加载食谱详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const goBack = () => {
  uni.navigateBack()
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  uni.showToast({
    title: isFavorite.value ? '已收藏' : '已取消收藏',
    icon: 'success'
  })
}

const shareRecipe = () => {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

const toggleIngredient = (index: number) => {
  checkedIngredients.value[index] = !checkedIngredients.value[index]
}

const startCooking = () => {
  uni.showToast({
    title: '开始烹饪！',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.recipe-detail-page {
  min-height: 100vh;
  background: #F8F9FA;
  padding-bottom: 120rpx;
}

.recipe-header {
  position: relative;
  height: 500rpx;
  
  .recipe-cover {
    width: 100%;
    height: 100%;
  }
  
  .header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 88rpx 32rpx 32rpx;
    
    .back-btn {
      width: 64rpx;
      height: 64rpx;
      background: rgba(0,0,0,0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .action-btns {
      display: flex;
      gap: 16rpx;
      
      .action-btn {
        width: 64rpx;
        height: 64rpx;
        background: rgba(0,0,0,0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.recipe-info {
  background: white;
  margin: -32rpx 32rpx 0;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  position: relative;
  z-index: 1;
  
  .recipe-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
    
    .title-text {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      flex: 1;
      margin-right: 24rpx;
    }
    
    .recipe-rating {
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .rating-text {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
      }
      
      .rating-count {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
  
  .recipe-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 32rpx;
    display: block;
  }
  
  .recipe-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    margin-bottom: 32rpx;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      
      .stat-label {
        font-size: 24rpx;
        color: #666;
        margin: 8rpx 0 4rpx;
      }
      
      .stat-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
      }
    }
  }
  
  .recipe-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    
    .recipe-tag {
      padding: 12rpx 20rpx;
      background: #F0F9FF;
      color: #0046B4;
      font-size: 24rpx;
      border-radius: 20rpx;
    }
  }
}

.section-header {
  margin-bottom: 24rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
    display: block;
  }
  
  .section-subtitle {
    font-size: 26rpx;
    color: #666;
  }
}

.ingredients-section {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .ingredients-list {
    .ingredient-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #F0F0F0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .ingredient-checkbox {
        margin-right: 20rpx;
      }
      
      .ingredient-name {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        
        &.checked {
          text-decoration: line-through;
          color: #999;
        }
      }
      
      .ingredient-amount {
        font-size: 26rpx;
        color: #666;
        margin-left: 16rpx;
      }
    }
  }
}

.steps-section {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .steps-list {
    .step-item {
      display: flex;
      margin-bottom: 32rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .step-number {
        width: 60rpx;
        height: 60rpx;
        background: #0046B4;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        flex-shrink: 0;
        
        .number-text {
          color: white;
          font-size: 28rpx;
          font-weight: 600;
        }
      }
      
      .step-content {
        flex: 1;
        
        .step-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.6;
          margin-bottom: 12rpx;
          display: block;
        }
        
        .step-tips {
          margin-bottom: 16rpx;
          
          .tips-text {
            font-size: 24rpx;
            color: #666;
            background: #FFF7E6;
            padding: 12rpx 16rpx;
            border-radius: 12rpx;
            display: block;
          }
        }
        
        .step-image {
          width: 100%;
          height: 200rpx;
          border-radius: 12rpx;
        }
      }
    }
  }
}

.nutrition-section {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
    
    .nutrition-item {
      text-align: center;
      padding: 20rpx;
      background: #F8F9FA;
      border-radius: 12rpx;
      
      .nutrition-name {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 8rpx;
        display: block;
      }
      
      .nutrition-value {
        font-size: 32rpx;
        color: #333;
        font-weight: 600;
        margin-bottom: 4rpx;
        display: block;
      }
      
      .nutrition-unit {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}

.tips-section {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .tips-list {
    .tip-item {
      padding: 16rpx 0;
      border-bottom: 1rpx solid #F0F0F0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .tip-text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
        display: block;
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #F0F0F0;
  
  .action-group {
    .action-btn {
      width: 100%;
      height: 88rpx;
      background: #0046B4;
      border-radius: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16rpx;
      
      .btn-text {
        color: white;
        font-size: 32rpx;
        font-weight: 600;
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 750rpx) {
  .recipe-stats {
    grid-template-columns: 1fr;
  }
  
  .nutrition-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 