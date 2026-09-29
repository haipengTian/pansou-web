<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BarChart, Button, Card, Pressable, RadioGroup, Table } from '@/components/ui';
import { getStatsOverview, errorMessage, type StatsOverview } from '@/api/admin';
import { formatDateTime, formatPercent, ROUTE_GROUP_LABELS, type HistoryDrill } from '../format';

// 点击关键词、用户或 IP 时跳到搜索历史并带上筛选条件
const emit = defineEmits<{ drill: [filter: HistoryDrill] }>();

const DAY_OPTIONS = [
  { label: '近 7 天', value: 7 },
  { label: '近 30 天', value: 30 },
  { label: '近 90 天', value: 90 }
];

const days = ref(30);
const overview = ref<StatsOverview | null>(null);
const loading = ref(false);
const error = ref('');

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    overview.value = await getStatsOverview(days.value);
  } catch (err) {
    error.value = errorMessage(err, '加载统计失败');
  } finally {
    loading.value = false;
  }
};

const changeDays = (value: number) => {
  days.value = value;
  load();
};

const dailyChart = computed(() =>
  (overview.value?.daily || []).map((d) => ({ label: d.day.slice(5), value: d.searches }))
);
const hourlyChart = computed(() =>
  (overview.value?.hourly || []).map((value, hour) => ({ label: `${hour}时`, value }))
);

const apiRows = computed(() =>
  (overview.value?.api || []).map((g) => ({
    ...g,
    label: ROUTE_GROUP_LABELS[g.group] || g.group,
    errorRate: g.requests ? formatPercent((g.errors_4xx + g.errors_5xx) / g.requests) : '—'
  }))
);

const KEYWORD_COLUMNS = [
  { key: 'keyword', title: '关键词' },
  { key: 'count', title: '次数', width: '4.5rem', align: 'right' as const },
  { key: 'users', title: '用户数', width: '4.5rem', align: 'right' as const }
];
const USER_COLUMNS = [
  { key: 'username', title: '用户' },
  { key: 'count', title: '次数', width: '4.5rem', align: 'right' as const },
  { key: 'last_at', title: '最近搜索', width: '11rem' }
];
const IP_COLUMNS = [
  { key: 'ip', title: 'IP' },
  { key: 'count', title: '次数', width: '4.5rem', align: 'right' as const },
  { key: 'users', title: '用户数', width: '4.5rem', align: 'right' as const },
  { key: 'last_at', title: '最近搜索', width: '11rem' }
];
const API_COLUMNS = [
  { key: 'label', title: '接口分组' },
  { key: 'requests', title: '请求数', align: 'right' as const },
  { key: 'errors_4xx', title: '4xx', align: 'right' as const },
  { key: 'errors_5xx', title: '5xx', align: 'right' as const },
  { key: 'errorRate', title: '错误率', align: 'right' as const },
  { key: 'avg_latency_ms', title: '平均耗时(ms)', align: 'right' as const }
];

const text = (v: unknown) => String(v ?? '');

onMounted(load);
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <div>
        <div class="admin-page-title">访问统计</div>
        <div class="admin-page-desc">基于搜索历史与接口访问记录。同一次搜索的预热与多轮补齐只计一次。</div>
      </div>
      <div class="flex gap-2 items-center">
        <RadioGroup :model-value="days" :options="DAY_OPTIONS" size="sm" aria-label="统计区间" @update:model-value="changeDays" />
        <Button variant="outline" size="sm" :loading="loading" @click="load">刷新</Button>
      </div>
    </div>

    <div v-if="error" class="admin-notice error">{{ error }}</div>

    <template v-if="overview">
      <div class="admin-grid">
        <Card padding="sm">
          <div class="admin-stat-label">今日搜索</div>
          <div class="admin-stat-value">{{ overview.today.searches }}</div>
        </Card>
        <Card padding="sm">
          <div class="admin-stat-label">今日活跃用户</div>
          <div class="admin-stat-value">{{ overview.today.users }}</div>
        </Card>
        <Card padding="sm">
          <div class="admin-stat-label">今日独立 IP</div>
          <div class="admin-stat-value">{{ overview.today.ips }}</div>
        </Card>
        <Card padding="sm">
          <div class="admin-stat-label">累计搜索</div>
          <div class="admin-stat-value">{{ overview.total.searches }}</div>
        </Card>
        <Card padding="sm">
          <div class="admin-stat-label">零结果率（{{ overview.days }} 天）</div>
          <div class="admin-stat-value">{{ formatPercent(overview.period.zero_rate) }}</div>
        </Card>
        <Card padding="sm">
          <div class="admin-stat-label">P95 首次耗时</div>
          <div class="admin-stat-value">{{ overview.period.p95_latency_ms }}<span class="stat-unit">ms</span></div>
        </Card>
        <Card padding="sm">
          <div class="admin-stat-label">搜索失败（{{ overview.days }} 天）</div>
          <div class="admin-stat-value">{{ overview.period.errors }}</div>
        </Card>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <Card padding="sm" :title="`每日搜索量（近 ${overview.days} 天）`">
          <BarChart :data="dailyChart" unit=" 次" />
        </Card>
        <Card padding="sm" title="今日按小时分布">
          <BarChart :data="hourlyChart" :label-every="3" unit=" 次" />
        </Card>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <Card padding="sm" title="热门关键词">
          <Table :columns="KEYWORD_COLUMNS" :data="overview.top_keywords" row-key="keyword" empty-text="暂无搜索">
            <template #cell-keyword="{ value }">
              <Pressable class="drill-link" @click="emit('drill', { keyword: text(value) })">{{ value }}</Pressable>
            </template>
          </Table>
        </Card>
        <Card padding="sm" title="零结果关键词" description="这些词搜不到任何资源，可据此补充频道或插件">
          <Table :columns="KEYWORD_COLUMNS" :data="overview.zero_keywords" row-key="keyword" empty-text="没有零结果的搜索">
            <template #cell-keyword="{ value }">
              <Pressable class="drill-link" @click="emit('drill', { keyword: text(value), zero_only: true })">{{ value }}</Pressable>
            </template>
          </Table>
        </Card>
        <Card padding="sm" title="活跃用户">
          <Table :columns="USER_COLUMNS" :data="overview.top_users" row-key="username" empty-text="暂无数据">
            <template #cell-username="{ value }">
              <Pressable class="drill-link" @click="emit('drill', { username: text(value) })">{{ value }}</Pressable>
            </template>
            <template #cell-last_at="{ value }">{{ formatDateTime(text(value)) }}</template>
          </Table>
        </Card>
        <Card padding="sm" title="活跃 IP">
          <Table :columns="IP_COLUMNS" :data="overview.top_ips" row-key="ip" empty-text="暂无数据">
            <template #cell-ip="{ value }">
              <Pressable class="drill-link mono" @click="emit('drill', { ip: text(value) })">{{ value }}</Pressable>
            </template>
            <template #cell-last_at="{ value }">{{ formatDateTime(text(value)) }}</template>
          </Table>
        </Card>
      </div>

      <Card padding="sm" :title="`接口访问（近 ${overview.days} 天）`">
        <Table :columns="API_COLUMNS" :data="apiRows" row-key="group" empty-text="暂无数据" />
      </Card>
    </template>
  </div>
</template>

<style scoped>
.stat-unit {
  margin-left: 0.125rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

.drill-link {
  color: hsl(var(--primary));
  text-align: left;
  word-break: break-all;
}

.drill-link:hover {
  text-decoration: underline;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  white-space: nowrap;
}
</style>
