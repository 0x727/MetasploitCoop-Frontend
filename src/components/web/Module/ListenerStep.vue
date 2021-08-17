<template>
  <div>

    <!-- $attrs可以获取父作用域传入的值（不包括props中的） -->
    <!-- $listeners相当于父作用域的事件监听器 this.$emit-->

    <aside>
      {{ page }}:&emsp;{{ fullname }}
      <div v-if="payload.fullname">
        <hr>payload:&emsp;{{ payload.fullname ||'NULL' }}</div>
    </aside>
    <el-divider />
    <div class="el-dialog-div">
      <!-- exploit -->
      <div v-if="activeStep==1">
        <aside v-if="!payload.required">
          这个exploit的payload是可选项，如果你不想设置可以跳过
        </aside>
        <el-form
          ref="form"
          :inline="true"
          label-position="left"
          :model="payload"
          label-width="100px"
        >

          <el-form-item
            :required="payload.required"
            :label="(payload.required)? 'Payload:':'[Payload]:'"
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
                @expand-change="handleCascaderExpandChange"
                @change="handleCascaderChange"
              />
            </el-col>
            <!-- <el-col :span="1">
                <el-divider direction="vertical" />
              </el-col> -->

            <!-- 降噪 -->
            <div v-if="!payload.required && !payload.fullname" align="right">
              <el-divider />
              <el-button type="primary" icon="el-icon-arrow-left" @click="Back">上一步</el-button>
              <el-button type="primary" @click="Next">Run<i class="el-icon-arrow-right el-icon--right" /></el-button>
            </div>
          </el-form-item>
        </el-form>

        <!-- 双向绑定 -->
        <ModuleOption
          v-if="activeStep==1 && payload.fullname !==''&&loading"
          ref="RefModuleOption"
          page="payload"
          :kb_modules_info="kb_modules_info"
          :fullname.sync="payload.fullname"
          :show_exec="true"
          v-on="$listeners"
          @Next="Next"
          @Back="Back"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ModuleOption from '@/components/web/Module/ModuleOption'
import { pathToTree } from '@/utils/util'
import { kb_modules_fetch } from '@/api/kb'
import { module_execute, module_compatible_payloads } from '@/api/module'
import {
  keyPayloadType,
  keyPayloadConfig,
  keyPayloadWeight,
  saveToLocalStorge,
  getFromLocalStorge
} from '@/utils/cache'
export default {
  components: {
    ModuleOption
  },
  props: {
    page: {
      type: String,
      default() { '' }
    },
    fullname: {
      type: String,
      default() { 'exploit/multi/handler' }
    },
    exploitOptions: {
      type: Object,
      default() { return ({}) }
    }
  },
  data() {
    return {
      filter_options: { },
      cascaderProps: {
        value: 'title',
        label: 'title'
      },
      kb_modules_info: {},
      loading: false,
      cascaderData: [],
      cascaderValue: [],
      activeStep: 1,
      // exploit_options: {},
      payload_options: {},
      payloads_tree_all: [],
      payload: {
        fullname: '',
        required: true,
        tags: []
      }
    }
  },
  watch: {

  },
  created() {
    if (this.page === 'exploit') {
      // 查询可用payload
      this.compatible_payloads(this.fullname)
    }
    this.initdata()
  },
  methods: {
    clearData() {
      this.payload.fullname = ''
      this.cascaderValue = []
    },
    // 选择模块变更时调用，保存一些数据到缓存
    async handleChangePayloadType(payloadType) {
      if (!payloadType) {
        this.clearData()
        return
      }
      this.payload.fullname = payloadType
      await kb_modules_fetch({ fullname: 'payload/' + this.payload.fullname }).then(response => {
        this.kb_modules_info = response.data
        if (response.data.results.length === 1) {
          this.kb_modules_info = response.data.results[0]
          this.loading = true
        }
      })
      saveToLocalStorge(keyPayloadType, payloadType)
    },
    initdata() {
      // 读取localstorge中的模块标识和选项
      this.payload.fullname = getFromLocalStorge(keyPayloadType, '')
      this.cascaderValue = this.payload.fullname.split('/')
      if (this.payload.fullname !== '') {
        this.handleChangePayloadType(this.payload.fullname)
      }
      this.temp = getFromLocalStorge(keyPayloadConfig, this.temp)
      this.filter_options = getFromLocalStorge(keyPayloadWeight, {})
    },
    handleCascaderChange(value) {
      // 根据用户使用，添加权重
      this.handleChangePayloadType(this.cascaderValue.join('/'))
      value.forEach(element => {
        if (this.filter_options[element]) {
          this.filter_options[element]++
        } else {
          this.filter_options[element] = 1
        }
      })
      saveToLocalStorge(keyPayloadWeight, this.filter_options)
    },
    handleCascaderExpandChange(value) {
      // 计算权重,排序
      for (var i = 0; i < this.cascaderData.length; i++) {
        if (this.cascaderData[i].title === value[0]) {
          if (value.length === 1) {
            this.cascaderData[i]['children'] = this.cascaderData[i]['children'].sort(function(a, b) {
              return a.weight < b.weight ? 1 : -1
            })
          }
          const parent = this.cascaderData[i]['children']
          parent.forEach((child, index) => {
            if (child.title === value[1]) {
              if (value.length === 2) {
                parent[index]['children'] = parent[index]['children'].sort(function(a, b) {
                  return a.weight < b.weight ? 1 : -1
                })
                this.cascaderData[i]['children'] = parent
              }
            }
          })
        }
      }
    },
    Back() {
      if (this.activeStep !== 0) {
        this.activeStep--
      }
    },
    async execute_exploit() {
      var opts = Object.assign({}, this.exploit_options, this.payload_options, { PAYLOAD: this.payload.fullname })
      await module_execute(opts).then(response => {
        var job = response.data
        if (job.job_id) {
          this.$notify({
            title: '监听器创建成功',
            message: 'UUID:' + job.uuid,
            type: 'success',
            position: 'bottom-right'
          })
        } else {
          this.$notify({
            title: '监听器创建失败',
            message: 'UUID:' + job.uuid,
            type: 'error',
            position: 'bottom-right'
          })
        }
        this.$emit('cancel')
      })
    },
    Next(data) {
      if (this.activeStep === 0 && this.payloads_tree_all) {
        this.activeStep++
        this.exploit_options = data
        // 判断是否有session这个属性，如果有就是可以不提供payload
        this.payload.required = !Object.prototype.hasOwnProperty.call(data, 'SESSION')
      } else if (this.activeStep === 1) {
        this.payload_options = data
        if (this.fullname === 'exploit/multi/handler') {
          this.execute_exploit()
        } else {
          this.payload_options['PAYLOAD'] = this.payload.fullname
          this.$emit('ReturnPayload', this.payload_options)
        }
      }
    },
    getPayloadTypesTree(data) {
      const types = data.map((value) => {
        return value
      })
      const tree = pathToTree(types, this.filter_options)
      return tree
    },
    // 获取exploit可以用的payload
    async compatible_payloads(fullname) {
      await module_compatible_payloads(fullname, this.exploitOptions['TARGET']).then(response => {
        // 筛选
        this.payloads_tree_all = this.getPayloadTypesTree(response.data)
        this.cascaderData = this.payloads_tree_all
        this.cascaderData = this.cascaderData.sort(function(a, b) {
          return a.weight < b.weight ? 1 : -1
        })
      })
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
 .el-dialog-div{
    height: 60vh;
     overflow: auto;
 }
</style>
