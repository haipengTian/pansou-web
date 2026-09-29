<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { Badge, Button, Card, Checkbox, DateRangePicker, Field, Input, Pagination, Pressable, Select, SwitchTransition, Table, Tabs, toast } from '@/components/ui';
import {
  listSearchHistory,
  listLoginHistory,
  exportSearchHistory,
  errorMessage,
  type SearchRecord,
  type LoginRecord,
  type SearchHistoryQuery,
  type LoginHistoryQuery
} from '@/api/admin';
import { saveBlob } from '@/utils/download';
import { formatDateTime, LOGIN_REASON_LABELS, type HistoryDrill } from '../format';

// 从统计页跳转过来时带入的筛选条件
const props = defineProps<{ drill?: HistoryDrill | null }>();

const TABS = [
  { label: '搜索记录', value: 'searches' },
  { label: '登录记录', value: 'logins' }
];
const tab = ref('searches');

// ---------- 搜索记录 ----------
const emptySearchQuery = (): SearchHistoryQuery => ({ username: '', keyword: '', ip: '', from: '', to: '', zero_only: false });
const searchQuery = reactive<SearchHistoryQuery>(emptySearchQuery());
const searchPage = ref(1);
const searchPageSize = ref(20);
const searchTotal = ref(0);
const searchItems = ref<SearchRecord[]>([]);
const searchLoading = ref(false);
const exporting = ref(false);

const SEARCH_COLUMNS = [
  { key: 'created_at', title: '时间', width: '10.5rem' },
  { key: 'username', title: '用户' },
  { key: 'ip', title: 'IP' },
  { key: 'keyword', title: '关键词' },
  { key: 'result_total', title: '结果', align: 'right' as const },
  { key: 'request_count', title: '请求', align: 'right' as const },
  { key: 'latency_ms', title: '耗时(ms)', align: 'right' as const },
  { key: 'status', title: '状态' },
  { key: 'user_agent', title: 'User-Agent' }
];

const loadSearches = async () => {
  searchLoading.value = true;
  try {
    const page = await listSearchHistory({ ...searchQuery }, searchPage.value, searchPageSize.value);
    searchItems.value = page.items;
    searchTotal.value = page.total;
  } catch (err) {
    toast.error(errorMessage(err, '加载搜索记录失败'));
  } finally {
    searchLoading.value = false;
  }
};

const querySearches = () => {
  searchPage.value = 1;
  loadSearches();
};

const resetSearches = () => {
  Object.assign(searchQuery, emptySearchQuery());
  querySearches();
};

// 点击表格中的用户或 IP，直接作为筛选条件
const filterBy = (patch: Partial<SearchHistoryQuery>) => {
  Object.assign(searchQuery, patch);
  querySearches();
};

const exportCsv = async () => {
  exporting.value = true;
  try {
    const { blob, filename } = await exportSearchHistory({ ...searchQuery });
    saveBlob(blob, filename);
  } catch (err) {
    toast.error(errorMessage(err, '导出失败'));
  } finally {
    exporting.value = false;
  }
};

watch([searchPage, searchPageSize], loadSearches);

// ---------- 登录记录 ----------
const LOGIN_RESULT_OPTIONS = [
  { label: '全部', value: '' as const },
  { label: '成功', value: 'true' as const },
  { label: '失败', value: 'false' as const }
];
const emptyLoginQuery = (): LoginHistoryQuery => ({ username: '', ip: '', success: '', from: '', to: '' });
const loginQuery = reactive<LoginHistoryQuery>(emptyLoginQuery());
const loginPage = ref(1);
const loginPageSize = ref(20);
const loginTotal = ref(0);
const loginItems = ref<LoginRecord[]>([]);
const loginLoading = ref(false);

const LOGIN_COLUMNS = [
  { key: 'created_at', title: '时间', width: '10.5rem' },
  { key: 'username', title: '用户' },
  { key: 'ip', title: 'IP' },
  { key: 'success', title: '结果' },
  { key: 'reason', title: '原因' },
  { key: 'user_agent', title: 'User-Agent' }
];

const loadLogins = async () => {
  loginLoading.value = true;
  try {
    const page = await listLoginHistory({ ...loginQuery }, loginPage.value, loginPageSize.value);
    loginItems.value = page.items;
    loginTotal.value = page.total;
  } catch (err) {
    toast.error(errorMessage(err, '加载登录记录失败'));
  } finally {
    loginLoading.value = false;
  }
};

const queryLogins = () => {
  loginPage.value = 1;
  loadLogins();
};

const resetLogins = () => {
  Object.assign(loginQuery, emptyLoginQuery());
  queryLogins();
};

watch([loginPage, loginPageSize], loadLogins);

// 首次切到登录记录时再加载
let loginsLoaded = false;
watch(tab, (value) => {
  if (value === 'logins' && !loginsLoaded) {
    loginsLoaded = true;
    loadLogins();
  }
});

// 日期范围与查询条件中的 from/to 互相转换
const toRange = (q: { from?: string; to?: string }): [string, string] | null => (q.from && q.to ? [q.from, q.to] : null);
const setRange = (q: { from?: string; to?: string }, range: [string, string] | null) => {
  q.from = range?.[0] ?? '';
  q.to = range?.[1] ?? '';
};

const asSearch = (row: unknown) => row as SearchRecord;
const asLogin = (row: unknown) => row as LoginRecord;
const text = (v: unknown) => String(v ?? '');

const applyDrill = (drill?: HistoryDrill | null) => {
  if (!drill) return;
  tab.value = 'searches';
  Object.assign(searchQuery, emptySearchQuery(), drill);
};

watch(
  () => props.drill,
  (drill) => {
    applyDrill(drill);
    querySearches();
  }
);

onMounted(() => {
  applyDrill(props.drill);
  loadSearches();
});
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <div>
        <div class="admin-page-title">搜索历史</div>
        <div class="admin-page-desc">全部搜索与登录记录，含完整 IP 与 User-Agent，长期保留。</div>
      </div>
    </div>

    <Tabs v-model="tab" :tabs="TABS" />

    <SwitchTransition variant="tab" :index="TABS.findIndex((t) => t.value === tab)">
    <div v-if="tab === 'searches'" class="history-panel">
      <Card padding="sm">
        <form class="filter-grid" @submit.prevent="querySearches">
          <Field label="用户名"><Input v-model="searchQuery.username" size="sm" placeholder="精确匹配" /></Field>
          <Field label="关键词"><Input v-model="searchQuery.keyword" size="sm" placeholder="模糊匹配" /></Field>
          <Field label="IP"><Input v-model="searchQuery.ip" size="sm" placeholder="完整 IP" /></Field>
          <Field label="日期范围" class="filter-wide">
            <DateRangePicker
              size="sm"
              :model-value="toRange(searchQuery)"
              @update:model-value="setRange(searchQuery, $event)"
            />
          </Field>
          <div class="filter-actions">
            <Checkbox v-model="searchQuery.zero_only">仅零结果</Checkbox>
            <Button type="submit" size="sm" :loading="searchLoading">查询</Button>
            <Button variant="outline" size="sm" @click="resetSearches">重置</Button>
            <Button variant="outline" size="sm" :loading="exporting" @click="exportCsv">导出 CSV</Button>
          </div>
        </form>
      </Card>

      <Card padding="sm">
        <Table :columns="SEARCH_COLUMNS" :data="searchItems as unknown as Record<string, unknown>[]" row-key="id" empty-text="没有符合条件的搜索记录">
          <template #cell-created_at="{ value }">{{ formatDateTime(text(value)) }}</template>
          <template #cell-username="{ row }">
            <Pressable v-if="asSearch(row).username" class="drill-link" @click="filterBy({ username: asSearch(row).username })">
              {{ asSearch(row).username }}
            </Pressable>
            <span v-else class="muted">匿名</span>
            <Badge v-if="asSearch(row).role === 'admin'" size="sm" tone="primary">管理员</Badge>
          </template>
          <template #cell-ip="{ value }">
            <Pressable class="drill-link mono" @click="filterBy({ ip: text(value) })">{{ value }}</Pressable>
          </template>
          <template #cell-keyword="{ row }">
            <span class="keyword">{{ asSearch(row).keyword || '（空）' }}</span>
            <Badge v-if="asSearch(row).refresh" size="sm">强制刷新</Badge>
          </template>
          <template #cell-result_total="{ row }">
            <span :class="{ 'zero-result': asSearch(row).result_total === 0 && asSearch(row).status < 400 }">
              {{ asSearch(row).result_total }}
            </span>
          </template>
          <template #cell-status="{ row }">
            <Badge :tone="asSearch(row).status >= 400 ? 'danger' : 'success'" :title="asSearch(row).error || undefined">
              {{ asSearch(row).status }}
            </Badge>
          </template>
          <template #cell-user_agent="{ value }">
            <span class="ua" :title="text(value)">{{ value }}</span>
          </template>
        </Table>
        <Pagination
          v-model:page="searchPage"
          v-model:page-size="searchPageSize"
          class="mt-3"
          :total="searchTotal"
        />
      </Card>
    </div>

    <div v-else class="history-panel">
      <Card padding="sm">
        <form class="filter-grid" @submit.prevent="queryLogins">
          <Field label="用户名"><Input v-model="loginQuery.username" size="sm" placeholder="精确匹配" /></Field>
          <Field label="IP"><Input v-model="loginQuery.ip" size="sm" placeholder="完整 IP" /></Field>
          <Field label="结果"><Select v-model="loginQuery.success" size="sm" :options="LOGIN_RESULT_OPTIONS" /></Field>
          <Field label="日期范围" class="filter-wide">
            <DateRangePicker
              size="sm"
              :model-value="toRange(loginQuery)"
              @update:model-value="setRange(loginQuery, $event)"
            />
          </Field>
          <div class="filter-actions">
            <Button type="submit" size="sm" :loading="loginLoading">查询</Button>
            <Button variant="outline" size="sm" @click="resetLogins">重置</Button>
          </div>
        </form>
      </Card>

      <Card padding="sm">
        <Table :columns="LOGIN_COLUMNS" :data="loginItems as unknown as Record<string, unknown>[]" row-key="id" empty-text="没有符合条件的登录记录">
          <template #cell-created_at="{ value }">{{ formatDateTime(text(value)) }}</template>
          <template #cell-ip="{ value }"><span class="mono">{{ value }}</span></template>
          <template #cell-success="{ row }">
            <Badge :tone="asLogin(row).success ? 'success' : 'danger'">{{ asLogin(row).success ? '成功' : '失败' }}</Badge>
          </template>
          <template #cell-reason="{ value }">{{ value ? LOGIN_REASON_LABELS[text(value)] || value : '—' }}</template>
          <template #cell-user_agent="{ value }">
            <span class="ua" :title="text(value)">{{ value }}</span>
          </template>
        </Table>
        <Pagination
          v-model:page="loginPage"
          v-model:page-size="loginPageSize"
          class="mt-3"
          :total="loginTotal"
        />
      </Card>
    </div>
    </SwitchTransition>
  </div>
</template>

<style scoped>
/* 标签页内容：与 .admin-page 相同的纵向间距 */
.history-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.75rem;
  align-items: end;
}

.filter-wide {
  grid-column: span 2;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  grid-column: 1 / -1;
}

.drill-link {
  color: hsl(var(--primary));
  text-align: left;
  white-space: nowrap;
}

.drill-link:hover {
  text-decoration: underline;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.muted {
  color: hsl(var(--muted-foreground));
}

.keyword {
  word-break: break-all;
  margin-right: 0.25rem;
}

.zero-result {
  color: hsl(var(--destructive));
  font-weight: 600;
}

.ua {
  display: inline-block;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  color: hsl(var(--muted-foreground));
  font-size: 0.8125rem;
}
</style>
