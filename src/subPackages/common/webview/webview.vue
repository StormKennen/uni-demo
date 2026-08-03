<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'

  type AgreementType = 'privacy' | 'protocol'

  type AgreementSection = {
    title: string
    items: string[]
  }

  type Option = {
    title?: string
    url?: string
    decodeUrl?: string
    type?: AgreementType
  }

  const webviewSrc = ref('')
  const pageTitle = ref('')
  const showError = ref(false)
  const errorMessage = ref('')
  const isLoading = ref(true)
  const agreementType = ref<AgreementType | ''>('')
  const isAgreementPage = ref(false)
  const agreementTitle = ref('')
  const agreementSubtitle = ref('')
  const agreementSections = ref<AgreementSection[]>([])

  const privacySections: AgreementSection[] = [
    {
      title: '我们收集的信息',
      items: [
        '账号信息：当你使用手机号注册、登录时，我们会收集手机号、登录凭证及账号状态，用于创建账号、身份验证和保障账号安全。',
        '微信登录信息：当你选择微信快捷登录时，我们会通过微信小程序能力获取登录 code，并由服务端换取 openid 等必要标识，用于完成登录和账号绑定。',
        '用户主动提供的内容：你在备忘录、文件上传、图片处理、视频处理、PDF 工具、码包、游戏兑换券、图鉴阵容等功能中主动提交的文本、图片、视频、文件、链接、游戏账号、服务器、兑换记录或表单信息。',
        '位置和路径信息：当你在备忘录等功能中主动选择位置或路线节点时，我们会读取你选择的位置名称、地址和坐标，用于生成对应记录或展示路线内容。',
        '剪贴板信息：当你点击粘贴、解析链接或复制结果时，我们会读取或写入剪贴板内容，仅用于完成你主动触发的复制、粘贴、解析操作。',
        '相册与保存信息：当你选择保存图片、视频或海报到相册时，小程序会请求相册写入权限，并将对应结果保存到你的设备相册。',
        '设备与日志信息：为保障服务稳定和排查异常，我们可能记录基础设备信息、网络状态、访问时间、接口调用结果、错误日志和操作记录。',
        '图片、视频与文件信息：你选择处理的本地图片、视频或文件会用于完成压缩、转换、拼接、加水印、隐私清理、内容安全校验等对应功能。',
      ],
    },
    {
      title: '使用目的和方式',
      items: [
        '用于账号注册、登录、身份识别、找回访问状态、展示个人资料及保存你的工具使用数据。',
        '用于完成你主动发起的工具处理，例如图片压缩、图片加水印、图片隐私清理、文档扫描、文件上传、PDF 处理、码包管理和游戏兑换券操作。',
        '用于保存、展示或同步你主动创建的备忘录、阵容、兑换账号、兑换记录、上传文件和处理结果。',
        '用于完成你主动触发的位置选点、路线记录、剪贴板粘贴解析、结果复制、图片/视频保存到相册等操作。',
        '用于小程序平台要求的内容安全校验，避免违法违规图片、文本、文件内容被发布、上传、保存或继续处理。',
        '用于安全风控、故障排查、客服沟通、服务质量优化和防止恶意访问。',
        '除实现具体功能、履行法律法规或平台规则要求外，我们不会将你的个人信息用于与功能无关的用途。',
      ],
    },
    {
      title: '存储与保护',
      items: [
        '账号信息、你主动保存或上传的数据可能存储在我们的服务器；仅在本地完成的临时处理结果，通常保存在你的设备或小程序临时文件中。',
        '我们会采取访问控制、传输加密、权限隔离、日志审计等合理措施保护个人信息安全。',
        '当你删除相关内容、注销/退出账号或法律法规要求删除时，我们会在合理期限内删除或匿名化处理相关信息，但法律法规另有要求的除外。',
      ],
    },
    {
      title: '共享与第三方服务',
      items: [
        '微信平台：用于微信登录、隐私授权、内容安全校验、图片/视频选择等小程序基础能力。',
        '云存储与后端服务：用于保存你主动上传或需要跨设备访问的文件、账号数据和业务记录。',
        '我们不会出售你的个人信息。确需委托第三方处理时，会要求其仅按本政策和我们的指令处理信息。',
      ],
    },
    {
      title: '你的权利',
      items: [
        '你可以在小程序内查看、修改或删除部分个人信息和内容；也可以退出登录以清除本地登录状态。',
        '如需访问、更正、删除账号数据，或撤回部分授权，可通过小程序内设置入口与我们联系处理。',
        '你有权拒绝非必要授权；但拒绝后，依赖该授权的图片选择、视频选择、文件上传、位置选择、相册保存、剪贴板粘贴、微信登录等功能可能无法使用。',
      ],
    },
  ]

  const protocolSections: AgreementSection[] = [
    {
      title: '服务内容',
      items: [
        '本小程序提供工具箱类服务，包括图片处理、视频处理、文档处理、备忘录、文件上传、二维码、码包、游戏兑换券、魔灵召唤图鉴与阵容管理等功能。',
        '部分功能可能需要登录账号、选择本地文件、上传内容或调用微信小程序能力后才能使用。',
        '我们会根据产品迭代、平台规则和安全要求调整、暂停或优化部分功能。',
      ],
    },
    {
      title: '用户行为规范',
      items: [
        '你应确保提交、上传、处理或保存的内容合法、真实，不侵犯他人隐私、名誉、知识产权或其他合法权益。',
        '不得利用本小程序制作、上传、传播违法违规、低俗、暴力、诈骗、侵权或其他违反微信小程序平台规则的内容。',
        '不得通过自动化、攻击、破解、批量请求等方式干扰小程序、服务器或第三方服务的正常运行。',
      ],
    },
    {
      title: '账号与授权',
      items: [
        '你需要先阅读并同意《用户服务协议》和《隐私政策》，再进行登录、注册或使用需要个人信息授权的功能。',
        '你应妥善保管账号和登录状态。因你主动泄露、转让或授权他人使用账号导致的后果，由你自行承担。',
        '当你使用微信登录、选择图片/视频/文件、保存到相册等能力时，小程序会按微信平台规范请求对应授权。',
      ],
    },
    {
      title: '内容安全与处理结果',
      items: [
        '对于你提交的文本、图片、视频或文件，我们可能依法依规进行内容安全校验；若检测到违规风险，相关内容可能被拒绝处理或保存。',
        '工具处理结果受原始文件质量、设备性能、网络状态和第三方接口限制影响，我们会尽力保障可用性，但不承诺所有结果完全符合特定商业用途。',
        '你应自行确认处理结果是否满足使用场景，并对下载、保存、分享后的使用行为负责。',
      ],
    },
    {
      title: '协议更新与联系我们',
      items: [
        '我们可能根据法律法规、平台规则或业务变化更新本协议。更新后会在小程序内展示，继续使用即表示你接受更新后的内容。',
        '如你不同意本协议或隐私政策，可停止使用涉及个人信息处理的功能。',
        '如对协议、隐私保护或个人信息处理有疑问，可通过小程序设置页或客服入口联系我们。',
      ],
    },
  ]

  const resolveAgreementType = (option: Option): AgreementType | '' => {
    if (option.type === 'privacy' || option.type === 'protocol') {
      return option.type
    }
    const title = option.title || ''
    if (title.includes('隐私') || title.includes('政策')) {
      return 'privacy'
    }
    // 兼容微信后台服务名（如“凉白开工具箱 小程序提供服务”）以及常见协议标题
    if (
      title.includes('用户') ||
      title.includes('服务') ||
      title.includes('协议') ||
      title.includes('提供服务') ||
      title.includes('工具箱')
    ) {
      return 'protocol'
    }
    return ''
  }

  const setupAgreementPage = (type: AgreementType) => {
    isAgreementPage.value = true
    agreementType.value = type
    agreementTitle.value = type === 'privacy' ? '隐私政策' : '用户服务协议'
    agreementSubtitle.value =
      type === 'privacy'
        ? '本政策说明我们如何收集、使用、存储和保护你的个人信息。'
        : '本协议说明你使用本小程序服务时的权利、义务和基本规则。'
    agreementSections.value = type === 'privacy' ? privacySections : protocolSections
  }

  onLoad(option => {
    console.log('🚀 ~ webview onLoad ~ option:', option)
    const _option = option || ({} as Option)
    const hasExternalUrl = Boolean(_option.url || _option.decodeUrl)
    let resolvedAgreementType = resolveAgreementType(_option)

    // 无外部网页地址时一律展示协议内容，兼容微信审核后台各种入口（无参数 / 仅服务名标题）
    if (!resolvedAgreementType && !hasExternalUrl) {
      resolvedAgreementType = 'protocol'
    }

    if (resolvedAgreementType) {
      setupAgreementPage(resolvedAgreementType)
    }

    // 协议页强制使用标准标题，避免被微信后台服务名覆盖后看起来像空白
    if (isAgreementPage.value) {
      pageTitle.value = agreementTitle.value
    } else {
      pageTitle.value = _option.title || '网页浏览'
    }
    uni.setNavigationBarTitle({
      title: pageTitle.value,
    })

    if (isAgreementPage.value) {
      isLoading.value = false
      showError.value = false
      return
    }

    webviewSrc.value = _option.decodeUrl ? decodeURIComponent(_option.url || '') : _option.url || ''
    console.log('🚀 ~ webview src:', webviewSrc.value)

    // 设置加载超时
    setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false
        showError.value = true
        errorMessage.value = '页面加载超时，请检查网络连接'
      }
    }, 10000)
  })

  const goBack = () => {
    uni.navigateBack()
  }

  const onIframeLoad = () => {
    console.log('🚀 ~ iframe loaded successfully')
    isLoading.value = false
    showError.value = false
  }

  const onIframeError = () => {
    console.log('🚀 ~ iframe load error')
    isLoading.value = false
    showError.value = true
    errorMessage.value = '页面加载失败，可能是网络问题或页面不支持嵌入显示'
  }

  const openInNewTab = () => {
    window.open(webviewSrc.value, '_blank')
  }

  const retry = () => {
    isLoading.value = true
    showError.value = false
    // 强制重新加载iframe
    const iframe = document.querySelector('.h5-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }
</script>

<template>
  <view class="webview-container">
    <!-- 自定义导航栏 -->
    <!-- #ifdef H5 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="20" color="#333" />
          <text class="back-text">返回</text>
        </view>
        <view class="navbar-title">{{ pageTitle }}</view>
        <view class="placeholder"></view>
      </view>
    </view>
    <!-- #endif -->

    <view class="webview-content">
      <view v-if="isAgreementPage" class="agreement-page">
        <view class="agreement-hero">
          <text class="agreement-title">{{ agreementTitle }}</text>
          <text class="agreement-subtitle">{{ agreementSubtitle }}</text>
          <text class="agreement-date">更新日期：2026年7月27日</text>
        </view>

        <view v-for="section in agreementSections" :key="section.title" class="agreement-card">
          <text class="agreement-section-title">{{ section.title }}</text>
          <view v-for="item in section.items" :key="item" class="agreement-item">
            <text class="agreement-dot">•</text>
            <text class="agreement-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- #ifdef H5 -->
      <!-- 加载状态 -->
      <view v-if="!isAgreementPage && isLoading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载页面...</text>
      </view>

      <!-- 错误状态 -->
      <view v-if="!isAgreementPage && showError" class="error-container">
        <view class="error-icon">⚠️</view>
        <text class="error-message">{{ errorMessage }}</text>
        <view class="error-actions">
          <button class="retry-btn" @click="retry">重试</button>
          <button class="open-btn" @click="openInNewTab">在新窗口打开</button>
        </view>
      </view>

      <!-- iframe内容 -->
      <iframe
        v-if="!isAgreementPage && webviewSrc && !showError"
        :src="webviewSrc"
        class="h5-iframe"
        frameborder="0"
        allowfullscreen
        @load="onIframeLoad"
        @error="onIframeError"></iframe>
      <!-- #endif -->

      <!-- #ifndef H5 -->
      <web-view v-if="!isAgreementPage" :src="webviewSrc" bindmessage=""></web-view>
      <!-- #endif -->
    </view>
  </view>
</template>

<style lang="scss" scoped>
  .webview-container {
    min-height: 100vh;
    background: var(--theme-bg, #f6f7fb);
  }

  .agreement-page {
    min-height: 100vh;
    padding: 32rpx 28rpx 56rpx;
    box-sizing: border-box;
    background: var(--theme-bg, #f6f7fb);
  }

  .agreement-hero {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    padding: 8rpx 4rpx 24rpx;
  }

  .agreement-title {
    font-size: 42rpx;
    line-height: 56rpx;
    font-weight: 700;
    color: var(--theme-text, #121826);
  }

  .agreement-subtitle,
  .agreement-date {
    font-size: 26rpx;
    line-height: 40rpx;
    color: var(--theme-text-secondary, #687386);
  }

  .agreement-card {
    margin-top: 20rpx;
    padding: 28rpx;
    border: 1rpx solid var(--theme-border, #e6e8ef);
    border-radius: 16rpx;
    background: var(--theme-surface, #ffffff);
  }

  .agreement-section-title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 31rpx;
    line-height: 42rpx;
    font-weight: 700;
    color: var(--theme-text, #121826);
  }

  .agreement-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    margin-top: 14rpx;
  }

  .agreement-dot {
    width: 18rpx;
    flex-shrink: 0;
    font-size: 28rpx;
    line-height: 40rpx;
    color: var(--theme-brand, #4768f5);
  }

  .agreement-text {
    flex: 1;
    font-size: 27rpx;
    line-height: 42rpx;
    color: var(--theme-text, #121826);
  }

  /* #ifdef H5 */
  .custom-navbar {
    height: 44px;
    background-color: var(--theme-surface);
    border-bottom: 1px solid var(--theme-border);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    .navbar-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;

      .back-btn {
        display: flex;
        align-items: center;
        cursor: pointer;

        .back-text {
          margin-left: 4px;
          font-size: 16px;
          color: var(--theme-text);
        }
      }

      .navbar-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--theme-text);
        text-align: center;
        flex: 1;
      }

      .placeholder {
        width: 60px;
      }
    }
  }

  .webview-content {
    flex: 1;
    margin-top: 44px;
    position: relative;

    .h5-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .loading-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007aff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      .loading-text {
        color: var(--theme-text-secondary);
        font-size: 14px;
      }
    }

    .error-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      padding: 20px;

      .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .error-message {
        color: var(--theme-text-secondary);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 20px;
        display: block;
      }

      .error-actions {
        display: flex;
        gap: 12px;
        justify-content: center;

        button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;

          &.retry-btn {
            background-color: #007aff;
            color: white;

            &:hover {
              background-color: #0056cc;
            }
          }

          &.open-btn {
            background-color: var(--theme-surface-2);
            color: var(--theme-text);

            &:hover {
              background-color: #e0e0e0;
            }
          }
        }
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
  /* #endif */

  /* #ifndef H5 */
  .webview-content {
    flex: 1;
  }
  /* #endif */
</style>
