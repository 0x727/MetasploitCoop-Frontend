<template>
  <div>
    <el-form
      ref="ModuleOpt"
      class="form"
      :model="formData"
      label-width="240px"
      label-position="left"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <div
        v-for="(item,index) in options"
        :key="index"
      >
        <!-- 规避的prop有::特殊字符，需要替换 -->
        <el-form-item
          :label="item.KTOPTION.replace( '_[=]_','::')"
          :prop="item.KTOPTION"
          :required="item.required"
          :rules="rulesFunc(item)"
        >
          <label slot="label">
            <el-tooltip :content="item.desc" placement="top-start">
              <i class="el-icon-question" />
            </el-tooltip>
            {{ item.KTOPTION.replace( '_[=]_','::') }}</label>
          <el-input
            v-if="item.type =='string'||item.type =='float'"
            v-model="formData[item.KTOPTION]"
            :placeholder="item.desc"
          />
          <el-input
            v-if="item.type === 'address'"
            v-model="formData[item.KTOPTION]"
            :placeholder="item.desc"
          />
          <el-input
            v-if="item.type =='addressrange'"
            v-model="formData[item.KTOPTION]"
            :placeholder="item.desc"
          ><el-button slot="prepend" icon="el-icon-folder" @click="showFileDialog(item.type,item.KTOPTION)">
            选择中转文件区的文件
          </el-button></el-input>
          <el-switch
            v-if="item.type =='bool'"
            v-model="formData[item.KTOPTION]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
          <el-input-number
            v-if="item.type =='port'"
            v-model="formData[item.KTOPTION]"
            :min="0"
            :max="65535"
            label="Number"
            :placeholder="item.desc"
          />
          <el-input
            v-if="item.type =='path'"
            v-model="formData[item.KTOPTION]"
            :placeholder="item.desc"
          > <el-button slot="prepend" icon="el-icon-folder" @click="showFileDialog(item.type,item.KTOPTION)" />
          </el-input>
          <el-input-number
            v-if="item.type =='integer'&&item.KTOPTION!=='SESSION'"
            v-model="formData[item.KTOPTION]"
            label="Number"
            :placeholder="item.desc"
          />
          <el-select
            v-if="item.KTOPTION==='SESSION'"
            v-model="formData[item.KTOPTION]"
            filterable
            :placeholder="item.desc"
          >
            <el-option
              v-for="(value,i) in session_list_data"
              :key="i"
              :label="`${value['id']}#[${value['session_host']}]${value['info']}:${value['desc']}`"
              :value="Number(value['id'])"
            />
          </el-select>
          <el-select
            v-if="item.type==='targets'"
            v-model="formData[item.KTOPTION]"
            filterable
            :placeholder="item.desc"
          >
            <el-option
              v-for="(value,i) in item.enums"
              :key="i"
              :label="value"
              :value="Number(i)"
            />
          </el-select>
          <el-select
            v-if="item.type =='enum'"
            v-model="formData[item.KTOPTION]"
            filterable
            :placeholder="item.desc"
          >
            <el-option
              v-for="(value,i) in item.enums"
              :key="i"
              :label="value"
              :value="value"
            />
          </el-select>
        </el-form-item>
      </div>
      <el-divider />
      <div v-show="$attrs.show_exec" align="right">
        <el-button v-if="!isFirst" type="primary" icon="el-icon-arrow-left" @click="back">上一步</el-button>
        <el-button @click="resetForm">重置选项</el-button>
        <el-button type="primary" @click="confirm">执行<i class="el-icon-arrow-right el-icon--right" /></el-button>
      </div>
    </el-form>
    <el-dialog
      :visible.sync="fileuploadDialogVisible"
      width="80vw"
      append-to-body
    >
      <MsfCoreFileTransit ref="Xfile" :is-return-file-path="true" @handlerReturnFilePath="setFilePath" />
    </el-dialog>
  </div>

</template>

<script>
import { cloneDeep } from 'lodash'
import validator from '@/utils/validate'
import MsfCoreFileTransit from '@/views/zFileTransit'
import { session_list } from '@/api/session'

export default {
  components: {
    MsfCoreFileTransit
  },
  inheritAttrs: false,
  props: {
    options: {
      type: Array,
      default() { [] }
    },
    refdata: {
      type: Object,
      default() { }
    },
    isFirst: {
      type: Boolean,
      default() { [] }
    }
  },
  data() {
    return {
      currentOption: { type: '', options: '' },
      fileuploadDialogVisible: false,
      formData: {},
      session_list_data: [],
      first: true
    }
  },
  created() {
    this.initdata()
  },
  mounted() {
    this.$emit('autorun')
  },
  methods: {
    async initdata() {
      this.formData = cloneDeep(this.refdata)
      await session_list().then(response => {
        this.session_list_data = response.data
      })
    },
    showFileDialog(type, args) {
      this.currentOption.type = type
      this.currentOption.options = args
      this.fileuploadDialogVisible = true
    },
    setFilePath(row) {
      this.formData[this.currentOption.options] = '$lootdir$' + row.path
      this.$refs.Xfile.unloading()
      this.fileuploadDialogVisible = false
    },
    confirm() {
      var Data = this.getFormData()
      if (Data.vaild) {
        this.$emit('NextOption', Data)
      }
      return true
    },
    back() {
      this.$emit('Back')
    },
    resetForm() {
      this.$refs.ModuleOpt.resetFields()
    },
    // 生成验证规则
    rulesFunc(dataItem) {
      const type = dataItem.type
      switch (type) {
        case 'port':case 'integer':
          return { type: 'integer', message: '请输入整数型', trigger: 'blur' }
        case 'bool':
          return { type: 'boolean', message: '请输入Bool型值', trigger: 'blur' }
        case 'float':
          return { type: 'float', message: '请输入浮点型数值', trigger: 'blur' }
        case 'string':
          return { type: 'string', message: '请输入字符串类型', trigger: 'blur' }
        case 'enum':
          return { type: 'enum', enum: dataItem.enums, message: '请选择枚举类型中的值', trigger: 'blur' }
        case 'address':
          return { type: 'string', validator: validator.validateIpv4, trigger: 'blur' }
        case 'addressrange':
          return { type: 'string', validator: validator.validateIpv4Range, trigger: 'blur' }
        default:
          break
      }
    },
    getFormData() {
      let flag = null
      // 函数里不能直接返回，不然会是undefined
      this.$refs.ModuleOpt.validate((vaild, Error) => {
        if (vaild) {
          flag = true
        } else {
          flag = false
          for (var i in Error) {
            this.$notify({
              title: Error[i][0].field,
              message: Error[i][0].message,
              type: 'error',
              position: 'bottom-right'
            })
          }
        }
      })
      return { vaild: flag, form_data: this.formData }
    }
  }
}
</script>
