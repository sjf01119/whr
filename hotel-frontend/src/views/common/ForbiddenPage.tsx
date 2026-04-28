import { defineComponent } from 'vue'
import { ElResult } from 'element-plus'

export default defineComponent({
  name: 'ForbiddenPage',
  setup() {
    return () => <ElResult icon="warning" title="403" subTitle="无权限访问" />
  },
})

