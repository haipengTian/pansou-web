<script setup lang="ts" generic="Row extends Record<string, unknown>">
import type { TableColumn } from './types';

// 表格。单元格可用 #cell-<key>="{ row, value, index }" 插槽自定义。
const props = withDefaults(
  defineProps<{
    columns: TableColumn[];
    data: Row[];
    rowKey?: keyof Row | ((row: Row, index: number) => string | number);
    emptyText?: string;
    showHeader?: boolean;
  }>(),
  { emptyText: '暂无数据', showHeader: true }
);

const keyOf = (row: Row, index: number) => {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index);
  if (props.rowKey) return String(row[props.rowKey]);
  return index;
};
</script>

<template>
  <div class="ui-table-wrap">
    <table class="ui-table">
      <colgroup>
        <col v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : undefined" />
      </colgroup>
      <thead v-if="showHeader">
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">{{ col.title }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="keyOf(row, index)">
          <td v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="index">
              {{ row[col.key] ?? '' }}
            </slot>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td class="ui-table__empty" :colspan="columns.length">{{ emptyText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.ui-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.ui-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.ui-table th,
.ui-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid hsl(var(--border));
  vertical-align: middle;
}

.ui-table th {
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}

.ui-table tbody tr:hover td { background: hsl(var(--muted) / 0.5); }
.ui-table tbody tr:last-child td { border-bottom: none; }

.ui-table__empty {
  padding: 2rem 0.75rem !important;
  text-align: center !important;
  color: hsl(var(--muted-foreground));
}
</style>
