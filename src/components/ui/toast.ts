import { discrete } from './discrete';

// 轻提示（基于 naive message），替代 window.alert。无需在页面放置任何容器。

const DEFAULT_DURATION_MS = 2500;

export const toast = {
  success: (message: string, duration = DEFAULT_DURATION_MS) => {
    discrete().message.success(message, { duration });
  },
  error: (message: string, duration = 4000) => {
    discrete().message.error(message, { duration });
  },
  warning: (message: string, duration = DEFAULT_DURATION_MS) => {
    discrete().message.warning(message, { duration });
  },
  info: (message: string, duration = DEFAULT_DURATION_MS) => {
    discrete().message.info(message, { duration });
  }
};
