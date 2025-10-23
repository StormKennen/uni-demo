import { ref } from 'vue'

/**
 * 族谱树形图表交互功能Hook
 */
export function useFamilyTreeInteraction() {
  // 触摸状态
  const touchState = ref({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    isDragging: false,
    startTime: 0,
    touchCount: 0
  })

  // 滚动状态
  const scrollState = ref({
    scrollLeft: 0,
    scrollTop: 0,
    isScrolling: false
  })

  /**
   * 触摸开始
   */
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    const now = Date.now()

    touchState.value = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      isDragging: false,
      startTime: now,
      touchCount: event.touches.length
    }

    // 阻止默认行为
    event.preventDefault()
  }

  /**
   * 触摸移动
   */
  const onTouchMove = (event: TouchEvent) => {
    if (!touchState.value.startTime) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - touchState.value.lastX
    const deltaY = touch.clientY - touchState.value.lastY
    const totalDeltaX = Math.abs(touch.clientX - touchState.value.startX)
    const totalDeltaY = Math.abs(touch.clientY - touchState.value.startY)

    // 判断是否开始拖拽
    if (!touchState.value.isDragging && (totalDeltaX > 10 || totalDeltaY > 10)) {
      touchState.value.isDragging = true
    }

    if (touchState.value.isDragging) {
      // 处理拖拽逻辑
      handleDrag(deltaX, deltaY)
    }

    touchState.value.lastX = touch.clientX
    touchState.value.lastY = touch.clientY

    event.preventDefault()
  }

  /**
   * 触摸结束
   */
  const onTouchEnd = (event: TouchEvent) => {
    const touchDuration = Date.now() - touchState.value.startTime
    const totalDeltaX = Math.abs(touchState.value.lastX - touchState.value.startX)
    const totalDeltaY = Math.abs(touchState.value.lastY - touchState.value.startY)

    // 判断是否为点击事件
    if (!touchState.value.isDragging && touchDuration < 300 && totalDeltaX < 10 && totalDeltaY < 10) {
      handleTap(touchState.value.startX, touchState.value.startY)
    }

    // 重置触摸状态
    touchState.value = {
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      isDragging: false,
      startTime: 0,
      touchCount: 0
    }

    event.preventDefault()
  }

  /**
   * 处理拖拽
   */
  const handleDrag = (deltaX: number, deltaY: number) => {
    // 这里可以实现画布拖拽逻辑
    // 由于使用scroll-view，拖拽主要由scroll-view处理
    console.log('Dragging:', deltaX, deltaY)
  }

  /**
   * 处理点击
   */
  const handleTap = (x: number, y: number) => {
    console.log('Tap at:', x, y)
    // 这里可以实现点击检测逻辑
    // 检测点击的是哪个节点
  }

  /**
   * 滚动事件处理
   */
  const onScroll = (event: any) => {
    const { scrollLeft, scrollTop } = event.detail
    
    scrollState.value = {
      scrollLeft,
      scrollTop,
      isScrolling: true
    }

    // 延迟重置滚动状态
    setTimeout(() => {
      scrollState.value.isScrolling = false
    }, 150)
  }

  /**
   * 缩放处理
   */
  const handleZoom = (scale: number, centerX: number, centerY: number) => {
    // 实现缩放逻辑
    console.log('Zoom:', scale, 'Center:', centerX, centerY)
  }

  /**
   * 双指缩放检测
   */
  const handlePinchZoom = (event: TouchEvent) => {
    if (event.touches.length !== 2) return

    const touch1 = event.touches[0]
    const touch2 = event.touches[1]

    // 计算两指间距离
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )

    // 计算中心点
    const centerX = (touch1.clientX + touch2.clientX) / 2
    const centerY = (touch1.clientY + touch2.clientY) / 2

    // 这里可以实现缩放逻辑
    console.log('Pinch zoom:', distance, centerX, centerY)
  }

  /**
   * 节点点击检测
   */
  const detectNodeClick = (x: number, y: number, nodes: any[]) => {
    // 检测点击位置是否在某个节点内
    for (const node of nodes) {
      const { position } = node
      if (
        x >= position.x &&
        x <= position.x + position.width &&
        y >= position.y &&
        y <= position.y + position.height
      ) {
        return node
      }
    }
    return null
  }

  /**
   * 获取触摸状态
   */
  const getTouchState = () => touchState.value

  /**
   * 获取滚动状态
   */
  const getScrollState = () => scrollState.value

  /**
   * 重置交互状态
   */
  const resetInteractionState = () => {
    touchState.value = {
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      isDragging: false,
      startTime: 0,
      touchCount: 0
    }

    scrollState.value = {
      scrollLeft: 0,
      scrollTop: 0,
      isScrolling: false
    }
  }

  /**
   * 平滑滚动到指定位置
   */
  const scrollToPosition = (x: number, y: number, duration: number = 300) => {
    // 这里可以实现平滑滚动逻辑
    // 由于uni-app的scroll-view限制，可能需要使用其他方式实现
    console.log('Scroll to:', x, y, 'Duration:', duration)
  }

  /**
   * 滚动到指定节点
   */
  const scrollToNode = (nodeId: string, nodes: any[]) => {
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      const centerX = node.position.x + node.position.width / 2
      const centerY = node.position.y + node.position.height / 2
      scrollToPosition(centerX, centerY)
    }
  }

  /**
   * 计算适合的缩放比例
   */
  const calculateFitScale = (canvasWidth: number, canvasHeight: number, viewWidth: number, viewHeight: number) => {
    const scaleX = viewWidth / canvasWidth
    const scaleY = viewHeight / canvasHeight
    return Math.min(scaleX, scaleY, 1) // 不超过1倍
  }

  /**
   * 自适应视图
   */
  const fitToView = (canvasWidth: number, canvasHeight: number, viewWidth: number, viewHeight: number) => {
    const scale = calculateFitScale(canvasWidth, canvasHeight, viewWidth, viewHeight)
    const centerX = (canvasWidth * scale - viewWidth) / 2
    const centerY = (canvasHeight * scale - viewHeight) / 2
    
    return {
      scale,
      scrollLeft: Math.max(0, centerX),
      scrollTop: Math.max(0, centerY)
    }
  }

  return {
    // 触摸事件
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    
    // 滚动事件
    onScroll,
    
    // 缩放相关
    handleZoom,
    handlePinchZoom,
    
    // 节点检测
    detectNodeClick,
    
    // 状态获取
    getTouchState,
    getScrollState,
    
    // 工具方法
    resetInteractionState,
    scrollToPosition,
    scrollToNode,
    calculateFitScale,
    fitToView
  }
}