import { createApp, type Component } from 'vue'

import './assets/styles/pansou.css'

// /admin 下挂载管理后台，其余路径挂载客户搜索页。
// 两者按需加载，客户页面不会下载后台代码。
const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

const loadRoot = (): Promise<{ default: Component }> =>
  isAdmin ? import('./admin/AdminApp.vue') : import('./App.vue')

// naive-ui 的样式插入在这个 meta 之前。动态追加到 head 末尾，保证排在 Tailwind 之后，
// 否则 Tailwind 的 preflight 会覆盖 naive 按钮等组件的样式。
const naiveStyleAnchor = document.createElement('meta')
naiveStyleAnchor.name = 'naive-ui-style'
document.head.appendChild(naiveStyleAnchor)

loadRoot().then(({ default: Root }) => {
  createApp(Root).mount('#app')
})
