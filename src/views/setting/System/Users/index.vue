<template>
  <div>
    <el-row
      :gutter="20"
      class="operate-container"
      type="flex"
    >
      <el-col :span="10">
        <el-switch
          v-model="switch_register"
          inactive-text="开放注册"
          active-text="关闭注册"
          active-color="#ff4949"
          inactive-color="#13ce66"
          @change="handleSwitchRegister"
        />
      </el-col>
    </el-row>

    <el-table
      v-loading="listLoading"
      :data="userListData"
      :sortable="true"
      size="mini"
      height="75vh"
      fit
      element-loading-text="Loading"
      highlight-current-row
      @row-contextmenu="handleRightClickRow"
    >
      <el-table-column
        v-if="userListData.length"
        type="selection"
      />
      <el-table-column
        v-for="(item,index) in defaultColumn"
        :key="index"
        :prop="item.label"
        :label="item.name"
        sortable
        :width="item.width"
      >
        <template slot-scope="scope">
          <div class="item-ellipsis">
            {{ scope.row[item.label] |set_title(item.name) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="90"
      >
        <template slot-scope="scope">
          <el-button
            title="编辑右键菜单"
            icon="el-icon-edit"
            type="primary"
            circle
            size="mini"
            @click="modifyData(scope.row)"
          />
          <el-button
            title="删除右键菜单"
            type="danger"
            icon="el-icon-delete"
            circle
            size="mini"
            @click="deleteRow(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { user_del, user_info, switch_register, user_list, user_modify_password } from '@/api/user'

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
    this.initdata()
  },
  methods: {
    async initdata() {
      await user_info().then(response => {
        if (Object.prototype.hasOwnProperty.call(response.data, 'close_register')) {
          this.switch_register = response.data.close_register
        }
      })
      this.fetchData()
    },
    async handleSwitchRegister(value) {
      await switch_register(value).then(response => {
        this.initdata()
      })
    },
    refresh() {
      this.fetchData()
    },
    async deleteRow(row) {
      await user_del(row.id).then(response => {
        if (response) {
          this.$notify({
            title: '删除用户成功',
            message: response.data.detail,
            type: 'success',
            position: 'bottom-right'
          })
        }
        this.refresh()
      })
    },
    handleSuccess() {
      this.modifyVisible = false
      this.fetchData(this.currentPage, this.pageSize)
    },
    modifyData(row) {
      this.curContextRow = row
      this.$prompt(`修改用户：${row.username}的密码`, '请输入新密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        user_modify_password(row.id, value)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消修改'
        })
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData(this.currentPage, this.pageSize)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData(this.currentPage, this.pageSize)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 表格某一行右键点击
    handleRightClickRow(row, column, event) {
      this.curContextRow = row
      this.curContextColumn = column
      this.curContextEvent = event
      this.$easycm(event, this.$root, 'moduleConfig_list')
    },
    async fetchData(page = 1, size = 15) {
      this.listLoading = true
      // this.userListData = []
      await user_list({ size: size, page: page }).then(response => {
        this.userListData = response.data
        this.listLoading = false
        this.userList_count = response.data.length
      })
      this.count = this.userListData.length
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
