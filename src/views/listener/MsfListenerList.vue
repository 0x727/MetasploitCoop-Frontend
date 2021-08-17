<template>
  <div class="msf-listener-list">
    <el-table
      ref="table"
      v-loading="listLoading"
      :data="listenerData"
      height="100%"
      :sortable="true"
      size="mini"
      fit
      element-loading-text="Loading"
      highlight-current-row
      @row-contextmenu="handleRightClickRow"
    >
      <el-table-column type="expand">
        <!-- // 子表 -->
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item
              v-for="(item,i) in other_info[scope.row.id]"
              :key="i"
              :label="i"
            >
              <span>{{ item }}</span>
            </el-form-item>
          </el-form>
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
            class="item-ellipsis"
            v-text="scope.row[item.label]"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="80"
      >
        <template slot-scope="scope">
          <el-popconfirm
            title="操作不可逆，确认停止任务？"
            @onConfirm="deleteRow(scope.row)"
          >
            <el-button
              slot="reference"
              type="text"
              size="small"
            >
              <span
                class="item-ellipsis"
              >停止任务</span>
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 生成木马表单 -->
    <GenStagersFormView
      v-if="genStagersVisible"
      ref="GenStagers"
      :row="curContextRow"
      @success="handleGenSuccess"
      @cancel="genStagersVisible = false"
    />
    <easy-cm
      :list="cmList"
      tag="listener_list"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
    />
    <el-dialog
      v-if="taskProgressVisible"
      :title="'查看任务进度:' + curContextRow.name"
      class="dialog"
      :visible="true"
      width="80vw"
      top="5vh"
      :lock-scroll="true"
      @close="taskProgressVisible = false"
    >
      <MsfTaskProgress :row="curContextRow" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="taskProgressVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { job_list, job_stop } from '@/api/job'
import { set } from 'lodash'
import GenStagersFormView from '@/views/listener/Stagers'
import MsfTaskProgress from '@/views/zTaskProgress'
import Tables from './mixins/Tables'
import Menu from './mixins/Menu'
import Events from './mixins/Events'
export default {
  name: 'MsfListenerList',
  components: {
    MsfTaskProgress,
    GenStagersFormView

  },
  mixins: [Tables, Menu, Events],

  data() {
    return {
      curContextRow: null,
      curContextColumn: null,
      curContextEvent: null,
      genStagersVisible: false,
      listenerData: [],
      base_info: [],
      other_info: [],
      ids: [],
      columnFilterVisible: false,
      taskProgressVisible: false,
      listLoading: true,
      allColumn: [],
      multipleSelection: []

    }
  },
  computed: {
    ...mapGetters([
      'session_events'
    ])
  },
  watch: {
    listenerData() {
      this.repaint()
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    repaint() {
      this.$nextTick(() => {
        this.$refs.table.doLayout()
      })
    },
    handleContextClickTaskProgress() {
      this.taskProgressVisible = true
    },
    convertJson2List(data) {
      var datalist = []
      for (var k in data) {
        datalist.push({
          k: k,
          v: data[k]
        })
      }
      return datalist
    },
    handleContextClickStagers(row) {
      if (this.curContextRow.name === 'Exploit: multi/handler') {
        this.genStagersVisible = true
      } else {
        this.$notify({
          title: '提示信息',
          message: '该任务无法生成木马',
          type: 'info',
          position: 'bottom-right'
        })
      }
    },
    async handleCreateSuccess() {
      this.createVisible = false
      this.fetchData()
    },
    async handleGenSuccess() {
      this.genStagersVisible = false
      this.fetchData()
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
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 表格某一行右键点击
    handleRightClickRow(row, column, event) {
      this.curContextRow = row
      this.curContextColumn = column
      this.curContextEvent = event
      this.$easycm(event, this.$root, 'listener_list')
    },
    async deleteRow(row) {
      await job_stop(row.jid).then(response => {
        this.$notify({
          title: response.message,
          message: '任务ID:' + row.jid + '删除成功',
          type: 'success',
          position: 'bottom-right'
        })
      })
      setTimeout(() => {
        this.fetchData()
      }, 1000)
    },
    async fetchData() {
      this.listLoading = true
      this.listenerData = []
      await job_list().then(response => {
        var temp_arr = []
        if (response.status !== 500) {
          Object.keys(response.data).forEach(id => {
            var job_data = {}
            temp_arr.push({ 'id': id, 'jid': response.data[id]['jid'], 'name': response.data[id]['name'],
              'payload': response.data[id].datastore['PAYLOAD'] || response.data[id].datastore['Payload'], 'lhost': response.data[id].datastore['LHOST'],
              'lport': response.data[id].datastore['LPORT'], 'uuid': response.data[id]['uuid'] })
            Object.keys(response.data[id]['datastore']).forEach(key => {
              if (Object.prototype.toString.call(response.data[id]['datastore'][key]) === '[object Object]') {
                job_data = Object.assign({}, job_data, response.data[id]['datastore'][key])
              } else {
                job_data[key] = response.data[id]['datastore'][key]
              }
            })
            Object.keys(job_data).forEach(item => {
              if ((item.toUpperCase() === item) && job_data[item]) {
                set(this.base_info, [id] + '.' + [item], job_data[item])
              } else {
                set(this.other_info, [id] + '.' + [item], job_data[item])
              }
            })
          })
          this.listenerData = temp_arr
        }
        this.listLoading = false
      })
      this.count = this.listenerData.length
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
  .msf-listener-list {
    height: calc((100vh - 84px) * 0.5 - 24px - 41px - 24px);
  }
</style>
