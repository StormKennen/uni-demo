import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getVotesVoteId: vi.fn(),
  getVotesVoteIdParticipants: vi.fn(),
  patchVotesVoteId: vi.fn(),
  patchVotesVoteIdBallot: vi.fn(),
  postVotes: vi.fn(),
  postVotesVoteIdBallots: vi.fn(),
  postVotesVoteIdClose: vi.fn(),
  postVotesVoteIdReveal: vi.fn(),
}))

vi.mock('@/services/apifox/NODEJSDEMO/VOTES/apifox', () => mocks)

import { ApiVoteRepository, normalizeVoteDetail } from './api'

const vote = {
  id: 'vote-1',
  creatorId: 'user-1',
  title: '周末去哪儿',
  description: '选择一个地点',
  voteType: 'single',
  options: [
    { id: 'option-a', text: '公园', order: 0 },
    { id: 'option-b', text: '电影院', order: 1 },
  ],
  rules: { maxChoices: 1, allowGuest: true, allowChangeVote: true, allowParticipantAddOption: false },
  privacy: { identityVisibility: 'public', participationVisibility: 'participants', resultVisibility: 'realtime' },
  schedule: { startAt: '2026-09-15T00:00:00.000Z', endAt: '2026-09-16T00:00:00.000Z' },
  status: 'active',
}

const detail: Record<string, unknown> = {
  vote,
  viewer: {
    type: 'user',
    isCreator: false,
    hasVoted: false,
    canVote: true,
    canChangeVote: false,
    canViewParticipationCount: true,
    canViewParticipants: true,
    canViewResults: true,
    canViewVoterChoices: true,
    canEdit: false,
    canClose: false,
    canReveal: false,
  },
  myBallot: null,
  participation: { totalBallots: 2 },
  result: {
    totalBallots: 2,
    options: [
      { optionId: 'option-a', count: 1, percentage: 50 },
      { optionId: 'option-b', count: 1, percentage: 50 },
    ],
  },
}

describe('ApiVoteRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getVotesVoteId.mockResolvedValue(detail)
    mocks.getVotesVoteIdParticipants.mockResolvedValue({
      items: [{ id: 'user-2', type: 'user' }],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1, hasNext: false, hasPrev: false },
    })
  })

  it('normalizes the backend detail and merges participant pagination', async () => {
    const repository = new ApiVoteRepository()
    const loaded = await repository.getDetail('vote-1')

    expect(loaded.vote.id).toBe('vote-1')
    expect(loaded.viewer.canViewResults).toBe(true)
    expect(loaded.participation).toMatchObject({ total: 2, participants: [{ id: 'user-2', type: 'user' }] })
    expect(mocks.getVotesVoteIdParticipants).toHaveBeenCalledWith('vote-1', { page: 1, pageSize: 20 })
  })

  it('creates with generated option ids and returns a complete detail', async () => {
    const repository = new ApiVoteRepository()
    mocks.postVotes.mockResolvedValue(vote)
    const created = await repository.create({
      title: '新投票',
      description: '',
      voteType: 'single',
      options: [{ text: '选项一' }, { text: '选项二' }],
      rules: { allowGuest: true, allowChangeVote: true, allowParticipantAddOption: false },
      privacy: { identityVisibility: 'public', participationVisibility: 'participants', resultVisibility: 'realtime' },
      schedule: { startAt: null, endAt: '2026-09-16T00:00:00.000Z' },
    })

    const request = mocks.postVotes.mock.calls[0][0]
    expect(request.options).toMatchObject([
      { text: '选项一', order: 0 },
      { text: '选项二', order: 1 },
    ])
    expect(request.options[0].id).toMatch(/^vote-option-/)
    expect(created.vote.id).toBe('vote-1')
    expect(mocks.getVotesVoteId).toHaveBeenCalledWith('vote-1')
  })

  it('uses the ballot update endpoint for an existing vote', async () => {
    const repository = new ApiVoteRepository()
    mocks.patchVotesVoteIdBallot.mockResolvedValue({ hasVoted: true, optionIds: ['option-b'] })
    await repository.updateBallot('vote-1', ['option-b'])

    expect(mocks.patchVotesVoteIdBallot).toHaveBeenCalledWith('vote-1', { optionIds: ['option-b'] })
  })

  it('maps backend guest restrictions to the domain login error', async () => {
    const repository = new ApiVoteRepository()
    mocks.postVotesVoteIdBallots.mockRejectedValue({
      code: 403,
      statusCode: 403,
      message: '当前投票不允许游客参与',
      data: { data: { reason: 'VOTE_GUEST_NOT_ALLOWED' } },
    })

    await expect(repository.submitBallot('vote-1', ['option-a'])).rejects.toMatchObject({ code: 'LOGIN_REQUIRED' })
  })
})
describe('vote response normalization', () => {
  it('accepts the anonymous viewer and snake_case compatibility fields', () => {
    const normalized = normalizeVoteDetail({
      vote: {
        ...vote,
        creator_id: 'user-1',
        creatorId: undefined,
        vote_type: 'multiple',
        voteType: undefined,
        schedule: { start_at: '2026-09-15T00:00:00.000Z', end_at: '2026-09-16T00:00:00.000Z' },
      },
      viewer: {
        type: 'anonymous',
        has_voted: false,
        can_view_results: false,
      },
      my_ballot: null,
      participation: {},
      result: null,
    })

    expect(normalized.vote.voteType).toBe('multiple')
    expect(normalized.vote.creatorId).toBe('user-1')
    expect(normalized.viewer.type).toBe('anonymous')
    expect(normalized.viewer.blockReason).toBe('login_required')
  })
})
