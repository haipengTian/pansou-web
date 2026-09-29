<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Button, Checkbox, CheckTag, Modal, RadioGroup } from '@/components/ui';
import type { ExportField, ExportFormat, ExportSettings } from '@/types';
import { getDiskTypeName } from '@/utils/diskTypes';

const props = defineProps<{
  visible: boolean;
  total: number;
  settings: ExportSettings;
  availableDiskTypes: string[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:settings', value: ExportSettings): void;
  (e: 'confirm'): void;
}>();

const fieldOptions: Array<{ value: ExportField; label: string }> = [
  { value: 'sequence', label: '序号' },
  { value: 'title', label: '标题' },
  { value: 'source', label: '来源' },
  { value: 'datetime', label: '时间' }
];

const formatOptions: Array<{ value: ExportFormat; label: string }> = [
  { value: 'json', label: 'JSON' },
  { value: 'txt', label: 'TXT' }
];

const localSettings = ref<ExportSettings>({
  format: 'json',
  fields: ['title', 'source', 'datetime'],
  prettyJson: true,
  includeFieldLabels: true,
  selectedDiskTypes: [],
  allDiskTypesSelected: true
});

const allDiskTypesSelected = computed(() => localSettings.value.allDiskTypesSelected);

const syncFromProps = () => {
  const selectedDiskTypes = props.settings.allDiskTypesSelected
    ? [...props.availableDiskTypes]
    : [...props.settings.selectedDiskTypes];

  localSettings.value = {
    ...props.settings,
    fields: [...props.settings.fields],
    selectedDiskTypes
  };
};

watch(() => [props.settings, props.availableDiskTypes], syncFromProps, { immediate: true, deep: true });

const emitSettingsUpdate = () => {
  emit('update:settings', {
    ...localSettings.value,
    fields: [...localSettings.value.fields]
  });
};

const setFormat = (format: ExportFormat) => {
  localSettings.value.format = format;
  emitSettingsUpdate();
};

const toggleField = (field: ExportField) => {
  const fields = localSettings.value.fields;
  const exists = fields.includes(field);

  if (exists) {
    localSettings.value.fields = fields.filter(item => item !== field);
    emitSettingsUpdate();
    return;
  }

  localSettings.value.fields = [...fields, field];
  emitSettingsUpdate();
};

const selectRecommendedFields = () => {
  localSettings.value.fields = ['title', 'source', 'datetime'];
  emitSettingsUpdate();
};

const selectMinimalFields = () => {
  localSettings.value.fields = ['title'];
  emitSettingsUpdate();
};

const togglePrettyJson = () => {
  if (localSettings.value.format !== 'json') return;
  localSettings.value.prettyJson = !localSettings.value.prettyJson;
  emitSettingsUpdate();
};

const toggleIncludeFieldLabels = () => {
  if (localSettings.value.format !== 'txt') return;
  localSettings.value.includeFieldLabels = !localSettings.value.includeFieldLabels;
  emitSettingsUpdate();
};

const toggleDiskType = (diskType: string) => {
  const selected = [...localSettings.value.selectedDiskTypes];
  const exists = selected.includes(diskType);

  localSettings.value.selectedDiskTypes = exists
    ? selected.filter(item => item !== diskType)
    : [...selected, diskType];
  localSettings.value.allDiskTypesSelected = false;

  emitSettingsUpdate();
};

const toggleAllDiskTypes = () => {
  if (allDiskTypesSelected.value) {
    localSettings.value.selectedDiskTypes = [];
    localSettings.value.allDiskTypesSelected = false;
  } else {
    localSettings.value.selectedDiskTypes = [...props.availableDiskTypes];
    localSettings.value.allDiskTypesSelected = true;
  }

  emitSettingsUpdate();
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<template>
  <Modal
    :open="visible"
    title="导出搜索结果"
    :description="`共 ${total} 条结果`"
    size="lg"
    @close="emit('close')"
  >
    <div class="export-body">
      <section class="export-section">
        <h3 class="section-title">导出格式</h3>
        <RadioGroup
          :model-value="localSettings.format"
          :options="formatOptions"
          size="sm"
          aria-label="导出格式"
          @update:model-value="setFormat"
        />
      </section>

      <section class="export-section">
        <div class="section-head">
          <h3 class="section-title">网盘类型</h3>
          <Checkbox :model-value="allDiskTypesSelected" @update:model-value="toggleAllDiskTypes">全选</Checkbox>
        </div>
        <div class="disktype-grid">
          <CheckTag
            v-for="diskType in props.availableDiskTypes"
            :key="diskType"
            size="sm"
            :model-value="localSettings.selectedDiskTypes.includes(diskType)"
            @update:model-value="toggleDiskType(diskType)"
          >
            {{ getDiskTypeName(diskType) }}
          </CheckTag>
        </div>
      </section>

      <section class="export-section">
        <h3 class="section-title">字段选择</h3>
        <div class="inline-group">
          <Checkbox
            v-for="option in fieldOptions"
            :key="option.value"
            :model-value="localSettings.fields.includes(option.value)"
            @update:model-value="toggleField(option.value)"
          >
            {{ option.label }}
          </Checkbox>
        </div>
      </section>

      <section class="export-section">
        <h3 class="section-title">导出选项</h3>
        <Checkbox
          v-if="localSettings.format === 'json'"
          :model-value="localSettings.prettyJson"
          @update:model-value="togglePrettyJson"
        >
          JSON 美化缩进
        </Checkbox>
        <Checkbox
          v-else
          :model-value="localSettings.includeFieldLabels"
          @update:model-value="toggleIncludeFieldLabels"
        >
          TXT 显示字段名
        </Checkbox>
      </section>
    </div>

    <template #footer>
      <Button variant="outline" @click="emit('close')">取消</Button>
      <Button @click="handleConfirm">导出 {{ localSettings.format.toUpperCase() }}</Button>
    </template>
  </Modal>
</template>

<style scoped>
.export-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.export-section {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.disktype-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
  gap: 0.5rem;
}

.inline-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
}
</style>
