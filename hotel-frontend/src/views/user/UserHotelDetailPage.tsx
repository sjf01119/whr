import { defineComponent, onMounted, reactive, ref, computed } from 'vue'
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElCarousel,
  ElCarouselItem,
  ElTag,
  ElIcon
} from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { http } from '@/lib/http'
import { getRoomTypeImage } from '@/lib/roomTypeImage'
import type { ApiResponse } from '@/types/api'
import dayjs from 'dayjs'

type Hotel = {
  id: number
  name: string
  address: string
  description: string
}

type RoomType = {
  id: number
  name: string
  price: string
  facilitiesText: string
  stock: number
}

export default defineComponent({
  name: 'UserHotelDetailPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const hotelId = Number(route.params.id)
    const loading = ref(false)
    const hotel = ref<Hotel | null>(null)
    const roomTypes = ref<RoomType[]>([])

    const dialogVisible = ref(false)
    const submitting = ref(false)
    const selectedRoom = ref<RoomType | null>(null)

    const bookingForm = reactive({
      dateRange: [] as string[],
      guestName: '',
      phone: '',
      idCard: '',
    })

    const nights = computed(() => {
      if (bookingForm.dateRange && bookingForm.dateRange.length === 2) {
        const start = dayjs(bookingForm.dateRange[0])
        const end = dayjs(bookingForm.dateRange[1])
        return end.diff(start, 'day')
      }
      return 0
    })

    const totalPrice = computed(() => {
      if (selectedRoom.value && nights.value > 0) {
        return (Number(selectedRoom.value.price) * nights.value).toFixed(2)
      }
      return '0.00'
    })

    async function load() {
      loading.value = true
      try {
        const [h, rt] = await Promise.all([
          http.get<ApiResponse<Hotel>>(`/api/user/hotels/${hotelId}`),
          http.get<ApiResponse<RoomType[]>>(`/api/user/hotels/${hotelId}/room-types`),
        ])
        if (h.data.success) hotel.value = h.data.data
        if (rt.data.success) roomTypes.value = rt.data.data
      } finally {
        loading.value = false
      }
    }

    function openBookingModal(rt: RoomType) {
      if (rt.stock <= 0) return
      selectedRoom.value = rt
      bookingForm.dateRange = []
      bookingForm.guestName = ''
      bookingForm.phone = ''
      bookingForm.idCard = ''
      dialogVisible.value = true
    }

    async function submitOrder() {
      if (!bookingForm.dateRange || bookingForm.dateRange.length !== 2) {
        return ElMessage.warning('请选择入住和离店日期')
      }
      if (!bookingForm.guestName) return ElMessage.warning('请输入入住人姓名')
      if (!/^1\d{10}$/.test(bookingForm.phone)) return ElMessage.warning('请输入有效的11位手机号')
      if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(bookingForm.idCard)) return ElMessage.warning('请输入有效的身份证号')
      
      const start = dayjs(bookingForm.dateRange[0])
      const end = dayjs(bookingForm.dateRange[1])
      const today = dayjs().startOf('day')

      if (start.isBefore(today)) return ElMessage.warning('入住日期必须晚于或等于当前系统日期')
      if (!end.isAfter(start)) return ElMessage.warning('离店日期必须晚于入住日期')

      submitting.value = true
      try {
        const resp = await http.post<ApiResponse<{ orderId: number }>>('/api/user/orders', {
          hotelId,
          roomTypeId: selectedRoom.value!.id,
          checkinDate: bookingForm.dateRange[0],
          checkoutDate: bookingForm.dateRange[1],
          roomCount: 1,
          guestName: bookingForm.guestName,
          phone: bookingForm.phone,
          idCard: bookingForm.idCard
        })
        if (!resp.data.success) {
          ElMessage.error(resp.data.message || '下单失败')
          return
        }
        ElMessage.success('订单提交成功，请等待商家确认')
        dialogVisible.value = false
        router.push('/user/orders')
      } catch (e: any) {
        ElMessage.error(e?.response?.data?.message || '下单失败')
      } finally {
        submitting.value = false
      }
    }

    onMounted(load)

    const disabledDate = (time: Date) => {
      return time.getTime() < Date.now() - 8.64e7
    }

    return () => (
      <div v-loading={loading.value}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
          <ElButton onClick={() => router.push('/user/hotels')}>返回</ElButton>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>酒店详情</span>
        </div>

        {hotel.value && (
          <ElCard style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ width: '400px', flexShrink: 0 }}>
                <ElCarousel height="260px" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  {[1, 2, 3].map(i => (
                    <ElCarouselItem key={i}>
                      <img src={`https://picsum.photos/seed/${hotelId * 10 + i}/600/400`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </ElCarouselItem>
                  ))}
                </ElCarousel>
              </div>
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#303133' }}>{hotel.value.name}</div>
                <div style={{ color: '#E6A23C', fontSize: '18px', fontWeight: 'bold' }}>4.8 分 <span style={{ fontSize: '14px', color: '#909399', fontWeight: 'normal' }}>/ 极好</span></div>
                <div style={{ color: '#606266', fontSize: '14px' }}>地址：{hotel.value.address}</div>
                <div style={{ color: '#606266', fontSize: '14px', lineHeight: 1.6, marginTop: '8px' }}>
                  {hotel.value.description}
                </div>
              </div>
            </div>
          </ElCard>
        )}

        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#303133' }}>房型列表</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {roomTypes.value.map(rt => (
            <ElCard key={rt.id} bodyStyle={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <img src={getRoomTypeImage(rt.name)} alt={rt.name} style={{ width: '120px', height: '120px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#303133' }}>{rt.name}</div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#606266' }}>
                      <span>床型：大/双床</span>
                      <span>可住：2人</span>
                      <span>面积：25-30㎡</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#909399' }}>设施：{rt.facilitiesText}</div>
                    <div style={{ marginTop: 'auto' }}>
                      <span style={{ fontSize: '13px', color: rt.stock > 0 ? '#67C23A' : '#F56C6C' }}>
                        剩余可订：{rt.stock} 间
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                  <div style={{ color: '#F56C6C', fontSize: '24px', fontWeight: 'bold' }}>
                    <span style={{ fontSize: '14px' }}>￥</span>{rt.price}
                  </div>
                  <ElButton 
                    type="primary" 
                    size="large" 
                    disabled={rt.stock <= 0} 
                    onClick={() => openBookingModal(rt)}
                  >
                    {rt.stock > 0 ? '立即预订' : '暂无房态'}
                  </ElButton>
                </div>
              </div>
            </ElCard>
          ))}
        </div>

        <ElDialog 
          v-model={dialogVisible.value} 
          title="填写预订信息" 
          width="500px"
          v-slots={{
            footer: () => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <ElButton onClick={() => dialogVisible.value = false}>取消</ElButton>
                <ElButton type="primary" loading={submitting.value} onClick={submitOrder}>提交订单</ElButton>
              </div>
            )
          }}
        >
          <ElForm labelWidth="90px">
            <ElFormItem label="预订房型">
              <div style={{ fontWeight: 'bold' }}>{selectedRoom.value?.name}</div>
            </ElFormItem>
            <ElFormItem label="入离日期" required>
              <ElDatePicker
                v-model={bookingForm.dateRange}
                type="daterange"
                range-separator="至"
                start-placeholder="入住日期"
                end-placeholder="离店日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                disabled-date={disabledDate}
                style={{ width: '100%' }}
              />
            </ElFormItem>
            <ElFormItem label="入住天数">
              <span style={{ color: '#409EFF', fontWeight: 'bold' }}>{nights.value} 晚</span>
            </ElFormItem>
            <ElFormItem label="订单总价">
              <span style={{ color: '#F56C6C', fontSize: '18px', fontWeight: 'bold' }}>￥{totalPrice.value}</span>
            </ElFormItem>
            <ElFormItem label="入住人姓名" required>
              <ElInput v-model={bookingForm.guestName} placeholder="请输入实际入住人姓名" />
            </ElFormItem>
            <ElFormItem label="手机号" required>
              <ElInput v-model={bookingForm.phone} placeholder="请输入11位手机号" maxlength={11} />
            </ElFormItem>
            <ElFormItem label="身份证号" required>
              <ElInput v-model={bookingForm.idCard} placeholder="请输入18位身份证号" maxlength={18} />
            </ElFormItem>
          </ElForm>
        </ElDialog>
      </div>
    )
  },
})
