import { getMsfCoreLoots,
  previewMsfCoreLoot,
  downloadMsfCoreLoot,
  delMsfCoreLoot,
  uploadMsfCoreLoot } from '@/api/loot'
import { decode } from 'js-base64'
import { downloadBlob, showMsg } from '@/utils/util'

export default {
  methods: {
    handleClickOpenScreenshotDir() {

    },
    handleClickOpenRootDir() {
      this.getTransitFileList('/')
    },
    // 返回上一级
    handleClickBackDir() {
      if (this.pwd.endsWith(':/') || this.pwd.endsWith(':')) {
        this.pwd = '/'
      } else {
        this.pwd = this.pwd.split('/').slice(0, -1).join('/') || this.pwd.split('\\').slice(0, -1).join('\\')
      }
      this.getTransitFileList(this.pwd)
    },
    // 刷新当前目录
    handleClickRefreshDir() {
      this.getTransitFileList(this.pwd)
    },
    // 进入目录
    handleClickEnterDir() {
      this.pwd = this.pwd.replace('\\', '/').replace('//', '/')
      this.getTransitFileList(this.pwd)
    },
    // 弹出直链下载
    visibleDownloadDialog(row) {
      this.current.row = row
      this.visibleDownload = true
    },
    // 返回文件名上传到目标主机
    returnFilePath(row) {
      row['path'] = this.pwd + '/' + row.name
      this.isButtonLoding = true
      this.$emit('handlerReturnFilePath', row)
    },
    unloading() {
      this.isButtonLoding = false
    },
    // 双击文件
    handleDbclickFile(row, column, event) {
      switch (row.ftype) {
        case 'fixed':
          this.pwd = row.name
          this.getTransitFileList(this.pwd)
          break
        case 'directory':
          if (row.name === '..') {
            this.handleClickBackDir()
            break
          } if (row.name === '.') {
            break
          }
          this.pwd = this.pwd + '/' + row.name
          this.getTransitFileList(this.pwd)
          break
        case 'file':
          if (parseInt(row.size) > 1024000) {
            this.$message({
              message: '文件过大，不支持查看',
              type: 'warning',
              offset: event.y - 30
            })
            break
          }
          this.getFileContent(this.pwd + '/' + row.name)
          break
        default:
          break
      }
    },
    // 预览文件内容
    async getFileContent(filepath) {
      this.curFilePath = filepath
      const data = {
        path: filepath
      }
      await previewMsfCoreLoot(data).then(response => {
        const ext = response.data.ftype.split('/')[0]
        switch (ext) {
          case 'text':
            this.filecontentDialogVisible = true
            this.filecontent = decode(response.data.content)
            break
          case 'image':
            this.imgList = []
            for (let findex = 0; findex < this.fileList.length; findex++) {
              this.imgList.push(this.pwd + '/' + this.fileList[findex].name)
            }
            this.imgIndex = Number(this.imgList.indexOf(filepath))
            this.imgShow = true
            break
          default :
            this.filecontentDialogVisible = false
            break
        }
      })
    },
    // 获取文件中转区文件列表
    async getTransitFileList(path) {
      this.listLoading = true
      const data = { path: path }
      await getMsfCoreLoots(data).then(response => {
        this.fileList = response.data.dirs
        this.pwd = response.data.pwd
        this.listLoading = false
      })
    },
    // 表格某一行右键点击
    handleRightClickRow(row, column, event) {
      this.current.row = row
      this.current.column = column
      this.current.event = event
      this.$easycm(event, this.$root, 'core_file_transit')
    },
    // 右键菜单下载文件
    async handleContextClickDownloadFile() {
      const filename = this.pwd + '/' + this.current.row.name
      await downloadMsfCoreLoot(filename).then(response => {
        downloadBlob(response, filename)
      })
    },
    // 右键菜单删除文件
    async handleContextClickDelFile() {
      const filename = this.pwd + '/' + this.current.row.name
      await delMsfCoreLoot(filename).then(response => {
        showMsg(this, '删除文件成功')
      })
      this.getTransitFileList(this.pwd)
    },
    // 中转区文件上传
    async lootFileUpload(file) {
      await uploadMsfCoreLoot(file, this.pwd).then(response => {
        showMsg(this, `${file.file.name} 上传成功`)
        this.getTransitFileList(this.pwd)
      })
    },
    handleClipboardSuccess() {
      this.$message({
        message: '拷贝文件内容成功',
        type: 'success',
        duration: 1500
      })
    }
  }
}
