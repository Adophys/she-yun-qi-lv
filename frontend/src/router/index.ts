import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/api/auth'

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
          meta: { title: '数据看板' },
        },
        {
          path: '/cultural-items',
          name: 'CulturalItems',
          component: () => import('@/views/CulturalItemsView.vue'),
          meta: { title: '文化图鉴' },
        },
        {
          path: '/chapters',
          name: 'Chapters',
          component: () => import('@/views/ChaptersView.vue'),
          meta: { title: '章节关卡' },
        },
        {
          path: '/points',
          name: 'Points',
          component: () => import('@/views/PointsView.vue'),
          meta: { title: '点位管理' },
        },
        {
          path: '/products',
          name: 'Products',
          component: () => import('@/views/ProductsView.vue'),
          meta: { title: '商品管理' },
        },
        {
          path: '/orders',
          name: 'Orders',
          component: () => import('@/views/OrdersView.vue'),
          meta: { title: '订单管理' },
        },
        {
          path: '/users',
          name: 'UserManage',
          component: () => import('@/views/UserManageView.vue'),
          meta: { title: '用户管理' },
        },
      ],
    },
    // 404 兜底
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ── 路由守卫 ──────────────────────────────────────────────────

router.beforeEach((to, _from, next) => {
  // 公开页面直接放行
  if (to.meta.public) {
    // 已登录用户访问登录页，重定向到首页
    if (to.name === 'Login' && isAuthenticated()) {
      return next('/')
    }
    return next()
  }

  // 需要认证的页面
  if (!isAuthenticated()) {
    // 保存目标路径，登录后跳回
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  next()
})

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} - 畲韵奇旅管理端`
    : '畲韵奇旅管理端'
})

export default router
