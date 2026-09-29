<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AccountCenter from '@/components/AccountCenter.vue';
import QQPDManager from '@/components/QQPDManager.vue';
import GyingManager from '@/components/GyingManager.vue';
import PanlianManager from '@/components/PanlianManager.vue';
import WeiboManager from '@/components/WeiboManager.vue';
import WoniuManager from '@/components/WoniuManager.vue';
import type { HealthStatus } from '@/api';
import { getAdminHealth, errorMessage } from '@/api/admin';

// 数据源账号（qqpd、gying 等）是全站共用的搜索来源，只在后台管理。
type Service = 'qqpd' | 'gying' | 'panlian' | 'weibo' | 'woniu';

const health = ref<HealthStatus | null>(null);
const error = ref('');
const current = ref<Service | null>(null);

const hasAnyService = computed(() => {
  const plugins = health.value?.plugins || [];
  return ['qqpd', 'gying', 'panlian', 'weibo', 'woniu'].some((name) => plugins.includes(name));
});

onMounted(async () => {
  try {
    health.value = await getAdminHealth();
  } catch (err) {
    error.value = errorMessage(err, '获取插件状态失败');
  }
});
</script>

<template>
  <div class="admin-page">
    <div v-if="error" class="admin-notice error">{{ error }}</div>
    <div v-else-if="health && !hasAnyService" class="admin-notice info">
      当前没有启用需要账号的插件（qqpd、gying、panlian、weibo、woniu）。请先在「插件管理」中启用。
    </div>

    <template v-if="health && hasAnyService">
      <AccountCenter v-if="!current" :backend-health="health" @navigate="current = $event" />
      <QQPDManager v-else-if="current === 'qqpd'" @back-to-center="current = null" />
      <GyingManager v-else-if="current === 'gying'" @back-to-center="current = null" />
      <PanlianManager v-else-if="current === 'panlian'" @back-to-center="current = null" />
      <WeiboManager v-else-if="current === 'weibo'" @back-to-center="current = null" />
      <WoniuManager v-else-if="current === 'woniu'" @back-to-center="current = null" />
    </template>
  </div>
</template>
