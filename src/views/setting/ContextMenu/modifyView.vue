<template>
  <el-dialog
    title="修改右键菜单"
    width="80vw"
    :visible="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="cancel"
  >
    <el-switch
      v-model="isParent"
      active-text="父级菜单"
      inactive-text="子级菜单"
    />
    <el-form
      :model="formData"
      label-width="15vw"
      label-position="left"
    >
      <el-form-item v-if="!isParent" label="父级ID">
        <el-select
          v-model="formData.pid"
          filterable
          clearable
          placeholder="父级菜单"
        >
          <el-option
            v-for="(value,i) in menu_list"
            :key="i"
            :label="value['text']"
            :value="value['id']"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!isParent" label="是否自动运行">
        <el-switch
          v-model="formData.is_autorun"
        />
      </el-form-item>
      <el-form-item label="菜单名称">
        <el-input
          v-model="formData.text"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item v-if="!isParent" label="菜单类型">
        <el-select
          v-model="formData.type"
          filterable
          clearable
          placeholder="菜单类型"
        >
          <el-option
            v-for="(value,i) in type_list"
            :key="i"
            :label="value['label']"
            :value="value['type']"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.type==='shell'" label="命令列表">
        <el-input
          v-model="shellList"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item v-if="formData.type==='post'&&!isParent" label="模块名称">
        <el-cascader
          ref="refCasCader"
          v-model="moduleName"
          :options="cascaderData"
          :props="cascaderProps"
          clearable
          :filterable="true"
          style="width: 40vw"
          @change="handleCascaderChange"
        />
        <ModuleOption
          v-if="loading && post.fullname!==''"
          ref="RefModuleOption"
          :kb_modules_info="kb_modules_info"
          :fullname.sync="post.fullname"
          :show_exec="false"
          :cm_module_options="cm_module_options"
          v-on="$listeners"
          @Next="Next"
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
import ModuleOption from '@/components/web/Module/ModuleOption'
import { edit_context_menu, kb_context_menu } from '@/api/kb'
import Module from './mixins/Module'
// import { omit } from 'lodash'
export default {
  components: {
    ModuleOption
  },
  mixins: [Module],
  props: {
    rows: {
      type: Object,
      default() { return ({}) }
    }
  },
  data() {
    return {
      isParent: false,
      moduleName: [],
      shellList: '',
      cascaderData: [],
      cm_module_options: {},
      posts_all: [],
      post: {
        fullname: '',
        required: true,
        tags: [],
        is_autorun: false
      },
      cascaderProps: {
        value: 'title',
        label: 'title'
      },
      type_list: [{ type: 'post', label: '执行模块' }, { type: 'shell', label: '执行命令' }],
      menu_list: [],
      // 表单信息
      formData: {
        pid: 0,
        addition: null,
        description: '360',
        type: 'post',
        is_autorun: false,
        text: '枚举应用'
      }
    }
  },
  watch: {
    'formData.type'() {
    }
  },
  created() {
    this.initdata()
  },
  methods: {
    initdata() {
      this.fetch_menu()
      this.fetch_post_modules()
      this.formData = this.rows
      switch (this.formData.type) {
        case 'post':
          this.moduleName = this.formData.addition.post['module'].split('/')
          this.cm_module_options = this.formData.addition.options
          this.handleCascaderChange()
          break
        case 'shell':
          this.shellList = this.formData.addition.shell.join('&&')
          break
        case 'menu':
          this.isParent = true
          break
        default:
          break
      }
    },
    async fetch_menu() {
      this.menu_list = []
      await kb_context_menu().then(response => {
        response.data.results.forEach(element => {
          if (element.type === 'menu') { this.menu_list.push({ id: element.id, text: element.text }) }
        })
      })
    },

    async confirm() {
      this.$refs.RefModuleOption.NextOption()
      this.post.fullname = this.moduleName.join('/')
      switch (this.formData.type) {
        case 'post':
          this.formData.addition = {
            type: 'post',
            post: { module: this.post.fullname, is_autorun: this.formData.is_autorun },
            options: this.post_options
          }
          break
        case 'shell':
          this.formData.addition = { type: 'shell', shell: this.shellList.split('&&') }
          break
        default:
          break
      }
      if (this.isParent) {
        ['pid', 'post', 'shell'].forEach(item => {
          delete this.formData[item]
        })
        this.formData['type'] = 'menu'
        this.formData['addition'] = { type: 'menu', menu: {}}
      }
      await edit_context_menu(this.formData).then(response => {
        if (response.data) {
          this.$notify({
            title: '编辑右键菜单成功',
            message: '菜单的ID：' + response.data.id,
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
