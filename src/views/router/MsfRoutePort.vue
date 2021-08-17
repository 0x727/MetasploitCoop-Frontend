<template>
  <div class="msf-router-list">
    <el-table
      ref="table"
      v-loading="listLoading"
      :data="routerData"
      height="100%"
      :sortable="true"
      size="mini"
      fit
      element-loading-text="Loading"
      highlight-current-row
      @row-contextmenu="handleRightClickRow"
    >
      <el-table-column
        v-for="(item,index) in defaultColumn"
        :key="index"
        :prop="item.label"
        :label="item.name"
        sortable
        :width="item.width"
      >
        <template slot-scope="scope">
          <span
            class="item-ellipsis"
            v-text="scope.row[item.label]"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="140"
      >
        <template slot-scope="scope">
          <el-tooltip :enterable="false" content="删除路由" placement="top-start">
            <el-popconfirm
              title="操作不可逆，确认删除路由？"
              @onConfirm="deleteRow(scope.row)"
            >
              <el-button
                slot="reference"
                size="mini"
                type="danger"
                icon="el-icon-delete"
              />
            </el-popconfirm>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <easy-cm
      :list="cmList"
      tag="router_list"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { route_list, route_stop } from '@/api/route'

export default {
  name: 'MsfRoutePort',
  components: {

  },
  data() {
    return {
      curContextRow: null,
      curContextColumn: null,
      curContextEvent: null,
      routerData: [],
      base_info: [],
      other_info: [],
      ids: [],
      columnFilterVisible: false,
      listLoading: true,
      allColumn: [],
      multipleSelection: [],
      defaultColumn: [
        { label: 'session', width: 140, name: '网关会话ID' },
        { label: 'subnet', width: 0, name: '子网' },
        { label: 'netmask', width: 0, name: '子网掩码' }
      ],
      cmList: []
    }
  },
  computed: {
    ...mapGetters([
      'session_events'
    ])
  },
  watch: {
    routerData() {
      this.repaint()
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      await route_list().then(response => {
        this.routerData = response.data
      })
      this.listLoading = false
    },
    repaint() {
      this.$nextTick(() => {
        this.$refs.table.doLayout()
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 表格某一行右键点击
    handleRightClickRow(row, column, event) {
      this.curContextRow = row
      this.curContextColumn = column
      this.curContextEvent = event
      this.$easycm(event, this.$root, 'router_list')
    },
    async deleteRow(row) {
      await route_stop(row.session, row).then(response => {
        this.$notify({
          title: response.message,
          message: '路由ID:' + row.session + '删除成功',
          type: 'success',
          position: 'bottom-right'
        })
      })
      setTimeout(() => {
        this.fetchData()
      }, 1000)
    }
  }

}
</script>

<style lang="scss" scoped>
  //表头高度
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
  .msf-router-list {
    height: calc((100vh - 84px) * 0.5 - 24px - 41px - 24px);
  }
  ::v-deep.el-table--mini td, ::v-deep.el-table--mini th {
    padding: 0px 0;
  }
</style>
