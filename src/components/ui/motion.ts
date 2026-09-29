// 不重新挂载元素时的进场动画（如搜索结果切换网盘标签：列表元素保留，只换内容）。
// 需要卸载 / 挂载的视图切换请用 SwitchTransition。

/** 标签切换方向：forward = 切到右侧标签，内容从右侧滑入；backward 相反 */
export type SwitchDirection = 'forward' | 'backward';

// 与 SwitchTransition 的标签页滑动保持一致
export const SLIDE_DISTANCE = 24;

const ENTER_OPTIONS: KeyframeAnimationOptions = { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

const enterKeyframes = (direction?: SwitchDirection): Keyframe[] => {
  const from =
    direction === 'forward'
      ? `translateX(${SLIDE_DISTANCE}px)`
      : direction === 'backward'
        ? `translateX(-${SLIDE_DISTANCE}px)`
        : 'translateY(4px)';
  return [
    { opacity: 0, transform: from },
    { opacity: 1, transform: 'none' }
  ];
};

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

// 对元素播放一次进场动画；元素为空、浏览器不支持或用户要求减少动态效果时跳过。
export const playEnter = (el: Element | null | undefined, direction?: SwitchDirection): void => {
  if (!el || typeof (el as HTMLElement).animate !== 'function' || prefersReducedMotion()) return;
  (el as HTMLElement).animate(enterKeyframes(direction), ENTER_OPTIONS);
};

// 由新旧标签序号得出切换方向
export const directionOf = (index: number, previous: number): SwitchDirection | undefined => {
  if (index < 0 || previous < 0 || index === previous) return undefined;
  return index > previous ? 'forward' : 'backward';
};
