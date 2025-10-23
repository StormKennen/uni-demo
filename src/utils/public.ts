

import { customizeTrack } from './sensors'

export const handleSensorsClick =async (e:Event)=>{
  console.log("🚀 ~ handleSensors ~ e:", e)
  const sensorsEventName = e.currentTarget?.dataset?.sensorsEventName
  if(sensorsEventName) {
    const sensorsChinaEventName = e.currentTarget?.dataset?.sensorsChinaEventName
    console.log('神策上报：', sensorsEventName, sensorsChinaEventName)
    customizeTrack(sensorsEventName, sensorsChinaEventName)
  }
}

