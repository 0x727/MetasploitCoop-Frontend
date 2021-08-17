<template>
  <el-dialog
    title="生成 Stagers"
    :visible="true"
    width="80vw"
    top="5vh"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="cancel"
  >
    <el-tabs v-model="activeName" style="height: 100%" class="stager_page">
      <el-tab-pane style="min-height: 100%;" label="原生" name="native">
        <hr>
        <el-form ref="payloadForm" :model="formData">
          <el-row>
            <el-col :span="10">
              <el-form-item label="编码器" prop="Encoder">
                <el-select
                  v-model="formData.runoptions.Encoder"
                  class="filter-item"
                  default-first-option
                  allow-create
                  clearable
                  filterable
                  remote
                  reserve-keyword
                  placeholder="编码器"
                  :remote-method="load_encoder"
                  :loading="encoder_loading"
                >
                  <el-option
                    v-for="item in payloadEncoders"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="是否强制编码" prop="ForceEncode">
                <el-radio v-model="formData.runoptions.ForceEncode" :label="true">是</el-radio>
                <el-radio v-model="formData.runoptions.ForceEncode" :label="false">否</el-radio>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="编码次数" prop="Iterations">
                <el-input v-model="formData.runoptions.Iterations" style="width: 50px" placeholder="" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="生成格式" prop="Format">
            <el-select
              v-model="formData.runoptions.Format"
              class="filter-item"
              default-first-option
              allow-create
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="格式"
              :remote-method="load_format"
              :loading="format_loading"
              @change="confirm"
            >
              <el-option
                v-for="item in msfEncodeformats"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Payload">
            <div v-show="payloadText.length">
              <el-input
                v-model="payloadText"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3}"
              />
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 插件 -->
      <el-tab-pane style="min-height: 100%;" label="插件" name="plugin">
        <hr>
        <el-row>
          <el-col :span="4">
            <el-select
              v-model="plugin_name"
              placeholder="插件"
              @change="changePlugin"
            >
              <el-option
                v-for="item in plugins"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-col>
          <el-col :span="20">
            {{ plugin.desc }}
          </el-col>
        </el-row>
        <PluginOptionsForm
          v-if="plugin&&plugin_name"
          ref="plugin"
          :options="plugin.options"
          :refdata="refdata"
        />
      </el-tab-pane>
    </el-tabs>
    <div slot="footer" class="dialog-footer">
      <el-button v-show="payloadText.length" icon="el-icon-document-copy" @click="handleCopy(payloadText,$event)">复制</el-button>
      <el-button type="primary" @click="confirm">生成</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </el-dialog>

</template>

<script>
import { listEncodeFormats, listEncoders } from '@/api/info'
import clip from '@/utils/clipboard' // use clipboard directly
import clipboard from '@/directive/clipboard/index.js' // use clipboard by v-directive
import {
  keyPayloadConfig,
  saveToLocalStorge
} from '@/utils/cache'
import { downloadBlob } from '@/utils/util'
import { gen_stagers } from '@/api/module'
import { get_payload, generate_payload } from '@/api/payload'
import PluginOptionsForm from '@/components/KTForm/PluginOptionsForm'

export default {
  name: 'MsfStagers',
  components: {
    PluginOptionsForm
  },
  directives: {
    clipboard
  },
  props: {
    row: {
      type: Object,
      default() {}
    }
  },
  data() {
    return {
      activeName: 'native',
      plugin_name: '',
      plugins: [],
      plugin: {},
      refdata: {},
      payloadText: '',
      platform: '',
      payloadEncoders: [],
      payloadEncodersForFilter: [],
      encoder_loading: false,
      format_loading: false,
      msfEncodeformats: [],
      msfEncodeformatsForFilter: [],
      formData: {
        Options: {},
        runoptions: {
          Encoder: null,
          NopSledSize: 0,
          ForceEncode: false,
          Iterations: 0,
          Platform: null
        }
      }
    }
  },
  computed: {

  },
  created() {
    this.initdata()
  },
  methods: {
    changePlugin() {
      this.plugins.forEach(p => {
        if (p.name === this.plugin_name) {
          this.plugin = p
        }
      })
      Object.keys(this.plugin.options).forEach((it) => {
        this.refdata[it] = this.plugin.options[it].default
      })
    },
    handleCopy(text, event) {
      clip(text, event)
    },
    cancel() {
      this.$emit('cancel')
    },
    async initdata() {
      await get_payload().then(response => {
        this.plugins = response.data
      })
      if (this.row.payload) { this.platform = this.row.payload.split('/')[0] }
      // 获取所有生成格式
      await listEncodeFormats().then(response => {
        const ex = {
          windows: ['elf', 'elf-so', 'osx-app'],
          linux: ['asp-exe', 'exe', 'exe-only', 'dll', 'ps1', 'powershell', 'vbapplication', 'vbscript', 'exe-service', 'exe-small', 'hta-psh', 'loop-vbs', 'macho', 'msi', 'msi-nouac', 'psh', 'psh-cmd', 'psh-net', 'psh-reflection', 'vba', 'vba-exe', 'vba-psh', 'vbs'] }
        this.msfEncodeformatsForFilter = response.data
        this.msfEncodeformats = response.data.filter(format => {
          return !ex[this.platform].includes(format)
        })
      })
      // 获取所有编码器模块标识
      await listEncoders().then(response => {
        this.payloadEncoders = response.data
        this.payloadEncodersForFilter = response.data
      })
      // 读取localstorge中的模块标识和选项
    },
    async confirm() {
      if (this.activeName === 'plugin') {
        const identifier = this.plugin.identifier
        const options = this.$refs['plugin'].getFormData()
        // options['info'] = Object.fromEntries(Object.entries(this.row).map((entry) => [entry[0].toUpperCase(), entry[1]]))
        this.formData.runoptions['Format'] = 'raw'
        await gen_stagers(this.row['jid'], this.formData.runoptions).then(raw_response => {
          if (raw_response.status !== 500) {
            // options.append('shellcode', new Blob([raw_response], { type: 'application/x-msdownload' }))
            var b64encoded = Buffer.from(raw_response).toString('base64')
            options['shellcode'] = b64encoded
            generate_payload(identifier, options).then(response => {
              if (response instanceof ArrayBuffer) {
                downloadBlob(response, `test.${options.format}`)
              }
            })
          } else {
            this.$notify({
              title: '提示',
              message: '请检查平台格式',
              type: 'error',
              position: 'bottom-right'
            })
          }
        })
      } else {
        this.$refs.payloadForm.validate(valid => {
          if (valid) {
            saveToLocalStorge(keyPayloadConfig, this.formData)
            gen_stagers(this.row['jid'], this.formData.runoptions).then(response => {
              if (response.status !== 500) {
                if (response instanceof ArrayBuffer) {
                  downloadBlob(response, `test.${this.formData.runoptions.Format}`)
                } else {
                  this.payloadText = response.data
                  // scrollToElement('#payload-top')
                }
              } else {
                this.$notify({
                  title: '提示',
                  message: '请检查平台格式',
                  type: 'error',
                  position: 'bottom-right'
                })
              }
            })
          }
        })
      }
    },
    load_encoder(query) {
      if (query !== '') {
        this.encoder_loading = true
        this.payloadEncoders = this.payloadEncodersForFilter.filter(item => {
          return item.toLowerCase().indexOf(query.toLowerCase()) > -1
        })
        this.encoder_loading = false
      } else {
        this.payloadEncoders = this.payloadEncodersForFilter
      }
    },
    load_format(query) {
      if (query !== '') {
        this.format_loading = true
        this.msfEncodeformats = this.msfEncodeformatsForFilter.filter(item => {
          return item.toLowerCase().indexOf(query.toLowerCase()) > -1
        })
        this.format_loading = false
      } else {
        this.msfEncodeformats = this.msfEncodeformatsForFilter
      }
    }
  }
}
</script>

<style>
.stager_page .el-tabs__content {
  padding: 0px;
  background-color: #fff!important;
  height: 100%!important;
}
.stager_page .el-tabs__header {
  background-color: #fff!important;
  margin-bottom: 0!important;
}
</style>
