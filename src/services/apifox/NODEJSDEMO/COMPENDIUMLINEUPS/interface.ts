/**
 * @description CompendiumLineups/获取人物关联阵容--接口请求Query参数
 * @url GET /compendiums/characters/{characterId}/lineups
 */
export interface getCharactersCharacterIdLineupsQuery {
  /** 可选语言代码，用于翻译阵容成员的人物名称。 */
  locale?: string
  /** 游客设备标识（备选传参方式，推荐使用 `X-Anonymous-Id` 头）。 */
  anonymousId?: string
}

/**
 * @description CompendiumLineups/获取人物关联阵容--接口返回值
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
  /** Exact character id filter. Only lineups containing this exact character member are returned. */
  characterId?: string
  /** Multi-character AND filter. The lineup must contain all specified character ids. Accepts either a JSON array string like ["id1","id2"] or a comma-separated string like id1,id2. */
  characterIds?: any
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

/** Lineup category key stored in the database. It is configurable and not restricted to a fixed enum. */
export type postAdminLineupsBodyType = string

/**
 * @description CompendiumLineups/Create a lineup--接口返回值
 * @url POST /admin/lineups
 */
export type postAdminLineupsRes = string

/**
 * @description CompendiumLineups/Get distinct lineup types for one compendium--接口请求Query参数
 * @url GET /admin/lineups/types
 */
export interface getAdminLineupsTypesQuery {
  /** Game code or game id. */
  compendiumId: string
  /** Optional lineup status filter before aggregating types. */
  status?: string
}

/**
 * @description CompendiumLineups/Get distinct lineup types for one compendium--接口返回值
 * @url GET /admin/lineups/types
 */
export type getAdminLineupsTypesRes = string

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
  /** Exact character id filter. Only lineups containing this exact character member are returned. */
  characterId?: string
  /** Multi-character AND filter. The lineup must contain all specified character ids. Accepts either a JSON array string like ["id1","id2"] or a comma-separated string like id1,id2. */
  characterIds?: any
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
 * @description CompendiumLineups/获取阵容列表（用户侧）--接口请求Query参数
 * @url GET /compendiums/lineups
 */
export interface getCompendiumsLineupsQuery {
  /** 游戏代码或游戏 ID（如 `swc`）。与 `gameId` 二选一。 */
  compendiumId: string
  /** 游戏 ID（与 `compendiumId` 二选一）。 */
  gameId?: string
  /** 可选语言代码，用于翻译人物名称。 */
  locale?: string
  /** 搜索阵容名称和描述。 */
  keyword?: string
  /** 精确筛选包含此人物 ID 的阵容。 */
  characterId?: string
  /** 多人物 AND 筛选：阵容必须同时包含所有指定人物。
接受 JSON 数组字符串 `["id1","id2"]` 或逗号分隔 `id1,id2`。
 */
  characterIds?: any
  /** 按阵容类型筛选。 */
  type?: string
  /** 按阵容状态筛选。 */
  status?: string
  /** 排序字段。 */
  sortBy?: string
  /** 排序方向。 */
  sortOrder?: string
  /** 游客设备标识（备选传参方式，推荐使用 `X-Anonymous-Id` 头）。 */
  anonymousId?: string
  /** 页码，从 1 开始。 */
  page?: number
  /** 每页条数，最大 100。 */
  pageSize?: number
}

/**
 * @description CompendiumLineups/获取阵容列表（用户侧）--接口返回值
 * @url GET /compendiums/lineups
 */
export type getCompendiumsLineupsRes = string

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
 * @description CompendiumLineups/创建阵容（用户侧）--接口请求Body参数
 * @url POST /compendiums/lineups
 */
export interface postCompendiumsLineupsBody {
  /** Character ids selected by the editor. The backend expands them into lineup members and matching keys. */
  characterIds: string[]
  /** Game code or game id. Usually the compendium code such as `swc`. */
  compendiumId: string
  /** Optional note shown in the editor or details page. */
  description?: string
  /** Lineup display name. */
  name: string
  status?: postCompendiumsLineupsBodyStatus
  type: postCompendiumsLineupsBodyType
}

/** Whether the lineup is available for public matching and management. */
export type postCompendiumsLineupsBodyStatus = 'enabled' | 'disabled'

/** Lineup category key stored in the database. It is configurable and not restricted to a fixed enum. */
export type postCompendiumsLineupsBodyType = string

/**
 * @description CompendiumLineups/创建阵容（用户侧）--接口返回值
 * @url POST /compendiums/lineups
 */
export type postCompendiumsLineupsRes = string

/**
 * @description CompendiumLineups/获取阵容详情（用户侧）--接口请求Query参数
 * @url GET /compendiums/lineups/{lineupId}
 */
export interface getCompendiumsLineupsLineupIdQuery {
  /** 可选语言代码。 */
  locale?: string
  /** 游客设备标识（备选传参方式）。 */
  anonymousId?: string
}

/**
 * @description CompendiumLineups/获取阵容详情（用户侧）--接口返回值
 * @url GET /compendiums/lineups/{lineupId}
 */
export type getCompendiumsLineupsLineupIdRes = string

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

/** Lineup category key stored in the database. It is configurable and not restricted to a fixed enum. */
export type patchAdminLineupsLineupIdBodyType = string

/**
 * @description CompendiumLineups/Update a lineup--接口返回值
 * @url PATCH /admin/lineups/{lineupId}
 */
export type patchAdminLineupsLineupIdRes = string

/**
 * @description CompendiumLineups/编辑阵容（用户侧）--接口请求Body参数
 * @url PATCH /compendiums/lineups/{lineupId}
 */
export interface patchCompendiumsLineupsLineupIdBody {
  /** Optional full replacement of lineup members. Must still contain 2 to 5 characters. */
  characterIds?: string[]
  /** Updated lineup description. */
  description?: string
  /** Updated lineup name. */
  name?: string
  status?: patchCompendiumsLineupsLineupIdBodyStatus
  type?: patchCompendiumsLineupsLineupIdBodyType
}

/** Whether the lineup is available for public matching and management. */
export type patchCompendiumsLineupsLineupIdBodyStatus = 'enabled' | 'disabled'

/** Lineup category key stored in the database. It is configurable and not restricted to a fixed enum. */
export type patchCompendiumsLineupsLineupIdBodyType = string

/**
 * @description CompendiumLineups/编辑阵容（用户侧）--接口返回值
 * @url PATCH /compendiums/lineups/{lineupId}
 */
export type patchCompendiumsLineupsLineupIdRes = string

/**
 * @description CompendiumLineups/Delete a lineup--接口返回值
 * @url DELETE /admin/lineups/{lineupId}
 */
export type deleteAdminLineupsLineupIdRes = string

/**
 * @description CompendiumLineups/Get lineup relation detail for one source lineup--接口请求Query参数
 * @url GET /admin/lineup-relations/{sourceLineupId}
 */
export interface getAdminLineupRelationsSourceLineupIdQuery {
  /** Optional locale used for translated character names. */
  locale?: string
}

/**
 * @description CompendiumLineups/Get lineup relation detail for one source lineup--接口返回值
 * @url GET /admin/lineup-relations/{sourceLineupId}
 */
export type getAdminLineupRelationsSourceLineupIdRes = string

/**
 * @description CompendiumLineups/删除阵容（用户侧）--接口返回值
 * @url DELETE /compendiums/lineups/{lineupId}
 */
export type deleteCompendiumsLineupsLineupIdRes = string

/**
 * @description CompendiumLineups/阵容点赞/点踩（态度切换）--接口请求Body参数
 * @url POST /compendiums/lineups/{lineupId}/reaction
 */
export interface postLineupsLineupIdReactionBody {
  /** 游客设备标识（前端生成并持久化到 localStorage）。
未登录时必传；已登录时忽略（以 token 中的 userId 为准）。
 */
  anonymousId?: string
  value: { [key: string]: any }
}

/**
 * @description CompendiumLineups/阵容点赞/点踩（态度切换）--接口返回值
 * @url POST /compendiums/lineups/{lineupId}/reaction
 */
export type postLineupsLineupIdReactionRes = string

/**
 * @description CompendiumLineups/Save relation targets for one source lineup--接口请求Body参数
 * @url POST /admin/lineup-relations
 */
export interface postAdminLineupRelationsBody {
  /** Game code or game id used for cross-checking the relation save request. */
  compendiumId?: string
  /** Source lineup id being edited. */
  sourceLineupId: string
  /** Target lineup ids mapped from the source lineup. */
  targetLineupIds?: string[]
}

/**
 * @description CompendiumLineups/Save relation targets for one source lineup--接口返回值
 * @url POST /admin/lineup-relations
 */
export type postAdminLineupRelationsRes = string
