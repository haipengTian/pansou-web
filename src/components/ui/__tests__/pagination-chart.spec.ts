import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Pagination from '../Pagination.vue';
import BarChart from '../BarChart.vue';
import Input from '../Input.vue';

describe('Pagination', () => {
  it('显示总数与页码，边界页禁用对应按钮', () => {
    const wrapper = mount(Pagination, { props: { page: 1, pageSize: 20, total: 45 } });
    expect(wrapper.text()).toContain('共 45 条');
    expect(wrapper.text()).toContain('1 / 3');
    const [prev, next] = wrapper.findAll('button');
    expect(prev.attributes('disabled')).toBeDefined();
    expect(next.attributes('disabled')).toBeUndefined();
  });

  it('翻页回传新页码', async () => {
    const wrapper = mount(Pagination, { props: { page: 2, pageSize: 20, total: 45 } });
    const [prev, next] = wrapper.findAll('button');
    await next.trigger('click');
    await prev.trigger('click');
    expect(wrapper.emitted('update:page')).toEqual([[3], [1]]);
  });

  it('修改每页条数时回到第 1 页', async () => {
    const wrapper = mount(Pagination, { props: { page: 3, pageSize: 20, total: 200, pageSizes: [20, 50] } });
    await wrapper.find('select').setValue('50');
    expect(wrapper.emitted('update:pageSize')?.at(-1)).toEqual([50]);
    expect(wrapper.emitted('update:page')?.at(-1)).toEqual([1]);
  });

  it('没有数据时显示 0 页也不报错', () => {
    const wrapper = mount(Pagination, { props: { page: 1, pageSize: 20, total: 0 } });
    expect(wrapper.text()).toContain('共 0 条');
    wrapper.findAll('button').forEach((b) => expect(b.attributes('disabled')).toBeDefined());
  });
});

describe('BarChart', () => {
  const data = [
    { label: '09-27', value: 5 },
    { label: '09-28', value: 0 },
    { label: '09-29', value: 10 }
  ];

  it('每个数据点一根柱，高度按最大值等比缩放', () => {
    const wrapper = mount(BarChart, { props: { data, height: 100 } });
    const bars = wrapper.findAll('rect.ui-bar-chart__bar');
    expect(bars).toHaveLength(3);
    const heights = bars.map((b) => Number(b.attributes('height')));
    expect(heights[2]).toBeGreaterThan(heights[0]);
    expect(heights[0]).toBeCloseTo(heights[2] / 2, 0);
  });

  it('每根柱都带数值说明，便于悬停查看与读屏', () => {
    const wrapper = mount(BarChart, { props: { data } });
    const titles = wrapper.findAll('title').map((t) => t.text());
    expect(titles).toContain('09-29：10');
  });

  it('全为 0 或空数据时不出错', () => {
    expect(() => mount(BarChart, { props: { data: [] } })).not.toThrow();
    const wrapper = mount(BarChart, { props: { data: [{ label: 'a', value: 0 }] } });
    expect(wrapper.find('rect.ui-bar-chart__bar').exists()).toBe(true);
  });
});

describe('Input date', () => {
  it('支持日期类型', async () => {
    const wrapper = mount(Input, { props: { type: 'date', modelValue: '' } });
    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('date');
    await input.setValue('2026-09-29');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-09-29']);
  });
});
