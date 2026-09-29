<script setup lang="ts">
import { computed } from 'vue';
import { NTag } from 'naive-ui';
import type { Tone } from './types';

// 状态徽标（基于 NTag）
const props = withDefaults(defineProps<{ tone?: Tone; size?: 'sm' | 'default'; solid?: boolean }>(), {
  tone: 'default',
  size: 'default',
  solid: false
});

const TYPES = { default: 'default', primary: 'info', success: 'success', warning: 'warning', danger: 'error' } as const;
const type = computed(() => TYPES[props.tone]);
</script>

<template>
  <NTag
    class="ui-badge"
    :type="type"
    :size="size === 'sm' ? 'tiny' : 'small'"
    :bordered="!solid"
    :strong="solid"
    round
  >
    <slot />
  </NTag>
</template>
