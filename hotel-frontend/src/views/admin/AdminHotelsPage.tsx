import { defineComponent, onMounted, ref } from 'vue'
import { ElCard, ElMessage, ElTable, ElTableColumn } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import { CloseBold, View } from '@element-plus/icons-vue'
import './AdminTheme.css'

type Hotel = {
  id: number
  merchantId: number
  name: string
  status: 'ONLINE' | 'OFFLINE'
  address: string
  phone: string
  createdAt: string
}

export default defineComponent({
  name: 'AdminHotelsPage',
  setup() {
    const loading = ref(false)
    const items = ref<Hotel[]>([])
    const activeTab = ref('ALL')

    async function load() {
      loading.value = true
      try {
        const statusParam = activeTab.value === 'DISABLED' ? 'OFFLINE' : activeTab.value
        const resp = await http.get<ApiResponse<PageResponse<Hotel>>>('/api/admin/hotels', {
          params: { status: statusParam, page: 1, pageSize: 50 },
        })
        if (resp.data.success) items.value = resp.data.data.items
      } finally {
        loading.value = false
      }
    }

    async function toggleStatus(id: number, enable: boolean) {
      await http.post<ApiResponse<null>>(`/api/admin/hotels/${id}/${enable ? 'enable' : 'offline'}`)
      ElMessage.success(enable ? '已启用' : '已禁用(下架)')
      await load()
    }

    onMounted(load)

    return () => (
      <div class="admin-page">
        <ElCard class="admin-card">
          <div class="filter-tabs">
            {[
              { key: 'ALL', label: '全部' },
              { key: 'ONLINE', label: '营业中' },
              { key: 'OFFLINE', label: '已歇业' },
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
            empty: () => <div class="admin-empty">暂无对应状态的酒店数据</div>
          }}>
            <ElTableColumn prop="id" label="ID" width={80} align="center" />
            <ElTableColumn prop="name" label="酒店名称" minWidth={170} align="center" />
            <ElTableColumn prop="merchantId" label="所属商家ID" width={120} align="center" />
            <ElTableColumn prop="address" label="地址" minWidth={260} showOverflowTooltip align="center" />
            <ElTableColumn
              prop="status"
              label="营业状态"
              width={120}
              align="center"
              v-slots={{
                default: ({ row }: { row: Hotel }) => {
                  const isOnline = row.status === 'ONLINE'
                  return <span class={`status-pill ${isOnline ? 'status-success' : 'status-danger'}`}>{isOnline ? '营业中' : '已歇业/禁用'}</span>
                },
              }}
            />
            <ElTableColumn
              label="操作"
              width={200}
              align="center"
              v-slots={{
                default: ({ row }: { row: Hotel }) => (
                  <div class="action-group">
                    <button class="action-btn action-primary">
                      <el-icon><View /></el-icon>
                      查看详情
                    </button>
                    {row.status === 'OFFLINE' ? (
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
      </div>
    )
  },
})
