import http from '@/services/http'

export interface ApiPage<T> {
  results: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ApiPaginatedPayload<T> {
  items: T[]
  pagination: Omit<ApiPage<T>, 'results'>
}

const normalizePage = <T>(payload: ApiPaginatedPayload<T>): ApiPage<T> => ({
  results: payload.items,
  ...payload.pagination,
})

export interface AnimalCategory {
  id: string
  code: string
  name: string
  nameEn?: string
  icon?: string
  sort: number
  animalCount: number
}

export interface SoundType {
  id: string
  code: string
  name: string
  nameEn?: string
  description?: string
  icon?: string
  sort: number
}

export interface TagDictionaryItem {
  code: string
  name: string
  nameEn?: string
}

export interface TagDictionaries {
  emotions: TagDictionaryItem[]
  contexts: TagDictionaryItem[]
}

export interface AnimalCard {
  id: string
  code: string
  name: string
  nameEn?: string
  scientificName?: string
  coverUrl: string
  coverExpiresAt?: string | null
  categoryIds: string[]
  defaultSoundId: string | null
  soundCount: number
  soundTypeCount: number
  featured: boolean
  sort: number
}

export interface PublicSoundSource {
  provider?: string
  externalId?: string
  title?: string
  sourceUrl?: string
  author?: string
  license?: string
  licenseUrl?: string
  attribution?: string
  modified?: boolean
  modificationNotes?: string
}

export interface AnimalDetail {
  id: string
  code: string
  name: string
  nameEn?: string
  scientificName?: string
  coverUrl: string
  coverExpiresAt?: string | null
  coverSource?: PublicSoundSource
  aliases: string[]
  description: string
  categoryIds: { id: string; code: string; name: string; nameEn?: string; icon?: string }[]
  defaultSound: { id: string; title: string; titleEn?: string; durationMs: number } | null
  soundCount: number
  soundTypeCount: number
  soundTypes: SoundType[]
}

export interface AnimalSoundCard {
  id: string
  animalId: string
  soundTypeId: string
  soundTypeCode: string
  soundTypeName: string
  soundTypeNameEn?: string
  title: string
  titleEn?: string
  description?: string
  emotionTags: string[]
  contextTags: string[]
  durationMs: number
  sort: number
}

export interface SoundDetail {
  id: string
  code: string
  animal: { id: string; code: string; name: string; nameEn?: string }
  soundType: { id: string; code: string; name: string; nameEn?: string; icon?: string }
  title: string
  titleEn?: string
  description?: string
  emotionTags: string[]
  contextTags: string[]
  interpretationConfidence: string
  interpretationEvidence?: string
  durationMs: number
  mimeType: string
  mediaVersion: string
  source: PublicSoundSource
}

export interface SignedPlayUrl {
  soundId: string
  playUrl: string
  expiresAt: string
  durationMs: number
  mimeType: string
  mediaVersion: string
}

export interface AnimalQuery {
  categoryId?: string
  keyword?: string
  soundTypeId?: string
  emotionTag?: string
  contextTag?: string
  featured?: boolean
  page: number
  limit: number
  sortBy?: 'sort' | 'name' | 'featured'
}

export interface SoundQuery {
  soundTypeId?: string
  emotionTag?: string
  contextTag?: string
  page: number
  limit: number
  sortBy?: 'sort' | 'newest'
}

const queryString = (query: AnimalQuery | SoundQuery) => {
  const parts = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value)))
  return parts.length ? '?' + parts.join('&') : ''
}

export const getCategories = () => http.get('/animal-sounds/categories') as Promise<AnimalCategory[]>
export const getSoundTypes = () => http.get('/animal-sounds/sound-types') as Promise<SoundType[]>
export const getTags = () => http.get('/animal-sounds/tags') as Promise<TagDictionaries>
export const getAnimals = async (query: AnimalQuery) =>
  normalizePage((await http.get('/animal-sounds/animals' + queryString(query))) as ApiPaginatedPayload<AnimalCard>)
export const getAnimal = (animalId: string) => http.get('/animal-sounds/animals/' + encodeURIComponent(animalId)) as Promise<AnimalDetail>
export const getAnimalSounds = async (animalId: string, query: SoundQuery) =>
  normalizePage(
    (await http.get(
      '/animal-sounds/animals/' + encodeURIComponent(animalId) + '/sounds' + queryString(query),
    )) as ApiPaginatedPayload<AnimalSoundCard>,
  )
export const getSound = (soundId: string) => http.get('/animal-sounds/sounds/' + encodeURIComponent(soundId)) as Promise<SoundDetail>
export const getPlayUrl = (soundId: string) =>
  http.get('/animal-sounds/sounds/' + encodeURIComponent(soundId) + '/play-url') as Promise<SignedPlayUrl>
