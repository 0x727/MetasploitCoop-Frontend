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
import { create_keywords, kb_focus_keywords_categories } from '@/api/kb'
export default {
  components: {
    DBForm
  },
  data() {
    return {
      category_list: [],
      placeholder: {
        word: '360tray.exe',
        category: [],
        description: '360安全卫士-实时保护'
      },
      formData: {
        word: null,
        category: null,
        description: null
      },
      tran: {
        word: '关键词',
        category: '分类',
        description: '描述'
      }
    }
  },
  created() {
    this.initdata()
  },
  methods: {
    async initdata() {
      await kb_focus_keywords_categories().then(response => {
        this.category_list = []
        response.data.forEach(categorys => {
          this.category_list.push(categorys.category)
        })
        this.placeholder['category'] = this.category_list
      })
    },
    async confirm() {
      const { vaild, form_data } = this.$refs.DBFormRef.getFormData()
      if (vaild) {
        await create_keywords(form_data).then(response => {
          if (response.data) {
            this.$notify({
              title: '创建关键词成功',
              message: '关键词的ID：' + response.data.id,
              type: 'success',
              position: 'bottom-right'
            })
          }
        })
        // this.$emit('cancel')
      }
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>
