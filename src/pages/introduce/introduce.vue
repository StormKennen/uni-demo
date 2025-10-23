<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import appDsBridge from '@/utilsH5/appDsBridge'
  import NavBarBase from '@/components/nav-bar-base.vue'
  import NavBar from '@/components/nav-bar.vue';
  import { isYinheAppEnv } from '@/utilsH5/env'
  import type { GetBizChatGetInitInfoRes } from '@/services/apifox/3903128/shangWuXiaoChengXu/huiHua/interface'
  import { GetSuperAppAiAgentEntrance } from '@/services/apifox/3903128/AIRongQi/aPPJieKou/apifox'
  import type { GetSuperAppAiAgentEntranceResEntranceConfigItem } from '@/services/apifox/3903128/AIRongQi/aPPJieKou/interface'
  import { getToken, setIsGoChatCoze, setStorageSync } from '@/utils/storage'
  import { checkLoginBeforeNavigator } from '@/utils/wxLogin'
  interface Introduce {
    title: string
    img: string[]
    color: string
  }

  interface ImgMap {
    [key: string]: Introduce
  }

  interface Option {
   label: string
   value: string
  }

  const imgMap = reactive<ImgMap>({
    '1': {
      color: '#F0F7FF',
      title: '了解注册公司',
      img: ['https://cdn-public.galaxy-immi.com/business/secondpage/了解注册公司-2.png'],
    },
    '2': {
      color: '#EEFDFE',
      title: '香港税收优势',
      img: [
        'https://cdn-public.galaxy-immi.com/business/secondpage/香港税务优势-2.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/香港税务优势-3.png',
      ],
    },
    '3': {
      color:'#F8F9FB',
      title: 'kai专业团队',
      img: ['https://cdn-public.galaxy-immi.com/business/Banner/zye1.png', 'https://cdn-public.galaxy-immi.com/business/Banner/zye2.png'],
    },
    '4': {
      title: 'kai优势',
      color:'#fff',
      img: [
        'https://cdn-public.galaxy-immi.com/business/secondpage/yh1.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/yh2.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/yh3.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/yh4.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/yh5.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/yh6.png',
      ],
    },
    '5': {
      color:'#E9F6FF',
      title: 'kai服务流程',
      img: [
        'https://cdn-public.galaxy-immi.com/business/secondpage/kai服务-2.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/kai服务-3.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/kai服务-6.png',
      ],
    },
    '6': {
      title: '客户案例',
      color:'#fff',
      img: [
        'https://cdn-public.galaxy-immi.com/business/secondpage/客户案例-教育.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/客户案例-贸易.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/客户案例-咨询.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/客户案例-强基金.png',
        'https://cdn-public.galaxy-immi.com/business/secondpage/客户案例-开户.png',
      ],
    },
  })

  const type = ref<string>('1')
  const setTitle = (title: string) => {
    uni.setNavigationBarTitle({
      title: title,
    })
  }

  const activeTabValue = ref<string>('0')
  const tabs = ref<Option[]>([
    { label: '教育类', value: '0' },
    { label: '贸易类', value: '1' },
    { label: '咨询类', value: '2' },
    { label: '强基金', value: '3' },
    { label: '开户', value: '4' },
  ])

  const goBack = () => {
    if(isYinheAppEnv()) {
      appDsBridge.backToAppPreView()
    }else {
      uni.navigateBack()
    }
  }

  const switchTab = (value: string) => {
    activeTabValue.value = value
  }
  const currentTitle = ref<string>('')
  const currentBgColor = ref<string>('')
  const chatInfo = ref<GetSuperAppAiAgentEntranceResEntranceConfigItem>()

  const getChatInfo = async () => {
    try {
      const res = await GetSuperAppAiAgentEntrance()
      const config = res.entranceConfig
      chatInfo.value = config.find(item => item.businessType === 'businessBot')
      console.log('🚀 ~ getChatInfo ~ chatInfo:', chatInfo.value)
    } catch (error) {
      console.warn('🚀 ~ getChatInfo ~ error:', error)
    }
  }

  const onChat = async () => {
    console.log('findme.....')
    // #ifdef WEB
    if (!chatInfo.value) {
      await getChatInfo()
    }
    const { id, title, redirectPath } = chatInfo.value
    appDsBridge.goAgentChatPage({
      id: `${id}`,
      title,
      businessType: 'businessBot',
      botId: redirectPath,
    })
    // #endif
    // #ifdef MP-WEIXIN
    setIsGoChatCoze(true)
    checkLoginBeforeNavigator('/pages/chat/chat-coze')
    // #endif
  }


  onLoad((option: AnyObject) => {
    if (!option?.title || !option?.type) return
    type.value = option.type
    currentTitle.value = imgMap[option.type].title
    currentBgColor.value = imgMap[option.type].color
  })

  onShow(() => {
   
    console.log('onShow:hideNavigationBarSyn')
    if(isYinheAppEnv()) {
      appDsBridge.hideNavigationBarSyn('1')
      //appDsBridge.supportFullScreenSyn('1')
    }
  })
</script>

<template>
  <view>
    <NavBarBase
      v-if="type !== '4'"
      :bg-color="currentBgColor" 
      :custom-style="{position: 'sticky'}" 
      :title="currentTitle" 
      :custom-go-back="true"
      @back="goBack"/>

    <NavBar 
		v-if="type === '4'"
		title="kai优势"
		customGoBack
		@back="goBack" />

    <view v-if="type !== '6'" class="images-container">
      <image
        v-for="(item, index) in imgMap[type].img"
        :key="index"
        :src="item"
        class="full-width-image"
        mode="widthFix" />
    </view>

    <view v-if="type === '6'">
      <view class="tabs-container">
        <view v-for="(tab, index) in tabs" :key="index" class="tab-item" @click="() => switchTab(tab.value)">
          <text :class="['tab-text', tab.value === activeTabValue ? 'active' : '']">
            {{ tab.label }}
          </text>
          <text :class="['tab-text-underline', tab.value === activeTabValue ? 'active' : '']"></text>
        </view>
      </view>

      <view>
        <image :src="imgMap[6].img[activeTabValue]" style="width: 100%; padding: 0; margin: 0" mode="widthFix" />
      </view>
    </view>

    <view class="more-info-container" v-if="type === '3'">
      <button type="default" class="more-info-btn" @click="onChat">了解更多资讯</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
  .images-container {
    font-size: 0;  // 消除行内元素间距
    line-height: 0;  // 消除行高造成的间距
  }

  .full-width-image {
    width: 100%; 
    padding: 0; 
    margin: 0;
    vertical-align: top;  // 防止基线对齐产生的间距
    display: block;  // 将图片设置为块级元素
  }

  .tabs-container {
    flex-direction: row;
    display: flex;
    padding: 20rpx 40rpx 0 40rpx;
    background-color: #fff;

    .tab-item {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      margin-right: 28rpx;
      
      &:last-child {
        margin-right: 0;
      }
    }

    .tab-text {
      font-size: 28rpx;
      color: #8993a2;
      font-weight: 400;

      &.active {
        color: #121a26;
      }
    }

    .tab-text-underline {
      width: 32rpx;
      height: 4rpx;
      margin: 16rpx 0 8rpx 0;

      &.active {
        background-color: #0046b4;
      }
    }
  }

  .more-info-container {
    padding: 16rpx 32rpx 68rpx 32rpx;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    .more-info-btn {
      width: 100%;
      background-color: #0046b4;
      color: #fff;
      border-radius: 6rpx;
      height: 96rpx;
      line-height: 96rpx;
      text-align: center;
      font-size: 36rpx;
      font-weight: 500;
      font-family: PingFang SC;
    }
  }
</style>
