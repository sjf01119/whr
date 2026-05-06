<template>
  <el-container class="merchant-layout">
    <el-aside
      :width="isSidebarCollapsed ? '72px' : '220px'"
      class="merchant-aside"
      :class="{ 'is-mobile-open': mobileSidebarOpen }"
    >
      <div class="aside-title">
        <span v-if="!isSidebarCollapsed">酒店管理 - 商家</span>
        <span v-else>商家</span>
      </div>
      <el-menu
        :default-active="$route.path"
        :collapse="isSidebarCollapsed"
        class="merchant-menu"
        router
      >
        <el-menu-item index="/merchant/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/merchant/hotel">
          <el-icon><OfficeBuilding /></el-icon>
          <span>酒店信息</span>
        </el-menu-item>
        <el-menu-item index="/merchant/room-types">
          <el-icon><House /></el-icon>
          <span>房型管理</span>
        </el-menu-item>
        <el-menu-item index="/merchant/orders">
          <el-icon><Tickets /></el-icon>
          <span>订单处理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <div
      v-if="isMobile && mobileSidebarOpen"
      class="aside-mask"
      @click="mobileSidebarOpen = false"
    />

    <el-container class="merchant-main-shell">
      <el-header class="merchant-header">
        <div class="header-left">
          <el-button
            class="collapse-btn"
            text
            @click="toggleSidebar"
          >
            <el-icon>
              <Fold v-if="!isSidebarCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <div class="header-title">
            {{ currentTitle }}
          </div>
        </div>
        <div class="header-user">
          <template v-if="auth.isAuthed">
            <span class="merchant-badge">商家</span>
            <el-dropdown trigger="click" @command="handleUserCommand">
              <div class="user-dropdown-trigger">
                <el-avatar class="user-avatar" :size="32" :src="auth.avatarUrl || '/default-avatar.svg'">{{ avatarText }}</el-avatar>
                <span class="merchant-name">{{ displayName }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <el-button v-else class="login-entry-btn" link @click="router.push('/login')">登录</el-button>
        </div>
      </el-header>
      
      <el-main class="merchant-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowDown, DataAnalysis, Expand, Fold, House, OfficeBuilding, Tickets } from '@element-plus/icons-vue'

import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isMobile = ref(false)
const isSidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const titles: Record<string, string> = {
  '/merchant/dashboard': '控制台',
  '/merchant/hotel': '酒店信息维护',
  '/merchant/room-types': '房型管理',
  '/merchant/orders': '订单处理',
  '/merchant/profile': '个人中心',
}

const currentTitle = computed(() => titles[route.path] || '商家后台')
const displayName = computed(() => auth.userName || '未登录')
const avatarText = computed(() => (auth.userName?.trim().charAt(0) || 'M').toUpperCase())

function handleResize() {
  isMobile.value = window.innerWidth <= 992
  if (isMobile.value) {
    isSidebarCollapsed.value = true
  } else {
    mobileSidebarOpen.value = false
  }
}

function toggleSidebar() {
  if (isMobile.value) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
    return
  }
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

watch(
  () => route.path,
  () => {
    if (isMobile.value) {
      mobileSidebarOpen.value = false
    }
  },
)

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

function logout() {
  auth.clear()
  ElMessage.success('退出成功')
  router.replace('/login')
}

function handleUserCommand(command: string | number | object) {
  if (command === 'logout') {
    logout()
    return
  }
  if (command === 'profile') {
    router.push('/merchant/profile')
  }
}
</script>

<style scoped>
.merchant-layout {
  height: 100vh;
  background: #f5f7fa;
}

.merchant-aside {
  position: relative;
  z-index: 11;
  background: #2c3e50;
  transition: width 0.3s ease, transform 0.3s ease;
}

.aside-title {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  border-bottom: 1px solid rgba(236, 240, 241, 0.2);
}

.merchant-menu {
  border-right: none;
  background: #2c3e50;
  padding-top: 12px;
}

:deep(.merchant-menu .el-menu-item) {
  height: 46px;
  margin: 0 10px 12px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  padding-left: 16px !important;
  padding-right: 16px !important;
  transition: all 0.3s ease;
}

:deep(.merchant-menu .el-menu-item .el-icon) {
  margin-right: 10px;
  font-size: 16px;
}

:deep(.merchant-menu .el-menu-item:hover) {
  background: #34495e;
  color: #fff;
}

:deep(.merchant-menu .el-menu-item.is-active) {
  background: #3b82f6;
  color: #fff;
}

.merchant-main-shell {
  min-width: 0;
}

.merchant-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-btn {
  font-size: 18px;
  color: #5f6b7a;
  transition: color 0.3s ease;
}

.collapse-btn:hover {
  color: #3b82f6;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #5f6b7a;
  transition: color 0.3s ease;
}

.user-dropdown-trigger:hover {
  color: #3b82f6;
}

.user-avatar {
  background: #fff2df;
  color: #f59e0b;
  font-weight: 700;
}

.dropdown-icon {
  font-size: 12px;
}

.merchant-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  background: #f59e0b;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.merchant-name {
  font-size: 14px;
  color: #5f6b7a;
}

.logout-btn {
  color: #5f6b7a;
  transition: color 0.3s ease;
}

.logout-btn:hover {
  color: #3b82f6;
}

.login-entry-btn {
  color: #5f6b7a;
  transition: color 0.3s ease;
}

.login-entry-btn:hover {
  color: #3b82f6;
}

.merchant-main {
  background: #f5f7fa;
  padding: 20px;
}

.aside-mask {
  display: none;
}

@media (max-width: 992px) {
  .merchant-aside {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 220px !important;
    transform: translateX(-100%);
  }

  .merchant-aside.is-mobile-open {
    transform: translateX(0);
  }

  .aside-mask {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 10;
    background: rgba(15, 23, 42, 0.35);
  }
}
</style>
