<script setup lang="ts">
  import { onLaunch, onShow, onHide, onTabItemTap, onNavigationBarButtonTap, onShareAppMessage, onError } from '@dcloudio/uni-app'
  import { storeToRefs } from 'pinia'
  import { watchRouter} from '@/utilsH5/router'

  watchRouter()
  onLaunch(()=>{
    uni.addInterceptor('navigateTo', {
      //监听跳转
      invoke(e) {
        console.log('navigateTo', e)
        watchRouter()

      },
    })
    uni.addInterceptor('redirectTo', {
      //监听关闭本页面跳转
      invoke(e) {
        console.log('redirectTo', e)
        watchRouter()

      },
    })
    uni.addInterceptor('switchTab', {
      //监听tabBar跳转
      invoke(e) {
        console.log('switchTab', e)
        watchRouter()

      },
    })
    uni.addInterceptor('navigateBack', {
      //监听返回
      invoke(e) {
        console.log('navigateBack', e)
        watchRouter()

      },
    })
  })

  // #ifdef WEB
  import loadFile from '@/utils/loadFile'
  import appDsBridge from './utilsH5/appDsBridge'

  appDsBridge.loadDsBridgeFile()
  
  
  // onLaunch(() => {
  //   console.log('App Launch')
  //   // onLaunch 在web中不管用？？？
  //   uni.addInterceptor('navigateTo', {
  //     //监听跳转
  //     success(e) {
  //       console.log('navigateTo', e)
  //       watchRouter()
  //       watchSensorsRouter('navigateTo')
  //     },
  //   })
  //   uni.addInterceptor('redirectTo', {
  //     //监听关闭本页面跳转
  //     success(e) {
  //       console.log('redirectTo', e)
  //       watchRouter()
  //       watchSensorsRouter('redirectTo')
  //     },
  //   })
  //   uni.addInterceptor('switchTab', {
  //     //监听tabBar跳转
  //     success(e) {
  //       console.log('switchTab', e)
  //       watchRouter()
  //     },
  //   })
  //   uni.addInterceptor('navigateBack', {
  //     //监听返回
  //     success(e) {
  //       console.log('navigateBack', e)
  //       watchRouter()
  //       watchSensorsRouter('navigateBack')
  //     },
  //   })
  // })
  // #endif

  // #ifdef MP-WEIXIN
  // import { wxCode2Session } from '@/utils/wxLogin'


  // wxCode2Session()
  // #endif

  onTabItemTap(e => {
    console.log('APP onTabItemTap ', e)
  })
  // onNavigationBarButtonTap((e)=>{
  //   console.log('onNavigationBarButtonTap ', e)
  // })
  onShow((options: any) => {
    console.log('🚀 ~ onShow ~ options:', options)
    console.log('App Show')

    // 接收公证签小程序返回的数据
    // #ifdef MP-WEIXIN
    if (typeof options.referrerInfo.extraData != 'undefined') {
      if (
        options.referrerInfo.extraData.callbackObj != undefined &&
        options.referrerInfo.extraData.callbackObj.from != 'undefined' &&
        options.referrerInfo.extraData.callbackObj.from == 'esign'
      ) {
        // 跳转到指定小程序某个页面
        uni.redirectTo({
          url: options.referrerInfo.extraData.callbackObj.path,
        })
      }
    }
    // #endif
    // watchRouter()
  })
  onHide(() => {
    console.log('App Hide')
  })
  onShareAppMessage(() => {
    return {}
  })
  onError((err)=>{
    console.log("🚀 ~ onError ~ err:", err)

  })
</script>
<style lang="scss">
  // @use "@/components/form/style.scss" as form;

  // 设置页面高度为100%
  page {
    height: 100%;
    background-color: $ga-gray-1;
    font-family: "PingFang SC";
  }
  // /* #ifdef WEB */
  // uni-page-head {
  //   display: none;
  // }
  // /* #endif */
</style>
