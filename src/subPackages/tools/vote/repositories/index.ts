import { ApiVoteRepository } from './api'
import { MockVoteRepository } from './mock'

export * from './api'
export * from './mock'
export * from './types'

export const voteRepository = new ApiVoteRepository()

export const createMockVoteRepository = (seed?: ConstructorParameters<typeof MockVoteRepository>[0]): MockVoteRepository =>
  new MockVoteRepository(seed)
