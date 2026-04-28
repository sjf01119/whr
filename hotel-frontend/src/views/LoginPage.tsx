import { defineComponent, reactive, ref } from 'vue'
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage, ElRadioGroup, ElRadioButton } from 'element-plus'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import { useAuthStore, type Role } from '@/stores/auth'

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
        const resp = await http.post<ApiResponse<{ token: string; username: string; role: Role }>>(
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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 16px',
          background:
            currentRole.value === 'admin'
              ? 'linear-gradient(135deg, #fef2f2 0%, #fff 55%, #eff6ff 100%)'
              : currentRole.value === 'merchant'
                ? 'linear-gradient(135deg, #fffbeb 0%, #fff 55%, #eff6ff 100%)'
                : 'linear-gradient(135deg, #ecfeff 0%, #fff 55%, #f0fdf4 100%)',
        }}
      >
        <ElCard
          style={{ width: '100%', maxWidth: '420px' }}
          v-slots={{
            header: () => (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#303133' }}>小型酒店管理系统</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#606266' }}>
                  {currentRole.value === 'admin' ? '管理员登录' : currentRole.value === 'merchant' ? '商家登录' : '用户登录'}
                </div>
                <ElRadioGroup v-model={currentRole.value} onChange={handleRoleChange} size="large" style={{ width: '100%' }}>
                  <ElRadioButton label="admin" style={{ flex: 1, textAlign: 'center' }}>管理员</ElRadioButton>
                  <ElRadioButton label="merchant" style={{ flex: 1, textAlign: 'center' }}>商家</ElRadioButton>
                  <ElRadioButton label="user" style={{ flex: 1, textAlign: 'center' }}>用户</ElRadioButton>
                </ElRadioGroup>
              </div>
            ),
          }}
        >
          <ElForm ref={formRef} model={form} rules={rules} labelPosition="top" hideRequiredAsterisk>
            <ElFormItem label="用户名" prop="username">
              <ElInput v-model={form.username} autocomplete="username" size="large" placeholder="请输入用户名" />
            </ElFormItem>
            <ElFormItem label="密码" prop="password">
              <ElInput
                v-model={form.password}
                type="password"
                autocomplete="current-password"
                size="large"
                showPassword
                placeholder="请输入密码"
                onKeydown={(e) => {
                  if (e instanceof KeyboardEvent && e.key === 'Enter') submit()
                }}
              />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" size="large" loading={loading.value} onClick={submit} style="width: 100%; margin-top: 12px">
                登录
              </ElButton>
            </ElFormItem>
          </ElForm>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <ElButton text type="info" onClick={fillDemo}>
              一键填充测试账号
            </ElButton>
            {currentRole.value === 'user' ? (
              <RouterLink to="/user/register" style={{ color: '#409eff', fontSize: '14px', textDecoration: 'none' }}>
                没有账号？去注册
              </RouterLink>
            ) : (
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>默认已提供测试账号</span>
            )}
          </div>
        </ElCard>
      </div>
    )
  },
})
