<template>
  <el-dialog
    title="添加模块选项配置"
    width="80vw"
    :visible="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="cancel"
  >
    <el-switch
      v-model="formData.is_public"
      inactive-text="公开"
      active-color="#13ce66"
      inactive-color="#ff4949"
    />
    <el-switch
      v-model="formData.is_enabled"
      inactive-text="启用"
      active-color="#13ce66"
      inactive-color="#ff4949"
    />
    <el-form
      :model="formData"
      label-width="15vw"
      label-position="left"
    >
      <el-form-item label="配置项名">
        <el-input
          v-model="formData.key"
          placeholder="例如：PROXIES"
        />
      </el-form-item>
      <el-form-item label="配置项值">
        <el-input
          v-model="formData.value"
          placeholder="例如：socks5://127.0.0.1:1080"
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
import { create_mod_config } from '@/api/module'
export default {
  components: {
  },
  data() {
    return {
      menu_list: [],
      // 表单信息
      formData: {
        is_public: false,
        is_enabled: true,
        config: {},
        key: '',
        value: ''
      }
    }
  },
  created() {
  },
  methods: {
    async confirm() {
      this.formData.config[this.formData.key] = this.formData.value
      await create_mod_config(this.formData).then(response => {
        if (response.data) {
          this.$notify({
            title: '创建模块选项配置成功',
            message: '配置的ID：' + response.data.id,
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
