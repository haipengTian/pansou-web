<script setup lang="ts">
import { computed } from 'vue';
import Button from './Button.vue';
import Select from './Select.vue';

// 分页：v-model:page 与 v-model:pageSize。修改每页条数时回到第 1 页。
const props = withDefaults(
  defineProps<{ page: number; pageSize: number; total: number; pageSizes?: number[] }>(),
  { pageSizes: () => [20, 50, 100] }
);

const emit = defineEmits<{ 'update:page': [value: number]; 'update:pageSize': [value: number] }>();

const pageCount = computed(() => Math.max(0, Math.ceil(props.total / props.pageSize)));
const sizeOptions = computed(() => props.pageSizes.map((size) => ({ label: `${size} 条/页`, value: size })));

const go = (page: number) => {
  if (page < 1 || page > pageCount.value || page === props.page) return;
  emit('update:page', page);
};

const changeSize = (size: number) => {
  emit('update:pageSize', size);
  emit('update:page', 1);
};
</script>

<template>
  <div class="ui-pagination">
    <span class="ui-pagination__total">共 {{ total }} 条</span>
    <div class="ui-pagination__controls">
      <Select
        class="ui-pagination__size"
        size="sm"
        :model-value="pageSize"
        :options="sizeOptions"
        @update:model-value="changeSize"
      />
      <Button variant="outline" size="sm" :disabled="page <= 1" aria-label="上一页" @click="go(page - 1)">上一页</Button>
      <span class="ui-pagination__current">{{ pageCount === 0 ? 0 : page }} / {{ pageCount }}</span>
      <Button variant="outline" size="sm" :disabled="page >= pageCount" aria-label="下一页" @click="go(page + 1)">下一页</Button>
    </div>
  </div>
</template>

<style scoped>
.ui-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.ui-pagination__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ui-pagination__size {
  width: 7.5rem;
}

.ui-pagination__current {
  min-width: 3.5rem;
  text-align: center;
  color: hsl(var(--foreground));
}
</style>
