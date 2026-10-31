import type {
  Vote,
  VoteCreateInput,
  VoteDetail,
  VoteParticipant,
  VoteParticipation,
  VotePrivacy,
  VoteResult,
  VoteResultOption,
  VoteRules,
  VoteType,
  VoteUpdateInput,
  VoteViewer,
  VoteViewerType,
} from '../types'
import { VoteRepositoryError } from './types'
import type { VoteRepository, VoteRepositoryErrorCode } from './types'
import {
  getVotesVoteId,
  getVotesVoteIdParticipants,
  patchVotesVoteId,
  patchVotesVoteIdBallot,
  postVotes,
  postVotesVoteIdBallots,
  postVotesVoteIdClose,
  postVotesVoteIdReveal,
} from '@/services/apifox/NODEJSDEMO/VOTES/apifox'
import type {
  patchVotesVoteIdBallotBody,
  patchVotesVoteIdBody,
  postVotesBody,
  postVotesVoteIdBallotsBody,
} from '@/services/apifox/NODEJSDEMO/VOTES/interface'

type JsonRecord = Record<string, unknown>

const asRecord = (value: unknown): JsonRecord | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as JsonRecord
}

const asRuntimeValue = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

const unwrapData = (value: unknown, label = '投票接口'): JsonRecord => {
  const parsed = asRuntimeValue(value)
  const record = asRecord(parsed)
  if (!record) throw new VoteRepositoryError('INVALID_RESPONSE', `${label}返回格式异常`)
  const data = asRecord(record.data)
  return data && Object.keys(data).length ? data : record
}

const firstValue = (record: JsonRecord, keys: string[]): unknown =>
  keys.map(key => record[key]).find(value => value !== undefined && value !== null)

const readString = (record: JsonRecord, keys: string[], fallback = ''): string => {
  const value = firstValue(record, keys)
  return typeof value === 'string' ? value : fallback
}

const readOptionalString = (record: JsonRecord, keys: string[]): string | null | undefined => {
  const value = firstValue(record, keys)
  if (value === null) return null
  return typeof value === 'string' ? value : undefined
}

const requiredString = (record: JsonRecord, keys: string[], label: string): string => {
  const value = readString(record, keys)
  if (!value) throw new VoteRepositoryError('INVALID_RESPONSE', `投票接口缺少 ${label}`)
  return value
}

const readBoolean = (record: JsonRecord, keys: string[], fallback: boolean): boolean => {
  const value = firstValue(record, keys)
  return typeof value === 'boolean' ? value : fallback
}

const readNumber = (record: JsonRecord, keys: string[], fallback = 0): number => {
  const value = firstValue(record, keys)
  const numberValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const readArray = (record: JsonRecord, keys: string[]): unknown[] => {
  const value = firstValue(record, keys)
  return Array.isArray(value) ? value : []
}

const normalizeVoteType = (value: unknown): VoteType => {
  if (value === 'single' || value === 'multiple') return value
  throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了未知投票类型')
}

const normalizeViewerType = (value: unknown): VoteViewerType => {
  if (value === 'user' || value === 'guest' || value === 'anonymous') return value
  return 'anonymous'
}

const normalizeStatus = (value: unknown): Vote['status'] => {
  if (value === 'active' || value === 'closed' || value === 'revealed') return value
  throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了未知投票状态')
}

const normalizeRules = (value: unknown, optionCount: number): VoteRules => {
  const record = asRecord(value) || {}
  const maxChoices = readNumber(record, ['maxChoices'], optionCount)
  return {
    maxChoices: maxChoices > 0 ? maxChoices : optionCount,
    allowGuest: readBoolean(record, ['allowGuest', 'allow_guest'], true),
    allowChangeVote: readBoolean(record, ['allowChangeVote', 'allow_change_vote'], true),
    allowParticipantAddOption: readBoolean(record, ['allowParticipantAddOption', 'allow_participant_add_option'], false),
  }
}

const normalizePrivacy = (value: unknown): VotePrivacy => {
  const record = asRecord(value) || {}
  const identityVisibility = readString(record, ['identityVisibility', 'identity_visibility'], 'public')
  const participationVisibility = readString(record, ['participationVisibility', 'participation_visibility'], 'participants')
  const resultVisibility = readString(record, ['resultVisibility', 'result_visibility'], 'realtime')
  if (identityVisibility !== 'public' && identityVisibility !== 'organizer_only' && identityVisibility !== 'anonymous') {
    throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了未知身份可见性')
  }
  if (participationVisibility !== 'participants' && participationVisibility !== 'count_only' && participationVisibility !== 'hidden') {
    throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了未知参与情况可见性')
  }
  if (
    resultVisibility !== 'realtime' &&
    resultVisibility !== 'after_vote' &&
    resultVisibility !== 'after_close' &&
    resultVisibility !== 'manual_reveal' &&
    resultVisibility !== 'organizer_only'
  ) {
    throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了未知结果可见性')
  }
  return { identityVisibility, participationVisibility, resultVisibility }
}

const normalizeOption = (value: unknown, index: number): Vote['options'][number] => {
  const record = asRecord(value)
  if (!record) throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了非法选项')
  return {
    id: requiredString(record, ['id', '_id', 'optionId', 'option_id'], '选项 ID'),
    text: readString(record, ['text', 'label'], `选项 ${index + 1}`),
    imageUrl: readOptionalString(record, ['imageUrl', 'image_url']),
    order: readNumber(record, ['order'], index),
  }
}

export const normalizeVote = (response: unknown): Vote => {
  const record = unwrapData(response)
  const options = readArray(record, ['options']).map(normalizeOption)
  if (options.length < 2) throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回的选项不足')
  const scheduleRecord = asRecord(record.schedule) || {}
  return {
    id: requiredString(record, ['id', '_id', 'voteId', 'vote_id'], '投票 ID'),
    creatorId: requiredString(record, ['creatorId', 'creator_id'], '创建者 ID'),
    title: requiredString(record, ['title'], '标题'),
    description: readString(record, ['description'], ''),
    voteType: normalizeVoteType(record.voteType ?? record.vote_type),
    options,
    rules: normalizeRules(record.rules, options.length),
    privacy: normalizePrivacy(record.privacy),
    schedule: {
      startAt: readOptionalString(scheduleRecord, ['startAt', 'start_at']),
      endAt: readOptionalString(scheduleRecord, ['endAt', 'end_at']),
    },
    status: normalizeStatus(record.status),
    revealedAt: readOptionalString(record, ['revealedAt', 'revealed_at']),
    createdAt: readOptionalString(record, ['createdAt', 'created_at']) || undefined,
    updatedAt: readOptionalString(record, ['updatedAt', 'updated_at']) || undefined,
  }
}

const normalizeBlockReason = (record: JsonRecord, vote: Vote, viewerType: VoteViewerType, hasVoted: boolean): VoteViewer['blockReason'] => {
  const explicit = readString(record, ['blockReason', 'block_reason'])
  if (
    explicit === 'login_required' ||
    explicit === 'closed' ||
    explicit === 'already_voted' ||
    explicit === 'not_allowed' ||
    explicit === 'invalid'
  ) {
    return explicit
  }
  if (vote.status !== 'active') return 'closed'
  if (viewerType === 'anonymous' || (viewerType === 'guest' && !vote.rules.allowGuest)) return 'login_required'
  if (hasVoted) return 'already_voted'
  return undefined
}

const normalizeViewer = (value: unknown, vote: Vote): VoteViewer => {
  const record = asRecord(value)
  if (!record) throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口缺少查看者权限')
  const type = normalizeViewerType(record.type)
  const hasVoted = readBoolean(record, ['hasVoted', 'has_voted'], false)
  return {
    type,
    isCreator: readBoolean(record, ['isCreator', 'is_creator'], false),
    hasVoted,
    canVote: readBoolean(record, ['canVote', 'can_vote'], false),
    canChangeVote: readBoolean(record, ['canChangeVote', 'can_change_vote'], false),
    canViewParticipationCount: readBoolean(record, ['canViewParticipationCount', 'can_view_participation_count'], false),
    canViewParticipants: readBoolean(record, ['canViewParticipants', 'can_view_participants'], false),
    canViewResults: readBoolean(record, ['canViewResults', 'can_view_results'], false),
    canViewVoterChoices: readBoolean(record, ['canViewVoterChoices', 'can_view_voter_choices'], false),
    canEdit: readBoolean(record, ['canEdit', 'can_edit'], false),
    canClose: readBoolean(record, ['canClose', 'can_close'], false),
    canReveal: readBoolean(record, ['canReveal', 'can_reveal'], false),
    blockReason: normalizeBlockReason(record, vote, type, hasVoted),
  }
}

const normalizeBallot = (value: unknown): VoteDetail['myBallot'] => {
  if (value === null || value === undefined) return null
  const record = asRecord(value)
  if (!record) throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了非法选票')
  const optionIds = readArray(record, ['optionIds', 'option_ids']).filter((item): item is string => typeof item === 'string')
  if (!readBoolean(record, ['hasVoted', 'has_voted'], optionIds.length > 0) && !optionIds.length) return null
  return {
    optionIds,
    createdAt: readOptionalString(record, ['createdAt', 'created_at']) || undefined,
    updatedAt: readOptionalString(record, ['updatedAt', 'updated_at']) || undefined,
  }
}

const normalizeResultOption = (value: unknown): VoteResultOption => {
  const record = asRecord(value)
  if (!record) throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了非法结果选项')
  return {
    optionId: requiredString(record, ['optionId', 'option_id', 'id'], '结果选项 ID'),
    count: readNumber(record, ['count'], 0),
    percentage: readNumber(record, ['percentage'], 0),
  }
}

const normalizeResult = (value: unknown): VoteResult | null => {
  if (value === null || value === undefined) return null
  const record = asRecord(value)
  if (!record) throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了非法结果')
  return {
    totalBallots: readNumber(record, ['totalBallots', 'total_ballots'], 0),
    options: readArray(record, ['options']).map(normalizeResultOption),
  }
}

const normalizeParticipant = (value: unknown): VoteParticipant | undefined => {
  const record = asRecord(value)
  if (!record) return undefined
  const id = readString(record, ['id', '_id', 'userId', 'user_id', 'guestId', 'guest_id'])
  if (!id) return undefined
  const rawType = readString(record, ['type', 'voterType', 'voter_type'], 'user')
  const type: VoteViewerType = rawType === 'guest' ? 'guest' : rawType === 'anonymous' ? 'anonymous' : 'user'
  const optionIds = readArray(record, ['optionIds', 'option_ids']).filter((item): item is string => typeof item === 'string')
  return {
    id,
    type,
    name: readString(record, ['name', 'nickname', 'displayName', 'display_name']) || undefined,
    avatar: readOptionalString(record, ['avatar', 'avatarUrl', 'avatar_url']),
    ...(optionIds.length ? { optionIds } : {}),
  }
}

const normalizeParticipation = (value: unknown): VoteParticipation | null => {
  if (value === null || value === undefined) return null
  const record = asRecord(value)
  if (!record) throw new VoteRepositoryError('INVALID_RESPONSE', '投票接口返回了非法参与情况')
  const participants = readArray(record, ['participants', 'items'])
    .map(normalizeParticipant)
    .filter((item): item is VoteParticipant => Boolean(item))
  const totalValue = firstValue(record, ['total', 'totalBallots', 'total_ballots'])
  const total = totalValue === undefined ? undefined : readNumber(record, ['total', 'totalBallots', 'total_ballots'], 0)
  return {
    ...(total === undefined ? {} : { total }),
    ...(participants.length ? { participants } : {}),
  }
}

export const normalizeVoteDetail = (response: unknown): VoteDetail => {
  const record = unwrapData(response, '投票详情接口')
  const vote = normalizeVote(record.vote)
  return {
    vote,
    viewer: normalizeViewer(record.viewer, vote),
    myBallot: normalizeBallot(record.myBallot ?? record.my_ballot),
    participation: normalizeParticipation(record.participation),
    result: normalizeResult(record.result),
  }
}

export const normalizeParticipants = (response: unknown): VoteParticipation => {
  const record = unwrapData(response, '投票参与者接口')
  const pagination = asRecord(record.pagination) || {}
  const participants = readArray(record, ['items', 'participants'])
    .map(normalizeParticipant)
    .filter((item): item is VoteParticipant => Boolean(item))
  return {
    total: readNumber(pagination, ['total'], participants.length),
    participants,
  }
}

const getBackendReason = (error: unknown): string => {
  const record = asRecord(error)
  const data = asRecord(record?.data)
  const nestedData = asRecord(data?.data)
  return (
    readString(data || {}, ['reason', 'errorCode', 'error_code']) || readString(nestedData || {}, ['reason', 'errorCode', 'error_code'])
  )
}
const getErrorMessage = (error: unknown): string => {
  const record = asRecord(error)
  return readString(record || {}, ['message', 'msg'], '投票操作失败，请稍后重试')
}

const mapBackendErrorCode = (error: unknown): VoteRepositoryErrorCode => {
  const record = asRecord(error)
  const statusCode = readNumber(record || {}, ['statusCode', 'code'], 0)
  const reason = getBackendReason(error)
  if (statusCode === 401 || reason === 'VOTE_GUEST_NOT_ALLOWED') return 'LOGIN_REQUIRED'
  if (reason === 'VOTE_NOT_FOUND') return 'VOTE_NOT_FOUND'
  if (reason === 'VOTE_ALREADY_VOTED') return 'ALREADY_VOTED'
  if (reason === 'VOTE_CLOSED' || reason === 'VOTE_EXPIRED' || reason === 'VOTE_NOT_STARTED') return 'VOTE_CLOSED'
  if (reason === 'VOTE_INVALID_OPTION') return 'INVALID_OPTIONS'
  if (reason === 'VOTE_INVALID_CHOICE_COUNT') return 'TOO_MANY_CHOICES'
  if (reason === 'VOTE_RESULT_NOT_VISIBLE') return 'RESULT_NOT_VISIBLE'
  if (reason === 'VOTE_CHANGE_NOT_ALLOWED' || reason === 'VOTE_NOT_VOTED') return 'NOT_ALLOWED'
  if (reason === 'VOTE_PERMISSION_DENIED' || reason === 'VOTE_NOT_REVEALABLE' || reason === 'VOTE_STRUCTURE_LOCKED') return 'NOT_ALLOWED'
  return 'NOT_ALLOWED'
}

export const toVoteRepositoryError = (error: unknown): VoteRepositoryError => {
  if (error instanceof VoteRepositoryError) return error
  return new VoteRepositoryError(mapBackendErrorCode(error), getErrorMessage(error))
}

const buildCreatePayload = (input: VoteCreateInput): postVotesBody => {
  const endAt = input.schedule.endAt
  if (!endAt) throw new VoteRepositoryError('INVALID_REQUEST', '截止时间不能为空')
  const requestOptions = input.options.map((option, index) => ({
    id: `vote-option-${Date.now().toString(36)}-${index + 1}`,
    text: option.text.trim(),
    order: index,
    ...(option.imageUrl ? { imageUrl: option.imageUrl } : {}),
  }))
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    voteType: input.voteType,
    options: requestOptions,
    rules: {
      maxChoices: input.voteType === 'single' ? 1 : input.rules.maxChoices || requestOptions.length,
      allowGuest: input.rules.allowGuest,
      allowChangeVote: input.rules.allowChangeVote,
      allowParticipantAddOption: false,
    },
    privacy: input.privacy,
    schedule: {
      ...(input.schedule.startAt ? { startAt: input.schedule.startAt } : {}),
      endAt,
    },
  }
}

const mergeParticipation = (detail: VoteDetail, participants: VoteParticipation): VoteDetail => ({
  ...detail,
  participation: {
    ...(detail.participation || {}),
    ...participants,
  },
})

export class ApiVoteRepository implements VoteRepository {
  private async request<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action()
    } catch (error: unknown) {
      throw toVoteRepositoryError(error)
    }
  }

  async getDetail(id: string): Promise<VoteDetail> {
    const detail = await this.request(async () => normalizeVoteDetail(await getVotesVoteId(id)))
    if (!detail.viewer.canViewParticipants) return detail
    try {
      const response = await this.request(() => getVotesVoteIdParticipants(id, { page: 1, pageSize: 20 }))
      return mergeParticipation(detail, normalizeParticipants(response))
    } catch {
      return detail
    }
  }

  async create(input: VoteCreateInput): Promise<VoteDetail> {
    const created = await this.request(() => postVotes(buildCreatePayload(input)))
    const vote = normalizeVote(created)
    return this.getDetail(vote.id)
  }

  async submitBallot(id: string, optionIds: string[]): Promise<VoteDetail> {
    const body: postVotesVoteIdBallotsBody = { optionIds }
    await this.request(() => postVotesVoteIdBallots(id, body))
    return this.getDetail(id)
  }

  async updateBallot(id: string, optionIds: string[]): Promise<VoteDetail> {
    const body: patchVotesVoteIdBallotBody = { optionIds }
    await this.request(() => patchVotesVoteIdBallot(id, body))
    return this.getDetail(id)
  }

  async updateBasicInfo(id: string, input: VoteUpdateInput): Promise<VoteDetail> {
    const body: patchVotesVoteIdBody = {
      title: input.title.trim(),
      description: input.description.trim(),
    }
    await this.request(() => patchVotesVoteId(id, body))
    return this.getDetail(id)
  }

  async close(id: string): Promise<VoteDetail> {
    await this.request(() => postVotesVoteIdClose(id))
    return this.getDetail(id)
  }

  async reveal(id: string): Promise<VoteDetail> {
    await this.request(() => postVotesVoteIdReveal(id))
    return this.getDetail(id)
  }
}
