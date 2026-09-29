<script setup lang="ts" generic="Row extends Record<string, unknown>">
import { computed, useSlots, type VNodeChild } from 'vue';
import { NDataTable, NEmpty, type DataTableColumns } from 'naive-ui';
import type { TableColumn } from './types';

// 表格（基于 NDataTable）。单元格可用 #cell-<key>="{ row, value, index }" 插槽自定义；
// maxHeight 设置后表体滚动并启用虚拟滚动，适合大数据量。
const props = withDefaults(
  defineProps<{
    columns: TableColumn[];
    data: Row[];
    rowKey?: keyof Row | ((row: Row, index: number) => string | number);
    emptyText?: string;
    maxHeight?: number;
    loading?: boolean;
  }>(),
  { emptyText: '暂无数据', loading: false }
);

const slots = useSlots();

const naiveColumns = computed<DataTableColumns<Row>>(() =>
  props.columns.map((col) => ({
    key: col.key,
    title: col.title,
    width: col.width,
    align: col.align,
    className: col.nowrap ? 'ui-table-col--nowrap' : undefined,
    fixed: col.fixed,
    render: (row: Row, index: number): VNodeChild => {
      const slot = slots[`cell-${col.key}`];
      if (slot) return slot({ row, value: row[col.key], index });
      const value = row[col.key];
      return value === undefined || value === null ? '' : String(value);
    }
  }))
);

// 有固定列时需要开启横向滚动，宽度按内容自适应
const scrollX = computed(() => (props.columns.some((col) => col.fixed) ? 'max-content' : undefined));

const keyOf = (row: Row): string | number => {
  if (typeof props.rowKey === 'function') return props.rowKey(row, props.data.indexOf(row));
  if (props.rowKey) return String(row[props.rowKey]);
  return props.data.indexOf(row);
};
</script>

<template>
  <NDataTable
    class="ui-table"
    :columns="naiveColumns"
    :data="data"
    :row-key="keyOf"
    :bordered="false"
    :single-line="true"
    :loading="loading"
    :max-height="maxHeight"
    :scroll-x="scrollX"
    :virtual-scroll="!!maxHeight && data.length > 100"
    size="small"
  >
    <template #empty><NEmpty :description="emptyText" /></template>
  </NDataTable>
</template>

<style scoped>
/* naive 的单元格默认 word-break: break-word，窄列会被压成一字一行；改回按词换行，表头不换行 */
.ui-table :deep(.n-data-table-th),
.ui-table :deep(.n-data-table-td) {
  word-break: normal;
  overflow-wrap: normal;
}

.ui-table :deep(.n-data-table-th),
.ui-table :deep(.ui-table-col--nowrap) {
  white-space: nowrap;
}
</style>
