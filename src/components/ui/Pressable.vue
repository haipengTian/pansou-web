<script setup lang="ts">
// 无外观的可点击区域：提供按钮语义、键盘可达与统一的焦点环，外观由使用方决定。
// 用于列表标题、长链接预览、提取码标签等需要自定义排版、不适合套用 Button 尺寸的场景。
withDefaults(defineProps<{ disabled?: boolean; block?: boolean }>(), { disabled: false, block: false });

const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <button
    type="button"
    class="ui-pressable"
    :class="{ 'ui-pressable--block': block }"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.ui-pressable {
  appearance: none;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: inherit;
  cursor: pointer;
}

.ui-pressable--block {
  display: block;
  width: 100%;
  min-width: 0;
  text-align: left;
}

.ui-pressable:disabled { cursor: not-allowed; opacity: 0.5; }

.ui-pressable:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 0.25rem;
}
</style>
