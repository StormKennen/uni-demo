import type { QuerySnapshotBlockData } from './content-model'

export type QuerySnapshotDraft = Omit<QuerySnapshotBlockData, 'type' | 'version'>

const DRAFT_KEY = 'memo.querySnapshotDraft.v1'

/** 先用设备本地一次性草稿跨页面传递，避免把坐标和天气数据放入 URL。 */
export const navigateToMemoEditorWithQuerySnapshot = (draft: QuerySnapshotDraft): void => {
  try {
    uni.setStorageSync(DRAFT_KEY, JSON.stringify(draft))
    uni.navigateTo({
      url: '/subPackages/tools/memo/editor?querySnapshot=1',
      fail: () => uni.removeStorageSync(DRAFT_KEY),
    })
  } catch {
    uni.showToast({ title: '无法打开备忘录编辑器', icon: 'none' })
  }
}

export const consumeQuerySnapshotDraft = (): QuerySnapshotDraft | null => {
  try {
    const raw = uni.getStorageSync(DRAFT_KEY)
    uni.removeStorageSync(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(String(raw)) as QuerySnapshotDraft
    if (!parsed || (parsed.type !== 'altitude' && parsed.type !== 'weather') || !parsed.location || !parsed.snapshot) return null
    return parsed
  } catch {
    return null
  }
}
