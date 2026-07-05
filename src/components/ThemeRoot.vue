<template>
  <!-- #ifdef MP-WEIXIN -->
  <page-meta :page-style="themeStore.pageStyle" />
  <!-- #endif -->
  <!-- #ifdef WEB -->
  <block />
  <!-- #endif -->
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'

  const themeStore = useThemeStore()
</script>
