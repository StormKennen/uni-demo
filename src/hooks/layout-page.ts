import { provide, inject, getCurrentInstance } from 'vue'
import type { InjectionKey } from 'vue'

const injectionKey: InjectionKey<ReturnType<typeof useLayoutPageProvide>> = Symbol('LayoutPage')
export function useLayoutPageProvide() {
  const instance = getCurrentInstance()

  const getLayoutPageContentClientRect = async () => {
    return new Promise<UniApp.NodeInfo>(resolve => {
      const query = uni.createSelectorQuery().in(instance.proxy)

      query
        .select('.layout-page-content')
        .boundingClientRect(data => {
          if (Array.isArray(data)) {
            data = data[0]
          }
          resolve(data)
        })
        .exec()
    })
  }

  const obj = {
    getLayoutPageContentClientRect,
  }
  provide(injectionKey, obj)
  return obj
}

export function useLayoutPageInject() {
  return inject(injectionKey, null)
}
