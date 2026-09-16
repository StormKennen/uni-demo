import type {
  Vote,
  VoteDetail,
  VoteMyBallot,
  VoteParticipation,
  VotePrivacy,
  VoteResult,
  VoteRules,
  VoteSchedule,
  VoteViewer,
} from './types'

type MockVoteOverrides = {
  vote?: Omit<Partial<Vote>, 'rules' | 'privacy' | 'schedule'> & {
    rules?: Partial<VoteRules>
    privacy?: Partial<VotePrivacy>
    schedule?: Partial<VoteSchedule>
  }
  viewer?: Partial<Pick<VoteViewer, 'type' | 'isCreator'>>
  myBallot?: VoteMyBallot | null
  participation?: VoteParticipation | null
  result?: VoteResult | null
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const baseOptions = [
  { id: 'option-a', text: '方案 A', order: 0 },
  { id: 'option-b', text: '方案 B', order: 1 },
  { id: 'option-c', text: '方案 C', order: 2 },
]

const baseVote: Vote = {
  id: 'mock-vote',
  creatorId: 'mock-creator',
  title: '你更喜欢哪种方案？',
  description: '这是一个用于体验 Vote 前端交互的 Mock 投票。',
  voteType: 'single',
  options: baseOptions,
  rules: {
    allowGuest: true,
    allowChangeVote: true,
    allowParticipantAddOption: false,
  },
  privacy: {
    identityVisibility: 'public',
    participationVisibility: 'participants',
    resultVisibility: 'realtime',
  },
  schedule: {
    startAt: null,
    endAt: null,
  },
  status: 'active',
  revealedAt: null,
  createdAt: '2026-09-15T08:00:00.000Z',
  updatedAt: '2026-09-15T08:00:00.000Z',
}

const baseViewer: VoteViewer = {
  type: 'user',
  isCreator: true,
  hasVoted: false,
  canVote: true,
  canChangeVote: false,
  canViewParticipationCount: true,
  canViewParticipants: true,
  canViewResults: true,
  canViewVoterChoices: true,
  canEdit: true,
  canClose: true,
  canReveal: false,
}

const buildResult = (vote: Vote, counts: number[]): VoteResult => {
  const totalBallots = counts.reduce((sum, count) => sum + count, 0)
  return {
    totalBallots,
    options: vote.options.map((option, index) => {
      const count = counts[index] || 0
      return {
        optionId: option.id,
        count,
        percentage: totalBallots ? Math.round((count / totalBallots) * 1000) / 10 : 0,
      }
    }),
  }
}

export const refreshMockViewer = (detail: VoteDetail): VoteDetail => {
  const { vote } = detail
  const viewerSeed = detail.viewer
  const hasVoted = Boolean(detail.myBallot?.optionIds.length)
  const isActive = vote.status === 'active'
  const isGuestBlocked = viewerSeed.type === 'guest' && !vote.rules.allowGuest
  const canChangeVote = hasVoted && isActive && vote.rules.allowChangeVote && !isGuestBlocked
  const canVote = isActive && !isGuestBlocked && (!hasVoted || vote.rules.allowChangeVote)
  const canViewResults =
    viewerSeed.isCreator ||
    vote.privacy.resultVisibility === 'realtime' ||
    (vote.privacy.resultVisibility === 'after_vote' && hasVoted) ||
    (vote.privacy.resultVisibility === 'after_close' && vote.status !== 'active') ||
    (vote.privacy.resultVisibility === 'manual_reveal' && vote.status === 'revealed')
  const canViewParticipants = vote.privacy.participationVisibility === 'participants' || viewerSeed.isCreator
  const canViewParticipationCount = vote.privacy.participationVisibility !== 'hidden' || viewerSeed.isCreator
  const canViewVoterChoices =
    vote.privacy.identityVisibility === 'public' || (vote.privacy.identityVisibility === 'organizer_only' && viewerSeed.isCreator)

  let blockReason: VoteViewer['blockReason']
  if (isGuestBlocked) blockReason = 'login_required'
  else if (!isActive) blockReason = 'closed'
  else if (hasVoted && !vote.rules.allowChangeVote) blockReason = 'already_voted'

  return {
    ...detail,
    viewer: {
      type: viewerSeed.type,
      isCreator: viewerSeed.isCreator,
      hasVoted,
      canVote,
      canChangeVote,
      canViewParticipationCount,
      canViewParticipants,
      canViewResults,
      canViewVoterChoices,
      canEdit: viewerSeed.isCreator,
      canClose: viewerSeed.isCreator && isActive,
      canReveal: viewerSeed.isCreator && vote.status === 'closed' && vote.privacy.resultVisibility === 'manual_reveal',
      blockReason,
    },
  }
}

export const createMockVoteDetail = (overrides: MockVoteOverrides = {}): VoteDetail => {
  const voteOverride = overrides.vote || {}
  const vote: Vote = {
    ...clone(baseVote),
    ...voteOverride,
    options: voteOverride.options ? clone(voteOverride.options) : clone(baseVote.options),
    rules: { ...clone(baseVote.rules), ...voteOverride.rules },
    privacy: { ...clone(baseVote.privacy), ...voteOverride.privacy },
    schedule: { ...clone(baseVote.schedule), ...voteOverride.schedule },
  }
  const detail: VoteDetail = {
    vote,
    viewer: { ...baseViewer, ...overrides.viewer },
    myBallot: overrides.myBallot ? clone(overrides.myBallot) : null,
    participation: overrides.participation ? clone(overrides.participation) : { total: 0, participants: [] },
    result: overrides.result === undefined ? buildResult(vote, []) : clone(overrides.result),
  }
  return refreshMockViewer(detail)
}

const participants: VoteParticipation = {
  total: 18,
  participants: [
    { id: 'participant-1', type: 'user', name: '林小满' },
    { id: 'participant-2', type: 'user', name: '周周' },
    { id: 'participant-3', type: 'guest', name: '小陈' },
    { id: 'participant-4', type: 'user', name: '阿南' },
  ],
}

export const mockSingleVote = createMockVoteDetail({
  vote: { id: 'mock-single', title: '周末晚餐吃什么？', description: '快速单选示例，提交后实时显示统计。' },
  result: {
    totalBallots: 18,
    options: [
      { optionId: 'option-a', count: 10, percentage: 55.6 },
      { optionId: 'option-b', count: 5, percentage: 27.8 },
      { optionId: 'option-c', count: 3, percentage: 16.7 },
    ],
  },
  participation: participants,
})

export const mockMultipleVote = createMockVoteDetail({
  vote: {
    id: 'mock-multiple',
    title: '团建活动想参加哪些项目？',
    description: '最多选择两项，投票结束后公布结果。',
    voteType: 'multiple',
    rules: { allowGuest: false, allowChangeVote: true, maxChoices: 2 },
    privacy: { identityVisibility: 'organizer_only', participationVisibility: 'count_only', resultVisibility: 'after_close' },
  },
  viewer: { type: 'user', isCreator: true },
  result: {
    totalBallots: 12,
    options: [
      { optionId: 'option-a', count: 8, percentage: 66.7 },
      { optionId: 'option-b', count: 7, percentage: 58.3 },
      { optionId: 'option-c', count: 4, percentage: 33.3 },
    ],
  },
  participation: { total: 12 },
})

export const mockGuestVote = createMockVoteDetail({
  vote: { id: 'mock-guest', title: '群里投票：下午茶喝什么？', description: '游客可以直接选择并提交。' },
  viewer: { type: 'guest', isCreator: false },
  result: {
    totalBallots: 6,
    options: [
      { optionId: 'option-a', count: 2, percentage: 33.3 },
      { optionId: 'option-b', count: 3, percentage: 50 },
      { optionId: 'option-c', count: 1, percentage: 16.7 },
    ],
  },
  participation: participants,
})

export const mockLoginRequiredVote = createMockVoteDetail({
  vote: {
    id: 'mock-login-required',
    title: '需要登录的方案评选',
    description: '游客可以浏览和选择，提交时需要登录。',
    rules: { allowGuest: false },
  },
  viewer: { type: 'guest', isCreator: false },
  participation: { total: 9 },
})

export const mockPublicVote = createMockVoteDetail({
  vote: { id: 'mock-public', title: '公开投票示例', privacy: { identityVisibility: 'public', participationVisibility: 'participants' } },
  result: buildResult(baseVote, [9, 6, 3]),
  participation: participants,
})

export const mockOrganizerOnlyVote = createMockVoteDetail({
  vote: {
    id: 'mock-organizer-only',
    title: '仅发起人查看的结果',
    privacy: { identityVisibility: 'organizer_only', resultVisibility: 'organizer_only' },
  },
  viewer: { type: 'user', isCreator: false },
  result: buildResult(baseVote, [9, 6, 3]),
  participation: { total: 15 },
})

export const mockAnonymousVote = createMockVoteDetail({
  vote: {
    id: 'mock-anonymous',
    title: '完全匿名的意见收集',
    description: '任何人都无法查看谁选择了什么，只保留汇总统计。',
    privacy: { identityVisibility: 'anonymous', participationVisibility: 'count_only' },
  },
  result: buildResult(baseVote, [4, 8, 2]),
  participation: { total: 14 },
})

export const mockRealtimeVote = mockSingleVote

export const mockAfterVoteVote = createMockVoteDetail({
  vote: { id: 'mock-after-vote', title: '投票后显示结果', privacy: { resultVisibility: 'after_vote' } },
  result: buildResult(baseVote, [5, 4, 1]),
})

export const mockClosedVote = createMockVoteDetail({
  vote: { id: 'mock-closed', title: '已经结束的投票', status: 'closed', privacy: { resultVisibility: 'after_close' } },
  result: buildResult(baseVote, [12, 7, 4]),
  participation: participants,
})

export const mockWaitingRevealVote = createMockVoteDetail({
  vote: { id: 'mock-waiting-reveal', title: '等待发起人公布结果', status: 'closed', privacy: { resultVisibility: 'manual_reveal' } },
  viewer: { type: 'user', isCreator: false },
  result: buildResult(baseVote, [6, 5, 2]),
  participation: { total: 13 },
})

export const mockRevealedVote = createMockVoteDetail({
  vote: {
    id: 'mock-revealed',
    title: '结果已经公布',
    status: 'revealed',
    revealedAt: '2026-09-15T09:00:00.000Z',
    privacy: { resultVisibility: 'manual_reveal' },
  },
  result: buildResult(baseVote, [11, 6, 3]),
  participation: participants,
})

export const mockCreatorVote = createMockVoteDetail({
  vote: { id: 'mock-creator', title: '创建者管理示例', description: '发起人可以编辑说明、结束投票或公布结果。' },
  viewer: { type: 'user', isCreator: true },
  result: buildResult(baseVote, [3, 2, 1]),
  participation: participants,
})

export const MOCK_VOTE_DETAILS: VoteDetail[] = [
  mockSingleVote,
  mockMultipleVote,
  mockGuestVote,
  mockLoginRequiredVote,
  mockPublicVote,
  mockOrganizerOnlyVote,
  mockAnonymousVote,
  mockAfterVoteVote,
  mockClosedVote,
  mockWaitingRevealVote,
  mockRevealedVote,
  mockCreatorVote,
]
