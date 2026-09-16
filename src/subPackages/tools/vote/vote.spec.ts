import { describe, expect, it } from 'vitest'
import { buildVoteShareTitle } from './constants'
import { mockLoginRequiredVote, mockWaitingRevealVote } from './mocks'
import { MockVoteRepository } from './repositories/mock'
import { VoteRepositoryError } from './repositories/types'

describe('MockVoteRepository', () => {
  it('creates a vote and accepts a single ballot with server-shaped result percentages', async () => {
    const repository = new MockVoteRepository([])
    const created = await repository.create({
      title: '测试投票',
      description: '',
      voteType: 'single',
      options: [{ text: '选项一' }, { text: '选项二' }],
      rules: { allowGuest: true, allowChangeVote: true, allowParticipantAddOption: false },
      privacy: { identityVisibility: 'public', participationVisibility: 'participants', resultVisibility: 'realtime' },
      schedule: { startAt: null, endAt: null },
    })

    const submitted = await repository.submitBallot(created.vote.id, [created.vote.options[0].id])
    expect(submitted.viewer.hasVoted).toBe(true)
    expect(submitted.result?.totalBallots).toBe(1)
    expect(submitted.result?.options[0]).toMatchObject({ count: 1, percentage: 100 })
  })

  it('rejects a guest ballot when the vote requires login', async () => {
    const repository = new MockVoteRepository([mockLoginRequiredVote])
    await expect(repository.submitBallot(mockLoginRequiredVote.vote.id, ['option-a'])).rejects.toMatchObject({ code: 'LOGIN_REQUIRED' })
  })

  it('allows a creator to close a vote and reveal a manual result', async () => {
    const repository = new MockVoteRepository([mockWaitingRevealVote])
    await expect(repository.reveal(mockWaitingRevealVote.vote.id)).rejects.toMatchObject({ code: 'NOT_ALLOWED' })

    const creatorRepository = new MockVoteRepository([
      {
        ...mockWaitingRevealVote,
        viewer: {
          ...mockWaitingRevealVote.viewer,
          type: 'user',
          isCreator: true,
        },
      },
    ])
    const revealed = await creatorRepository.reveal(mockWaitingRevealVote.vote.id)
    expect(revealed.vote.status).toBe('revealed')
  })

  it('exposes typed repository errors for invalid access', async () => {
    const repository = new MockVoteRepository([])
    try {
      await repository.getDetail('missing')
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(VoteRepositoryError)
      expect((error as VoteRepositoryError).code).toBe('VOTE_NOT_FOUND')
    }
  })
})

describe('Vote share titles', () => {
  it('uses the current page content and vote status', () => {
    expect(buildVoteShareTitle('周末晚餐吃什么？')).toBe('发起投票：周末晚餐吃什么？')
    expect(buildVoteShareTitle('周末晚餐吃什么？', 'active')).toBe('周末晚餐吃什么？｜邀请你来投票')
    expect(buildVoteShareTitle('周末晚餐吃什么？', 'revealed')).toBe('周末晚餐吃什么？｜结果已公布')
  })

  it('keeps a readable fallback when the title is empty', () => {
    expect(buildVoteShareTitle('')).toBe('发起一个投票，邀请大家一起选择')
    expect(buildVoteShareTitle('', 'closed')).toBe('投票，等你来选择')
  })
})
