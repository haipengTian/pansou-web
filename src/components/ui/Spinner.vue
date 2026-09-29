<script setup lang="ts">
import { NSpin } from 'naive-ui';

// 加载指示器（基于 NSpin）
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' });

const SIZES = { sm: 'small', md: 'medium', lg: 'large' } as const;
</script>

<template>
  <NSpin class="ui-spinner" :size="SIZES[size]" role="status" aria-label="加载中" />
</template>
