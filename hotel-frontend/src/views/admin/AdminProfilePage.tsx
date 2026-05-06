import { defineComponent } from 'vue'
import ProfileCenterPage from '@/views/common/ProfileCenterPage'

export default defineComponent({
  name: 'AdminProfilePage',
  setup() {
    return () => <ProfileCenterPage role="admin" />
  },
})
