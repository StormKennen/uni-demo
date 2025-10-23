import { createSSRApp } from "vue";
import App from "./App.vue";
import * as Pinia from 'pinia';
import './static/font/dinfont.css'
import '@/static/style/global.scss';
import '@/components/form/style.scss';
import '@/static/style/iconfont.scss'
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


import { sensorsCreated, sensorsClickTrack } from "@/utils/sensors";
// #ifdef WEB
// import { sensorsCreated } from "@/utilsH5/sensors";
// #endif
// // #ifdef MP-WEIXIN
// // #endif

export function createApp() {
  const app = createSSRApp(App);
  const pinia = Pinia.createPinia()
  // pinia.use(piniaPluginPersistedstate)

  app.use(pinia);
  
  sensorsCreated()
  sensorsClickTrack()
  // #ifdef MP-WEIXIN
  // #endif
  
  // #ifdef WEB
  sensorsCreated()
  if (import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.VITE_APP_ENV === 'test') {
    import('vconsole').then(({ default: VConsole }) => {
      // eslint-disable-next-line no-new
      new VConsole()
    })
  }
  // #endif
  return {
    app,
    Pinia
  };
}
