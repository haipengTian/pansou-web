import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Modal from '../Modal.vue';
import Table from '../Table.vue';
import Tabs from '../Tabs.vue';
import Link from '../Link.vue';
import { confirmDialog, promptDialog } from '../dialog';
import { toast, toastState } from '../toast';

const flush = async () => {
  await nextTick();
  await nextTick();
};

afterEach(() => {
  document.body.innerHTML = '';
  document.body.style.overflow = '';
});

describe('Modal', () => {
  it('打开时渲染到 body 并锁定滚动，关闭后恢复', async () => {
    const wrapper = mount(Modal, { props: { open: true, title: '标题' }, slots: { default: '内容' }, attachTo: document.body });
    await flush();
    expect(document.body.textContent).toContain('内容');
    expect(document.body.style.overflow).toBe('hidden');

    await wrapper.setProps({ open: false });
    await flush();
    expect(document.body.style.overflow).toBe('');
    wrapper.unmount();
  });

  it('Esc 与关闭按钮触发 update:open=false', async () => {
    const wrapper = mount(Modal, { props: { open: true, title: 't' }, attachTo: document.body });
    await flush();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    (document.querySelector('.ui-modal__close') as HTMLButtonElement).click();
    expect(wrapper.emitted('update:open')).toEqual([[false], [false]]);
    wrapper.unmount();
  });

  it('closable=false 时 Esc 不关闭', async () => {
    const wrapper = mount(Modal, { props: { open: true, closable: false }, attachTo: document.body });
    await flush();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper.emitted('update:open')).toBeUndefined();
    wrapper.unmount();
  });
});

describe('Table', () => {
  const columns = [
    { key: 'name', title: '名称' },
    { key: 'role', title: '角色' }
  ];

  it('按列渲染数据，支持单元格插槽', () => {
    const wrapper = mount(Table, {
      props: { columns, data: [{ name: 'alice', role: 'user' }] },
      slots: { 'cell-role': '<template #cell-role="{ value }">[{{ value }}]</template>' }
    });
    const cells = wrapper.findAll('tbody td').map((td) => td.text());
    expect(cells).toEqual(['alice', '[user]']);
  });

  it('无数据时显示空状态', () => {
    const wrapper = mount(Table, { props: { columns, data: [], emptyText: '没有账号' } });
    expect(wrapper.find('.ui-table__empty').text()).toBe('没有账号');
  });
});

describe('Tabs', () => {
  it('点击切换并回传 v-model，显示计数', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'a', tabs: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b', count: 3 }] }
    });
    expect(wrapper.text()).toContain('3');
    await wrapper.findAll('[role="tab"]')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b']);
  });

  it('禁用的标签不可切换', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'a', tabs: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: true }] }
    });
    await wrapper.findAll('[role="tab"]')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});

describe('Link', () => {
  it('外部链接在新窗口打开并切断 opener', () => {
    const wrapper = mount(Link, { props: { href: 'https://example.com', external: true } });
    expect(wrapper.attributes('target')).toBe('_blank');
    expect(wrapper.attributes('rel')).toBe('noopener noreferrer');
  });

  it('站内链接不加 target', () => {
    const wrapper = mount(Link, { props: { href: '/' } });
    expect(wrapper.attributes('target')).toBeUndefined();
  });
});

describe('dialog 服务', () => {
  const clickButton = (text: string) => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === text);
    if (!button) throw new Error(`找不到按钮 ${text}`);
    button.click();
  };

  it('confirmDialog 确认返回 true，取消返回 false', async () => {
    const accepted = confirmDialog({ title: '确认？', confirmText: '好的' });
    await flush();
    expect(document.body.textContent).toContain('确认？');
    clickButton('好的');
    await expect(accepted).resolves.toBe(true);

    const rejected = confirmDialog({ title: '再确认？' });
    await flush();
    clickButton('取消');
    await expect(rejected).resolves.toBe(false);
  });

  it('promptDialog 返回输入内容，取消返回 null', async () => {
    const pending = promptDialog({ title: '新密码', type: 'password' });
    await flush();
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
    input.value = 'secret-123';
    input.dispatchEvent(new Event('input'));
    await flush();
    clickButton('确定');
    await expect(pending).resolves.toBe('secret-123');

    const cancelled = promptDialog({ title: '再来' });
    await flush();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await expect(cancelled).resolves.toBeNull();
  });
});

describe('toast 服务', () => {
  it('显示消息并按时长自动消失', async () => {
    vi.useFakeTimers();
    try {
      toast.success('已保存', 1000);
      await flush();
      expect(toastState.items.map((i) => i.message)).toContain('已保存');
      expect(document.body.textContent).toContain('已保存');
      vi.advanceTimersByTime(1000);
      expect(toastState.items.map((i) => i.message)).not.toContain('已保存');
    } finally {
      vi.useRealTimers();
    }
  });
});
