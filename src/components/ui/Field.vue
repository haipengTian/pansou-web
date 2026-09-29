<script setup lang="ts">
import { NFormItem } from 'naive-ui';

// 表单行（基于 NFormItem）：标签 + 控件 + 说明/错误。
defineProps<{ label?: string; help?: string; error?: string; required?: boolean }>();
</script>

<template>
  <NFormItem
    class="ui-field"
    label-placement="top"
    :show-label="!!(label || $slots.label)"
    :show-require-mark="required"
    :show-feedback="!!(error || help || $slots.help)"
    :validation-status="error ? 'error' : undefined"
  >
    <template #label>
      <slot name="label">{{ label }}</slot>
      <span v-if="$slots.extra" class="ui-field__extra"><slot name="extra" /></span>
    </template>
    <slot />
    <template #feedback>
      <span v-if="error">{{ error }}</span>
      <slot v-else name="help">{{ help }}</slot>
    </template>
  </NFormItem>
</template>

<style scoped>
.ui-field {
  min-width: 0;
}

.ui-field__extra {
  margin-left: 0.25rem;
  font-weight: 400;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}
</style>
