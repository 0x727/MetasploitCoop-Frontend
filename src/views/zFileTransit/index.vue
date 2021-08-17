<template>
  <div class="msf-core-filetransit">
    <el-row type="flex" class="row-bg" style="height:8%" justify="space-between">
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="根目录" placement="bottom">
          <el-button icon="el-icon-s-platform" plain size="mini" @click="handleClickOpenRootDir" />
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="当前目录" placement="bottom">
          <el-button icon="el-icon-s-home" plain size="mini" @click="handleClickOpenScreenshotDir" />
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="返回上一级" placement="bottom">
          <el-button icon="el-icon-top" plain size="mini" @click="handleClickBackDir" />
        </el-tooltip>
      </el-col>
      <el-col :span="18">
        <el-input v-model="pwd" placeholder="请输入路径" class="input-with-select" size="mini">
          <el-button slot="append" icon="el-icon-right" size="mini" @click="handleClickEnterDir" />
        </el-input>
      </el-col>
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="刷新" placement="bottom">
          <el-button icon="el-icon-refresh" plain size="mini" @click="handleClickRefreshDir" />
        </el-tooltip>
      </el-col>
      <el-col :span="1" />
      <el-col :span="1">
        <el-tooltip class="item" effect="dark" content="上传文件" placement="bottom">
          <el-upload
            class="upload-container"
            action=""
            :http-request="lootFileUpload"
            :show-file-list="false"
            :auto-upload="true"
          >
            <div class="el-upload__text"><i class="el-icon-upload2" /></div>
          </el-upload>
        </el-tooltip>
      </el-col>
    </el-row>
    <el-row style="height:92%">
      <el-table
        v-loading="listLoading"
        :data="fileList"
        height="100%"
        element-loading-text="加载中..."
        fit
        :sortable="true"
        highlight-current-row
        size="mini"
        @row-dblclick="handleDbclickFile"
        @row-contextmenu="handleRightClickRow"
      >
        <el-table-column
          v-if="!isReturnFilePath"
          type="selection"
          width="25"
        />
        <el-table-column
          sortable
          label="名称"
        >
          <template slot-scope="scope">
            <div class="item-ellipsis">
              <svg-icon style="font-size: 16px;" :icon-class="scope.row.ftype|fileTypeFilter" />{{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column sortable label="创建时间" width="175">
          <template slot-scope="scope">
            {{ scope.row.ctime|timestampFilter }}
          </template>
        </el-table-column>
        <el-table-column sortable label="大小" width="100">
          <template slot-scope="scope">
            {{ scope.row.size|fileSizeFilter }}
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="80"
        >   <template slot-scope="scope">
          <el-button
            v-if="!isReturnFilePath"
            title="一句话下载"
            size="mini"
            icon="el-icon-download"
            @click.native="visibleDownloadDialog(scope.row)"
          />
          <el-button
            v-if="isReturnFilePath"
            title="选择当前文件"
            size="mini"
            icon="el-icon-check"
            :loading="isButtonLoding"
            @click.native="returnFilePath(scope.row)"
          />
        </template>
        </el-table-column>
      </el-table>
    </el-row>

    <easy-cm
      :list="cmList"
      tag="core_file_transit"
      :arrow="true"
      :border="true"
      :item-width="120"
      :item-height="28"
      :item-size="14"
    />
    <el-dialog
      :title="pwd"
      :visible.sync="filecontentDialogVisible"
      width="80vw"
      append-to-body
    >
      <el-input
        v-model="filecontent"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 25}"
        placeholder="请输入内容"
      />
      <span slot="footer" class="dialog-footer">
        <el-button v-clipboard:copy="filecontent" v-clipboard:success="handleClipboardSuccess">拷贝</el-button>
        <el-button type="primary" @click="filecontentDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <Download v-if="visibleDownload" :filename="pwd + '/' + current.row.name" @cancel="visibleDownload = false" />
    <ImgPreview :show="imgShow" :multiple="true" :img-list="imgList" :now-img-index="imgIndex" :keyboard="true" @close="imgShow=false" />
  </div>
</template>
<script>
import { fileSizeFormat, timestampFormat } from '@/utils/util'
import clipboard from '@/directive/clipboard/index.js'
import ImgPreview from '@/components/Tools/ImgPreview'
import Download from '@/components/Tools/Download'
import Handle from './mixins/Handle'
import Menu from './mixins/Menu'
export default {
  name: 'MsfCoreFileTransit',
  components: {
    ImgPreview,
    Download
  },
  directives: {
    clipboard
  },
  filters: {
    fileTypeFilter(filetype) {
      const fileTypeIconMap = {
        directory: 'folder',
        file: 'file',
        fixed: 'disk',
        fifo: 'file',
        characterSpecial: 'file',
        blockSpecial: 'file',
        link: 'file',
        socket: 'file',
        removable: 'disk'
      }
      return fileTypeIconMap[filetype]
    },
    fileSizeFilter(filesize) {
      return fileSizeFormat(filesize)
    },
    timestampFilter(timestamp) {
      return timestampFormat(timestamp)
    }
  },
  mixins: [Handle, Menu],
  props: {
    isReturnFilePath: {
      type: Boolean
    }
  },
  data() {
    return {
      pwd: '',
      imgList: [],
      imgIndex: 0,
      filecontentDialogVisible: false,
      filecontent: '',
      listLoading: false,
      fileList: [],
      imgShow: false,
      isButtonLoding: false,
      visibleDownload: false,
      current: {
        row: null,
        column: null,
        event: null
      }
    }
  },
  created() {
    this.initdata()
  },
  mounted() {
  },
  methods: {
    initdata() {
      this.getTransitFileList()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./mixins/css";
</style>
