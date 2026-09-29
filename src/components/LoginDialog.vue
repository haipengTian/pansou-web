<template>
  <Modal
    :open="visible"
    :title="`🔐 ${title || '登录 PanSou'}`"
    description="请输入您的账号和密码"
    size="sm"
    :closable="false"
  >
    <form class="login-form" @submit.prevent="handleLogin">
      <Field label="用户名">
        <Input
          v-model="form.username"
          placeholder="请输入用户名"
          required
          autofocus
          autocomplete="username"
        />
      </Field>

      <Field label="密码">
        <Input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          required
          autocomplete="current-password"
        />
      </Field>

      <div v-if="error" class="error-message">{{ error }}</div>

      <Button type="submit" block :loading="loading">
        {{ loading ? '登录中...' : '登录' }}
      </Button>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { login, saveLogin } from '@/api';
import { Button, Field, Input, Modal } from '@/components/ui';

// 登录对话框。登录是继续使用的前提，因此不提供关闭按钮。
const props = defineProps<{
  visible: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const form = reactive({
  username: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

watch(() => props.visible, (newVal) => {
  if (newVal) {
    error.value = '';
    form.username = '';
    form.password = '';
  }
});

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await login(form);
    saveLogin(response);
    emit('update:visible', false);
    emit('success');
  } catch (err: any) {
    error.value = err.response?.data?.error || '登录失败，请检查账号密码';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-message {
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  background: hsl(var(--destructive) / 0.08);
  color: hsl(var(--destructive));
  font-size: 0.875rem;
}
</style>
