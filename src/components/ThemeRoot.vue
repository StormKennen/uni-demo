<template>
  <!-- #ifdef WEB -->
  <block />
  <!-- #endif -->
  <!-- #ifdef MP-WEIXIN -->
  <block />
  <!-- #endif -->
</template>

<script setup lang="ts">
  import { useThemeOnPage } from '@/hooks/useTheme'

  useThemeOnPage()
</script>
