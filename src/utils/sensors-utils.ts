import { nextTick } from "vue"
import { customizeTrack } from "./sensors"


export const watchSensorsRouter = (url:string, mode: string) => {
  console.log("🚀 ~ watchSensorsRouter ~ url:", url)
  console.log('🚀 ~ watchSensorsRouter ~ mode:', mode)
  const curPages = getCurrentPages()
  console.log('🚀 ~ watchSensorsRouter ~ curPages:', curPages)
}

export class MySensors {
  lastUrl: string
  startTime: number
  constructor(){
    
  }
  watchRouter (url:string, mode: string){
    console.log("🚀 ~ watchSensorsRouter ~ url:", url)
    console.log('🚀 ~ watchSensorsRouter ~ mode:', mode)
    const curPages = getCurrentPages()
    console.log('🚀 ~ watchSensorsRouter ~ curPages:', curPages)
    const now = new Date().getTime()
    let _url = url
    if(mode==='navigateBack'){
      _url = curPages[curPages.length-2]?.$page?.fullPath
      console.log("🚀 ~ MySensors ~ watchRouter ~ _url:", _url)
    }
    if(this.lastUrl && _url!==this.lastUrl){
      const duration = (now - this.startTime)/1000
      customizeTrack('My_Pages_Leave','自定义页面停留时长', {$event_duration: duration, my_url: this.lastUrl})

    }
    this.lastUrl = _url
    this.startTime = now
    

    // nextTick(function(){
    //   const curPages = getCurrentPages()
    //   console.log('🚀 ~ watchSensorsRouter ~ nextTick curPages:', curPages)
    // })

  }
}

export const mySensors = new MySensors()