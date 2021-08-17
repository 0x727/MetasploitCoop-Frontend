<template>
  <el-dialog
    title="添加关键词"
    width="80vw"
    :visible="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="cancel"
  >
    <DBForm
      ref="DBFormRef"
      :placeholder="placeholder"
      :refdata="formData"
      :tran="tran"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import DBForm from '@/components/KTForm/DBForm'
import { kb_modules_edit } from '@/api/kb'
// import { omit } from 'lodash'
export default {
  components: {
    DBForm
  },
  props: {
    rows: {
      type: Object,
      default() { return ({}) }
    }
  },
  data() {
    return {
      category_list: [],
      placeholder: {
        title: '360tray.exe',
        intro: '说明'
      },
      formData: {
        title: null,
        intro: null,
        description: null
      },
      tran: {
        title: '关键词',
        intro: '说明'
      }
    }
  },
  created() {
    this.formData = this.rows
  },
  methods: {
    async confirm() {
      const { vaild, form_data } = this.$refs.DBFormRef.getFormData()
      if (vaild) {
        await kb_modules_edit(form_data).then(response => {
          if (response.data) {
            this.$notify({
              title: '修改模块翻译成功',
              message: '模块翻译的ID：' + response.data.id,
              type: 'success',
              position: 'bottom-right'
            })
          }
        })
        this.$emit('success')
      }
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>
