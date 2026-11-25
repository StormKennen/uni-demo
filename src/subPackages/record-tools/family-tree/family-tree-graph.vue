<template>
  <view class="family-tree-graph">
    <view class="graph-toolbar">
      <text class="graph-help">节点保持原尺寸，可上下、左右拖动画布查看；点成员看详情，点 +/− 展开或收起后代</text>
    </view>

    <view v-if="layoutWarning" class="graph-warning">
      <text>{{ layoutWarning }}</text>
    </view>

    <scroll-view
      v-else-if="layout.nodes.length"
      class="graph-horizontal-viewport"
      scroll-x
      :scroll-left="horizontalScrollLeft"
      :style="{ height: `${stageHeight}px` }"
      @scroll="handleHorizontalScroll">
      <view class="graph-stage" :style="{ width: `${layout.width}px`, height: `${stageHeight}px` }">
        <view
          v-for="connector in layout.connectors"
          :key="connector.id"
          class="tree-connector"
          :style="{
            left: `${connector.x}px`,
            top: `${connector.y + verticalOffset}px`,
            width: `${connector.width}px`,
            height: `${connector.height}px`,
          }" />

        <view
          v-for="position in layout.nodes"
          :key="position.node.id"
          class="tree-node"
          :class="[position.node.gender === 'female' ? 'female' : 'male', { selected: selectedId === position.node.id }]"
          :style="{
            left: `${position.x}px`,
            top: `${position.y + verticalOffset}px`,
            width: `${position.width}px`,
            height: `${position.height}px`,
          }"
          @click="emit('select', position.node)">
          <view class="node-name-vertical">
            <text
              v-for="(character, characterIndex) in getVerticalName(position.node)"
              :key="`${position.node.id}-name-${characterIndex}`"
              class="node-name-character"
              >{{ character }}</text
            >
          </view>
          <text class="node-meta">第{{ position.node.generation || '—' }}世</text>
          <view
            v-if="position.node.children?.length"
            class="node-expand-control"
            role="button"
            :aria-label="isExpanded(position.node.id) ? '收起后代' : '展开后代'"
            @click.stop="toggleBranch(position.node.id)">
            <text>{{ isExpanded(position.node.id) ? '−' : '+' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-else class="graph-empty">
      <text>当前关系中没有可作为树图起点的成员，请在列表或泳道中查看记录。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import { layoutFamilyTree, type FamilyTreeLayoutInput } from '@/engine/family-tree-layout'

  interface FamilyTreeNode extends FamilyTreeLayoutInput {
    fullName?: string
    givenName?: string
    gender?: 'male' | 'female' | 'unknown'
    generation?: number
    children: FamilyTreeNode[]
  }

  const props = defineProps<{
    roots: FamilyTreeNode[]
    selectedId?: string
    panelExpanded?: boolean
  }>()

  const emit = defineEmits<{
    select: [node: FamilyTreeNode]
  }>()

  const instance = getCurrentInstance()
  const expandedIds = ref(new Set<string>())
  const viewportHeight = ref(0)
  const viewportWidth = ref(0)
  const horizontalScrollLeft = ref(0)
  const lockedVerticalOffset = ref<number | null>(null)
  const NODE_NAME_LINE_HEIGHT = 22
  const NODE_MIN_HEIGHT = 160
  const NODE_BASE_HEIGHT = 41
  const NODE_EXPAND_CONTROL_HEIGHT = 44

  const getNodeName = (node: FamilyTreeNode) => node.fullName || node.givenName || '未知'
  const getVerticalName = (node: FamilyTreeNode) => Array.from(getNodeName(node))
  const getTreeNodeHeight = (node: FamilyTreeNode) =>
    Math.max(
      NODE_MIN_HEIGHT,
      getVerticalName(node).length * NODE_NAME_LINE_HEIGHT + NODE_BASE_HEIGHT + (node.children?.length ? NODE_EXPAND_CONTROL_HEIGHT : 0),
    )

  const rootIds = computed(() => props.roots.map(root => root.id).join('|'))
  const layout = computed(() =>
    layoutFamilyTree(props.roots, expandedIds.value, { nodeHeight: NODE_MIN_HEIGHT, getNodeHeight: getTreeNodeHeight }),
  )
  const stageHeight = computed(() => Math.max(layout.value.height + (lockedVerticalOffset.value || 0), viewportHeight.value, 320))
  const verticalOffset = computed(
    () => lockedVerticalOffset.value ?? Math.max(0, Math.floor((stageHeight.value - layout.value.height) / 2)),
  )

  const handleHorizontalScroll = (event: { detail?: { scrollLeft?: number } }) => {
    const scrollLeft = event.detail?.scrollLeft
    if (typeof scrollLeft === 'number' && Number.isFinite(scrollLeft)) horizontalScrollLeft.value = scrollLeft
  }
  const layoutWarning = computed(() => {
    if (layout.value.issues.cyclicIds.length) return '成员关系存在循环，无法生成可靠的从上到下树图；请先核对关系记录。'
    if (layout.value.issues.multipleParentIds.length) {
      return '部分成员关联了多个父节点；当前树图不重复绘制或擅自选择主父，请在泳道或列表中查看完整记录。'
    }
    if (layout.value.issues.rootsWithParents.length) return '树图起点同时属于其他成员的子女关系，请核对根节点数据。'
    return ''
  })

  const measureViewport = () => {
    if (!instance) return
    nextTick(() => {
      const query = uni.createSelectorQuery().in(instance)
      query.select('.graph-horizontal-viewport').boundingClientRect(rect => {
        const viewport = Array.isArray(rect) ? rect[0] : rect
        if (viewport && typeof viewport.height === 'number' && viewport.height > 0) {
          viewportHeight.value = Math.round(viewport.height)
        }
        if (viewport && typeof viewport.width === 'number' && viewport.width > 0) {
          viewportWidth.value = Math.round(viewport.width)
        }
      })
      query.exec()
    })
  }

  const handleWindowResize = () => measureViewport()

  watch([() => layout.value.height, () => props.panelExpanded], measureViewport, { flush: 'post' })

  onMounted(() => {
    measureViewport()
    if (typeof uni.onWindowResize === 'function') uni.onWindowResize(handleWindowResize)
  })

  onUnmounted(() => {
    if (typeof uni.offWindowResize === 'function') uni.offWindowResize(handleWindowResize)
  })

  watch(
    rootIds,
    () => {
      expandedIds.value = new Set(props.roots.map(root => root.id))
      horizontalScrollLeft.value = 0
      lockedVerticalOffset.value = null
    },
    { immediate: true },
  )

  const isExpanded = (nodeId: string) => expandedIds.value.has(nodeId)

  const toggleBranch = (nodeId: string) => {
    const currentPosition = layout.value.nodes.find(position => position.node.id === nodeId)
    const anchorLeft = currentPosition ? currentPosition.x - horizontalScrollLeft.value : null
    if (lockedVerticalOffset.value === null) lockedVerticalOffset.value = verticalOffset.value

    const next = new Set(expandedIds.value)
    if (next.has(nodeId)) next.delete(nodeId)
    else next.add(nodeId)
    expandedIds.value = next

    if (anchorLeft === null) return
    nextTick(() => {
      const nextPosition = layout.value.nodes.find(position => position.node.id === nodeId)
      if (!nextPosition) return
      const maxScrollLeft = Math.max(0, layout.value.width - viewportWidth.value)
      horizontalScrollLeft.value = Math.min(maxScrollLeft, Math.max(0, nextPosition.x - anchorLeft))
    })
  }
</script>

<style lang="scss" scoped>
  .family-tree-graph {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-height: 320px;
  }

  .graph-toolbar {
    flex-shrink: 0;
    width: 100%;
    padding: 8rpx 16rpx 12rpx;
    box-sizing: border-box;
  }

  .graph-help {
    color: #475569;
    font-size: 24rpx;
    line-height: 1.4;
  }

  .graph-horizontal-viewport {
    flex: 1;
    width: 100%;
    min-height: 320px;
  }

  .graph-stage {
    position: relative;
    flex-shrink: 0;
    min-height: 100%;
    box-sizing: border-box;
    background: #f8fafc;
  }

  .graph-warning,
  .graph-empty {
    width: 100%;
    box-sizing: border-box;
    padding: 24rpx;
    color: #475569;
    font-size: 28rpx;
    line-height: 1.5;
  }

  .tree-connector {
    position: absolute;
    z-index: 1;
    background: #94a3b8;
  }

  .tree-node {
    position: absolute;
    z-index: 2;
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    min-width: 160px;
    min-height: 160px;
    padding: 10px 12px 8px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    background: #fff;
    color: #1e293b;
  }

  .tree-node.male {
    border-color: #93c5fd;
    background: #eff6ff;
  }

  .tree-node.female {
    border-color: #f9a8d4;
    background: #fdf2f8;
  }

  .tree-node.selected {
    border: 2px solid #4f46e5;
  }

  .node-name-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    color: #0f172a;
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    text-align: center;
  }

  .node-name-character {
    display: block;
    min-height: 22px;
    line-height: 22px;
    white-space: nowrap;
  }

  .node-meta {
    display: block;
    width: 100%;
    margin-top: 3px;
    overflow: hidden;
    color: #475569;
    font-size: 13px;
    line-height: 18px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-expand-control {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    margin-top: auto;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(79, 70, 229, 0.08);
    color: #3730a3;
    font-size: 24px;
    font-weight: 600;
    line-height: 44px;
    white-space: nowrap;
  }
</style>
