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
  /** 表头与单元格不换行（内容过宽时表格横向滚动） */
  nowrap?: boolean;
  /** 固定在表格左/右侧，横向滚动时保持可见（如操作列） */
  fixed?: 'left' | 'right';
}

export interface TabItem {
  label: string;
  value: string;
  icon?: unknown;
  count?: number | string;
  disabled?: boolean;
}

export type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger';
