<script setup lang="ts">
// 链接。external 时在新窗口打开并切断 opener，防止目标页面反向控制本页。
withDefaults(defineProps<{ href: string; external?: boolean; tone?: 'primary' | 'muted' | 'inherit'; underline?: boolean }>(), {
  external: false,
  tone: 'primary',
  underline: false
});
</script>

<template>
  <a
    class="ui-link"
    :class="[`ui-link--${tone}`, { 'ui-link--underline': underline }]"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
</template>

<style scoped>
.ui-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s, opacity 0.15s;
}

.ui-link:hover { text-decoration: underline; }
.ui-link--underline { text-decoration: underline; }

.ui-link--primary { color: hsl(var(--primary)); }
.ui-link--muted { color: hsl(var(--muted-foreground)); }
.ui-link--muted:hover { color: hsl(var(--foreground)); }
.ui-link--inherit { color: inherit; }

.ui-link:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
