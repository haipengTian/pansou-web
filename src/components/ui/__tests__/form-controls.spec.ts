import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '../Button.vue';
import Input from '../Input.vue';
import Textarea from '../Textarea.vue';
import Select from '../Select.vue';
import Checkbox from '../Checkbox.vue';
import CheckTag from '../CheckTag.vue';
import Switch from '../Switch.vue';
import RadioGroup from '../RadioGroup.vue';

describe('Button', () => {
  it('默认 type 为 button，避免在表单里意外提交', () => {
    const wrapper = mount(Button, { slots: { default: '保存' } });
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.text()).toBe('保存');
  });

  it('点击时触发 click；禁用或加载中不触发', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);

    await wrapper.setProps({ disabled: true });
    await wrapper.trigger('click');
    await wrapper.setProps({ disabled: false, loading: true });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });

  it('兼容旧的 variant="icon" 写法', () => {
    const wrapper = mount(Button, { props: { variant: 'icon' } });
    expect(wrapper.classes()).toContain('ui-btn--icon');
    expect(wrapper.classes()).toContain('ui-btn--v-ghost');
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

  it('class 作用在外层，其余属性透传给 input', () => {
    const wrapper = mount(Input, { attrs: { class: 'w-40', placeholder: '用户名', autocomplete: 'username' } });
    expect(wrapper.classes()).toContain('w-40');
    const input = wrapper.find('input');
    expect(input.attributes('placeholder')).toBe('用户名');
    expect(input.attributes('autocomplete')).toBe('username');
    expect(input.classes()).not.toContain('w-40');
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

  it('回传选项原始类型的值', async () => {
    const wrapper = mount(Select, { props: { modelValue: 1, options } });
    await wrapper.find('select').setValue('2');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2]);
  });

  it('渲染全部选项并选中当前值', () => {
    const wrapper = mount(Select, { props: { modelValue: 2, options } });
    expect(wrapper.findAll('option')).toHaveLength(2);
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('2');
  });
});

describe.each([
  ['Checkbox', Checkbox, 'input'],
  ['CheckTag', CheckTag, 'button'],
  ['Switch', Switch, 'button']
] as const)('%s', (_name, component, selector) => {
  it('切换时回传相反的布尔值', async () => {
    const wrapper = mount(component as never, { props: { modelValue: false } });
    const target = wrapper.find(selector);
    await (selector === 'input' ? target.trigger('change') : target.trigger('click'));
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true]);
  });

  it('禁用时不切换', async () => {
    const wrapper = mount(component as never, { props: { modelValue: false, disabled: true } });
    const target = wrapper.find(selector);
    await (selector === 'input' ? target.trigger('change') : target.trigger('click'));
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});

describe('可访问性状态', () => {
  it('CheckTag 与 Switch 暴露 aria-checked', () => {
    expect(mount(CheckTag, { props: { modelValue: true } }).attributes('aria-checked')).toBe('true');
    expect(mount(Switch, { props: { modelValue: true } }).find('button').attributes('aria-checked')).toBe('true');
  });
});

describe('RadioGroup', () => {
  const options = [
    { label: 'JSON', value: 'json' },
    { label: 'TXT', value: 'txt' },
    { label: '禁用', value: 'off', disabled: true }
  ];

  it('点击选中并回传值，已选中项不重复触发', async () => {
    const wrapper = mount(RadioGroup, { props: { modelValue: 'json', options } });
    const radios = wrapper.findAll('[role="radio"]');
    expect(radios[0].attributes('aria-checked')).toBe('true');
    await radios[0].trigger('click');
    await radios[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['txt']]);
  });

  it('方向键跳过禁用项循环切换', async () => {
    const wrapper = mount(RadioGroup, { props: { modelValue: 'txt', options } });
    await wrapper.findAll('[role="radio"]')[1].trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['json']);
  });
});
