import type { ScenicAdminNode } from '../scenic/models'

/**
 * 景区筛选首屏只需要先展示省级入口；城市和区县由行政树接口异步补全。
 * 省级编码使用后端景区接口约定的国家行政区划代码，避免首屏等待接口返回后才能打开省份 picker。
 */
export const PRESET_SCENIC_PROVINCES: ScenicAdminNode[] = [
  { value: '11', text: '北京市', level: 'province' },
  { value: '12', text: '天津市', level: 'province' },
  { value: '13', text: '河北省', level: 'province' },
  { value: '14', text: '山西省', level: 'province' },
  { value: '15', text: '内蒙古自治区', level: 'province' },
  { value: '21', text: '辽宁省', level: 'province' },
  { value: '22', text: '吉林省', level: 'province' },
  { value: '23', text: '黑龙江省', level: 'province' },
  { value: '31', text: '上海市', level: 'province' },
  { value: '32', text: '江苏省', level: 'province' },
  { value: '33', text: '浙江省', level: 'province' },
  { value: '34', text: '安徽省', level: 'province' },
  { value: '35', text: '福建省', level: 'province' },
  { value: '36', text: '江西省', level: 'province' },
  { value: '37', text: '山东省', level: 'province' },
  { value: '41', text: '河南省', level: 'province' },
  { value: '42', text: '湖北省', level: 'province' },
  { value: '43', text: '湖南省', level: 'province' },
  { value: '44', text: '广东省', level: 'province' },
  { value: '45', text: '广西壮族自治区', level: 'province' },
  { value: '46', text: '海南省', level: 'province' },
  { value: '50', text: '重庆市', level: 'province' },
  { value: '51', text: '四川省', level: 'province' },
  { value: '52', text: '贵州省', level: 'province' },
  { value: '53', text: '云南省', level: 'province' },
  { value: '54', text: '西藏自治区', level: 'province' },
  { value: '61', text: '陕西省', level: 'province' },
  { value: '62', text: '甘肃省', level: 'province' },
  { value: '63', text: '青海省', level: 'province' },
  { value: '64', text: '宁夏回族自治区', level: 'province' },
  { value: '65', text: '新疆维吾尔自治区', level: 'province' },
  { value: '71', text: '台湾省', level: 'province' },
  { value: '81', text: '香港特别行政区', level: 'province' },
  { value: '82', text: '澳门特别行政区', level: 'province' },
]

export const clonePresetScenicProvinces = (): ScenicAdminNode[] => PRESET_SCENIC_PROVINCES.map(item => ({ ...item }))
