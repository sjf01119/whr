import { defineComponent, onMounted, ref, computed } from 'vue'
import { ElButton, ElCard, ElMessage, ElTag, ElTabs, ElTabPane, ElEmpty, ElMessageBox, ElDialog, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'

type Order = {
  id: number
  orderNo: string
  username: string
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
  name: 'AdminOrdersPage',
  setup() {
    const loading = ref(false)
    const items = ref<Order[]>([])
    const activeTab = ref('ALL')
    
    const detailVisible = ref(false)
    const currentOrder = ref<Order | null>(null)

    async function load() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<PageResponse<Order>>>('/api/admin/orders', {
          params: { status: activeTab.value, page: 1, pageSize: 50 },
        })
        if (resp.data.success) items.value = resp.data.data.items
      } finally {
        loading.value = false
      }
    }

    function viewDetail(order: Order) {
      currentOrder.value = order
      detailVisible.value = true
    }

    async function cancelAbnormal(order: Order) {
      try {
        await ElMessageBox.prompt('请输入异常处理/取消原因', '异常订单处理', {
          confirmButtonText: '确认处理并取消',
          cancelButtonText: '返回',
          inputPattern: /.+/,
          inputErrorMessage: '原因不能为空'
        })
        await http.post(`/api/admin/orders/${order.id}/cancel`)
        ElMessage.success('订单已强制取消')
        await load()
      } catch (e: any) {
        if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || '操作失败')
      }
    }

    function exportOrders() {
      const header = ['订单号', '下单用户', '酒店名称', '房型名称', '入住日期', '离店日期', '订单金额', '状态', '下单时间']
      const rows = items.value.map(o => [
        o.orderNo,
        o.username,
        o.hotelName,
        o.roomTypeName,
        o.checkinDate,
        o.checkoutDate,
        o.amount,
        statusMap[o.status]?.label || o.status,
        o.createdAt
      ])
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
        [header, ...rows].map(e => e.join(",")).join("\n")
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `订单导出_${activeTab.value}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    onMounted(load)

    return () => (
      <div>
        <ElCard style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ElTabs v-model={activeTab.value} onTabChange={load} style={{ flex: 1, marginBottom: '-15px' }}>
              <ElTabPane label="全部" name="ALL" />
              <ElTabPane label="待确认" name="CREATED" />
              <ElTabPane label="已确认" name="PAID" />
              <ElTabPane label="已入住" name="CHECKED_IN" />
              <ElTabPane label="已完成" name="COMPLETED" />
              <ElTabPane label="已取消" name="CANCELED" />
            </ElTabs>
            <ElButton type="primary" onClick={exportOrders} style={{ marginLeft: '20px' }}>导出订单列表</ElButton>
          </div>
        </ElCard>

        <div v-loading={loading.value}>
          {items.value.length === 0 ? (
            <ElCard>
              <ElEmpty description="暂无对应状态的订单数据" />
            </ElCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.value.map((order) => {
                const st = statusMap[order.status] || { label: order.status, type: 'info' }
                return (
                  <ElCard key={order.id} shadow="hover" bodyStyle={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#303133' }}>{order.hotelName}</span>
                          <ElTag type={st.type} size="small" effect="light">{st.label}</ElTag>
                          <span style={{ fontSize: '13px', color: '#909399' }}>订单号：{order.orderNo}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '14px', color: '#606266' }}>
                          <div><span style={{ color: '#909399' }}>下单用户：</span>{order.username}</div>
                          <div><span style={{ color: '#909399' }}>房型：</span>{order.roomTypeName}</div>
                          <div><span style={{ color: '#909399' }}>入住时段：</span>{order.checkinDate} 至 {order.checkoutDate}</div>
                          <div><span style={{ color: '#909399' }}>下单时间：</span>{order.createdAt.replace('T', ' ')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '120px' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f56c6c' }}>
                          ¥ {Number(order.amount).toFixed(2)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <ElButton type="primary" plain size="small" onClick={() => viewDetail(order)}>查看详情</ElButton>
                          {order.status !== 'CANCELED' && order.status !== 'COMPLETED' && (
                            <ElButton type="danger" plain size="small" onClick={() => cancelAbnormal(order)}>异常处理</ElButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </ElCard>
                )
              })}
            </div>
          )}
        </div>

        <ElDialog v-model={detailVisible.value} title="订单详情" width="600px">
          {currentOrder.value && (
            <ElDescriptions column={1} border>
              <ElDescriptionsItem label="订单号">{currentOrder.value.orderNo}</ElDescriptionsItem>
              <ElDescriptionsItem label="酒店名称">{currentOrder.value.hotelName}</ElDescriptionsItem>
              <ElDescriptionsItem label="房型名称">{currentOrder.value.roomTypeName}</ElDescriptionsItem>
              <ElDescriptionsItem label="下单用户">{currentOrder.value.username}</ElDescriptionsItem>
              <ElDescriptionsItem label="入住日期">{currentOrder.value.checkinDate}</ElDescriptionsItem>
              <ElDescriptionsItem label="离店日期">{currentOrder.value.checkoutDate}</ElDescriptionsItem>
              <ElDescriptionsItem label="订单总价">¥ {Number(currentOrder.value.amount).toFixed(2)}</ElDescriptionsItem>
              <ElDescriptionsItem label="下单时间">{currentOrder.value.createdAt.replace('T', ' ')}</ElDescriptionsItem>
              <ElDescriptionsItem label="订单状态">
                <ElTag type={statusMap[currentOrder.value.status]?.type}>
                  {statusMap[currentOrder.value.status]?.label}
                </ElTag>
              </ElDescriptionsItem>
            </ElDescriptions>
          )}
        </ElDialog>
      </div>
    )
  },
})

