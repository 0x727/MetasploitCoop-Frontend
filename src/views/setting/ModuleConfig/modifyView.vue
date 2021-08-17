<template>
  <el-dialog
    title="修改模块选项配置"
    width="80vw"
    :visible="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="cancel"
  >
    <el-switch
      v-model="formData.is_public"
      active-text="共有"
      inactive-text="私有"
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
          placeholder="PROXIES"
        />
      </el-form-item>
      <el-form-item label="配置项值">
        <el-input
          v-model="formData.value"
          placeholder="socks5://127.0.0.1:1080"
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
import { modify_config, fetch_mod_config_by_id } from '@/api/module'
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
        is_public: false,
        is_enabled: true,
        config: {},
        key: 'PROXIES',
        value: 'socks5://127.0.0.1:1080'
      }
    }
  },
  created() {
    this.initdata()
  },
  methods: {
    async initdata() {
      await fetch_mod_config_by_id(this.rows.id).then(response => {
        this.formData.key = Object.keys(response.data.config)[0]
        this.formData.value = Object.values(response.data.config)[0]
      })
    },
    async confirm() {
      this.formData.config[this.formData.key] = this.formData.value
      await modify_config(this.rows.id, this.formData).then(response => {
        if (response.data) {
          this.$notify({
            title: '修改模块选项配置成功',
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
