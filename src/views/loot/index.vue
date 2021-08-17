<template>
  <div class="msf-loot-list">
    <el-table
      v-loading="listLoading"
      v-el-table-infinite-scroll="load"
      :data="lootData"
      height="100%"
      :sortable="true"
      infinite-scroll-delay="200"
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
          <el-popover
            v-if="item.label === 'data'"
            placement="bottom-start"
            visible-arrow="true"
            trigger="click"
            width="800"
          >
            <div>
              <el-input
                v-model="scope.row[item.label]"
                type="textarea"
                resize="both"
                class="loot_input"
                style="margin-left:10px"
                :autosize="{ minRows: 2, maxRows: 25}"
                placeholder="请输入内容"
              />
              <span slot="footer">
                <el-button
                  v-clipboard:copy="scope.row[item.label]"
                  v-clipboard:success="handleClipboardSuccess"
                >复制</el-button>
              </span>
            </div>
            <div
              slot="reference"
              class="item-ellipsis"
              v-text="scope.row[item.label]"
            />
          </el-popover>
          <div v-else class="item-ellipsis">
            {{ scope.row[item.label]|parse_dict }}
          </div>

        </template>
      </el-table-column>
      <!-- //操作栏 -->
      <el-table-column
        v-if="lootData.length"
        fixed="right"
        label="操作"
        width="60"
      />
    </el-table>
    <easy-cm
      :list="cmList"
      tag="loot_list"
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
import { get_loot, del_loot } from '@/api/dbmsf'
import clipboard from '@/directive/clipboard/index.js'

export default {
  name: 'MsfLootList',
  components: {
  },
  directives: {
    clipboard
  },
  filters: {
    parse_dict(value) {
      if (value && value['address']) {
        return value['address']
      }
      return value
    }
  },
  data() {
    return {
      curContextRow: null,
      curContextColumn: null,
      lootDialogVisible: false,
      curContextEvent: null,
      genStagersVisible: false,
      lootData: [],
      base_info: [],
      other_info: [],
      loot_count: 0,
      ids: [],
      columnFilterVisible: false,
      listLoading: true,
      allColumn: [],
      multipleSelection: [],
      defaultColumn: [
        { label: 'id', width: 65, name: 'id' },
        { label: 'host', width: 120, name: '主机' },
        { label: 'data', width: 0, name: '数据' },
        { label: 'name', width: 0, name: '文件名' },
        { label: 'info', width: 220, name: '信息' },
        { label: 'content_type', width: 120, name: '格式' }
      ],
      cmList: [{
        text: '删除数据',
        icon: 'times',
        func: this.handleContextClickDel,
        addition: []
      }]
    }
  },
  computed: {
    ...mapGetters([
      'session_events'
    ])
  },
  watch: {
    session_events() {
      switch (this.session_events.action) {
        case 'on_session_open':case 'on_session_close':
          if (!this.listLoading) {
            this.lootData = []
            this.fetchData()
          }
          break
        case 'on_session_heartbeat':
          break
        default:
          break
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    load() {
      if (this.lootData.length < this.loot_count) {
        this.fetchData(this.lootData.length / 10 + 1, 10)
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
    // 表格某一行右键点击
    handleRightClickRow(row, column, event) {
      this.curContextRow = row
      this.curContextColumn = column
      this.curContextEvent = event
      this.$easycm(event, this.$root, 'loot_list')
    },
    handleClipboardSuccess() {
      this.$message({
        message: '拷贝文件内容成功',
        type: 'success',
        duration: 1500
      })
    },
    async handleContextClickDel() {
      await del_loot(this.curContextRow)
      this.fetchData()
    },
    async fetchData(page = 1, size = 10) {
      this.listLoading = true
      if (page === 1 && size === 10) { this.lootData = [] }
      await get_loot({ size: size, page: page, 'ordering': '-id' }).then(response => {
        this.lootData = this.lootData.concat(response.data.results)
        this.loot_count = response.data.count
        this.listLoading = false
      })
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
  .msf-loot-list {
    height: calc((100vh - 84px) * 0.5 - 24px - 41px - 24px);
  }
</style>
