<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import RightArrow from '@/static/image/right-arrow.svg'

const props = withDefaults(defineProps<{
    modelValue: string | string[],
    placeholder?: string,
    disabled?: boolean,
    isArray?: boolean,
    level?: number
}>(), {
    placeholder: '请选择',
    level: 3
})




const citysFilter = ref<any>([])

async function init() {
  const res = await uni.request({
    url: `${import.meta.env.VITE_APP_CDN_OSS_BUSINESS}/city.json`
  })
  citysFilter.value = res?.data || []
  if(props.level === 2){
    citysFilter.value.forEach(province => {
      if(province.children) {
          province.children = province.children.map(city => {
              return {
                  ...city,
                  children: []
              }
          })
      }
    })
  }
}

init()

const formData = reactive({
    city: ''
})
const emit = defineEmits(['update:modelValue', 'change'])
watchEffect(() => {
    formData.city = props.isArray ? (props.modelValue as string[]).join('-') : props.modelValue as string
})

const changeCity = (e: any) => {
    const result = props.isArray ? formData.city.split('-') : formData.city
    if (e.detail.value) {
        emit('update:modelValue', result)
    }
    emit('change', result)
}

const picker = ref()
const isShow = ref(false)
const showPicker = () => {
  if (props.disabled) return
  isShow.value = true
  picker.value.show()
}

const popupClosed = ()=>{
  isShow.value = false
}

const showLabel = computed(() => {
    return formData.city || props.placeholder
})
const isSelect = computed(() => {
  return showLabel.value !== props.placeholder
})
</script>

<template>
    <view class="ga-province">
      <view class="ga-province-box" @click="showPicker">
          <text class="ga-province-box-text" :class="{'is-disabled': disabled,'is-select': isSelect}">{{ showLabel }}</text>
          <view class="icon">
            <image class="icon-image" :src="RightArrow" mode="scaleToFill" />
          </view>
      </view>
      <uni-data-picker
          ref="picker"
          placeholder="请选择"
          popup-title="请选择居住城市" 
          :localdata="citysFilter"
          @change="changeCity"
          @popupclosed="popupClosed"
          v-model="formData.city">
      </uni-data-picker>
    </view>
</template>

<style scoped lang="scss">
.icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  .icon-image {
    width: 100%;
    height: 100%;
  }
}
.ga-province{
  line-height:normal;
  width:100%;
}
.ga-province-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding-left: 10px;
        box-sizing: border-box;
        .ga-province-box-text {
            flex: 1;
            color: #8993A2;
            line-height: 40rpx;
            font-size: 28rpx;
            font-weight: 500;
            &.is-select{
              color: #121A26;
            }
            &.is-disabled{
              color: #121a26;
            }
        }
}
uni-data-picker{
  width: 100%;
}
</style>
