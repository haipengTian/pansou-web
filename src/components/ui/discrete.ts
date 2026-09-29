import { createDiscreteApi, zhCN, dateZhCN } from 'naive-ui';
import { buildThemeOverrides } from './theme';

// naive 的消息与对话框需要 Provider；toast/confirmDialog 在组件外调用，
// 所以用 createDiscreteApi 单独挂载一份，首次使用时才创建，主题与页面一致。
let api: ReturnType<typeof createDiscreteApi> | null = null;

export const discrete = () => {
  if (!api) {
    api = createDiscreteApi(['message', 'dialog'], {
      configProviderProps: {
        themeOverrides: buildThemeOverrides(),
        locale: zhCN,
        dateLocale: dateZhCN,
        preflightStyleDisabled: true
      },
      messageProviderProps: { max: 4 }
    });
  }
  return api;
};
