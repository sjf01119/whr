import { defineComponent, onMounted, ref, computed } from 'vue'
import { ElButton, ElCard, ElMessage, ElTag, ElTabs, ElTabPane, ElEmpty, ElDialog, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'

type Order = {
  id: number
  orderNo: string
  hotelName: string
  roomTypeName: string
  checkinDate: string
  checkoutDate: string
  amount: string
  status: string
  createdAt: string
}

const statusMap: Record<string, { label: string; type: any }> = {
  CREATED: { label: '待确认', type: 'warning' },
  PAID: { label: '已确认', type: 'success' },
  CHECKED_IN: { label: '已入住', type: 'primary' },
  COMPLETED: { label: '已完成', type: 'info' },
  CANCELED: { label: '已取消', type: 'info' },
}

export default defineComponent({
  name: 'UserOrdersPage',
  setup() {
    const loading = ref(false)
    const items = ref<Order[]>([])
    const activeTab = ref('ALL')
    
    const detailVisible = ref(false)
    const currentOrder = ref<Order | null>(null)

    async function load() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<PageResponse<Order>>>('/api/user/orders', {
          params: { page: 1, pageSize: 50 },
        })
        if (resp.data.success) items.value = resp.data.data.items
      } finally {
        loading.value = false
      }
    }

    async function cancel(id: number) {
      await http.post<ApiResponse<null>>(`/api/user/orders/${id}/cancel`)
      ElMessage.success('已取消')
      await load()
    }
    
    function showDetail(order: Order) {
      currentOrder.value = order
      detailVisible.value = true
    }

    const filteredItems = computed(() => {
      if (activeTab.value === 'ALL') return items.value
      return items.value.filter(o => o.status === activeTab.value)
    })

    onMounted(load)

    return () => (
      <div>
        <ElCard style={{ marginBottom: '20px' }}>
          <ElTabs v-model={activeTab.value}>
            <ElTabPane label="全部" name="ALL" />
            <ElTabPane label="待确认" name="CREATED" />
            <ElTabPane label="已确认" name="PAID" />
            <ElTabPane label="已入住" name="CHECKED_IN" />
            <ElTabPane label="已完成" name="COMPLETED" />
            <ElTabPane label="已取消" name="CANCELED" />
          </ElTabs>
        </ElCard>

        <div v-loading={loading.value}>
          {filteredItems.value.length === 0 ? (
            <ElEmpty description="暂无对应状态的订单" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredItems.value.map(order => {
                const s = statusMap[order.status] || { label: order.status, type: 'info' }
                return (
                  <ElCard key={order.id} bodyStyle={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebeef5', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#909399' }}>
                        订单号：{order.orderNo} <span style={{ margin: '0 8px' }}>|</span> 下单时间：{order.createdAt?.replace('T', ' ')}
                      </div>
                      <ElTag type={s.type} size="small">{s.label}</ElTag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#303133' }}>{order.hotelName}</div>
                        <div style={{ fontSize: '14px', color: '#606266' }}>{order.roomTypeName}</div>
                        <div style={{ fontSize: '13px', color: '#909399' }}>
                          入住：{order.checkinDate} <span style={{ margin: '0 4px' }}>至</span> 离店：{order.checkoutDate}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                        <div style={{ color: '#F56C6C', fontSize: '20px', fontWeight: 'bold' }}>
                          <span style={{ fontSize: '14px' }}>￥</span>{order.amount}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {order.status === 'CREATED' && (
                            <ElButton size="small" onClick={() => cancel(order.id)}>取消订单</ElButton>
                          )}
                          <ElButton size="small" type="primary" plain onClick={() => showDetail(order)}>查看详情</ElButton>
                        </div>
                      </div>
                    </div>
                  </ElCard>
                )
              })}
            </div>
          )}
        </div>

        <ElDialog 
          v-model={detailVisible.value} 
          title="订单详情" 
          width="500px"
          v-slots={{
            footer: () => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <ElButton onClick={() => detailVisible.value = false}>关闭</ElButton>
              </div>
            )
          }}
        >
          {currentOrder.value && (
            <ElDescriptions column={1} border>
              <ElDescriptionsItem label="订单号">{currentOrder.value.orderNo}</ElDescriptionsItem>
              <ElDescriptionsItem label="酒店名称">{currentOrder.value.hotelName}</ElDescriptionsItem>
              <ElDescriptionsItem label="房型名称">{currentOrder.value.roomTypeName}</ElDescriptionsItem>
              <ElDescriptionsItem label="入离日期">
                {currentOrder.value.checkinDate} 至 {currentOrder.value.checkoutDate}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="订单总价">￥{currentOrder.value.amount}</ElDescriptionsItem>
              <ElDescriptionsItem label="订单状态">
                <ElTag size="small" type={statusMap[currentOrder.value.status]?.type}>
                  {statusMap[currentOrder.value.status]?.label || currentOrder.value.status}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="下单时间">{currentOrder.value.createdAt?.replace('T', ' ')}</ElDescriptionsItem>
            </ElDescriptions>
          )}
        </ElDialog>
      </div>
    )
  },
})

