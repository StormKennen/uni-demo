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
    GetBizPersonalTaxReporterInfoListQuery,
    GetBizPersonalTaxReporterInfoListRes,
    GetBizPersonalTaxReporterInfoFileListQuery,
    GetBizPersonalTaxReporterInfoFileListRes,
    PostBizPersonalTaxReporterInfoCertificatesReq,
    PostBizPersonalTaxReporterInfoCertificatesRes,
    PostBizPersonalTaxReporterInfoInfoReq,
    PostBizPersonalTaxReporterInfoInfoRes,
    PostBizPersonalTaxReporterInfoFileReq,
    PostBizPersonalTaxReporterInfoFileRes,
    GetBizPersonalTaxReporterInfoDetailQuery,
    GetBizPersonalTaxReporterInfoDetailRes,
    PostBizPersonalTaxReporterInfoFileSubmitReq,
    PostBizPersonalTaxReporterInfoFileSubmitRes,
    PostBizPersonalTaxReporterInfoListSubmitReq,
    PostBizPersonalTaxReporterInfoListSubmitRes,
    PostBizPersonalTaxReporterInfoInfoRemoveReq,
    PostBizPersonalTaxReporterInfoInfoRemoveRes,
} from './interface'
    
/** 信息收集-申报人信息-列表 */
export function GetBizPersonalTaxReporterInfoList(params: GetBizPersonalTaxReporterInfoListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxReporterInfoListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/reporter-info/list`, params, _config) as Promise<GetBizPersonalTaxReporterInfoListRes>
}

/** 基础信息-申报人信息-文件列表 */
export function GetBizPersonalTaxReporterInfoFileList(params: GetBizPersonalTaxReporterInfoFileListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxReporterInfoFileListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/reporter-info/file/list`, params, _config) as Promise<GetBizPersonalTaxReporterInfoFileListRes>
}

/** 信息收集-申报人信息-证件上传 */
export function PostBizPersonalTaxReporterInfoCertificates(params: PostBizPersonalTaxReporterInfoCertificatesReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxReporterInfoCertificatesRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/reporter-info/certificates`, params, _config) as Promise<PostBizPersonalTaxReporterInfoCertificatesRes>
}

/** 基础信息-申报人信息-个人信息 */
export function PostBizPersonalTaxReporterInfoInfo(params: PostBizPersonalTaxReporterInfoInfoReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxReporterInfoInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/reporter-info/info`, params, _config) as Promise<PostBizPersonalTaxReporterInfoInfoRes>
}

/** 基础信息-申报人信息-文件上传 */
export function PostBizPersonalTaxReporterInfoFile(params: PostBizPersonalTaxReporterInfoFileReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxReporterInfoFileRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/reporter-info/file`, params, _config) as Promise<PostBizPersonalTaxReporterInfoFileRes>
}

/** 基础信息-申报人信息-个人信息详情 */
export function GetBizPersonalTaxReporterInfoDetail(params: GetBizPersonalTaxReporterInfoDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizPersonalTaxReporterInfoDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/personal-tax/reporter-info/detail`, params, _config) as Promise<GetBizPersonalTaxReporterInfoDetailRes>
}

/** 基础信息-申报人信息-文件节点提交 */
export function PostBizPersonalTaxReporterInfoFileSubmit(params: PostBizPersonalTaxReporterInfoFileSubmitReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxReporterInfoFileSubmitRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/reporter-info/file/submit`, params, _config) as Promise<PostBizPersonalTaxReporterInfoFileSubmitRes>
}

/** 信息收集-申报人信息-列表提交 */
export function PostBizPersonalTaxReporterInfoListSubmit(params: PostBizPersonalTaxReporterInfoListSubmitReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxReporterInfoListSubmitRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/reporter-info/list/submit`, params, _config) as Promise<PostBizPersonalTaxReporterInfoListSubmitRes>
}

/** 信息收集-申报人信息-移除 */
export function PostBizPersonalTaxReporterInfoInfoRemove(params: PostBizPersonalTaxReporterInfoInfoRemoveReq, config?: ParticalUniAppRequestOptions): Promise<PostBizPersonalTaxReporterInfoInfoRemoveRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/personal-tax/reporter-info/info/remove`, params, _config) as Promise<PostBizPersonalTaxReporterInfoInfoRemoveRes>
}
