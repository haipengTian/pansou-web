<script setup lang="ts">
import { computed } from 'vue';
import type { MergedResults } from '@/types';
import { Button, Icons } from '@/components/ui';

const props = defineProps<{
  total: number;
  mergedResults: MergedResults;
  loading: boolean;
  searchTime?: number;
  isUpdating: boolean;
  updateCount: number;
  canExport: boolean;
}>();

// 计算网盘类型数量
const diskTypeCount = computed(() => {
  return Object.keys(props.mergedResults || {}).length;
});
</script>

<template>
  <div class="card">
    <div class="stats-layout">
      <div class="stats-metrics">
        <!-- 搜索结果总数 -->
        <div class="stats-chip stats-chip-primary">
          <component :is="Icons.Grid()" class="w-4 h-4 text-muted-foreground" />
          <span class="stats-label stats-label-desktop text-sm text-muted-foreground">搜索结果</span>
          <span class="stats-label stats-label-mobile text-sm text-muted-foreground">结果</span>
          <span class="font-semibold text-foreground">{{ total.toLocaleString() }}</span>
        </div>
        
        <!-- 网盘类型数量 -->
        <div class="stats-chip">
          <component :is="Icons.Folder()" class="w-4 h-4 text-muted-foreground" />
          <span class="stats-label stats-label-desktop text-sm text-muted-foreground">网盘类型</span>
          <span class="stats-label stats-label-mobile text-sm text-muted-foreground">类型</span>
          <span class="font-semibold text-foreground">{{ diskTypeCount }}</span>
        </div>
        
        <!-- 搜索耗时 -->
        <div v-if="searchTime" class="stats-chip stats-chip-time">
          <component :is="Icons.Clock()" class="w-4 h-4 text-muted-foreground" />
          <span class="stats-label stats-label-desktop text-sm text-muted-foreground">用时</span>
          <span class="stats-label stats-label-mobile text-sm text-muted-foreground">用时</span>
          <span class="font-semibold text-foreground">{{ searchTime }}ms</span>
        </div>
      </div>

      <div class="stats-actions">
        <Button
          v-if="canExport"
          variant="outline"
          size="sm"
          :disabled="loading"
          title="批量导出"
          aria-label="批量导出"
          class="action-button action-button-label"
          @click="$emit('export-results')"
        >
          <component :is="Icons.Download()" class="w-4 h-4 action-icon"/>
          <span class="action-label">批量导出</span>
        </Button>

        <!-- 强制刷新按钮 -->
        <Button
          variant="outline"
          size="sm"
          icon
          :disabled="loading"
          title="强制刷新"
          aria-label="强制刷新"
          class="action-button"
          @click="$emit('force-refresh')"
        >
          <component :is="Icons.Refresh()" class="w-4 h-4 action-icon"/>
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
}

.stats-metrics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  min-width: 0;
}

.stats-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  white-space: nowrap;
}

.stats-label-mobile {
  display: none;
}

.stats-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.625rem;
  flex-shrink: 0;
}

.action-button-label {
  gap: 0.5rem;
}

.action-label {
  white-space: nowrap;
}

.action-icon {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .stats-layout {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    gap: 0.75rem;
  }

  .stats-metrics {
    flex: 1 1 auto;
    min-width: 0;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 0.95rem;
    padding-right: 0.4rem;
  }

  .stats-chip {
    flex: 0 0 auto;
    min-width: 0;
    gap: 0.28rem;
    overflow: hidden;
    font-size: 0.75rem;
  }

  .stats-chip .font-semibold {
    min-width: 0;
    font-size: 0.75rem;
    line-height: 1;
  }

  .stats-chip :deep(svg),
  .stats-chip > :global(svg) {
    width: 0.9rem;
    height: 0.9rem;
  }

  .stats-label-desktop {
    display: none;
  }

  .stats-label-mobile {
    display: inline;
    font-size: 0.75rem;
    line-height: 1;
  }

  .stats-chip-primary {
    flex: 0 0 auto;
    min-width: auto;
  }

  .stats-actions {
    width: auto;
    justify-content: flex-end;
    gap: 0.45rem;
    flex-shrink: 0;
    margin-left: auto;
  }

  .action-button {
    width: 2rem;
    padding: 0;
  }

  .action-button-label {
    flex: 0 0 auto;
  }

  .action-label {
    display: none;
  }

  .action-icon {
    width: 0.95rem;
    height: 0.95rem;
  }
}
</style>
