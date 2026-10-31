export type AltitudeWarningLevel = 'normal' | 'attention' | 'high' | 'very-high'

export interface AltitudeWarningConfig {
  key: AltitudeWarningLevel
  minMeters: number
  maxMeters: number | null
  label: string
  notice: string
  legendLabel: string
  color: string
  colorDeep: string
}

export const ALTITUDE_WARNING_CONFIGS: readonly AltitudeWarningConfig[] = [
  {
    key: 'normal',
    minMeters: 0,
    maxMeters: 1500,
    label: '常规海拔',
    notice: '当前读数处于常规提示范围',
    legendLabel: '常规 <1500m',
    color: '#22c55e',
    colorDeep: '#16a34a',
  },
  {
    key: 'attention',
    minMeters: 1500,
    maxMeters: 2500,
    label: '高度提醒',
    notice: '海拔升高，建议注意适应节奏',
    legendLabel: '提醒 1500–2499m',
    color: '#f59e0b',
    colorDeep: '#d97706',
  },
  {
    key: 'high',
    minMeters: 2500,
    maxMeters: 3500,
    label: '高海拔提示',
    notice: '未适应人群请注意逐步适应',
    legendLabel: '提示 2500–3499m',
    color: '#f97316',
    colorDeep: '#ea580c',
  },
  {
    key: 'very-high',
    minMeters: 3500,
    maxMeters: null,
    label: '高海拔警示',
    notice: '海拔较高，请充分适应并关注身体状况',
    legendLabel: '警示 ≥3500m',
    color: '#ef4444',
    colorDeep: '#dc2626',
  },
]

export const getAltitudeWarningConfig = (altitudeMeters: number | null | undefined): AltitudeWarningConfig => {
  const altitude = Number.isFinite(altitudeMeters) ? Math.max(0, Number(altitudeMeters)) : 0
  return (
    ALTITUDE_WARNING_CONFIGS.find(config => config.maxMeters === null || altitude < config.maxMeters) ||
    ALTITUDE_WARNING_CONFIGS[ALTITUDE_WARNING_CONFIGS.length - 1]
  )
}
