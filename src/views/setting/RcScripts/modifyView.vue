<template>
  <el-dialog
    title="添加资源脚本"
    width="80vw"
    :visible="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="cancel"
  >
    <el-switch
      v-model="formData.is_enabled"
      active-text="开启"
      inactive-text="关闭"
    />
    <el-form
      :model="formData"
      label-width="15vw"
      label-position="left"
    >
      <el-form-item label="标题">
        <el-input
          v-model="formData.title"
          placeholder="标题"
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          placeholder="描述"
        />
      </el-form-item>
      <el-form-item label="文件名">
        <el-input
          v-model="formData.filename"
          placeholder="文件名"
        />
      </el-form-item>
      <el-form-item label="脚本内容">
        <el-input
          v-model="formData.content"
          type="textarea"
          placeholder="脚本内容"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { modifyRcScripts, fetchRcScriptsById } from '@/api/scripts'
export default {
  components: {
  },
  props: {
    rows: {
      type: Object,
      default() { return ({}) }
    }
  },
  data() {
    return {
      menu_list: [],
      // 表单信息
      formData: {
        is_enabled: false,
        title: '标题',
        description: '描述',
        filename: '文件名.rc',
        content: ''
      }
    }
  },
  created() {
    this.initdata()
  },
  methods: {
    async initdata() {
      await fetchRcScriptsById(this.rows.id).then(response => {
        this.formData = response.data
      })
    },
    async confirm() {
      await modifyRcScripts(this.rows.id, this.formData).then(response => {
        if (response.data) {
          this.$notify({
            title: '修改模块选项配置成功',
            message: '脚本的ID：' + response.data.id,
            type: 'success',
            position: 'bottom-right'
          })
        }
        this.$emit('refresh')
        this.$emit('cancel')
      })
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>
