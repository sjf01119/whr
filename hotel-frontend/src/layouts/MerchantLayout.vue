<template>
  <el-container style="height: 100vh">
    <el-aside width="220px" style="background-color: #304156">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold; border-bottom: 1px solid #1f2d3d">
        酒店管理 - 商家
      </div>
      <el-menu
        :default-active="$route.path"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#e6a23c"
        router
        style="border-right: none"
      >
        <el-menu-item index="/merchant/dashboard">
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/merchant/hotel">
          <span>酒店信息</span>
        </el-menu-item>
        <el-menu-item index="/merchant/room-types">
          <span>房型管理</span>
        </el-menu-item>
        <el-menu-item index="/merchant/orders">
          <span>订单处理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="background-color: white; border-bottom: 1px solid #e6e6e6; display: flex; justify-content: space-between; align-items: center; padding: 0 20px">
        <div style="font-weight: 500; font-size: 16px; color: #303133">
          {{ currentTitle }}
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <el-tag type="warning" effect="dark" size="small">商家</el-tag>
          <span style="font-size: 14px; color: #606266">{{ auth.userName }}</span>
          <el-button type="primary" link @click="logout">退出登录</el-button>
        </div>
      </el-header>
      
      <el-main style="background-color: #f0f2f5; padding: 20px">
        <RouterView />
      </el-main>
    </el-container>
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

const titles: Record<string, string> = {
  '/merchant/dashboard': '控制台',
  '/merchant/hotel': '酒店信息维护',
  '/merchant/room-types': '房型管理',
  '/merchant/orders': '订单处理',
}

const currentTitle = computed(() => titles[route.path] || '商家后台')

function logout() {
  auth.clear()
  ElMessage.success('退出成功')
  router.replace('/login')
}
</script>

