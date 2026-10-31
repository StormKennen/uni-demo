export type RtaTierGroup = 'silver' | 'gold' | 'green' | 'red'

export interface RtaTierMeta {
  group: RtaTierGroup
  count: number
  color: string
  name: string
}

const TIER_COLORS: Readonly<Record<RtaTierGroup, readonly string[]>> = {
  silver: ['#8b96a8', '#8b96a8', '#8b96a8'],
  gold: ['#e0a52f', '#e0a52f', '#e0a52f'],
  green: ['#4aa875', '#4aa875', '#4aa875'],
  red: ['#d45d69', '#d45d69', '#d45d69'],
}

const TIER_NAMES: Readonly<Record<RtaTierGroup, string>> = {
  silver: '银区',
  gold: '金区',
  green: '绿区',
  red: '红区',
}

const TARGET_ALIASES: Readonly<Record<string, string>> = {
  'silver-1': 'f1',
  'silver-2': 'f2',
  'silver-3': 'f3',
  'gold-1': 'c1',
  'gold-2': 'c2',
  'gold-3': 'c3',
  'green-1': 'p1',
  'green-2': 'p2',
  'green-3': 'p3',
  'red-1': 'g1',
  'red-2': 'g2',
  'red-3': 'g3',
}

const GROUP_BY_PREFIX: Readonly<Record<string, RtaTierGroup>> = {
  f: 'silver',
  c: 'gold',
  p: 'green',
  g: 'red',
}

const COUNT_NAMES = ['一', '二', '三']

export const getRtaTierMeta = (targetKey: string | null | undefined): RtaTierMeta | null => {
  const input = typeof targetKey === 'string' ? targetKey.trim().toLowerCase() : ''
  const normalizedKey = TARGET_ALIASES[input] || input
  const match = /^(f|c|p|g)([1-3])$/.exec(normalizedKey)
  if (!match) return null

  const group = GROUP_BY_PREFIX[match[1]]
  const count = Number(match[2])
  if (!group || !Number.isSafeInteger(count)) return null

  return {
    group,
    count,
    color: TIER_COLORS[group][count - 1],
    name: `${COUNT_NAMES[count - 1]}${TIER_NAMES[group]}`,
  }
}

export const getRtaTierColor = (targetKey: string | null | undefined): string | undefined => getRtaTierMeta(targetKey)?.color
