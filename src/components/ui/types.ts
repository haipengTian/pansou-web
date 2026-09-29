// UI 组件共享类型

export interface SelectOption<V extends string | number = string | number> {
  label: string;
  value: V;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TabItem {
  label: string;
  value: string;
  icon?: unknown;
  count?: number | string;
  disabled?: boolean;
}

export type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger';
