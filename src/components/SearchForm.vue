<script setup lang="ts">
import { ref } from 'vue';
import type { SearchParams } from '@/api';
import type { HealthStatus } from '@/api';
import type { FilterConfig } from '@/types';
import { Badge, Button, Field, Input, Icons, Pressable } from '@/components/ui';
import FilterIcon from '@/components/icons/FilterIcon.vue';

const keyword = ref('');
const loading = ref(false);
const showAdvanced = ref(false);
const includeKeywords = ref('');
const excludeKeywords = ref('');

const quickTags = ['4K电影', '经典美剧', '动漫新番', '无损音乐', '夸克合集', '纪录片'];

const applyQuickTag = (tag: string) => {
  keyword.value = tag;
  handleSearch();
};

const addPresetKeyword = (target: 'include' | 'exclude', word: string) => {
  if (target === 'include') {
    const list = includeKeywords.value.split(/[,\s]+/).map(w => w.trim()).filter(Boolean);
    if (!list.includes(word)) {
      list.push(word);
      includeKeywords.value = list.join(' ');
    }
  } else {
    const list = excludeKeywords.value.split(/[,\s]+/).map(w => w.trim()).filter(Boolean);
    if (!list.includes(word)) {
      list.push(word);
      excludeKeywords.value = list.join(' ');
    }
  }
};

// 接收后端健康状态作为 props
const props = defineProps<{
  backendHealth: HealthStatus | null;
}>();

const emit = defineEmits<{
  (e: 'search', params: SearchParams): void;
  (e: 'searchComplete'): void;
}>();

// 从配置中加载用户设置和后端默认配置
const loadUserConfig = () => {
  try {
    const savedChannels = localStorage.getItem('pansou_channels');
    const savedPlugins = localStorage.getItem('pansou_plugins');
    const savedDiskTypes = localStorage.getItem('pansou_disk_types');
    
    // 如果用户已手动设置，使用用户设置
    if (savedChannels !== null || savedPlugins !== null) {
      return {
        channels: savedChannels ? JSON.parse(savedChannels) : [],
        plugins: savedPlugins ? JSON.parse(savedPlugins) : [],
        cloudTypes: savedDiskTypes ? JSON.parse(savedDiskTypes) : undefined
      };
    }
    
    // 如果用户未设置，使用传入的后端配置
    if (props.backendHealth) {
      return {
        channels: props.backendHealth.channels || [],
        plugins: props.backendHealth.plugins || [],
        cloudTypes: savedDiskTypes ? JSON.parse(savedDiskTypes) : undefined
      };
    }
    
    return {
      channels: [],
      plugins: [],
      cloudTypes: undefined
    };
  } catch (err) {
    console.error('加载配置失败:', err);
    return {
      channels: [],
      plugins: [],
      cloudTypes: undefined
    };
  }
};

const handleSearch = () => {
  if (!keyword.value.trim()) {
    return;
  }
  
  loading.value = true;
  
  // 加载配置（用户设置或后端默认缓存）
  const userConfig = loadUserConfig();
  
  // 判断有哪些数据源
  const hasChannels = userConfig.channels && userConfig.channels.length > 0;
  const hasPlugins = userConfig.plugins && userConfig.plugins.length > 0;
  
  // 根据搜索逻辑决定第一次搜索的src参数：
  // 1. 如果同时启用了tg和plugin，第一次只搜索tg
  // 2. 如果只启用了tg，搜索tg
  // 3. 如果只启用了plugin，搜索plugin
  // 4. 如果都没有，使用all（兜底）
  let src: 'all' | 'tg' | 'plugin' = 'all';
  if (hasChannels && hasPlugins) {
    src = 'tg';  // 同时启用，第一次只搜索tg（快速）
  } else if (hasChannels && !hasPlugins) {
    src = 'tg';  // 只启用tg
  } else if (!hasChannels && hasPlugins) {
    src = 'plugin';  // 只启用plugin
  }
  
  const params: SearchParams = {
    kw: keyword.value,
    res: 'merge',
    src: src
  };
  
  // 添加用户配置的参数
  if (hasChannels) {
    // 将频道数组转为逗号分隔的字符串
    (params as any).channels = userConfig.channels.join(',');
  }
  
  if (hasPlugins) {
    params.plugins = userConfig.plugins.join(',');
  }
  
  if (userConfig.cloudTypes && userConfig.cloudTypes.length > 0) {
    // 将网盘类型数组转为逗号分隔的字符串
    (params as any).cloud_types = userConfig.cloudTypes.join(',');
  }
  
  // 添加过滤配置（使用后端filter参数格式）
  const filterConfig: FilterConfig = {};
  if (includeKeywords.value.trim()) {
    filterConfig.include = includeKeywords.value.split(/[,\s]+/).filter(k => k.trim());
  }
  if (excludeKeywords.value.trim()) {
    filterConfig.exclude = excludeKeywords.value.split(/[,\s]+/).filter(k => k.trim());
  }
  if (filterConfig.include || filterConfig.exclude) {
    (params as any).filter = JSON.stringify(filterConfig);
  }
  
  emit('search', params);
  
  // 2秒后重置loading状态
  setTimeout(() => {
    loading.value = false;
    // 不再触发searchComplete事件
  }, 2000);
};
</script>

<template>
  <div class="w-full max-w-content mx-auto">
    <div class="search-container">
      <!-- 主搜索框：左侧高级筛选开关，右侧提交 -->
      <Input
        v-model="keyword"
        class="search-box"
        align="center"
        size="lg"
        placeholder="搜索资源、电影、音乐、软件..."
        :disabled="loading"
        @enter="handleSearch"
      >
        <template #prefix>
          <Button
            variant="ghost"
            size="sm"
            icon
            :class="[
              'advanced-toggle',
              showAdvanced && 'active',
              (includeKeywords.trim() || excludeKeywords.trim()) && 'has-filter'
            ]"
            title="高级筛选"
            aria-label="高级筛选"
            :aria-expanded="showAdvanced"
            @click="showAdvanced = !showAdvanced"
          >
            <FilterIcon :size="16" />
          </Button>
        </template>
        <template #suffix>
          <Button
            variant="ghost"
            size="sm"
            icon
            title="搜索"
            aria-label="搜索"
            :disabled="loading || !keyword.trim()"
            @click="handleSearch"
          >
            <component
              :is="loading ? Icons.Loading() : Icons.Send()"
              :class="['w-4 h-4', loading && 'animate-spin']"
            />
          </Button>
        </template>
      </Input>

      <!-- 推荐热门标签 -->
      <div v-if="!showAdvanced" class="quick-tags-bar">
        <span class="quick-tags-label">推荐:</span>
        <div class="quick-tags-list">
          <Pressable
            v-for="tag in quickTags"
            :key="tag"
            class="quick-tag-pill"
            :disabled="loading"
            @click="applyQuickTag(tag)"
          >
            {{ tag }}
          </Pressable>
        </div>
      </div>

      <!-- 高级选项面板 -->
      <Transition name="slide-down">
        <div v-if="showAdvanced" class="advanced-panel">
          <div class="advanced-content">
            <Field label="包含关键词">
              <template #extra>结果中至少包含一个关键词 (OR关系)，多个关键词用空格或英文逗号(,)分隔</template>
              <Input v-model="includeKeywords" placeholder="高码 hdr 4k" @enter="handleSearch" />
              <div class="preset-words-row">
                <span class="preset-words-label">常用推荐:</span>
                <Pressable
                  v-for="word in ['4K', 'HDR', '1080P', '合集', '完结']"
                  :key="word"
                  class="preset-chip"
                  @click="addPresetKeyword('include', word)"
                >
                  + {{ word }}
                </Pressable>
              </div>
              <div v-if="includeKeywords.trim()" class="filter-preview mt-2">
                <span class="preview-label">包含:</span>
                <Badge
                  v-for="(word, index) in includeKeywords.split(/[,\s]+/).filter(w => w.trim())"
                  :key="index"
                  tone="success"
                >
                  {{ word }}
                </Badge>
              </div>
            </Field>

            <Field label="排除关键词">
              <template #extra>结果中包含任意一个关键词就排除 (OR关系)，多个关键词用空格或英文逗号(,)分隔</template>
              <Input v-model="excludeKeywords" placeholder="预告 花絮 枪版 CAM TS" @enter="handleSearch" />
              <div class="preset-words-row">
                <span class="preset-words-label">常用过滤:</span>
                <Pressable
                  v-for="word in ['预告', '花絮', '枪版', 'CAM', 'TS']"
                  :key="word"
                  class="preset-chip preset-chip-danger"
                  @click="addPresetKeyword('exclude', word)"
                >
                  + {{ word }}
                </Pressable>
              </div>
              <div v-if="excludeKeywords.trim()" class="filter-preview mt-2">
                <span class="preview-label">排除:</span>
                <Badge
                  v-for="(word, index) in excludeKeywords.split(/[,\s]+/).filter(w => w.trim())"
                  :key="index"
                  tone="danger"
                >
                  {{ word }}
                </Badge>
              </div>
            </Field>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.search-box :deep(.ui-input__prefix) {
  padding-left: 0.25rem;
}

/* 高级筛选开关：展开时高亮，有生效条件时右上角显示圆点 */
.advanced-toggle {
  position: relative;
  color: hsl(var(--muted-foreground));
}

.advanced-toggle.active,
.advanced-toggle.has-filter {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
}

.advanced-toggle.has-filter::after {
  content: '';
  position: absolute;
  top: 3px;
  right: 3px;
  width: 7px;
  height: 7px;
  background: hsl(var(--primary));
  border-radius: 50%;
  border: 2px solid hsl(var(--background));
}

/* 高级选项面板 */
.advanced-panel {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.advanced-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 推荐标签栏 */
.quick-tags-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0 0.5rem;
}

.quick-tags-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  user-select: none;
}

.quick-tags-list {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-tag-pill {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border) / 0.8);
  border-radius: 9999px;
  padding: 0.15rem 0.55rem;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.quick-tag-pill:hover:not(:disabled) {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.25);
  transform: translateY(-1px);
}

.quick-tag-pill:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 常用预设词按钮 */
.preset-words-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  margin-top: 0.375rem;
}

.preset-words-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.preset-chip {
  font-size: 0.6875rem;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.4);
  border: 1px dashed hsl(var(--border));
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-chip:hover {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.5);
  background: hsl(var(--primary) / 0.08);
}

.preset-chip-danger:hover {
  color: hsl(var(--destructive));
  border-color: hsl(var(--destructive) / 0.5);
  background: hsl(var(--destructive) / 0.08);
}

.preview-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .advanced-panel {
    padding: 0.75rem;
  }
}
</style>
