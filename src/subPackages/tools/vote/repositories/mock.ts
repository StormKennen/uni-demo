import { createMockVoteDetail, MOCK_VOTE_DETAILS, refreshMockViewer } from '../mocks'
import type { Vote, VoteCreateInput, VoteDetail, VoteOption, VoteResult, VoteUpdateInput } from '../types'
import { VoteRepositoryError } from './types'
import type { VoteRepository } from './types'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const createResult = (vote: Vote, counts: number[], totalBallots: number): VoteResult => ({
  totalBallots,
  options: vote.options.map((option, index) => {
    const count = counts[index] || 0
    return {
      optionId: option.id,
      count,
      percentage: totalBallots ? Math.round((count / totalBallots) * 1000) / 10 : 0,
    }
  }),
})

const buildCounts = (vote: Vote, result: VoteResult | null | undefined): number[] =>
  vote.options.map(option => result?.options.find(item => item.optionId === option.id)?.count || 0)

const now = (): string => new Date().toISOString()

export class MockVoteRepository implements VoteRepository {
  private readonly details = new Map<string, VoteDetail>()

  constructor(seed: VoteDetail[] = MOCK_VOTE_DETAILS) {
    seed.forEach(detail => this.details.set(detail.vote.id, clone(detail)))
  }

  async getDetail(id: string): Promise<VoteDetail> {
    return clone(refreshMockViewer(this.requireDetail(id)))
  }

  async create(input: VoteCreateInput): Promise<VoteDetail> {
    const createdAt = now()
    const id = `mock-created-${Date.now().toString(36)}`
    const options: VoteOption[] = input.options.map((option, index) => ({
      id: `option-${index + 1}`,
      text: option.text.trim(),
      imageUrl: option.imageUrl || null,
      order: index,
    }))
    const detail = createMockVoteDetail({
      vote: {
        id,
        title: input.title.trim(),
        description: input.description.trim(),
        voteType: input.voteType,
        options,
        rules: { ...input.rules, maxChoices: input.voteType === 'multiple' ? input.rules.maxChoices : undefined },
        privacy: input.privacy,
        schedule: input.schedule,
        createdAt,
        updatedAt: createdAt,
      },
      viewer: { type: 'user', isCreator: true },
    })
    this.details.set(id, detail)
    return clone(detail)
  }

  async submitBallot(id: string, optionIds: string[]): Promise<VoteDetail> {
    const detail = this.requireDetail(id)
    const current = refreshMockViewer(detail)
    if (current.viewer.blockReason === 'login_required') {
      throw new VoteRepositoryError('LOGIN_REQUIRED', '游客不能参与该投票，请先登录')
    }
    if (!current.viewer.canVote && !current.viewer.canChangeVote) {
      if (current.viewer.blockReason === 'closed') throw new VoteRepositoryError('VOTE_CLOSED', '投票已结束')
      if (current.viewer.blockReason === 'already_voted') throw new VoteRepositoryError('ALREADY_VOTED', '已经投过票了')
      throw new VoteRepositoryError('NOT_ALLOWED', '当前不能参与该投票')
    }

    const uniqueOptionIds = [...new Set(optionIds)]
    const validOptionIds = new Set(detail.vote.options.map(option => option.id))
    if (!uniqueOptionIds.length || uniqueOptionIds.some(optionId => !validOptionIds.has(optionId))) {
      throw new VoteRepositoryError('INVALID_OPTIONS', '请选择有效的投票选项')
    }
    if (detail.vote.voteType === 'single' && uniqueOptionIds.length !== 1) {
      throw new VoteRepositoryError('INVALID_OPTIONS', '单选投票只能选择一项')
    }
    if (detail.vote.voteType === 'multiple' && uniqueOptionIds.length > (detail.vote.rules.maxChoices || detail.vote.options.length)) {
      throw new VoteRepositoryError('TOO_MANY_CHOICES', `最多选择 ${detail.vote.rules.maxChoices || detail.vote.options.length} 项`)
    }

    const previousOptionIds = detail.myBallot?.optionIds || []
    const counts = buildCounts(detail.vote, detail.result)
    detail.vote.options.forEach((option, index) => {
      if (previousOptionIds.includes(option.id)) counts[index] = Math.max(0, counts[index] - 1)
      if (uniqueOptionIds.includes(option.id)) counts[index] += 1
    })
    const totalBallots = detail.result?.totalBallots || 0
    const nextTotal = previousOptionIds.length ? totalBallots : totalBallots + 1
    const timestamp = now()
    detail.myBallot = { optionIds: uniqueOptionIds, createdAt: detail.myBallot?.createdAt || timestamp, updatedAt: timestamp }
    detail.result = createResult(detail.vote, counts, nextTotal)
    const participants = detail.participation?.participants || []
    if (!previousOptionIds.length && !participants.some(participant => participant.id === 'mock-current-viewer')) {
      participants.push({ id: 'mock-current-viewer', type: current.viewer.type, name: current.viewer.type === 'guest' ? '游客' : '我' })
      detail.participation = { total: (detail.participation?.total || 0) + 1, participants }
    }
    detail.vote.updatedAt = timestamp
    this.details.set(id, refreshMockViewer(detail))
    return clone(refreshMockViewer(detail))
  }

  async updateBallot(id: string, optionIds: string[]): Promise<VoteDetail> {
    return this.submitBallot(id, optionIds)
  }

  async updateBasicInfo(id: string, input: VoteUpdateInput): Promise<VoteDetail> {
    const detail = this.requireDetail(id)
    const current = refreshMockViewer(detail)
    if (!current.viewer.canEdit) throw new VoteRepositoryError('NOT_ALLOWED', '没有编辑权限')
    if (!input.title.trim()) throw new VoteRepositoryError('INVALID_OPTIONS', '标题不能为空')
    detail.vote.title = input.title.trim()
    detail.vote.description = input.description.trim()
    detail.vote.updatedAt = now()
    this.details.set(id, refreshMockViewer(detail))
    return clone(refreshMockViewer(detail))
  }

  async close(id: string): Promise<VoteDetail> {
    const detail = this.requireDetail(id)
    const current = refreshMockViewer(detail)
    if (!current.viewer.canClose) throw new VoteRepositoryError('NOT_ALLOWED', '当前不能结束投票')
    detail.vote.status = 'closed'
    detail.vote.updatedAt = now()
    this.details.set(id, refreshMockViewer(detail))
    return clone(refreshMockViewer(detail))
  }

  async reveal(id: string): Promise<VoteDetail> {
    const detail = this.requireDetail(id)
    const current = refreshMockViewer(detail)
    if (!current.viewer.canReveal) throw new VoteRepositoryError('NOT_ALLOWED', '当前不能公布结果')
    detail.vote.status = 'revealed'
    detail.vote.revealedAt = now()
    detail.vote.updatedAt = detail.vote.revealedAt
    this.details.set(id, refreshMockViewer(detail))
    return clone(refreshMockViewer(detail))
  }

  private requireDetail(id: string): VoteDetail {
    const detail = this.details.get(id)
    if (!detail) throw new VoteRepositoryError('VOTE_NOT_FOUND', '投票不存在或分享链接已失效')
    return detail
  }
}
