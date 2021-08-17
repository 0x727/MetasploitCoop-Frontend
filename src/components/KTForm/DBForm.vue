<template>
  <el-form
    ref="DBForm"
    :rules="rules"
    class="form"
    :model="formData"
    label-width="15vw"
    label-position="left"
  >
    <div
      v-for="(item,index) in placeholder"
      :key="index"
    >
      <el-form-item
        v-if="Object.prototype.toString.call(item) !=='[object Null]'"
        :label="tran.hasOwnProperty(index)?tran[index]:index"
        :prop="index"
      >
        <el-input
          v-if="Object.prototype.toString.call(item) ==='[object String]'"
          v-model="formData[index]"
          :placeholder="item"
        />
        <el-input-number
          v-if="Object.prototype.toString.call(item) ==='[object Number]'"
          v-model="formData[index]"
          :min="0"
          :max="65535"
          label="Number"
        />
        <el-select
          v-if="Object.prototype.toString.call(item) ==='[object Array]'"
          v-model="formData[index]"
          filterable
          allow-create
          clearable
          :placeholder="item[0]"
        >
          <el-option
            v-for="(value,i) in item"
            :key="i"
            :label="value"
            :value="value"
          />
        </el-select>
        <el-date-picker
          v-if="Object.prototype.toString.call(item) ==='[object Date]'"
          v-model="formData[index]"
          type="datetime"
          placeholder="Select date time"
          align="right"
        />
      </el-form-item>
    </div>
  </el-form>
</template>

<script>
import { cloneDeep } from 'lodash'
export default {
  props: {
    refdata: {
      type: Object,
      default() {}
    },
    placeholder: {
      type: Object,
      default() {}
    },
    tran: {
      type: Object,
      default() { return ({}) }
    },
    rules: {
      type: Object,
      default() { return ({}) }
    }
  },
  data() {
    return {
      formData: {},
      isValidate: false
    }
  },
  created() {
    this.formData = cloneDeep(this.refdata)
  },
  methods: {
    valiFormDate() {
    },
    getFormData() {
      let flag = null
      // 函数里不能直接返回，不然会是undefined
      this.$refs.DBForm.validate((vaild) => {
        if (vaild) {
          flag = true
        } else {
          flag = false
          this.$notify({
            title: 'Error',
            message: 'Invalid data',
            type: 'error',
            position: 'bottom-right'
          })
        }
      })
      return { vaild: flag, form_data: this.formData }
    }
  }
}
</script>
