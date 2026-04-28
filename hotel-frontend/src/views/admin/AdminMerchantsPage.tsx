import { defineComponent, onMounted, ref, reactive } from 'vue'
import { ElButton, ElCard, ElMessage, ElTable, ElTableColumn, ElTag, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'

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
      <div>
        <ElCard style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>商家管理</span>
            <ElButton type="primary" onClick={handleAdd}>新增商家</ElButton>
          </div>
        </ElCard>
        
        <ElCard>
          <ElTable data={items.value} v-loading={loading.value} style="width: 100%" v-slots={{
            empty: () => <div style={{ padding: '40px 0', textAlign: 'center', color: '#909399' }}>暂无入驻商家数据</div>
          }}>
            <ElTableColumn prop="id" label="ID" width={90} />
            <ElTableColumn prop="username" label="账号" />
            <ElTableColumn
              prop="status"
              label="状态"
              width={120}
              v-slots={{
                default: ({ row }: { row: Merchant }) => {
                  const type = row.status === 'ENABLED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'info'
                  const text = row.status === 'ENABLED' ? '启用' : row.status === 'PENDING' ? '待审核' : '禁用'
                  return <ElTag type={type}>{text}</ElTag>
                },
              }}
            />
            <ElTableColumn
              label="操作"
              width={260}
              v-slots={{
                default: ({ row }: { row: Merchant }) => (
                  <>
                    <ElButton size="small" type="primary" link onClick={() => handleEdit(row)}>
                      编辑
                    </ElButton>
                    <ElButton
                      type="primary"
                      link
                      size="small"
                      disabled={row.status !== 'PENDING'}
                      onClick={() => approve(row.id)}
                    >
                      审核通过
                    </ElButton>
                    {row.status === 'DISABLED' ? (
                      <ElButton size="small" type="success" link onClick={() => toggle(row.id, true)}>
                        启用
                      </ElButton>
                    ) : (
                      <ElButton size="small" type="danger" link onClick={() => toggle(row.id, false)}>
                        禁用
                      </ElButton>
                    )}
                  </>
                ),
              }}
            />
          </ElTable>
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

