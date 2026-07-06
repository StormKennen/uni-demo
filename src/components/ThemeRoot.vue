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
  import { useThemeOnPage } from '@/hooks/useTheme'

  const themeStore = useThemeStore()
  useThemeOnPage()
</script>
