export interface QuerySnapshotDraft {
  queryKind: 'altitude' | 'weather'
  title: string
  location: {
    name: string
    latitude: number
    longitude: number
    coordinateSystem: 'wgs84' | 'gcj02'
    source: 'location' | 'place' | 'map'
    placeId?: string
  }
  capturedAt: string
  snapshot: Record<string, unknown>
}

export const MEMO_QUERY_SNAPSHOT_DRAFT_KEY = 'memo.querySnapshotDraft.v1'

/** 先用设备本地一次性草稿跨页面传递，避免把坐标和天气数据放入 URL。 */
export const navigateToMemoEditorWithQuerySnapshot = (draft: QuerySnapshotDraft): void => {
  try {
    uni.setStorageSync(MEMO_QUERY_SNAPSHOT_DRAFT_KEY, JSON.stringify(draft))
    uni.navigateTo({
      url: '/subPackages/record-tools/memo/editor?querySnapshot=1',
      fail: () => uni.removeStorageSync(MEMO_QUERY_SNAPSHOT_DRAFT_KEY),
    })
  } catch {
    uni.showToast({ title: '无法打开备忘录编辑器', icon: 'none' })
  }
}
