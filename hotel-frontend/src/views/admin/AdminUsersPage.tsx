import { defineComponent, onMounted, ref } from 'vue'
import { ElCard, ElDescriptions, ElDescriptionsItem, ElDialog, ElMessage, ElTable, ElTableColumn } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import { CloseBold, View } from '@element-plus/icons-vue'
import './AdminTheme.css'

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
      <div class="admin-page">
        <ElCard class="admin-card">
          <div class="filter-tabs">
            {[
              { key: 'ALL', label: '全部' },
              { key: 'ENABLED', label: '正常' },
              { key: 'DISABLED', label: '禁用' },
            ].map((tab) => (
              <button
                key={tab.key}
                class={`filter-tab ${activeTab.value === tab.key ? 'active' : ''}`}
                onClick={() => {
                  activeTab.value = tab.key
                  load()
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </ElCard>

        <ElCard class="admin-card">
          <div class="table-wrap">
          <ElTable data={items.value} class="admin-table" v-loading={loading.value} v-slots={{
            empty: () => <div class="admin-empty">暂无注册用户数据</div>
          }}>
            <ElTableColumn prop="id" label="ID" width={90} align="center" />
            <ElTableColumn prop="username" label="用户名" align="center" />
            <ElTableColumn
              prop="status"
              label="状态"
              width={120}
              align="center"
              v-slots={{
                default: ({ row }: { row: User }) => <span class={`status-pill ${row.status === 'ENABLED' ? 'status-success' : 'status-danger'}`}>{row.status === 'ENABLED' ? '正常' : '禁用'}</span>,
              }}
            />
            <ElTableColumn
              label="操作"
              width={200}
              align="center"
              v-slots={{
                default: ({ row }: { row: User }) => (
                  <div class="action-group">
                    <button class="action-btn action-primary" onClick={() => viewDetail(row)}>
                      <el-icon><View /></el-icon>
                      查看详情
                    </button>
                    {row.status === 'DISABLED' ? (
                      <button class="action-btn action-success" onClick={() => toggleStatus(row.id, true)}>
                        启用
                      </button>
                    ) : (
                      <button class="action-btn action-danger" onClick={() => toggleStatus(row.id, false)}>
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

        <ElDialog v-model={detailVisible.value} title="用户详情" width="500px">
          {currentUser.value && (
            <ElDescriptions column={1} border>
              <ElDescriptionsItem label="用户ID">{currentUser.value.id}</ElDescriptionsItem>
              <ElDescriptionsItem label="用户名">{currentUser.value.username}</ElDescriptionsItem>
              <ElDescriptionsItem label="账号角色">普通用户</ElDescriptionsItem>
              <ElDescriptionsItem label="账号状态">
                <span class={`status-pill ${currentUser.value.status === 'ENABLED' ? 'status-success' : 'status-danger'}`}>
                  {currentUser.value.status === 'ENABLED' ? '正常' : '禁用'}
                </span>
              </ElDescriptionsItem>
            </ElDescriptions>
          )}
        </ElDialog>
      </div>
    )
  },
})
