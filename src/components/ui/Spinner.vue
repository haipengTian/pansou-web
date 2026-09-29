<script setup lang="ts">
// 加载指示器
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' });
</script>

<template>
  <svg
    class="ui-spinner"
    :class="`ui-spinner--${size}`"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    role="status"
    aria-label="加载中"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
</template>

<style scoped>
.ui-spinner {
  animation: ui-spin 0.8s linear infinite;
  flex-shrink: 0;
}
.ui-spinner--sm { width: 0.875rem; height: 0.875rem; }
.ui-spinner--md { width: 1.25rem; height: 1.25rem; }
.ui-spinner--lg { width: 2rem; height: 2rem; }

@keyframes ui-spin {
  to { transform: rotate(360deg); }
}
</style>
