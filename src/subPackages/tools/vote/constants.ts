import type { Vote, VoteIdentityVisibility, VoteParticipationVisibility, VoteResultVisibility, VoteStatus, VoteType } from './types'

export const VOTE_CREATE_ROUTE = '/subPackages/tools/vote/create'
export const VOTE_DETAIL_ROUTE = '/subPackages/tools/vote/detail'
export const VOTE_HOME_FALLBACK = '/pages/index/index'
export const VOTE_SHARE_IMAGE_URL = 'https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/vote-share.jpg'

export const buildVoteShareTitle = (title: string | null | undefined, status?: VoteStatus): string => {
  const normalizedTitle = title?.trim() || ''
  if (!normalizedTitle) return status ? '投票，等你来选择' : '发起一个投票，邀请大家一起选择'

  const compactTitle = Array.from(normalizedTitle).slice(0, 24).join('')
  if (!status) return `发起投票：${compactTitle}`
  if (status === 'closed') return `${compactTitle}｜投票已结束`
  if (status === 'revealed') return `${compactTitle}｜结果已公布`
  return `${compactTitle}｜邀请你来投票`
}

export const buildVoteDetailRoute = (id: string): string => `${VOTE_DETAIL_ROUTE}?id=${encodeURIComponent(id)}`

export const buildVoteLoginRedirect = (id: string, optionIds: string[]): string => {
  const pending = optionIds.length ? `&pendingOptionIds=${encodeURIComponent(optionIds.join(','))}` : ''
  return `/pages/mine/login/login?redirectUrl=${encodeURIComponent(`${buildVoteDetailRoute(id)}${pending}`)}`
}

export const VOTE_TYPE_OPTIONS: Array<{ value: VoteType; label: string; description: string }> = [
  { value: 'single', label: '单选', description: '每人选择 1 项' },
  { value: 'multiple', label: '多选', description: '每人可以选择多项' },
]

export const IDENTITY_VISIBILITY_OPTIONS: Array<{ value: VoteIdentityVisibility; label: string; description: string }> = [
  { value: 'public', label: '公开投票', description: '参与者可以看到公开的参与信息。' },
  { value: 'organizer_only', label: '隐藏投票', description: '普通参与者看不到具体选择，发起人可以查看。' },
  { value: 'anonymous', label: '完全匿名', description: '包括发起人在内，都无法查看谁选择了什么。' },
]

export const PARTICIPATION_VISIBILITY_OPTIONS: Array<{ value: VoteParticipationVisibility; label: string; description: string }> = [
  { value: 'participants', label: '显示参与成员', description: '展示参与者头像和昵称。' },
  { value: 'count_only', label: '仅显示参与人数', description: '只展示参与总人数，不展示成员名单。' },
  { value: 'hidden', label: '隐藏参与情况', description: '参与人数和成员名单都不向普通参与者展示。' },
]

export const RESULT_VISIBILITY_OPTIONS: Array<{ value: VoteResultVisibility; label: string; description: string }> = [
  { value: 'realtime', label: '实时显示', description: '提交后即可看到当前统计结果。' },
  { value: 'after_vote', label: '投票后显示', description: '参与者提交自己的选择后才能查看当前结果。' },
  { value: 'after_close', label: '结束后显示', description: '投票结束后，参与者才能查看结果。' },
  { value: 'manual_reveal', label: '手动公布', description: '由发起人决定何时向参与者公布结果。' },
  { value: 'organizer_only', label: '仅发起人可见', description: '只有发起人可以查看统计结果。' },
]

export const VOTE_STATUS_LABELS: Record<VoteStatus, string> = {
  active: '进行中',
  closed: '已结束',
  revealed: '结果已公布',
}

export const formatVoteDate = (value: string | null | undefined): string => {
  if (!value) return '不限制截止时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '时间待定'
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

export const getVoteRuleSummary = (vote: Vote): string[] => {
  const rules: string[] = []
  const identity = IDENTITY_VISIBILITY_OPTIONS.find(item => item.value === vote.privacy.identityVisibility)
  if (identity) rules.push(identity.label)
  if (vote.voteType === 'multiple') rules.push(`最多选择 ${vote.rules.maxChoices || vote.options.length} 项`)
  else rules.push('每人选择 1 项')
  if (vote.rules.allowChangeVote) rules.push('截止前可修改')
  if (vote.rules.allowGuest) rules.push('允许游客')
  const result = RESULT_VISIBILITY_OPTIONS.find(item => item.value === vote.privacy.resultVisibility)
  if (result) rules.push(result.label)
  return rules
}

export const getVoteResultWaitingText = (vote: Vote): string => {
  if (vote.privacy.resultVisibility === 'after_vote') return '提交投票后即可查看结果'
  if (vote.privacy.resultVisibility === 'after_close') return '投票结束后才能查看结果'
  if (vote.privacy.resultVisibility === 'manual_reveal') return '等待发起人公布结果'
  if (vote.privacy.resultVisibility === 'organizer_only') return '结果仅发起人可见'
  return '结果暂不可见'
}

export const readVoteErrorMessage = (error: unknown, fallback = '操作失败，请稍后重试'): string => {
  if (!error || typeof error !== 'object') return fallback
  const source = error as { message?: unknown; code?: unknown }
  if (source.code === 'LOGIN_REQUIRED') return '该投票需要登录后参与'
  if (source.code === 'ALREADY_VOTED') return '你已经投过票了'
  if (source.code === 'VOTE_CLOSED') return '投票已结束，无法继续操作'
  if (source.code === 'RESULT_NOT_VISIBLE') return '结果暂不可见'
  if (source.code === 'INVALID_REQUEST' && typeof source.message === 'string') return source.message || '请检查投票设置'
  if (source.code === 'INVALID_RESPONSE') return '投票服务返回了无法识别的数据'
  if (typeof source.message === 'string' && source.message.trim()) return source.message
  return fallback
}
