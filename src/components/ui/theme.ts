import type { GlobalThemeOverrides } from 'naive-ui';

// naive-ui 主题：从 pansou.css 的设计变量生成，保证 naive 组件与项目其余样式同一套颜色与圆角。
// 设计变量是 shadcn 风格的 HSL 三元组（如 "217 91% 60%"），这里转成 naive 需要的十六进制。

interface Hsl {
  h: number;
  s: number;
  l: number;
}

// 读不到 CSS 变量（如单元测试环境）时使用的默认值，与 pansou.css 保持一致
const FALLBACK: Record<string, string> = {
  primary: '217 91% 60%',
  'primary-foreground': '0 0% 98%',
  destructive: '0 84% 60%',
  success: '142 76% 36%',
  foreground: '222 84% 4.9%',
  'muted-foreground': '220 9% 46%',
  muted: '220 14.3% 95.9%',
  border: '220 13% 91%',
  input: '220 13% 91%',
  background: '0 0% 98%',
  card: '0 0% 100%',
  radius: '0.5rem'
};

const readVar = (name: string): string => {
  if (typeof window !== 'undefined' && typeof getComputedStyle === 'function') {
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
    if (value) return value;
  }
  return FALLBACK[name];
};

const parseHsl = (raw: string): Hsl => {
  const [h, s, l] = raw.replace(/%/g, '').split(/\s+/).map(Number);
  return { h: h || 0, s: s || 0, l: l || 0 };
};

const clamp = (v: number) => Math.min(100, Math.max(0, v));

export const hslToHex = ({ h, s, l }: Hsl): string => {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
};

const color = (name: string, lightnessShift = 0) => {
  const hsl = parseHsl(readVar(name));
  return hslToHex({ ...hsl, l: clamp(hsl.l + lightnessShift) });
};

// "0.5rem" → "8px"（naive 的圆角取像素值）
const radiusPx = (shift = 0) => {
  const raw = readVar('radius');
  const rem = parseFloat(raw);
  const px = raw.endsWith('px') ? rem : rem * 16;
  return `${Math.max(0, px + shift)}px`;
};

const HEIGHTS = { heightSmall: '32px', heightMedium: '40px', heightLarge: '44px' };

export const buildThemeOverrides = (): GlobalThemeOverrides => {
  const primary = color('primary');
  const error = color('destructive');
  const success = color('success');
  return {
    common: {
      primaryColor: primary,
      primaryColorHover: color('primary', 6),
      primaryColorPressed: color('primary', -8),
      primaryColorSuppl: color('primary', 6),
      infoColor: primary,
      infoColorHover: color('primary', 6),
      infoColorPressed: color('primary', -8),
      infoColorSuppl: color('primary', 6),
      errorColor: error,
      errorColorHover: color('destructive', 6),
      errorColorPressed: color('destructive', -8),
      errorColorSuppl: color('destructive', 6),
      successColor: success,
      successColorHover: color('success', 6),
      successColorPressed: color('success', -8),
      successColorSuppl: color('success', 6),
      warningColor: '#d97706',
      warningColorHover: '#f59e0b',
      warningColorPressed: '#b45309',
      warningColorSuppl: '#f59e0b',
      textColorBase: color('foreground'),
      textColor1: color('foreground'),
      textColor2: color('foreground'),
      textColor3: color('muted-foreground'),
      placeholderColor: color('muted-foreground'),
      borderColor: color('border'),
      dividerColor: color('border'),
      bodyColor: color('background'),
      cardColor: color('card'),
      modalColor: color('card'),
      popoverColor: color('card'),
      tableHeaderColor: color('muted'),
      hoverColor: color('muted'),
      borderRadius: radiusPx(-2),
      borderRadiusSmall: radiusPx(-4),
      fontFamily: 'inherit',
      fontSize: '14px',
      fontSizeMedium: '14px',
      ...HEIGHTS
    },
    Button: { ...HEIGHTS, fontWeight: '500' },
    Input: { ...HEIGHTS },
    Select: { peers: { InternalSelection: { ...HEIGHTS } } },
    Card: { borderRadius: radiusPx(4) },
    Tag: { borderRadius: '999px' }
  };
};
