
<template>
    <view class="wrap" :class="isH5 ? 'h5-wrap' : ''">
        <shareApp v-if="isH5" :goDefault="true"></shareApp>
        <NavBar 
            v-else
            :custom-style="{position: 'sticky'}" 
            :custom-go-back="true"
            title="香港内地个税计算器"  
            custom-class="light"
            @back="goBack"
            bgColor="#062577" />
        <view class="bg-wrap">
        </view>
        <view class="content">
            <view class="content-title">
                个税计算器速算版
            </view>
            <view class="sub-title">
               速算对比香港与内地个税
            </view>
            <view class="tax-form">
            <uni-forms ref="formRef" :modelValue="formData" :rules="rules">
                <view class="card">
                    <FormItem 
                    label="月度工资(元)" name="monthlySalary" 
                    :label-width="labelWidth2">
                        <view class="form-item-content">
                            <uni-easyinput 
                                :inputBorder="false" 
                                :maxlength="8" 
                                :clearable="false"  
                                type="number" 
                                @input="val=> { validateInput(val, 'monthlySalary')}"
                                v-model="formData.monthlySalary"
                                placeholder="请输入月度工资" />
                        </view>
                    </FormItem>
                    <FormItem 
                    label="年终奖(元)" name="bonus" :label-width="labelWidth2">
                        <view class="form-item-content">
                            <uni-easyinput 
                                :inputBorder="false"
                                :maxlength="8"
                                :clearable="false"  
                                type="number" 
                                @input="val=> { validateInput(val, 'bonus')}"
                                v-model="formData.bonus"
                                placeholder="请输入年终奖" />
                        </view>
                    </FormItem>
                    <FormItem 
                    label="年总收入(元)" name="totalSalary" :label-width="labelWidth2">
                        <view class="form-item-content">
                            <view class="total-wrap">
                                <text class="total-flag">￥</text>
                                <text class="total-number">{{  totalSalary }}</text> 
                            </view>
                        </view>
                    </FormItem>
                </view>
                <view class="card">
                    <FormItem 
                        label="是否已婚" 
                        name="maritalStatus" 
                        :label-width="labelWidth" >
                        <view class="form-item-content">
                            <CheckRadio 
                                :list="MARRIED_STATUS" 
                                v-model="formData.maritalStatus">
                            </CheckRadio>
                        </view>
                    </FormItem>
                    <FormItem 
                        label="住房情况" 
                        name="housingStatus" 
                        :label-width="labelWidth">
                        <view class="form-item-content">
                            <CheckRadio 
                                :list="HOUSE_SITUATION_STATUS" 
                                v-model="formData.housingStatus"
                                @change="handleChange('housingStatus')">
                            </CheckRadio>
                        </view>
                    </FormItem>
                    <FormItem 
                        v-if="[2, 3].includes(formData.housingStatus)" 
                        label="房屋位置" 
                        name="houseLocation" 
                        :label-width="labelWidth">
                        <view class="form-item-content">
                            <GaPicker 
                                @open="bottomIndex = -1"
                                @cancel="bottomIndex = 3"
                                :range="HOUSE_LOCATION_STATUS" 
                                popup-title="请选择房屋位置" 
                                v-model="formData.houseLocation" />
                        </view>
                    </FormItem>
                    <FormItem label="子女情况" name="childrenStatus" :label-width="labelWidth" >
                        <view class="form-item-content">
                            <CheckRadio 
                                :list="CHILDREN_STATUS" 
                                v-model="formData.childrenStatus"  
                                @change="handleChange('childrenStatus')">
                            </CheckRadio>
                        </view>
                    </FormItem>
                    <FormItem v-if="formData.childrenStatus === 1" label="未成年(或成年在读)子女数" name="childrenCount" label-width="360rpx">
                        <view class="form-item-content">
                            <uni-easyinput :inputBorder="false" :clearable="false"  type="number" v-model="formData.childrenCount"
                            placeholder="请输入"  @blur="handleBlur('childrenCount')" @input="val=> { validateInput(val, 'childrenCount')}"/>
                        </view>
                    </FormItem>
                    <FormItem label="赡养老人" name="careStatus" label-width="180rpx">
                        <template #label>
                            <view class="support-view">
                                赡养老人
                                <uni-tooltip content="" placement="right">
                                    <template #content>
                                        <view style="width: 340rpx;">备注：香港赡养老人需在港逗留超过180天</view>
                                    </template>
                                    <image :src="info" class="info"></image>
                                </uni-tooltip>
                            </view>
                        </template>
                        <view class="form-item-content">
                            <CheckRadio :list="SUPPORT_ELDERLY_STATUS" v-model="formData.careStatus"  @change="handleChange('careStatus')"></CheckRadio>
                        </view>
                    </FormItem>
                    <FormItem  v-if="formData.careStatus === 1" label="满60岁父母数" name="careCount" :label-width="labelWidth2">
                        <view class="form-item-content">
                            <uni-easyinput :inputBorder="false" :clearable="false"  type="number" v-model="formData.careCount"
                            placeholder="请输入" @blur="handleBlur('careCount')" @input="val=> { validateInput(val, 'careCount')}" />
                        </view>
                    </FormItem>
                    <FormItem label="继续教育" name="continueEducation" :label-width="labelWidth">
                        <view class="form-item-content">
                            <CheckRadio :list="CONTINUE_EDUCATION_STATUS" v-model="formData.continueEducation"></CheckRadio>
                        </view>
                    </FormItem>
                </view>
            </uni-forms>
        </view>
        </view>
        <view class="bottom-wrap" :style="{zIndex: bottomIndex}" v-if="!isH5">
            <view class="btn" @click="submit($event); handleSensorsClick($event)" data-sensors-event-name="Business_TaxCalculator_Calculate"
            data-sensors-china-event-name="商务_税务计算器_计算">
                立即计算
            </view>
        </view>
    </view>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormItem from '@/components/form/item.vue'
import CheckRadio from '@/components/check-radio/index.vue'
import shareApp from '@/components/share-app.vue'
import { formatNumberThousand } from '@/utils/common'
import { MARRIED_STATUS, HOUSE_SITUATION_STATUS, CHILDREN_STATUS, SUPPORT_ELDERLY_STATUS, HOUSE_LOCATION_STATUS, CONTINUE_EDUCATION_STATUS } from '../config'
import { PostBizTaxCalculate } from '@/services/apifox/3903128/shangWuXiaoChengXu/geShuiJiSuanQi/apifox'
import GaPicker from '@/components/ga-picker/ga-picker.vue'
import appDsBridge from '@/utilsH5/appDsBridge'
import { isYinheAppEnv, getAppTokenFromSession } from '@/utilsH5/env'
import { getSystemInfo } from '@/utils/env';
import { onShow } from '@dcloudio/uni-app';
import NavBar from '@/components/nav-bar-base.vue';
import info from '@/static/image/info.svg'
import { handleSensorsClick } from '@/utils/public'

const labelWidth = '120rpx';
const labelWidth2 = '180rpx'

const formData = ref<any>({
    monthlySalary: undefined,
    bonus: undefined,
    maritalStatus: undefined,
    housingStatus: undefined,
    houseLocation: undefined,
    childrenStatus: undefined,
    childrenCount: undefined,
    careStatus: undefined,
    careCount: undefined,
    continueEducation: undefined,
})

const rules = {
    monthlySalary: {
    rules: [{
      required: true,
      errorMessage: '请输入月度工资',
    }]
  },
  bonus: {
    rules: [{
      required: true,
      errorMessage: '请输入年终奖',
    }]
  },
  maritalStatus: {
    rules: [{
      required: true,
      errorMessage: '请选择是否已婚',
    }]
  },
  housingStatus: {
    rules: [{
      required: true,
      errorMessage: '请选择住房情况',
    }]
  },
  houseLocation: {
    rules: [{
      required: true,
      errorMessage: '请选择房屋位置',
    }]
  },
  childrenStatus: {
    rules: [{
      required: true,
      errorMessage: '请选择子女情况',
    }]
  },
  childrenCount: {
    rules: [{
      required: true,
      errorMessage: '请输入未成年(或成年在读)子女数',
    }]
  },
  careStatus: {
    rules: [{
      required: true,
      errorMessage: '请选择是否赡养老人',
    }]
  },
  careCount: {
    rules: [{
      required: true,
      errorMessage: '请输入满60岁父母数',
    }]
  },
  continueEducation: {
    rules: [{
      required: true,
      errorMessage: '请选择是否继续教育',
    }]
  },
}

const bottomIndex = ref(3)

const totalSalary = computed(() => {
    let { monthlySalary, bonus } = formData.value;
    monthlySalary = isNaN(monthlySalary) ? 0 : monthlySalary;
    bonus = isNaN(bonus) ? 0 : +bonus;

    return formatNumberThousand(monthlySalary * 12 + bonus)
})

const isH5 = ref(false)
function init() {
    if(isYinheAppEnv()) { 
        appDsBridge.hideNavigationBarSyn('1')
    } else if(getSystemInfo()?.hostName !== 'WeChat'){
        isH5.value = true;
    }
}

onShow(() => {
  uni.setNavigationBarColor({
    backgroundColor: '#ffffff',
    frontColor: '#ffffff'
  });
  init()
})

const goBack = () => {
  if(isYinheAppEnv()) {
    appDsBridge.backToAppPreView()
  }else {
    uni.navigateBack()
  }
}


function validateInput(value : any, key: string) {
    // 使用 setTimeout 将操作延迟到事件循环的下一个tick
    setTimeout(() => {
        // 使用正则表达式将 value 中的非数字字符替换为空字符串
        value = value.replace(/[^0-9]+/g, '');
        // 将处理后的 value 存储到 formData.value 对象中，以 key 为键
        formData.value[key] =  value ?  Number(value) : value;
    }, 0);
}

function handleChange(key: string) {
    console.log(key);
    switch (key) {
        case 'monthlySalary':
            console.log('月度工资：', formData.value.monthlySalary);

            break;
        case 'housingStatus':
            formData.value.houseLocation = undefined;
            break;
        case 'childrenStatus':
            formData.value.childrenCount = undefined;
            break;
        case 'careStatus':
            formData.value.careCount = undefined;
            break;
        default:
            break;
    }
}

function handleBlur(key: string) {
    // 确保输入值为数字
    const numValue = Math.floor(formData.value[key]);
    // >9 设置为9
    if (numValue > 9) {
        formData.value[key] = 9;
    } else if (numValue <= 0 || isNaN(numValue) ) {
        formData.value[key] = 1;
    } else {
        formData.value[key] = numValue;
    }
}

const formRef = ref()
async function submit(e:Event) {
    if(isYinheAppEnv() && !getAppTokenFromSession()) {
        appDsBridge.loginAndRefeshWithTokenSyn('1')
        return;
    }
    await formRef.value.validate()
    try {
        uni.showLoading()
        const data = await PostBizTaxCalculate(formData.value)
        uni.navigateTo({
            url: `/pages/calculator/tax-calculator-result/index?id=${data}`
        })
    } catch (error: any) {
        uni.showToast({
            title: error || '计算失败',
            icon: 'none'
        })
    } finally {
        uni.hideLoading()
    }
}

</script>


<style scoped lang="scss">
.wrap {
    background: #F8F9FB;
    box-sizing: border-box;
    min-height: 100vh;
    padding-bottom: calc(constant(safe-area-inset-bottom) + 128rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 128rpx);

    :deep(.nav-title) {
        color: white !important;
    }
    
    .bg-wrap {
        width: 100vw;
        background: linear-gradient(180deg, #062577 2.71%, #08358D 20.28%, #3E5BA5 41.21%, rgba(227, 236, 249, 0) 100%);
        height: 880rpx;
        position: static;
        left: 0;
        top: 0;
    }
    .content {
        padding: 48rpx 30rpx; 
        position: relative;
        z-index: 2;
        margin-top: -880rpx;
        .content-title {
            font-family: PingFang SC;
            font-size: 48rpx;
            font-weight: 600;
            line-height: 66rpx;
            text-align: center;
            color: #FFFFFF;
        }
        .sub-title {
            margin: 12rpx auto 68rpx;
            color: #D6E1F3;
            font-size: 28rpx;
            line-height: 40rpx;
            width: 416rpx;
            height: 52rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(18, 26, 38, 0.2);
            box-sizing: border-box;
            border-radius: 24rpx;
        }
        .card {
            background: #FFFFFF;
            border-radius: 12rpx;
    
            & + .card {
                margin-top: 32rpx;
            }
            :deep(.business-form-item) {
                &:last-child {
                    border-bottom: 0;
                }
                .business-form-item-content {
                    justify-content: flex-end;
                    text-align: right;
                    .form-item-content {
                        width: 100%;
                    }
                    .uni-easyinput {
                        text-align: right;
                        font-size: 28rpx;
                        line-height: 40rpx;
                        input {
                            padding: 0 !important;
                        }
                    }
                    .uni-input-input{
                        font-family: 'PingFang SC';
                        font-size: 28rpx;
                    }
                    .uni-easyinput__placeholder-class {
                        line-height: 40rpx;
                        color: #B9C1CC !important;
                    }
                    .check-wrap {
                        justify-content: flex-end;
                    }
                }
             
            }
            .total-wrap {
                color: #0046B4;
                font-size: 28rpx;
                .total-flag {
                    position: relative;
                    bottom: 2rpx;
                }
                .total-number {
                    font-family: "D-DIN-PRO-700";
                    font-size: 48rpx;
                }
            }
            .support-view {
                display: flex;
                align-items: center;
                .info {
                    width: 32rpx;
                    height: 32rpx;
                    position: relative;
                    top: 3rpx;
                    margin-left: 10rpx;
                }
            }
        }
    }
    .bottom-wrap {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        display: flex;
        justify-content: center;
        padding: 16rpx 0 20rpx; 
        padding-bottom: calc(constant(safe-area-inset-bottom) + 20rpx); /* 兼容 iOS < 11.2 */
        padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
        background: #FFFFFF;
        
        z-index: 3;
        .btn {
            font-size: 32rpx;
            color: #FFFFFF;
            border-radius: 6rpx;
            background: #0046B4;
            width: 686rpx;
            height: 92rpx;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
.h5-wrap {
    padding-bottom: 0;
    padding-top: 140rpx;
}
</style>