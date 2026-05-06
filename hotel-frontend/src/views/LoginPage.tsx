import { defineComponent, reactive, ref } from 'vue'
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import { useAuthStore, type Role } from '@/stores/auth'
import './LoginPage.css'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const auth = useAuthStore()
    const loading = ref(false)
    const currentRole = ref<Role>('user')

    const form = reactive({
      username: '',
      password: '',
    })

    const rules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '请输入 6 位及以上的密码', trigger: 'blur' },
      ],
    }

    const formRef = ref<InstanceType<typeof ElForm>>()

    function handleRoleChange() {
      form.username = ''
      form.password = ''
      formRef.value?.clearValidate()
    }

    async function submit() {
      if (!formRef.value) return
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return

      loading.value = true
      try {
        const resp = await http.post<ApiResponse<{ token: string; username: string; role: Role; avatar?: string }>>(
          `/api/${currentRole.value}/auth/login`,
          form,
        )
        if (!resp.data.success) {
          ElMessage.error(resp.data.message || '登录失败')
          return
        }
        auth.setAuth({
          token: resp.data.data.token,
          userRole: resp.data.data.role,
          userName: resp.data.data.username,
          avatarUrl: resp.data.data.avatar || null,
        })
        const homePath =
          currentRole.value === 'admin'
            ? '/admin/dashboard'
            : currentRole.value === 'merchant'
              ? '/merchant/dashboard'
              : '/user/hotels'
        await router.replace(homePath)
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          const data = e.response?.data
          if (
            data &&
            typeof data === 'object' &&
            'message' in data &&
            typeof (data as Record<string, unknown>).message === 'string'
          ) {
            ElMessage.error((data as Record<string, unknown>).message as string)
            return
          }
          ElMessage.error(e.message || '登录失败')
          return
        }
        ElMessage.error('登录失败')
      } finally {
        loading.value = false
      }
    }

    function fillDemo() {
      if (currentRole.value === 'admin') {
        form.username = 'admin'
        form.password = 'admin123'
      } else if (currentRole.value === 'merchant') {
        form.username = 'merchant1'
        form.password = 'merchant123'
      } else {
        form.username = 'user1'
        form.password = 'user123'
      }
      formRef.value?.clearValidate()
    }

    return () => (
      <div class="login-page">
        <ElCard class="login-card" bodyStyle={{ padding: '40px 32px' }}>
          <div class="login-header">
            <h1 class="login-title">小型酒店管理系统</h1>
            <p class="login-subtitle">
              {currentRole.value === 'admin' ? '管理员登录' : currentRole.value === 'merchant' ? '商家登录' : '用户登录'}
            </p>
            <div class="role-switch" role="tablist" aria-label="角色切换">
              <button
                type="button"
                class={`role-btn ${currentRole.value === 'admin' ? 'is-active' : ''}`}
                onClick={() => {
                  if (currentRole.value !== 'admin') {
                    currentRole.value = 'admin'
                    handleRoleChange()
                  }
                }}
              >
                管理员
              </button>
              <button
                type="button"
                class={`role-btn ${currentRole.value === 'merchant' ? 'is-active' : ''}`}
                onClick={() => {
                  if (currentRole.value !== 'merchant') {
                    currentRole.value = 'merchant'
                    handleRoleChange()
                  }
                }}
              >
                商家
              </button>
              <button
                type="button"
                class={`role-btn ${currentRole.value === 'user' ? 'is-active' : ''}`}
                onClick={() => {
                  if (currentRole.value !== 'user') {
                    currentRole.value = 'user'
                    handleRoleChange()
                  }
                }}
              >
                用户
              </button>
            </div>
          </div>

          <ElForm ref={formRef} model={form} rules={rules} labelPosition="top" hideRequiredAsterisk class="hotel-login-form">
            <ElFormItem label="用户名" prop="username">
              <ElInput v-model={form.username} autocomplete="username" placeholder="请输入用户名" />
            </ElFormItem>
            <ElFormItem label="密码" prop="password">
              <ElInput
                v-model={form.password}
                type="password"
                autocomplete="current-password"
                showPassword
                placeholder="请输入密码"
                onKeydown={(e) => {
                  if (e instanceof KeyboardEvent && e.key === 'Enter') submit()
                }}
              />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" class="login-submit-btn" loading={loading.value} onClick={submit}>
                登录
              </ElButton>
            </ElFormItem>
          </ElForm>

          <div class="login-footer">
            <ElButton text class="footer-action" onClick={fillDemo}>
              一键填充测试账号
            </ElButton>
            <RouterLink to="/user/register" class="footer-link">用户注册</RouterLink>
          </div>
        </ElCard>
      </div>
    )
  },
})
