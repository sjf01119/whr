import { defineComponent, onMounted, ref, reactive } from 'vue'
import { ElButton, ElCard, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElTable, ElTableColumn } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import { Check, CloseBold, Edit, Plus, VideoPlay } from '@element-plus/icons-vue'
import './AdminTheme.css'

type Merchant = {
  id: number
  username: string
  status: 'ENABLED' | 'DISABLED' | 'PENDING'
}

export default defineComponent({
  name: 'AdminMerchantsPage',
  setup() {
    const loading = ref(false)
    const items = ref<Merchant[]>([])
    
    const dialogVisible = ref(false)
    const saving = ref(false)
    const formRef = ref()
    const form = reactive({
      id: null as number | null,
      username: '',
      password: ''
    })

    const rules = {
      username: [{ required: true, message: '请输入商家账号', trigger: 'blur' }],
      password: [
        { required: form.id === null, message: '请输入登录密码', trigger: 'blur' },
        { min: 6, message: '密码至少6位', trigger: 'blur' }
      ]
    }

    async function load() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<PageResponse<Merchant>>>('/api/admin/merchants', {
          params: { page: 1, pageSize: 50 },
        })
        if (resp.data.success) items.value = resp.data.data.items
      } finally {
        loading.value = false
      }
    }

    function handleAdd() {
      form.id = null
      form.username = ''
      form.password = ''
      dialogVisible.value = true
      formRef.value?.clearValidate()
    }

    function handleEdit(row: Merchant) {
      form.id = row.id
      form.username = row.username
      form.password = ''
      dialogVisible.value = true
      formRef.value?.clearValidate()
    }

    async function save() {
      await formRef.value?.validate()
      saving.value = true
      try {
        if (form.id) {
          await http.put(`/api/admin/merchants/${form.id}`, form)
        } else {
          await http.post('/api/admin/merchants', form)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        await load()
      } catch (e: any) {
        ElMessage.error(e?.response?.data?.message || '保存失败')
      } finally {
        saving.value = false
      }
    }

    async function approve(id: number) {
      await http.post<ApiResponse<null>>(`/api/admin/merchants/${id}/approve`)
      ElMessage.success('已审核')
      await load()
    }

    async function toggle(id: number, enabled: boolean) {
      await http.post<ApiResponse<null>>(`/api/admin/merchants/${id}/${enabled ? 'enable' : 'disable'}`)
      ElMessage.success('已更新')
      await load()
    }

    onMounted(load)

    return () => (
      <div class="admin-page">
        <ElCard class="admin-card">
          <div class="toolbar-row">
            <span class="page-title">商家管理</span>
            <ElButton type="primary" class="admin-primary-btn" onClick={handleAdd}>
              <el-icon><Plus /></el-icon>
              新增商家
            </ElButton>
          </div>
        </ElCard>
        
        <ElCard class="admin-card">
          <div class="table-wrap">
            <ElTable data={items.value} class="admin-table" v-loading={loading.value} v-slots={{
              empty: () => <div class="admin-empty">暂无入驻商家数据</div>
            }}>
            <ElTableColumn prop="id" label="ID" width={90} align="center" />
            <ElTableColumn prop="username" label="账号" align="center" />
            <ElTableColumn
              prop="status"
              label="状态"
              width={120}
              align="center"
              v-slots={{
                default: ({ row }: { row: Merchant }) => {
                  const text = row.status === 'ENABLED' ? '启用' : row.status === 'PENDING' ? '待审核' : '禁用'
                  const cls = row.status === 'ENABLED' ? 'status-success' : row.status === 'PENDING' ? 'status-warning' : 'status-danger'
                  return <span class={`status-pill ${cls}`}>{text}</span>
                },
              }}
            />
            <ElTableColumn
              label="操作"
              width={260}
              align="center"
              v-slots={{
                default: ({ row }: { row: Merchant }) => (
                  <div class="action-group">
                    <button class="action-btn action-primary" onClick={() => handleEdit(row)}>
                      <el-icon><Edit /></el-icon>
                      编辑
                    </button>
                    <button
                      class="action-btn action-primary"
                      disabled={row.status !== 'PENDING'}
                      onClick={() => approve(row.id)}
                    >
                      <el-icon><Check /></el-icon>
                      审核通过
                    </button>
                    {row.status === 'DISABLED' ? (
                      <button class="action-btn action-success" onClick={() => toggle(row.id, true)}>
                        <el-icon><VideoPlay /></el-icon>
                        启用
                      </button>
                    ) : (
                      <button class="action-btn action-danger" onClick={() => toggle(row.id, false)}>
                        <el-icon><CloseBold /></el-icon>
                        禁用
                      </button>
                    )}
                  </div>
                ),
              }}
            />
            </ElTable>
          </div>
        </ElCard>

        <ElDialog
          v-model={dialogVisible.value}
          title={form.id ? '编辑商家' : '新增商家'}
          width="500px"
          v-slots={{
            footer: () => (
              <span>
                <ElButton onClick={() => (dialogVisible.value = false)}>取消</ElButton>
                <ElButton type="primary" loading={saving.value} onClick={save}>
                  确定
                </ElButton>
              </span>
            ),
          }}
        >
          <ElForm ref={formRef} model={form} rules={rules} labelWidth="100px">
            <ElFormItem label="商家账号" prop="username">
              <ElInput v-model={form.username} placeholder="请输入登录账号" />
            </ElFormItem>
            <ElFormItem label="登录密码" prop="password">
              <ElInput
                v-model={form.password}
                placeholder={form.id ? '不修改请留空' : '请输入登录密码'}
                type="password"
                showPassword
              />
            </ElFormItem>
          </ElForm>
        </ElDialog>
      </div>
    )
  },
})
