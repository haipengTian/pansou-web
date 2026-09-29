<script setup lang="ts">
import { NAlert } from 'naive-ui';

// 提示条（基于 NAlert）
withDefaults(defineProps<{ tone?: 'info' | 'success' | 'warning' | 'error'; title?: string }>(), { tone: 'info' });
</script>

<template>
  <NAlert class="ui-alert" :type="tone" :title="title" :show-icon="true">
    <slot />
  </NAlert>
</template>
