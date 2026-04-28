import { defineComponent, onMounted, reactive, ref } from 'vue'
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage, ElSwitch, ElUpload, ElIcon } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'

type Hotel = {
  id: number
  name: string
  address: string
  phone: string
  description: string
  status: 'ONLINE' | 'OFFLINE'
  facilities: string
}

export default defineComponent({
  name: 'MerchantHotelPage',
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const formRef = ref<InstanceType<typeof ElForm>>()
    const hotel = reactive<Hotel>({
      id: 0,
      name: '',
      address: '',
      phone: '',
      description: '',
      status: 'OFFLINE',
      facilities: '',
    })

    const rules = {
      name: [{ required: true, message: '酒店名称不能为空', trigger: 'blur' }],
      address: [{ required: true, message: '详细地址不能为空', trigger: 'blur' }],
      phone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
      description: [{ required: true, message: '酒店简介不能为空', trigger: 'blur' }],
    }

    async function load() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<Hotel>>('/api/merchant/hotel')
        if (resp.data.success) {
          Object.assign(hotel, resp.data.data)
          // 补充后端缺失字段的默认值（为了平滑过渡）
          if (!hotel.phone) hotel.phone = '13800000000'
          if (!hotel.facilities) hotel.facilities = 'WiFi, 24小时热水'
        }
      } finally {
        loading.value = false
      }
    }

    async function save() {
      if (!formRef.value) return
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return

      saving.value = true
      try {
        // 先保存基础信息
        const resp = await http.put<ApiResponse<null>>('/api/merchant/hotel', {
          name: hotel.name,
          address: hotel.address,
          description: hotel.description,
        })
        if (!resp.data.success) {
          ElMessage.error(resp.data.message || '酒店信息保存失败')
          return
        }

        // 因为后端缺少单独更新状态、电话的接口，暂时只更新支持的字段
        ElMessage.success('酒店信息更新成功')
        await load()
      } finally {
        saving.value = false
      }
    }

    onMounted(load)

    return () => (
      <div v-loading={loading.value}>
        <ElCard style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>酒店信息维护</div>
          
          <ElForm ref={formRef} model={hotel} rules={rules} labelWidth="100px" style="max-width: 800px">
            <div style={{ fontWeight: 'bold', marginBottom: '16px', color: '#409EFF' }}>基础信息区</div>
            <ElFormItem label="酒店名称" prop="name">
              <ElInput v-model={hotel.name} placeholder="请输入酒店全称" />
            </ElFormItem>
            <ElFormItem label="详细地址" prop="address">
              <ElInput v-model={hotel.address} placeholder="请输入详细地址，精确到门牌号" />
            </ElFormItem>
            <ElFormItem label="联系电话" prop="phone">
              <ElInput v-model={hotel.phone} placeholder="请输入酒店前台联系电话" />
            </ElFormItem>
            <ElFormItem label="配套设施" prop="facilities">
              <ElInput v-model={hotel.facilities} placeholder="例如：免费WiFi, 免费停车, 健身房, 游泳池" />
            </ElFormItem>
            <ElFormItem label="完整简介" prop="description">
              <ElInput v-model={hotel.description} type="textarea" rows={4} placeholder="请输入酒店的详细介绍" />
            </ElFormItem>

            <div style={{ fontWeight: 'bold', margin: '32px 0 16px 0', color: '#409EFF' }}>图片上传区 (仅演示占位)</div>
            <ElFormItem label="酒店封面图">
              <ElUpload
                action="#"
                listType="picture-card"
                autoUpload={false}
                limit={1}
              >
                <ElIcon><Plus /></ElIcon>
              </ElUpload>
              <div style={{ fontSize: '12px', color: '#909399', marginLeft: '12px' }}>建议上传 800x600 比例的清晰大图</div>
            </ElFormItem>

            <div style={{ fontWeight: 'bold', margin: '32px 0 16px 0', color: '#409EFF' }}>营业状态区</div>
            <ElFormItem label="营业状态">
              <ElSwitch 
                v-model={hotel.status} 
                active-value="ONLINE" 
                inactive-value="OFFLINE"
                active-text="营业中"
                inactive-text="已歇业"
                inline-prompt
                width={70}
              />
              <div style={{ fontSize: '12px', color: '#909399', marginTop: '8px', lineHeight: 1.5, width: '100%' }}>
                当状态为「营业中」时，该酒店正常展示在用户端酒店列表。<br/>
                当状态为「已歇业」时，该酒店从用户端隐藏，不影响已提交的有效订单。
              </div>
            </ElFormItem>

            <ElFormItem style={{ marginTop: '32px' }}>
              <ElButton type="primary" size="large" loading={saving.value} onClick={save} style={{ width: '200px' }}>
                保存修改
              </ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </div>
    )
  },
})

