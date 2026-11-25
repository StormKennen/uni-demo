export interface FamilyTreeLayoutInput {
  id: string
  children?: FamilyTreeLayoutInput[]
}

export interface FamilyTreeLayoutMetrics<T extends FamilyTreeLayoutInput = FamilyTreeLayoutInput> {
  nodeWidth: number
  nodeHeight: number
  horizontalGap: number
  levelGap: number
  paddingX: number
  paddingY: number
  lineWidth: number
  getNodeHeight?: (node: T) => number
}

export interface PositionedFamilyTreeNode<T extends FamilyTreeLayoutInput> {
  node: T
  x: number
  y: number
  width: number
  height: number
  depth: number
}

export interface FamilyTreeConnector {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface FamilyTreeLayoutIssues {
  multipleParentIds: string[]
  cyclicIds: string[]
  rootsWithParents: string[]
}

export interface FamilyTreeLayoutResult<T extends FamilyTreeLayoutInput> {
  nodes: PositionedFamilyTreeNode<T>[]
  connectors: FamilyTreeConnector[]
  width: number
  height: number
  issues: FamilyTreeLayoutIssues
}

const DEFAULT_METRICS: FamilyTreeLayoutMetrics = {
  nodeWidth: 160,
  nodeHeight: 160,
  horizontalGap: 28,
  levelGap: 64,
  paddingX: 24,
  paddingY: 24,
  lineWidth: 2,
}

/**
 * Lay out a visible family-tree forest in top-down rows. Node dimensions never
 * shrink to fit; each generation uses its tallest visible card for row spacing.
 */
export const layoutFamilyTree = <T extends FamilyTreeLayoutInput>(
  roots: T[],
  expandedIds: Set<string>,
  metrics: Partial<FamilyTreeLayoutMetrics<T>> = {},
): FamilyTreeLayoutResult<T> => {
  const options = { ...DEFAULT_METRICS, ...metrics }
  const parentCounts = new Map<string, number>()
  const visitedIds = new Set<string>()
  const activePath: string[] = []
  const activePathIndices = new Map<string, number>()
  const cyclicIds = new Set<string>()

  const inspectNode = (node: FamilyTreeLayoutInput) => {
    const activeIndex = activePathIndices.get(node.id)
    if (activeIndex !== undefined) {
      activePath.slice(activeIndex).forEach(id => cyclicIds.add(id))
      return
    }
    if (visitedIds.has(node.id)) return

    activePathIndices.set(node.id, activePath.length)
    activePath.push(node.id)
    const seenChildIds = new Set<string>()
    const children = node.children || []
    children.forEach(child => {
      if (!child?.id || seenChildIds.has(child.id)) return
      seenChildIds.add(child.id)
      parentCounts.set(child.id, (parentCounts.get(child.id) || 0) + 1)
      inspectNode(child)
    })
    activePath.pop()
    activePathIndices.delete(node.id)
    visitedIds.add(node.id)
  }

  roots.forEach(root => {
    if (root?.id) inspectNode(root)
  })

  const issues: FamilyTreeLayoutIssues = {
    multipleParentIds: [...parentCounts.entries()].filter(([, count]) => count > 1).map(([id]) => id),
    cyclicIds: [...cyclicIds],
    rootsWithParents: roots.filter(root => parentCounts.has(root.id)).map(root => root.id),
  }

  if (issues.multipleParentIds.length || issues.cyclicIds.length || issues.rootsWithParents.length) {
    return { nodes: [], connectors: [], width: 0, height: 0, issues }
  }

  const positionedNodes: PositionedFamilyTreeNode<T>[] = []
  const positionById = new Map<string, PositionedFamilyTreeNode<T>>()
  let nextLeafX = options.paddingX
  const resolveNodeHeight = (node: T) => {
    const requestedHeight = options.getNodeHeight?.(node)
    if (typeof requestedHeight !== 'number' || !Number.isFinite(requestedHeight)) return options.nodeHeight
    return Math.max(options.nodeHeight, Math.ceil(requestedHeight))
  }

  const placeNode = (node: T, depth: number): number => {
    const existing = positionById.get(node.id)
    if (existing) return existing.x + existing.width / 2

    const seenChildIds = new Set<string>()
    const children = expandedIds.has(node.id)
      ? (node.children || []).filter(child => {
          if (!child?.id || seenChildIds.has(child.id)) return false
          seenChildIds.add(child.id)
          return true
        })
      : []

    let centerX: number
    if (children.length === 0) {
      centerX = nextLeafX + options.nodeWidth / 2
      nextLeafX += options.nodeWidth + options.horizontalGap
    } else {
      const childCenters = children.map(child => placeNode(child as T, depth + 1))
      centerX = (childCenters[0] + childCenters[childCenters.length - 1]) / 2
    }

    const positioned: PositionedFamilyTreeNode<T> = {
      node,
      x: centerX - options.nodeWidth / 2,
      y: 0,
      width: options.nodeWidth,
      height: resolveNodeHeight(node),
      depth,
    }
    positionById.set(node.id, positioned)
    positionedNodes.push(positioned)
    return centerX
  }

  const seenRootIds = new Set<string>()
  roots.forEach(root => {
    if (!root?.id || seenRootIds.has(root.id)) return
    seenRootIds.add(root.id)
    placeNode(root, 0)
    nextLeafX += options.horizontalGap
  })

  const rowHeights = new Map<number, number>()
  positionedNodes.forEach(node => {
    rowHeights.set(node.depth, Math.max(rowHeights.get(node.depth) || 0, node.height))
  })
  const maxDepth = positionedNodes.reduce((max, node) => Math.max(max, node.depth), 0)
  const rowTops = new Map<number, number>()
  let nextRowTop = options.paddingY
  for (let depth = 0; depth <= maxDepth; depth += 1) {
    rowTops.set(depth, nextRowTop)
    nextRowTop += rowHeights.get(depth) || options.nodeHeight
    if (depth < maxDepth) nextRowTop += options.levelGap
  }
  positionedNodes.forEach(node => {
    node.y = rowTops.get(node.depth) || options.paddingY
  })

  const connectors: FamilyTreeConnector[] = []
  positionedNodes.forEach(parent => {
    if (!expandedIds.has(parent.node.id)) return
    const seenChildIds = new Set<string>()
    const children = (parent.node.children || [])
      .map(child => positionById.get(child.id))
      .filter((child): child is PositionedFamilyTreeNode<T> => {
        if (!child || child.depth !== parent.depth + 1 || seenChildIds.has(child.node.id)) return false
        seenChildIds.add(child.node.id)
        return true
      })
      .sort((first, second) => first.x - second.x)
    if (children.length === 0) return

    const parentCenterX = parent.x + parent.width / 2
    const parentBottom = parent.y + parent.height
    const childTop = Math.min(...children.map(child => child.y))
    const junctionY = parentBottom + (childTop - parentBottom) / 2
    const halfLine = options.lineWidth / 2

    connectors.push({
      id: `${parent.node.id}:down`,
      x: parentCenterX - halfLine,
      y: parentBottom,
      width: options.lineWidth,
      height: Math.max(0, junctionY - parentBottom),
    })

    const firstCenterX = children[0].x + children[0].width / 2
    const lastCenterX = children[children.length - 1].x + children[children.length - 1].width / 2
    if (lastCenterX > firstCenterX) {
      connectors.push({
        id: `${parent.node.id}:branch`,
        x: firstCenterX,
        y: junctionY - halfLine,
        width: lastCenterX - firstCenterX,
        height: options.lineWidth,
      })
    }

    children.forEach(child => {
      connectors.push({
        id: `${parent.node.id}:${child.node.id}:up`,
        x: child.x + child.width / 2 - halfLine,
        y: junctionY,
        width: options.lineWidth,
        height: Math.max(0, child.y - junctionY),
      })
    })
  })

  const maxRight = positionedNodes.reduce((max, node) => Math.max(max, node.x + node.width), options.paddingX)

  return {
    nodes: positionedNodes,
    connectors,
    width: Math.ceil(maxRight + options.paddingX),
    height: Math.ceil(nextRowTop + options.paddingY),
    issues,
  }
}
