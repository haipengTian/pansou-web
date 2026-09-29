<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Badge, Button, Card, CheckTag, Input } from '@/components/ui';
import { listPlugins, errorMessage, type AdminPlugin } from '@/api/admin';
import { useSettings } from '../useSettings';

const { settings, pluginSystemEnabled, saving, error, notice, load, save } = useSettings();

const plugins = ref<AdminPlugin[]>([]);
const selected = ref<Set<string>>(new Set());
const keyword = ref('');
const listError = ref('');

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return kw ? plugins.value.filter((p) => p.name.toLowerCase().includes(kw)) : plugins.value;
});

const dirty = computed(() => {
  const current = new Set(settings.value?.enabled_plugins || []);
  if (current.size !== selected.value.size) return true;
  for (const name of selected.value) {
    if (!current.has(name)) return true;
  }
  return false;
});

const refresh = async () => {
  listError.value = '';
  await load();
  try {
    plugins.value = (await listPlugins()).plugins;
  } catch (err) {
    listError.value = errorMessage(err, '加载插件列表失败');
  }
  selected.value = new Set(settings.value?.enabled_plugins || []);
};

const setChecked = (name: string, checked: boolean) => {
  const next = new Set(selected.value);
  if (checked) {
    next.add(name);
  } else {
    next.delete(name);
  }
  selected.value = next;
};

const selectAll = (checked: boolean) => {
  const next = new Set(selected.value);
  for (const p of filtered.value) {
    if (checked) {
      next.add(p.name);
    } else {
      next.delete(p.name);
    }
  }
  selected.value = next;
};

const submit = async () => {
  if (await save({ enabled_plugins: [...selected.value].sort() })) {
    await refresh();
  }
};

onMounted(refresh);
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <div>
        <div class="admin-page-title">插件管理</div>
        <div class="admin-page-desc">勾选要启用的搜索插件，保存后立即生效，无需重启。已选 {{ selected.size }} / {{ plugins.length }}</div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" :disabled="saving" @click="refresh">重新加载</Button>
        <Button :loading="saving" :disabled="!dirty" @click="submit">保存</Button>
      </div>
    </div>

    <div v-if="!pluginSystemEnabled" class="admin-notice info">
      插件系统已通过 ASYNC_PLUGIN_ENABLED=false 关闭，这里的修改会保存但不会生效。
    </div>
    <div v-if="error || listError" class="admin-notice error">{{ error || listError }}</div>
    <div v-if="notice" class="admin-notice success">{{ notice }}</div>

    <Card padding="sm">
      <div class="flex gap-2 mb-3 flex-wrap items-center">
        <Input v-model="keyword" size="sm" style="max-width: 16rem" placeholder="按名称过滤" />
        <Button variant="outline" size="sm" @click="selectAll(true)">全选当前</Button>
        <Button variant="outline" size="sm" @click="selectAll(false)">取消当前</Button>
      </div>
      <div class="admin-check-grid">
        <CheckTag
          v-for="p in filtered"
          :key="p.name"
          :model-value="selected.has(p.name)"
          @update:model-value="setChecked(p.name, $event)"
        >
          <span class="flex-1 truncate">{{ p.name }}</span>
          <Badge v-if="p.has_web_page" size="sm" title="该插件需要在「数据源账号」中配置账号">账号</Badge>
          <Badge v-if="p.enabled" size="sm" tone="success">运行中</Badge>
        </CheckTag>
      </div>
    </Card>
  </div>
</template>
