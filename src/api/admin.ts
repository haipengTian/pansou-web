import api, { type UserRole } from '@/api';
import type { LivenessReport } from '@/types';

// 管理后台接口。全部要求管理员令牌，401/403 由调用方处理。

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface AdminSettings {
  enabled_plugins: string[];
  default_channels: string[];
  allowed_channels: string[];
  allowed_cloud_types: string[];
  updated_at?: string;
  updated_by?: string;
}

export interface AdminPlugin {
  name: string;
  priority: number;
  enabled: boolean;
  has_web_page: boolean;
  skip_service_filter: boolean;
}

export interface AdminUser {
  username: string;
  role: UserRole;
  disabled: boolean;
  source: 'env' | 'db';
  created_at?: string;
  last_login_at?: string;
  last_search_at?: string;
  today_searches?: number;
}

export interface AdminHealth {
  status: string;
  auth_enabled: boolean;
  plugins_enabled: boolean;
  plugin_count?: number;
  plugins?: string[];
  channels: string[];
  channels_count: number;
  liveness?: LivenessReport;
  tg?: Record<string, unknown>;
}

export type RuntimeInfo = Record<string, string | number | boolean>;

// 从 axios 错误中提取后端返回的说明
export const errorMessage = (err: unknown, fallback = '操作失败'): string => {
  const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
  return data?.message || data?.error || fallback;
};

export const getSettings = async () => {
  const res = await api.get<ApiResponse<{ settings: AdminSettings; plugin_system_enabled: boolean }>>('/admin/settings');
  return res.data.data;
};

export const updateSettings = async (settings: AdminSettings) => {
  const res = await api.put<ApiResponse<{ settings: AdminSettings; failed_plugins: Record<string, string> }>>(
    '/admin/settings',
    settings
  );
  return res.data.data;
};

export const listPlugins = async () => {
  const res = await api.get<ApiResponse<{ plugins: AdminPlugin[]; plugin_system_enabled: boolean }>>('/admin/plugins');
  return res.data.data;
};

export const getAdminHealth = async (): Promise<AdminHealth> => {
  const res = await api.get<AdminHealth>('/admin/health');
  return res.data;
};

export const getRuntime = async (): Promise<RuntimeInfo> => {
  const res = await api.get<ApiResponse<RuntimeInfo>>('/admin/runtime');
  return res.data.data;
};

export const listUsers = async (): Promise<AdminUser[]> => {
  const res = await api.get<ApiResponse<{ users: AdminUser[] }>>('/admin/users');
  return res.data.data.users;
};

export const createUser = async (username: string, password: string, role: UserRole) => {
  const res = await api.post<ApiResponse<{ user: AdminUser }>>('/admin/users', { username, password, role });
  return res.data.data.user;
};

export interface UserPatch {
  role?: UserRole;
  disabled?: boolean;
  password?: string;
}

export const updateUser = async (username: string, patch: UserPatch) => {
  const res = await api.patch<ApiResponse<{ user: AdminUser }>>(`/admin/users/${encodeURIComponent(username)}`, patch);
  return res.data.data.user;
};

export const deleteUser = async (username: string) => {
  await api.delete(`/admin/users/${encodeURIComponent(username)}`);
};

// ---------- 搜索历史与访问统计 ----------

export interface StatsCounts {
  searches: number;
  users: number;
  ips: number;
}

export interface StatsOverview {
  days: number;
  today: StatsCounts;
  total: StatsCounts;
  period: {
    searches: number;
    zero_results: number;
    zero_rate: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    errors: number;
  };
  daily: { day: string; searches: number; users: number; ips: number; zero_results: number }[];
  hourly: number[];
  top_keywords: { keyword: string; count: number; users: number }[];
  zero_keywords: { keyword: string; count: number; users: number }[];
  top_users: { username: string; count: number; last_at: string }[];
  top_ips: { ip: string; count: number; users: number; last_at: string }[];
  api: { group: string; requests: number; errors_4xx: number; errors_5xx: number; avg_latency_ms: number }[];
}

export interface SearchRecord {
  id: number;
  username: string;
  role: string;
  ip: string;
  user_agent: string;
  keyword: string;
  source_type: string;
  cloud_types: string;
  refresh: boolean;
  result_total: number;
  latency_ms: number;
  request_count: number;
  status: number;
  error: string;
  created_at: string;
}

export interface LoginRecord {
  id: number;
  username: string;
  ip: string;
  user_agent: string;
  success: boolean;
  reason: string;
  created_at: string;
}

export interface Paged<T> {
  total: number;
  items: T[];
}

export interface SearchHistoryQuery {
  username?: string;
  keyword?: string;
  ip?: string;
  from?: string;
  to?: string;
  zero_only?: boolean;
}

export interface LoginHistoryQuery {
  username?: string;
  ip?: string;
  success?: '' | 'true' | 'false';
  from?: string;
  to?: string;
}

// 去掉空值，避免把空字符串当作筛选条件传给后端
const compact = (query: object) =>
  Object.fromEntries(Object.entries(query).filter(([, v]) => v !== '' && v !== undefined && v !== false));

export const getStatsOverview = async (days: number) => {
  const res = await api.get<ApiResponse<StatsOverview>>('/admin/stats/overview', { params: { days } });
  return res.data.data;
};

export const listSearchHistory = async (query: SearchHistoryQuery, page: number, pageSize: number) => {
  const res = await api.get<ApiResponse<Paged<SearchRecord>>>('/admin/stats/searches', {
    params: { ...compact(query), page, page_size: pageSize }
  });
  return res.data.data;
};

export const listLoginHistory = async (query: LoginHistoryQuery, page: number, pageSize: number) => {
  const res = await api.get<ApiResponse<Paged<LoginRecord>>>('/admin/stats/logins', {
    params: { ...compact(query), page, page_size: pageSize }
  });
  return res.data.data;
};

// 导出需要带认证头，不能用普通链接，先取回文件内容再触发下载
export const exportSearchHistory = async (query: SearchHistoryQuery) => {
  const res = await api.get<Blob>('/admin/stats/searches/export', {
    params: compact(query),
    responseType: 'blob',
    timeout: 120000
  });
  const disposition = String(res.headers['content-disposition'] || '');
  const match = /filename="?([^"]+)"?/.exec(disposition);
  return { blob: res.data, filename: match?.[1] || 'pansou-search-history.csv' };
};
