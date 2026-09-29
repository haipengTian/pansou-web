<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LoginDialog from '@/components/LoginDialog.vue';
import ApiDocs from '@/components/ApiDocs.vue';
import OverviewPage from './pages/OverviewPage.vue';
import PluginsPage from './pages/PluginsPage.vue';
import ChannelsPage from './pages/ChannelsPage.vue';
import AccountsPage from './pages/AccountsPage.vue';
import UsersPage from './pages/UsersPage.vue';
import RuntimePage from './pages/RuntimePage.vue';
import { getSession, logout } from '@/api';
import { Button, Card, Link } from '@/components/ui';
import './admin.css';

type PageKey = 'overview' | 'plugins' | 'channels' | 'accounts' | 'users' | 'docs' | 'runtime';

const PAGES: { key: PageKey; label: string }[] = [
  { key: 'overview', label: '概览' },
  { key: 'plugins', label: '插件管理' },
  { key: 'channels', label: '频道与网盘类型' },
  { key: 'accounts', label: '数据源账号' },
  { key: 'users', label: '用户管理' },
  { key: 'docs', label: 'API 文档' },
  { key: 'runtime', label: '运行参数' }
];

// 'checking' 校验中；'login' 需要登录；'forbidden' 已登录但不是管理员；'ready' 可用
const state = ref<'checking' | 'login' | 'forbidden' | 'ready'>('checking');
const username = ref('');

const pageFromHash = (): PageKey => {
  const key = window.location.hash.replace(/^#\/?/, '') as PageKey;
  return PAGES.some((p) => p.key === key) ? key : 'overview';
};
const page = ref<PageKey>(pageFromHash());
const pageLabel = computed(() => PAGES.find((p) => p.key === page.value)?.label || '');

const go = (key: PageKey) => {
  page.value = key;
  window.location.hash = `/${key}`;
};

const syncFromHash = () => {
  page.value = pageFromHash();
};

const checkSession = async () => {
  if (!localStorage.getItem('auth_token')) {
    state.value = 'login';
    return;
  }
  const session = await getSession();
  if (!session.valid || !session.username) {
    state.value = 'login';
    return;
  }
  username.value = session.username;
  state.value = session.role === 'admin' ? 'ready' : 'forbidden';
};

// 任一接口返回 401（令牌过期或被吊销）时回到登录
const handleAuthRequired = () => {
  state.value = 'login';
};

const handleLogout = async () => {
  await logout();
  window.location.reload();
};

onMounted(() => {
  document.title = 'PanSou 管理后台';
  checkSession();
  window.addEventListener('auth:required', handleAuthRequired);
  window.addEventListener('hashchange', syncFromHash);
});

onUnmounted(() => {
  window.removeEventListener('auth:required', handleAuthRequired);
  window.removeEventListener('hashchange', syncFromHash);
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <LoginDialog
      :visible="state === 'login'"
      title="登录管理后台"
      @update:visible="() => {}"
      @success="checkSession"
    />

    <div v-if="state === 'checking'" class="p-10 text-center text-sm text-muted-foreground">正在校验登录状态...</div>

    <Card v-else-if="state === 'forbidden'" class="max-w-md mx-auto mt-24 text-center" title="无权访问管理后台">
      <p class="admin-page-desc mb-4">当前账号 {{ username }} 不是管理员。</p>
      <div class="flex gap-2 justify-center">
        <Link href="/" tone="muted">返回搜索</Link>
        <Button size="sm" @click="handleLogout">切换账号</Button>
      </div>
    </Card>

    <div v-else-if="state === 'ready'" class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-brand">PanSou 管理后台</div>
        <nav class="admin-nav">
          <Button
            v-for="p in PAGES"
            :key="p.key"
            variant="ghost"
            class="admin-nav-item"
            :class="{ active: page === p.key }"
            :aria-current="page === p.key ? 'page' : undefined"
            @click="go(p.key)"
          >
            {{ p.label }}
          </Button>
        </nav>
        <div class="admin-sidebar-footer">
          <div class="admin-page-desc mb-2">当前：{{ username }}</div>
          <div class="flex gap-3 items-center">
            <Link href="/" tone="muted">前台</Link>
            <Button variant="outline" size="sm" @click="handleLogout">退出</Button>
          </div>
        </div>
      </aside>

      <main class="admin-main">
        <div class="admin-mobile-title">{{ pageLabel }}</div>
        <OverviewPage v-if="page === 'overview'" />
        <PluginsPage v-else-if="page === 'plugins'" />
        <ChannelsPage v-else-if="page === 'channels'" />
        <AccountsPage v-else-if="page === 'accounts'" />
        <UsersPage v-else-if="page === 'users'" :current-username="username" />
        <ApiDocs v-else-if="page === 'docs'" />
        <RuntimePage v-else-if="page === 'runtime'" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 13rem;
  flex-shrink: 0;
  border-right: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  position: sticky;
  top: 0;
  height: 100vh;
}

.admin-brand {
  font-weight: 700;
  padding: 0 0.5rem 1rem;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.admin-nav-item {
  justify-content: flex-start;
  color: hsl(var(--muted-foreground));
  font-weight: 400;
}

.admin-nav-item.active {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  font-weight: 600;
}

.admin-sidebar-footer {
  border-top: 1px solid hsl(var(--border));
  padding-top: 0.75rem;
}

.admin-main {
  flex: 1;
  min-width: 0;
  padding: 1.5rem;
  max-width: 72rem;
}

.admin-mobile-title {
  display: none;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-sidebar {
    width: auto;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid hsl(var(--border));
  }

  .admin-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .admin-main {
    padding: 1rem;
  }
}
</style>
