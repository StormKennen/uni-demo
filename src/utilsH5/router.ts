import { getAppNavigationH, getAppStatusBarH, getAppTokenFromQuery, getAppYhidFromQuery, setAppNavigationH, setAppStatusH, setAppTokenToSession } from './env'

export const watchRouter = () => {
  // #ifdef WEB
  console.log('watchRouter location...', location)
  getAppTokenFromQuery()
  getAppYhidFromQuery()
  const appNavigationH = getAppNavigationH()
  appNavigationH && setAppNavigationH(appNavigationH)
  const appStatusBarH = getAppStatusBarH()
  appStatusBarH && setAppStatusH(appStatusBarH)
  // #endif
}