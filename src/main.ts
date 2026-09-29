import { createApp, type Component } from 'vue'

import './assets/styles/pansou.css'

// /admin 下挂载管理后台，其余路径挂载客户搜索页。
// 两者按需加载，客户页面不会下载后台代码。
const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

// 两个 import() 必须放在各自的函数里：写在同一个三元 / if-else 里时，压缩器会把两处
// 预加载调用合并成一处（两者的依赖清单在压缩时还是同一个占位符），最终只保留客户页的清单，
// /admin 会加载客户页的 CSS，而 AdminApp 的 CSS 永远不会加载。开发模式下样式由组件自行注入，
// 看不出问题；构建产物由 src/__tests__/build-preload.spec.ts 检查。
const loadAdmin = (): Promise<{ default: Component }> => import('./admin/AdminApp.vue')
const loadCustomer = (): Promise<{ default: Component }> => import('./App.vue')
const loadRoot = isAdmin ? loadAdmin : loadCustomer

// naive-ui 的样式插入在这个 meta 之前。动态追加到 head 末尾，保证排在 Tailwind 之后，
// 否则 Tailwind 的 preflight 会覆盖 naive 按钮等组件的样式。
const naiveStyleAnchor = document.createElement('meta')
naiveStyleAnchor.name = 'naive-ui-style'
document.head.appendChild(naiveStyleAnchor)

loadRoot().then(({ default: Root }) => {
  createApp(Root).mount('#app')
})
