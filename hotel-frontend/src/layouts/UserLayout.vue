<template>
  <el-container style="height: 100vh; display: flex; flex-direction: column">
    <el-header
      style="
        background-color: white;
        border-bottom: 1px solid #e6e6e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 40px;
        flex-shrink: 0;
      "
    >
      <div style="display: flex; align-items: center; gap: 32px">
        <div style="font-size: 20px; font-weight: bold; color: #409eff; cursor: pointer" @click="router.push('/user/hotels')">
          小型酒店预订系统
        </div>
        <el-menu :default-active="activeMenu" mode="horizontal" router style="border-bottom: none; height: 59px">
          <el-menu-item index="/user/hotels">找酒店</el-menu-item>
          <el-menu-item index="/user/orders">我的订单</el-menu-item>
        </el-menu>
      </div>

      <div class="header-user">
        <template v-if="auth.isAuthed">
          <el-tag type="success" effect="dark" size="small">用户</el-tag>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-dropdown-trigger">
              <el-avatar class="user-avatar" :size="32" :src="auth.avatarUrl || '/default-avatar.svg'">{{ avatarText }}</el-avatar>
              <span class="user-name">{{ displayName }}</span>
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
        <el-button v-else class="login-entry-btn" type="primary" link size="small" @click="router.push('/login')">
          登录
        </el-button>
      </div>
    </el-header>

    <el-main style="background-color: #f5f7fa; padding: 24px; flex-grow: 1; overflow-y: auto">
      <div style="max-width: 1200px; margin: 0 auto">
        <RouterView />
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowDown } from '@element-plus/icons-vue'

import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeMenu = computed(() => {
  if (route.path.startsWith('/user/hotels')) return '/user/hotels'
  if (route.path.startsWith('/user/orders')) return '/user/orders'
  return route.path
})
const displayName = computed(() => auth.userName || '未登录')
const avatarText = computed(() => (auth.userName?.trim().charAt(0) || 'U').toUpperCase())

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
    router.push('/user/profile')
  }
}
</script>

<style scoped>
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
  color: #606266;
  transition: color 0.3s ease;
}

.user-dropdown-trigger:hover {
  color: #3b82f6;
}

.user-avatar {
  background: #eafaf3;
  color: #10b981;
  font-weight: 700;
}

.user-name {
  font-size: 14px;
  color: inherit;
}

.dropdown-icon {
  font-size: 12px;
}

.login-entry-btn {
  transition: color 0.3s ease;
}
</style>
