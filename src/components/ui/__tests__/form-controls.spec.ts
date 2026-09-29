import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { NButton, NSelect } from 'naive-ui';
import Button from '../Button.vue';
import Input from '../Input.vue';
import Textarea from '../Textarea.vue';
import Select from '../Select.vue';
import Checkbox from '../Checkbox.vue';
import CheckTag from '../CheckTag.vue';
import Switch from '../Switch.vue';
import RadioGroup from '../RadioGroup.vue';

// 只测对外行为（v-model、事件、禁用、可访问性），不依赖 naive 的内部结构细节。

describe('Button', () => {
  it('默认 type 为 button，避免在表单里意外提交', () => {
    const wrapper = mount(Button, { slots: { default: '保存' } });
    expect(wrapper.find('button').attributes('type')).toBe('button');
    expect(wrapper.text()).toBe('保存');
  });

  it('type=submit 透传给原生按钮', () => {
    const wrapper = mount(Button, { props: { type: 'submit' } });
    expect(wrapper.find('button').attributes('type')).toBe('submit');
  });

  it('点击时触发 click；禁用或加载中不触发', async () => {
    const wrapper = mount(Button);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);

    await wrapper.setProps({ disabled: true });
    await wrapper.find('button').trigger('click');
    await wrapper.setProps({ disabled: false, loading: true });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });

  it('variant="danger-link" 渲染为红色文字按钮', () => {
    const wrapper = mount(Button, { props: { variant: 'danger-link' }, slots: { default: '删除' } });
    const inner = wrapper.findComponent(NButton);
    expect(inner.props('type')).toBe('error');
    expect(inner.props('text')).toBe(true);
  });

  it('兼容旧的 variant="icon" 写法（仅图标按钮）', () => {
    const wrapper = mount(Button, { props: { variant: 'icon' } });
    expect(wrapper.classes()).toContain('ui-btn--icon');
  });
});

describe('Input', () => {
  it('双向绑定文本', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'a' } });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('a');
    await input.setValue('abc');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['abc']);
  });

  it('number 类型回传数字，清空时回传空字符串', async () => {
    const wrapper = mount(Input, { props: { type: 'number', modelValue: 1 } });
    const input = wrapper.find('input');
    await input.setValue('42');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([42]);
    await input.setValue('');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['']);
  });

  it('回车触发 enter，输入法组合中的回车不触发', async () => {
    const wrapper = mount(Input);
    const input = wrapper.find('input');
    await input.trigger('keydown', { key: 'Enter' });
    await input.trigger('keydown', { key: 'Enter', isComposing: true });
    expect(wrapper.emitted('enter')).toHaveLength(1);
  });

  it('class 作用在外层，其余原生属性透传给 input', () => {
    const wrapper = mount(Input, { attrs: { class: 'w-40', autocomplete: 'username', name: 'user' } });
    expect(wrapper.classes()).toContain('w-40');
    const input = wrapper.find('input');
    expect(input.attributes('autocomplete')).toBe('username');
    expect(input.attributes('name')).toBe('user');
    expect(input.classes()).not.toContain('w-40');
  });

  it('password 类型渲染为密码框', () => {
    const wrapper = mount(Input, { props: { type: 'password' } });
    expect(wrapper.find('input').attributes('type')).toBe('password');
  });
});

describe('Textarea', () => {
  it('双向绑定', async () => {
    const wrapper = mount(Textarea, { props: { modelValue: '' } });
    await wrapper.find('textarea').setValue('a\nb');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a\nb']);
  });
});

describe('Select', () => {
  const options = [
    { label: '一', value: 1 },
    { label: '二', value: 2 }
  ];

  const selectHandler = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findComponent(NSelect).props('onUpdate:value') as (value: unknown) => void;

  it('回传选项原始类型的值', () => {
    const wrapper = mount(Select, { props: { modelValue: 1, options } });
    selectHandler(wrapper)(2);
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2]);
  });

  it('显示当前选中项的文字', () => {
    const wrapper = mount(Select, { props: { modelValue: 2, options } });
    expect(wrapper.text()).toContain('二');
  });

  it('清空（null）不回传', () => {
    const wrapper = mount(Select, { props: { modelValue: 1, options, clearable: true } });
    selectHandler(wrapper)(null);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});

describe.each([
  ['Checkbox', Checkbox, '[role="checkbox"]'],
  ['CheckTag', CheckTag, '[role="checkbox"]'],
  ['Switch', Switch, '[role="switch"]']
] as const)('%s', (_name, component, selector) => {
  it('切换时回传相反的布尔值', async () => {
    const wrapper = mount(component as never, { props: { modelValue: false } });
    await wrapper.find(selector).trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true]);
  });

  it('禁用时不切换', async () => {
    const wrapper = mount(component as never, { props: { modelValue: false, disabled: true } });
    await wrapper.find(selector).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('暴露 aria-checked', () => {
    const wrapper = mount(component as never, { props: { modelValue: true } });
    expect(wrapper.find(selector).attributes('aria-checked')).toBe('true');
  });
});

describe('RadioGroup', () => {
  const options = [
    { label: 'JSON', value: 'json' },
    { label: 'TXT', value: 'txt' },
    { label: '禁用', value: 'off', disabled: true }
  ];

  it('选中另一项时回传值', async () => {
    const wrapper = mount(RadioGroup, { props: { modelValue: 'json', options } });
    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios).toHaveLength(3);
    expect((radios[0].element as HTMLInputElement).checked).toBe(true);
    await radios[1].trigger('change');
    expect(wrapper.emitted('update:modelValue')).toEqual([['txt']]);
  });

  it('禁用的选项不可选', () => {
    const wrapper = mount(RadioGroup, { props: { modelValue: 'json', options } });
    expect(wrapper.findAll('input[type="radio"]')[2].attributes('disabled')).toBeDefined();
  });
});
