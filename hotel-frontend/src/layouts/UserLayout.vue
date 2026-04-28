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

      <div style="display: flex; align-items: center; gap: 12px">
        <el-tag type="success" effect="dark" size="small">用户</el-tag>
        <span style="font-size: 14px; color: #606266">{{ auth.userName }}</span>
        <el-button type="primary" link size="small" @click="logout">
          退出登录
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

import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeMenu = computed(() => {
  if (route.path.startsWith('/user/hotels')) return '/user/hotels'
  if (route.path.startsWith('/user/orders')) return '/user/orders'
  return route.path
})

function logout() {
  auth.clear()
  ElMessage.success('退出成功')
  router.replace('/login')
}
</script>

