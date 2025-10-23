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
    GetBizCompanySalariesTaxDocumentListQuery,
    GetBizCompanySalariesTaxDocumentListRes,
    PostBizCompanySalariesTaxDocumentConfirmationReq,
    PostBizCompanySalariesTaxDocumentConfirmationRes,
    PostBizCompanySalariesTaxDocumentSupplementaryMaterialsReq,
    PostBizCompanySalariesTaxDocumentSupplementaryMaterialsRes,
    GetBizCompanySalariesTaxDocumentSupplementaryMaterialsQuery,
    GetBizCompanySalariesTaxDocumentSupplementaryMaterialsRes,
    PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressReq,
    PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressRes,
    PostBizCompanySalariesTaxDocumentSignDocumentReq,
    PostBizCompanySalariesTaxDocumentSignDocumentRes,
    GetBizCompanySalariesTaxDocumentSignDocumentDetailQuery,
    GetBizCompanySalariesTaxDocumentSignDocumentDetailRes,
} from './interface'
    
/** 文件制作-列表信息 */
export function GetBizCompanySalariesTaxDocumentList(params: GetBizCompanySalariesTaxDocumentListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanySalariesTaxDocumentListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/salaries-tax/document/list`, params, _config) as Promise<GetBizCompanySalariesTaxDocumentListRes>
}

/** 文件制作-文件确认 */
export function PostBizCompanySalariesTaxDocumentConfirmation(params: PostBizCompanySalariesTaxDocumentConfirmationReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySalariesTaxDocumentConfirmationRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/salaries-tax/document/confirmation`, params, _config) as Promise<PostBizCompanySalariesTaxDocumentConfirmationRes>
}

/** 文件制作-补充材料上传 */
export function PostBizCompanySalariesTaxDocumentSupplementaryMaterials(params: PostBizCompanySalariesTaxDocumentSupplementaryMaterialsReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySalariesTaxDocumentSupplementaryMaterialsRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/salaries-tax/document/supplementary-materials`, params, _config) as Promise<PostBizCompanySalariesTaxDocumentSupplementaryMaterialsRes>
}

/** 文件制作-补充材料详情 */
export function GetBizCompanySalariesTaxDocumentSupplementaryMaterials(params: GetBizCompanySalariesTaxDocumentSupplementaryMaterialsQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanySalariesTaxDocumentSupplementaryMaterialsRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/salaries-tax/document/supplementary-materials`, params, _config) as Promise<GetBizCompanySalariesTaxDocumentSupplementaryMaterialsRes>
}

/** 文件制作-客户收件地址 */
export function PostBizCompanySalariesTaxDocumentCustomerDeliveryAddress(params: PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/salaries-tax/document/customer-delivery-address`, params, _config) as Promise<PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressRes>
}

/** 文件制作-上传签字文件 */
export function PostBizCompanySalariesTaxDocumentSignDocument(params: PostBizCompanySalariesTaxDocumentSignDocumentReq, config?: ParticalUniAppRequestOptions): Promise<PostBizCompanySalariesTaxDocumentSignDocumentRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/company/salaries-tax/document/sign-document`, params, _config) as Promise<PostBizCompanySalariesTaxDocumentSignDocumentRes>
}

/** 文件制作-签字文件详情 */
export function GetBizCompanySalariesTaxDocumentSignDocumentDetail(params: GetBizCompanySalariesTaxDocumentSignDocumentDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizCompanySalariesTaxDocumentSignDocumentDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/company/salaries-tax/document/sign-document-detail`, params, _config) as Promise<GetBizCompanySalariesTaxDocumentSignDocumentDetailRes>
}
