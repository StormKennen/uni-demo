export type QuickTransferReferenceScene = 'memo'

export interface QuickTransferReferenceSceneOption {
  value: QuickTransferReferenceScene
  label: string
}

export const QUICK_TRANSFER_REFERENCE_SCENES: ReadonlyArray<QuickTransferReferenceSceneOption> = [
  {
    value: 'memo',
    label: '备忘录',
  },
]
