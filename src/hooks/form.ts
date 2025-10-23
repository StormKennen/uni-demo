import { provide, inject, ref, shallowRef } from 'vue'
import type { InjectionKey } from 'vue'
import type { UniFormsInstance } from '@uni-helper/uni-ui-types'

const injectionKey: InjectionKey<ReturnType<typeof useForm>> = Symbol('Form')
export function useForm() {
  const formRef = ref<UniFormsInstance>()
  const errorMessages = shallowRef<
    Array<{
      key: string
      errorMessage: string
    }>
  >([])

  const clearErrorMessages = () => {
    errorMessages.value = []
  }

  const obj = {
    formRef,
    // keepItem 保留不参与校验的字段
    validate: (keepItem?: Array<string>) => {
      if (!formRef.value) return Promise.reject('formRef is undefined')
      return (formRef.value.validate(keepItem) as Promise<void>).catch((errs: any[]) => {
        errorMessages.value = [...errs]
        return Promise.reject(errs)
      })
    },
    errorMessages,
    clearErrorMessages,
  }
  provide(injectionKey, obj)
  return obj
}

export function useFormInject() {
  return inject(injectionKey, null)
}
