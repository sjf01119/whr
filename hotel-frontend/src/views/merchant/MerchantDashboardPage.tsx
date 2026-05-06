import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { DataAnalysis, Memo, Tickets } from '@element-plus/icons-vue'
import './MerchantDashboardPage.css'

type RevenueStat = {
  date: string
  revenue: string
}

type Dashboard = {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  recentRevenue: RevenueStat[]
}

export default defineComponent({
  name: 'MerchantDashboardPage',
  setup() {
    const router = useRouter()
    const data = ref<Dashboard>({ todayOrders: 0, todayRevenue: 0, pendingOrders: 0, recentRevenue: [] })
    const chartRef = ref<HTMLElement>()
    let chartInstance: echarts.ECharts | null = null

    const renderChart = () => {
      if (!chartRef.value) return
      if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value)
      }
      
      const dates = data.value.recentRevenue.map(item => item.date)
      const revenues = data.value.recentRevenue.map(item => Number(item.revenue))
      
      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          borderRadius: 8,
          textStyle: {
            color: '#1f2937',
            fontSize: 12,
          },
          formatter: (params: any) => {
            const item = Array.isArray(params) ? params[0] : params
            return `<div style="line-height:1.7;"><div style="color:#6b7280;">${item.axisValue}</div><div style="font-weight:600;color:#1f2937;">营收：¥ ${Number(item.data).toFixed(2)}</div></div>`
          },
        },
        xAxis: {
          type: 'category',
          data: dates,
          boundaryGap: false,
          axisLabel: { color: '#9ca3af', fontSize: 12 },
          axisLine: { lineStyle: { color: '#e5e7eb' } },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          name: '营收 (元)',
          nameTextStyle: { color: '#9ca3af', fontSize: 12 },
          axisLabel: { color: '#9ca3af', fontSize: 12 },
          splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
        },
        series: [
          {
            data: revenues,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59,130,246,0.3)' },
                { offset: 1, color: 'rgba(59,130,246,0.04)' },
              ]),
            },
            itemStyle: {
              color: '#3b82f6',
            },
            lineStyle: {
              width: 3,
              color: '#3b82f6',
            },
          },
        ],
        grid: {
          left: '4%',
          right: '4%',
          top: '8%',
          bottom: '8%',
          containLabel: true,
        },
      }
      
      chartInstance.setOption(option)
    }

    onMounted(async () => {
      try {
        const resp =
          await http.get<ApiResponse<{ todayOrders: number; todayRevenue: string; pendingOrders: number; recentRevenue: RevenueStat[] }>>(
            '/api/merchant/dashboard',
          )
        if (resp.data.success) {
          data.value = {
            todayOrders: resp.data.data.todayOrders,
            todayRevenue: Number(resp.data.data.todayRevenue),
            pendingOrders: resp.data.data.pendingOrders,
            recentRevenue: resp.data.data.recentRevenue || []
          }
          renderChart()
        }
      } catch {}

      window.addEventListener('resize', handleResize)
    })

    const handleResize = () => {
      chartInstance?.resize()
    }

    function gotoPendingOrders() {
      router.push('/merchant/orders')
    }

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance?.dispose()
    })

    function getPeakInfo() {
      if (!data.value.recentRevenue.length) {
        return { date: '-', amount: 0 }
      }
      return data.value.recentRevenue.reduce(
        (max, item) => {
          const amount = Number(item.revenue)
          if (amount > max.amount) {
            return { date: item.date, amount }
          }
          return max
        },
        { date: '-', amount: 0 },
      )
    }

    return () => (
      <div class="merchant-dashboard">
        <ElRow gutter={16}>
          <ElCol xs={24} sm={12} lg={8}>
            <ElCard class="merchant-stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <el-icon><Tickets /></el-icon>
                </div>
                <div class="stat-text">
                  <div class="stat-title">今日订单</div>
                  <div class="stat-value">{data.value.todayOrders}</div>
                </div>
              </div>
            </ElCard>
          </ElCol>
          <ElCol xs={24} sm={12} lg={8}>
            <ElCard class="merchant-stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <div class="stat-text">
                  <div class="stat-title">今日营收</div>
                  <div class="stat-value stat-revenue">¥ {Number(data.value.todayRevenue).toFixed(2)}</div>
                </div>
              </div>
            </ElCard>
          </ElCol>
          <ElCol xs={24} sm={12} lg={8}>
            <ElCard class="merchant-stat-card">
              <div class="stat-content pending-orders-card" onClick={gotoPendingOrders}>
                <div class="stat-icon">
                  <el-icon><Memo /></el-icon>
                </div>
                <div class="stat-text">
                  <div class="stat-title">待处理订单</div>
                  <div class="stat-value">{data.value.pendingOrders}</div>
                </div>
              </div>
            </ElCard>
          </ElCol>
        </ElRow>

        <ElCard class="merchant-chart-card">
          <div class="chart-title">近7天营收趋势</div>
          <div ref={chartRef} class="chart-canvas"></div>
          <div class="chart-note">
            峰值日期：{getPeakInfo().date}，峰值金额：¥ {getPeakInfo().amount.toFixed(2)}
          </div>
        </ElCard>
      </div>
    )
  },
})
