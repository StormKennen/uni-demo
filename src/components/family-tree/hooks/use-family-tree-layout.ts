import { ref, computed } from 'vue'
import type { 
  FamilyTreeData, 
  FamilyTreeNode, 
  PersonInfo,
  RelationInfo,
  ConnectionLine,
  NodePosition
} from '@/types/family-tree'

/**
 * 族谱树形布局算法Hook
 */
export function useFamilyTreeLayout(data: FamilyTreeData) {
  // 响应式数据
  const treeNodes = ref<FamilyTreeNode[]>([])
  const connectionLines = ref<ConnectionLine[]>([])
  const canvasWidth = ref(1000)
  const canvasHeight = ref(800)

  // 布局配置
  const layoutConfig = computed(() => ({
    nodeWidth: data.config.nodeWidth || 200,
    nodeHeight: data.config.nodeHeight || 120,
    horizontalSpacing: data.config.horizontalSpacing || 80,
    verticalSpacing: data.config.verticalSpacing || 100,
    spouseSpacing: 60, // 配偶间距
    siblingSpacing: 40 // 兄弟姐妹间距
  }))

  /**
   * 构建族谱树结构
   */
  const buildFamilyTree = (): FamilyTreeNode[] => {
    const personMap = new Map<string, PersonInfo>()
    const relationMap = new Map<string, RelationInfo[]>()

    // 构建人员映射
    data.persons.forEach(person => {
      personMap.set(person.id, person)
    })

    // 构建关系映射
    data.relations.forEach(relation => {
      if (!relationMap.has(relation.fromPersonId)) {
        relationMap.set(relation.fromPersonId, [])
      }
      relationMap.get(relation.fromPersonId)!.push(relation)
    })

    // 找到根节点
    const rootPerson = personMap.get(data.rootPersonId)
    if (!rootPerson) {
      throw new Error('Root person not found')
    }

    // 递归构建树节点
    const buildNode = (
      person: PersonInfo, 
      level: number = 0, 
      visited: Set<string> = new Set()
    ): FamilyTreeNode => {
      if (visited.has(person.id)) {
        // 避免循环引用，返回简化节点
        return {
          ...person,
          position: { x: 0, y: 0, width: layoutConfig.value.nodeWidth, height: layoutConfig.value.nodeHeight },
          children: [],
          parents: [],
          level,
          isExpanded: true
        }
      }

      visited.add(person.id)

      const node: FamilyTreeNode = {
        ...person,
        position: { x: 0, y: 0, width: layoutConfig.value.nodeWidth, height: layoutConfig.value.nodeHeight },
        children: [],
        parents: [],
        level,
        isExpanded: true
      }

      // 获取相关关系
      const relations = relationMap.get(person.id) || []

      // 查找配偶
      const spouseRelation = relations.find(r => r.relationType === 'spouse')
      if (spouseRelation && data.config.showSpouses) {
        const spousePerson = personMap.get(spouseRelation.toPersonId)
        if (spousePerson) {
          node.spouse = {
            ...spousePerson,
            position: { x: 0, y: 0, width: layoutConfig.value.nodeWidth, height: layoutConfig.value.nodeHeight },
            children: [],
            parents: [],
            level,
            isExpanded: true
          }
        }
      }

      // 查找子女
      const childRelations = relations.filter(r => r.relationType === 'child')
      node.children = childRelations.map(relation => {
        const childPerson = personMap.get(relation.toPersonId)
        if (childPerson) {
          return buildNode(childPerson, level + 1, new Set(visited))
        }
        return null
      }).filter(Boolean) as FamilyTreeNode[]

      // 查找父母
      const parentRelations = data.relations.filter(r => 
        r.relationType === 'parent' && r.toPersonId === person.id
      )
      node.parents = parentRelations.map(relation => {
        const parentPerson = personMap.get(relation.fromPersonId)
        if (parentPerson) {
          return buildNode(parentPerson, level - 1, new Set(visited))
        }
        return null
      }).filter(Boolean) as FamilyTreeNode[]

      return node
    }

    const rootNode = buildNode(rootPerson)
    return [rootNode]
  }

  /**
   * 计算节点位置
   */
  const calculateNodePositions = (nodes: FamilyTreeNode[]): void => {
    if (nodes.length === 0) return

    const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing } = layoutConfig.value

    // 按世代分组
    const generationGroups = new Map<number, FamilyTreeNode[]>()
    const allNodes: FamilyTreeNode[] = []

    const collectNodes = (node: FamilyTreeNode) => {
      allNodes.push(node)
      if (!generationGroups.has(node.generation)) {
        generationGroups.set(node.generation, [])
      }
      generationGroups.get(node.generation)!.push(node)

      // 递归收集子节点
      node.children.forEach(child => collectNodes(child))
    }

    nodes.forEach(node => collectNodes(node))

    // 计算每个世代的布局
    const generations = Array.from(generationGroups.keys()).sort((a, b) => a - b)
    let currentY = 50

    generations.forEach(generation => {
      const generationNodes = generationGroups.get(generation)!
      const totalWidth = generationNodes.length * nodeWidth + (generationNodes.length - 1) * horizontalSpacing
      let currentX = Math.max(50, (canvasWidth.value - totalWidth) / 2)

      generationNodes.forEach((node, index) => {
        // 设置主节点位置
        node.position = {
          x: currentX,
          y: currentY,
          width: nodeWidth,
          height: nodeHeight
        }

        // 如果有配偶，调整位置
        if (node.spouse) {
          const spouseX = currentX + nodeWidth + 20
          node.spouse.position = {
            x: spouseX,
            y: currentY,
            width: nodeWidth * 0.8,
            height: nodeHeight * 0.8
          }
        }

        currentX += nodeWidth + horizontalSpacing
      })

      currentY += nodeHeight + verticalSpacing
    })

    // 更新画布尺寸
    const maxX = Math.max(...allNodes.map(node => node.position.x + node.position.width))
    const maxY = Math.max(...allNodes.map(node => node.position.y + node.position.height))
    
    canvasWidth.value = Math.max(1000, maxX + 100)
    canvasHeight.value = Math.max(800, maxY + 100)
  }

  /**
   * 生成连接线
   */
  const generateConnectionLines = (nodes: FamilyTreeNode[]): ConnectionLine[] => {
    const lines: ConnectionLine[] = []
    const allNodes: FamilyTreeNode[] = []

    const collectNodes = (node: FamilyTreeNode) => {
      allNodes.push(node)
      node.children.forEach(child => collectNodes(child))
    }

    nodes.forEach(node => collectNodes(node))

    allNodes.forEach(node => {
      // 父子连接线
      node.children.forEach(child => {
        const parentCenterX = node.position.x + node.position.width / 2
        const parentBottomY = node.position.y + node.position.height
        const childCenterX = child.position.x + child.position.width / 2
        const childTopY = child.position.y

        const midY = parentBottomY + (childTopY - parentBottomY) / 2

        lines.push({
          id: `parent-child-${node.id}-${child.id}`,
          fromNode: node.id,
          toNode: child.id,
          type: 'child',
          points: [
            { x: parentCenterX, y: parentBottomY },
            { x: parentCenterX, y: midY },
            { x: childCenterX, y: midY },
            { x: childCenterX, y: childTopY }
          ]
        })
      })

      // 配偶连接线
      if (node.spouse) {
        const nodeRightX = node.position.x + node.position.width
        const spouseLeftX = node.spouse.position.x
        const nodeMiddleY = node.position.y + node.position.height / 2
        const spouseMiddleY = node.spouse.position.y + node.spouse.position.height / 2

        lines.push({
          id: `spouse-${node.id}-${node.spouse.id}`,
          fromNode: node.id,
          toNode: node.spouse.id,
          type: 'spouse',
          points: [
            { x: nodeRightX, y: nodeMiddleY },
            { x: spouseLeftX, y: spouseMiddleY }
          ]
        })
      }
    })

    return lines
  }

  /**
   * 计算布局
   */
  const calculateLayout = () => {
    try {
      const nodes = buildFamilyTree()
      calculateNodePositions(nodes)
      
      treeNodes.value = nodes
      connectionLines.value = generateConnectionLines(nodes)
    } catch (error) {
      console.error('Failed to calculate family tree layout:', error)
      treeNodes.value = []
      connectionLines.value = []
    }
  }

  /**
   * 获取可见节点（用于性能优化）
   */
  const getVisibleNodes = (scale: number, scrollX: number, scrollY: number): FamilyTreeNode[] => {
    // 简化实现，返回所有节点
    // 在实际应用中可以根据视口范围过滤节点
    const allNodes: FamilyTreeNode[] = []
    
    const collectNodes = (node: FamilyTreeNode) => {
      allNodes.push(node)
      if (node.spouse) {
        allNodes.push(node.spouse)
      }
      node.children.forEach(child => collectNodes(child))
    }

    treeNodes.value.forEach(node => collectNodes(node))
    return allNodes
  }

  /**
   * 转换连接线为SVG路径
   */
  const getConnectionPath = (line: ConnectionLine): string => {
    if (line.points.length < 2) return ''

    let path = `M ${line.points[0].x} ${line.points[0].y}`
    
    for (let i = 1; i < line.points.length; i++) {
      path += ` L ${line.points[i].x} ${line.points[i].y}`
    }

    return path
  }

  // 为连接线添加路径属性
  const connectionLinesWithPath = computed(() => {
    return connectionLines.value.map(line => ({
      ...line,
      path: getConnectionPath(line)
    }))
  })

  return {
    treeNodes,
    connectionLines: connectionLinesWithPath,
    canvasWidth,
    canvasHeight,
    calculateLayout,
    getVisibleNodes
  }
}