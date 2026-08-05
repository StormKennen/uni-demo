# 架构执行状态

> 本文件只记录当前架构执行轮次的阶段进度，不重复审计报告内容。

## 当前阶段

阶段二已完成，进入阶段三。

## 起点

- 基线提交：`dd4d38e3bb4d2a19e82cffeaa94e4e658cef3c12`（P0C-2 仓库卫生基线）

## 阶段一：隐藏族谱入口并移除 ECharts

- 状态：已完成
- 提交哈希：`24e46e30886eb478be57805d7ce37ba90aabd0cd`
- 修改范围
  - `src/config/tools.ts`：族谱工具增加 `hiddenInDirectory: true`，路由与分享配置保留
  - `src/subPackages/tools/family-tree/family-tree-chart.vue`：移除 ECharts 初始化、配置、事件、缩放、导出逻辑；图谱区域改为升级占位；保留成员加载与新增成员链路
  - `src/subPackages/tools/family-tree/index.vue`：移除图表延时初始化，模式标签改为“图谱”
  - 删除：`src/static/echarts.min.js`、`src/static/ecStat.min.js`、`src/static/uvue.html`、`src/components/l-echart/`、`src/components/lime-echart/`
  - `family-tree/demo` 历史路由在阶段二恢复为轻量升级占位页，不再加载图表运行时
- 静态检查
  - `git diff --check`：通过
  - `git diff -- src/services`：无差异
  - `pnpm check:generated-boundary`：通过
  - `pnpm check:routes`：通过
  - ECharts 扫描：活动源码中无 `echarts`/`ecStat`/`l-echart`/`lime-echart` 引用
- 遗留问题
  - 原图表组件中的“编辑节点”“设置关系”表单引用了从未定义的 `updateNode`、`cancelEdit`、`onEditGenderChange`、`availableParentNodes`、`resetRelation`、`onRelationParentChange`，属于运行即报错的死代码，本次一并移除；成员编辑能力后续需重新设计
  - 族谱成员列表页的 `emit` 定义未被使用（既有告警，未处理）

## 阶段二：建立最小组件边界

- 状态：已完成
- 提交哈希：待填写
- 修改范围
  - 新增 `src/shared/ui/empty-state.vue`
  - 新增 `src/subPackages/tools/_shared/components/tool-section-card.vue`、`tool-action-row.vue`
  - 迁移 `QrGeneratorPanel` 至 `src/subPackages/tools/_shared/features/`
  - 二维码生成、磁力链接、码包三个页面改用新组件边界
  - 保留 `PageLayout.vue` 原路径和接口；其他 toolkit 组件不批量迁移
  - 新增 `docs/architecture/MAINTAINABLE_UNIAPP_STRUCTURE.md`
- 静态检查
  - 本阶段修改文件定向 ESLint：通过
  - `git diff --check`：通过
  - `git diff -- src/services`：无差异
  - `pnpm check:generated-boundary`：通过
  - `pnpm check:routes`：通过
- 遗留问题
  - `image-shuffle-panel.vue`、`qr-parser-panel.vue` 等未迁移组件保留原目录，后续按实际修改逐步迁移
  - 旧代码仍直接使用 Apifox DTO，本轮只补充新代码规则，不建立无用途的空 API 层

## 阶段三：整理微信小程序/H5 文件能力

- 状态：进行中
