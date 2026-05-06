import { defineComponent } from 'vue'
import ProfileCenterPage from '@/views/common/ProfileCenterPage'

export default defineComponent({
  name: 'UserProfilePage',
  setup() {
    return () => <ProfileCenterPage role="user" />
  },
})
