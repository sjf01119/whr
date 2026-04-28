import { defineComponent, onMounted, ref } from 'vue'
import { ElButton, ElCard, ElMessage, ElTable, ElTableColumn, ElTag, ElTabs, ElTabPane, ElDialog, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'

type User = {
  id: number
  username: string
  role: string
  status: 'ENABLED' | 'DISABLED'
}

export default defineComponent({
  name: 'AdminUsersPage',
  setup() {
    const loading = ref(false)
    const items = ref<User[]>([])
    const activeTab = ref('ALL')
    const detailVisible = ref(false)
    const currentUser = ref<User | null>(null)

    async function load() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<PageResponse<User>>>('/api/admin/users', {
          params: { status: activeTab.value, page: 1, pageSize: 50 },
        })
        if (resp.data.success) items.value = resp.data.data.items
      } finally {
        loading.value = false
      }
    }

    async function toggleStatus(id: number, enable: boolean) {
      await http.post<ApiResponse<null>>(`/api/admin/users/${id}/${enable ? 'enable' : 'disable'}`)
      ElMessage.success(enable ? '已启用' : '已禁用')
      await load()
    }

    function viewDetail(row: User) {
      currentUser.value = row
      detailVisible.value = true
    }

    onMounted(load)

    return () => (
      <div>
        <ElCard style={{ marginBottom: '20px' }}>
          <ElTabs v-model={activeTab.value} onTabChange={load}>
            <ElTabPane label="全部" name="ALL" />
            <ElTabPane label="正常" name="ENABLED" />
            <ElTabPane label="禁用" name="DISABLED" />
          </ElTabs>
        </ElCard>

        <ElCard>
          <ElTable data={items.value} v-loading={loading.value} style="width: 100%" v-slots={{
            empty: () => <div style={{ padding: '40px 0', textAlign: 'center', color: '#909399' }}>暂无注册用户数据</div>
          }}>
            <ElTableColumn prop="id" label="ID" width={90} />
            <ElTableColumn prop="username" label="用户名" />
            <ElTableColumn
              prop="status"
              label="状态"
              width={120}
              v-slots={{
                default: ({ row }: { row: User }) => (
                  <ElTag type={row.status === 'ENABLED' ? 'success' : 'info'}>
                    {row.status === 'ENABLED' ? '正常' : '禁用'}
                  </ElTag>
                ),
              }}
            />
            <ElTableColumn
              label="操作"
              width={200}
              v-slots={{
                default: ({ row }: { row: User }) => (
                  <>
                    <ElButton size="small" type="primary" link onClick={() => viewDetail(row)}>查看详情</ElButton>
                    {row.status === 'DISABLED' ? (
                      <ElButton size="small" type="success" link onClick={() => toggleStatus(row.id, true)}>
                        启用
                      </ElButton>
                    ) : (
                      <ElButton size="small" type="danger" link onClick={() => toggleStatus(row.id, false)}>
                        禁用
                      </ElButton>
                    )}
                  </>
                ),
              }}
            />
          </ElTable>
        </ElCard>

        <ElDialog v-model={detailVisible.value} title="用户详情" width="500px">
          {currentUser.value && (
            <ElDescriptions column={1} border>
              <ElDescriptionsItem label="用户ID">{currentUser.value.id}</ElDescriptionsItem>
              <ElDescriptionsItem label="用户名">{currentUser.value.username}</ElDescriptionsItem>
              <ElDescriptionsItem label="账号角色">普通用户</ElDescriptionsItem>
              <ElDescriptionsItem label="账号状态">
                <ElTag type={currentUser.value.status === 'ENABLED' ? 'success' : 'info'}>
                  {currentUser.value.status === 'ENABLED' ? '正常' : '禁用'}
                </ElTag>
              </ElDescriptionsItem>
            </ElDescriptions>
          )}
        </ElDialog>
      </div>
    )
  },
})

