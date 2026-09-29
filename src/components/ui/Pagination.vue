<script setup lang="ts">
import { NPagination } from 'naive-ui';

// 分页（基于 NPagination）：v-model:page 与 v-model:pageSize。修改每页条数时回到第 1 页。
withDefaults(defineProps<{ page: number; pageSize: number; total: number; pageSizes?: number[] }>(), {
  pageSizes: () => [20, 50, 100]
});

const emit = defineEmits<{ 'update:page': [value: number]; 'update:pageSize': [value: number] }>();

const changeSize = (size: number) => {
  emit('update:pageSize', size);
  emit('update:page', 1);
};
</script>

<template>
  <div class="ui-pagination">
    <span class="ui-pagination__total">共 {{ total }} 条</span>
    <NPagination
      :page="page"
      :page-size="pageSize"
      :item-count="total"
      :page-sizes="pageSizes"
      show-size-picker
      size="small"
      @update:page="emit('update:page', $event)"
      @update:page-size="changeSize"
    />
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
</style>
