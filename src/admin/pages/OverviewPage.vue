<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import LivenessPanel from '@/components/LivenessPanel.vue';
import { Alert, Badge, Card } from '@/components/ui';
import { getAdminHealth, errorMessage, type AdminHealth } from '@/api/admin';

const health = ref<AdminHealth | null>(null);
const error = ref('');

const tgReachable = computed(() => {
  const tg = health.value?.tg as { reachable?: boolean } | undefined;
  if (!tg || typeof tg.reachable !== 'boolean') return null;
  return tg.reachable;
});

onMounted(async () => {
  try {
    health.value = await getAdminHealth();
  } catch (err) {
    error.value = errorMessage(err, '获取运行状态失败');
  }
});
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <div>
        <div class="admin-page-title">概览</div>
        <div class="admin-page-desc">服务运行状态与插件、频道的存活观测</div>
      </div>
    </div>

    <Alert v-if="error" tone="error">{{ error }}</Alert>

    <div v-if="health" class="admin-grid">
      <Card padding="sm">
        <div class="admin-stat-label">服务状态</div>
        <div class="admin-stat-value">{{ health.status === 'ok' ? '正常' : health.status }}</div>
      </Card>
      <Card padding="sm">
        <div class="admin-stat-label">启用插件</div>
        <div class="admin-stat-value">{{ health.plugins_enabled ? (health.plugin_count ?? 0) : '已关闭' }}</div>
      </Card>
      <Card padding="sm">
        <div class="admin-stat-label">默认频道</div>
        <div class="admin-stat-value">{{ health.channels_count }}</div>
      </Card>
      <Card padding="sm">
        <div class="admin-stat-label">Telegram 可达</div>
        <div class="admin-stat-value">
          <span v-if="tgReachable === null">未知</span>
          <Badge v-else-if="tgReachable" tone="success">可达</Badge>
          <Badge v-else tone="danger">不可达</Badge>
        </div>
      </Card>
      <Card padding="sm">
        <div class="admin-stat-label">客户登录</div>
        <div class="admin-stat-value">{{ health.auth_enabled ? '需要' : '不需要' }}</div>
      </Card>
    </div>

    <LivenessPanel />
  </div>
</template>
