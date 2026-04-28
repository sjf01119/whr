import { defineComponent, onMounted, ref } from 'vue'
import { ElButton, ElCard, ElMessage, ElTable, ElTableColumn, ElTag, ElTabs, ElTabPane } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'

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
        const resp = await http.get<ApiResponse<PageResponse<Hotel>>>('/api/admin/hotels', {
          params: { status: activeTab.value, page: 1, pageSize: 50 },
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
      <div>
        <ElCard style={{ marginBottom: '20px' }}>
          <ElTabs v-model={activeTab.value} onTabChange={load}>
            <ElTabPane label="全部" name="ALL" />
            <ElTabPane label="营业中" name="ONLINE" />
            <ElTabPane label="已歇业/禁用" name="OFFLINE" />
          </ElTabs>
        </ElCard>

        <ElCard>
          <ElTable data={items.value} v-loading={loading.value} style="width: 100%" v-slots={{
            empty: () => <div style={{ padding: '40px 0', textAlign: 'center', color: '#909399' }}>暂无对应状态的酒店数据</div>
          }}>
            <ElTableColumn prop="id" label="ID" width={80} />
            <ElTableColumn prop="name" label="酒店名称" />
            <ElTableColumn prop="merchantId" label="所属商家ID" width={100} />
            <ElTableColumn prop="address" label="地址" showOverflowTooltip />
            <ElTableColumn
              prop="status"
              label="营业状态"
              width={120}
              v-slots={{
                default: ({ row }: { row: Hotel }) => (
                  <ElTag type={row.status === 'ONLINE' ? 'success' : 'info'}>
                    {row.status === 'ONLINE' ? '营业中' : '已歇业/禁用'}
                  </ElTag>
                ),
              }}
            />
            <ElTableColumn
              label="操作"
              width={200}
              v-slots={{
                default: ({ row }: { row: Hotel }) => (
                  <>
                    <ElButton size="small" type="primary" link>查看详情</ElButton>
                    {row.status === 'OFFLINE' ? (
                      <ElButton
                        type="success"
                        link
                        size="small"
                        onClick={() => toggleStatus(row.id, true)}
                      >
                        启用
                      </ElButton>
                    ) : (
                      <ElButton
                        type="danger"
                        link
                        size="small"
                        onClick={() => toggleStatus(row.id, false)}
                      >
                        禁用
                      </ElButton>
                    )}
                  </>
                ),
              }}
            />
          </ElTable>
        </ElCard>
      </div>
    )
  },
})

