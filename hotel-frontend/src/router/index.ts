import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/layouts/AdminLayout.vue'
import MerchantLayout from '@/layouts/MerchantLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import LoginPage from '@/views/LoginPage'
import RegisterPage from '@/views/RegisterPage'
import ForbiddenPage from '@/views/common/ForbiddenPage'
import NotFoundPage from '@/views/common/NotFoundPage'

import AdminDashboardPage from '@/views/admin/AdminDashboardPage'
import AdminHotelsPage from '@/views/admin/AdminHotelsPage'
import AdminMerchantsPage from '@/views/admin/AdminMerchantsPage'
import AdminOrdersPage from '@/views/admin/AdminOrdersPage'
import AdminProfilePage from '@/views/admin/AdminProfilePage'
import AdminUsersPage from '@/views/admin/AdminUsersPage'

import MerchantDashboardPage from '@/views/merchant/MerchantDashboardPage'
import MerchantHotelPage from '@/views/merchant/MerchantHotelPage'
import MerchantOrdersPage from '@/views/merchant/MerchantOrdersPage'
import MerchantProfilePage from '@/views/merchant/MerchantProfilePage'
import MerchantRoomTypesPage from '@/views/merchant/MerchantRoomTypesPage'

import UserHotelDetailPage from '@/views/user/UserHotelDetailPage'
import UserHotelsPage from '@/views/user/UserHotelsPage'
import UserOrdersPage from '@/views/user/UserOrdersPage'
import UserProfilePage from '@/views/user/UserProfilePage'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/403',
      component: ForbiddenPage,
    },
    {
      path: '/login',
      component: LoginPage,
    },
    {
      path: '/admin/login',
      redirect: '/login',
    },
    {
      path: '/merchant/login',
      redirect: '/login',
    },
    {
      path: '/user/login',
      redirect: '/login',
    },
    {
      path: '/user/register',
      component: RegisterPage,
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: 'dashboard', component: AdminDashboardPage },
        { path: 'merchant-manage', component: AdminMerchantsPage },
        { path: 'hotel-supervise', component: AdminHotelsPage },
        { path: 'order-supervise', component: AdminOrdersPage },
        { path: 'user-manage', component: AdminUsersPage },
        { path: 'profile', component: AdminProfilePage },
        { path: '', redirect: '/admin/dashboard' },
      ],
    },
    {
      path: '/merchant',
      component: MerchantLayout,
      meta: { requiresAuth: true, role: 'merchant' },
      children: [
        { path: 'dashboard', component: MerchantDashboardPage },
        { path: 'hotel', component: MerchantHotelPage },
        { path: 'room-types', component: MerchantRoomTypesPage },
        { path: 'orders', component: MerchantOrdersPage },
        { path: 'profile', component: MerchantProfilePage },
        { path: '', redirect: '/merchant/dashboard' },
      ],
    },
    {
      path: '/user',
      component: UserLayout,
      meta: { requiresAuth: true, role: 'user' },
      children: [
        { path: 'dashboard', redirect: '/user/hotels' },
        { path: 'hotels', component: UserHotelsPage },
        { path: 'hotels/:id', component: UserHotelDetailPage },
        { path: 'orders', component: UserOrdersPage },
        { path: 'profile', component: UserProfilePage },
        { path: '', redirect: '/user/hotels' },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFoundPage,
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // 1. 已登录用户访问登录页 -> 直接跳转对应角色的首页
  if (to.path === '/login' || to.path === '/user/register') {
    if (auth.isAuthed) {
      if (auth.userRole === 'admin') return '/admin/dashboard'
      if (auth.userRole === 'merchant') return '/merchant/dashboard'
      if (auth.userRole === 'user') return '/user/hotels'
    }
    return true
  }

  // 2. 需要鉴权的页面拦截
  const requiresAuth = Boolean(to.meta.requiresAuth)
  const role = to.meta.role as string | undefined

  if (requiresAuth) {
    if (!auth.isAuthed) {
      return '/login' // 未登录强制跳登录页
    }
    
    // 3. 跨角色访问拦截 -> 强制跳回自己角色的首页
    if (role && auth.userRole !== role) {
      if (auth.userRole === 'admin') return '/admin/dashboard'
      if (auth.userRole === 'merchant') return '/merchant/dashboard'
      if (auth.userRole === 'user') return '/user/hotels'
    }
  }
  
  return true
})

export default router
