<template>
  <div v-if="loading">
    <el-checkbox v-model="advancedOptionVisible" :disabled="advancedOption.length === 0">高级选项</el-checkbox>
    <el-checkbox v-model="evasionOptionVisible" :disabled="evasionOption.length === 0">规避选项</el-checkbox>
    <el-collapse
      v-model="activeName"
      accordion
    >
      <el-collapse-item title="基础选项" name="base">
        <ModuleOptionsForm
          ref="base"
          :options="baseOption"
          :refdata="baseFormData"
          :is-first="true"
          v-bind="$attrs"
          v-on="$listeners"
          @NextOption="NextOption"
          @autorun="autorun"
        />
      </el-collapse-item>
      <el-collapse-item
        v-if="advancedOptionVisible"
        title="高级选项"
        name="advanced"
      >
        <ModuleOptionsForm
          ref="advanced"
          :options="advancedOption"
          :refdata="advancedFormData"
          v-bind="$attrs"
          :show_exec="false"
          v-on="$listeners"
        />
      </el-collapse-item>
      <!-- bug -->
      <el-collapse-item
        v-if="evasionOptionVisible"
        title="规避选项"
        name="evasion"
      >
        <ModuleOptionsForm
          ref="evasion"
          :options="evasionOption"
          :refdata="evasionFormData"
          v-bind="$attrs"
          :show_exec="false"
          v-on="$listeners"
        />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import ModuleOptionsForm from '@/components/KTForm/ModuleOptionsForm'
import { module_options, fetch_mod_config, module_info } from '@/api/module'
import { extend, without } from 'lodash'

// import { kb_modules_fetch } from '@/api/kb'

import {
  saveToLocalStorge,
  getFromLocalStorge
} from '@/utils/cache'
export default {
  components: {
    ModuleOptionsForm
  },
  inheritAttrs: false,
  props: {
    sid: {
      type: Number,
      default() { return 0 }
    },
    lhost: {
      type: String,
      default() { return getFromLocalStorge('Listener_LHOST') }
    }
  },
  data() {
    return {
      loading: false,
      advancedOptionVisible: false,
      evasionOptionVisible: false,
      baseOption: [],
      evasionOption: [],
      advancedOption: [],
      activeName: 'base',
      baseFormData: {},
      evasionFormData: {},
      advancedFormData: {},
      rules: {},
      alreadyRun: false,
      moduleConfig: {},
      module_info: {}
    }
  },
  watch: {
    $attrs: function() {
      if (this.loading) {
        this.module_options_fetch()
      }
    }
  },
  created() {
    this.initdata()
  },
  methods: {
    async initdata() {
      if (this.$attrs.cm_module_options) { this.moduleConfig = this.$attrs.cm_module_options }
      await fetch_mod_config().then(response => {
        response.data.forEach(list => {
          if (list.is_enabled) {
            this.moduleConfig[Object.keys(list.config)[0]] = Object.values(list.config)[0]
          }
        })
      })
      this.module_options_fetch()
    },
    // 自动执行模块
    autorun() {
      if (this.$attrs.autorun && this.loading && !this.alreadyRun) {
        this.$refs.base.confirm()
        this.alreadyRun = true
      }
    },
    // 生成表单数据
    async module_options_fetch() {
      this.loading = false
      this.baseOption = []
      this.evasionOption = []
      this.advancedOption = []
      this.baseFormData = {}
      await module_options(this.$attrs.fullname).then(response => {
        var O = response.data
        var that = this
        Object.keys(O).forEach(function(options) {
          // 基础选项
          if (!O[options].advanced && !O[options].evasion) {
            O[options].KTOPTION = options
            if (that.$attrs.kb_modules_info) { O[options].desc = that.$attrs.kb_modules_info.options[options] }
            that.baseOption.push(O[options])
            that.baseFormData[options] = O[options].default
            if (options === 'SESSION') { that.baseFormData[options] = that.sid }
            if (options === 'LHOST') { that.baseFormData[options] = that.lhost }
            // 设置用户自定义的模块选项
            if (Object.prototype.hasOwnProperty.call(that.moduleConfig, options)) {
              that.baseFormData[options] = that.moduleConfig[options]
            }
          } else if (O[options].evasion) {
            O[options].KTOPTION = options.replace('::', '_[=]_')
            if (that.$attrs.kb_modules_info) { O[options].desc = that.$attrs.kb_modules_info.options[options] }
            that.evasionOption.push(O[options])
            that.evasionFormData[options.replace('::', '_[=]_')] = O[options].default
          } else if (O[options].advanced) {
            O[options].KTOPTION = options.replace('::', '_[=]_')
            if (that.$attrs.kb_modules_info) { O[options].desc = that.$attrs.kb_modules_info.options[options] }
            that.advancedOption.push(O[options])
            that.advancedFormData[options.replace('::', '_[=]_')] = O[options].default
          }
        })
      })
      await module_info(this.$attrs.kb_modules_info.fullname).then(response => {
        this.module_info = response.data
        if (this.module_info['targets']) {
          this.baseFormData['TARGET'] = this.module_info['default_target']
          this.baseOption.push({
            'KTOPTION': 'TARGET',
            'advanced': false,
            'default': this.module_info['default_target'],
            'desc': 'TARGET',
            'evasion': false,
            'required': false,
            'type': 'targets',
            'enums': this.module_info['targets'] })
        }
      })
      this.loading = true
    },
    NextOption(data) {
      var base = this.$refs.base.getFormData()
      var advanced = (this.advancedOptionVisible) ? this.$refs.advanced.getFormData() : {}
      var evasion = (this.evasionOptionVisible) ? this.$refs.evasion.getFormData() : {}
      var all_data = extend(base.form_data, advanced.form_data, evasion.form_data)
      var all_vaild = without([base.vaild, advanced.vaild, evasion.vaild], undefined).indexOf(false) === -1
      // 全部验证通过才下一步
      if (all_vaild) {
        this.$emit('Next', all_data)
        if (all_data['LHOST']) { saveToLocalStorge('Listener_LHOST', all_data['LHOST']) }
        if (this.moduleConfig['PROXIES']) { all_data['PROXIES'] = this.moduleConfig['PROXIES'] }
      }
    },
    cancel() {
      this.$emit('optCancel')
    }
  }
}
</script>
