import type { VoteCreateInput, VoteDetail, VoteUpdateInput } from '../types'

export type VoteRepositoryErrorCode =
  | 'VOTE_NOT_FOUND'
  | 'LOGIN_REQUIRED'
  | 'ALREADY_VOTED'
  | 'VOTE_CLOSED'
  | 'INVALID_OPTIONS'
  | 'TOO_MANY_CHOICES'
  | 'RESULT_NOT_VISIBLE'
  | 'NOT_ALLOWED'
  | 'INVALID_REQUEST'
  | 'INVALID_RESPONSE'

export class VoteRepositoryError extends Error {
  code: VoteRepositoryErrorCode

  constructor(code: VoteRepositoryErrorCode, message: string) {
    super(message)
    this.name = 'VoteRepositoryError'
    this.code = code
  }
}

export interface VoteRepository {
  getDetail(id: string): Promise<VoteDetail>
  create(input: VoteCreateInput): Promise<VoteDetail>
  submitBallot(id: string, optionIds: string[]): Promise<VoteDetail>
  updateBallot(id: string, optionIds: string[]): Promise<VoteDetail>
  updateBasicInfo(id: string, input: VoteUpdateInput): Promise<VoteDetail>
  close(id: string): Promise<VoteDetail>
  reveal(id: string): Promise<VoteDetail>
}
