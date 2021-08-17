<template>
  <div>
    <el-row
      :gutter="20"
      class="operate-container"
      type="flex"
    >
      <el-col :span="10">
        <el-button @click="refresh_module_cache">更新模块缓存</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { refresh_module_cache } from '@/api/module'

export default {
  name: 'UsersList',
  components: {

  },
  filters: {
    set_title(value, args) {
      switch (args) {
        case '标题':
          return value || '空'
        case '文件名':
          return value
        default:
          return value
      }
    }
  },
  data() {
    return {
      switch_register: true,
      currentPage: 1,
      pageSize: 15,
      curContextRow: null,
      curContextColumn: null,
      curContextEvent: null,
      userListData: [],
      createVisible: false,
      modifyVisible: false,
      userList_count: 0,
      columnFilterVisible: false,
      listLoading: true,
      multipleSelection: [],
      defaultColumn: [
        { label: 'username', width: 0, name: '姓名' },
        { label: 'last_login', width: 0, name: '最后登录时间' },
        { label: 'date_joined', width: 0, name: '加入时间' },
        { label: 'is_active', width: 0, name: '是否激活' }
      ],
      cmList: []
    }
  },
  computed: { },
  watch: { },

  created() {
    // this.initdata()
  },
  methods: {
    async refresh_module_cache() {
      await refresh_module_cache().then(response => {
        this.$message({
          message: '更新成功！',
          type: 'success'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 120px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 30%;
  }
  .item-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ::v-deep.el-table--mini td, ::v-deep.el-table--mini th {
    padding: 0px 0;
  }

  .operate-container{
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  }
.el-pagination {
  display: flex;
  justify-content: center;
}
</style>
