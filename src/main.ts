import { createApp, type Component } from 'vue'

import './assets/styles/pansou.css'

// /admin 下挂载管理后台，其余路径挂载客户搜索页。
// 两者按需加载，客户页面不会下载后台代码。
const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

const loadRoot = (): Promise<{ default: Component }> =>
  isAdmin ? import('./admin/AdminApp.vue') : import('./App.vue')

loadRoot().then(({ default: Root }) => {
  createApp(Root).mount('#app')
})
