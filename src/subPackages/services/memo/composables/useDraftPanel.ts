import { ref, reactive, computed, toRaw } from 'vue'
import { cloneDeep } from 'lodash-es'

/**
 * 草稿面板控制器：把 source（正式状态）拷贝到 draft（草稿），
 * 仅在 save() 时通过 apply 回写。所有控制面板（选项面板 / 容器面板）共享此协议。
 *
 * 行为：
 *  - open()    将 source 拷贝到 draft，记录 baseline
 *  - reset()   draft 回到打开面板时的 baseline
 *  - cancel()  若 dirty 则弹确认；否则直接关闭
 *  - save()    apply(draft) → 关闭 → toast
 *  - close()   仅关闭 visible，不写回
 */
export interface UseDraftPanelOptions<T extends object> {
  /** 当前正式状态的拉取函数（每次 open 时调用，避免静态绑定） */
  source: () => T
  /** 点击保存时回写到正式状态（调用方负责 Object.assign / 替换） */
  apply: (draft: T) => void
  /** 取消确认弹窗文案（可选，默认"放弃修改？" / "未保存的修改将丢失"） */
  cancelTitle?: string
  cancelContent?: string
  /** 关闭后回调（保存或取消都会触发） */
  onClose?: () => void
}

export function useDraftPanel<T extends object>(options: UseDraftPanelOptions<T>) {
  const visible = ref(false)
  const draft = reactive({}) as T
  let baseline: T = {} as T

  const isDirty = computed(() => {
    try {
      return JSON.stringify(toRaw(draft)) !== JSON.stringify(baseline)
    } catch {
      return false
    }
  })

  function open() {
    const src = options.source()
    // 清空 draft，再深拷贝注入
    Object.keys(draft as any).forEach(k => { delete (draft as any)[k] })
    Object.assign(draft, cloneDeep(src))
    baseline = cloneDeep(toRaw(draft) as T)
    visible.value = true
  }

  function reset() {
    Object.keys(draft as any).forEach(k => { delete (draft as any)[k] })
    Object.assign(draft, cloneDeep(baseline))
  }

  function cancel() {
    if (!isDirty.value) {
      close()
      return
    }
    uni.showModal({
      title: options.cancelTitle || '放弃修改？',
      content: options.cancelContent || '未保存的修改将丢失，是否确认？',
      confirmText: '放弃',
      cancelText: '继续编辑',
      success: ({ confirm }) => {
        if (confirm) close()
      }
    })
  }

  function save() {
    options.apply(cloneDeep(toRaw(draft) as T))
    close()
    uni.showToast({ title: '已保存', icon: 'success' })
  }

  function close() {
    visible.value = false
    options.onClose?.()
  }

  return { visible, draft, isDirty, open, reset, cancel, save, close }
}
