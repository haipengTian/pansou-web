<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Alert, Card, Table } from '@/components/ui';
import { getRuntime, errorMessage, type RuntimeInfo } from '@/api/admin';

// 运行参数来自环境变量，修改需编辑部署的 .env 并重启容器。
const LABELS: Record<string, string> = {
  port: '服务端口',
  proxy_configured: '已配置代理',
  cache_enabled: '缓存',
  cache_max_size_mb: '缓存上限 (MB)',
  cache_ttl_minutes: '缓存有效期 (分钟)',
  plugin_system_enabled: '插件系统',
  plugin_timeout_seconds: '插件超时 (秒)',
  async_response_timeout: '同步响应窗口 (秒)',
  async_max_background_workers: '后台工作者上限',
  async_max_background_tasks: '后台任务上限',
  async_cache_ttl_hours: '异步缓存有效期 (小时)',
  outbound_max_concurrency: '出口并发上限',
  default_concurrency: '默认并发数',
  auth_enabled: '客户需登录',
  auth_token_expiry_hours: '登录有效期 (小时)',
  insecure_skip_tls_verify: '跳过上游证书校验',
  tg_backfill_enabled: 'TG 后台补齐',
  plugin_backfill_enabled: '插件后台补齐',
  http_max_conns: 'HTTP 最大连接数',
  settings_seeded_from_env: '本次启动由环境变量生成设置',
  stats_enabled: '访问统计',
  stats_db_size_bytes: '统计数据库大小',
  stats_dropped_events: '统计丢弃事件数（队列满）'
};

const COLUMNS = [
  { key: 'label', title: '参数', width: '40%' },
  { key: 'value', title: '值' }
];

const runtime = ref<RuntimeInfo | null>(null);
const error = ref('');

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const display = (v: string | number | boolean, key?: string) => {
  if (key === 'stats_db_size_bytes' && typeof v === 'number') return formatBytes(v);
  return typeof v === 'boolean' ? (v ? '是' : '否') : String(v);
};

const rows = computed(() =>
  Object.entries(runtime.value || {}).map(([key, value]) => ({ key, label: LABELS[key] || key, value: display(value, key) }))
);

onMounted(async () => {
  try {
    runtime.value = await getRuntime();
  } catch (err) {
    error.value = errorMessage(err, '获取运行参数失败');
  }
});
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <div>
        <div class="admin-page-title">运行参数</div>
        <div class="admin-page-desc">只读。这些参数来自部署的环境变量，修改需编辑 deploy/.env 并执行 ./update.sh。</div>
      </div>
    </div>
    <Alert v-if="error" tone="error">{{ error }}</Alert>
    <Card v-if="runtime" padding="sm">
      <Table :columns="COLUMNS" :data="rows" row-key="key" />
    </Card>
  </div>
</template>
