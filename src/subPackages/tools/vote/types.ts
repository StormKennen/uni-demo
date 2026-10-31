export type VoteType = 'single' | 'multiple'

export interface VoteOption {
  id: string
  text: string
  imageUrl?: string | null
  order: number
}

export interface VoteRules {
  maxChoices?: number
  allowGuest: boolean
  allowChangeVote: boolean
  allowParticipantAddOption: boolean
}

export type VoteIdentityVisibility = 'public' | 'organizer_only' | 'anonymous'
export type VoteParticipationVisibility = 'participants' | 'count_only' | 'hidden'
export type VoteResultVisibility = 'realtime' | 'after_vote' | 'after_close' | 'manual_reveal' | 'organizer_only'
export type VoteStatus = 'active' | 'closed' | 'revealed'
export type VoteViewerType = 'user' | 'guest' | 'anonymous'
export type VoteBlockReason = 'login_required' | 'closed' | 'already_voted' | 'not_allowed' | 'invalid'

export interface VotePrivacy {
  identityVisibility: VoteIdentityVisibility
  participationVisibility: VoteParticipationVisibility
  resultVisibility: VoteResultVisibility
}

export interface VoteSchedule {
  startAt?: string | null
  endAt?: string | null
}

export interface Vote {
  id: string
  creatorId: string
  title: string
  description?: string
  voteType: VoteType
  options: VoteOption[]
  rules: VoteRules
  privacy: VotePrivacy
  schedule: VoteSchedule
  status: VoteStatus
  revealedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface VoteViewer {
  type: VoteViewerType
  isCreator: boolean
  hasVoted: boolean
  canVote: boolean
  canChangeVote: boolean
  canViewParticipationCount: boolean
  canViewParticipants: boolean
  canViewResults: boolean
  canViewVoterChoices: boolean
  canEdit: boolean
  canClose: boolean
  canReveal: boolean
  blockReason?: VoteBlockReason
}

export interface VoteMyBallot {
  optionIds: string[]
  createdAt?: string
  updatedAt?: string
}

export interface VoteResultOption {
  optionId: string
  count: number
  percentage: number
}

export interface VoteResult {
  totalBallots: number
  options: VoteResultOption[]
}

export interface VoteParticipant {
  id: string
  type: VoteViewerType
  name?: string
  avatar?: string | null
  optionIds?: string[]
}

export interface VoteParticipation {
  total?: number
  participants?: VoteParticipant[]
}

export interface VoteDetail {
  vote: Vote
  viewer: VoteViewer
  myBallot?: VoteMyBallot | null
  participation?: VoteParticipation | null
  result?: VoteResult | null
}

export interface VoteCreateInput {
  title: string
  description: string
  voteType: VoteType
  options: Array<Pick<VoteOption, 'text' | 'imageUrl'>>
  rules: VoteRules
  privacy: VotePrivacy
  schedule: VoteSchedule
}

export interface VoteUpdateInput {
  title: string
  description: string
}
