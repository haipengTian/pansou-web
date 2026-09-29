<script setup lang="ts">
import { NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
import { buildThemeOverrides } from './theme';

// 应用根节点的组件库配置：主题、中文语言包。App.vue 与 AdminApp.vue 的根都包在它里面。
const themeOverrides = buildThemeOverrides();
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN" preflight-style-disabled abstract>
    <slot />
  </NConfigProvider>
</template>
