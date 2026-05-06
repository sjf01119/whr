import { defineComponent } from 'vue'
import ProfileCenterPage from '@/views/common/ProfileCenterPage'

export default defineComponent({
  name: 'MerchantProfilePage',
  setup() {
    return () => <ProfileCenterPage role="merchant" />
  },
})
