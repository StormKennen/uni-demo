export const buildRelayShareUrl = (path: string): string => {
  let origin = ''
  // #ifdef H5
  origin = window.location.origin
  // #endif
  return origin ? `${origin}${path}` : path
}
