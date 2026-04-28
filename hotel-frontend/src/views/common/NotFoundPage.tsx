import { defineComponent } from 'vue'
import { ElResult } from 'element-plus'

export default defineComponent({
  name: 'NotFoundPage',
  setup() {
    return () => <ElResult icon="info" title="404" subTitle="页面不存在" />
  },
})

