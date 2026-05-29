import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: { title: '首页', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/login/Register.vue'),
    meta: { title: '注册', guest: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
  {
    path: '/app',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/app/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: ':pathMatch(.*)*',
        redirect: '/app/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '仪表盘', requiresAuth: true },
      },
      {
        path: 'food',
        name: 'FoodRecord',
        component: () => import('@/views/food/FoodRecord.vue'),
        meta: { title: '饮食记录', requiresAuth: true },
      },
      {
        path: 'analyze',
        name: 'AiAnalyze',
        component: () => import('@/views/ai/AiAnalyze.vue'),
        meta: { title: 'AI 分析', requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

function hasToken() {
  return !!localStorage.getItem('token')
}

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 智能健康饮食` : '智能健康饮食'

  const loggedIn = hasToken()

  // 已登录用户访问登录/注册页 → 直接进入首页
  if (loggedIn && to.meta.guest) {
    next('/')
    return
  }

  // 未登录用户访问需要认证的页面 → 提示并跳转登录
  if (!loggedIn && to.meta.requiresAuth) {
    ElMessage.warning('请先登录后再访问')
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
