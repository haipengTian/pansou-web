<script setup lang="ts">
import { ref, watch } from 'vue';
import Badge from './Badge.vue';
import type { TabItem } from './types';

// 标签页。支持 v-model；tabs[].count 显示计数徽标。默认插槽拿到 { activeTab }。
interface Props {
  tabs: TabItem[];
  defaultValue?: string;
  modelValue?: string;
  variant?: 'pills' | 'underline';
  block?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: '',
  variant: 'pills',
  block: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const activeTab = ref(props.modelValue || props.defaultValue || props.tabs[0]?.value || '');

const setActiveTab = (tab: TabItem) => {
  if (tab.disabled || tab.value === activeTab.value) return;
  activeTab.value = tab.value;
  emit('update:modelValue', tab.value);
  emit('change', tab.value);
};

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) activeTab.value = value;
  }
);
</script>

<template>
  <div class="ui-tabs">
    <div class="ui-tabs__list" :class="[`ui-tabs__list--${variant}`, { 'ui-tabs__list--block': block }]" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        class="ui-tabs__trigger"
        :class="{ 'is-active': activeTab === tab.value }"
        :aria-selected="activeTab === tab.value"
        :disabled="tab.disabled"
        :data-state="activeTab === tab.value ? 'active' : 'inactive'"
        @click="setActiveTab(tab)"
      >
        <component :is="tab.icon" v-if="tab.icon" class="ui-tabs__icon" />
        <span>{{ tab.label }}</span>
        <Badge v-if="tab.count !== undefined" size="sm" :tone="activeTab === tab.value ? 'primary' : 'default'">
          {{ tab.count }}
        </Badge>
      </button>
    </div>
    <div v-if="$slots.default" class="ui-tabs__content">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>

<style scoped>
.ui-tabs__list {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.ui-tabs__list::-webkit-scrollbar { display: none; }
.ui-tabs__list--block { display: flex; width: 100%; }
.ui-tabs__list--block .ui-tabs__trigger { flex: 1; }

.ui-tabs__list--pills {
  padding: 0.25rem;
  border-radius: calc(var(--radius, 0.5rem));
  background: hsl(var(--muted));
}

.ui-tabs__list--underline {
  gap: 1rem;
  border-bottom: 1px solid hsl(var(--border));
}

.ui-tabs__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  white-space: nowrap;
  border: none;
  background: transparent;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s, box-shadow 0.15s;
}

.ui-tabs__trigger:disabled { opacity: 0.5; cursor: not-allowed; }

.ui-tabs__trigger:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.ui-tabs__list--pills .ui-tabs__trigger {
  padding: 0.375rem 0.75rem;
  border-radius: calc(var(--radius, 0.5rem) - 2px);
}

.ui-tabs__list--pills .ui-tabs__trigger.is-active {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}

.ui-tabs__list--underline .ui-tabs__trigger {
  padding: 0.5rem 0.125rem;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
}

.ui-tabs__list--underline .ui-tabs__trigger.is-active {
  color: hsl(var(--primary));
  border-bottom-color: hsl(var(--primary));
}

.ui-tabs__icon { width: 1rem; height: 1rem; }
.ui-tabs__content { margin-top: 1rem; }
</style>
