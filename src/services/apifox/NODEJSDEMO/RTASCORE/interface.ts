/**
 * @description RTAScore/获取 RTA 分数筛选枚举--接口请求Query参数
 * @url GET /compendiums/rta/score/options
 */
export interface getRtaScoreOptionsQuery {
  compendiumId: string

  server?: string

  league?: string

  season?: number

  provider?: string

  locale?: string
}

/**
 * @description RTAScore/获取 RTA 分数筛选枚举--接口返回值
 * @url GET /compendiums/rta/score/options
 */
export type getRtaScoreOptionsRes = object

/**
 * @description RTAScore/获取 RTA 分数能力配置--接口请求Query参数
 * @url GET /compendiums/rta/score/config
 */
export interface getRtaScoreConfigQuery {
  compendiumId: string

  server?: string

  league?: string

  season?: number

  provider?: string

  locale?: string
}

/**
 * @description RTAScore/获取 RTA 分数能力配置--接口返回值
 * @url GET /compendiums/rta/score/config
 */
export type getRtaScoreConfigRes = object

/**
 * @description RTAScore/获取当前 RTA 分数线快照--接口请求Query参数
 * @url GET /compendiums/rta/score/current
 */
export interface getRtaScoreCurrentQuery {
  compendiumId: string

  server?: string

  season?: number

  provider?: string

  league?: string

  locale?: string
}

/**
 * @description RTAScore/获取当前 RTA 分数线快照--接口返回值
 * @url GET /compendiums/rta/score/current
 */
export type getRtaScoreCurrentRes = object

/**
 * @description RTAScore/获取 RTA 分数历史曲线--接口请求Query参数
 * @url GET /compendiums/rta/score/history
 */
export interface getRtaScoreHistoryQuery {
  compendiumId: string

  server?: string

  season?: number

  provider?: string

  targetKey: string

  interval?: string

  from?: string

  to?: string

  league?: string

  locale?: string
}

/**
 * @description RTAScore/获取 RTA 分数历史曲线--接口返回值
 * @url GET /compendiums/rta/score/history
 */
export type getRtaScoreHistoryRes = object

/**
 * @description RTAScore/获取 RTA 赛季分数预测--接口请求Query参数
 * @url GET /compendiums/rta/score/forecast
 */
export interface getRtaScoreForecastQuery {
  compendiumId: string

  server?: string

  season?: number

  targetKey: string

  currentScore?: number

  league?: string

  locale?: string
}

/**
 * @description RTAScore/获取 RTA 赛季分数预测--接口返回值
 * @url GET /compendiums/rta/score/forecast
 */
export type getRtaScoreForecastRes = object

/**
 * @description RTAScore/获取 RTA 历史赛季相对 FINAL 曲线--接口请求Query参数
 * @url GET /compendiums/rta/score/season-history
 */
export interface getRtaScoreSeasonHistoryQuery {
  compendiumId: string

  server?: string

  season?: number

  targetKey: string

  league?: string
}

/**
 * @description RTAScore/获取 RTA 历史赛季相对 FINAL 曲线--接口返回值
 * @url GET /compendiums/rta/score/season-history
 */
export type getRtaScoreSeasonHistoryRes = object
