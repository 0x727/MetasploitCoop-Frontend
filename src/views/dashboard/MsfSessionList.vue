<template>
  <div class="msf-session-list">
    <!-- session表 -->
    <el-table
      ref="table"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      :fit="true"
      border
      height="100%"
      highlight-current-row
      size="mini"
      @row-contextmenu="handleRightClickRow"
      @expand-change="expand_change"
    >
      <!-- row, column, event -->
      <!-- 展开子表 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item
              v-for="(expand_item,i) in expand_table_columns"
              :key="i"
              :label="expand_item.name"
              :prop="expand_item.label"
            >
              <span>{{ scope.row[expand_item.label] }}</span>
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
          <div v-if="item.label!=='platform'">
            <span
              slot="reference"
              class="item-ellipsis"
            >{{ scope.row[item.label]|parse_dict(item.label) }}</span>
          </div>
          <div v-else>
            <svg-icon :icon-class="scope.row[item.label]" />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180"
      >
        <template slot-scope="scope">
          <el-tooltip :enterable="false" content="心跳" placement="bottom">
            <el-tag type="success">{{ `${scope.row.checkin}` }}</el-tag>
          </el-tooltip>
          <el-tooltip :enterable="false" content="执行模块" placement="left">
            <el-button
              size="mini"
              icon="el-icon-box"
              @click.native="executePostModule(scope.row)"
            />
          </el-tooltip>
          <el-tooltip :enterable="false" content="停止会话" placement="top-start">
            <el-popconfirm
              title="操作不可逆，确认停止会话？"
              @onConfirm="handleStopSessionClick(scope.row)"
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
      tag="session_list"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
      @extend="handleContextClickFunction"
    />
    <PostStep
      v-if="visiblePost"
      :id="Number(curContextRow.id)"
      :platform="curContextRow.platform"
      :module="module_path"
      :autorun="is_autorun"
      :cm_module_options="cm_module_options"
      @cancel="visiblePost = false"
    />
    <ImgPreview
      :show="imgShow"
      :keyboard="true"
      :url="imgFilePath"
      @close="imgShow=false"
    />
  </div>
</template>

<script>
import { session_list, stopMsfSession } from '@/api/session'
import PostStep from '@/components/web/Module/PostStep'
import ImgPreview from '@/components/Tools/ImgPreview'
import { tree_context_menu } from '@/api/kb'
import { cloneDeep } from 'lodash'
import store from '@/store'
import Menu from './mixins/Menu'
import Tables from './mixins/Tables'
import Events from './mixins/Events'
// 打开窗口，输入命令，执行模块
export default {
  name: 'MsfSessionList',
  components: {
    PostStep,
    ImgPreview
  },
  filters: {
    parse_dict(value, args) {
      const host_status = { 'alive': '在线', 'down': '离线', 'unknown': '未知' }
      switch (args) {
        case 'state':
          return host_status[value]
        case 'info':
          if (value && value.indexOf('@') !== -1) {
            if (value.split('@')[0] && value.split('@')[0].indexOf('\\') !== -1) {
              return value.split('@')[0].split('\\')[1]
            }
            return value.split('@')[0]
          }
          return value
        default:
          return value
      }
    }
  },
  mixins: [Menu, Tables, Events],
  data() {
    return {
      expandedRows: [],
      menu_loading: true,
      imgFilePath: '',
      imgShow: false,
      visiblePost: false,
      list: [],
      module_path: '',
      is_autorun: false,
      listLoading: true,
      workspaces: [],
      workspace: '',
      curContextRow: null,
      curContextColumn: null,
      curContextEvent: null,
      cmList: []
    }
  },
  created() {
    this.initdata()
  },
  mounted() {

  },
  methods: {
    expand_change(row, expandedRows) {
      this.expandedRows = expandedRows
    },
    initdata() {
      this.fetchData()
      // 深拷贝,加锁
      if (this.menu_loading) {
        this.menu_loading = false
        this.cmList = cloneDeep(this.cmListBak)
        this.add_context_menu()
        this.menu_loading = true
      }
    },
    async add_context_menu() {
      // 添加自定义菜单
      await tree_context_menu().then(response => {
        response.data.forEach(cm => {
          this.cmList.push(cm)
        })
      })
    },
    async fetchData() {
      this.listLoading = true
      await session_list().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    handleContextClickOpenRouter() {
      this.$emit('onOpenSessionProcess', this.curContextRow)
    },
    async handleStopSessionClick(row) {
      const sid = row.id
      await stopMsfSession(sid).then(response => {
        this.$notify({
          title: '成功',
          message: `停止会话成功`,
          type: 'success',
          duration: 1500
        })
        this.fetchData()
      })
    },
    // 表格某一行右键点击
    handleRightClickRow(row, column, event) {
      this.curContextRow = row
      this.curContextColumn = column
      this.curContextEvent = event
      this.$easycm(event, this.$root, 'session_list')
    },
    async handleContextClickFunction(addition) {
      const event = {
        event: addition,
        session: this.curContextRow,
        times: new Date().toISOString()
      }
      switch (addition.type) {
        case 'shell':
          await this.$emit('onOpenSessionTerm', this.curContextRow)
          break
        case 'post':
          this.$emit('onOpenSessionTerm', this.curContextRow)
          break
        default:
          break
      }
      // 往父组件发送打开命令终端
      // 加锁,激活终端后发送执行命令事件
      store.dispatch('console_events/change_events', event)
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
  .msf-session-list {
    height: calc((100vh - 84px) * 0.5 - 24px - 41px - 24px);
  }
</style>
