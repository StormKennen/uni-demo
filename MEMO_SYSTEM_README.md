# 备忘录系统实现文档

## 📋 概述

已完成从图文编辑器到完整备忘录管理系统的转换，包含列表视图、文件夹导航、预览/编辑模式切换等功能。

## 🏗️ 系统架构

### 后端 API (express-mongo-docker)

#### 数据模型
- **`memo.model.js`** - 备忘录数据模型
  - 字段：name, title, content, tags, folder_id, is_pinned, is_favorite, status
  
- **`memoFolder.model.js`** - 文件夹树形结构
  - 字段：name, parent_id, path, level, icon, color

#### API 端点

**备忘录接口** (`/v1/memos`)
```
POST   /memos                    - 新增备忘录
GET    /memos                    - 列表查询（支持分页、筛选、搜索）
GET    /memos/:id                - 获取详情
PATCH  /memos/:id                - 编辑备忘录
DELETE /memos/:id                - 删除（软删除）
POST   /memos/:id/archive        - 归档
POST   /memos/:id/restore        - 恢复
POST   /memos/:id/pin            - 切换置顶
POST   /memos/:id/favorite       - 切换收藏
POST   /memos/:id/move           - 移动到文件夹
GET    /memos/tags               - 获取所有标签
PATCH  /memos/batch              - 批量更新
```

**文件夹接口** (`/v1/memo-folders`)
```
POST   /memo-folders             - 新增文件夹
GET    /memo-folders             - 获取列表（支持树形结构）
GET    /memo-folders/:id         - 获取详情
PATCH  /memo-folders/:id         - 编辑文件夹
DELETE /memo-folders/:id         - 删除文件夹
GET    /memo-folders/stats       - 获取统计
```

### 前端 UI (uni-demo)

#### 页面结构

1. **备忘录列表页** (`/subPackages/services/memo/list.vue`)
   - 左侧：文件夹树形导航（可折叠）
   - 右侧：备忘录列表
   - 功能：搜索、筛选（置顶/收藏）、分页加载

2. **备忘录编辑器** (`/subPackages/services/memo/editor.vue`)
   - 支持预览/编辑模式切换
   - 备忘录名称和标签输入
   - 富文本编辑（标题、文本块、图片块）
   - 样式控制面板

#### 路由配置

```json
{
  "path": "memo/list",
  "style": {
    "navigationBarTitleText": "我的备忘录",
    "navigationStyle": "custom"
  }
},
{
  "path": "memo/editor",
  "style": {
    "navigationBarTitleText": "编辑备忘录",
    "navigationStyle": "custom"
  }
}
```

#### API 服务层

**`src/services/memo.service.ts`** - 封装所有备忘录和文件夹相关的 API 调用

## 🚀 使用方式

### 1. 访问备忘录列表

```javascript
// 跳转到备忘录列表
uni.navigateTo({
  url: '/subPackages/services/memo/list'
})
```

### 2. 创建新备忘录

```javascript
// 从列表页点击"+"按钮，或直接跳转
uni.navigateTo({
  url: '/subPackages/services/memo/editor'
})
// 默认进入编辑模式
```

### 3. 查看备忘录（预览模式）

```javascript
// 从列表点击备忘录项
uni.navigateTo({
  url: `/subPackages/services/memo/editor?id=${memoId}&mode=preview`
})
```

### 4. 编辑备忘录

```javascript
// 从列表点击编辑按钮，或从预览模式切换
uni.navigateTo({
  url: `/subPackages/services/memo/editor?id=${memoId}&mode=edit`
})
```

## 🔧 集成 API

目前代码中已预留 TODO 注释，需要取消注释并集成实际 API：

### 列表页集成示例

```typescript
// list.vue 中的 loadMemos 函数
import { getMemos } from '@/services/memo.service'

const loadMemos = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      status: 'active',
      folder_id: selectedFolderId.value,
      is_pinned: filterPinned.value,
      is_favorite: filterFavorite.value,
      search: searchKeyword.value,
    }
    
    const res = await getMemos(params)
    memos.value = [...memos.value, ...res.results]
    hasMore.value = res.page < res.totalPages
    totalCount.value = res.totalResults
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}
```

### 编辑器集成示例

```typescript
// editor.vue 中的 saveData 和 loadData 函数
import { createMemo, updateMemo, getMemo } from '@/services/memo.service'

// 保存
const saveData = async () => {
  const memoData = {
    name: memoName.value,
    title: pageData.title,
    content: pageData.content,
    tags: tags.value,
  }
  
  if (memoId.value) {
    await updateMemo(memoId.value, memoData)
  } else {
    const result = await createMemo(memoData)
    memoId.value = result.id
  }
}

// 加载
const loadData = async () => {
  if (memoId.value) {
    const memo = await getMemo(memoId.value)
    memoName.value = memo.name
    tags.value = memo.tags || []
    Object.assign(pageData.title, memo.title)
    pageData.content = memo.content
  }
}
```

## 📱 功能特性

### 列表页功能
- ✅ 左侧文件夹树形导航（可折叠/展开）
- ✅ 文件夹统计数量显示
- ✅ 搜索备忘录
- ✅ 筛选（置顶/收藏）
- ✅ 分页加载
- ✅ 创建新备忘录
- ✅ 创建新文件夹
- ✅ 快速编辑/删除操作

### 编辑器功能
- ✅ 预览/编辑模式切换
- ✅ 备忘录名称输入
- ✅ 标签管理（添加/删除）
- ✅ 富文本标题（粗体/斜体/字号）
- ✅ 文本块（多种样式）
- ✅ 图片块（多种尺寸模式）
- ✅ 内容块排序（上移/下移）
- ✅ Flexbox 布局（底部面板不遮挡内容）

## 🎨 UI 设计

### 颜色方案
- 主色调：渐变紫色 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 背景色：`#f5f5f5`
- 卡片背景：`#fff`
- 选中状态：`#e6f7ff` / `#1890ff`

### 交互设计
- 文件夹可折叠/展开
- 列表项点击进入预览
- 编辑按钮快速进入编辑模式
- 标签渐变显示
- 置顶/收藏图标标识

## 📝 待完成事项

1. **API 集成**
   - 取消所有 TODO 注释
   - 集成实际的 API 调用
   - 处理错误和加载状态

2. **首页入口**
   - 在首页添加"我的备忘录"入口
   - 设计入口图标和样式

3. **高级功能**（可选）
   - 备忘录拖拽排序
   - 文件夹拖拽移动
   - 批量操作（批量删除/移动）
   - 分享功能
   - 提醒功能

## 🔗 文件清单

### 后端文件
- `src/models/memo.model.js`
- `src/models/memoFolder.model.js`
- `src/controllers/memo.controller.js`
- `src/controllers/memoFolder.controller.js`
- `src/routes/v1/memo.route.js`
- `src/routes/v1/memoFolder.route.js`
- `src/validations/memo.validation.js`
- `src/validations/memoFolder.validation.js`

### 前端文件
- `src/subPackages/services/memo/list.vue` - 列表页
- `src/subPackages/services/memo/editor.vue` - 编辑器
- `src/services/memo.service.ts` - API 服务
- `src/pages.json` - 路由配置

## 🎯 总结

已完成：
1. ✅ 完整的后端 API（CRUD + 高级功能）
2. ✅ 备忘录列表页（文件夹导航 + 列表展示）
3. ✅ 备忘录编辑器（预览/编辑模式）
4. ✅ API 服务层封装
5. ✅ 路由配置

下一步：
1. 集成 API 调用（取消 TODO 注释）
2. 添加首页入口
3. 测试完整流程
