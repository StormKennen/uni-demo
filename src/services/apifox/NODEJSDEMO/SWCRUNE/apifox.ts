/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck: 忽略类型错误 系统工具生成
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  getCompendiumsRunesMetadataQuery,
  getCompendiumsRunesMetadataRes,
  postCompendiumsRunesEvaluateBody,
  postCompendiumsRunesEvaluateRes,
  postCompendiumsRunesRecognizeBody,
  postCompendiumsRunesRecognizeRes,
} from './interface'
const baseURL = undefined
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description SWCRune/识别符文截图（仅抽取字段）
 * @url POST /compendiums/runes/recognize
 * @host https://app.apifox.com/link/project/7048425/apis
 */
export const postCompendiumsRunesRecognize = async (
  data: Omit<Expand<postCompendiumsRunesRecognizeBody>, 'image'> & { filePath: string },
  config?: Expand<ParticalUniAppRequestOptions> & { onTask?: (task: { abort: () => void }) => void },
): Promise<Expand<postCompendiumsRunesRecognizeRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  const { filePath, ...formData } = data
  return http.upload(
    '/compendiums/runes/recognize',
    { filePath, name: 'image', formData: { compendiumId: 'swc' } },
    _config,
  )
}

/**
 * @description SWCRune/确定性评估符文并推荐适配人物
 * @url POST /compendiums/runes/evaluate
 * @host https://app.apifox.com/link/project/7048425/apis
 */
export const postCompendiumsRunesEvaluate = async (
  data: Expand<postCompendiumsRunesEvaluateBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postCompendiumsRunesEvaluateRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/compendiums/runes/evaluate', data, _config)
}

/**
 * @description SWCRune/获取 SWC 符文规则元数据
 * @url GET /compendiums/runes/metadata
 * @host https://app.apifox.com/link/project/7048425/apis
 */
export const getCompendiumsRunesMetadata = async (
  params: Expand<getCompendiumsRunesMetadataQuery>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getCompendiumsRunesMetadataRes>> => {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/compendiums/runes/metadata', params, _config)
}
