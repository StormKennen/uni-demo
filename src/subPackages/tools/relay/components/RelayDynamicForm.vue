<script setup lang="ts">
  import { computed } from 'vue'
  import RelayFieldInput from './RelayFieldInput.vue'
  import RelayImageField from './RelayImageField.vue'
  import { getFieldDefaultValue } from '../constants'
  import type { RelayFieldValue, RelayFieldViewModel, RelayImageValue } from '../types'

  const props = withDefaults(
    defineProps<{
      fields: RelayFieldViewModel[]
      modelValue: Record<string, RelayFieldValue>
      images: Record<string, RelayImageValue[]>
      validationErrors?: Record<string, string>
      disabled?: boolean
      canUploadImages?: boolean
    }>(),
    { validationErrors: () => ({}), disabled: false, canUploadImages: true },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: Record<string, RelayFieldValue>]
    'update:images': [value: Record<string, RelayImageValue[]>]
    'uploading-change': [value: boolean]
  }>()

  const valueFor = (field: RelayFieldViewModel): RelayFieldValue => {
    if (Object.prototype.hasOwnProperty.call(props.modelValue, field.key)) return props.modelValue[field.key]
    return getFieldDefaultValue(field)
  }

  const updateValue = (field: RelayFieldViewModel, value: RelayFieldValue) => emit('update:modelValue', { ...props.modelValue, [field.key]: value })

  const imagesFor = (field: RelayFieldViewModel): RelayImageValue[] => props.images[field.key] || []

  const updateImages = (field: RelayFieldViewModel, images: RelayImageValue[]) => {
    emit('update:images', { ...props.images, [field.key]: images })
    emit('update:modelValue', { ...props.modelValue, [field.key]: images.filter(item => item.state === 'uploaded' && item.fileId).map(item => item.fileId) })
  }

  const hasUploadingImages = computed(() => Object.values(props.images).some(items => items.some(item => item.state === 'uploading')))
  const notifyUploading = (uploading: boolean) => emit('uploading-change', uploading || hasUploadingImages.value)
</script>

<template>
  <view class="dynamic-form">
    <template v-for="field in fields" :key="field.key">
      <RelayImageField
        v-if="field.type === 'image'"
        :field="field"
        :model-value="imagesFor(field)"
        :disabled="disabled"
        :can-upload="canUploadImages"
        :error="validationErrors[field.key]"
        @update:model-value="updateImages(field, $event)"
        @uploading-change="notifyUploading" />
      <RelayFieldInput
        v-else
        :field="field"
        :model-value="valueFor(field)"
        :disabled="disabled"
        :error="validationErrors[field.key]"
        @update:model-value="updateValue(field, $event)" />
    </template>
  </view>
</template>

<style scoped lang="scss">
  .dynamic-form {
    width: 100%;
  }
</style>
