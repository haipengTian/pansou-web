<script setup lang="ts">
// 表单行：标签 + 控件 + 说明/错误。
defineProps<{ label?: string; help?: string; error?: string; required?: boolean }>();
</script>

<template>
  <div class="ui-field">
    <div v-if="label || $slots.label" class="ui-field__label">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="ui-field__required">*</span>
      <span v-if="$slots.extra" class="ui-field__extra"><slot name="extra" /></span>
    </div>
    <slot />
    <div v-if="error" class="ui-field__error">{{ error }}</div>
    <div v-else-if="help || $slots.help" class="ui-field__help"><slot name="help">{{ help }}</slot></div>
  </div>
</template>

<style scoped>
.ui-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.ui-field__label {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.ui-field__required { color: hsl(var(--destructive)); }

.ui-field__extra {
  font-weight: 400;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.ui-field__help {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.ui-field__error {
  font-size: 0.75rem;
  color: hsl(var(--destructive));
}
</style>
