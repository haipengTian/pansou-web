import { h, ref } from 'vue';
import { NInput } from 'naive-ui';
import { discrete } from './discrete';

// 页面内的确认框 / 输入框（基于 naive dialog），替代 window.confirm / window.prompt。
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

// confirmDialog 返回用户是否确认；关闭、Esc、点遮罩都视为取消。
export const confirmDialog = (options: DialogOptions): Promise<boolean> =>
  new Promise((resolve) => {
    discrete().dialog.create({
      type: options.danger ? 'error' : 'info',
      showIcon: !!options.danger,
      title: options.title,
      content: options.message,
      positiveText: options.confirmText || '确定',
      negativeText: options.cancelText || '取消',
      autoFocus: true,
      onPositiveClick: () => resolve(true),
      onNegativeClick: () => resolve(false),
      onClose: () => resolve(false),
      onMaskClick: () => resolve(false),
      onEsc: () => resolve(false),
      onAfterLeave: () => resolve(false)
    });
  });

// promptDialog 返回输入内容；取消时返回 null。输入框内回车等同于确定。
export const promptDialog = (
  options: DialogOptions & { type?: 'text' | 'password'; placeholder?: string; defaultValue?: string }
): Promise<string | null> =>
  new Promise((resolve) => {
    const value = ref(options.defaultValue ?? '');
    let settled = false;
    const finish = (result: string | null) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const instance = discrete().dialog.create({
      showIcon: false,
      title: options.title,
      content: () =>
        h('div', { class: 'ui-prompt' }, [
          options.message ? h('div', { style: 'margin-bottom: 0.75rem; white-space: pre-line;' }, options.message) : null,
          h(NInput, {
            value: value.value,
            type: options.type === 'password' ? 'password' : 'text',
            showPasswordOn: options.type === 'password' ? 'click' : undefined,
            placeholder: options.placeholder,
            autofocus: true,
            'onUpdate:value': (v: string) => {
              value.value = v;
            },
            onKeydown: (e: KeyboardEvent) => {
              if (e.key === 'Enter' && !e.isComposing) {
                finish(value.value);
                instance.destroy();
              }
            }
          })
        ]),
      positiveText: options.confirmText || '确定',
      negativeText: options.cancelText || '取消',
      onPositiveClick: () => finish(value.value),
      onNegativeClick: () => finish(null),
      onClose: () => finish(null),
      onMaskClick: () => finish(null),
      onEsc: () => finish(null),
      onAfterLeave: () => finish(null)
    });
  });
