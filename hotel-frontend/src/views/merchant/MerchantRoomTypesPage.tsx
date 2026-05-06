import { defineComponent, onMounted, reactive, ref } from 'vue'
import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElEmpty,
  ElPopconfirm,
  ElTag,
  ElUpload,
  ElIcon
} from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { http } from '@/lib/http'
import { getRoomTypeImage } from '@/lib/roomTypeImage'
import type { ApiResponse } from '@/types/api'
import './MerchantRoomTypesPage.css'

type RoomType = {
  id: number
  name: string
  price: string
  facilitiesText: string
  stock: number
}

type EditModel = {
  id: number | null
  name: string
  price: number
  bedType: string
  capacity: number
  area: string
  facilitiesText: string
  stock: number
}

export default defineComponent({
  name: 'MerchantRoomTypesPage',
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const items = ref<RoomType[]>([])
    const open = ref(false)
    const formRef = ref<InstanceType<typeof ElForm>>()
    const model = reactive<EditModel>({
      id: null,
      name: '',
      price: 0,
      bedType: '大/双床',
      capacity: 2,
      area: '25-30',
      facilitiesText: '',
      stock: 10,
    })

    const rules = {
      name: [{ required: true, message: '请输入房型名称', trigger: 'blur' }],
      price: [{ required: true, message: '请输入每晚单价', trigger: 'blur' }],
      bedType: [{ required: true, message: '请输入床型规格', trigger: 'blur' }],
      area: [{ required: true, message: '请输入房间面积', trigger: 'blur' }],
      facilitiesText: [{ required: true, message: '请输入房型配套设施', trigger: 'blur' }],
    }

    function resetModel() {
      model.id = null
      model.name = ''
      model.price = 0
      model.bedType = '大/双床'
      model.capacity = 2
      model.area = '25-30'
      model.facilitiesText = ''
      model.stock = 10
      if (formRef.value) formRef.value.clearValidate()
    }

    async function load() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<RoomType[]>>('/api/merchant/room-types')
        if (resp.data.success) items.value = resp.data.data
      } finally {
        loading.value = false
      }
    }

    function add() {
      resetModel()
      open.value = true
    }

    function edit(row: RoomType) {
      resetModel()
      model.id = row.id
      model.name = row.name
      model.price = Number(row.price)
      model.facilitiesText = row.facilitiesText
      model.stock = row.stock
      open.value = true
    }

    async function remove(id: number) {
      try {
        const resp = await http.delete<ApiResponse<null>>(`/api/merchant/room-types/${id}`)
        if (!resp.data.success) {
          ElMessage.error(resp.data.message || '删除失败，可能存在有效订单')
          return
        }
        ElMessage.success('房型删除成功')
        await load()
      } catch (e: any) {
        ElMessage.error(e?.response?.data?.message || '删除失败，该房型可能存在有效订单')
      }
    }

    async function save() {
      if (!formRef.value) return
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return

      saving.value = true
      try {
        const payload = {
          name: model.name,
          price: model.price,
          facilitiesText: model.facilitiesText,
          stock: model.stock,
        }
        let resp
        if (model.id == null) {
          resp = await http.post<ApiResponse<null>>('/api/merchant/room-types', payload)
        } else {
          resp = await http.put<ApiResponse<null>>(`/api/merchant/room-types/${model.id}`, payload)
        }
        
        if (!resp.data.success) {
          ElMessage.error(resp.data.message || '保存失败')
          return
        }
        ElMessage.success(model.id == null ? '新增房型成功' : '编辑房型成功')
        open.value = false
        await load()
      } catch (e: any) {
        ElMessage.error(e?.response?.data?.message || '保存失败')
      } finally {
        saving.value = false
      }
    }

    onMounted(load)

    return () => (
      <div class="merchant-roomtypes-page">
        <ElCard class="roomtypes-toolbar-card">
          <div class="toolbar-row">
            <div class="page-title">房型管理</div>
            <ElButton type="primary" onClick={add} class="roomtypes-add-btn">
              <el-icon><Plus /></el-icon>
              新增房型
            </ElButton>
          </div>
        </ElCard>

        <div v-loading={loading.value}>
          {items.value.length === 0 ? (
            <ElCard class="roomtypes-empty-card">
              <ElEmpty description="暂无房型数据，请先新增房型" />
            </ElCard>
          ) : (
            <div class="roomtypes-grid">
              {items.value.map(row => (
                <ElCard key={row.id} class="roomtype-card" bodyStyle={{ padding: '24px' }}>
                  <div class="roomtype-card-content">
                    <div class="roomtype-main">
                      <div class="roomtype-image-wrap">
                        <img src={getRoomTypeImage(row.name)} alt={row.name} class="roomtype-image" />
                      </div>
                      <div class="roomtype-info">
                        <div class="roomtype-name-line">
                          <div class="roomtype-name">{row.name}</div>
                          {row.stock <= 0 && <ElTag type="danger" size="small">已满房</ElTag>}
                        </div>
                        <div class="roomtype-meta">
                          <span>床型：大/双床</span>
                          <span>可住：2人</span>
                          <span>面积：25-30㎡</span>
                        </div>
                        <div class="roomtype-facilities">设施：{row.facilitiesText}</div>
                        <div class="roomtype-stock">当前总库存：{row.stock} 间</div>
                      </div>
                    </div>
                    <div class="roomtype-side">
                      <div class="roomtype-price">
                        ¥ {row.price} <span>/ 晚</span>
                      </div>
                      <div class="roomtype-actions">
                        <ElButton size="small" class="roomtype-edit-btn" onClick={() => edit(row)}>
                          <el-icon><Edit /></el-icon>
                          编辑房型
                        </ElButton>
                        <ElPopconfirm
                          title="确定要删除该房型吗？如果有未完成的订单将无法删除。"
                          confirmButtonText="删除"
                          cancelButtonText="取消"
                          onConfirm={() => remove(row.id)}
                        >
                          {{
                            reference: () => (
                              <ElButton size="small" class="roomtype-delete-btn">
                                <el-icon><Delete /></el-icon>
                                删除房型
                              </ElButton>
                            ),
                          }}
                        </ElPopconfirm>
                      </div>
                    </div>
                  </div>
                </ElCard>
              ))}
            </div>
          )}
        </div>

        <ElDialog 
          v-model={open.value} 
          title={model.id == null ? '新增房型' : '编辑房型'} 
          width="600px"
          closeOnClickModal={false}
          v-slots={{
            footer: () => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <ElButton onClick={() => (open.value = false)}>取消</ElButton>
                <ElButton type="primary" loading={saving.value} onClick={save}>
                  保存提交
                </ElButton>
              </div>
            )
          }}
        >
          <ElForm ref={formRef} model={model} rules={rules} labelWidth="90px">
            <ElFormItem label="房型名称" prop="name">
              <ElInput v-model={model.name} placeholder="例如：高级大床房" />
            </ElFormItem>
            <div style={{ display: 'flex', gap: '16px' }}>
              <ElFormItem label="每晚单价" prop="price" style={{ flex: 1 }}>
                <ElInputNumber v-model={model.price} min={0} controlsPosition="right" style={{ width: '100%' }} />
              </ElFormItem>
              <ElFormItem label="房间总库存" prop="stock" style={{ flex: 1 }}>
                <ElInputNumber v-model={model.stock} min={0} controlsPosition="right" style={{ width: '100%' }} />
              </ElFormItem>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <ElFormItem label="床型规格" prop="bedType" style={{ flex: 1 }}>
                <ElInput v-model={model.bedType} placeholder="例如：1.8m大床" />
              </ElFormItem>
              <ElFormItem label="可住人数" prop="capacity" style={{ flex: 1 }}>
                <ElInputNumber v-model={model.capacity} min={1} max={10} controlsPosition="right" style={{ width: '100%' }} />
              </ElFormItem>
            </div>
            <ElFormItem label="房间面积" prop="area">
              <ElInput v-model={model.area} placeholder="例如：30㎡" >
                {{ append: () => '㎡' }}
              </ElInput>
            </ElFormItem>
            <ElFormItem label="房型封面">
              <ElUpload
                action="#"
                listType="picture-card"
                autoUpload={false}
                limit={1}
              >
                <ElIcon><Plus /></ElIcon>
              </ElUpload>
            </ElFormItem>
            <ElFormItem label="设施说明" prop="facilitiesText">
              <ElInput v-model={model.facilitiesText} type="textarea" rows={3} placeholder="例如：无烟房, 独立卫浴, 免费WiFi" />
            </ElFormItem>
          </ElForm>
        </ElDialog>
      </div>
    )
  },
})
