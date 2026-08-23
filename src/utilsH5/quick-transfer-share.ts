export const buildQuickTransferBrowserShareUrl = (shareToken: string): string => {
  const query = `mode=receive&shareToken=${encodeURIComponent(shareToken)}`
  const hash = window.location.hash
  if (hash.startsWith('#/')) {
    const hashPath = hash.slice(1).split('?')[0]
    return `${window.location.origin}${window.location.pathname}#${hashPath}?${query}`
  }
  return `${window.location.origin}${window.location.pathname}?${query}`
}
