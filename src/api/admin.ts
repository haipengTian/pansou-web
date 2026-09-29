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
