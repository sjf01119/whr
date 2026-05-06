import { defineComponent, onMounted, ref } from 'vue'
import { ElButton, ElCard, ElDescriptions, ElDescriptionsItem, ElDialog, ElEmpty, ElMessage, ElMessageBox } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import './AdminTheme.css'
import './AdminOrdersPage.css'

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

const statusMap: Record<string, { label: string; cls: string }> = {
  CREATED: { label: '待确认', cls: 'status-warning' },
  PAID: { label: '已确认', cls: 'status-success' },
  CHECKED_IN: { label: '已入住', cls: 'status-success' },
  COMPLETED: { label: '已完成', cls: 'status-success' },
  CANCELED: { label: '已取消', cls: 'status-danger' },
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
      <div class="admin-page">
        <ElCard class="admin-card">
          <div class="toolbar-row">
            <div class="filter-tabs">
              {[
                { key: 'ALL', label: '全部' },
                { key: 'CREATED', label: '待确认' },
                { key: 'PAID', label: '已确认' },
                { key: 'CHECKED_IN', label: '已入住' },
                { key: 'COMPLETED', label: '已完成' },
                { key: 'CANCELED', label: '已取消' },
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
            <ElButton type="primary" class="admin-primary-btn" onClick={exportOrders}>导出订单列表</ElButton>
          </div>
        </ElCard>

        <div v-loading={loading.value}>
          {items.value.length === 0 ? (
            <ElCard class="admin-card">
              <ElEmpty description="暂无对应状态的订单数据" />
            </ElCard>
          ) : (
            <div class="order-cards">
              {items.value.map((order) => {
                const st = statusMap[order.status] || { label: order.status, cls: 'status-danger' }
                return (
                  <ElCard key={order.id} class="admin-card order-card">
                    <div class="order-head">
                      <div class="order-title-block">
                        <div class="order-hotel">{order.hotelName}</div>
                        <span class={`status-pill ${st.cls}`}>{st.label}</span>
                        <span class="order-no">订单号：{order.orderNo}</span>
                      </div>
                      <div class="order-right">
                        <div class="order-amount">¥ {Number(order.amount).toFixed(2)}</div>
                        <div class="order-actions">
                          <button class="order-detail-btn" onClick={() => viewDetail(order)}>查看详情</button>
                          {order.status !== 'CANCELED' && order.status !== 'COMPLETED' && (
                            <button class="action-btn action-danger" onClick={() => cancelAbnormal(order)}>异常处理</button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div class="order-grid">
                      <div><span class="order-label">房型</span>{order.roomTypeName}</div>
                      <div><span class="order-label">用户</span>{order.username}</div>
                      <div><span class="order-label">入住时段</span>{order.checkinDate} 至 {order.checkoutDate}</div>
                      <div><span class="order-label">下单时间</span>{order.createdAt.replace('T', ' ')}</div>
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
                <span class={`status-pill ${statusMap[currentOrder.value.status]?.cls || 'status-danger'}`}>
                  {statusMap[currentOrder.value.status]?.label || currentOrder.value.status}
                </span>
              </ElDescriptionsItem>
            </ElDescriptions>
          )}
        </ElDialog>
      </div>
    )
  },
})
