import { paramToToken, tokenToParam } from "@/utils/common"


interface Query {
  token?: string
  param?: string
}

export const getQueryVal = (key: string) => {
  let from = ''
  // #ifdef WEB
  if (localStorage.getItem(key)) {
    from = localStorage.getItem(key) || ''
  }
  else {
    const params = new URLSearchParams(location.href.split('?')[1])
    from = params.get(key) || ''
    localStorage.setItem(key, from)
  }
  // #endif
  return from
}

export const getAppStatusBarH = (): string => {
  const h = getQueryVal('statusBarH')
  console.log('statusBarH param', h);
  return h
}

export const getAppStatusHFromSession = (): string | undefined => {
  // #ifdef WEB
  const h = localStorage.getItem('statusBarH')
  console.log('statusBarH localStorage', h);
  return h
  // #endif
  // #ifndef WEB
  return ''
  // #endif
}

export const setAppStatusH = (val: string) => {
  localStorage.setItem('statusBarH', Number.parseInt(val).toString())
}

export const getAppNavigationH = (): string => {
  return getQueryVal('navigationH')
}

export const getAppNavigationHFromSession = (): string => {
  return localStorage.getItem('navigationH')
}

export const setAppNavigationH = (val: string) => {
  localStorage.setItem('navigationH', Number.parseInt(val).toString())
}

/**  */
export const getQueryValSimple = (key: string) => {
  const params = new URLSearchParams(location.href.split('?')[1])
  let val = params.get(key) || ''
  if(val.endsWith('#/')){
    val = val.slice(0, val.length -2)
  }
  return val
}

/** 获取 app 携带过来的token */
export const getAppYhidFromQuery = (): string => {
  // superApp传递过来的使用param，需要截取。h5内部跳转也使用param传递(以前是token, 不要再用了)
  const yhid = getQueryValSimple('yhid')
  console.log("🚀 ~ getAppYhidFromQuery ~ yhid:", yhid)
  if (yhid) {
    setAppYhid(yhid)
    return yhid
  }
  return getAppYhid()
}

/** 设置superAPP的 yhid */
export const setAppYhid = (appToken: string) => {
  localStorage.setItem('appYhid', appToken)
}


/** 从localStorage获取superApp yhid */
export const getAppYhid = () => {
  return localStorage.getItem('appYhid')
}

/** 获取 app 携带过来的token */
export const getAppTokenFromQuery = (): string => {
  // superApp传递过来的使用param，需要截取。h5内部跳转也使用param传递(以前是token, 不要再用了)
  const param = getQueryValSimple('param')
  console.log("🚀 ~ getAppTokenFromQuery ~ param:", param)
  if (param) {
    const token = paramToToken(param as string || '')
    setAppTokenToSession(token)
    return token
  }
  return getAppTokenFromSession()
}

/** 设置superAPP的token */
export const setAppTokenToSession = (appToken: string) => {
  localStorage.setItem('appToken', appToken)
}

/** 从localStorage获取superApp token */
export const getAppTokenFromSession = () => {
  return localStorage.getItem('appToken')
}

/** 从localStorage获取superApp token 解密成param */
export const getAppParamFromSession = () => {
  const appToken = localStorage.getItem('appToken') || ''
  return tokenToParam(appToken)
}

export const isYinheAppEnv = () => {
  const userAgent = navigator?.userAgent || ''
  console.log('🚀 ~ isYinheAppEnv ~ userAgent:', userAgent)
  return userAgent?.includes('YinHeApp')
}

// 是否微信浏览器
export const isWeChatBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /micromessenger/i.test(userAgent)
}