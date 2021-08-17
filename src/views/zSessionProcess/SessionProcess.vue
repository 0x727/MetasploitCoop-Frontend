<template>
  <div class="msf-session-process">
    <el-col :span="2" />
    <el-row :gutter="6">
      <div v-for="(items,index) in defaultColumn" :key="index" style="display:inline; margin-top: 86px; padding-left:20px">
        <el-checkbox v-model="column_items[items.label]" size="mini" label="1" @change="$nextTick(() => {$refs.table.doLayout()})">{{ items.name }}</el-checkbox>
      </div>
      <el-checkbox v-model="show_tree" size="mini" label="1">{{ show_tree?"隐藏树":"显示树" }}</el-checkbox>
    </el-row>
    <el-row>
      <!-- 进程树 -->
      <el-col :span="row_size" class="tree">
        <el-tree
          :data="procTree"
          node-key="procTree"
          class="proc-tree"
        >
          <span slot-scope="{ data }" class="proc-tree-node">
            <span>{{ data.pid }}: {{ data.name }}</span>
          </span>
        </el-tree>
      </el-col>
      <!-- 进程表格 -->
      <el-col :span="24-row_size" class="right">
        <el-table
          ref="table"
          v-loading="listLoading"
          :cell-class-name="tableCellClassName"
          :data="procList"
          element-loading-text="加载中..."
          fit
          stripe
          border
          highlight-current-row
          height="100%"
          size="mini"
          :default-sort="{prop: 'pid'}"
          @filter-change="filterChange"
          @row-contextmenu="handleRightClickRow"
        >
          <el-table-column
            type="selection"
            width="25"
          />
          <el-table-column prop="name" label="进程名" width="150" :sort-method="(a,b) =>{return a.name.localeCompare(b.name)}" sortable>
            <template slot-scope="scope">
              <div class="item-ellipsis">
                <el-popover
                  v-if="keyword_list[scope.row.name]"
                  placement="right"
                  visible-arrow="false"
                  trigger="hover"
                >
                  <div>
                    <el-tag>{{ keyword_list[scope.row.name].category }}</el-tag>
                    <el-tag type="info">{{ keyword_list[scope.row.name].description }}</el-tag>
                  </div>
                  <div
                    slot="reference"
                    v-text="scope.row.name"
                  />
                </el-popover>
                <div v-else>
                  <span
                    v-text="scope.row.name"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <template v-for="(item,index) in defaultColumn">
            <el-table-column
              v-if="column_items[item.label]"
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
                >{{ scope.row[item.label] }}</span>
              </template>
            </el-table-column>
          </template>

          <el-table-column
            prop="Highlight"
            label="高亮"
            sortable
            :sort-method="(a,b)=>{return Number(Object.prototype.hasOwnProperty.call(keyword_list,a.name)) - Number(Object.prototype.hasOwnProperty.call(keyword_list,b.name))}"
          >
            <template slot-scope="scope">
              <div class="item-ellipsis">
                <el-tag
                  v-if="Object.prototype.hasOwnProperty.call(keyword_list,scope.row.name) "
                  type="danger"
                ><i class="el-icon-star-on" /></el-tag>
                <el-tag v-else><i class="el-icon-star-off" /></el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <easy-cm
      :list="cmList"
      tag="session_process"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
    />
  </div>
</template>

<script>
import { processList, processKill, processStealToken, processRev2self, processMigrate } from '@/api/session'
import { genTree } from '@/utils/util'
import { kb_focus_keywords_all } from '@/api/kb'
export default {
  name: 'MsfSessionProcess',
  components: {
  },
  props: {
    session: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      listLoading: true,
      procList: [],
      procTree: [],
      show_tree: true,
      column_items: { pid: true, ppid: true, user: true, path: true, arch: true },
      curContextRow: null,
      curContextColumn: null,
      keyword_list: {},
      defaultColumn: [
        { label: 'pid', width: 75, name: 'PID' },
        { label: 'ppid', width: 85, name: 'PPID' },
        { label: 'user', width: 120, name: '用户' },
        { label: 'path', width: 0, name: '路径' },
        { label: 'arch', width: 85, name: '架构' }
      ],
      curContextEvent: null,
      procTreeProps: {
        label: (data, node) => {
          return `${data.pid}: ${data.name}`
        },
        children: 'children'
      },
      cmList: [{
        text: '刷新进程',
        func: this.getProcList
      }, {
        text: '注入/迁移',
        func: this.handleContextMigrateProc
      }, {
        text: '窃取Token',
        func: this.handleContextStealToken
      }, {
        text: '还原Token',
        func: this.handleContextRev2self
      }, {
        text: '结束进程',
        func: this.handleContextKillProc
      }]
    }
  },
  computed: {
    row_size() {
      return (this.show_tree ? 0 : 6)
    }
  },
  watch: {
    column_items(val) {

    }
  },
  created() {
    this.initdata()
  },
  methods: {
    filterChange(filters) {
    },
    sort_func(a, b) {
      return Number(Object.prototype.hasOwnProperty.call(this.keyword_list, a.name)) - Number(Object.prototype.hasOwnProperty.call(this.keyword_list, b.name))
    },
    tableCellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'name' && this.keyword_list[row.name]) {
        return 'av_warning'
      }
    },
    initdata() {
      this.getProcList()
    },
    sortString(a, b) {
      return a.localeCompare(b)
    },
    // 获取进程列表
    async getProcList() {
      const data = {
        sid: this.session.id
      }
      await kb_focus_keywords_all().then(response => {
        const keyword = response.data
        keyword.forEach(element => {
          this.keyword_list[element.word] = element
        })
      })
      await processList(data).then(response => {
        this.procList = response.data
        this.listLoading = false
        // 生成进程树
        this.procTree = genTree(this.procList, 'pid', 'ppid')
      })
    },
    // 表格某一行右键点击
    handleRightClickRow(row, column, event) {
      this.curContextRow = row
      this.curContextColumn = column
      this.curContextEvent = event
      this.$easycm(event, this.$root, 'session_process')
    },
    // 右键菜单点击注入/迁移进程
    async handleContextMigrateProc() {
      const data = {
        sid: this.session.id,
        pid: this.curContextRow.pid
      }
      await processMigrate(data).then(response => {
        this.$notify.info({
          title: '消息',
          message: response.data
        })
      })
      this.getProcList()
    },
    // 右键菜单点击窃取Token
    async handleContextStealToken() {
      const data = {
        sid: this.session.id,
        pid: this.curContextRow.pid
      }
      await processStealToken(data).then(response => {
        this.$notify.info({
          title: '消息',
          message: response.data
        })
      })
      this.getProcList()
    },
    // 右键菜单点击还原Token
    async handleContextRev2self() {
      const data = {
        sid: this.session.id
      }
      await processRev2self(data).then(response => {
        this.$notify.info({
          title: '消息',
          message: response.data
        })
      })
      this.getProcList()
    },
    // 右键菜单点击结束进程
    async handleContextKillProc() {
      const data = {
        sid: this.session.id,
        pid: this.curContextRow.pid
      }
      await processKill(data).then(response => {
        this.$notify.info({
          title: '消息',
          message: response.data
        })
      })
      this.getProcList()
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .av_warning .cell {
  vertical-align: top;
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
.msf-session-process {
  height: calc((100vh - 84px) * 0.5);
  .tree, .right {
    height: calc((100vh - 84px) * 0.5 + 24px - 19px);
  }
}
.item-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.proc-tree-node {
  font-size: 12px;
}
.proc-tree {
  height: 100%;
  overflow-y: auto;
}

</style>
