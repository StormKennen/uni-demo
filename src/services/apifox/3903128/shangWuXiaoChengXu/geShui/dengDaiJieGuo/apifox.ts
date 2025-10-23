/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable vue/no-irregular-whitespace */
/* eslint-disable sort-imports */
import http from '../../../../../http'
import type { ParticalUniAppRequestOptions }   from '../../../../../interface'
const baseURL = undefined
import type {
    GetBizPersonalTaxResultListQuery,
    GetBizPersonalTaxResultListRes,
    PostBizPersonalTaxResultDocumentConfirmationReq,
    PostBizPersonalTaxResultDocumentConfirmationRes,
    PostBizCompanyDocumentSendEmailReq,
    PostBizCompanyDocumentSendEmailRes,
    PostBizPersonalTaxResultDocumentSupplementaryMaterialsReq,
    PostBizPersonalTaxResultDocumentSupplementaryMaterialsRes,
    GetBizPersonalTaxResultDocumentSupplementaryMaterialsQuery,
    GetBizPersonalTaxResultDocumentSupplementaryMaterialsRes,
    PostBizPersonalTaxResultDocumentSupplementaryMaterialsRemoveReq,
    PostBizPersonalTaxResultDocumentSupplementaryMaterialsRemoveRes,
    GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailQuery,
    GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailRes,
} from './interface'
    
/** 个税-等待结果-列表 */
export function GetBizPersonalTaxResultList(params: GetBizPersonalTaxResultListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxResultListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/result/list`, params, _config) as Promise<GetBizPersonalTaxResultListRes>
}

/** 个税-等待结果-文件确认 */
export function PostBizPersonalTaxResultDocumentConfirmation(params: PostBizPersonalTaxResultDocumentConfirmationReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxResultDocumentConfirmationRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/result/document/confirmation`, params, _config) as Promise<PostBizPersonalTaxResultDocumentConfirmationRes>
}

/** 发送邮箱 */
export function PostBizCompanyDocumentSendEmail(params: PostBizCompanyDocumentSendEmailReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanyDocumentSendEmailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/document/send-email`, params, _config) as Promise<PostBizCompanyDocumentSendEmailRes>
}

/** 个税-等待结果-补充材料上传 */
export function PostBizPersonalTaxResultDocumentSupplementaryMaterials(params: PostBizPersonalTaxResultDocumentSupplementaryMaterialsReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxResultDocumentSupplementaryMaterialsRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/result/document/supplementary-materials`, params, _config) as Promise<PostBizPersonalTaxResultDocumentSupplementaryMaterialsRes>
}

/** 个税-等待结果-补充材料列表 */
export function GetBizPersonalTaxResultDocumentSupplementaryMaterials(params: GetBizPersonalTaxResultDocumentSupplementaryMaterialsQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxResultDocumentSupplementaryMaterialsRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/result/document/supplementary-materials`, params, _config) as Promise<GetBizPersonalTaxResultDocumentSupplementaryMaterialsRes>
}

/** 个税-等待结果-补充材料删除 */
export function PostBizPersonalTaxResultDocumentSupplementaryMaterialsRemove(params: PostBizPersonalTaxResultDocumentSupplementaryMaterialsRemoveReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxResultDocumentSupplementaryMaterialsRemoveRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/result/document/supplementary-materials/remove`, params, _config) as Promise<PostBizPersonalTaxResultDocumentSupplementaryMaterialsRemoveRes>
}

/** 个税-等待结果-补充材料详情 */
export function GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetail(params: GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/result/document/supplementary-materials/detail`, params, _config) as Promise<GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailRes>
}
