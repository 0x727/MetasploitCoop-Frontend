<template>
  <div>
    <el-form
      ref="PluginOpt"
      :model="pluginFormData"
      label-width="240px"
      label-position="left"
    >
      <div
        v-for="(item,index) in options"
        :key="index"
      >
        <el-form-item
          :label="item.name"
          :prop="item.name"
          :required="item.required"
        >
          <label slot="label">
            <el-tooltip :content="item.desc" placement="top-start">
              <i class="el-icon-question" />
            </el-tooltip>
            {{ item.name }}</label>
          <el-input
            v-if="item.type =='string'||item.type =='float'"
            v-model="pluginFormData[item.name]"
            :placeholder="item.desc"
          />
          <el-input
            v-if="item.type === 'address'"
            v-model="pluginFormData[item.name]"
            :placeholder="item.desc"
          />
          <el-input
            v-if="item.type =='addressrange'"
            v-model="pluginFormData[item.name]"
            :placeholder="item.desc"
          ><el-button slot="prepend" icon="el-icon-folder" @click="showFileDialog(item.type,item.name)" /></el-input>
          <el-switch
            v-if="item.type =='bool'"
            v-model="pluginFormData[item.name]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
          <el-input-number
            v-if="item.type =='port'"
            v-model="pluginFormData[item.name]"
            :min="0"
            :max="65535"
            label="Number"
            :placeholder="item.desc"
          />
          <el-input
            v-if="item.type =='path'"
            v-model="pluginFormData[item.name]"
            :placeholder="item.desc"
          > <el-button slot="prepend" icon="el-icon-folder" @click="showFileDialog(item.type,item.name)" />
          </el-input>
          <el-input-number
            v-if="item.type =='integer'"
            v-model="pluginFormData[item.name]"
            label="Number"
            :placeholder="item.desc"
          />
          <el-select
            v-if="item.type =='enum'"
            v-model="pluginFormData[item.name]"
            filterable
            :placeholder="item.desc"
            @change="change"
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
    </el-form>
  </div>

</template>

<script>
import { cloneDeep } from 'lodash'
export default {
  components: {

  },
  props: {
    options: {
      type: Object,
      default() { }
    },
    refdata: {
      type: Object,
      default() { }
    }
  },
  data() {
    return {
      options_copy: {},
      fileuploadDialogVisible: false,
      pluginFormData: {}
    }
  },
  created() {
    this.pluginFormData = cloneDeep(this.refdata)
  },

  methods: {
    change(value) {
      console.log(this.pluginFormData)
      console.log(value)
    },
    getFormData() {
      // const RawformData = new FormData()
      // Object.keys(this.pluginFormData).forEach(it => {
      //   RawformData.append(it, this.pluginFormData[it])
      // })
      return this.pluginFormData
    }
  }
}
</script>
