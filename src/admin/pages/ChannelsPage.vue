<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Alert, Button, Card, CheckTag, Field, Textarea } from '@/components/ui';
import { useSettings } from '../useSettings';
import { diskTypeMap } from '@/utils/diskTypes';

const { settings, saving, error, notice, load, save } = useSettings();

// 与后端 util.LinkTypes 一致
const CLOUD_TYPES = ['baidu', 'quark', 'aliyun', 'guangya', 'tianyi', 'uc', 'mobile', '115', 'pikpak', 'xunlei', '123', 'magnet', 'ed2k', 'others'];

const defaultChannelsText = ref('');
const allowedChannelsText = ref('');
const cloudTypes = ref<Set<string>>(new Set());

const cloudTypeName = (t: string) => (t === 'others' ? '其他' : diskTypeMap[t] || t);

// 支持换行、逗号、空格分隔，也兼容粘贴 t.me 链接或 @频道名
const parseChannels = (text: string) =>
  text
    .split(/[\s,，]+/)
    .map((s) => s.trim().replace(/^https?:\/\/t\.me\/(s\/)?/i, '').replace(/^@/, ''))
    .filter(Boolean);

const fill = () => {
  if (!settings.value) return;
  defaultChannelsText.value = settings.value.default_channels.join('\n');
  allowedChannelsText.value = settings.value.allowed_channels.join('\n');
  cloudTypes.value = new Set(settings.value.allowed_cloud_types);
};

const setCloudType = (t: string, checked: boolean) => {
  const next = new Set(cloudTypes.value);
  if (checked) {
    next.add(t);
  } else {
    next.delete(t);
  }
  cloudTypes.value = next;
};

const submit = async () => {
  const ok = await save({
    default_channels: parseChannels(defaultChannelsText.value),
    allowed_channels: parseChannels(allowedChannelsText.value),
    allowed_cloud_types: CLOUD_TYPES.filter((t) => cloudTypes.value.has(t))
  });
  if (ok) fill();
};

onMounted(async () => {
  await load();
  fill();
});
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <div>
        <div class="admin-page-title">频道与网盘类型</div>
        <div class="admin-page-desc">
          控制 TG 频道搜索范围与客户可见的网盘类型，保存后立即生效。
          <span v-if="settings?.updated_by">上次由 {{ settings.updated_by }} 修改于 {{ new Date(settings.updated_at || '').toLocaleString() }}</span>
        </div>
      </div>
      <Button :loading="saving" :disabled="!settings" @click="submit">保存</Button>
    </div>

    <Alert v-if="error" tone="error">{{ error }}</Alert>
    <Alert v-if="notice" tone="success">{{ notice }}</Alert>

    <div class="grid gap-4 md:grid-cols-2">
      <Card padding="sm">
        <Field
          label="默认频道"
          help="客户未选择频道时搜索这些频道。每行一个频道用户名。"
        >
          <Textarea v-model="defaultChannelsText" :rows="12" monospace />
        </Field>
        <div class="admin-page-desc">共 {{ parseChannels(defaultChannelsText).length }} 个</div>
      </Card>
      <Card padding="sm">
        <Field
          label="客户可选频道"
          help="客户在「筛选」页能勾选的频道范围。留空表示与默认频道相同。"
        >
          <Textarea v-model="allowedChannelsText" :rows="12" monospace />
        </Field>
        <div class="admin-page-desc">共 {{ parseChannels(allowedChannelsText).length }} 个</div>
      </Card>
    </div>

    <Card padding="sm" title="客户可见的网盘类型" description="不勾选任何类型表示不限制。客户请求中范围外的类型会被服务端剔除。">
      <div class="admin-check-grid">
        <CheckTag
          v-for="t in CLOUD_TYPES"
          :key="t"
          :model-value="cloudTypes.has(t)"
          @update:model-value="setCloudType(t, $event)"
        >
          {{ cloudTypeName(t) }}
        </CheckTag>
      </div>
    </Card>
  </div>
</template>
