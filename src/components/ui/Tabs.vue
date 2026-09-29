<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NTab, NTabs } from 'naive-ui';
import Badge from './Badge.vue';
import type { TabItem } from './types';

// 标签页（基于 NTabs）。支持 v-model；tabs[].count 显示计数徽标。默认插槽拿到 { activeTab }。
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

const tabsKey = computed(() => props.tabs.map((t) => t.value).join('|'));

const activeTab = ref(props.modelValue || props.defaultValue || props.tabs[0]?.value || '');

const onUpdate = (value: string | number) => {
  const next = String(value);
  if (next === activeTab.value) return;
  activeTab.value = next;
  emit('update:modelValue', next);
  emit('change', next);
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
    <!-- 标签集合变化时重新挂载：naive 只在切换值时重算下划线位置，标签异步生成后会错位 -->
    <NTabs
      :key="tabsKey"
      :value="activeTab"
      :type="variant === 'underline' ? 'line' : 'segment'"
      :justify-content="block ? 'space-evenly' : undefined"
      size="medium"
      animated
      @update:value="onUpdate"
    >
      <NTab v-for="tab in tabs" :key="tab.value" :name="tab.value" :disabled="tab.disabled">
        <span class="ui-tabs__label">
          <component :is="tab.icon" v-if="tab.icon" class="ui-tabs__icon" />
          <span>{{ tab.label }}</span>
          <Badge v-if="tab.count !== undefined" size="sm" :tone="activeTab === tab.value ? 'primary' : 'default'">
            {{ tab.count }}
          </Badge>
        </span>
      </NTab>
    </NTabs>
    <div v-if="$slots.default" class="ui-tabs__content">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>

<style scoped>
.ui-tabs__label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
}

.ui-tabs__icon {
  width: 1rem;
  height: 1rem;
}

.ui-tabs__content {
  margin-top: 1rem;
}
</style>
