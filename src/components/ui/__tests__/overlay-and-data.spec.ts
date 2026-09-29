import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Modal from '../Modal.vue';
import Table from '../Table.vue';
import Tabs from '../Tabs.vue';
import Link from '../Link.vue';
import { confirmDialog, promptDialog } from '../dialog';
import { toast } from '../toast';

// 弹层类组件渲染到 body，且带有进出场动画，这里统一等待一小段时间再断言。
const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

// 取最后一个匹配的按钮：上一个对话框可能还在离场动画中，新对话框排在其后。
const clickButton = (text: string) => {
  const button = [...document.querySelectorAll('button')].filter((b) => b.textContent?.trim() === text).at(-1);
  if (!button) throw new Error(`找不到按钮 ${text}`);
  button.click();
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Modal', () => {
  it('打开时把标题与内容渲染到 body', async () => {
    const wrapper = mount(Modal, { props: { open: true, title: '标题' }, slots: { default: '内容' }, attachTo: document.body });
    await settle();
    expect(document.body.textContent).toContain('标题');
    expect(document.body.textContent).toContain('内容');
    wrapper.unmount();
  });

  it('点击关闭按钮触发 update:open=false 与 close', async () => {
    const wrapper = mount(Modal, { props: { open: true, title: 't' }, attachTo: document.body });
    await settle();
    (document.querySelector('.n-base-close') as HTMLElement).click();
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
    expect(wrapper.emitted('close')).toHaveLength(1);
    wrapper.unmount();
  });

  it('closable=false 时没有关闭按钮', async () => {
    const wrapper = mount(Modal, { props: { open: true, title: 't', closable: false }, attachTo: document.body });
    await settle();
    expect(document.querySelector('.n-base-close')).toBeNull();
    wrapper.unmount();
  });

  it('footer 插槽渲染在底部', async () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 't' },
      slots: { footer: '<span class="footer-mark">底部</span>' },
      attachTo: document.body
    });
    await settle();
    expect(document.querySelector('.footer-mark')?.textContent).toBe('底部');
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
    expect(wrapper.text()).toContain('名称');
  });

  it('nowrap 列的表头与单元格不换行', () => {
    const wrapper = mount(Table, {
      props: { columns: [{ key: 'name', title: '名称', nowrap: true }, { key: 'role', title: '角色' }], data: [{ name: 'a', role: 'b' }] }
    });
    const [nameCell, roleCell] = wrapper.findAll('tbody td');
    expect(nameCell.classes()).toContain('ui-table-col--nowrap');
    expect(roleCell.classes()).not.toContain('ui-table-col--nowrap');
    expect(wrapper.find('thead th').classes()).toContain('ui-table-col--nowrap');
  });

  it('无数据时显示空状态文字', () => {
    const wrapper = mount(Table, { props: { columns, data: [], emptyText: '没有账号' } });
    expect(wrapper.text()).toContain('没有账号');
  });
});

describe('Tabs', () => {
  const tabs = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b', count: 3 },
    { label: 'C', value: 'c', disabled: true }
  ];

  it('点击切换并回传 v-model，显示计数', async () => {
    const wrapper = mount(Tabs, { props: { modelValue: 'a', tabs } });
    expect(wrapper.text()).toContain('3');
    await wrapper.find('.n-tabs-tab[data-name="b"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b']);
  });

  it('禁用的标签不可切换', async () => {
    const wrapper = mount(Tabs, { props: { modelValue: 'a', tabs } });
    await wrapper.find('.n-tabs-tab[data-name="c"]').trigger('click');
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
  it('confirmDialog 确认返回 true，取消返回 false', async () => {
    const accepted = confirmDialog({ title: '确认？', confirmText: '好的' });
    await settle();
    expect(document.body.textContent).toContain('确认？');
    clickButton('好的');
    await expect(accepted).resolves.toBe(true);

    const rejected = confirmDialog({ title: '再确认？' });
    await settle();
    clickButton('取消');
    await expect(rejected).resolves.toBe(false);
  });

  it('promptDialog 返回输入内容，取消返回 null', async () => {
    const pending = promptDialog({ title: '新密码', type: 'password' });
    await settle();
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
    input.value = 'secret-123';
    input.dispatchEvent(new Event('input'));
    await settle();
    clickButton('确定');
    await expect(pending).resolves.toBe('secret-123');

    const cancelled = promptDialog({ title: '再来' });
    await settle();
    clickButton('取消');
    await expect(cancelled).resolves.toBeNull();
  });
});

describe('toast 服务', () => {
  it('显示消息', async () => {
    toast.success('已保存');
    await settle();
    expect(document.body.textContent).toContain('已保存');
  });
});
