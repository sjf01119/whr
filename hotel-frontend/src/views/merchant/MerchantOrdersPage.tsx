import { defineComponent, onMounted, ref, computed } from 'vue'
import { ElButton, ElCard, ElDescriptions, ElDescriptionsItem, ElDialog, ElEmpty, ElMessage, ElMessageBox } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import { CopyDocument } from '@element-plus/icons-vue'
import './MerchantOrdersPage.css'

type Order = {
  id: number
  orderNo: string
  username: string
  roomTypeName: string
  checkinDate: string
  checkoutDate: string
  amount: string
  status: string
  createdAt: string
}

const statusMap: Record<string, { label: string; cls: string }> = {
  CREATED: { label: '待处理', cls: 'status-warning' },
  PAID: { label: '已确认', cls: 'status-primary' },
  CHECKED_IN: { label: '已入住', cls: 'status-primary' },
  COMPLETED: { label: '已完成', cls: 'status-success' },
  CANCELED: { label: '已取消', cls: 'status-danger' },
}

export default defineComponent({
  name: 'MerchantOrdersPage',
  setup() {
    const loading = ref(false)
    const items = ref<Order[]>([])
    const activeTab = ref('ALL')
    
    const detailVisible = ref(false)
    const currentOrder = ref<Order | null>(null)

    async function load() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<PageResponse<Order>>>('/api/merchant/orders', {
          params: { page: 1, pageSize: 50 },
        })
        if (resp.data.success) items.value = resp.data.data.items
      } finally {
        loading.value = false
      }
    }

    async function acceptOrder(id: number) {
      try {
        await http.post<ApiResponse<null>>(`/api/merchant/orders/${id}/pay`)
        ElMessage.success('接单成功，状态已变更为已确认')
        await load()
      } catch (e: any) {
        ElMessage.error(e?.response?.data?.message || '操作失败')
      }
    }

    async function rejectOrder(id: number) {
      try {
        await ElMessageBox.prompt('请输入拒绝接单的原因：', '拒绝接单', {
          confirmButtonText: '提交',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '原因不能为空',
        })
        await http.post<ApiResponse<null>>(`/api/merchant/orders/${id}/cancel`)
        ElMessage.success('拒单成功，状态已变更为已取消')
        await load()
      } catch (e: any) {
        if (e !== 'cancel') {
          ElMessage.error(e?.response?.data?.message || '操作失败')
        }
      }
    }

    async function checkin(id: number) {
      await http.post<ApiResponse<null>>(`/api/merchant/orders/${id}/checkin`)
      ElMessage.success('已确认入住')
      await load()
    }

    async function checkout(id: number) {
      await http.post<ApiResponse<null>>(`/api/merchant/orders/${id}/checkout`)
      ElMessage.success('已确认退房')
      await load()
    }

    async function copyOrderNo(orderNo: string) {
      try {
        await navigator.clipboard.writeText(orderNo)
        ElMessage.success('订单号已复制')
      } catch {
        ElMessage.error('复制失败，请手动复制')
      }
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
      <div class="merchant-orders-page">
        <ElCard class="merchant-orders-card tabs-card">
          <div class="filter-tabs">
            {[
              { key: 'ALL', label: '全部' },
              { key: 'CREATED', label: '待处理' },
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
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </ElCard>

        <div v-loading={loading.value}>
          {filteredItems.value.length === 0 ? (
            <ElCard class="merchant-orders-card empty-card">
              <ElEmpty description="暂无对应状态的订单" />
            </ElCard>
          ) : (
            <div class="order-card-list">
              {filteredItems.value.map(order => {
                const s = statusMap[order.status] || { label: order.status, cls: 'status-danger' }
                return (
                  <ElCard key={order.id} class="merchant-orders-card order-card">
                    <div class="order-head">
                      <div class="order-top-text">
                        <span>订单号：{order.orderNo}</span>
                        <button class="copy-btn" onClick={() => copyOrderNo(order.orderNo)} title="复制订单号">
                          <el-icon><CopyDocument /></el-icon>
                        </button>
                        <span class="order-divider">|</span>
                        <span>下单时间：{order.createdAt?.replace('T', ' ')}</span>
                      </div>
                      <span class={`status-pill ${s.cls}`}>{s.label}</span>
                    </div>
                    <div class="order-body">
                      <div class="order-info">
                        <div class="order-strong">下单用户：{order.username}</div>
                        <div class="order-strong">房型：{order.roomTypeName}</div>
                        <div class="order-time">
                          入住：{order.checkinDate} <span>至</span> 离店：{order.checkoutDate}
                        </div>
                      </div>
                      <div class="order-side">
                        <div class="order-amount">
                          ¥ {Number(order.amount).toFixed(2)}
                        </div>
                        <div class="order-actions">
                          {order.status === 'CREATED' && (
                            <>
                              <ElButton size="small" class="order-operate-btn success-btn" onClick={() => acceptOrder(order.id)}>确认接单</ElButton>
                              <ElButton size="small" class="order-operate-btn danger-btn" onClick={() => rejectOrder(order.id)}>拒绝接单</ElButton>
                            </>
                          )}
                          {order.status === 'PAID' && (
                            <ElButton size="small" class="order-operate-btn primary-btn" onClick={() => checkin(order.id)}>确认入住</ElButton>
                          )}
                          {order.status === 'CHECKED_IN' && (
                            <ElButton size="small" class="order-operate-btn primary-btn" onClick={() => checkout(order.id)}>确认退房</ElButton>
                          )}
                          <ElButton size="small" class="detail-btn" onClick={() => showDetail(order)}>查看详情</ElButton>
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
              <ElDescriptionsItem label="下单用户">{currentOrder.value.username}</ElDescriptionsItem>
              <ElDescriptionsItem label="房型名称">{currentOrder.value.roomTypeName}</ElDescriptionsItem>
              <ElDescriptionsItem label="入离日期">
                {currentOrder.value.checkinDate} 至 {currentOrder.value.checkoutDate}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="订单总价">￥{currentOrder.value.amount}</ElDescriptionsItem>
              <ElDescriptionsItem label="订单状态">
                <span class={`status-pill ${statusMap[currentOrder.value.status]?.cls || 'status-danger'}`}>
                  {statusMap[currentOrder.value.status]?.label || currentOrder.value.status}
                </span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="下单时间">{currentOrder.value.createdAt?.replace('T', ' ')}</ElDescriptionsItem>
            </ElDescriptions>
          )}
        </ElDialog>
      </div>
    )
  },
})
