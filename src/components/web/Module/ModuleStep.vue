<template>
  <div class="msf-session-module">
    <el-dialog
      title="执行模块-选项"
      class="dialog"
      :center="true"
      :visible="true"
      top="5vh"
      :lock-scroll="true"
      width="80vw"
      :modal="true"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      @close="cancel"
    >
      <el-steps :active="activeStep" finish-status="success" simple>
        <el-step title="选择要执行的模块" icon="el-icon-setting" />
        <el-step title="选择一个Payload" icon="el-icon-check" />
      </el-steps>
      <div v-if="activeStep==0">
        <p>
          标题:&emsp;{{ kb_modules_info.title }}
        </p><hr>描述:&emsp;{{ kb_modules_info.intro ||'请选择要执行的模块' }}
        <el-divider />
        <el-form
          ref="form"
          :inline="true"
          label-position="left"
          :model="module"
          label-width="100px"
        >
          <el-form-item
            :required="module.required"
            :label="(module.required)? 'module:':'[module]:'"
          >
            <el-col :span="24">
              <!-- 联级选择器 -->
              <el-cascader
                ref="refCasCader"
                v-model="cascaderValue"
                :options="cascaderData"
                :props="cascaderProps"
                clearable
                :filterable="true"
                style="width: 40vw"
                @change="handleCascaderChange"
              />
            </el-col>

            <!-- 降噪 -->
            <div v-if="!module.required && !module.fullname" align="right">
              <el-divider />
              <el-button type="primary" icon="el-icon-arrow-left" @click="Back">上一步</el-button>
              <el-button type="primary" @click="Next">执行<i class="el-icon-arrow-right el-icon--right" /></el-button>
            </div>
          </el-form-item>
        </el-form>
        <el-divider />
        <ModuleOption
          v-if="loading && module.fullname!==''"
          ref="RefModuleOption"
          :kb_modules_info="kb_modules_info"
          :fullname.sync="module.fullname"
          :show_exec="true"
          v-on="$listeners"
          @Next="Next"
          @Back="Back"
        />
      </div>
      <div v-if="activeStep==1&&module.required">
        <aside v-if="!module.required">
          这个exploit的payload是可选项，如果你不想设置可以跳过
        </aside>
        <ListenerStep
          ref="moduleOptionRef"
          :page="cascaderValue[0]"
          :fullname="module.fullname"
          :exploit-options="module_options"
          @ReturnPayload="execute_module"
        />
        <div align="right">
          <el-button type="primary" icon="el-icon-arrow-left" @click="Back">上一步</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ModuleOption from '@/components/web/Module/ModuleOption'
import ListenerStep from '@/components/web/Module/ListenerStep'
import { modules_fetch } from '@/api/module'
import { call_post } from '@/api/module'
import { pathToTree } from '@/utils/util'
import { kb_modules_fetch } from '@/api/kb'
export default {
  components: {
    ModuleOption,
    ListenerStep
  },
  data() {
    return {
      filter_options: { },
      activeStep: 0,
      module: {
        fullname: '',
        required: true,
        tags: [],
        is_autorun: false
      },
      loading: false,
      select_loading: false,
      module_options: {},
      payload_options: {},
      cascaderData: [],
      kb_modules_info: {},
      modules_tree_all: [],
      modules_all: [],
      cascaderValue: [],
      cascaderProps: {
        value: 'title',
        label: 'title'
      }

    }
  },
  created() {
    this.initdata()
  },
  methods: {
    clearData() {
      this.module.fullname = ''
      this.cascaderValue = []
    },
    initdata() { // 读取localstorge中的模块标识和选项
      this.fetch_all_modules()
    },
    getPostTypesTree(data) {
      const types = data.map((value) => {
        return value['fullname']
      })
      const tree = pathToTree(types, this.filter_options)
      return tree
    },
    async fetch_all_modules() {
      await modules_fetch().then(response => {
        this.modules_all = response.data
        this.modules_tree_all = this.getPostTypesTree(response.data)
        this.cascaderData = this.modules_tree_all
        this.cascaderData = this.cascaderData.sort(function(a, b) {
          return a.weight < b.weight ? 1 : -1
        })
      })
      this.module.fullname = localStorage.getItem('Module', '')
      if (this.module.fullname) {
        this.cascaderValue = this.module.fullname.split('/') || []
        this.handleCascaderChange()
      }
    },
    async handleCascaderChange(value) { // 根据用户使用，添加权重
      if (!this.cascaderValue.join('/')) {
        this.clearData()
        return false
      }
      this.module.fullname = this.cascaderValue.join('/')
      localStorage.setItem('Module', this.module.fullname)
      await kb_modules_fetch({ fullname: this.module.fullname }).then(response => {
        if (response.data.results.length === 1) {
          this.kb_modules_info = response.data.results[0]
          this.loading = true
        }
      })
    },

    Back() {
      if (this.activeStep !== 0) {
        this.activeStep--
      }
    },
    async execute_module(payload_options) { // 执行模块
      var opts = Object.assign({}, this.module_options, payload_options)
      var module_id = this.modules_all.filter((module) => {
        return (module['fullname'] === this.module.fullname)
      })
      if (module_id.length === 1) {
        await call_post(module_id[0].id, opts).then(response => {
          var job = response.data
          if (job.job_id) {
            this.$notify({
              title: '执行模块成功，请等待返回结果',
              message: 'UUID:' + job.uuid,
              type: 'success',
              position: 'bottom-right'
            })
          } else {
            this.$notify({
              title: '执行模块失败',
              message: 'UUID:' + job.uuid,
              type: 'error',
              position: 'bottom-right'
            })
          }
          this.$emit('cancel')
        })
      }
    },
    Next(data) {
      if (this.activeStep === 0 && this.modules_all) {
        this.activeStep++
        this.module_options = data
        // 判断是否有session这个属性，如果有就是可以不提供payload
        // console.log(this.kb_modules_info)
        this.module.required = Object.prototype.hasOwnProperty.call(this.kb_modules_info.options, 'DisablePayloadHandler')
        if (!this.module.required) {
          this.execute_module()
        }
      } else if (this.activeStep === 1) {
        this.payload_options = data
        this.execute_module()
      }
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>

.el-dialog-div{
  height: 50vh;
  width:"80%";
  overflow: auto;
  .module_left, .module_right {
    height: 90%;
  }
 }
</style>
