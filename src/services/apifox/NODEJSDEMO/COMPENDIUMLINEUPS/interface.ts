/**
 * @description CompendiumLineups/Get lineup usage for a character--接口请求Query参数
 * @url GET /compendiums/characters/{characterId}/lineups
 */
export interface getCharactersCharacterIdLineupsQuery {
  /** Optional locale used for translated character names inside lineup members. */
  locale?: string
}

/**
 * @description CompendiumLineups/Get lineup usage for a character--接口返回值
 * @url GET /compendiums/characters/{characterId}/lineups
 */
export type getCharactersCharacterIdLineupsRes = string

/**
 * @description CompendiumLineups/Get lineup list for the admin editor--接口请求Query参数
 * @url GET /admin/lineups
 */
export interface getAdminLineupsQuery {
  /** Game code or game id. */
  compendiumId: string
  /** Optional locale used for translated character names in lineup members. */
  locale?: string
  /** Searches lineup `name` and `description`. */
  keyword?: string
  /** Filter by lineup type. */
  type?: string
  /** Filter by lineup status. */
  status?: string
  /** Sort field. */
  sortBy?: string
  /** Sort direction. */
  sortOrder?: string
  /** Page number. */
  page?: number
  /** Page size. */
  pageSize?: number
}

/**
 * @description CompendiumLineups/Get lineup list for the admin editor--接口返回值
 * @url GET /admin/lineups
 */
export type getAdminLineupsRes = string

/**
 * @description CompendiumLineups/Create a lineup--接口请求Body参数
 * @url POST /admin/lineups
 */
export interface postAdminLineupsBody {
  /** Character ids selected by the editor. The backend expands them into lineup members and matching keys. */
  characterIds: string[]
  /** Game code or game id. Usually the compendium code such as `swc`. */
  compendiumId: string
  /** Optional note shown in the editor or details page. */
  description?: string
  /** Lineup display name. */
  name: string
  status?: postAdminLineupsBodyStatus
  type: postAdminLineupsBodyType
}

/** Whether the lineup is available for public matching and management. */
export type postAdminLineupsBodyStatus = 'enabled' | 'disabled'

/** Lineup category.
- `offense`: an attacking lineup used to break defenses
- `defense`: a defending lineup that can be countered by offense lineups
 */
export type postAdminLineupsBodyType = 'offense' | 'defense'

/**
 * @description CompendiumLineups/Create a lineup--接口返回值
 * @url POST /admin/lineups
 */
export type postAdminLineupsRes = string

/**
 * @description CompendiumLineups/Get lineup options for select components--接口请求Query参数
 * @url GET /admin/lineups/options
 */
export interface getAdminLineupsOptionsQuery {
  /** Game code or game id. */
  compendiumId: string
  /** Optional locale used for translated character names in lineup members. */
  locale?: string
  /** Keyword for lineup name and description. */
  keyword?: string
  /** Usually `defense` for source selection or `offense` for target selection. */
  type?: string
  /** Optional lineup status filter. */
  status?: string

  page?: number

  pageSize?: number
}

/**
 * @description CompendiumLineups/Get lineup options for select components--接口返回值
 * @url GET /admin/lineups/options
 */
export type getAdminLineupsOptionsRes = string

/**
 * @description CompendiumLineups/Get character options for the lineup member picker--接口请求Query参数
 * @url GET /admin/lineups/character-options
 */
export interface getAdminLineupsCharacterOptionsQuery {
  /** Game code or game id. */
  compendiumId: string
  /** Optional locale used for translated character names. */
  locale?: string
  /** Searches character `name` and `code`. */
  keyword?: string
  /** Filter by character status. */
  status?: string

  page?: number

  pageSize?: number
}

/**
 * @description CompendiumLineups/Get character options for the lineup member picker--接口返回值
 * @url GET /admin/lineups/character-options
 */
export type getAdminLineupsCharacterOptionsRes = string

/**
 * @description CompendiumLineups/Get lineup detail--接口请求Query参数
 * @url GET /admin/lineups/{lineupId}
 */
export interface getAdminLineupsLineupIdQuery {
  /** Optional locale used for translated character names. */
  locale?: string
}

/**
 * @description CompendiumLineups/Get lineup detail--接口返回值
 * @url GET /admin/lineups/{lineupId}
 */
export type getAdminLineupsLineupIdRes = string

/**
 * @description CompendiumLineups/Update a lineup--接口请求Body参数
 * @url PATCH /admin/lineups/{lineupId}
 */
export interface patchAdminLineupsLineupIdBody {
  /** Optional full replacement of lineup members. Must still contain 2 to 5 characters. */
  characterIds?: string[]
  /** Updated lineup description. */
  description?: string
  /** Updated lineup name. */
  name?: string
  status?: patchAdminLineupsLineupIdBodyStatus
  type?: patchAdminLineupsLineupIdBodyType
}

/** Whether the lineup is available for public matching and management. */
export type patchAdminLineupsLineupIdBodyStatus = 'enabled' | 'disabled'

/** Lineup category.
- `offense`: an attacking lineup used to break defenses
- `defense`: a defending lineup that can be countered by offense lineups
 */
export type patchAdminLineupsLineupIdBodyType = 'offense' | 'defense'

/**
 * @description CompendiumLineups/Update a lineup--接口返回值
 * @url PATCH /admin/lineups/{lineupId}
 */
export type patchAdminLineupsLineupIdRes = string

/**
 * @description CompendiumLineups/Delete a lineup--接口返回值
 * @url DELETE /admin/lineups/{lineupId}
 */
export type deleteAdminLineupsLineupIdRes = string

/**
 * @description CompendiumLineups/Get lineup relation detail for one defense lineup--接口请求Query参数
 * @url GET /admin/lineup-relations/{sourceLineupId}
 */
export interface getAdminLineupRelationsSourceLineupIdQuery {
  /** Optional locale used for translated character names. */
  locale?: string
}

/**
 * @description CompendiumLineups/Get lineup relation detail for one defense lineup--接口返回值
 * @url GET /admin/lineup-relations/{sourceLineupId}
 */
export type getAdminLineupRelationsSourceLineupIdRes = string

/**
 * @description CompendiumLineups/Save relation targets for one defense lineup--接口请求Body参数
 * @url POST /admin/lineup-relations
 */
export interface postAdminLineupRelationsBody {
  /** Game code or game id used for cross-checking the relation save request. */
  compendiumId?: string
  /** Defense lineup id being edited. */
  sourceLineupId: string
  /** Offense lineup ids that can counter the source defense lineup. */
  targetLineupIds?: string[]
}

/**
 * @description CompendiumLineups/Save relation targets for one defense lineup--接口返回值
 * @url POST /admin/lineup-relations
 */
export type postAdminLineupRelationsRes = string
