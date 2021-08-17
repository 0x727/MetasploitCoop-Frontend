<template>
  <div class="msf-session-filemanage">
    <el-row type="flex" class="row-bg" style="height:8%" justify="space-between">
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="根目录" placement="bottom">
          <el-button icon="el-icon-s-platform" plain size="mini" @click="handleClickOpenRootDir" />
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="默认目录" placement="bottom">
          <el-button icon="el-icon-s-home" plain size="mini" @click="handleClickOpenDefaultDir" />
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="返回上一级" placement="bottom">
          <el-button icon="el-icon-top" plain size="mini" @click="handleClickBackDir" />
        </el-tooltip>
      </el-col>
      <el-col :span="10">
        <el-input v-model="pwd" placeholder="请输入内容" class="input-with-select" size="mini" @keyup.enter.native="handleClickEnterDir">
          <el-button slot="append" icon="el-icon-right" size="mini" @click="handleClickEnterDir" />
        </el-input>
      </el-col>
      <el-col :span="7">
        <el-input v-model="search_keyword" placeholder="请输入关键词" class="input-with-select" size="mini" @keyup.enter.native="handleClickSearchKeyword">
          <el-button slot="append" icon="el-icon-search" size="mini" @click="handleClickSearchKeyword" />
        </el-input>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="复制当前路径" placement="bottom">
          <el-button ref="clip_text_bt" icon="el-icon-document-copy" plain size="mini" @click="handleContextCopyFilePath(clip_text,$event)" />
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="刷新" placement="bottom">
          <el-button icon="el-icon-refresh" plain size="mini" @click="handleClickRefreshDir" />
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="新建文件夹" placement="bottom">
          <el-popover
            v-model="isVisMkdirPop"
            placement="top"
            width="160"
          >
            <el-input v-model="mkdirName" placeholder="请输入文件夹名" size="mini" />
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="isVisMkdirPop = false">取消</el-button>
              <el-button type="text" size="mini" @click="handleClickMkDir">确定</el-button>
            </div>
            <el-button slot="reference" icon="el-icon-folder-add" plain size="mini" />
          </el-popover>
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="上传文件" placement="bottom">
          <el-button icon="el-icon-upload2" plain size="mini" @click="handleClickUploadFile" />
        </el-tooltip>
      </el-col>
    </el-row>
    <el-row style="height:92%">
      <el-table
        v-loading="listLoading"
        v-el-table-infinite-scroll="load"
        :data="fileData"
        height="100%"
        infinite-scroll-delay="200"
        element-loading-text="加载中..."
        fit
        highlight-current-row
        size="mini"
        @row-dblclick="handleDbclickFile"
        @row-contextmenu="handleRightClickRow"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="25"
        />
        <el-table-column label="名称" width="">
          <template slot-scope="scope">
            <div class="item-ellipsis">
              <svg-icon style="font-size: 16px; stroke: black;" :icon-class="fileTypeIconMap[scope.row.ftype] " />{{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="权限" width="100">
          <template slot-scope="scope">
            {{ scope.row.mode | filemodFilter }}
          </template>
        </el-table-column>
        <el-table-column label="修改日期" width="150">
          <template slot-scope="scope">
            {{ scope.row.mtime | timesFilter }}
          </template>
        </el-table-column>
        <el-table-column label="访问时间" width="150">
          <template slot-scope="scope">
            {{ scope.row.atime | timesFilter }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150">
          <template slot-scope="scope">
            {{ scope.row.ctime | timesFilter }}
          </template>
        </el-table-column>
        <el-table-column label="大小" width="100">
          <template slot-scope="scope">
            {{ scope.row.size | transitFileSizeFilter }}
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-dialog
      :title="curFilePath"
      :visible="filecontentDialogVisible"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      width="80vw"
      top="5vh"
      @close="filecontentDialogVisible = false"
    >
      <el-input
        v-model="filecontent"
        style="white-space: pre-line"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 25}"
        placeholder="请输入内容"
      />
      <span slot="footer" class="dialog-footer">
        <el-button v-clipboard:copy="filecontent" v-clipboard:success="handleClipboardSuccess">拷贝</el-button>
        <el-button type="warning" @click="handleSaveEditFile">保存</el-button>
        <el-button type="primary" @click="filecontentDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="fileuploadDialogVisible"
      width="80vw"
    >
      <MsfCoreFileTransit ref="Xfile" :is-return-file-path="true" @handlerReturnFilePath="handleClickUploadTransitFileToTarget" />
    </el-dialog>
    <easy-cm
      :list="cmList"
      tag="session_file_manage"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
    />
  </div>
</template>

<script>
import { dirList, catFile } from '@/api/session'
import clipboard from '@/directive/clipboard/index.js'
import MsfCoreFileTransit from '@/views/zFileTransit'
import Menu from './mixins/Menu'
import Handle from './mixins/Handle'
import Filters from './mixins/Filters'
export default {
  name: 'MsfSessionFilemanage',
  components: {
    MsfCoreFileTransit
  },
  directives: {
    clipboard
  },
  mixins: [Menu, Handle, Filters],
  props: {
    session: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      file_sources: [],
      search_keyword: '',
      pageSize: 10,
      currentPage: 1,
      fileList: [],
      fileData: [],
      transitFileList: [],
      transitListLoading: true,
      pwd: '',
      curFilePath: '',
      clip_text: '',
      listLoading: true,
      filecontent: '',
      filecontentDialogVisible: false,
      fileuploadDialogVisible: false,
      isVisMkdirPop: false,
      mkdirName: '',
      curContextRow: null,
      curContextColumn: null,
      curContextEvent: null,
      multipleSelectionFiles: []
    }
  },
  created() {
    this.initdata()
  },
  methods: {
    load() {
      const temp_index = this.fileList.length - this.fileData.length
      if (temp_index >= 10) {
        const file_array = this.fileList.slice(this.fileData.length, this.fileData.length + 9)
        this.fileData = this.fileData.concat(file_array)
      } else {
        const file_array = this.fileList.slice(this.fileData.length, this.fileData.length + temp_index)
        this.fileData = this.fileData.concat(file_array)
      }
    },
    // 处理多选
    handleSelectionChange(val) {
      this.multipleSelectionFiles = val
    },
    initdata() {
      // 第一次列目录请求
      this.getPwdDir()
    },
    async getPwdDir() {
      this.listLoading = true
      const data = {
        sid: this.session.id
      }
      await dirList(data).then(response => {
        this.pwd = response.data.pwd
        this.fileList = response.data.dirs
        this.file_sources = response.data.dirs
        this.fileData = this.fileList.slice(0, 19)
        this.listLoading = false
      })
    },
    async getLsDir(dirpath) {
      this.listLoading = true
      const data = {
        sid: this.session.id,
        command: 'ls',
        dirpath: dirpath
      }
      await dirList(data).then(response => {
        this.pwd = response.data.pwd
        this.fileList = response.data.dirs
        this.file_sources = response.data.dirs
        this.fileData = this.fileList.slice(0, 19)
        this.listLoading = false
      })
    },
    // 获取文件内容
    async getFileContent(filepath) {
      this.curFilePath = filepath
      const data = {
        sid: this.session.id,
        filepath: this.curFilePath
      }
      await catFile(data).then(response => {
        this.filecontentDialogVisible = true
        this.filecontent = response.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./mixins/css";
</style>
