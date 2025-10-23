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
    GetBizMpfCertificateListQuery,
    GetBizMpfCertificateListRes,
    GetBizMpfFundListRes,
    GetBizMpfBankListQuery,
    GetBizMpfBankListRes,
    GetBizMpfFundHomeQuery,
    GetBizMpfFundHomeRes,
    GetBizMpfDeliveryOrderQuery,
    GetBizMpfDeliveryOrderRes,
    GetBizMpfFirstEnteredInfoQuery,
    GetBizMpfFirstEnteredInfoRes,
    GetBizMpfFirstEnteredUpdateQuery,
    GetBizMpfFirstEnteredUpdateRes,
    GetBizMpfProgressInfoQuery,
    GetBizMpfProgressInfoRes,
    GetBizMpfTemplateInfoQuery,
    GetBizMpfTemplateInfoRes,
    GetBizMpfEmployerInfoQuery,
    GetBizMpfEmployerInfoRes,
    PostBizMpfEmployerAddReq,
    PostBizMpfEmployerAddRes,
    PostBizMpfEmployAddReq,
    PostBizMpfEmployAddRes,
    PostBizMpfEmploySalaryAddReq,
    PostBizMpfEmploySalaryAddRes,
    GetBizMpfEmployInfoQuery,
    GetBizMpfEmployInfoRes,
    PostBizMpfCertificateUploadReq,
    PostBizMpfCertificateUploadRes,
    GetBizMpfCertificateInfoQuery,
    GetBizMpfCertificateInfoRes,
    GetBizMpfWaitResultTaskQuery,
    GetBizMpfWaitResultTaskRes,
    GetBizMpfMpfAccountInfoQuery,
    GetBizMpfMpfAccountInfoRes,
    GetBizMpfContributionRecordQuery,
    GetBizMpfContributionRecordRes,
    PostBizMpfContributionDownloadEmailReq,
    PostBizMpfContributionDownloadEmailRes,
    PostBizMpfContributionCanDownloadEmailReq,
    PostBizMpfContributionCanDownloadEmailRes,
    PostBizMpfExpressAddressSaveReq,
    PostBizMpfExpressAddressSaveRes,
    GetBizMpfContributionRecordDetailQuery,
    GetBizMpfContributionRecordDetailRes,
} from './interface'
    
/** 资料列表 */
export function GetBizMpfCertificateList(params: GetBizMpfCertificateListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfCertificateListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/certificate/list`, params, _config) as Promise<GetBizMpfCertificateListRes>
}

/** 基金列表 */
export function GetBizMpfFundList(config?: ParticalUniAppRequestOptions): Promise<GetBizMpfFundListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get('/biz/mpf/fund/list', _config) as Promise<GetBizMpfFundListRes>
}

/** 银行列表 */
export function GetBizMpfBankList(params: GetBizMpfBankListQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfBankListRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/bank/list`, params, _config) as Promise<GetBizMpfBankListRes>
}

/** 强积金首页 */
export function GetBizMpfFundHome(params: GetBizMpfFundHomeQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfFundHomeRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/fund/home`, params, _config) as Promise<GetBizMpfFundHomeRes>
}

/** 交付单列表 */
export function GetBizMpfDeliveryOrder(params: GetBizMpfDeliveryOrderQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfDeliveryOrderRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/delivery/order`, params, _config) as Promise<GetBizMpfDeliveryOrderRes>
}

/** 是否首次进入 */
export function GetBizMpfFirstEnteredInfo(params: GetBizMpfFirstEnteredInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfFirstEnteredInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/first-entered/info`, params, _config) as Promise<GetBizMpfFirstEnteredInfoRes>
}

/** 更新首次进入 */
export function GetBizMpfFirstEnteredUpdate(params: GetBizMpfFirstEnteredUpdateQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfFirstEnteredUpdateRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/first-entered/update`, params, _config) as Promise<GetBizMpfFirstEnteredUpdateRes>
}

/** 获取进度信息 */
export function GetBizMpfProgressInfo(params: GetBizMpfProgressInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfProgressInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/progress/info`, params, _config) as Promise<GetBizMpfProgressInfoRes>
}

/** 根据模板id获取模板信息 */
export function GetBizMpfTemplateInfo(params: GetBizMpfTemplateInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfTemplateInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/template/info`, params, _config) as Promise<GetBizMpfTemplateInfoRes>
}

/** 根据订单id获取雇主信息 */
export function GetBizMpfEmployerInfo(params: GetBizMpfEmployerInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfEmployerInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/employer/info`, params, _config) as Promise<GetBizMpfEmployerInfoRes>
}

/** 保存雇主信息 */
export function PostBizMpfEmployerAdd(params: PostBizMpfEmployerAddReq, config?: ParticalUniAppRequestOptions): Promise<PostBizMpfEmployerAddRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/mpf/employer/add`, params, _config) as Promise<PostBizMpfEmployerAddRes>
}

/** 保存雇员信息  */
export function PostBizMpfEmployAdd(params: PostBizMpfEmployAddReq, config?: ParticalUniAppRequestOptions): Promise<PostBizMpfEmployAddRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/mpf/employ/add`, params, _config) as Promise<PostBizMpfEmployAddRes>
}

/** 保存雇员工资 */
export function PostBizMpfEmploySalaryAdd(params: PostBizMpfEmploySalaryAddReq, config?: ParticalUniAppRequestOptions): Promise<PostBizMpfEmploySalaryAddRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/mpf/employ/salary/add`, params, _config) as Promise<PostBizMpfEmploySalaryAddRes>
}

/** 根据id获取雇员信息 */
export function GetBizMpfEmployInfo(params: GetBizMpfEmployInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfEmployInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/employ/info`, params, _config) as Promise<GetBizMpfEmployInfoRes>
}

/** 资料上传 */
export function PostBizMpfCertificateUpload(params: PostBizMpfCertificateUploadReq, config?: ParticalUniAppRequestOptions): Promise<PostBizMpfCertificateUploadRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/mpf/certificate/upload`, params, _config) as Promise<PostBizMpfCertificateUploadRes>
}

/** 资料详情 */
export function GetBizMpfCertificateInfo(params: GetBizMpfCertificateInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfCertificateInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/certificate/info`, params, _config) as Promise<GetBizMpfCertificateInfoRes>
}

/** 强积金-等待结果 */
export function GetBizMpfWaitResultTask(params: GetBizMpfWaitResultTaskQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfWaitResultTaskRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/wait-result/task`, params, _config) as Promise<GetBizMpfWaitResultTaskRes>
}

/** 强积金=账号开通页面 */
export function GetBizMpfMpfAccountInfo(params: GetBizMpfMpfAccountInfoQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfMpfAccountInfoRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/mpf-account/info`, params, _config) as Promise<GetBizMpfMpfAccountInfoRes>
}

/** 强积金-供款记录列表 */
export function GetBizMpfContributionRecord(params: GetBizMpfContributionRecordQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfContributionRecordRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/contribution/record`, params, _config) as Promise<GetBizMpfContributionRecordRes>
}

/** 下载发送到邮箱 */
export function PostBizMpfContributionDownloadEmail(params: PostBizMpfContributionDownloadEmailReq, config?: ParticalUniAppRequestOptions): Promise<PostBizMpfContributionDownloadEmailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/mpf/contribution/download-email`, params, _config) as Promise<PostBizMpfContributionDownloadEmailRes>
}

/** 是否能下载发送到邮箱-需要有已缴纳数据 */
export function PostBizMpfContributionCanDownloadEmail(params: PostBizMpfContributionCanDownloadEmailReq, config?: ParticalUniAppRequestOptions): Promise<PostBizMpfContributionCanDownloadEmailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/mpf/contribution/can-download-email`, params, _config) as Promise<PostBizMpfContributionCanDownloadEmailRes>
}

/** 保存客户填写的地址 */
export function PostBizMpfExpressAddressSave(params: PostBizMpfExpressAddressSaveReq, config?: ParticalUniAppRequestOptions): Promise<PostBizMpfExpressAddressSaveRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.post(`/biz/mpf/express/address/save`, params, _config) as Promise<PostBizMpfExpressAddressSaveRes>
}

/** 强积金-供款明细 */
export function GetBizMpfContributionRecordDetail(params: GetBizMpfContributionRecordDetailQuery, config?: ParticalUniAppRequestOptions): Promise<GetBizMpfContributionRecordDetailRes> {
  const _config = baseURL ? { baseURL, ...config } : config
  return http.get(`/biz/mpf/contribution/record-detail`, params, _config) as Promise<GetBizMpfContributionRecordDetailRes>
}
