import { createApp, reactive } from 'vue';
import ToastHost from './ToastHost.vue';

// 轻提示，替代 window.alert。首次调用时自动挂载承载组件，页面无需手动放置。

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

export const toastState = reactive<{ items: ToastItem[] }>({ items: [] });

const DEFAULT_DURATION_MS = 2500;
const MAX_VISIBLE = 4;
let nextId = 1;
let mounted = false;

const ensureHost = () => {
  if (mounted || typeof document === 'undefined') return;
  const host = document.createElement('div');
  document.body.appendChild(host);
  createApp(ToastHost).mount(host);
  mounted = true;
};

export const dismissToast = (id: number) => {
  const index = toastState.items.findIndex((item) => item.id === id);
  if (index >= 0) toastState.items.splice(index, 1);
};

const show = (tone: ToastTone, message: string, duration = DEFAULT_DURATION_MS) => {
  ensureHost();
  const id = nextId++;
  toastState.items.push({ id, tone, message });
  if (toastState.items.length > MAX_VISIBLE) toastState.items.shift();
  if (duration > 0) setTimeout(() => dismissToast(id), duration);
  return id;
};

export const toast = {
  success: (message: string, duration?: number) => show('success', message, duration),
  error: (message: string, duration?: number) => show('error', message, duration ?? 4000),
  warning: (message: string, duration?: number) => show('warning', message, duration),
  info: (message: string, duration?: number) => show('info', message, duration)
};
