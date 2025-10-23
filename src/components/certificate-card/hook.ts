import type { Props } from './index.vue'
import { type CardItem } from './base.vue'
import { ref } from 'vue'

type getCertificateConfig = () => {
  title: string
  tips?: string
  exampleTips?: string
  exampleImages: string[]
  cards: CardItem[]
}

const getCertificateConfigMap: Record<Props['type'], getCertificateConfig> = {
  cn() {
    return {
      title: '大陆身份证',
      exampleTips: '*须使用二代身份证',
      exampleImages: [`https://cdn-public.galaxy-immi.com/business/id-front.png`, `https://cdn-public.galaxy-immi.com/business/id-back.png`],
      cards: [
        {
          // 1: 正面 front 2：反面 backend 3：手持 handheld
          sign: 'front',
          title: '身份证人像面',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/id-front.svg',
          cdpUploadOptions: {
            fileType: 'ID_CARD',
          }
        },
        {
          sign: 'backend',
          title: '身份证国徽面',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/id-back.svg',
          cdpUploadOptions: {
            fileType: 'ID_CARD',
            service: 'backend'
          },
        },
        {
          sign: 'handheld',
          title: '手持证件照',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/certificate-card.svg',
          cdpUploadOptions: {
            fileType: 'IDCARD_FILES_HANDHELD',
          },
        },
      ],
    }
  },
  cn2() {
    return {
      title: '大陆身份证',
      exampleTips: '*须使用二代身份证',
      exampleImages: [`https://cdn-public.galaxy-immi.com/business/id-front.png`, `https://cdn-public.galaxy-immi.com/business/id-back.png`],
      cards: [
        {
          // 1: 正面 front 2：反面 backend 3：手持 handheld
          // sign: string
          sign: 'front',
          title: '身份证人像面',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/id-front.svg',
          cdpUploadOptions: {
            fileType: 'ID_CARD',
          }
        },
        {
          sign: 'backend',
          title: '身份证国徽面',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/id-back.svg',
          cdpUploadOptions: {
            fileType: 'ID_CARD',
            service: 'backend'
          }
        },
      ],
    }
  },
  hk() {
    return {
      title: '香港身份证',
      exampleTips: '',
      exampleImages: [
        `https://cdn-public.galaxy-immi.com/business/hk-front.jpg`,
        `https://cdn-public.galaxy-immi.com/business/hk-backend.jpg`,
      ],
      cards: [
        {
          sign: 'front',
          title: '身份证正面',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/passport_information.svg',
          cdpUploadOptions: {
            fileType: 'HK_ID_CARD',
          }
        },
        {
          sign: 'backend',
          title: '身份证背面',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/certificate-card.svg',
          cdpUploadOptions: {
            fileType: 'HK_ID_CARD',
            service: 'backend'
          }
        },
        {
          sign: 'handheld',
          title: '手持证件照',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/certificate-card.svg',
          cdpUploadOptions: {
            fileType: 'HK_IDCARD_FILES_HANDHELD',
          }
        },
      ],
    }
  },
  hk2() {
    return {
      title: '香港身份证',
      exampleTips: '',
      exampleImages: [
        `https://cdn-public.galaxy-immi.com/business/hk-front.jpg`,
        `https://cdn-public.galaxy-immi.com/business/hk-backend.jpg`,
      ],
      cards: [
        {
          sign: 'front',
          title: '身份证正面',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/hk-front-bg.svg',
          cdpUploadOptions: {
            fileType: 'HK_ID_CARD',
          }
        },
        {
          sign: 'backend',
          title: '身份证背面',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/certificate-card.svg',
          cdpUploadOptions: {
            fileType: 'HK_ID_CARD',
            service: 'backend'
          }
        },
      ],
    }
  },
  pass() {
    return {
      title: '护照',
      exampleTips: '',
      exampleImages: [`https://cdn-public.galaxy-immi.com/business/Passport-Example.jpg`],
      cards: [
        {
          sign: 'front',
          title: '护照信息页',
          fileUrl: '',
          bgUrl: 'https://cdn-public.galaxy-immi.com/business/common/passport_information2.svg',
          cdpUploadOptions: {
            fileType: 'PASS_PORT',
          }
        },
        {
          sign: 'handheld',
          title: '手持证件照',
          fileUrl: '',
          cdpUploadOptions: {
            fileType: 'PASS_PORT_FILES_HANDHELD',
          }
        },
      ],
    }
  },
}

export function useCertificateCard(type: Props['type']) {
  const title = ref('')
  const tips = ref('')

  const exampleTips = ref('')
  const exampleImages = ref<string[]>([])
  const cards = ref<CardItem[]>([])

  ;({
    title: title.value,
    tips: tips.value,
    cards: cards.value,
    exampleTips: exampleTips.value,
    exampleImages: exampleImages.value,
  } = getCertificateConfigMap[type]())

  // 如果没有tips，默认提示
  if (typeof tips.value === 'undefined') {
    tips.value = '注意不可遮挡证件信息，内容需清晰可见'
  }

  return {
    exampleImages,
    exampleTips,
    tips,
    title,
    cards,
  }
}
