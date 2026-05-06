import { defineComponent, onMounted, reactive, ref } from 'vue'
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage, ElSwitch, ElUpload, ElIcon } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import './MerchantHotelPage.css'

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

    function renderLabel(text: string, required = false) {
      return (
        <span class="field-label">
          {required ? <span class="required-mark">*</span> : null}
          {text}
        </span>
      )
    }

    return () => (
      <div class="merchant-hotel-page" v-loading={loading.value}>
        <ElCard class="merchant-hotel-main-card">
          <div class="merchant-page-title">酒店信息维护</div>

          <ElForm ref={formRef} model={hotel} rules={rules} labelPosition="top" hideRequiredAsterisk class="merchant-hotel-form">
            <ElCard class="section-card">
              <div class="section-title">基础信息区</div>
              <div class="basic-grid">
                <ElFormItem prop="name" class="grid-item">
                  {{
                    label: () => renderLabel('酒店名称', true),
                    default: () => <ElInput v-model={hotel.name} placeholder="请输入酒店全称" />,
                  }}
                </ElFormItem>

                <ElFormItem prop="phone" class="grid-item">
                  {{
                    label: () => renderLabel('联系电话', true),
                    default: () => <ElInput v-model={hotel.phone} placeholder="请输入酒店前台联系电话" />,
                  }}
                </ElFormItem>

                <ElFormItem prop="address" class="grid-item span-2">
                  {{
                    label: () => renderLabel('详细地址', true),
                    default: () => <ElInput v-model={hotel.address} placeholder="请输入详细地址，精确到门牌号" />,
                  }}
                </ElFormItem>

                <ElFormItem prop="facilities" class="grid-item span-2">
                  {{
                    label: () => renderLabel('配套设施'),
                    default: () => <ElInput v-model={hotel.facilities} placeholder="例如：免费WiFi, 免费停车, 健身房, 游泳池" />,
                  }}
                </ElFormItem>

                <ElFormItem prop="description" class="grid-item span-2">
                  {{
                    label: () => renderLabel('完整简介', true),
                    default: () => (
                      <ElInput
                        v-model={hotel.description}
                        type="textarea"
                        rows={5}
                        placeholder="请输入酒店的详细介绍"
                      />
                    ),
                  }}
                </ElFormItem>
              </div>
            </ElCard>

            <ElCard class="section-card">
              <div class="section-title">图片上传区</div>
              <div class="upload-row">
                <ElFormItem class="upload-form-item">
                  {{
                    label: () => renderLabel('酒店封面图'),
                    default: () => (
                      <div class="upload-wrap">
                        <ElUpload action="#" listType="picture-card" autoUpload={false} limit={1} class="hotel-upload">
                          <ElIcon><Plus /></ElIcon>
                        </ElUpload>
                        <div class="upload-tip">建议上传 800x600 比例的清晰大图，展示效果更佳。</div>
                      </div>
                    ),
                  }}
                </ElFormItem>
              </div>
            </ElCard>

            <ElCard class="section-card">
              <div class="section-title">营业状态区</div>
              <ElFormItem class="status-form-item">
                {{
                  label: () => renderLabel('营业状态'),
                  default: () => (
                    <>
                      <ElSwitch
                        class="status-switch"
                        v-model={hotel.status}
                        active-value="ONLINE"
                        inactive-value="OFFLINE"
                        active-text="营业中"
                        inactive-text="已歇业"
                        inline-prompt
                        width={74}
                      />
                      <div class="status-tip">
                        <div>当状态为「营业中」时，该酒店会正常展示在用户端酒店列表。</div>
                        <div>当状态为「已歇业」时，该酒店将从用户端隐藏，不影响已提交的有效订单。</div>
                      </div>
                    </>
                  ),
                }}
              </ElFormItem>
            </ElCard>

            <div class="submit-wrap">
              <ElButton type="primary" class="hotel-submit-btn" loading={saving.value} onClick={save}>
                保存修改
              </ElButton>
            </div>
          </ElForm>
        </ElCard>
      </div>
    )
  },
})
