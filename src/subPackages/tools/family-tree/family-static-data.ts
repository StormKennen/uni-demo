export interface FamilyMemberItem {
  id: string
  surname: string
  givenName: string
  gender: 'male' | 'female' | 'unknown'
  generation: number
  parents?: string[]
  children?: string[]
  nameZh?: {
    surname?: string
    givenName?: string
    full?: string
  }
  address?: {
    currentAddress?: string
    villageAddress?: string
  }
  contact?: {
    phone?: string
    email?: string
  }
  notes?: string
  createdAt?: string
}

/**
 * 根据用户提供的族谱第98-99页整理的梁姓谱系静态数据。
 * 世次按谱页标注：浚鸿为第二十四世，最末一代为第三十一世。
 * 图中只展示名字/排行，性别无法确定时保留 unknown；配偶仅作为注记，不计入梁姓血缘成员。
 */
const genealogy: Array<{
  generation: number
  name: string
  gender?: FamilyMemberItem['gender']
  parent?: string
  parentOccurrence?: number
  notes?: string
}> = [
  { generation: 24, name: '浚鸿', notes: '第二十四世；本次图片谱系起始祖先' },
  { generation: 25, name: '贡瑶', parent: '浚鸿', notes: '图中标注二子；同代另一位为贡琨' },
  { generation: 25, name: '贡琨', parent: '浚鸿' },
  { generation: 26, name: '光勋', parent: '贡瑶' },
  { generation: 26, name: '郁勋', parent: '贡瑶', notes: '出嗣' },
  { generation: 26, name: '卓勋', parent: '贡瑶' },
  { generation: 26, name: '祐勋', parent: '贡琨' },
  { generation: 26, name: '达勋', parent: '贡琨' },
  { generation: 27, name: '毕修', parent: '光勋' },
  { generation: 27, name: '兆华', parent: '郁勋' },
  { generation: 27, name: '兆盛', parent: '郁勋' },
  { generation: 27, name: '兆祯', parent: '卓勋' },
  { generation: 27, name: '观常', parent: '祐勋', parentOccurrence: 1, notes: '出嗣' },
  { generation: 27, name: '玉常', parent: '祐勋' },
  { generation: 27, name: '观常', parent: '达勋', notes: '闰子；与祐勋支“观常”为不同谱系记录' },
  { generation: 28, name: '酌安', parent: '毕修' },
  { generation: 28, name: '叶合', parent: '兆华' },
  { generation: 28, name: '叶培', parent: '兆盛' },
  { generation: 28, name: '庚贤', parent: '兆盛' },
  { generation: 28, name: '将伙', parent: '兆祯' },
  { generation: 28, name: '戊志', parent: '兆祯' },
  { generation: 28, name: '志权', parent: '兆祯' },
  { generation: 28, name: '润和', parent: '观常', parentOccurrence: 2 },
  { generation: 29, name: '安入', parent: '酌安', notes: '字迹疑似“安入”，请据原谱核对' },
  { generation: 29, name: '耀才', parent: '酌安' },
  { generation: 29, name: '金耀', parent: '叶合', notes: '配偶注记：黄氏；子女标注三子一女' },
  { generation: 29, name: '焕成', parent: '叶合', notes: '金耀的亲弟弟；配偶注记：丁氏；子女标注一子一女' },
  { generation: 29, name: '立成', parent: '叶合', notes: '金耀的亲弟弟；配偶注记：杨氏；子女标注三子一女' },
  { generation: 29, name: '李光', parent: '庚贤', notes: '配偶注记：梁氏；子女标注六女' },
  { generation: 29, name: '雨南', parent: '庚贤', notes: '配偶注记：梁氏；子女标注一子' },
  { generation: 29, name: '雨荣', parent: '庚贤', notes: '配偶注记：叶氏；子女标注一子一女' },
  { generation: 30, name: '瑞球', parent: '金耀', notes: '配偶注记：黄氏' },
  { generation: 30, name: '瑞庭', parent: '金耀', notes: '配偶注记：黄氏' },
  { generation: 30, name: '卓敏', parent: '焕成', notes: '配偶注记：陈氏' },
  { generation: 30, name: '淑琴', parent: '焕成' },
  { generation: 30, name: '瑞祥', parent: '立成', notes: '配偶注记：张氏' },
  { generation: 30, name: '瑞益', parent: '立成', notes: '配偶注记：赖氏' },
  { generation: 30, name: '瑞欣', parent: '立成', notes: '配偶注记：姚氏' },
  { generation: 30, name: '瑞丹', parent: '立成', notes: '配偶注记：姚氏' },
  { generation: 30, name: '锡沾', parent: '李光' },
  { generation: 30, name: '玉梅', parent: '李光' },
  { generation: 30, name: '玉婷', parent: '李光' },
  { generation: 30, name: '玉洁', parent: '李光' },
  { generation: 30, name: '玉玫', parent: '李光' },
  { generation: 30, name: '玉娟', parent: '李光' },
  { generation: 30, name: '玉兰', parent: '李光' },
  { generation: 30, name: '梁侃', parent: '雨南' },
  { generation: 30, name: '显诚', parent: '雨荣' },
  { generation: 30, name: '显妍', parent: '雨荣' },
  { generation: 31, name: '智云', parent: '瑞球' },
  { generation: 31, name: '智开', parent: '瑞球' },
  { generation: 32, name: '君泽', parent: '智云' },
  { generation: 31, name: '俊杰', parent: '瑞庭' },
  { generation: 31, name: '俊创', parent: '瑞庭' },
  { generation: 31, name: '振辉', parent: '卓敏' },
  { generation: 31, name: '璋宁', parent: '瑞祥' },
  { generation: 31, name: '丰华', parent: '瑞益' },
  { generation: 31, name: '国聪', parent: '瑞欣' },
  { generation: 31, name: '梁咏', parent: '瑞丹' },
]

export const staticFamilyMembers: FamilyMemberItem[] = genealogy.map((entry, index) => {
  const id = `liang-g${entry.generation}-${index + 1}`
  const matchingParents = entry.parent
    ? genealogy.filter(candidate => candidate.generation === entry.generation - 1 && candidate.name === entry.parent)
    : []
  const parentEntry = entry.parent ? matchingParents[(entry.parentOccurrence || 1) - 1] : undefined
  const parentIndex = entry.parent && parentEntry ? genealogy.indexOf(parentEntry) : -1
  const parentId = parentIndex >= 0 && parentEntry ? `liang-g${parentEntry.generation}-${parentIndex + 1}` : undefined
  const fullName = entry.name.startsWith('梁') ? entry.name : `梁${entry.name}`
  const givenName = entry.name.startsWith('梁') ? entry.name.slice(1) : entry.name
  const occurrence =
    genealogy.slice(0, index).filter(candidate => candidate.generation === entry.generation && candidate.name === entry.name).length + 1
  const childIds = genealogy
    .map((candidate, childIndex) => {
      if (candidate.parent !== entry.name || candidate.generation !== entry.generation + 1) return null
      const candidateParentOccurrence = candidate.parentOccurrence || 1
      return candidateParentOccurrence === occurrence ? `liang-g${candidate.generation}-${childIndex + 1}` : null
    })
    .filter((childId): childId is string => Boolean(childId))

  return {
    id,
    surname: '梁',
    givenName,
    gender: entry.gender || 'unknown',
    generation: entry.generation,
    parents: parentId ? [parentId] : [],
    children: childIds,
    nameZh: { surname: '梁', givenName, full: fullName },
    notes: entry.notes,
    createdAt: '2026-10-18T00:00:00.000Z',
  }
})
