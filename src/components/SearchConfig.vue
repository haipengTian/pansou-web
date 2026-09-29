<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { SearchOptions } from '@/api';
import type { DetectionSettings } from '@/types';
import { loadDetectionSettings, persistDetectionSettings } from '@/utils/linkDetection';
import { Button, Card, CheckTag, Switch, SwitchTransition, Tabs, confirmDialog, toast } from '@/components/ui';

// 客户侧的搜索筛选：只能在管理后台放开的范围内（/api/search/options）勾选频道、插件与网盘类型。
// 选择保存在本地，SearchForm/App 发起搜索时读取；服务端还会再按后台范围收敛一次。
const props = defineProps<{ options: SearchOptions }>();

const STORAGE_KEYS = {
  channels: 'pansou_channels',
  plugins: 'pansou_plugins',
  diskTypes: 'pansou_disk_types'
} as const;

// 网盘类型展示名，顺序即展示顺序
const DISK_TYPES = [
  { id: 'baidu', name: '百度' },
  { id: 'aliyun', name: '阿里' },
  { id: 'quark', name: '夸克' },
  { id: 'guangya', name: '光鸭' },
  { id: 'tianyi', name: '天翼' },
  { id: '115', name: '115' },
  { id: 'xunlei', name: '迅雷' },
  { id: 'uc', name: 'UC' },
  { id: 'mobile', name: '移动' },
  { id: 'pikpak', name: 'PikPak' },
  { id: '123', name: '123' },
  { id: 'magnet', name: '磁力' },
  { id: 'ed2k', name: '电驴' }
];

type TabKey = 'channels' | 'plugins' | 'diskTypes' | 'detection';

const availableChannels = computed(() => props.options.channels || []);
const availablePlugins = computed(() => props.options.plugins || []);
const availableDiskTypes = computed(() => {
  const allowed = props.options.cloud_types || [];
  return allowed.length ? DISK_TYPES.filter((d) => allowed.includes(d.id)) : DISK_TYPES;
});

const selectedChannels = ref<string[]>([]);
const selectedPlugins = ref<string[]>([]);
const selectedDiskTypes = ref<string[]>([]);
const detectionSettings = ref<DetectionSettings>(loadDetectionSettings());
const activeTab = ref<TabKey>('channels');

const tabs = computed(() => [
  { label: 'TG频道', value: 'channels', count: availableChannels.value.length },
  { label: '搜索插件', value: 'plugins', count: availablePlugins.value.length },
  { label: '网盘类型', value: 'diskTypes', count: availableDiskTypes.value.length },
  { label: '检测', value: 'detection', count: detectionSettings.value.enabled ? '已开启' : '已关闭' }
]);

const stats = computed(() => ({
  channels: selectedChannels.value.length,
  plugins: selectedPlugins.value.length,
  diskTypes: selectedDiskTypes.value.length
}));

// 读取本地保存的选择；未保存过时默认全选。丢弃已不在可选范围内的历史选择（后台可能已收窄范围）。
const readSelection = (key: string, available: string[]) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return [...available];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((item: unknown) => available.includes(String(item))) : [...available];
  } catch {
    return [...available];
  }
};

const loadConfig = () => {
  selectedChannels.value = readSelection(STORAGE_KEYS.channels, availableChannels.value);
  selectedPlugins.value = readSelection(STORAGE_KEYS.plugins, availablePlugins.value);
  selectedDiskTypes.value = readSelection(STORAGE_KEYS.diskTypes, availableDiskTypes.value.map((d) => d.id));
};

watch(() => props.options, loadConfig, { immediate: true });

const toggleIn = (list: string[], item: string, checked: boolean) =>
  checked ? (list.includes(item) ? list : [...list, item]) : list.filter((x) => x !== item);

const toggleAll = (current: string[], all: string[]) => (current.length === all.length ? [] : [...all]);

const saveConfig = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.channels, JSON.stringify(selectedChannels.value));
    localStorage.setItem(STORAGE_KEYS.plugins, JSON.stringify(selectedPlugins.value));
    localStorage.setItem(STORAGE_KEYS.diskTypes, JSON.stringify(selectedDiskTypes.value));
    persistDetectionSettings(detectionSettings.value);
    // 通知搜索结果区重新读取检测设置
    window.dispatchEvent(new CustomEvent('config:saved'));
    toast.success('筛选已保存');
  } catch (err) {
    console.error('保存筛选失败:', err);
    toast.error('保存失败，请重试');
  }
};

const resetToDefault = async () => {
  const ok = await confirmDialog({ title: '重置筛选', message: '将恢复为全部可选项并关闭链接检测。' });
  if (!ok) return;
  selectedChannels.value = [...availableChannels.value];
  selectedPlugins.value = [...availablePlugins.value];
  selectedDiskTypes.value = availableDiskTypes.value.map((d) => d.id);
  detectionSettings.value = { enabled: false };
  saveConfig();
};
</script>

<template>
  <div class="config-container">
    <div class="config-header">
      <div>
        <h1 class="config-title">搜索筛选</h1>
        <p class="config-subtitle">在可选范围内选择搜索来源和结果类型</p>
      </div>
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-label">频道</span>
          <span class="stat-value">{{ stats.channels }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">插件</span>
          <span class="stat-value">{{ stats.plugins }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">网盘</span>
          <span class="stat-value">{{ stats.diskTypes }}</span>
        </div>
      </div>
    </div>

    <Card padding="sm">
      <Tabs v-model="activeTab" :tabs="tabs" />

      <SwitchTransition variant="tab" :index="tabs.findIndex((t) => t.value === activeTab)">
      <div :key="activeTab" class="tab-pane">
        <template v-if="activeTab === 'channels'">
          <div class="pane-header">
            <span class="selected-count">已选 {{ selectedChannels.length }} / {{ availableChannels.length }}</span>
            <Button variant="outline" size="sm" @click="selectedChannels = toggleAll(selectedChannels, availableChannels)">
              {{ selectedChannels.length === availableChannels.length ? '取消全选' : '全选' }}
            </Button>
          </div>
          <div class="items-grid">
            <CheckTag
              v-for="channel in availableChannels"
              :key="channel"
              :model-value="selectedChannels.includes(channel)"
              @update:model-value="selectedChannels = toggleIn(selectedChannels, channel, $event)"
            >
              <span class="truncate">{{ channel }}</span>
            </CheckTag>
          </div>
        </template>

        <template v-else-if="activeTab === 'plugins'">
          <div class="pane-header">
            <span class="selected-count">已选 {{ selectedPlugins.length }} / {{ availablePlugins.length }}</span>
            <Button variant="outline" size="sm" @click="selectedPlugins = toggleAll(selectedPlugins, availablePlugins)">
              {{ selectedPlugins.length === availablePlugins.length ? '取消全选' : '全选' }}
            </Button>
          </div>
          <div class="items-grid">
            <CheckTag
              v-for="plugin in availablePlugins"
              :key="plugin"
              :model-value="selectedPlugins.includes(plugin)"
              @update:model-value="selectedPlugins = toggleIn(selectedPlugins, plugin, $event)"
            >
              <span class="truncate">{{ plugin }}</span>
            </CheckTag>
          </div>
        </template>

        <template v-else-if="activeTab === 'diskTypes'">
          <div class="pane-header">
            <span class="selected-count">已选 {{ selectedDiskTypes.length }} / {{ availableDiskTypes.length }}</span>
            <Button
              variant="outline"
              size="sm"
              @click="selectedDiskTypes = toggleAll(selectedDiskTypes, availableDiskTypes.map((d) => d.id))"
            >
              {{ selectedDiskTypes.length === availableDiskTypes.length ? '取消全选' : '全选' }}
            </Button>
          </div>
          <div class="items-grid">
            <CheckTag
              v-for="diskType in availableDiskTypes"
              :key="diskType.id"
              :model-value="selectedDiskTypes.includes(diskType.id)"
              @update:model-value="selectedDiskTypes = toggleIn(selectedDiskTypes, diskType.id, $event)"
            >
              {{ diskType.name }}
            </CheckTag>
          </div>
        </template>

        <div v-else class="detection-card">
          <div>
            <div class="detection-title">自动检测当前可见链接</div>
            <p class="detection-description">仅检测当前网盘标签页中屏幕可见的结果，减少性能消耗与风控风险。</p>
          </div>
          <Switch v-model="detectionSettings.enabled" aria-label="自动检测当前可见链接" />
        </div>
      </div>
      </SwitchTransition>

      <div class="action-bar">
        <Button variant="outline" @click="resetToDefault">重置默认</Button>
        <Button @click="saveConfig">保存筛选</Button>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.config-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 64rem;
  margin: 0 auto;
}

.config-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.config-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.config-subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.stats-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  background: hsl(var(--muted) / 0.6);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.stat-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: hsl(var(--primary));
}

.tab-pane {
  margin-top: 1rem;
  min-height: 12rem;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.selected-count {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.5rem;
}

.detection-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
}

.detection-title {
  font-weight: 600;
  font-size: 0.9375rem;
}

.detection-description {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
}

@media (max-width: 768px) {
  .stats-bar {
    width: 100%;
    justify-content: space-around;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}
</style>
