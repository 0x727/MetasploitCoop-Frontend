<template>
  <el-dialog
    title="Modify visual columns"
    width="650px"
    :visible="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="cancel"
  >
    <el-transfer
      v-model="defaultData"
      filterable
      :filter-method="filterMethod"
      :data="data"
      :titles="title"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">Confirm</el-button>
      <el-button @click="cancel">Cancel</el-button>
    </div>
  </el-dialog>
</template>

<script>

export default {
  props: {
    page: {
      type: String,
      default() {
        return ''
      }
    },
    defaultList: {
      type: Array,
      default() {
        return []
      }
    },
    allList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      data: this.data,
      defaultData: this.defaultList,
      title: ['all columns', 'show columns']
    }
  },
  created() {
    this.data = this.allList.map(item => {
      return {
        key: item,
        label: item
      }
    })
  },
  methods: {
    async confirm() {
      this.$emit('success')
    },
    cancel() {
      this.$emit('cancel')
    },
    getdefaultData() {
      return this.defaultData
    },
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1
    }
  }
}
</script>
