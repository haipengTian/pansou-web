<script setup lang="ts">
import { toastState, dismissToast } from './toast';
</script>

<template>
  <div class="ui-toast-stack" aria-live="polite">
    <TransitionGroup name="ui-toast">
      <div
        v-for="item in toastState.items"
        :key="item.id"
        class="ui-toast"
        :class="`ui-toast--${item.tone}`"
        role="status"
        @click="dismissToast(item.id)"
      >
        <span class="ui-toast__dot" />
        <span class="ui-toast__message">{{ item.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ui-toast-stack {
  position: fixed;
  top: 1rem;
  left: 50%;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: max-content;
  max-width: calc(100vw - 2rem);
  transform: translateX(-50%);
  pointer-events: none;
}

.ui-toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.5rem));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  pointer-events: auto;
  cursor: pointer;
}

.ui-toast__message { white-space: pre-line; word-break: break-word; }

.ui-toast__dot {
  width: 0.5rem;
  height: 0.5rem;
  flex-shrink: 0;
  border-radius: 999px;
}

.ui-toast--success .ui-toast__dot { background: #059669; }
.ui-toast--error .ui-toast__dot { background: hsl(var(--destructive)); }
.ui-toast--warning .ui-toast__dot { background: #d97706; }
.ui-toast--info .ui-toast__dot { background: hsl(var(--primary)); }

.ui-toast-enter-active,
.ui-toast-leave-active { transition: opacity 0.2s, transform 0.2s; }
.ui-toast-enter-from,
.ui-toast-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
