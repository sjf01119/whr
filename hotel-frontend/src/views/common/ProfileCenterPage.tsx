import { defineComponent, onMounted, reactive, ref } from 'vue'
import {
  ElAvatar,
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElUpload,
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { http, resolveBackendAssetUrl } from '@/lib/http'
import { useAuthStore, type Role } from '@/stores/auth'
import type { ApiResponse } from '@/types/api'
import './ProfileCenterPage.css'

type ProfileInfo = {
  id: number
  username: string
  role: string
  phone: string
  avatar: string
  createdAt: string
}

function roleLabel(role: string) {
  if (role === 'admin') return '管理员'
  if (role === 'merchant') return '商家'
  return '用户'
}

export default defineComponent({
  name: 'ProfileCenterPage',
  props: {
    role: {
      type: String as () => Role,
      required: true,
    },
  },
  setup(props) {
    const auth = useAuthStore()
    const loading = ref(false)
    const profile = ref<ProfileInfo | null>(null)
    const avatarPreview = ref('')
    const selectedAvatarFile = ref<File | null>(null)
    const savingAvatar = ref(false)
    const changingPassword = ref(false)
    const passwordFormRef = ref<InstanceType<typeof ElForm>>()

    const passwordModel = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

    const passwordRules = {
      oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '新密码至少6位', trigger: 'blur' },
      ],
      confirmPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' }],
    }

    async function loadProfile() {
      loading.value = true
      try {
        const resp = await http.get<ApiResponse<ProfileInfo>>(`/api/${props.role}/auth/profile`)
        if (resp.data.success) {
          profile.value = resp.data.data
          avatarPreview.value = resolveBackendAssetUrl(resp.data.data.avatar) || ''
          auth.setAvatarUrl(resp.data.data.avatar || null)
        }
      } finally {
        loading.value = false
      }
    }

    async function beforeAvatarUpload(file: File) {
      if (!file.type.startsWith('image/')) {
        ElMessage.error('请上传图片文件')
        return false
      }
      const ext = (file.name.split('.').pop() || '').toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        ElMessage.error('仅支持 jpg/png/webp 格式')
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过 5MB')
        return false
      }
      selectedAvatarFile.value = file
      avatarPreview.value = URL.createObjectURL(file)
      return false
    }

    async function saveAvatar() {
      if (!selectedAvatarFile.value) {
        ElMessage.warning('请先选择头像')
        return
      }
      savingAvatar.value = true
      try {
        const formData = new FormData()
        formData.append('file', selectedAvatarFile.value)
        const resp = await http.post<ApiResponse<{ avatar: string }>>(
          `/api/${props.role}/auth/profile/avatar`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        if (!resp.data.success) {
          ElMessage.error(resp.data.message || '头像更新失败')
          return
        }
        auth.setAvatarUrl(resp.data.data.avatar || null)
        selectedAvatarFile.value = null
        ElMessage.success('头像更新成功')
        await loadProfile()
      } finally {
        savingAvatar.value = false
      }
    }

    async function changePassword() {
      if (!passwordFormRef.value) return
      const valid = await passwordFormRef.value.validate().catch(() => false)
      if (!valid) return
      changingPassword.value = true
      try {
        const resp = await http.post<ApiResponse<null>>(`/api/${props.role}/auth/profile/password`, passwordModel)
        if (!resp.data.success) {
          ElMessage.error(resp.data.message || '密码修改失败')
          return
        }
        ElMessage.success('密码修改成功')
        passwordModel.oldPassword = ''
        passwordModel.newPassword = ''
        passwordModel.confirmPassword = ''
        passwordFormRef.value.clearValidate()
      } finally {
        changingPassword.value = false
      }
    }

    onMounted(loadProfile)

    return () => (
      <div class="profile-page" v-loading={loading.value}>
        <ElCard class="profile-card">
          <div class="profile-section-title">账号信息</div>
          <div class="profile-account">
            <ElAvatar
              class="profile-main-avatar"
              size={72}
              src={resolveBackendAssetUrl(profile.value?.avatar) || '/default-avatar.svg'}
            >
              {(profile.value?.username?.charAt(0) || 'U').toUpperCase()}
            </ElAvatar>
            <ElDescriptions column={2} border>
              <ElDescriptionsItem label="用户名">{profile.value?.username || '-'}</ElDescriptionsItem>
              <ElDescriptionsItem label="角色">{roleLabel(profile.value?.role || '')}</ElDescriptionsItem>
              <ElDescriptionsItem label="手机号">{profile.value?.phone || '-'}</ElDescriptionsItem>
              <ElDescriptionsItem label="注册时间">{profile.value?.createdAt?.replace('T', ' ') || '-'}</ElDescriptionsItem>
            </ElDescriptions>
          </div>
        </ElCard>

        <ElCard class="profile-card">
          <div class="profile-section-title">更换头像</div>
          <div class="profile-avatar-editor">
            <ElUpload showFileList={false} autoUpload={false} beforeUpload={beforeAvatarUpload} accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp">
              <div class="avatar-upload-box">
                {avatarPreview.value ? (
                  <img src={avatarPreview.value} class="avatar-preview-img" alt="avatar-preview" />
                ) : (
                  <el-icon><Plus /></el-icon>
                )}
              </div>
            </ElUpload>
            <div class="avatar-actions">
              <div class="profile-tip">支持 JPG/PNG，建议 1:1 方形图片（可选裁剪）</div>
              <ElButton type="primary" loading={savingAvatar.value} onClick={saveAvatar}>
                保存头像
              </ElButton>
            </div>
          </div>
        </ElCard>

        <ElCard class="profile-card">
          <div class="profile-section-title">修改密码</div>
          <ElForm ref={passwordFormRef} model={passwordModel} rules={passwordRules} labelPosition="top" class="password-form">
            <ElFormItem label="原密码" prop="oldPassword">
              <ElInput v-model={passwordModel.oldPassword} type="password" showPassword placeholder="请输入原密码" />
            </ElFormItem>
            <ElFormItem label="新密码" prop="newPassword">
              <ElInput v-model={passwordModel.newPassword} type="password" showPassword placeholder="请输入新密码" />
            </ElFormItem>
            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput v-model={passwordModel.confirmPassword} type="password" showPassword placeholder="请再次输入新密码" />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" loading={changingPassword.value} onClick={changePassword}>确认修改</ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </div>
    )
  },
})
