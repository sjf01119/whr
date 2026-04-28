import { defineComponent, onMounted, ref } from 'vue'
import { ElCard, ElStatistic, ElRow, ElCol, ElDivider, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'

type Dashboard = {
  merchants: number
  hotels: number
  users: number
  orders: number
  todayMerchants: number
  todayHotels: number
  todayUsers: number
  todayOrders: number
  totalRevenue: string
}

export default defineComponent({
  name: 'AdminDashboardPage',
  setup() {
    const data = ref<Dashboard>({
      merchants: 0,
      hotels: 0,
      users: 0,
      orders: 0,
      todayMerchants: 0,
      todayHotels: 0,
      todayUsers: 0,
      todayOrders: 0,
      totalRevenue: '0.00'
    })

    onMounted(async () => {
      try {
        const resp = await http.get<ApiResponse<Dashboard>>('/api/admin/dashboard')
        if (resp.data.success) data.value = resp.data.data
      } catch {}
    })

    return () => (
      <div>
        <ElRow gutter={12}>
          <ElCol span={6}>
            <ElCard>
              <ElStatistic title="商家" value={data.value.merchants} />
            </ElCard>
          </ElCol>
          <ElCol span={6}>
            <ElCard>
              <ElStatistic title="酒店" value={data.value.hotels} />
            </ElCard>
          </ElCol>
          <ElCol span={6}>
            <ElCard>
              <ElStatistic title="用户" value={data.value.users} />
            </ElCard>
          </ElCol>
          <ElCol span={6}>
            <ElCard>
              <ElStatistic title="订单" value={data.value.orders} />
            </ElCard>
          </ElCol>
        </ElRow>

        <ElRow gutter={12} style={{ marginTop: '20px' }}>
          <ElCol span={12}>
            <ElCard header="今日新增数据">
              <ElDescriptions column={2} border>
                <ElDescriptionsItem label="新增商家">{data.value.todayMerchants}</ElDescriptionsItem>
                <ElDescriptionsItem label="新增酒店">{data.value.todayHotels}</ElDescriptionsItem>
                <ElDescriptionsItem label="新增用户">{data.value.todayUsers}</ElDescriptionsItem>
                <ElDescriptionsItem label="新增订单">{data.value.todayOrders}</ElDescriptionsItem>
              </ElDescriptions>
            </ElCard>
          </ElCol>
          <ElCol span={12}>
            <ElCard header="全平台营收统计">
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <ElStatistic title="累计营收金额 (元)" value={Number(data.value.totalRevenue)} precision={2} />
              </div>
            </ElCard>
          </ElCol>
        </ElRow>
      </div>
    )
  },
})

