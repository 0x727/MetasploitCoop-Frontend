<template>
  <div class="msf-creds-list">
    <el-table
      v-loading="listLoading"
      v-el-table-infinite-scroll="load"
      :data="credsData"
      :sortable="true"
      size="mini"
      height="100%"
      fit
      element-loading-text="Loading"
      infinite-scroll-delay="200"
      highlight-current-row
      @row-contextmenu="handleRightClickRow"
    >
      <el-table-column
        v-if="credsData.length"
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
            {{ scope.row[item.label] }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <easy-cm
      :list="cmList"
      tag="creds_list"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
    />
  </div>
</template>

<script>
import { get_creds } from '@/api/dbmsf'
import { mapGetters } from 'vuex'

export default {
  name: 'MsfCredsList',
  components: {
  },

  data() {
    return {
      curContextRow: null,
      curContextColumn: null,
      curContextEvent: null,
      genStagersVisible: false,
      credsData: [],
      ids: [],
      cred_count: 0,
      columnFilterVisible: false,
      listLoading: true,
      multipleSelection: [],
      defaultColumn: [
        { label: 'host', width: 120, name: '主机' },
        { label: 'service', width: 120, name: '服务' },
        { label: 'public', width: 120, name: '用户名' },
        { label: 'private', width: 0, name: '凭证' },
        { label: 'jtr_format', width: 120, name: '格式' },
        { label: 'post_reference_name', width: 0, name: '凭证来源' }
      ],
      cmList: [
      //   {
      //   text: '添加凭证',
      //   icon: 'plus',
      //   func: this.handleContextClickOpenTerm,
      //   addition: []
      // }, {
      //   text: '修改凭证',
      //   icon: 'edit',
      //   func: this.executePostModule
      // }
      ]
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
            this.credsData = []
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
      if (this.credsData.length < this.cred_count) {
        this.fetchData(this.credsData.length / 10 + 1, 10)
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
      this.$easycm(event, this.$root, 'creds_list')
    },
    async fetchData(page = 1, size = 10) {
      this.listLoading = true
      if (page === 1 && size === 10) { this.credsData = [] }
      await get_creds({ size: size, page: page }).then(response => {
        this.credsData = this.credsData.concat(response.data.results)
        this.listLoading = false
        this.cred_count = response.data.count
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
  .msf-creds-list {
    height: calc((100vh - 84px) * 0.5 - 24px - 41px - 24px);
  }
</style>
