<template>
  <div>
    <el-row
      :gutter="20"
      class="operate-container"
      type="flex"
    >
      <el-col :span="2">
        <el-button
          type="primary"
          icon="el-icon-plus"
          plain
          title="添加右键菜单"
          size="mini"
          @click="createVisible=true"
        />
      </el-col>
    </el-row>

    <el-table
      v-loading="listLoading"
      :data="contextMenuData"
      :sortable="true"
      size="mini"
      height="75vh"
      fit
      element-loading-text="Loading"
      highlight-current-row
      @row-contextmenu="handleRightClickRow"
    >
      <el-table-column
        v-if="contextMenuData.length"
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
    <el-pagination
      :page-sizes="[15,20,30,50,100,200]"
      background
      :total="contextMenu_count"
      :current-page="currentPage"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <easy-cm
      :list="cmList"
      tag="contextMenu_list"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
    />
    <ContextMenuCreateFormView v-if="createVisible" @cancel="createVisible=false" @refresh="refresh" />
    <ContextMenuModifyFormView
      v-if="modifyVisible"
      :rows="curContextRow"
      @success="handleSuccess"
      @cancel="modifyVisible=false"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { del_context_menu, kb_context_menu } from '@/api/kb'
import { mapGetters } from 'vuex'
import ContextMenuCreateFormView from './createView'
import ContextMenuModifyFormView from './modifyView'
import store from '@/store'

export default {
  name: 'ContextMenuList',
  components: {
    ContextMenuCreateFormView,
    ContextMenuModifyFormView
  },

  data() {
    return {
      currentPage: 1,
      pageSize: 15,
      curContextRow: null,
      curContextColumn: null,
      curContextEvent: null,
      contextMenuData: [],
      createVisible: false,
      modifyVisible: false,
      contextMenu_count: 0,
      columnFilterVisible: false,
      listLoading: true,
      multipleSelection: [],
      defaultColumn: [
        { label: 'text', width: 120, name: '名称' },
        { label: 'type', width: 75, name: '类型' },
        { label: 'addition', width: 0, name: '参数' }

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

  },

  created() {
    this.fetchData()
  },
  methods: {
    refresh() {
      this.fetchData()
      const event = {
        event: 'contextmenu',
        times: new Date().toISOString(),
        id: 0
      }
      store.dispatch('toolbar_events/change_events', event)
    },
    async deleteRow(row) {
      await del_context_menu(row).then(response => {
        if (response) {
          this.$notify({
            title: '删除关键词成功',
            message: '关键词的ID：' + response.data.id,
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
      this.modifyVisible = true
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
      this.$easycm(event, this.$root, 'contextMenu_list')
    },
    async fetchData(page = 1, size = 15) {
      this.listLoading = true
      // this.contextMenuData = []
      await kb_context_menu({ size: size, page: page }).then(response => {
        this.contextMenuData = response.data.results
        this.listLoading = false
        this.contextMenu_count = response.data.count
      })
      this.count = this.contextMenuData.length
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
