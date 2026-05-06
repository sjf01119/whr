import { defineComponent, onMounted, ref } from 'vue'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import { useRouter } from 'vue-router'
import { Memo, OfficeBuilding, Shop, Tickets, User } from '@element-plus/icons-vue'
import './AdminDashboardPage.css'

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
    const router = useRouter()
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

    function goTo(path: string) {
      router.push(path)
    }

    onMounted(async () => {
      try {
        const resp = await http.get<ApiResponse<Dashboard>>('/api/admin/dashboard')
        if (resp.data.success) data.value = resp.data.data
      } catch {}
    })

    return () => (
      <div class="admin-dashboard">
        <ElRow gutter={16}>
          <ElCol xs={24} sm={12} lg={6}>
            <ElCard class="stats-card">
              <div class="stats-content stats-card-clickable" onClick={() => goTo('/admin/merchant-manage')}>
                <div class="stats-icon">
                  <el-icon><Shop /></el-icon>
                </div>
                <div class="stats-text">
                  <div class="stats-title">商家</div>
                  <div class="stats-value">{data.value.merchants}</div>
                </div>
              </div>
            </ElCard>
          </ElCol>
          <ElCol xs={24} sm={12} lg={6}>
            <ElCard class="stats-card">
              <div class="stats-content stats-card-clickable" onClick={() => goTo('/admin/hotel-supervise')}>
                <div class="stats-icon">
                  <el-icon><OfficeBuilding /></el-icon>
                </div>
                <div class="stats-text">
                  <div class="stats-title">酒店</div>
                  <div class="stats-value">{data.value.hotels}</div>
                </div>
              </div>
            </ElCard>
          </ElCol>
          <ElCol xs={24} sm={12} lg={6}>
            <ElCard class="stats-card">
              <div class="stats-content stats-card-clickable" onClick={() => goTo('/admin/user-manage')}>
                <div class="stats-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stats-text">
                  <div class="stats-title">用户</div>
                  <div class="stats-value">{data.value.users}</div>
                </div>
              </div>
            </ElCard>
          </ElCol>
          <ElCol xs={24} sm={12} lg={6}>
            <ElCard class="stats-card">
              <div class="stats-content stats-card-clickable" onClick={() => goTo('/admin/order-supervise')}>
                <div class="stats-icon">
                  <el-icon><Tickets /></el-icon>
                </div>
                <div class="stats-text">
                  <div class="stats-title">订单</div>
                  <div class="stats-value">{data.value.orders}</div>
                </div>
              </div>
            </ElCard>
          </ElCol>
        </ElRow>

        <ElRow gutter={16} class="dashboard-bottom-row">
          <ElCol xs={24} lg={14}>
            <ElCard class="module-card">
              <div class="module-header">今日新增数据</div>
              <table class="daily-table">
                <thead>
                  <tr>
                    <th>类型</th>
                    <th>数量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span class="table-type"><el-icon><Shop /></el-icon>新增商家</span>
                    </td>
                    <td>{data.value.todayMerchants}</td>
                  </tr>
                  <tr>
                    <td>
                      <span class="table-type"><el-icon><OfficeBuilding /></el-icon>新增酒店</span>
                    </td>
                    <td>{data.value.todayHotels}</td>
                  </tr>
                  <tr>
                    <td>
                      <span class="table-type"><el-icon><User /></el-icon>新增用户</span>
                    </td>
                    <td>{data.value.todayUsers}</td>
                  </tr>
                  <tr>
                    <td>
                      <span class="table-type"><el-icon><Memo /></el-icon>新增订单</span>
                    </td>
                    <td>{data.value.todayOrders}</td>
                  </tr>
                </tbody>
              </table>
            </ElCard>
          </ElCol>
          <ElCol xs={24} lg={10}>
            <ElCard class="module-card revenue-card">
              <div class="module-header">全平台营收统计</div>
              <div class="revenue-title">累计营收金额 (元)</div>
              <div class="revenue-value">¥ {Number(data.value.totalRevenue).toFixed(2)}</div>
              <div class="revenue-trend" aria-label="营收趋势占位图">
                <div class="trend-line" />
              </div>
            </ElCard>
          </ElCol>
        </ElRow>
      </div>
    )
  },
})
