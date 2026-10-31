/**
 * @description TierRanking/获取评级榜配置--接口请求Query参数
 * @url GET /compendiums/tier-rankings/config
 */
export interface getCompendiumsTierRankingsConfigQuery {
  compendiumId: string

  locale?: string
}

/**
 * @description TierRanking/获取评级榜配置--接口返回值
 * @url GET /compendiums/tier-rankings/config
 */
export type getCompendiumsTierRankingsConfigRes = object

/**
 * @description TierRanking/获取已发布评级报告列表--接口请求Query参数
 * @url GET /compendiums/tier-rankings/reports
 */
export interface getCompendiumsTierRankingsReportsQuery {
  compendiumId: string

  region?: string

  provider?: string

  page?: number

  pageSize?: number
}

/**
 * @description TierRanking/获取已发布评级报告列表--接口返回值
 * @url GET /compendiums/tier-rankings/reports
 */
export type getCompendiumsTierRankingsReportsRes = object

/**
 * @description TierRanking/获取最新已发布评级榜--接口请求Query参数
 * @url GET /compendiums/tier-rankings/latest
 */
export interface getCompendiumsTierRankingsLatestQuery {
  compendiumId: string

  region?: string

  provider?: string
  /** 五行属性筛选，多个值用逗号分隔；省略时不限制属性。 */
  elements?: string
  /** 评级档位筛选，多个值用逗号分隔；省略时不限制档位。 */
  tiers?: string

  locale?: string
}

/**
 * @description TierRanking/获取最新已发布评级榜--接口返回值
 * @url GET /compendiums/tier-rankings/latest
 */
export type getCompendiumsTierRankingsLatestRes = object

/**
 * @description TierRanking/获取指定日期评级榜--接口请求Query参数
 * @url GET /compendiums/tier-rankings/report
 */
export interface getCompendiumsTierRankingsReportQuery {
  compendiumId: string

  reportDate?: string

  region?: string

  provider?: string
  /** 五行属性筛选，多个值用逗号分隔；省略时不限制属性。 */
  elements?: string
  /** 评级档位筛选，多个值用逗号分隔；省略时不限制档位。 */
  tiers?: string

  locale?: string
}

/**
 * @description TierRanking/获取指定日期评级榜--接口返回值
 * @url GET /compendiums/tier-rankings/report
 */
export type getCompendiumsTierRankingsReportRes = object
