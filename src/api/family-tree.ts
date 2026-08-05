import http from '@/services/http'

export interface FamilyMemberName {
  full?: string
  given?: string
  surname?: string
}

export interface FamilyMember {
  avatarUrl?: string
  children?: Array<string | { name?: string }>
  gender?: 'male' | 'female' | 'unknown'
  generation?: number
  givenName?: string
  id?: string
  name?: string
  nameZh?: FamilyMemberName
  spouseRelations?: unknown[]
  surname?: string
}

export interface UpdateFamilyMemberInput {
  gender?: 'male' | 'female' | 'unknown'
  givenName?: string
  surname?: string
}

export const getFamilyMemberDetail = (memberId: string): Promise<FamilyMember> =>
  http.get(`/families/members/${encodeURIComponent(memberId)}`) as Promise<FamilyMember>

export const updateFamilyMember = (memberId: string, data: UpdateFamilyMemberInput): Promise<FamilyMember> =>
  http.patch(`/families/members/${encodeURIComponent(memberId)}`, data) as Promise<FamilyMember>
