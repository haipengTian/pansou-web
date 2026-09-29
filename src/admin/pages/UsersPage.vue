<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Badge, Button, Card, Field, Input, Select, Table, confirmDialog, promptDialog, toast } from '@/components/ui';
import { listUsers, createUser, updateUser, deleteUser, errorMessage, type AdminUser } from '@/api/admin';
import type { UserRole } from '@/api';

const props = defineProps<{ currentUsername: string }>();

const ROLE_OPTIONS = [
  { label: '普通用户', value: 'user' as UserRole },
  { label: '管理员', value: 'admin' as UserRole }
];

const COLUMNS = [
  { key: 'username', title: '用户名', nowrap: true },
  { key: 'role', title: '角色', nowrap: true },
  { key: 'disabled', title: '状态', nowrap: true },
  { key: 'source', title: '来源', nowrap: true },
  { key: 'created_at', title: '创建时间', nowrap: true },
  { key: 'last_login_at', title: '最近登录', nowrap: true },
  { key: 'last_search_at', title: '最近搜索', nowrap: true },
  { key: 'today_searches', title: '今日搜索', align: 'right' as const, nowrap: true },
  { key: 'actions', title: '操作', nowrap: true, fixed: 'right' as const }
];

const users = ref<AdminUser[]>([]);
const busy = ref(false);

const form = reactive<{ username: string; password: string; role: UserRole }>({
  username: '',
  password: '',
  role: 'user'
});

const formatTime = (t?: unknown) => (typeof t === 'string' && t ? new Date(t).toLocaleString() : '—');

// 执行一次写操作，成功后刷新列表并提示；返回是否成功。
const run = async (action: () => Promise<unknown>, success?: string) => {
  busy.value = true;
  try {
    await action();
    if (success) toast.success(success);
    users.value = await listUsers();
    return true;
  } catch (err) {
    toast.error(errorMessage(err));
    return false;
  } finally {
    busy.value = false;
  }
};

const submitCreate = async () => {
  const username = form.username.trim();
  const ok = await run(() => createUser(username, form.password, form.role), `已创建账号 ${username}`);
  if (ok) {
    form.username = '';
    form.password = '';
    form.role = 'user';
  }
};

const toggleDisabled = (u: AdminUser) =>
  run(() => updateUser(u.username, { disabled: !u.disabled }), u.disabled ? `已启用 ${u.username}` : `已禁用 ${u.username}，其登录立即失效`);

const toggleRole = (u: AdminUser) => {
  const role: UserRole = u.role === 'admin' ? 'user' : 'admin';
  return run(() => updateUser(u.username, { role }), `${u.username} 已改为${role === 'admin' ? '管理员' : '普通用户'}`);
};

const resetPassword = async (u: AdminUser) => {
  const password = await promptDialog({
    title: `重置 ${u.username} 的密码`,
    message: '至少 8 位。保存后该账号已有的登录会立即失效。',
    type: 'password',
    placeholder: '新密码',
    confirmText: '重置'
  });
  if (!password) return;
  await run(() => updateUser(u.username, { password }), `已重置 ${u.username} 的密码，其旧登录立即失效`);
};

const remove = async (u: AdminUser) => {
  const ok = await confirmDialog({
    title: `删除账号 ${u.username}`,
    message: '此操作不可恢复，该账号将无法再登录。',
    danger: true,
    confirmText: '删除'
  });
  if (!ok) return;
  await run(() => deleteUser(u.username), `已删除 ${u.username}`);
};

const isSelf = (u: AdminUser) => u.username === props.currentUsername;
const asUser = (row: unknown) => row as AdminUser;

onMounted(() => run(async () => undefined));
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <div>
        <div class="admin-page-title">用户管理</div>
        <div class="admin-page-desc">客户账号由管理员创建。禁用、改角色或重置密码后，该账号已有的登录会立即失效。</div>
      </div>
    </div>

    <Card padding="sm">
      <form class="flex gap-3 flex-wrap items-end" @submit.prevent="submitCreate">
        <Field label="用户名" style="flex: 1 1 10rem">
          <Input v-model="form.username" autocomplete="off" placeholder="3-32 位字母数字" required />
        </Field>
        <Field label="初始密码" style="flex: 1 1 10rem">
          <Input v-model="form.password" type="password" autocomplete="new-password" placeholder="至少 8 位" required />
        </Field>
        <Field label="角色" style="flex: 0 0 8rem">
          <Select v-model="form.role" :options="ROLE_OPTIONS" />
        </Field>
        <Button type="submit" :loading="busy">新建账号</Button>
      </form>
    </Card>

    <Card padding="sm">
      <Table :columns="COLUMNS" :data="users as unknown as Record<string, unknown>[]" row-key="username" empty-text="暂无账号">
        <template #cell-username="{ row }">
          {{ asUser(row).username }}
          <Badge v-if="isSelf(asUser(row))" size="sm">当前</Badge>
        </template>
        <template #cell-role="{ row }">{{ asUser(row).role === 'admin' ? '管理员' : '普通用户' }}</template>
        <template #cell-disabled="{ row }">
          <Badge :tone="asUser(row).disabled ? 'danger' : 'success'">{{ asUser(row).disabled ? '已禁用' : '正常' }}</Badge>
        </template>
        <template #cell-source="{ row }">
          <Badge v-if="asUser(row).source === 'env'" tone="warning" title="来自 ADMIN_USERS/AUTH_USERS 环境变量，只能修改部署配置">环境变量</Badge>
          <span v-else>后台</span>
        </template>
        <template #cell-created_at="{ value }">{{ formatTime(value) }}</template>
        <template #cell-last_login_at="{ value }">{{ formatTime(value) }}</template>
        <template #cell-last_search_at="{ value }">{{ formatTime(value) }}</template>
        <template #cell-today_searches="{ value }">{{ value ?? 0 }}</template>
        <template #cell-actions="{ row }">
          <div v-if="asUser(row).source === 'db'" class="row-actions">
            <Button variant="link" size="sm" :disabled="busy" @click="resetPassword(asUser(row))">重置密码</Button>
            <Button variant="link" size="sm" :disabled="busy || isSelf(asUser(row))" @click="toggleRole(asUser(row))">
              {{ asUser(row).role === 'admin' ? '降为用户' : '设为管理员' }}
            </Button>
            <Button variant="link" size="sm" :disabled="busy || isSelf(asUser(row))" @click="toggleDisabled(asUser(row))">
              {{ asUser(row).disabled ? '启用' : '禁用' }}
            </Button>
            <Button variant="danger-link" size="sm" :disabled="busy || isSelf(asUser(row))" @click="remove(asUser(row))">删除</Button>
          </div>
          <span v-else class="admin-page-desc">只读</span>
        </template>
      </Table>
    </Card>
  </div>
</template>

<style scoped>
/* 操作列：文字按钮单行排列 */
.row-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  white-space: nowrap;
}
</style>
