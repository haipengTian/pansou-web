import { describe, it, expect, vi, afterEach } from 'vitest';
import { defineComponent, h, ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import SwitchTransition from '../SwitchTransition.vue';
import { playEnter } from '../motion';

// 轮询直到条件成立（离场结束的时机取决于运行环境的动画帧）
const waitFor = async (check: () => boolean, timeout = 1000) => {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeout) throw new Error('等待超时');
    await new Promise((resolve) => setTimeout(resolve, 10));
    await nextTick();
  }
};

describe('SwitchTransition', () => {
  // test-utils 默认把 Transition 替换成立即切换的桩，这里要测真实的离场 / 进场过程
  const options = { global: { stubs: { transition: false } } };
  const Host = defineComponent({
    props: { variant: { type: String, default: undefined } },
    setup(props) {
      const view = ref<'a' | 'b'>('a');
      return () =>
        h('div', [
          h('button', { class: 'toggle', onClick: () => (view.value = view.value === 'a' ? 'b' : 'a') }),
          h(SwitchTransition, { variant: props.variant as 'page' | 'tab' | undefined }, () =>
            view.value === 'a' ? h('div', { key: 'a', class: 'view-a' }, 'A') : h('div', { key: 'b', class: 'view-b' }, 'B')
          )
        ]);
    }
  });

  it('渲染当前视图', () => {
    const wrapper = mount(Host, options);
    expect(wrapper.find('.view-a').exists()).toBe(true);
    expect(wrapper.find('.view-b').exists()).toBe(false);
  });

  it('切换后旧视图离场、新视图进场（先出后进）', async () => {
    const wrapper = mount(Host, options);
    await wrapper.find('.toggle').trigger('click');
    // 先出后进：离场期间新视图还没挂载
    expect(wrapper.find('.view-a').classes()).toContain('ui-switch-page-leave-active');
    expect(wrapper.find('.view-b').exists()).toBe(false);

    await waitFor(() => wrapper.find('.view-b').exists());
    expect(wrapper.find('.view-a').exists()).toBe(false);
    expect(wrapper.find('.view-b').exists()).toBe(true);
  });

  it('切换期间锁住容器高度，避免内容空档导致页面跳动；结束后恢复', async () => {
    const wrapper = mount(Host, options);
    const container = wrapper.find('.view-a').element.parentElement as HTMLElement;
    container.style.minHeight = '1px';
    await wrapper.find('.toggle').trigger('click');
    expect(container.style.minHeight).not.toBe('1px');
    await waitFor(() => wrapper.find('.view-b').exists() && container.style.minHeight === '1px');
    expect(container.style.minHeight).toBe('1px');
  });

  it('variant="tab" 使用标签页的动画类名', async () => {
    const wrapper = mount(Host, { ...options, props: { variant: 'tab' } });
    await wrapper.find('.toggle').trigger('click');
    expect(wrapper.find('.view-a').classes()).toContain('ui-switch-tab-leave-active');
  });
});

describe('SwitchTransition 标签页方向', () => {
  const options = { global: { stubs: { transition: false } } };
  const tabs = ['a', 'b', 'c'];
  const Host = defineComponent({
    setup() {
      const tab = ref('b');
      return () =>
        h('div', [
          ...tabs.map((t) => h('button', { class: `go-${t}`, onClick: () => (tab.value = t) })),
          h(SwitchTransition, { variant: 'tab', index: tabs.indexOf(tab.value) }, () =>
            h('div', { key: tab.value, class: `view-${tab.value}` }, tab.value)
          )
        ]);
    }
  });

  it('切到右侧标签：向前滑动', async () => {
    const wrapper = mount(Host, options);
    await wrapper.find('.go-c').trigger('click');
    expect(wrapper.find('.view-b').classes()).toContain('ui-switch-forward-leave-active');
  });

  it('切到左侧标签：向后滑动', async () => {
    const wrapper = mount(Host, options);
    await wrapper.find('.go-a').trigger('click');
    expect(wrapper.find('.view-b').classes()).toContain('ui-switch-backward-leave-active');
  });
});

describe('playEnter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('对元素播放一次进场动画', () => {
    const el = document.createElement('div');
    const animate = vi.fn();
    (el as unknown as { animate: typeof animate }).animate = animate;
    playEnter(el);
    expect(animate).toHaveBeenCalledTimes(1);
    const [keyframes, options] = animate.mock.calls[0];
    expect(keyframes[0].opacity).toBe(0);
    expect(keyframes.at(-1).opacity).toBe(1);
    expect(options.duration).toBeGreaterThan(0);
  });

  it('指定方向时从对应一侧滑入', () => {
    const el = document.createElement('div');
    const animate = vi.fn();
    (el as unknown as { animate: typeof animate }).animate = animate;
    playEnter(el, 'forward');
    expect(animate.mock.calls[0][0][0].transform).toMatch(/translateX\(\d+px\)/);
    playEnter(el, 'backward');
    expect(animate.mock.calls[1][0][0].transform).toMatch(/translateX\(-\d+px\)/);
  });

  it('系统开启"减少动态效果"时不播放', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    const el = document.createElement('div');
    const animate = vi.fn();
    (el as unknown as { animate: typeof animate }).animate = animate;
    playEnter(el);
    expect(animate).not.toHaveBeenCalled();
  });

  it('元素为空或浏览器不支持时静默跳过', () => {
    expect(() => playEnter(null)).not.toThrow();
    expect(() => playEnter(document.createElement('div'))).not.toThrow();
  });
});
