<script setup lang="ts">
import { computed } from 'vue';

// 纯 SVG 柱状图：用于按天、按小时的趋势。颜色取设计变量，悬停显示数值（<title>）。
export interface BarDatum {
  label: string;
  value: number;
}

const props = withDefaults(
  defineProps<{
    data: BarDatum[];
    height?: number;
    // 每隔多少根柱显示一个横轴标签，避免拥挤；0 表示自动
    labelEvery?: number;
    unit?: string;
  }>(),
  { height: 160, labelEvery: 0, unit: '' }
);

const WIDTH = 600;
const PAD_TOP = 16;
const PAD_BOTTOM = 22;
const GAP_RATIO = 0.25;

const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)));
const plotHeight = computed(() => props.height - PAD_TOP - PAD_BOTTOM);
const slot = computed(() => (props.data.length ? WIDTH / props.data.length : WIDTH));
const every = computed(() => props.labelEvery || Math.max(1, Math.ceil(props.data.length / 10)));

const bars = computed(() =>
  props.data.map((d, i) => {
    // 非零值至少 1px，让"有但很少"的数据可见
    const h = d.value > 0 ? Math.max(1, (d.value / max.value) * plotHeight.value) : 0;
    const width = slot.value * (1 - GAP_RATIO);
    return {
      ...d,
      x: i * slot.value + (slot.value - width) / 2,
      y: PAD_TOP + plotHeight.value - h,
      width,
      height: h,
      showLabel: i % every.value === 0 || i === props.data.length - 1,
      labelX: i * slot.value + slot.value / 2
    };
  })
);
</script>

<template>
  <svg
    class="ui-bar-chart"
    :viewBox="`0 0 ${WIDTH} ${height}`"
    preserveAspectRatio="none"
    role="img"
    :aria-label="`柱状图，共 ${data.length} 项，最大值 ${max}`"
  >
    <line class="ui-bar-chart__axis" x1="0" :x2="WIDTH" :y1="PAD_TOP + plotHeight" :y2="PAD_TOP + plotHeight" />
    <g v-for="bar in bars" :key="bar.label">
      <rect class="ui-bar-chart__hit" :x="bar.x - (slot - bar.width) / 2" :y="PAD_TOP" :width="slot" :height="plotHeight">
        <title>{{ bar.label }}：{{ bar.value }}{{ unit }}</title>
      </rect>
      <rect class="ui-bar-chart__bar" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" rx="2">
        <title>{{ bar.label }}：{{ bar.value }}{{ unit }}</title>
      </rect>
      <text
        v-if="bar.showLabel"
        class="ui-bar-chart__label"
        :x="bar.labelX"
        :y="height - 6"
        text-anchor="middle"
      >
        {{ bar.label }}
      </text>
    </g>
  </svg>
</template>

<style scoped>
.ui-bar-chart {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.ui-bar-chart__axis {
  stroke: hsl(var(--border));
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.ui-bar-chart__bar {
  fill: hsl(var(--primary));
  transition: fill 0.15s;
}

.ui-bar-chart__hit {
  fill: transparent;
}

g:hover .ui-bar-chart__bar {
  fill: hsl(var(--primary) / 0.75);
}

.ui-bar-chart__label {
  fill: hsl(var(--muted-foreground));
  font-size: 11px;
}
</style>
