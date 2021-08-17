import { mkdir, delFile, editFile, downloadFile, executeApplication } from '@/api/session'
import { getMsfCoreLoots } from '@/api/info'
import { uploadFileToTarget } from '@/api/session'
import { showMsg } from '@/utils/util'

export default {
  methods: {
    // 打开根目录
    handleClickOpenRootDir() {
      this.getLsDir('/')
    },
    // 打开默认目录
    handleClickOpenDefaultDir() {
      this.getPwdDir()
    },
    // 返回上一级
    handleClickBackDir() {
      if (this.pwd.endsWith(':/') || this.pwd.endsWith(':')) {
        this.pwd = '/'
      } else {
        this.pwd = this.pwd.split('/').slice(0, -1).join('/') || this.pwd.split('\\').slice(0, -1).join('\\')
      }
      this.getLsDir(this.pwd)
    },
    // 搜索文件
    handleClickSearchKeyword() {
      let xreg = new RegExp('', 'i')
      try {
        xreg = new RegExp(this.search_keyword, 'i')
      } catch (e) {
        this.$notify.error({
          title: '错误',
          dangerouslyUseHTMLString: true,
          message: '<strong>正则搜索请在特殊字符添加 <i style="color:red">/</i> 转义</strong>',
          position: 'bottom-right'
        })
        return false
      }
      this.fileList = this.file_sources.filter(filename => {
        return filename.name.match(xreg)
      })
      this.fileData = this.fileList.slice(0, 19)
    },
    // 进入目录
    handleClickEnterDir() {
      this.pwd = this.pwd.replace('\\', '/').replace('//', '/')
      this.getLsDir(this.pwd)
    },
    // 刷新当前目录
    handleClickRefreshDir() {
      this.getLsDir(this.pwd)
    },
    // 创建文件夹
    async handleClickMkDir() {
      const data = {
        sid: this.session.id,
        dirpath: `"${this.pwd}\\${this.mkdirName}"`
      }
      await mkdir(data).then(response => {
        this.handleClickRefreshDir()
      })
      this.isVisMkdirPop = false
    },
    // 双击文件
    handleDbclickFile(row, column, event) {
      switch (row.ftype) {
        case 'remote':
        case 'cdrom':
        case 'fixed':
          this.pwd = row.name
          this.getLsDir(this.pwd)
          break
        case 'directory':
          if (row.name === '..') {
            this.handleClickBackDir()
            break
          } if (row.name === '.') {
            break
          }
          this.pwd = this.pwd + '/' + row.name
          this.getLsDir(this.pwd)
          break
          // bug
        case 'file':
          if (parseInt(row.size) > 10240) {
            this.$message({
              message: '文件过大，不支持查看',
              type: 'warning',
              offset: event.y - 30
            })
            break
          }
          this.getFileContent(`${this.pwd}\\${row.name}`)
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
      this.$easycm(event, this.$root, 'session_file_manage')
    },
    // 模拟点按钮
    handleMockClick() {
      this.clip_text = `${this.pwd}\\${this.curContextRow.name}`
      this.$refs.clip_text_bt.$el.click()
    },
    // 点击下载到本地
    async handleDownloadClick() {
      const path = `${this.pwd}\\${this.curContextRow.name}`
      await downloadFile(this.session.id, path).then(response => {
        if (response.data) {
          showMsg(this, `正在下载文件到：${response.data}`)
        }
      })
    },
    // 点击执行程序
    async handleExecClick() {
      const path = `${this.pwd}\\${this.curContextRow.name}`
      await this.$prompt('提示：隐藏窗口运行在参数最后加 -H', '请输入运行参数', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        executeApplication(this.session.id, path, value).then(response => {
          if (response.data) {
            showMsg(this, `已执行：${response.data}`)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消运行'
        })
      })
    },
    // 右键菜单点击批量删除文件
    async handleContextClickDelFile() {
      let data = { }
      if (this.multipleSelectionFiles.length === 0) {
        let isDir = false
        if (this.curContextRow.ftype !== 'directory' && this.curContextRow.ftype !== 'file') {
          return
        }
        if (this.curContextRow.ftype === 'directory') {
          isDir = true
        }
        data = {
          sid: this.session.id,
          paths: [{ filepath: this.pwd + '/' + this.curContextRow.name, isDir: isDir }]
        }
      } else {
        const filepath_list = []
        for (let i = 0; i < this.multipleSelectionFiles.length; i++) {
          if (this.curContextRow.ftype === 'file') {
            filepath_list.push({ filepath: this.pwd + '/' + this.multipleSelectionFiles[i].name, isDir: false })
          }
          if (this.curContextRow.ftype === 'directory') {
            filepath_list.push({ filepath: this.pwd + '/' + this.multipleSelectionFiles[i].name, isDir: true })
          }
        }
        data = {
          sid: this.session.id,
          paths: filepath_list
        }
      }

      await delFile(data).then(response => {
        this.$message({
          message: response.data,
          type: 'info',
          duration: 1500
        })
        this.handleClickRefreshDir()
      })
    },
    handleClipboardSuccess() {
      this.$message({
        message: '拷贝文件内容成功',
        type: 'success',
        duration: 1500
      })
      this.clip_text = ''
    },
    // 编辑文件保存
    async handleSaveEditFile() {
      if (this.filecontent.indexOf('\r\n') === -1) {
        this.filecontent = this.filecontent.replace(/\n/g, '\r\n')
      }
      const data = {
        sid: this.session.id,
        filepath: this.curFilePath,
        filetext: this.filecontent
      }
      await editFile(data).then(response => {
        this.$message({
          message: '修改文件内容成功',
          type: 'success',
          duration: 1500
        })
        this.filecontentDialogVisible = false
      })
    },
    // 获取文件中转区文件列表
    async getTransitFileList() {
      this.transitListLoading = true
      await getMsfCoreLoots().then(response => {
        this.transitFileList = response.data.dirs
        this.transitFileList = this.transitFileList.map(item => {
          // 添加上传按钮loading
          this.$set(item, 'uploadLoading', false)
          return item
        })
        this.transitListLoading = false
      })
    },
    // 点击上传文件按钮弹出中转区对话框
    handleClickUploadFile() {
      this.fileuploadDialogVisible = true
      this.getTransitFileList()
    },
    // 上传中转区的文件到目标机
    async handleClickUploadTransitFileToTarget(row) {
      this.$set(row, 'uploadLoading', true)
      const data = {
        sid: this.session.id,
        src: `${row.path}`,
        dest: `${this.pwd}/${row.name}`
      }
      await uploadFileToTarget(data).then(response => {
        this.handleClickRefreshDir()
        showMsg(this, `${row.name} 上传成功`)
        this.$set(row, 'uploadLoading', false)
        this.$refs.Xfile.unloading()
        this.fileuploadDialogVisible = false
      })
    }
  }
}
