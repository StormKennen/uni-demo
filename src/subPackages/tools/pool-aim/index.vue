<template>
  <view class="pool-page">
    <!-- <view class="hero">
      <text class="hero-title">台球瞄准器</text>
      <text class="hero-subtitle">点球桌放置白球和黑球</text>
    </view> -->

    <view class="panel sight-panel">
      <view class="section-heading">
        <text class="section-title">击球点</text>
        <!-- <text class="section-tip">从白球看向黑球，球心保持同高</text> -->
      </view>
      <view class="sight-canvas-shell">
        <canvas id="poolSightCanvas" canvas-id="poolSightCanvas" type="2d" class="sight-canvas" />
      </view>
      <view class="sight-legend">
        <view class="legend-item">
          <view class="legend-ball cue-legend" />
          <text>白球瞄准位置</text>
        </view>
        <view class="legend-item">
          <view class="legend-ball target-legend" />
          <text>黑球</text>
        </view>
      </view>
      <view class="sight-message">
        <text class="sight-scene">{{ sightDescription.scene }}</text>
        <text class="sight-detail">{{ sightDescription.detail }}</text>
      </view>
    </view>

    <view class="table-card">
      <view class="section-heading table-heading">
        <text class="section-title">台球桌</text>
        <view class="title-switch">
          <view class="title-switch-item" :class="{ active: state.activeBall === 'cue' }" @click="setActiveBall('cue')">
            <view class="title-switch-dot cue-dot" />
            <text>白球</text>
          </view>
          <view class="title-switch-item" :class="{ active: state.activeBall === 'target' }" @click="setActiveBall('target')">
            <view class="title-switch-dot target-dot" />
            <text>黑球</text>
          </view>
        </view>
        <text class="section-tip">点击球桌放球，洞口选袋口</text>
      </view>
      <view class="canvas-shell">
        <canvas id="poolAimCanvas" canvas-id="poolAimCanvas" type="2d" class="pool-canvas" @tap="handleCanvasTap" />
      </view>
      <!-- <view class="table-hint">
        <text>{{ placementHint }}</text>
      </view>
      <view class="coordinate-readout">
        <text>白球：{{ formatBallCoordinate(state.cueBall) }}</text>
        <text>黑球：{{ formatBallCoordinate(state.targetBall) }}</text>
      </view> -->
      <!-- <view class="bank-scale-note">两侧数字为新中式翻袋参考刻度，不参与球坐标和路线计算</view> -->
      <!-- <view class="pocket-hint">
        <text>目标袋口：{{ selectedPocket.name }}</text>
        <text class="pocket-mode">{{ state.pocketSelectionMode === 'auto' ? '自动推荐' : '手动选择' }}</text>
        <text class="pocket-action">点袋口切换</text>
      </view> -->
    </view>

    <view class="panel coordinate-panel">
      <view class="section-heading">
        <text class="section-title">位置调整</text>
        <!-- <text class="section-tip">每次 0.05，约 12.7mm</text> -->
      </view>
      <view class="selector-brief">
        <text class="selector-label">当前放置</text>
        <text class="selector-value">{{ activeBallName }}</text>
      </view>
      <view class="ball-control-list">
        <view
          v-for="ball in BALL_CONTROL_OPTIONS"
          :key="ball.value"
          class="ball-control-card"
          :class="{ active: state.activeBall === ball.value }">
          <view class="ball-control-heading">
            <view class="ball-control-name">
              <view class="ball-dot" :class="ball.value === 'cue' ? 'cue-dot' : 'target-dot'" />
              <text>{{ ball.label }}</text>
            </view>
            <text>{{ formatBallCoordinate(state[ball.stateKey]) }}</text>
          </view>
          <view class="axis-control">
            <text class="axis-name">横向</text>
            <view class="axis-actions">
              <button class="coordinate-button" @click.stop="adjustBallCoordinate(ball.value, 'x', -1)">−</button>
              <text class="axis-value">{{ formatAxisValue(state[ball.stateKey], 'x') }}</text>
              <button class="coordinate-button" @click.stop="adjustBallCoordinate(ball.value, 'x', 1)">+</button>
            </view>
          </view>
          <view class="axis-control">
            <text class="axis-name">纵向</text>
            <view class="axis-actions">
              <button class="coordinate-button" @click.stop="adjustBallCoordinate(ball.value, 'y', -1)">−</button>
              <text class="axis-value">{{ formatAxisValue(state[ball.stateKey], 'y') }}</text>
              <button class="coordinate-button" @click.stop="adjustBallCoordinate(ball.value, 'y', 1)">+</button>
            </view>
          </view>
        </view>
      </view>
      <!-- <view class="grid-note">
        <text>点击吸附：0.1（25.4mm）</text>
        <text>按钮微调：0.05（12.7mm）</text>
      </view> -->
    </view>

    <view class="panel">
      <view class="section-heading">
        <text class="section-title">路线模式</text>
        <!-- <text class="section-tip">反弹路线使用镜像法计算</text> -->
      </view>
      <view class="route-tabs">
        <view
          v-for="tab in ROUTE_TABS"
          :key="tab.key"
          class="route-tab"
          :class="{ active: activeRouteTab === tab.key }"
          @click="setRouteTab(tab.key)">
          {{ tab.label }}
        </view>
      </view>
      <view class="option-grid route-grid cushion-grid" :class="{ disabled: isCushionDisabled }">
        <view
          v-for="option in CUSHION_OPTIONS"
          :key="option.value"
          class="option-button"
          :class="{ active: !isCushionDisabled && activeCushion === option.value, disabled: isCushionDisabled }"
          @click="setRouteCushion(option.value)">
          {{ option.label }}
        </view>
      </view>
    </view>

    <view class="share-entry" v-if="!isH5">
      <text class="share-tip" v-if="isWeixinMiniProgram">请点击右上角 · 分享「台球瞄准器」工具</text>
      <text class="share-tip" v-else>请点击右上角 · 分享本工具</text>
    </view>
    <view class="share-entry" v-else>
      <button class="share-btn" @click="handleShare">复制分享链接</button>
    </view>

    <!-- <view class="panel status-panel">
      <view class="section-heading">
        <text class="section-title">路线状态</text>
        <text class="status-chip" :class="state.routeValid ? 'valid' : 'invalid'">
          {{ state.routeValid ? '有效' : '无效' }}
        </text>
      </view>
      <view class="status-grid">
        <view class="status-item">
          <text class="status-label">当前放置</text>
          <text class="status-value">{{ activeBallName }}</text>
        </view>
        <view class="status-item">
          <text class="status-label">当前路线</text>
          <text class="status-value">{{ currentRouteName }}</text>
        </view>
        <view class="status-item">
          <text class="status-label">当前袋口</text>
          <text class="status-value">{{ selectedPocket.name }}</text>
        </view>
      </view>
      <view class="route-message" :class="{ warning: !state.routeValid }">
        {{ state.routeMessage || '路线已计算，可参考球桌上的辅助线。' }}
      </view>
    </view> -->
  </view>
</template>

<script setup lang="ts">
import { getCompendiumsCharacters, getCompendiumsCharacter } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox';
import type { getCompendiumsCharactersQuery, getCompendiumsCharactersRes, getCompendiumsCharacterQuery, getCompendiumsCharacterRes } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface';

  import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

  declare const uni: any

  interface Point {
    x: number
    y: number
  }

  interface GridPoint {
    xIndex: number
    yIndex: number
  }

  interface Pocket extends Point {
    id: string
    name: string
  }

  interface RouteSegment {
    from: Point
    to: Point
    type: 'solid' | 'dashed'
    label?: string
  }

  interface RouteResult {
    valid: boolean
    message: string
    ghostBall: Point | null
    bankPoint: Point | null
    segments: RouteSegment[]
  }

  interface SightDescription {
    scene: string
    detail: string
  }

  type BallType = 'cue' | 'target'
  type CoordinateAxis = 'x' | 'y'
  type Cushion = 'top' | 'bottom' | 'left' | 'right'
  type RouteMode = 'direct' | `bank_${Cushion}` | `double_${Cushion}`
  type RouteCategory = 'direct' | 'bank1' | 'bank2'
  type PocketSelectionMode = 'auto' | 'manual'

  const TABLE_WIDTH = 2540
  const TABLE_HEIGHT = 1270
  const BALL_DIAMETER = 57.15
  const BALL_RADIUS = BALL_DIAMETER / 2
  const GRID_STEP_MM = 3.175
  const CONTROL_GRID_STEP = 4
  const CLICK_GRID_STEP = 8
  const DISPLAY_GRID_STEP = 20
  const GRID_X_MAX = Math.round(TABLE_WIDTH / GRID_STEP_MM)
  const GRID_Y_MAX = Math.round(TABLE_HEIGHT / GRID_STEP_MM)
  const GRID_X_MIN = Math.ceil(BALL_RADIUS / GRID_STEP_MM)
  const GRID_Y_MIN = Math.ceil(BALL_RADIUS / GRID_STEP_MM)
  const GRID_X_LIMIT = GRID_X_MAX - GRID_X_MIN
  const GRID_Y_LIMIT = GRID_Y_MAX - GRID_Y_MIN
  const CANVAS_ID = 'poolAimCanvas'
  const SIGHT_CANVAS_ID = 'poolSightCanvas'
  const TABLE_LENGTH_TO_WIDTH_RATIO = TABLE_WIDTH / TABLE_HEIGHT
  const BAULK_LINE_RATIO = 0.206
  const CORNER_POCKET_DIAMETER_MULTIPLIER = 1.2
  const MIDDLE_POCKET_DIAMETER_MULTIPLIER = 1.35
  const EPSILON = 0.000001

  const POCKETS: Pocket[] = [
    { id: 'lt', name: '左上', x: 0, y: 0 },
    { id: 'lb', name: '右上', x: 0, y: TABLE_HEIGHT },
    { id: 'mt', name: '左中', x: TABLE_WIDTH / 2, y: 0 },
    { id: 'mb', name: '右中', x: TABLE_WIDTH / 2, y: TABLE_HEIGHT },
    { id: 'rt', name: '左下', x: TABLE_WIDTH, y: 0 },
    { id: 'rb', name: '右下', x: TABLE_WIDTH, y: TABLE_HEIGHT },
  ]

  const BALL_CONTROL_OPTIONS = [
    { value: 'cue' as const, label: '白球', stateKey: 'cueBall' as const },
    { value: 'target' as const, label: '黑球', stateKey: 'targetBall' as const },
  ]

  const LEFT_BANK_REFERENCE = ['1', '2', '3', '4', '5']
  const RIGHT_BANK_REFERENCE = ['1.5', '2', '2.5', '3', '3.5']
  // 以整球宽度（左侧边缘 → 右侧边缘）等分为六份，瞄准点自左侧起按六分之一为单位描述。
  const SIGHT_INSIDE_LABELS = ['左侧边缘', '六分之一', '三分之一', '中央', '三分之二', '六分之五', '右侧边缘']
  // 瞄准球体外时，自边缘起按六分之一为单位描述的距离。
  const SIGHT_OUTSIDE_LABELS = ['', '六分之一', '三分之一', '二分之一', '三分之二', '六分之五', '一']

  const CUSHIONS: Cushion[] = ['top', 'bottom', 'left', 'right']
  const CUSHION_ORDER: Cushion[] = ['left', 'right', 'top', 'bottom']
  const CUSHION_LABELS: Record<Cushion, string> = {
    left: '上库',
    right: '下库',
    top: '左库',
    bottom: '右库',
  }

  const ROUTE_TABS: Array<{ key: RouteCategory; label: string }> = [
    { key: 'direct', label: '直接进洞' },
    { key: 'bank1', label: '反一库' },
    { key: 'bank2', label: '反两库' },
  ]

  const CUSHION_OPTIONS = CUSHION_ORDER.map(cushion => ({ value: cushion, label: CUSHION_LABELS[cushion] }))

  const ROUTE_OPTIONS: Array<{ value: RouteMode; label: string }> = [
    { value: 'direct', label: '直接进洞' },
    ...CUSHION_ORDER.map(cushion => ({ value: `bank_${cushion}` as RouteMode, label: `反一库·${CUSHION_LABELS[cushion]}` })),
    ...CUSHION_ORDER.map(cushion => ({ value: `double_${cushion}` as RouteMode, label: `反两库·${CUSHION_LABELS[cushion]}` })),
  ]

  const tableMarkLines = [
    {
      name: 'breakLine',
      from: { x: TABLE_WIDTH * BAULK_LINE_RATIO, y: 0 },
      to: { x: TABLE_WIDTH * BAULK_LINE_RATIO, y: TABLE_HEIGHT },
      type: 'solid' as const,
      color: 'rgba(244, 230, 151, 0.72)',
    },
    {
      name: 'middlePocketLine',
      from: { x: TABLE_WIDTH * 0.5, y: 0 },
      to: { x: TABLE_WIDTH * 0.5, y: TABLE_HEIGHT },
      type: 'dashed' as const,
      color: 'rgba(220, 235, 225, 0.7)',
    },
    {
      name: 'spotLine',
      from: { x: TABLE_WIDTH * 0.75, y: 0 },
      to: { x: TABLE_WIDTH * 0.75, y: TABLE_HEIGHT },
      type: 'dashed' as const,
      color: 'rgba(220, 235, 225, 0.7)',
    },
  ]

  const state = reactive<{
    activeBall: BallType
    cueBall: GridPoint | null
    targetBall: GridPoint | null
    selectedPocketId: string
    pocketSelectionMode: PocketSelectionMode
    routeMode: RouteMode
    routeResult: RouteResult | null
    routeValid: boolean
    routeMessage: string
  }>({
    activeBall: 'cue',
    cueBall: null,
    targetBall: null,
    selectedPocketId: 'rb',
    pocketSelectionMode: 'auto',
    routeMode: 'direct',
    routeResult: null,
    routeValid: false,
    routeMessage: '请先放置白球和黑球',
  })

  const instance = getCurrentInstance()
  let canvasNode: any = null
  let canvasContext: any = null
  let canvasWidth = 0
  let canvasHeight = 0
  let canvasRect = { left: 0, top: 0 }
  let tableRect = { x: 0, y: 0, width: 0, height: 0 }
  let sightCanvasNode: any = null
  let sightCanvasContext: any = null
  let sightCanvasWidth = 0
  let sightCanvasHeight = 0
  let sightRedrawTimer: ReturnType<typeof setTimeout> | null = null
  let isInitializing = false
  let windowResizeHandler: (() => void) | null = null

  const selectedPocket = computed(() => POCKETS.find(item => item.id === state.selectedPocketId) || POCKETS[5])

  const activeBallName = computed(() => (state.activeBall === 'cue' ? '白球' : '黑球'))

  const currentRouteName = computed(() => ROUTE_OPTIONS.find(item => item.value === state.routeMode)?.label || '直接进洞')

  const sightDescription = computed<SightDescription>(() => {
    if (!state.cueBall || !state.targetBall || !state.routeResult?.valid || !state.routeResult.ghostBall) {
      return {
        scene: '等待定位',
        detail: '放置白球和黑球后，这里会显示对应的瞄准场景和击打位置。',
      }
    }
    return getSightAimDescription(getSightOffset())
  })

  const placementHint = computed(() => {
    if (!state.cueBall && !state.targetBall) {
      return `先放${activeBallName.value}`
    }
    if (!state.cueBall) {
      return '补放白球'
    }
    if (!state.targetBall) {
      return '补放黑球'
    }
    return `点球桌移动${activeBallName.value}`
  })

  function tableToCanvas(point: Point): Point {
    return {
      x: tableRect.x + (point.y / TABLE_HEIGHT) * tableRect.width,
      y: tableRect.y + (point.x / TABLE_WIDTH) * tableRect.height,
    }
  }

  function canvasToTable(point: Point): Point {
    return {
      x: ((point.y - tableRect.y) / tableRect.height) * TABLE_WIDTH,
      y: ((point.x - tableRect.x) / tableRect.width) * TABLE_HEIGHT,
    }
  }

  function clampGridPoint(point: GridPoint): GridPoint {
    return {
      xIndex: Math.min(GRID_X_LIMIT, Math.max(GRID_X_MIN, point.xIndex)),
      yIndex: Math.min(GRID_Y_LIMIT, Math.max(GRID_Y_MIN, point.yIndex)),
    }
  }

  function gridPointToTablePoint(point: GridPoint): Point {
    return {
      x: point.xIndex * GRID_STEP_MM,
      y: point.yIndex * GRID_STEP_MM,
    }
  }

  function tablePointToGridPoint(point: Point, step = 1): GridPoint {
    return clampGridPoint({
      xIndex: Math.round(point.x / GRID_STEP_MM / step) * step,
      yIndex: Math.round(point.y / GRID_STEP_MM / step) * step,
    })
  }

  function getBallPoint(type: BallType): Point | null {
    const point = type === 'cue' ? state.cueBall : state.targetBall
    return point ? gridPointToTablePoint(point) : null
  }

  function getCoordinateValue(point: GridPoint, axis: CoordinateAxis): number {
    const index = axis === 'x' ? point.yIndex : point.xIndex
    return index * 0.0125
  }

  function formatCoordinateValue(value: number): string {
    return value.toFixed(2).replace(/\.?0+$/, '')
  }

  function formatAxisValue(point: GridPoint | null, axis: CoordinateAxis): string {
    return point ? formatCoordinateValue(getCoordinateValue(point, axis)) : '--'
  }

  function formatBallCoordinate(point: GridPoint | null): string {
    if (!point) {
      return '未放置'
    }
    return `X ${formatAxisValue(point, 'x')} · Y ${formatAxisValue(point, 'y')}`
  }

  function getGhostBall(targetBall: Point, aimPoint: Point): Point | null {
    const dx = aimPoint.x - targetBall.x
    const dy = aimPoint.y - targetBall.y
    const distance = Math.hypot(dx, dy)
    if (distance < EPSILON) {
      return null
    }
    return {
      x: targetBall.x - (dx / distance) * BALL_RADIUS * 2,
      y: targetBall.y - (dy / distance) * BALL_RADIUS * 2,
    }
  }

  function getDirectRoute(cueBall: Point, targetBall: Point, pocket: Pocket): RouteResult {
    const ghostBall = getGhostBall(targetBall, pocket)
    if (!ghostBall) {
      return createInvalidRoute('目标球与袋口重合，无法计算路线')
    }
    if (!isCuePathClear(cueBall, ghostBall, targetBall)) {
      return createInvalidRoute('母球位于目标球线路背面，无法直接到达击打位置')
    }

    const ghostOutside = !isBallCenterInsideTable(ghostBall)
    return {
      valid: true,
      message: ghostOutside ? '虚拟球位置靠近边界，请检查实际可击打性' : '',
      ghostBall,
      bankPoint: null,
      segments: [
        { from: targetBall, to: pocket, type: 'solid', label: '目标球路线' },
        { from: cueBall, to: ghostBall, type: 'dashed', label: '白球瞄准线' },
      ],
    }
  }

  function getBankRoute(cueBall: Point, targetBall: Point, pocket: Pocket, cushion: Cushion): RouteResult {
    const mirrorPocket = getMirrorPoint(pocket, cushion)
    const bankPoint = getLineCushionIntersection(targetBall, mirrorPocket, cushion)
    if (!bankPoint || !isBankPointValid(bankPoint, cushion)) {
      return createInvalidRoute('当前反弹路线无效')
    }

    const ghostBall = getGhostBall(targetBall, bankPoint)
    if (!ghostBall) {
      return createInvalidRoute('当前反弹路线无效')
    }
    if (!isCuePathClear(cueBall, ghostBall, targetBall)) {
      return createInvalidRoute('母球位于目标球线路背面，无法直接到达击打位置')
    }

    return {
      valid: true,
      message: !isBallCenterInsideTable(ghostBall) ? '虚拟球位置靠近边界，请检查实际可击打性' : '',
      ghostBall,
      bankPoint,
      segments: [
        { from: targetBall, to: bankPoint, type: 'solid', label: '入库路线' },
        { from: bankPoint, to: pocket, type: 'solid', label: '反弹路线' },
        { from: cueBall, to: ghostBall, type: 'dashed', label: '白球瞄准线' },
      ],
    }
  }

  function getDoubleBankRoute(cueBall: Point, targetBall: Point, pocket: Pocket, first: Cushion, second: Cushion): RouteResult {
    const mirrorBySecond = getMirrorPoint(pocket, second)
    const mirrorByBoth = getMirrorPoint(mirrorBySecond, first)

    const firstBankPoint = getLineCushionIntersection(targetBall, mirrorByBoth, first)
    if (!firstBankPoint || !isBankPointValid(firstBankPoint, first)) {
      return createInvalidRoute('当前两库反弹路线无效')
    }
    const secondBankPoint = getLineCushionIntersection(firstBankPoint, mirrorBySecond, second)
    if (!secondBankPoint || !isBankPointValid(secondBankPoint, second)) {
      return createInvalidRoute('当前两库反弹路线无效')
    }

    const ghostBall = getGhostBall(targetBall, firstBankPoint)
    if (!ghostBall) {
      return createInvalidRoute('当前两库反弹路线无效')
    }
    if (!isCuePathClear(cueBall, ghostBall, targetBall)) {
      return createInvalidRoute('母球位于目标球线路背面，无法直接到达击打位置')
    }

    return {
      valid: true,
      message: !isBallCenterInsideTable(ghostBall) ? '虚拟球位置靠近边界，请检查实际可击打性' : '',
      ghostBall,
      bankPoint: firstBankPoint,
      segments: [
        { from: targetBall, to: firstBankPoint, type: 'solid', label: '入库路线' },
        { from: firstBankPoint, to: secondBankPoint, type: 'solid', label: '一库反弹' },
        { from: secondBankPoint, to: pocket, type: 'solid', label: '二库反弹' },
        { from: cueBall, to: ghostBall, type: 'dashed', label: '白球瞄准线' },
      ],
    }
  }

  function getDoubleBankRouteForFirst(cueBall: Point, targetBall: Point, pocket: Pocket, first: Cushion): RouteResult {
    let bestRoute: RouteResult | null = null
    let bestDistance = Number.POSITIVE_INFINITY
    CUSHIONS.forEach(second => {
      if (first === second) {
        return
      }
      const route = getDoubleBankRoute(cueBall, targetBall, pocket, first, second)
      if (!route.valid) {
        return
      }
      const distance = getTargetRouteDistance(route)
      if (distance < bestDistance) {
        bestDistance = distance
        bestRoute = route
      }
    })
    return bestRoute || createInvalidRoute('当前两库反弹路线无效')
  }

  function getCushionBoundary(cushion: Cushion): number {
    const boundaries: Record<Cushion, number> = {
      top: BALL_RADIUS,
      bottom: TABLE_HEIGHT - BALL_RADIUS,
      left: BALL_RADIUS,
      right: TABLE_WIDTH - BALL_RADIUS,
    }
    return boundaries[cushion]
  }

  function getMirrorPoint(point: Point, cushion: Cushion): Point {
    const boundary = getCushionBoundary(cushion)
    const mirrorMethods: Record<Cushion, () => Point> = {
      top: () => ({ x: point.x, y: boundary * 2 - point.y }),
      bottom: () => ({ x: point.x, y: boundary * 2 - point.y }),
      left: () => ({ x: boundary * 2 - point.x, y: point.y }),
      right: () => ({ x: boundary * 2 - point.x, y: point.y }),
    }
    return mirrorMethods[cushion]()
  }

  function getLineCushionIntersection(startPoint: Point, endPoint: Point, cushion: Cushion): Point | null {
    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    let ratio = 0

    if (cushion === 'top' || cushion === 'bottom') {
      if (Math.abs(dy) < EPSILON) {
        return null
      }
      const boundaryY = getCushionBoundary(cushion)
      ratio = (boundaryY - startPoint.y) / dy
      if (ratio < 0 || ratio > 1) {
        return null
      }
      return { x: startPoint.x + dx * ratio, y: boundaryY }
    }

    if (Math.abs(dx) < EPSILON) {
      return null
    }
    const boundaryX = getCushionBoundary(cushion)
    ratio = (boundaryX - startPoint.x) / dx
    if (ratio < 0 || ratio > 1) {
      return null
    }
    return { x: boundaryX, y: startPoint.y + dy * ratio }
  }

  function isPointInsideTable(point: Point): boolean {
    return point.x >= 0 && point.x <= TABLE_WIDTH && point.y >= 0 && point.y <= TABLE_HEIGHT
  }

  function isBallCenterInsideTable(point: Point): boolean {
    return point.x >= BALL_RADIUS && point.x <= TABLE_WIDTH - BALL_RADIUS && point.y >= BALL_RADIUS && point.y <= TABLE_HEIGHT - BALL_RADIUS
  }

  function getPointToSegmentDistance(point: Point, from: Point, to: Point): number {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const lengthSquared = dx * dx + dy * dy
    if (lengthSquared < EPSILON) {
      return Math.hypot(point.x - from.x, point.y - from.y)
    }
    const ratio = Math.max(0, Math.min(1, ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared))
    const nearest = {
      x: from.x + dx * ratio,
      y: from.y + dy * ratio,
    }
    return Math.hypot(point.x - nearest.x, point.y - nearest.y)
  }

  function isCuePathClear(cueBall: Point, ghostBall: Point, targetBall: Point): boolean {
    return getPointToSegmentDistance(targetBall, cueBall, ghostBall) >= BALL_DIAMETER - EPSILON
  }

  function isBankPointValid(point: Point, cushion: Cushion): boolean {
    if (!isPointInsideTable(point)) {
      return false
    }
    if (cushion === 'top') {
      return Math.abs(point.y - BALL_RADIUS) < EPSILON
    }
    if (cushion === 'bottom') {
      return Math.abs(point.y - (TABLE_HEIGHT - BALL_RADIUS)) < EPSILON
    }
    if (cushion === 'left') {
      return Math.abs(point.x - BALL_RADIUS) < EPSILON
    }
    return Math.abs(point.x - (TABLE_WIDTH - BALL_RADIUS)) < EPSILON
  }

  function createInvalidRoute(message: string): RouteResult {
    return {
      valid: false,
      message,
      ghostBall: null,
      bankPoint: null,
      segments: [],
    }
  }

  function getRouteForPocket(cueBall: Point, targetBall: Point, pocket: Pocket): RouteResult {
    if (state.routeMode === 'direct') {
      return getDirectRoute(cueBall, targetBall, pocket)
    }
    if (state.routeMode.startsWith('double_')) {
      const first = state.routeMode.replace('double_', '') as Cushion
      return getDoubleBankRouteForFirst(cueBall, targetBall, pocket, first)
    }
    const cushion = state.routeMode.replace('bank_', '') as Cushion
    return getBankRoute(cueBall, targetBall, pocket, cushion)
  }

  function getTargetRouteDistance(route: RouteResult): number {
    return route.segments
      .filter(segment => segment.type === 'solid')
      .reduce((total, segment) => total + Math.hypot(segment.to.x - segment.from.x, segment.to.y - segment.from.y), 0)
  }

  function selectNearestPocket(): void {
    const targetBall = getBallPoint('target')
    if (!targetBall) {
      return
    }
    const cueBall = getBallPoint('cue') || targetBall
    let bestPocket: Pocket | null = null
    let bestDistance = Number.POSITIVE_INFINITY

    POCKETS.forEach(pocket => {
      const route = getRouteForPocket(cueBall, targetBall, pocket)
      if (!route.valid) {
        return
      }
      const distance = getTargetRouteDistance(route)
      if (distance < bestDistance) {
        bestDistance = distance
        bestPocket = pocket
      }
    })

    if (bestPocket) {
      state.selectedPocketId = bestPocket.id
      state.pocketSelectionMode = 'auto'
    }
  }

  function getSightOffset(): number {
    const cueBall = getBallPoint('cue')
    const targetBall = getBallPoint('target')
    if (!cueBall || !targetBall || !state.routeResult?.ghostBall) {
      return 0
    }
    const viewX = targetBall.x - cueBall.x
    const viewY = targetBall.y - cueBall.y
    const viewDistance = Math.hypot(viewX, viewY)
    if (viewDistance < EPSILON) {
      return 0
    }
    // 从白球看向黑球时，正值表示画面右侧，负值表示画面左侧。
    const perpendicularX = viewY / viewDistance
    const perpendicularY = -viewX / viewDistance
    const ghostOffsetX = state.routeResult.ghostBall.x - targetBall.x
    const ghostOffsetY = state.routeResult.ghostBall.y - targetBall.y
    const projectedOffset = (ghostOffsetX * perpendicularX + ghostOffsetY * perpendicularY) / (BALL_RADIUS * 2)
    return Math.max(-1, Math.min(1, projectedOffset))
  }

  function getSightAimDescription(offset: number): SightDescription {
    // offset ∈ [-1, 1]：以球心为 0、左右边缘为 ±0.5。换算为「自左侧边缘起、整球宽度的六分之几」。
    const units = Math.round((offset + 0.5) * 6)

    if (units <= 0) {
      if (units === 0) {
        return { scene: '瞄准 · 左侧边缘', detail: '瞄准目标球左侧边缘。' }
      }
      const n = Math.min(-units, SIGHT_OUTSIDE_LABELS.length - 1)
      return { scene: '瞄准 · 左侧球外', detail: `瞄准目标球左侧边缘外${SIGHT_OUTSIDE_LABELS[n]}球距离。` }
    }

    if (units >= 6) {
      if (units === 6) {
        return { scene: '瞄准 · 右侧边缘', detail: '瞄准目标球右侧边缘。' }
      }
      const n = Math.min(units - 6, SIGHT_OUTSIDE_LABELS.length - 1)
      return { scene: '瞄准 · 右侧球外', detail: `瞄准目标球右侧边缘外${SIGHT_OUTSIDE_LABELS[n]}球距离。` }
    }

    const label = SIGHT_INSIDE_LABELS[units]
    if (units === 3) {
      return { scene: '瞄准 · 中央', detail: '瞄准目标球中央（球心对齐）。' }
    }
    const sideHalf = units < 3 ? '左半球' : '右半球'
    return { scene: `瞄准 · ${sideHalf}`, detail: `瞄准目标球（自左侧起）${label}位置。` }
  }

  function calculateRoute(): void {
    const cueBall = getBallPoint('cue')
    const targetBall = getBallPoint('target')
    if (!cueBall || !targetBall) {
      state.routeResult = createInvalidRoute('请先放置白球和黑球')
    } else {
      state.routeResult = getRouteForPocket(cueBall, targetBall, selectedPocket.value)
    }
    state.routeValid = Boolean(state.routeResult?.valid)
    state.routeMessage = state.routeResult?.message || ''
  }

  function setLineDash(pattern: number[]): void {
    if (typeof canvasContext?.setLineDash === 'function') {
      canvasContext.setLineDash(pattern)
    }
  }

  function drawTable(): void {
    const ctx = canvasContext
    ctx.save()
    ctx.fillStyle = '#147a54'
    ctx.fillRect(tableRect.x, tableRect.y, tableRect.width, tableRect.height)
    ctx.strokeStyle = '#18372f'
    ctx.lineWidth = 8
    ctx.strokeRect(tableRect.x, tableRect.y, tableRect.width, tableRect.height)
    ctx.strokeStyle = '#8d6840'
    ctx.lineWidth = 3
    ctx.strokeRect(tableRect.x - 5, tableRect.y - 5, tableRect.width + 10, tableRect.height + 10)
    ctx.restore()
  }

  function drawTableMarkLines(): void {
    const ctx = canvasContext
    tableMarkLines.forEach(line => {
      ctx.save()
      ctx.strokeStyle = line.color
      ctx.lineWidth = line.type === 'solid' ? 1.7 : 1.2
      setLineDash(line.type === 'dashed' ? [7, 5] : [])
      drawCanvasLine(tableToCanvas(line.from), tableToCanvas(line.to))
      ctx.restore()
    })
  }

  function drawPositionGrid(): void {
    const ctx = canvasContext
    ctx.save()
    for (let xIndex = 0; xIndex <= GRID_X_MAX; xIndex += DISPLAY_GRID_STEP) {
      for (let yIndex = 0; yIndex <= GRID_Y_MAX; yIndex += DISPLAY_GRID_STEP) {
        const point = tableToCanvas(gridPointToTablePoint({ xIndex, yIndex }))
        const isMajor = xIndex % 40 === 0 && yIndex % 40 === 0
        ctx.beginPath()
        ctx.arc(point.x, point.y, isMajor ? 1.2 : 0.65, 0, Math.PI * 2)
        ctx.fillStyle = isMajor ? 'rgba(231, 244, 237, 0.54)' : 'rgba(231, 244, 237, 0.22)'
        ctx.fill()
      }
    }
    ctx.restore()
  }

  function drawTicks(): void {
    const ctx = canvasContext
    const tickLength = 4
    const labelOffset = 12

    ctx.save()
    ctx.strokeStyle = 'rgba(214, 228, 220, 0.82)'
    ctx.fillStyle = '#4f6059'
    ctx.lineWidth = 1
    ctx.font = '9.5px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    LEFT_BANK_REFERENCE.forEach((label, index) => {
      const ratio = (index + 1) / (LEFT_BANK_REFERENCE.length + 1)
      const leftPoint = tableToCanvas({ x: ratio * TABLE_WIDTH, y: 0 })
      ctx.beginPath()
      ctx.moveTo(tableRect.x - tickLength, leftPoint.y)
      ctx.lineTo(tableRect.x, leftPoint.y)
      ctx.stroke()
      ctx.fillText(label, tableRect.x - labelOffset, leftPoint.y)
    })

    RIGHT_BANK_REFERENCE.forEach((label, index) => {
      const ratio = (index + 1) / (RIGHT_BANK_REFERENCE.length + 1)
      const rightPoint = tableToCanvas({ x: ratio * TABLE_WIDTH, y: TABLE_HEIGHT })
      ctx.beginPath()
      ctx.moveTo(tableRect.x + tableRect.width, rightPoint.y)
      ctx.lineTo(tableRect.x + tableRect.width + tickLength, rightPoint.y)
      ctx.stroke()
      ctx.fillText(label, tableRect.x + tableRect.width + labelOffset, rightPoint.y)
    })

    for (let index = 1; index < 5; index += 1) {
      const topPoint = tableToCanvas({ x: 0, y: (index / 5) * TABLE_HEIGHT })
      const bottomPoint = tableToCanvas({ x: TABLE_WIDTH, y: (index / 5) * TABLE_HEIGHT })
      ctx.beginPath()
      ctx.arc(topPoint.x, tableRect.y - 4, 1.5, 0, Math.PI * 2)
      ctx.arc(bottomPoint.x, tableRect.y + tableRect.height + 4, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  function drawPockets(): void {
    const ctx = canvasContext
    POCKETS.forEach(pocket => {
      const point = tableToCanvas(pocket)
      const selected = pocket.id === state.selectedPocketId
      const radius = Math.max(getPocketRadius(pocket), 10)
      ctx.save()
      ctx.beginPath()
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = '#101b18'
      ctx.fill()
      if (selected) {
        ctx.strokeStyle = '#ffd765'
        ctx.lineWidth = 2.5
        ctx.stroke()
      }
      ctx.restore()
    })
  }

  function getPocketRadius(pocket: Pocket): number {
    const diameterMultiplier = pocket.id.startsWith('m')
      ? MIDDLE_POCKET_DIAMETER_MULTIPLIER
      : CORNER_POCKET_DIAMETER_MULTIPLIER
    return logicalLengthToCanvas(BALL_DIAMETER * diameterMultiplier * 0.5)
  }

  function drawBalls(): void {
    const cueBall = getBallPoint('cue')
    const targetBall = getBallPoint('target')
    if (cueBall) {
      drawBall(cueBall, 'cue')
    }
    if (targetBall) {
      drawBall(targetBall, 'target')
    }
  }

  function drawBall(point: Point, type: BallType): void {
    const ctx = canvasContext
    const center = tableToCanvas(point)
    const radius = logicalLengthToCanvas(BALL_RADIUS)
    const active = state.activeBall === type
    ctx.save()
    if (active) {
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius + 4, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 219, 112, 0.95)'
      ctx.lineWidth = 3
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = type === 'cue' ? '#fffdf3' : '#101312'
    ctx.fill()
    ctx.strokeStyle = type === 'cue' ? '#34413c' : '#d8ddd9'
    ctx.lineWidth = 1.5
    ctx.stroke()
    if (type === 'cue') {
      ctx.beginPath()
      ctx.arc(center.x - radius * 0.3, center.y - radius * 0.35, Math.max(1, radius * 0.2), 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fill()
    }
    ctx.restore()
  }

  function drawRoute(): void {
    if (!state.routeResult?.valid) {
      return
    }
    const ctx = canvasContext
    state.routeResult.segments.forEach(segment => {
      drawRouteWidthGuides(segment)
      ctx.save()
      const cueSegment = segment.type === 'dashed'
      ctx.strokeStyle = cueSegment ? '#e8f5ff' : '#ffd75e'
      ctx.lineWidth = cueSegment ? 2 : 2.5
      setLineDash(cueSegment ? [7, 5] : [])
      drawCanvasLine(tableToCanvas(segment.from), tableToCanvas(segment.to))
      ctx.restore()
    })
  }

  function drawRouteWidthGuides(segment: RouteSegment): void {
    const guideLines = getRouteWidthGuideLines(segment.from, segment.to)
    if (!guideLines.length) {
      return
    }

    const ctx = canvasContext
    const cueSegment = segment.type === 'dashed'
    ctx.save()
    ctx.strokeStyle = cueSegment ? 'rgba(232, 245, 255, 0.36)' : 'rgba(255, 223, 128, 0.34)'
    ctx.lineWidth = 1
    setLineDash(cueSegment ? [5, 5] : [])
    guideLines.forEach(line => {
      drawCanvasLine(tableToCanvas(line.from), tableToCanvas(line.to))
    })
    ctx.restore()
  }

  function getRouteWidthGuideLines(from: Point, to: Point): Array<{ from: Point; to: Point }> {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const distance = Math.hypot(dx, dy)
    if (distance < EPSILON) {
      return []
    }

    const normal = {
      x: (-dy / distance) * BALL_RADIUS,
      y: (dx / distance) * BALL_RADIUS,
    }

    return [
      {
        from: { x: from.x + normal.x, y: from.y + normal.y },
        to: { x: to.x + normal.x, y: to.y + normal.y },
      },
      {
        from: { x: from.x - normal.x, y: from.y - normal.y },
        to: { x: to.x - normal.x, y: to.y - normal.y },
      },
    ]
  }

  function drawGhostBall(): void {
    if (!state.routeResult?.valid || !state.routeResult.ghostBall) {
      return
    }
    const ctx = canvasContext
    const center = tableToCanvas(state.routeResult.ghostBall)
    ctx.save()
    ctx.beginPath()
    ctx.arc(center.x, center.y, logicalLengthToCanvas(BALL_RADIUS), 0, Math.PI * 2)
    ctx.strokeStyle = '#ecf8ff'
    ctx.lineWidth = 2
    setLineDash([5, 4])
    ctx.stroke()
    ctx.restore()
  }

  function drawBankPoint(): void {
    if (!state.routeResult?.valid || !state.routeResult.bankPoint) {
      return
    }
    const ctx = canvasContext
    const center = tableToCanvas(state.routeResult.bankPoint)
    ctx.save()
    ctx.beginPath()
    ctx.arc(center.x, center.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#ff8a4c'
    ctx.fill()
    ctx.strokeStyle = '#fff5e9'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }

  function redrawSight(): void {
    if (!sightCanvasContext || !sightCanvasWidth || !sightCanvasHeight) {
      return
    }
    const ctx = sightCanvasContext
    const width = sightCanvasWidth
    const height = sightCanvasHeight
    ctx.clearRect(0, 0, width, height)

    const background = ctx.createLinearGradient(0, 0, 0, height)
    background.addColorStop(0, '#102b25')
    background.addColorStop(1, '#1d6f50')
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.strokeStyle = 'rgba(222, 241, 231, 0.28)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(width * 0.08, height * 0.52)
    ctx.lineTo(width * 0.92, height * 0.52)
    ctx.stroke()
    ctx.restore()

    if (!state.cueBall || !state.targetBall || !state.routeResult?.valid || !state.routeResult.ghostBall) {
      ctx.save()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('放置两球后显示击球位置', width / 2, height / 2)
      ctx.restore()
      return
    }

    const offset = getSightOffset()
    const radius = Math.min(width * 0.14, height * 0.27)
    const targetCenter = { x: width / 2, y: height * 0.52 }
    const cueCenter = {
      x: targetCenter.x + offset * radius * 2,
      y: targetCenter.y,
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(targetCenter.x, targetCenter.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#111514'
    ctx.fill()
    ctx.strokeStyle = '#f0f4f1'
    ctx.lineWidth = 2.5
    ctx.setLineDash([])
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.arc(cueCenter.x, cueCenter.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.fill()
    ctx.strokeStyle = '#f7fbf9'
    ctx.lineWidth = 2.5
    ctx.setLineDash([7, 5])
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(cueCenter.x, height * 0.1)
    ctx.lineTo(cueCenter.x, height * 0.9)
    ctx.strokeStyle = 'rgba(255, 225, 135, 0.92)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 5])
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('黑球', targetCenter.x, targetCenter.y - radius - 10)
    ctx.fillText('白球虚线', cueCenter.x, targetCenter.y + radius + 17)
    ctx.restore()
  }

  function drawCanvasLine(from: Point, to: Point): void {
    canvasContext.beginPath()
    canvasContext.moveTo(from.x, from.y)
    canvasContext.lineTo(to.x, to.y)
    canvasContext.stroke()
  }

  function logicalLengthToCanvas(value: number): number {
    return value * getTableScale()
  }

  function getTableScale(): number {
    if (!tableRect.width) {
      return 0
    }
    return tableRect.width / TABLE_HEIGHT
  }

  function redraw(): void {
    redrawTableCanvas()
    redrawSight()
  }

  function scheduleSightRedraw(): void {
    if (sightRedrawTimer) {
      clearTimeout(sightRedrawTimer)
    }
    sightRedrawTimer = setTimeout(() => {
      sightRedrawTimer = null
      redrawSight()
    }, 0)
  }

  function redrawTableCanvas(): void {
    if (!canvasContext || !canvasWidth || !canvasHeight) {
      return
    }
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight)
    drawTable()
    drawPositionGrid()
    drawTableMarkLines()
    drawTicks()
    drawPockets()
    drawRoute()
    drawGhostBall()
    drawBalls()
    drawBankPoint()
  }

  async function initializeCanvas(): Promise<void> {
    if (isInitializing) {
      return
    }
    isInitializing = true
    await nextTick()

    try {
      const [result, sightResult] = await Promise.all([queryCanvasNode(CANVAS_ID), queryCanvasNode(SIGHT_CANVAS_ID)])
      if (!result?.node || !result.width || !result.height || !sightResult?.node || !sightResult.width || !sightResult.height) {
        state.routeMessage = 'Canvas 初始化失败，请重新进入页面'
        return
      }

      const shouldResetContext =
        !canvasContext || canvasNode !== result.node || canvasWidth !== result.width || canvasHeight !== result.height

      canvasWidth = result.width
      canvasHeight = result.height
      canvasRect = {
        left: (result.left || 0) + (result.scrollLeft || 0),
        top: (result.top || 0) + (result.scrollTop || 0),
      }

      if (shouldResetContext) {
        canvasNode = result.node
        // #ifdef H5
        canvasContext = canvasNode.getContext('2d')
        // #endif
        // #ifndef H5
        const pixelRatio = Math.min(3, uni.getSystemInfoSync?.().pixelRatio || 1)
        canvasNode.width = canvasWidth * pixelRatio
        canvasNode.height = canvasHeight * pixelRatio
        canvasContext = canvasNode.getContext('2d')
        canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        // #endif
      }

      const shouldResetSightContext =
        !sightCanvasContext ||
        sightCanvasNode !== sightResult.node ||
        sightCanvasWidth !== sightResult.width ||
        sightCanvasHeight !== sightResult.height

      sightCanvasWidth = sightResult.width
      sightCanvasHeight = sightResult.height
      if (shouldResetSightContext) {
        sightCanvasNode = sightResult.node
        // #ifdef H5
        sightCanvasContext = sightCanvasNode.getContext('2d')
        // #endif
        // #ifndef H5
        const sightPixelRatio = Math.min(3, uni.getSystemInfoSync?.().pixelRatio || 1)
        sightCanvasNode.width = sightCanvasWidth * sightPixelRatio
        sightCanvasNode.height = sightCanvasHeight * sightPixelRatio
        sightCanvasContext = sightCanvasNode.getContext('2d')
        sightCanvasContext.setTransform(sightPixelRatio, 0, 0, sightPixelRatio, 0, 0)
        // #endif
      }

      const horizontalPadding = Math.max(18, Math.min(24, canvasWidth * 0.06))
      const verticalPadding = 12
      const widthLimitedWidth = canvasWidth - horizontalPadding * 2
      const heightLimitedWidth = (canvasHeight - verticalPadding * 2) / TABLE_LENGTH_TO_WIDTH_RATIO
      const tableWidth = Math.max(0, Math.min(widthLimitedWidth, heightLimitedWidth))
      const tableHeight = tableWidth * TABLE_LENGTH_TO_WIDTH_RATIO
      tableRect = {
        x: (canvasWidth - tableWidth) / 2,
        y: (canvasHeight - tableHeight) / 2,
        width: tableWidth,
        height: tableHeight,
      }
      calculateRoute()
      redraw()
    } finally {
      isInitializing = false
    }
  }

  function queryCanvasNode(canvasId: string): Promise<any> {
    return new Promise(resolve => {
      let nodeResult: any = null
      let rectResult: any = null
      let scrollResult: any = null
      let query = uni.createSelectorQuery()
      if (instance?.proxy) {
        query = query.in(instance.proxy)
      }
      query.select(`#${canvasId}`).fields({ node: true, size: true }, (result: any) => {
        nodeResult = result
      })
      query.select(`#${canvasId}`).boundingClientRect((result: any) => {
        rectResult = result
      })
      query.selectViewport().scrollOffset((result: any) => {
        scrollResult = result
      })
      query.exec(() => resolve({ ...nodeResult, ...rectResult, ...scrollResult }))
    })
  }

  function getTapCanvasPoint(event: any): Point | null {
    const touch = event.changedTouches?.[0] || event.touches?.[0]
    if (touch && Number.isFinite(touch.pageX) && Number.isFinite(touch.pageY)) {
      return {
        x: touch.pageX - canvasRect.left,
        y: touch.pageY - canvasRect.top,
      }
    }
    if (Number.isFinite(event.pageX) && Number.isFinite(event.pageY)) {
      return {
        x: event.pageX - canvasRect.left,
        y: event.pageY - canvasRect.top,
      }
    }
    // #ifdef H5
    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      return {
        x: event.clientX + window.scrollX - canvasRect.left,
        y: event.clientY + window.scrollY - canvasRect.top,
      }
    }
    // #endif
    if (Number.isFinite(event.detail?.x) && Number.isFinite(event.detail?.y)) {
      const detailPoint = {
        x: event.detail.x,
        y: event.detail.y,
      }
      // #ifdef H5
      const clientPoint = {
        x: detailPoint.x + window.scrollX - canvasRect.left,
        y: detailPoint.y + window.scrollY - canvasRect.top,
      }
      if (clientPoint.x >= 0 && clientPoint.x <= canvasWidth && clientPoint.y >= 0 && clientPoint.y <= canvasHeight) {
        return clientPoint
      }
      // #endif
      const isPageCoordinate =
        detailPoint.x >= canvasRect.left &&
        detailPoint.x <= canvasRect.left + canvasWidth &&
        detailPoint.y >= canvasRect.top &&
        detailPoint.y <= canvasRect.top + canvasHeight
      if (isPageCoordinate) {
        return {
          x: detailPoint.x - canvasRect.left,
          y: detailPoint.y - canvasRect.top,
        }
      }
      return {
        x: detailPoint.x,
        y: detailPoint.y,
      }
    }
    return null
  }

  function getPocketAtCanvasPoint(point: Point): Pocket | null {
    return (
      POCKETS.find(pocket => {
        const pocketPoint = tableToCanvas(pocket)
        const hitRadius = Math.max(16, getPocketRadius(pocket) + 6)
        return Math.hypot(point.x - pocketPoint.x, point.y - pocketPoint.y) <= hitRadius
      }) || null
    )
  }

  function handleCanvasTap(event: any): void {
    const canvasPoint = getTapCanvasPoint(event)
    if (!canvasPoint) {
      return
    }

    const tappedPocket = getPocketAtCanvasPoint(canvasPoint)
    if (tappedPocket) {
      setPocket(tappedPocket.id)
      return
    }

    if (!isCanvasPointInsideTable(canvasPoint)) {
      return
    }

    const gridPoint = tablePointToGridPoint(canvasToTable(canvasPoint), CLICK_GRID_STEP)
    setBallGridPoint(state.activeBall, gridPoint)
  }

  function isCanvasPointInsideTable(point: Point): boolean {
    return (
      point.x >= tableRect.x &&
      point.x <= tableRect.x + tableRect.width &&
      point.y >= tableRect.y &&
      point.y <= tableRect.y + tableRect.height
    )
  }

  function refreshRoute(): void {
    calculateRoute()
    redrawTableCanvas()
    scheduleSightRedraw()
  }

  function setActiveBall(ball: BallType): void {
    state.activeBall = ball
    redrawTableCanvas()
  }

  function getDefaultGridPoint(type: BallType): GridPoint {
    return type === 'cue' ? { xIndex: 600, yIndex: 200 } : { xIndex: 280, yIndex: 200 }
  }

  function ballsOverlap(type: BallType, gridPoint: GridPoint): boolean {
    const otherPoint = getBallPoint(type === 'cue' ? 'target' : 'cue')
    if (!otherPoint) {
      return false
    }
    const point = gridPointToTablePoint(gridPoint)
    return Math.hypot(point.x - otherPoint.x, point.y - otherPoint.y) < BALL_DIAMETER - EPSILON
  }

  function setBallGridPoint(type: BallType, point: GridPoint): boolean {
    const nextPoint = clampGridPoint(point)
    if (ballsOverlap(type, nextPoint)) {
      uni.showToast?.({ title: '两球球心距离不能小于一颗球直径', icon: 'none' })
      return false
    }

    if (type === 'cue') {
      state.cueBall = nextPoint
    } else {
      state.targetBall = nextPoint
      selectNearestPocket()
    }
    refreshRoute()
    return true
  }

  function adjustBallCoordinate(type: BallType, axis: CoordinateAxis, delta: number): void {
    const current = type === 'cue' ? state.cueBall : state.targetBall
    const nextPoint = { ...(current || getDefaultGridPoint(type)) }
    if (axis === 'x') {
      nextPoint.yIndex += delta * CONTROL_GRID_STEP
    } else {
      nextPoint.xIndex += delta * CONTROL_GRID_STEP
    }
    state.activeBall = type
    setBallGridPoint(type, nextPoint)
  }

  function setRouteMode(mode: RouteMode): void {
    state.routeMode = mode
    selectNearestPocket()
    refreshRoute()
  }

  const lastCushion = ref<Cushion>('left')

  const activeRouteTab = computed<RouteCategory>(() => {
    if (state.routeMode === 'direct') {
      return 'direct'
    }
    return state.routeMode.startsWith('double_') ? 'bank2' : 'bank1'
  })

  const activeCushion = computed<Cushion>(() => {
    if (state.routeMode === 'direct') {
      return lastCushion.value
    }
    return state.routeMode.replace(/^(bank_|double_)/, '') as Cushion
  })

  const isCushionDisabled = computed(() => activeRouteTab.value === 'direct')

  function setRouteTab(tab: RouteCategory): void {
    if (tab === 'direct') {
      setRouteMode('direct')
      return
    }
    const prefix = tab === 'bank2' ? 'double' : 'bank'
    setRouteMode(`${prefix}_${lastCushion.value}` as RouteMode)
  }

  function setRouteCushion(cushion: Cushion): void {
    if (activeRouteTab.value === 'direct') {
      return
    }
    lastCushion.value = cushion
    const prefix = activeRouteTab.value === 'bank2' ? 'double' : 'bank'
    setRouteMode(`${prefix}_${cushion}` as RouteMode)
  }

  function setPocket(pocketId: string): void {
    state.selectedPocketId = pocketId
    state.pocketSelectionMode = 'manual'
    refreshRoute()
  }

  const isH5 = ref(false)
  const isWeixinMiniProgram = ref(false)

  // #ifdef H5
  isH5.value = true
  // #endif

  // #ifdef MP-WEIXIN
  isWeixinMiniProgram.value = true
  uni.showShareMenu({ withShareTicket: true })
  // #endif

  const SHARE_TITLE = '台球瞄准器 · 凉白开工具箱'
  const SHARE_PATH = '/subPackages/tools/pool-aim/index'

  function handleShare(): void {
    if (!isH5.value) {
      uni.showToast({ title: '请点击右上角分享', icon: 'none' })
      return
    }
    const shareUrl = `${window.location.origin}${SHARE_PATH}`
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => uni.showToast({ title: '链接已复制', icon: 'success' }))
        .catch(() => uni.showModal({ title: '分享链接', content: shareUrl, showCancel: false }))
    } else {
      uni.showModal({ title: '分享链接', content: shareUrl, showCancel: false })
    }
  }

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({
    title: SHARE_TITLE,
    path: SHARE_PATH,
  }))

  onShareTimeline(() => ({
    title: SHARE_TITLE,
    query: '',
  }))
  // #endif

  onMounted(() => {
    initializeCanvas()
    if (typeof uni.onWindowResize === 'function') {
      windowResizeHandler = () => initializeCanvas()
      uni.onWindowResize(windowResizeHandler)
    }
  })

  onBeforeUnmount(() => {
    if (sightRedrawTimer) {
      clearTimeout(sightRedrawTimer)
    }
    if (windowResizeHandler && typeof uni.offWindowResize === 'function') {
      uni.offWindowResize(windowResizeHandler)
    }
  })
</script>

<style lang="scss" scoped>
  .pool-page {
    min-height: 100vh;
    padding: 28rpx 24rpx calc(48rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: radial-gradient(circle at 10% 0%, rgba(35, 158, 106, 0.16), transparent 34%), #f3f6f4;
    color: #1d2b26;
  }

  .hero {
    padding: 16rpx 8rpx 20rpx;
  }

  .share-entry {
    padding: 12rpx 0 0;
    text-align: center;
  }

  .share-tip {
    font-size: 24rpx;
    color: #6c7d76;
  }

  .share-btn {
    width: 100%;
    margin-top: 12rpx;
    border: 1rpx dashed #239e6a;
    border-radius: 20rpx;
    height: 88rpx;
    background: rgba(35, 158, 106, 0.08);
    color: #147a54;
    font-size: 28rpx;
  }

  .hero-title,
  .hero-subtitle,
  .section-title,
  .section-tip,
  .status-label,
  .status-value {
    display: block;
  }

  .hero-title {
    font-size: 40rpx;
    font-weight: 700;
    letter-spacing: 2rpx;
  }

  .hero-subtitle {
    margin-top: 8rpx;
    color: #6c7974;
    font-size: 22rpx;
    line-height: 1.5;
  }

  .panel,
  .table-card {
    margin-bottom: 24rpx;
    padding: 26rpx;
    border: 1rpx solid rgba(35, 76, 61, 0.08);
    border-radius: 24rpx;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 12rpx 36rpx rgba(31, 66, 52, 0.07);
  }

  .table-card {
    padding: 10rpx;
    background: #ffffff;
  }

  .selector-brief {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .selector-label {
    color: #5d6d66;
    font-size: 22rpx;
  }

  .selector-value {
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    background: #e9f7f0;
    color: #147a54;
    font-size: 21rpx;
    font-weight: 600;
  }

  .selector-segmented {
    gap: 10rpx;
  }

  .table-heading {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 6rpx 8rpx 0;
  }

  .title-switch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    padding: 4rpx;
    border-radius: 999rpx;
    background: #eef2f0;
    justify-self: center;
  }

  .title-switch-item {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 7rpx 20rpx;
    border-radius: 999rpx;
    color: #8a9691;
    font-size: 26rpx;
    line-height: 1.2;
    transition: all 0.2s ease;
  }

  .title-switch-item.active {
    background: #ffffff;
    color: #147a54;
    font-weight: 650;
    box-shadow: 0 2rpx 6rpx rgba(20, 122, 84, 0.14);
  }

  .title-switch-dot {
    width: 26rpx;
    height: 26rpx;
    box-sizing: border-box;
    border-radius: 50%;
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    margin-bottom: 22rpx;
  }

  .section-title {
    font-size: 30rpx;
    font-weight: 650;
    justify-self: start;
  }

  .section-tip {
    color: #8a9691;
    font-size: 21rpx;
    text-align: right;
    justify-self: end;
  }

  .segmented {
    display: grid;
    gap: 12rpx;
  }

  .two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .three-columns {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 20rpx;
  }

  .segment-item,
  .option-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 74rpx;
    border: 2rpx solid #e2e9e5;
    border-radius: 16rpx;
    background: #f8faf9;
    color: #607069;
    font-size: 25rpx;
    transition: all 0.2s ease;
  }

  .segment-item.active,
  .option-button.active {
    border-color: #1f9d68;
    background: #e9f7f0;
    color: #147a54;
    font-weight: 600;
    box-shadow: inset 0 0 0 1rpx rgba(31, 157, 104, 0.16);
  }

  .segment-item.compact {
    min-height: 66rpx;
    font-size: 22rpx;
  }

  .ball-dot {
    width: 26rpx;
    height: 26rpx;
    margin-right: 8rpx;
    border-radius: 50%;
  }

  .cue-dot {
    border: 2rpx solid #65736d;
    background: #fff;
  }

  .target-dot {
    border: 2rpx solid #111;
    background: #111;
  }

  .canvas-shell {
    position: relative;
    width: 100%;
    margin: 0 auto;
    aspect-ratio: 6 / 11;
    overflow: hidden;
    border-radius: 16rpx;
    background: #ffffff;
  }

  .pool-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .table-hint {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 42rpx;
    padding: 14rpx 8rpx 0;
    color: #6e7a75;
    font-size: 22rpx;
  }

  .snap-badge {
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    background: #e9f7f0;
    color: #167c56;
    font-size: 20rpx;
  }

  .coordinate-readout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10rpx;
    padding: 10rpx 8rpx 2rpx;
    color: #53655d;
    font-size: 20rpx;
  }

  .coordinate-readout text {
    padding: 10rpx 12rpx;
    border-radius: 12rpx;
    background: #f3f7f5;
    text-align: center;
  }

  .bank-scale-note {
    padding: 12rpx 8rpx 2rpx;
    color: #8a6b3f;
    font-size: 18rpx;
    line-height: 1.4;
    text-align: center;
  }

  .pocket-hint {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10rpx;
    padding: 8rpx 8rpx 0;
    color: #43554d;
    font-size: 22rpx;
  }

  .pocket-mode {
    padding: 5rpx 12rpx;
    border-radius: 999rpx;
    background: #fff3d5;
    color: #966415;
    font-size: 19rpx;
  }

  .pocket-action {
    width: 100%;
    color: #8c9893;
    font-size: 19rpx;
  }

  .sight-panel {
    overflow: hidden;
  }

  .sight-canvas-shell {
    position: relative;
    width: 100%;
    height: 200rpx;
    overflow: hidden;
    border-radius: 18rpx;
    background: #153f34;
  }

  .sight-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .sight-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32rpx;
    margin-top: 18rpx;
    color: #63726c;
    font-size: 21rpx;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 9rpx;
  }

  .legend-ball {
    width: 24rpx;
    height: 24rpx;
    box-sizing: border-box;
    border-radius: 50%;
  }

  .cue-legend {
    border: 2rpx dashed #71827a;
    background: #fff;
  }

  .target-legend {
    border: 2rpx solid #111;
    background: #111;
  }

  .sight-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
    margin-top: 16rpx;
    padding: 16rpx 18rpx;
    border-radius: 14rpx;
    background: #eef7f2;
    color: #315f4e;
    line-height: 1.55;
    text-align: center;
  }

  .sight-scene {
    color: #19774f;
    font-size: 23rpx;
    font-weight: 700;
  }

  .sight-detail {
    color: #49665b;
    font-size: 22rpx;
  }

  .ball-control-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
    margin-top: 16rpx;
  }

  .ball-control-card {
    padding: 16rpx 14rpx;
    border: 2rpx solid #e5ebe8;
    border-radius: 18rpx;
    background: #f8faf9;
  }

  .ball-control-card.active {
    border-color: #1f9d68;
    background: #f0faf5;
  }

  .ball-control-heading,
  .ball-control-name,
  .axis-control,
  .axis-actions {
    display: flex;
    align-items: center;
  }

  .ball-control-heading,
  .axis-control {
    justify-content: space-between;
  }

  .ball-control-heading {
    margin-bottom: 14rpx;
    gap: 8rpx;
    color: #53635c;
    font-size: 20rpx;
  }

  .ball-control-name {
    color: #22332c;
    font-size: 24rpx;
    font-weight: 600;
  }

  .ball-control-name .ball-dot {
    flex: none;
  }

  .axis-control + .axis-control {
    margin-top: 12rpx;
  }

  .axis-name {
    color: #62716b;
    font-size: 21rpx;
  }

  .axis-actions {
    gap: 6rpx;
  }

  .coordinate-button {
    width: 52rpx;
    height: 52rpx;
    margin: 0;
    padding: 0;
    border-radius: 12rpx;
    background: #e7f5ed;
    color: #167b55;
    font-size: 30rpx;
    line-height: 52rpx;
  }

  .coordinate-button::after {
    border: 0;
  }

  .axis-value {
    min-width: 66rpx;
    color: #24362e;
    font-size: 23rpx;
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  .grid-note {
    display: flex;
    justify-content: space-between;
    gap: 12rpx;
    margin-top: 16rpx;
    color: #84918c;
    font-size: 19rpx;
  }

  .option-grid {
    display: grid;
    gap: 12rpx;
  }

  .route-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .route-tabs {
    display: flex;
    gap: 10rpx;
    margin-bottom: 18rpx;
    padding: 6rpx;
    border-radius: 16rpx;
    background: #f1f5f3;
  }

  .route-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 64rpx;
    border-radius: 12rpx;
    color: #607069;
    font-size: 24rpx;
    transition: all 0.2s ease;
  }

  .route-tab.active {
    background: #ffffff;
    color: #147a54;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(31, 66, 52, 0.08);
  }

  .cushion-grid.disabled {
    opacity: 0.45;
  }

  .option-button.disabled {
    color: #aab4af;
  }

  .option-button {
    min-height: 68rpx;
    font-size: 23rpx;
  }

  .status-chip {
    padding: 7rpx 17rpx;
    border-radius: 999rpx;
    font-size: 21rpx;
    font-weight: 600;
  }

  .status-chip.valid {
    background: #e4f7ed;
    color: #148255;
  }

  .status-chip.invalid {
    background: #fff0e7;
    color: #c65e2b;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
  }

  .status-item {
    padding: 18rpx 10rpx;
    border-radius: 14rpx;
    background: #f6f8f7;
    text-align: center;
  }

  .status-label {
    color: #929d98;
    font-size: 20rpx;
  }

  .status-value {
    margin-top: 7rpx;
    color: #26362f;
    font-size: 24rpx;
    font-weight: 600;
  }

  .route-message {
    margin-top: 18rpx;
    padding: 17rpx 20rpx;
    border-radius: 14rpx;
    background: #eef8f3;
    color: #31735a;
    font-size: 22rpx;
    line-height: 1.55;
  }

  .route-message.warning {
    background: #fff5ed;
    color: #a6532d;
  }
</style>
