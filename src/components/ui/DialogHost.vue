<script setup lang="ts">
import { ref } from 'vue';
import Modal from './Modal.vue';
import Button from './Button.vue';
import Input from './Input.vue';

// confirmDialog / promptDialog 的承载组件，由 dialog.ts 按需挂载。
const props = defineProps<{
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  input?: { type?: 'text' | 'password'; placeholder?: string; defaultValue?: string };
  onResolve: (value: string | null) => void;
}>();

const open = ref(true);
const value = ref(props.input?.defaultValue ?? '');
let settled = false;

const finish = (result: string | null) => {
  if (settled) return;
  settled = true;
  open.value = false;
  props.onResolve(result);
};

const confirm = () => finish(props.input ? value.value : '');
const cancel = () => finish(null);
</script>

<template>
  <Modal :open="open" :title="title" size="sm" @close="cancel">
    <div v-if="message" class="ui-dialog__message">{{ message }}</div>
    <Input
      v-if="input"
      v-model="value"
      class="ui-dialog__input"
      :type="input.type || 'text'"
      :placeholder="input.placeholder"
      autofocus
      @enter="confirm"
    />
    <template #footer>
      <Button variant="outline" @click="cancel">{{ cancelText || '取消' }}</Button>
      <Button :variant="danger ? 'danger' : 'default'" autofocus @click="confirm">{{ confirmText || '确定' }}</Button>
    </template>
  </Modal>
</template>

<style scoped>
.ui-dialog__message {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  white-space: pre-line;
}

.ui-dialog__input { margin-top: 0.75rem; }
</style>
