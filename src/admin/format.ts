// 后台页面共用的展示格式化

export const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

export const formatPercent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

// 接口分组的中文名，与后端 api/stats.go 的 routeGroup 对应
export const ROUTE_GROUP_LABELS: Record<string, string> = {
  search: '搜索',
  'search-options': '筛选选项',
  check: '链接检测',
  auth: '登录认证',
  admin: '管理后台',
  health: '健康检查',
  'plugin-page': '插件账号页',
  'api-other': '其他接口',
  other: '其他'
};

// 登录失败原因，与后端 api/stats.go 的 loginReason* 对应
export const LOGIN_REASON_LABELS: Record<string, string> = {
  invalid_credentials: '用户名或密码错误',
  disabled: '账号已禁用',
  rate_limited: '失败次数过多被限速',
  bad_request: '参数错误',
  not_configured: '认证未配置'
};

// 从统计页跳转到搜索历史时携带的筛选条件
export interface HistoryDrill {
  username?: string;
  keyword?: string;
  ip?: string;
  zero_only?: boolean;
}
