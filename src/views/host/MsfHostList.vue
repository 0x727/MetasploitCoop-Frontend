<template>
  <div class="msf-host-list">
    <el-table
      ref="hostsData"
      v-loading="listLoading"
      :data="hostsData"
      height="100%"
      :sortable="true"
      size="mini"
      fit
      element-loading-text="Loading"
      highlight-current-row
      :cell-class-name="tableCellClassName"
      @expand-change="expandChange"
      @row-contextmenu="handleHostRightClickRow"
    >
      <el-table-column
        v-if="hostsData.length"
        type="expand"
      >
        <!-- // 子表 -->
        <template slot-scope="scope">
          <!-- {{ hostsData[scope.$index]| parse_dict }} -->
          <el-table
            :data.sync="scope.row.sessionx"
            max-height="100px"
            @row-contextmenu="handleRightClickRow"
          >
            <el-table-column
              v-for="(expand_item,i) in expand_table_columns"
              :key="i"
              :label="expand_item.name"
              :prop="expand_item.label"
              :width="expand_item.width"
            >
              <template slot-scope="xscope">
                <span
                  slot="reference"
                  class="item-ellipsis"
                >{{ xscope.row[expand_item.label]|parse_dict(expand_item.label) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
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
            slot="reference"
            class="item-ellipsis"
          >{{ scope.row[item.label]|parse_dict(item.label) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <easy-cm
      :list="cmSessionList"
      tag="host_session_list"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
    />
    <easy-cm
      :list="cmHostList"
      tag="host_list"
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
import { get_host, getSessionByHostId, del_host } from '@/api/dbmsf'
import clipboard from '@/directive/clipboard/index.js'
import { formatDate } from '@/utils/filters/date_format'

export default {
  name: 'MsfHostList',
  components: {
  },
  directives: {
    clipboard
  },
  filters: {
    parse_dict(value, args) {
      const host_status = { 'alive': '在线', 'down': '离线', 'unknown': '未知' }
      switch (args) {
        case 'created_at':case 'updated_at':case 'closed_at':case 'opened_at':
          return formatDate(value)
        case 'state':
          return host_status[value]
        default:
          return value
      }
    }
  },
  data() {
    return {
      curContextRow: null,
      curContextColumn: null,
      lootDialogVisible: false,
      curContextEvent: null,
      genStagersVisible: false,
      hostsData: [],
      sessionData: {},
      base_info: [],
      other_info: [],
      ids: [],
      columnFilterVisible: false,
      listLoading: true,
      allColumn: [],
      multipleSelection: [],
      defaultColumn: [
        // { label: 'id', width: 65, name: 'id' },
        { label: 'address', width: 120, name: '主机IP' },
        { label: 'state', width: 80, name: '状态' },
        { label: 'name', width: 150, name: '主机名' },
        { label: 'os_name', width: 0, name: '系统名' },
        { label: 'arch', width: 80, name: '架构' },
        { label: 'purpose', width: 100, name: '目标类型' },
        { label: 'created_at', width: 0, name: '上线时间' },
        { label: 'updated_at', width: 0, name: '最后更新时间' }
      ],
      expand_table_columns: [
        { label: 'id', width: 85, name: '会话ID' },
        { label: 'stype', width: 0, name: '会话类型' },
        { label: 'platform', width: 0, name: '后门架构' },
        { label: 'desc', width: 0, name: '描述' },
        { label: 'opened_at', width: 90, name: '上线时间' },
        { label: 'closed_at', width: 90, name: '下线时间' }
      ],
      cmSessionList: [{
        text: '命令记录',
        func: this.handleContextClickOpenHistory
      }, {
        text: '模块记录',
        func: this.handleContextClickOpenModuleHistory
      }],
      cmHostList: [{
        text: '删除主机',
        func: this.handleContextClickDelHost
      }]
    }
  },
  computed: {
    ...mapGetters([
      'session_events'
    ])
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleContextClickDelHost() {
      del_host(this.curContextRow.id).then(response => {
        if (response === 204) {
          this.$notify({
            title: '信息',
            message: `删除主机成功`,
            type: 'success',
            position: 'bottom-right'
          })
        }
        this.fetchData()
      })
    },
    handleContextClickOpenHistory() {
      this.$emit('onOpenSessionTerm', this.curContextRow)
    },
    handleContextClickOpenModuleHistory() {
      this.$emit('onOpenSessionHistory', this.curContextRow)
    },
    async expandChange(row, expandedRows) {
      if (expandedRows.includes(row)) {
        await getSessionByHostId({ sid: row.id }).then(response => {
          this.hostsData.forEach((temp, index) => {
            // 找到当前点击的行，把动态获取到的数据赋值进去
            if (temp.id === row.id) {
              this.hostsData[index].sessionx = response.data
            }
          })
        })
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 下拉菜单操作
    handleClickOperation(scope, command) {
      this.curContextRow = scope.row
      switch (command) {
        case 'genStagers':
          this.generateStagers(this.curContextRow)
          break
        default:
          break
      }
    },
    tableCellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'state' && row.state === 'alive') {
        return 'status_online'
      } if (column.property === 'state' && row.state === 'down') {
        return 'status_offline'
      } if (column.property === 'state' && row.state === 'unknown') {
        return 'status_unknown'
      }
    },
    // 表格某一行右键点击
    handleRightClickRow(row, column, event) {
      this.curContextRow = row
      this.curContextColumn = column
      this.curContextEvent = event
      this.$easycm(event, this.$root, 'host_session_list')
    },
    // 表格某一行右键点击
    handleHostRightClickRow(row, column, event) {
      this.curContextRow = row
      this.curContextColumn = column
      this.curContextEvent = event
      this.$easycm(event, this.$root, 'host_list')
    },
    handleClipboardSuccess() {
      this.$message({
        message: '拷贝文件内容成功',
        type: 'success',
        duration: 1500
      })
    },
    async fetchData() {
      this.listLoading = true
      this.hostsData = []
      await get_host({ 'ordering': '-id' }).then(response => {
        response.data.results.map(item => {
          item.sessionx = []
        })
        this.hostsData = response.data.results
        this.listLoading = false
      })
    }
  }

}
</script>

<style lang="scss" scoped>
  .demo-table-expand {
    font-size: 0;
  }
  .item-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .loot_input >>> .el-textarea__inner{
    font-family: Consolas, "Source Code Pro", Menlo, monospace;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: 0.5rem;
    flex-direction: column;
    word-break: break-all;
    line-height:1.25;
    flex: 1;
  }
  .msf-host-list {
    height: calc((100vh - 84px) * 0.5 - 24px - 41px - 24px);
  }
  ::v-deep.el-table--mini td, ::v-deep.el-table--mini th {
    padding: 0px 0;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }
  ::v-deep .status_online .cell {
  vertical-align: center;
  padding: 0.2em 0.6em 0.3em;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}
::v-deep .status_offline .cell {
  vertical-align: center;
  padding: 0.2em 0.6em 0.3em;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}
::v-deep .status_unknown .cell {
  vertical-align: center;
  padding: 0.2em 0.6em 0.3em;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}
</style>
