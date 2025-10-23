/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable vue/no-irregular-whitespace */
/* eslint-disable sort-imports */
import http from '../../../../http'
import type { ParticalUniAppRequestOptions }   from '../../../../interface'
const baseURL = undefined
import type {
    GetBizAuditTaxGetCurrentNumQuery,
    GetBizAuditTaxGetCurrentNumRes,
    GetBizAuditTaxGetMainProcessQuery,
    GetBizAuditTaxGetMainProcessRes,
    GetBizAuditTaxGetBaseInfoQuery,
    GetBizAuditTaxGetBaseInfoRes,
    PostBizAuditTaxSaveReportExpressAddressReq,
    PostBizAuditTaxSaveReportExpressAddressRes,
    GetBizAuditTaxGetCertificatesListQuery,
    GetBizAuditTaxGetCertificatesListRes,
    GetBizAuditTaxGetCertificatesDetailQuery,
    GetBizAuditTaxGetCertificatesDetailRes,
    PostBizAuditTaxDelCertificatesFileRes,
    PostBizAuditTaxSaveBaseInfoReq,
    PostBizAuditTaxSaveBaseInfoRes,
    PostBizAuditTaxUpdateCertificatesFileNameReq,
    PostBizAuditTaxUpdateCertificatesFileNameRes,
    GetBizAuditTaxWaitResultTaskProcessQuery,
    GetBizAuditTaxWaitResultTaskProcessRes,
    PostBizAuditTaxSaveCustomerAddressReq,
    PostBizAuditTaxSaveCustomerAddressRes,
    GetBizAuditTaxGetExtendFileListQuery,
    GetBizAuditTaxGetExtendFileListRes,
    PostBizAuditTaxSaveExtendFileReq,
    PostBizAuditTaxSaveExtendFileRes,
    GetBizAuditTaxGetResultQuery,
    GetBizAuditTaxGetResultRes,
    PostBizAuditTaxDownloadReportFileReq,
    PostBizAuditTaxDownloadReportFileRes,
    GetBizAuditTaxGetAddressDetailQuery,
    GetBizAuditTaxGetAddressDetailRes,
    PostBizAuditTaxSaveCertificatesReq,
    PostBizAuditTaxSaveCertificatesRes,
    PostBizAuditTaxRollbackProcessTaskReq,
    PostBizAuditTaxRollbackProcessTaskRes,
    GetBizAuditTaxGetExtendFileDetailQuery,
    GetBizAuditTaxGetExtendFileDetailRes,
    PostBizAuditTaxDelExtendFileReq,
    PostBizAuditTaxDelExtendFileRes,
    PostBizAuditTaxSubmitExtendFileReq,
    PostBizAuditTaxSubmitExtendFileRes,
    PostBizAuditTaxCustomerConfirmInfoReq,
    PostBizAuditTaxCustomerConfirmInfoRes,
    GetBizAuditTaxCanNextHandleQuery,
    GetBizAuditTaxCanNextHandleRes,
} from './interface'
    
/** 公司审计--获取当前审计期数 */
export function GetBizAuditTaxGetCurrentNum(params: GetBizAuditTaxGetCurrentNumQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetCurrentNumRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-current-num`, params, _config) as Promise<GetBizAuditTaxGetCurrentNumRes>
}

/** 公司审计--获取公司审计进度 */
export function GetBizAuditTaxGetMainProcess(params: GetBizAuditTaxGetMainProcessQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetMainProcessRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-main-process`, params, _config) as Promise<GetBizAuditTaxGetMainProcessRes>
}

/** 公司审计--获取基本信息 */
export function GetBizAuditTaxGetBaseInfo(params: GetBizAuditTaxGetBaseInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetBaseInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-base-info`, params, _config) as Promise<GetBizAuditTaxGetBaseInfoRes>
}

/** 公司审计--审核结果--保存客户收件地址 */
export function PostBizAuditTaxSaveReportExpressAddress(params: PostBizAuditTaxSaveReportExpressAddressReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxSaveReportExpressAddressRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/save-report-express-address`, params, _config) as Promise<PostBizAuditTaxSaveReportExpressAddressRes>
}

/** 公司审计--证书列表 */
export function GetBizAuditTaxGetCertificatesList(params: GetBizAuditTaxGetCertificatesListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetCertificatesListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-certificates-list`, params, _config) as Promise<GetBizAuditTaxGetCertificatesListRes>
}

/** 公司审计--证书详情 */
export function GetBizAuditTaxGetCertificatesDetail(params: GetBizAuditTaxGetCertificatesDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetCertificatesDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-certificates-detail`, params, _config) as Promise<GetBizAuditTaxGetCertificatesDetailRes>
}

/** 公司审计--删除证件中的资料文件 */
export function PostBizAuditTaxDelCertificatesFile(_, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxDelCertificatesFileRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post('/biz/audit-tax/del-certificates-file', {}, _config) as Promise<PostBizAuditTaxDelCertificatesFileRes>
}

/** 公司审计--保存基本信息 */
export function PostBizAuditTaxSaveBaseInfo(params: PostBizAuditTaxSaveBaseInfoReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxSaveBaseInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/save-base-info`, params, _config) as Promise<PostBizAuditTaxSaveBaseInfoRes>
}

/** 公司审计--更新证件中的资料文件名称 */
export function PostBizAuditTaxUpdateCertificatesFileName(params: PostBizAuditTaxUpdateCertificatesFileNameReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxUpdateCertificatesFileNameRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/update-certificates-file-name`, params, _config) as Promise<PostBizAuditTaxUpdateCertificatesFileNameRes>
}

/** 公司审计--等待结果服务流程 */
export function GetBizAuditTaxWaitResultTaskProcess(params: GetBizAuditTaxWaitResultTaskProcessQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxWaitResultTaskProcessRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/wait-result-task-process`, params, _config) as Promise<GetBizAuditTaxWaitResultTaskProcessRes>
}

/** 公司审计--等待结果-保存|更新客户收件地址 */
export function PostBizAuditTaxSaveCustomerAddress(params: PostBizAuditTaxSaveCustomerAddressReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxSaveCustomerAddressRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/save-customer-address`, params, _config) as Promise<PostBizAuditTaxSaveCustomerAddressRes>
}

/** 公司审计--补充资料列表 */
export function GetBizAuditTaxGetExtendFileList(params: GetBizAuditTaxGetExtendFileListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetExtendFileListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-extend-file-list`, params, _config) as Promise<GetBizAuditTaxGetExtendFileListRes>
}

/** 公司审计--上传保存补充资料 */
export function PostBizAuditTaxSaveExtendFile(params: PostBizAuditTaxSaveExtendFileReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxSaveExtendFileRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/save-extend-file`, params, _config) as Promise<PostBizAuditTaxSaveExtendFileRes>
}

/** 公司审计--审核结果页面 */
export function GetBizAuditTaxGetResult(params: GetBizAuditTaxGetResultQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetResultRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-result`, params, _config) as Promise<GetBizAuditTaxGetResultRes>
}

/** 公司审计--下载报告发送邮箱 */
export function PostBizAuditTaxDownloadReportFile(params: PostBizAuditTaxDownloadReportFileReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxDownloadReportFileRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/download-report-file`, params, _config) as Promise<PostBizAuditTaxDownloadReportFileRes>
}

/** 公司审计--获取地址详情 */
export function GetBizAuditTaxGetAddressDetail(params: GetBizAuditTaxGetAddressDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetAddressDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-address-detail`, params, _config) as Promise<GetBizAuditTaxGetAddressDetailRes>
}

/** 公司审计-保存公司审计证书上传 */
export function PostBizAuditTaxSaveCertificates(params: PostBizAuditTaxSaveCertificatesReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxSaveCertificatesRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/save-certificates`, params, _config) as Promise<PostBizAuditTaxSaveCertificatesRes>
}

/** 公司审计-在小流程中信息确认中补充资料时要回滚到补充资料流程 */
export function PostBizAuditTaxRollbackProcessTask(params: PostBizAuditTaxRollbackProcessTaskReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxRollbackProcessTaskRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/rollback-process-task`, params, _config) as Promise<PostBizAuditTaxRollbackProcessTaskRes>
}

/** 公司审计--获取补充资料详情 */
export function GetBizAuditTaxGetExtendFileDetail(params: GetBizAuditTaxGetExtendFileDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxGetExtendFileDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/get-extend-file-detail`, params, _config) as Promise<GetBizAuditTaxGetExtendFileDetailRes>
}

/** 公司审计--删除补偿文件 */
export function PostBizAuditTaxDelExtendFile(params: PostBizAuditTaxDelExtendFileReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxDelExtendFileRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/del-extend-file`, params, _config) as Promise<PostBizAuditTaxDelExtendFileRes>
}

/** 公司审计--提交补充资料 */
export function PostBizAuditTaxSubmitExtendFile(params: PostBizAuditTaxSubmitExtendFileReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxSubmitExtendFileRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/submit-extend-file`, params, _config) as Promise<PostBizAuditTaxSubmitExtendFileRes>
}

/** 公司审计-客户确认信息 */
export function PostBizAuditTaxCustomerConfirmInfo(params: PostBizAuditTaxCustomerConfirmInfoReq, config?: ParticalUniAppRequestOptions): Promise<PostBizAuditTaxCustomerConfirmInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/audit-tax/customer-confirm-info`, params, _config) as Promise<PostBizAuditTaxCustomerConfirmInfoRes>
}

/** 公司审计--基础信息页是否可以下一步处理 */
export function GetBizAuditTaxCanNextHandle(params: GetBizAuditTaxCanNextHandleQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizAuditTaxCanNextHandleRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/audit-tax/can-next-handle`, params, _config) as Promise<GetBizAuditTaxCanNextHandleRes>
}
