import { createApp } from 'vue';
import DialogHost from './DialogHost.vue';

// 页面内的确认框 / 输入框，替代 window.confirm / window.prompt。
//
// 原生对话框会被部分内嵌浏览器（App 内 WebView、嵌入式浏览器面板）直接屏蔽，
// 调用立即返回 false / null 且不显示任何界面——用户看到的就是"点了没反应"。

export interface DialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

// 关闭动画结束后再卸载，避免对话框闪断。
const UNMOUNT_DELAY_MS = 200;

const openDialog = (
  options: DialogOptions & { input?: { type?: 'text' | 'password'; placeholder?: string; defaultValue?: string } }
): Promise<string | null> =>
  new Promise((resolve) => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const app = createApp(DialogHost, {
      ...options,
      onResolve: (value: string | null) => {
        resolve(value);
        setTimeout(() => {
          app.unmount();
          host.remove();
        }, UNMOUNT_DELAY_MS);
      }
    });
    app.mount(host);
  });

// confirmDialog 返回用户是否确认。
export const confirmDialog = async (options: DialogOptions): Promise<boolean> => (await openDialog(options)) !== null;

// promptDialog 返回输入内容；取消时返回 null。
export const promptDialog = (
  options: DialogOptions & { type?: 'text' | 'password'; placeholder?: string; defaultValue?: string }
): Promise<string | null> =>
  openDialog({
    ...options,
    input: { type: options.type, placeholder: options.placeholder, defaultValue: options.defaultValue }
  });
