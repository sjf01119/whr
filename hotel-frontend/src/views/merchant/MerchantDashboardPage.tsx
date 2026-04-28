import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue'
import { ElCard, ElStatistic, ElRow, ElCol } from 'element-plus'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import * as echarts from 'echarts'

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
      
      const option = {
        title: {
          text: '近 7 天营收趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br />营收: ¥{c}'
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value',
          name: '营收 (元)'
        },
        series: [
          {
            data: revenues,
            type: 'line',
            smooth: true,
            areaStyle: {
              opacity: 0.1
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
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

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance?.dispose()
    })

    return () => (
      <div>
        <ElRow gutter={12}>
          <ElCol span={8}>
            <ElCard>
              <ElStatistic title="今日订单" value={data.value.todayOrders} />
            </ElCard>
          </ElCol>
          <ElCol span={8}>
            <ElCard>
              <ElStatistic title="今日营收" value={data.value.todayRevenue} precision={2} />
            </ElCard>
          </ElCol>
          <ElCol span={8}>
            <ElCard>
              <ElStatistic title="待处理订单" value={data.value.pendingOrders} />
            </ElCard>
          </ElCol>
        </ElRow>

        <ElCard style={{ marginTop: '20px' }}>
          <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>
        </ElCard>
      </div>
    )
  },
})
