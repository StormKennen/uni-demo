<script setup lang="ts">
  import { ref } from 'vue'
  import SimpleTable from '@/components/simple-table/index.vue'
  const CDN_URL = 'https://cdn-public.galaxy-immi.com/business/tax-calculator'
  import { formatNumberThousand } from '@/utils/common'
  import { GetBizTaxCalculateRecord } from '@/services/apifox/3903128/shangWuXiaoChengXu/geShuiJiSuanQi/apifox'
  import type { GetBizTaxCalculateRecordRes } from '@/services/apifox/3903128/shangWuXiaoChengXu/geShuiJiSuanQi/interface'
  import { onShareAppMessage, onLoad } from '@dcloudio/uni-app'
  import { isYinheAppEnv } from '@/utilsH5/env'
  import appDsBridge from '@/utilsH5/appDsBridge'
  import NavBar from '@/components/nav-bar.vue'
  import { onShow } from '@dcloudio/uni-app'
import { handleSensorsClick } from '@/utils/public'

  const isYinheApp = ref(false)

  const tableData = ref([])

  /** 香港对比内地少收金额 */
  const undercharged = ref(0) 

  const columns = [
    {
      prop: 'name',
      label: '项目',
      width: 164,
      isDefaultValue: true,
      cellClassName: 'font-500',
    },
    {
      prop: 'hkdAmount',
      label: '香港',
      width: 266,
      isDefaultValue: false,
      headerClassName: 'primary-bg',
      cellClassName: 'primary-cell',
    },
    {
      prop: 'cnyAmount',
      label: '内地',
      width: 196,
      isDefaultValue: false,
      cellClassName: 'plain-cell',
    },
  ]

  const nameReflect: any = {
    basic: '基本免税额',
    marital_status: '配偶抵扣额',
    house: '租房抵扣额',
    children_count: '子女抵扣额',
    care_count: '赡养抵扣额',
    continue_education: '教育抵扣额',
  }

  function getTableData(data: GetBizTaxCalculateRecordRes) {
    const cnyObj: any = data.find(item => item.taxArea === 'cn')
    const hkdObj: any = data.find(item => item.taxArea === 'hk')
    const cnyTaxDeductions = cnyObj?.taxDeductions || []
    const hkdTaxDeductions = hkdObj?.taxDeductions || []
    const basicData = Object.keys(nameReflect).reduce((prev, key) => {
      const obj: any = {}
      obj.name = nameReflect[key] || ''
      obj.hkdAmount = hkdTaxDeductions.find(item => item.name === key)?.amount || 0
      obj.cnyAmount = cnyTaxDeductions.find(item => item.name === key)?.amount || 0
      if (obj.hkdAmount || obj.cnyAmount) {
        prev.push(obj)
      }
      return prev
    }, [] as any)

    // 香港税后年薪
    const hkAfterTaxAmount = ((hkdObj?.taxableIncome || 0) / (hkdObj.exchangeRate || 1)).toFixed(0)
    basicData.unshift({
      name: '税后年薪',
      hkdAmount: hkAfterTaxAmount,
      hk: hkdObj?.taxableIncome || 0,
      cnyAmount: cnyObj?.taxableIncome || 0,
    })
    const totalUndercharged = Number(hkAfterTaxAmount) - (cnyObj?.taxableIncome || 0) 
    undercharged.value = totalUndercharged < 0 ? 0 : totalUndercharged


    basicData.push(
      {
        name: '总计',
        hkdAmount: hkdTaxDeductions.reduce((prev, item) => prev + (item.amount || 0), 0),
        cnyAmount: cnyTaxDeductions.reduce((prev, item) => prev + (item.amount || 0), 0),
      },
      {
        name: '个税缴纳',
        hkdAmount: hkdObj?.totalTax || 0,
        cnyAmount: cnyObj?.totalTax || 0,
      },
      {
        name: '折合税率',
        hkdAmount: hkdObj?.taxRate || 0,
        cnyAmount: cnyObj?.taxRate || 0,
      },
    )

    tableData.value = basicData
    console.log(basicData, '===')
  }

  onShow(() => {
    isYinheApp.value = isYinheAppEnv()
  })
  const id = ref(0)
  async function getDetail() {
    try {
      const data = await GetBizTaxCalculateRecord({
        recordId: id.value,
      })
      getTableData(data)
    } catch (error: any) {
      uni.showToast({
        title: error || '请求失败',
        icon: 'none',
      })
    }
  }

  /**  APP内分享 */
  function openShareView() {
    appDsBridge.openShareView({
      ShareH5Title: '香港内地个税计算器',
      ShareH5Describe: '速算对比香港与内地个税',
      ShareH5Url: `${import.meta.env.VITE_APP_H5_URL}/pages/calculator/tax-calculator/index?x=1`,
      ContentUrl: `${CDN_URL}/calculator_result_share.jpg`,
    })
  }

  onLoad((option?: AnyObject) => {
    id.value = (option?.id as number) || 0
    console.log(id.value, '===')
    getDetail()
  })

  onShareAppMessage(() => {
    return {
      title: '香港内地个税计算器',
      path: 'pages/calculator/tax-calculator/index', // 分享的页面路径
      imageUrl: `${CDN_URL}/calculator_result_share.jpg`, // 分享的图片地址
      success: () => {
        console.log('分享成功')
        // 可以在这里进行分享成功后的操作，例如提示用户等
      },
      fail: () => {
        console.log('分享失败')
        // 分享失败后的操作，例如提示用户失败原因等
      },
    }
  })

</script>
<template>
  <view class="wrap">
    <NavBar title="香港内地个税计算器" />
    <view class="bg-wrap">
      <image class="bg-image" mode="widthFix" :src="`${CDN_URL}/calculator_result_bg.png`"></image>
      <view class="bg-text">
        根据当前收入初步估算(速算版未考虑扣减和五险一金等具体情况)，香港税收少<text class="color-primary">{{ undercharged }}</text>元！
      </view>
    </view>
    <view class="content-wrap">
      <SimpleTable :tableData="tableData" :columns="columns" :overFlowX="false">
        <template #cellSlot="{ row, column, value, isDefaultValue }">
          <template v-if="isDefaultValue">
            {{ value }}
          </template>
          <template v-else-if="column.prop === 'hkdAmount'">
            <view v-if="row.name === '税后年薪'">
              <view>{{ formatNumberThousand(row.hkdAmount) }}</view>
              <view class="small-hk">{{ formatNumberThousand(row.hk || 0) }}HKD</view>
            </view>
            <view v-else-if="row.name === '个税缴纳'"> {{ formatNumberThousand(value || 0) }}<text class="small-text">HKD</text> </view>
            <view v-else-if="row.name === '折合税率'"> {{ (value * 100).toFixed(0) }}% </view>
            <view v-else>
              {{ +value === 0 ? '-' : formatNumberThousand(value) }}<text class="small-text" v-if="+value !== 0">HKD</text>
            </view>
          </template>
          <template v-else-if="column.prop === 'cnyAmount'">
            <text v-if="row.name === '折合税率'"> {{ (value * 100).toFixed(0) }}% </text>
            <text v-else-if="row.name === '个税缴纳' || row.name === '税后年薪'">
              {{ formatNumberThousand(value || 0) }}
            </text>
            <text v-else>
              {{ +value === 0 ? '-' : formatNumberThousand(value) }}
            </text>
          </template>
        </template>
      </SimpleTable>
    </view>
    <view class="bottom-wrap" data-sensors-event-name="Business_TaxCalculationResults_Share"
    data-sensors-china-event-name="商务_税务计算结果_分享" @click="handleSensorsClick($event)">
      <view class="bottom-tips">只会分享工具不会分享数据</view>
      <button class="btn" v-if="isYinheApp" @click="openShareView"> 分享工具给好友 </button>
      <button class="btn" open-type="share" v-else> 分享工具给好友 </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .wrap {
    overflow: auto;
    background: #f8f9fb;
    box-sizing: border-box;
    min-height: 100vh;
    padding-bottom: calc(constant(safe-area-inset-bottom) + 184rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 184rpx);
    .bg-wrap {
      position: absolute;
      left: 0;
      top: 0;
      width: 100vw;
      .bg-image {
        width: 100vw;
      }
      .bg-text {
        position: absolute;
        left: 40rpx;
        top: 288rpx;
        width: 402rpx;
        font-size: 26rpx;
        line-height: 44rpx;
        color: #435163;
      }
    }
    .content-wrap {
      position: relative;
      z-index: 2;
      margin: 454rpx 32rpx 32rpx;
      padding: 30rpx;
      border-radius: 12rpx;
      background: #ffffff;
      :deep(.simple-table) {
        .font-500 {
          font-weight: 500;
        }
        .primary-bg {
          background: #0046b4;
          color: #ffffff;
          position: relative;
        }
        .primary-cell {
          font-size: 48rpx;
          line-height: 40rpx;
          color: #0046b4;
          font-family: 'D-DIN-PRO-700';
          background: rgba(0, 70, 180, 0.07);
        }
        .plain-cell {
          font-family: 'D-DIN-PRO-700';
          font-size: 40rpx;
          line-height: 40rpx;
        }
        .small-text {
          font-size: 28rpx;
        }
        .small-hk {
          margin-top: 10rpx;
          font-size: 26rpx;
          line-height: 26rpx;
          font-family: 'D-DIN-PRO-500';
        }
      }
    }
    .color-primary {
      color: #0046b4;
      font-size: 32rpx;
      line-height: 44rpx;
      font-weight: 600;
    }
    .bottom-wrap {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100vw;
      padding-bottom: calc(constant(safe-area-inset-bottom) + 20rpx); /* 兼容 iOS < 11.2 */
      padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
      background: #ffffff;
      z-index: 3;
      .bottom-tips {
        font-size: 24rpx;
        color: #8993a2;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 0 16rpx -32rpx;
      }
      .btn {
        font-size: 32rpx;
        color: #ffffff;
        border-radius: 6rpx;
        background: #0046b4;
        width: 686rpx;
        height: 92rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
