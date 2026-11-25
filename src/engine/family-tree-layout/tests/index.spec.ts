import { describe, expect, it } from 'vitest'
import { layoutFamilyTree, type FamilyTreeLayoutInput } from '../index'

describe('layoutFamilyTree', () => {
  it('keeps node dimensions fixed and centers a parent over its children', () => {
    const root: FamilyTreeLayoutInput = {
      id: 'root',
      children: [
        { id: 'child-a', children: [] },
        { id: 'child-b', children: [] },
      ],
    }

    const result = layoutFamilyTree([root], new Set(['root']))
    const rootPosition = result.nodes.find(position => position.node.id === 'root')
    const childA = result.nodes.find(position => position.node.id === 'child-a')
    const childB = result.nodes.find(position => position.node.id === 'child-b')

    expect(result.nodes).toHaveLength(3)
    if (!rootPosition || !childA || !childB) throw new Error('Expected root and two child positions')
    expect(rootPosition.x + rootPosition.width / 2).toBe((childA.x + childB.x + childB.width) / 2)
    expect(result.nodes.every(position => position.width === 160 && position.height === 160)).toBe(true)
    expect(result.connectors.length).toBeGreaterThan(0)
  })

  it('grows the stage rather than shrinking nodes when a branch expands', () => {
    const root: FamilyTreeLayoutInput = {
      id: 'root',
      children: [
        {
          id: 'child-a',
          children: [
            { id: 'grandchild-a1', children: [] },
            { id: 'grandchild-a2', children: [] },
          ],
        },
        { id: 'child-b', children: [] },
      ],
    }

    const collapsed = layoutFamilyTree([root], new Set(['root']))
    const expanded = layoutFamilyTree([root], new Set(['root', 'child-a']))

    expect(expanded.width).toBeGreaterThan(collapsed.width)
    expect(expanded.height).toBeGreaterThan(collapsed.height)
    expect(expanded.nodes.every(position => position.width === 160 && position.height === 160)).toBe(true)
  })

  it('uses per-node heights and spaces the next generation after the tallest card', () => {
    const root: FamilyTreeLayoutInput = {
      id: 'root',
      children: [{ id: 'long-name', children: [] }],
    }

    const result = layoutFamilyTree([root], new Set(['root']), {
      getNodeHeight: node => (node.id === 'root' ? 220 : 160),
    })
    const rootPosition = result.nodes.find(position => position.node.id === 'root')
    const childPosition = result.nodes.find(position => position.node.id === 'long-name')

    if (!rootPosition || !childPosition) throw new Error('Expected both node positions')
    expect(rootPosition.height).toBe(220)
    expect(childPosition.height).toBe(160)
    expect(childPosition.y).toBe(rootPosition.y + rootPosition.height + 64)
    expect(result.height).toBe(childPosition.y + childPosition.height + 24)
  })

  it('rejects cycles and shared children instead of drawing a misleading tree', () => {
    const cycleRoot: FamilyTreeLayoutInput = { id: 'cycle-root', children: [] }
    const cycleChild: FamilyTreeLayoutInput = { id: 'cycle-child', children: [cycleRoot] }
    cycleRoot.children = [cycleChild]

    const cycleResult = layoutFamilyTree([cycleRoot], new Set(['cycle-root', 'cycle-child']))
    expect(cycleResult.issues.cyclicIds).toEqual(expect.arrayContaining(['cycle-root', 'cycle-child']))
    expect(cycleResult.nodes).toHaveLength(0)

    const sharedChild: FamilyTreeLayoutInput = { id: 'shared-child', children: [] }
    const multiParentRoot: FamilyTreeLayoutInput = {
      id: 'multi-parent-root',
      children: [
        { id: 'parent-a', children: [sharedChild] },
        { id: 'parent-b', children: [sharedChild] },
      ],
    }
    const multiParentResult = layoutFamilyTree([multiParentRoot], new Set(['multi-parent-root', 'parent-a', 'parent-b']))
    expect(multiParentResult.issues.multipleParentIds).toContain('shared-child')
    expect(multiParentResult.nodes).toHaveLength(0)
  })
})
