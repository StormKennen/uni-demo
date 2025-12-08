import dayjs from 'dayjs'
import CryptoJS from 'crypto-js'

import utc from 'dayjs/plugin/utc'
import { post, getOssGetSignature } from '@/services/apifox/NODEJSDEMO/oSS/apifox';
dayjs.extend(utc)

export const getOssToken = async () => {
    try {
        return await getOssGetSignature();
    } catch (error) {
        console.log('error', error);
        return null;
    }
}

export const getOssFormData = async (name: string, ext: string) => {

  const kkRes = await getOssToken();

  let formData: any
  const { policy, signature, x_oss_signature_version, x_oss_credential, x_oss_date, security_token } = kkRes
  const dir = 'common/uni-app-files';
  const file_name = name || `${Date.now()}.${ext}`
  // #ifdef MP-WEIXIN
  formData = {
    policy,
    'x-oss-signature': signature,
    'x-oss-signature-version': x_oss_signature_version,
    'x-oss-credential': x_oss_credential,
    'x-oss-date': x_oss_date,
    key: dir + file_name,
    'x-oss-security-token': security_token,
  }
  // #endif
  // #ifndef MP-WEIXIN
  formData = new FormData()
  formData.append('policy', policy)
  formData.append('x-oss-signature', signature)
  formData.append('x-oss-signature-version', x_oss_signature_version)
  formData.append('x-oss-credential', x_oss_credential)
  formData.append('x-oss-date', x_oss_date)
  formData.append('key', dir + file_name)
  formData.append('x-oss-security-token', security_token)
  // #endif
  return formData
}
