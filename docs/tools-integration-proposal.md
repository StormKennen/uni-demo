# 工具联动整合方案

## 概述

将「磁力链接补全」「二维码生成/解析」「图片混淆」三个工具串联为一条工作流，通过快捷按钮实现一键跳转。

---

## 1. 工作流路径

```
磁力链接补全 → 一键生成二维码 → 一键混淆二维码图片
                ↗
二维码解析 → 解析结果 → 一键补全磁力链接
                       → 一键混淆图片
```

### 正向链路（磁力 → 二维码 → 混淆）

1. 用户在「磁力链接」页面处理完链接后
2. 每条有效链接旁显示 **「生成二维码」** 按钮
3. 点击后跳转到「二维码生成器」并自动填入链接内容
4. 二维码生成后，增加 **「混淆此图」** 按钮
5. 点击后跳转到「图片混淆」并自动传入二维码图片

### 反向链路（二维码解析 → 磁力补全）

1. 用户在「二维码解析」页面解析出文本
2. 如果文本包含 hash 或磁力链接格式，显示 **「磁力链接补全」** 按钮
3. 点击后跳转到「磁力链接」页面并自动填入解析内容

---

## 2. 页面间跳转方案

使用 `uni.navigateTo` + URL query 参数传递数据：

```typescript
// 磁力 → 二维码生成
uni.navigateTo({
  url: `/subPackages/tools/qr-generator/index?content=${encodeURIComponent(magnetLink)}`
})

// 二维码生成 → 图片混淆
uni.navigateTo({
  url: `/subPackages/tools/image-cipher/index?imagePath=${encodeURIComponent(qrImagePath)}`
})

// 二维码解析 → 磁力补全
uni.navigateTo({
  url: `/subPackages/tools/magnet-link/index?input=${encodeURIComponent(parsedText)}`
})
```

对于较大数据（如图片路径），使用 `uni.$emit` / `uni.$on` 事件总线或全局状态。

---

## 3. UI 交互设计

### 3.1 快捷操作按钮样式

每个结果项旁边的小按钮，统一风格：

```scss
.quick-action {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  background: #eef2ff;
  color: #6366f1;
  font-size: 22rpx;
  font-weight: 700;
}
```

### 3.2 各页面需要新增的快捷按钮

| 页面 | 触发位置 | 按钮文案 | 跳转目标 |
|------|---------|---------|---------|
| 磁力链接 | 每条有效链接右侧 | 「二维码」 | qr-generator |
| 二维码生成器 | 生成结果下方 | 「混淆此图」 | image-cipher |
| 二维码解析 | 解析结果下方 | 「磁力补全」（条件显示） | magnet-link |
| 二维码解析 | 解析结果下方 | 「混淆此图」 | image-cipher |
| 图片混淆 | 混淆结果下方 | 「生成二维码」 | qr-generator |

### 3.3 条件判断逻辑

```typescript
// 是否显示「磁力补全」按钮
const isMagnetLike = (text: string): boolean => {
  const HASH_REGEX = /[a-fA-F0-9]{40}|[a-zA-Z2-7]{32}/
  return text.includes('magnet:') || HASH_REGEX.test(text)
}
```

---

## 4. 参数接收适配

每个目标页面在 `onLoad` 中检查 query 参数并自动填充：

### qr-generator/index.vue
```typescript
onLoad((options) => {
  if (options?.content) {
    inputContent.value = decodeURIComponent(options.content)
  }
})
```

### magnet-link/index.vue（已实现）
```typescript
onLoad((options) => {
  if (options?.input) {
    rawInput.value = decodeURIComponent(options.input)
  }
})
```

### image-cipher/index.vue
```typescript
onLoad((options) => {
  if (options?.imagePath) {
    // 自动加载传入的图片
    loadImage(decodeURIComponent(options.imagePath))
  }
})
```

---

## 5. 全局工具导航入口（可选增强）

在首页工具列表中增加一个 **「工具联动」** 分组，展示联动路径图：

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  磁力链接    │ →  │  二维码生成  │ →  │  图片混淆    │
│  补全/过滤   │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                         ↑
                   ┌─────────────┐
                   │  二维码解析  │
                   └─────────────┘
```

---

## 6. 实施优先级

| 优先级 | 任务 | 工作量 |
|--------|------|--------|
| P0 | 磁力链接 → 二维码生成 跳转 | ✅ 已实现 |
| P1 | 二维码生成 → 图片混淆 跳转 | 小（qr-generator 加按钮 + image-cipher 接收参数） |
| P2 | 二维码解析 → 磁力补全 跳转 | 小（qr-parser 加条件按钮 + magnet-link 接收参数） |
| P3 | 图片混淆 → 二维码生成 跳转 | 小（image-cipher 加按钮） |
| P4 | 全局工具导航入口 | 中（新建组件或修改首页） |

---

## 7. 技术注意事项

- **数据大小限制**：URL query 有长度限制（约 2KB），磁力链接单条通常在 100 字符内，无需担心
- **图片传递**：图片路径为本地临时路径，跨页面有效期内可用；如需持久化可先存到全局 store
- **微信小程序兼容**：`uni.navigateTo` 的 URL 最大长度约 1024 字符，超长内容需用事件总线
- **返回处理**：从目标页面返回时，可通过 `onShow` + 全局状态判断是否需要刷新数据
