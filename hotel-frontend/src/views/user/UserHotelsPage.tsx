import { defineComponent, onMounted, ref, computed } from 'vue'
import { ElCard, ElCol, ElRow, ElSkeleton, ElTag, ElSelect, ElOption, ElInputNumber, ElButton, ElEmpty } from 'element-plus'
import { useRouter } from 'vue-router'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'

type Hotel = {
  id: number
  name: string
  address: string
  description: string
  minPrice: number
}

export default defineComponent({
  name: 'UserHotelsPage',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const items = ref<Hotel[]>([])

    const sortType = ref('asc')
    const minPrice = ref<number | undefined>(undefined)
    const maxPrice = ref<number | undefined>(undefined)

    async function load() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<Hotel[]>>('/api/user/hotels')
        if (resp.data.success) {
          items.value = resp.data.data.map(h => ({ ...h, minPrice: Number(h.minPrice) }))
        }
      } finally {
        loading.value = false
      }
    }

    const filteredItems = computed(() => {
      let result = [...items.value]
      if (minPrice.value !== undefined && minPrice.value !== null) {
        result = result.filter(h => h.minPrice >= minPrice.value!)
      }
      if (maxPrice.value !== undefined && maxPrice.value !== null) {
        result = result.filter(h => h.minPrice <= maxPrice.value!)
      }
      result.sort((a, b) => {
        return sortType.value === 'asc' ? a.minPrice - b.minPrice : b.minPrice - a.minPrice
      })
      return result
    })

    onMounted(load)

    return () => (
      <div>
        <ElCard style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#606266' }}>价格排序:</span>
              <ElSelect v-model={sortType.value} style={{ width: '140px' }}>
                <ElOption label="价格从低到高" value="asc" />
                <ElOption label="价格从高到低" value="desc" />
              </ElSelect>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#606266' }}>价格区间:</span>
              <ElInputNumber v-model={minPrice.value} placeholder="最低价" controls={false} style={{ width: '100px' }} min={0} />
              <span style={{ color: '#909399' }}>-</span>
              <ElInputNumber v-model={maxPrice.value} placeholder="最高价" controls={false} style={{ width: '100px' }} min={0} />
            </div>
          </div>
        </ElCard>

        {loading.value ? (
          <ElSkeleton rows={6} animated />
        ) : filteredItems.value.length === 0 ? (
          <ElEmpty description="暂无可用酒店" />
        ) : (
          <ElRow gutter={20}>
            {filteredItems.value.map((h) => (
              <ElCol span={8} key={h.id} style={{ marginBottom: '20px' }}>
                <div onClick={() => router.push(`/user/hotels/${h.id}`)} style={{ cursor: 'pointer', height: '100%' }}>
                  <ElCard 
                    bodyStyle={{ padding: '0px' }} 
                    shadow="hover" 
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                  <img 
                    src={`https://picsum.photos/seed/${h.id}/400/200`} 
                    style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} 
                    alt="酒店封面"
                  />
                  <div style={{ padding: '14px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#303133', lineHeight: 1.4 }}>{h.name}</div>
                      <div style={{ color: '#f56c6c', fontWeight: 'bold', fontSize: '18px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '12px' }}>￥</span>{h.minPrice} <span style={{ fontSize: '12px', color: '#909399', fontWeight: 'normal' }}>起</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#909399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i class="el-icon-location"></i> {h.address}
                    </div>
                    <div style={{ fontSize: '13px', color: '#606266', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {h.description}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                      <ElTag type="success" size="small" effect="plain">房态充足</ElTag>
                    </div>
                  </div>
                  </ElCard>
                </div>
              </ElCol>
            ))}
          </ElRow>
        )}
      </div>
    )
  },
})
