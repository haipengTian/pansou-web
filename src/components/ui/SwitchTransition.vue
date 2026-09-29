<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { directionOf, type SwitchDirection } from './motion';

// 视图切换动画：包在 v-if / v-else-if 链或带 key 的单个元素外面，先出后进。
// page：淡入并轻微上移，用于菜单页面切换；
// tab：标签页内容切换。传入当前标签序号 index 时按切换方向左右滑动（切到右侧标签，
//      旧内容向左滑出、新内容从右侧滑入），不传时淡入并轻微上移。
// 子节点必须是单个元素（不能是 <template> 片段或多根组件）。
//
// 先出后进时，旧视图离场后、新视图挂载前容器是空的，页面高度会先塌下去再撑开，
// 下方内容随之跳动。这里在离场前锁住容器当前高度，新视图进场结束后恢复。
const props = withDefaults(defineProps<{ variant?: 'page' | 'tab'; index?: number; appear?: boolean }>(), {
  variant: 'page',
  index: undefined,
  appear: false
});

const emit = defineEmits<{ 'after-enter': [el: Element] }>();

// 方向必须在本次渲染（旧内容开始离场）之前确定，所以用 pre 时机的 watch
const direction = ref<SwitchDirection | undefined>();
watch(
  () => props.index,
  (index, previous) => {
    direction.value = index === undefined || previous === undefined ? undefined : directionOf(index, previous);
  },
  { flush: 'pre' }
);

const transitionName = computed(() =>
  props.variant === 'tab' && direction.value ? `ui-switch-${direction.value}` : `ui-switch-${props.variant}`
);

// 离场后没有新视图进场（切换到空内容）时，到时自动解锁
const UNLOCK_FALLBACK_MS = 600;

const lockedHeights = new WeakMap<HTMLElement, string>();

const unlock = (container: HTMLElement) => {
  if (!lockedHeights.has(container)) return;
  container.style.minHeight = lockedHeights.get(container) ?? '';
  lockedHeights.delete(container);
};

const lockContainer = (el: Element) => {
  const container = el.parentElement;
  if (!container || lockedHeights.has(container)) return;
  lockedHeights.set(container, container.style.minHeight);
  container.style.minHeight = `${container.offsetHeight}px`;
  setTimeout(() => unlock(container), UNLOCK_FALLBACK_MS);
};

const unlockContainer = (el: Element) => {
  if (el.parentElement) unlock(el.parentElement);
};

// 进场结束：解锁高度，并通知外部（需要按最终位置测量布局的页面可在此重算）
const onAfterEnter = (el: Element) => {
  unlockContainer(el);
  emit('after-enter', el);
};
</script>

<template>
  <Transition
    :name="transitionName"
    mode="out-in"
    :appear="appear"
    @before-leave="lockContainer"
    @after-enter="onAfterEnter"
    @enter-cancelled="unlockContainer"
  >
    <slot />
  </Transition>
</template>

<!-- 动画类名加在插槽内容上，scoped 样式作用不到，这里用全局样式并以 ui-switch- 前缀避免冲突。
     标签页滑动距离与 motion.ts 的 SLIDE_DISTANCE 保持一致 -->
<style>
/* 菜单页面：淡入并轻微上移 */
.ui-switch-page-enter-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.ui-switch-page-leave-active {
  transition:
    opacity 0.12s ease-in,
    transform 0.12s ease-in;
}

.ui-switch-page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.ui-switch-page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 标签页（未传序号）：淡入并轻微上移 */
.ui-switch-tab-enter-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.ui-switch-tab-leave-active {
  transition: opacity 0.12s ease-in;
}

.ui-switch-tab-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.ui-switch-tab-leave-to {
  opacity: 0;
}

/* 标签页（传了序号）：按切换方向左右滑动 */
.ui-switch-forward-enter-active,
.ui-switch-backward-enter-active {
  transition:
    opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.ui-switch-forward-leave-active,
.ui-switch-backward-leave-active {
  transition:
    opacity 0.14s ease-in,
    transform 0.14s ease-in;
}

.ui-switch-forward-enter-from,
.ui-switch-backward-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.ui-switch-forward-leave-to,
.ui-switch-backward-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

@media (prefers-reduced-motion: reduce) {
  .ui-switch-page-enter-active,
  .ui-switch-page-leave-active,
  .ui-switch-tab-enter-active,
  .ui-switch-tab-leave-active,
  .ui-switch-forward-enter-active,
  .ui-switch-forward-leave-active,
  .ui-switch-backward-enter-active,
  .ui-switch-backward-leave-active {
    transition: opacity 0.08s linear;
  }

  .ui-switch-page-enter-from,
  .ui-switch-page-leave-to,
  .ui-switch-tab-enter-from,
  .ui-switch-forward-enter-from,
  .ui-switch-forward-leave-to,
  .ui-switch-backward-enter-from,
  .ui-switch-backward-leave-to {
    transform: none;
  }
}
</style>
