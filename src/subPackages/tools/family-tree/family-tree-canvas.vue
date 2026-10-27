<template>
  <view class="family-canvas-chart">
    <view class="canvas-toolbar">
      <text class="canvas-help">拖动画布 · 双指缩放 · 点击节点展开/收起后代</text>
      <view class="fit-button" @click="fitTree">适合屏幕</view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <view class="canvas-viewport" :style="{ height: `${height}px` }">
      <canvas
        :id="canvasId"
        :canvas-id="canvasId"
        class="lineage-canvas"
        :style="{ width: `${width}px`, height: `${height}px` }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd" />
      <view v-if="!roots.length" class="canvas-empty">暂无家族图谱数据</view>
    </view>
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="canvas-viewport" :style="{ height: `${height}px` }">
      <canvas
        :id="canvasId"
        class="lineage-canvas"
        :style="{ width: `${width}px`, height: `${height}px` }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd" />
      <view v-if="!roots.length" class="canvas-empty">暂无家族图谱数据</view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
  import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

  interface TreeNode {
    id: string
    fullName?: string
    givenName?: string
    gender?: 'male' | 'female' | 'unknown'
    generation?: number
    children: TreeNode[]
  }

  interface Point {
    x: number
    y: number
    moved?: boolean
  }

  interface CanvasTouchPoint {
    clientX?: number
    clientY?: number
    pageX?: number
    pageY?: number
    x?: number
    y?: number
  }

  interface CanvasTouchEvent {
    touches: CanvasTouchPoint[]
    changedTouches: CanvasTouchPoint[]
  }

  interface PositionedNode {
    node: TreeNode
    x: number
    y: number
    width: number
    height: number
    depth: number
  }

  const props = defineProps({
    roots: { type: Array as () => TreeNode[], default: () => [] },
    selectedId: { type: String, default: '' },
  })
  const emit = defineEmits<{ select: [node: TreeNode] }>()

  const instance = getCurrentInstance()
  const canvasId = `family-tree-canvas-${Math.random().toString(36).slice(2, 9)}`
  const canvasContext = ref<ReturnType<typeof uni.createCanvasContext> | null>(null)
  const width = ref(360)
  const height = ref(420)
  const expandedIds = ref(new Set<string>())
  const scale = ref(1)
  const offset = ref<Point>({ x: 16, y: 26 })
  const initialized = ref(false)
  const drawing = ref(false)
  const touchStart = ref<Point | null>(null)
  const lastPinchDistance = ref(0)
  const hitTargets = ref<PositionedNode[]>([])
  const canvasRect = ref({ left: 0, top: 0 })
  let resizeTimer: ReturnType<typeof setTimeout> | undefined

  const getTouchPoint = (touch?: CanvasTouchPoint): Point | null => {
    if (!touch) return null
    const x = touch.clientX ?? touch.pageX ?? touch.x
    const y = touch.clientY ?? touch.pageY ?? touch.y
    return typeof x === 'number' && typeof y === 'number' ? { x, y } : null
  }

  const layoutNodes = (): PositionedNode[] => {
    const nodeWidth = 104
    const nodeHeight = 92
    const verticalGap = 62
    const horizontalGap = 28
    const visible: PositionedNode[] = []
    let nextLeafX = 24

    const layoutSubtree = (node: TreeNode, depth: number): number => {
      const isExpanded = depth === 0 || expandedIds.value.has(node.id)
      const children = isExpanded ? node.children || [] : []
      let centerX: number

      if (children.length === 0) {
        centerX = nextLeafX + nodeWidth / 2
        nextLeafX += nodeWidth + horizontalGap
      } else {
        const childCenters = children.map(child => layoutSubtree(child, depth + 1))
        centerX = (childCenters[0] + childCenters[childCenters.length - 1]) / 2
      }

      visible.push({
        node,
        x: centerX - nodeWidth / 2,
        y: 32 + depth * (nodeHeight + verticalGap),
        width: nodeWidth,
        height: nodeHeight,
        depth,
      })
      return centerX
    }

    props.roots.forEach((root, index) => {
      layoutSubtree(root, 0)
      if (index < props.roots.length - 1) nextLeafX += horizontalGap
    })

    return visible
  }

  const visibleEdges = (nodes: PositionedNode[]) => {
    const edges: Array<{ from: PositionedNode; to: PositionedNode }> = []
    nodes.forEach(from => {
      from.node.children.forEach(child => {
        const to = nodes.find(candidate => candidate.node.id === child.id)
        if (to) edges.push({ from, to })
      })
    })
    return edges
  }

  const roundRect = (ctx: ReturnType<typeof uni.createCanvasContext>, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  const draw = async () => {
    if (!initialized.value || drawing.value) return
    drawing.value = true
    await nextTick()
    const nodes = layoutNodes()
    hitTargets.value = nodes
    const ctx = canvasContext.value
    if (!ctx) {
      drawing.value = false
      return
    }
    const transform = (value: number, axis: 'x' | 'y') => value * scale.value + offset.value[axis]

    ctx.clearRect(0, 0, width.value, height.value)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, width.value, height.value)

    visibleEdges(nodes).forEach(({ from, to }) => {
      const startX = transform(from.x + from.width / 2, 'x')
      const startY = transform(from.y + from.height, 'y')
      const endX = transform(to.x + to.width / 2, 'x')
      const endY = transform(to.y, 'y')
      const middleY = (startY + endY) / 2
      ctx.beginPath()
      ctx.setStrokeStyle('#94a3b8')
      ctx.setLineWidth(1.5 * scale.value)
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX, middleY)
      ctx.lineTo(endX, middleY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    })

    nodes.forEach(({ node, x, y, width: nodeWidth, height: nodeHeight, depth }) => {
      const left = transform(x, 'x')
      const top = transform(y, 'y')
      const w = nodeWidth * scale.value
      const h = nodeHeight * scale.value
      const fill = node.gender === 'male' ? '#eff6ff' : node.gender === 'female' ? '#fdf2f8' : '#f8fafc'
      const stroke = node.gender === 'male' ? '#93c5fd' : node.gender === 'female' ? '#f9a8d4' : '#cbd5e1'
      roundRect(ctx, left, top, w, h, 8 * scale.value)
      ctx.setFillStyle(fill)
      ctx.fill()
      ctx.setStrokeStyle(props.selectedId === node.id ? '#4f46e5' : stroke)
      ctx.setLineWidth(props.selectedId === node.id ? 3 : 1.5)
      ctx.stroke()

      const name = node.fullName || node.givenName || '未知'
      const title = name.length > 5 ? `${name.slice(0, 5)}…` : name
      ctx.setFillStyle('#1e293b')
      ctx.setFontSize(Math.max(10, 14 * scale.value))
      ctx.setTextAlign('center')
      ctx.fillText(title, left + w / 2, top + 26 * scale.value)
      ctx.setFillStyle('#64748b')
      ctx.setFontSize(Math.max(8, 10 * scale.value))
      ctx.fillText(
        `第${node.generation || ''}世 · ${node.gender === 'male' ? '男' : node.gender === 'female' ? '女' : '未标'}`,
        left + w / 2,
        top + 46 * scale.value,
      )
      if (node.children?.length && depth > 0) {
        const expanded = expandedIds.value.has(node.id)
        ctx.setFillStyle('#4f46e5')
        ctx.fillText(`${expanded ? '− 收起' : '+ 展开'} ${node.children.length}`, left + w / 2, top + 68 * scale.value)
      }
    })

    ctx.draw(false, () => {
      drawing.value = false
    })
  }

  const fitTree = () => {
    const nodes = layoutNodes()
    if (!nodes.length) return
    const maxX = Math.max(...nodes.map(item => item.x + item.width))
    const maxY = Math.max(...nodes.map(item => item.y + item.height))
    const minX = Math.min(...nodes.map(item => item.x))
    const minY = Math.min(...nodes.map(item => item.y))
    const fitScale = Math.max(0.01, Math.min((width.value - 32) / (maxX - minX), (height.value - 48) / (maxY - minY), 1))
    scale.value = fitScale
    offset.value = { x: 16 - minX * scale.value, y: 24 - minY * scale.value }
    draw()
  }

  const onTouchStart = (event: CanvasTouchEvent) => {
    const touches = event.touches || []
    if (touches.length >= 2) {
      const [first, second] = touches
      const a = getTouchPoint(first)
      const b = getTouchPoint(second)
      if (a && b) lastPinchDistance.value = Math.hypot(a.x - b.x, a.y - b.y)
      touchStart.value = { x: 0, y: 0, moved: true }
      return
    }
    const point = getTouchPoint(touches[0])
    if (point) touchStart.value = point
  }

  const onTouchMove = (event: CanvasTouchEvent) => {
    const touches = event.touches || []
    if (touches.length >= 2) {
      const [first, second] = touches
      const a = getTouchPoint(first)
      const b = getTouchPoint(second)
      if (!a || !b) return
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      if (lastPinchDistance.value) scale.value = Math.max(0.01, Math.min(2.5, scale.value * (distance / lastPinchDistance.value)))
      lastPinchDistance.value = distance
      draw()
      return
    }
    const point = getTouchPoint(touches[0])
    if (!point || !touchStart.value) return
    offset.value = { x: offset.value.x + point.x - touchStart.value.x, y: offset.value.y + point.y - touchStart.value.y }
    touchStart.value = { ...point, moved: true }
    draw()
  }

  const onTouchEnd = (event: CanvasTouchEvent) => {
    const point = getTouchPoint(event.changedTouches?.[0])
    if (point && touchStart.value && touchStart.value.moved !== true) {
      const localX = (point.x - canvasRect.value.left - offset.value.x) / scale.value
      const localY = (point.y - canvasRect.value.top - offset.value.y) / scale.value
      const target = hitTargets.value.find(
        item => localX >= item.x && localX <= item.x + item.width && localY >= item.y && localY <= item.y + item.height,
      )
      if (target) {
        emit('select', target.node)
        if (target.node.children?.length && target.depth > 0) {
          const next = new Set(expandedIds.value)
          if (next.has(target.node.id)) next.delete(target.node.id)
          else next.add(target.node.id)
          expandedIds.value = next
          fitTree()
        } else {
          draw()
        }
      }
    }
    touchStart.value = null
    lastPinchDistance.value = 0
  }

  const updateSize = () => {
    const query = uni.createSelectorQuery().in(instance?.proxy)
    query.select('.canvas-viewport').boundingClientRect(rect => {
      if (!rect) return
      width.value = Math.max(240, rect.width)
      height.value = Math.max(300, rect.height)
      draw()
    })
    query.select(`#${canvasId}`).boundingClientRect(rect => {
      if (!rect) return
      canvasRect.value = { left: rect.left, top: rect.top }
    })
    query.exec()
  }

  watch(
    () => [props.roots, props.selectedId, expandedIds.value],
    () => nextTick(draw),
    { deep: true },
  )
  onMounted(() => {
    nextTick(() => {
      canvasContext.value = uni.createCanvasContext(canvasId, instance?.proxy)
      initialized.value = true
      updateSize()
      setTimeout(draw, 60)
    })
  })
  onUnmounted(() => {
    if (resizeTimer) clearTimeout(resizeTimer)
  })
</script>

<style lang="scss" scoped>
  .family-canvas-chart {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
  }
  .canvas-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8rpx 20rpx;
  }
  .canvas-help {
    color: #64748b;
    font-size: 20rpx;
  }
  .fit-button {
    padding: 8rpx 16rpx;
    border: 1rpx solid #cbd5e1;
    border-radius: 20rpx;
    color: #4f46e5;
    font-size: 20rpx;
  }
  .canvas-viewport {
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 300px;
    overflow: hidden;
    background: #fff;
  }
  .lineage-canvas {
    display: block;
    touch-action: none;
  }
  .canvas-empty {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    text-align: center;
    color: #94a3b8;
    font-size: 26rpx;
  }
</style>
