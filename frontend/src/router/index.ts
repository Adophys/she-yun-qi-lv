import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layout/AdminLayout.vue'),
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '概览' },
        },
        {
          path: '/cultural-items',
          name: 'CulturalItems',
          component: () => import('@/views/CulturalItemsView.vue'),
          meta: { title: '文化图鉴' },
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = true // TODO: 接入真实认证状态
  if (!to.meta.public && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 畲韵奇旅管理端` : '畲韵奇旅管理端'
})

export default router
