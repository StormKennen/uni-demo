import { provide, inject, ref, shallowReactive } from 'vue'
import type { InjectionKey, Ref } from 'vue'

const injectionKey = Symbol('VerticalSteps') as InjectionKey<ReturnType<typeof useVerticalStepProvide>>
export function useVerticalStepProvide(config: {
  activeStep: Ref<number>
}) {

  const steps = shallowReactive(new Set())

  const addStep = (key: symbol) => {
    steps.add(key)
  }
  const removeStep = (key: symbol) => {
    steps.delete(key)
  }
  const obj = {
    activeStep: config.activeStep,
    steps,
    addStep,
    removeStep
  }
  provide(injectionKey, obj)
  return obj
}

export function useVerticalStepInject() {
  return inject(injectionKey) as ReturnType<typeof useVerticalStepProvide>
}

