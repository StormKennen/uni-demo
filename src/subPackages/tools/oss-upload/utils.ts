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

export const getOssFormData = async (name: string, ext: string, dirName: string) => {

  const kkRes = await getOssToken();

  let formData: any
  const { policy, signature, x_oss_signature_version, x_oss_credential, x_oss_date, security_token } = kkRes
  const dir = dirName || 'common/uni-app-files/';
  const file_name = name || `${Date.now()}.${ext}`
  // uni.uploadFile 的 formData 参数只接受普通对象，不支持 FormData 对象
  formData = {
    policy,
    'x-oss-signature': signature,
    'x-oss-signature-version': x_oss_signature_version,
    'x-oss-credential': x_oss_credential,
    'x-oss-date': x_oss_date,
    key: dir + file_name,
    'x-oss-security-token': security_token,
  }
  return formData
}
