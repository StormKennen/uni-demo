import { MEMO_QUERY_SNAPSHOT_DRAFT_KEY } from '@/features/memo/query-snapshot-navigation'
import type { QuerySnapshotDraft } from '@/features/memo/query-snapshot-navigation'

/** 消费由天气或海拔查询写入的一次性本地草稿。 */
export const consumeQuerySnapshotDraft = (): QuerySnapshotDraft | null => {
  try {
    const raw = uni.getStorageSync(MEMO_QUERY_SNAPSHOT_DRAFT_KEY)
    uni.removeStorageSync(MEMO_QUERY_SNAPSHOT_DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(String(raw)) as QuerySnapshotDraft
    if (!parsed || (parsed.queryKind !== 'altitude' && parsed.queryKind !== 'weather') || !parsed.location || !parsed.snapshot) return null
    return parsed
  } catch {
    return null
  }
}
