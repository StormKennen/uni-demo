/**
 * @description Votes/创建投票--接口请求Body参数
 * @url POST /votes
 */
export interface postVotesBody {
  description?: string
  options: postVotesBodyOptions[]
  privacy?: postVotesBodyPrivacy
  rules?: postVotesBodyRules
  schedule: postVotesBodySchedule
  title: string
  voteType: 'single' | 'multiple'
}

/** postVotesBodyOptions */
export interface postVotesBodyOptions {
  id: string
  imageUrl?: any
  order?: number
  text: string
}

/** postVotesBodyPrivacy */
export interface postVotesBodyPrivacy {
  identityVisibility?: 'public' | 'organizer_only' | 'anonymous'
  participationVisibility?: 'participants' | 'count_only' | 'hidden'
  resultVisibility?:
    | 'realtime'
    | 'after_vote'
    | 'after_close'
    | 'manual_reveal'
    | 'organizer_only'
}

/** postVotesBodyRules */
export interface postVotesBodyRules {
  allowChangeVote?: boolean
  allowGuest?: boolean
  allowParticipantAddOption?: boolean
  maxChoices?: number
}

/** postVotesBodySchedule */
export interface postVotesBodySchedule {
  endAt: string
  startAt?: string
}

/**
 * @description Votes/创建投票--接口返回值
 * @url POST /votes
 */
export type postVotesRes = object

/**
 * @description Votes/分页获取投票参与者--接口请求Query参数
 * @url GET /votes/{voteId}/participants
 */
export interface getVotesVoteIdParticipantsQuery {
  page?: number

  pageSize?: number
}

/**
 * @description Votes/分页获取投票参与者--接口返回值
 * @url GET /votes/{voteId}/participants
 */
export type getVotesVoteIdParticipantsRes = object

/**
 * @description Votes/关闭投票--接口返回值
 * @url POST /votes/{voteId}/close
 */
export type postVotesVoteIdCloseRes = object

/**
 * @description Votes/手动公布投票结果--接口返回值
 * @url POST /votes/{voteId}/reveal
 */
export type postVotesVoteIdRevealRes = object

/**
 * @description Votes/提交投票--接口请求Body参数
 * @url POST /votes/{voteId}/ballots
 */
export interface postVotesVoteIdBallotsBody {
  optionIds: string[]
}

/**
 * @description Votes/提交投票--接口返回值
 * @url POST /votes/{voteId}/ballots
 */
export type postVotesVoteIdBallotsRes = object

/**
 * @description Votes/修改自己的投票--接口请求Body参数
 * @url PATCH /votes/{voteId}/ballot
 */
export interface patchVotesVoteIdBallotBody {
  optionIds: string[]
}

/**
 * @description Votes/修改自己的投票--接口返回值
 * @url PATCH /votes/{voteId}/ballot
 */
export type patchVotesVoteIdBallotRes = object

/**
 * @description Votes/获取投票详情、权限、我的投票和可见结果--接口返回值
 * @url GET /votes/{voteId}
 */
export type getVotesVoteIdRes = object

/**
 * @description Votes/更新投票--接口请求Body参数
 * @url PATCH /votes/{voteId}
 */
export interface patchVotesVoteIdBody {
  description?: string
  options?: patchVotesVoteIdBodyOptions[]
  privacy?: patchVotesVoteIdBodyPrivacy
  rules?: patchVotesVoteIdBodyRules
  schedule?: patchVotesVoteIdBodySchedule
  title?: string
  voteType?: 'single' | 'multiple'
}

/** patchVotesVoteIdBodyOptions */
export interface patchVotesVoteIdBodyOptions {
  id: string
  imageUrl?: any
  order?: number
  text: string
}

/** patchVotesVoteIdBodyPrivacy */
export interface patchVotesVoteIdBodyPrivacy {
  identityVisibility?: 'public' | 'organizer_only' | 'anonymous'
  participationVisibility?: 'participants' | 'count_only' | 'hidden'
  resultVisibility?:
    | 'realtime'
    | 'after_vote'
    | 'after_close'
    | 'manual_reveal'
    | 'organizer_only'
}

/** patchVotesVoteIdBodyRules */
export interface patchVotesVoteIdBodyRules {
  allowChangeVote?: boolean
  allowGuest?: boolean
  allowParticipantAddOption?: boolean
  maxChoices?: number
}

/** patchVotesVoteIdBodySchedule */
export interface patchVotesVoteIdBodySchedule {
  endAt: string
  startAt?: string
}

/**
 * @description Votes/更新投票--接口返回值
 * @url PATCH /votes/{voteId}
 */
export type patchVotesVoteIdRes = object
