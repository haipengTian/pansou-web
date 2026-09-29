// jsdom 缺少的浏览器 API（naive-ui 的表格、弹层等组件会用到）。
// 以 node 环境运行的测试（如构建产物检查）没有 window，直接跳过。
const hasWindow = typeof window !== 'undefined';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (hasWindow && !('ResizeObserver' in window)) {
  (window as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;
}

if (hasWindow && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false
    }) as MediaQueryList;
}
