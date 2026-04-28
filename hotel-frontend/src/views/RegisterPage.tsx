import { defineComponent, reactive, ref } from 'vue'
import { ElButton, ElCard, ElDivider, ElForm, ElFormItem, ElInput, ElMessage, ElTag } from 'element-plus'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const form = reactive({
      username: '',
      password: '',
      password2: '',
    })

    async function submit() {
      if (!form.username || !form.password) {
        ElMessage.warning('请输入用户名和密码')
        return
      }
      if (form.password !== form.password2) {
        ElMessage.warning('两次密码不一致')
        return
      }
      loading.value = true
      try {
        const resp = await http.post<ApiResponse<null>>('/api/user/auth/register', {
          username: form.username,
          password: form.password,
        })
        if (!resp.data.success) {
          ElMessage.error(resp.data.message || '注册失败')
          return
        }
        ElMessage.success('注册成功，请登录')
        await router.replace('/user/login')
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
          ElMessage.error(e.message || '注册失败')
          return
        }
        ElMessage.error('注册失败')
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 16px',
          background: 'linear-gradient(135deg, #ecfeff 0%, #fff 55%, #f0fdf4 100%)',
        }}
      >
        <ElCard
          style={{ width: '100%', maxWidth: '420px' }}
          v-slots={{
            header: () => (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.2 }}>小型酒店管理系统</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>创建用户账号</div>
                </div>
                <ElTag type="success">用户注册</ElTag>
              </div>
            ),
          }}
        >
          <ElForm labelPosition="top">
            <ElFormItem label="用户名">
              <ElInput v-model={form.username} autocomplete="username" size="large" placeholder="请输入用户名" />
            </ElFormItem>
            <ElFormItem label="密码">
              <ElInput
                v-model={form.password}
                type="password"
                autocomplete="new-password"
                size="large"
                showPassword
                placeholder="请输入密码"
              />
            </ElFormItem>
            <ElFormItem label="确认密码">
              <ElInput
                v-model={form.password2}
                type="password"
                autocomplete="new-password"
                size="large"
                showPassword
                placeholder="请再次输入密码"
                onKeydown={(e) => {
                  if (e instanceof KeyboardEvent && e.key === 'Enter') submit()
                }}
              />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" size="large" loading={loading.value} onClick={submit} style="width: 100%">
                注册
              </ElButton>
            </ElFormItem>
          </ElForm>

          <ElDivider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RouterLink to="/user/login" style={{ color: '#409eff', fontSize: '14px' }}>
              已有账号？去登录
            </RouterLink>
          </div>
        </ElCard>
      </div>
    )
  },
})
