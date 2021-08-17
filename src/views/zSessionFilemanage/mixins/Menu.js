import clip from '@/utils/clipboard' // use clipboard directly
export default {
  data() {
    return {
      fileTypeIconMap: {
        directory: 'folder',
        file: 'file',
        fixed: 'disk',
        cdrom: 'save',
        fifo: 'file',
        remote: 'desktop',
        characterSpecial: 'file',
        blockSpecial: 'file',
        link: 'file',
        socket: 'file',
        removable: 'disk',
        null: 'file'
      },
      cmList: [{
        text: '执行程序',
        func: this.handleExecClick
      }, {
        text: '查看/编辑',
        func: this.handleContextClickOpenFile
      }, {
        text: '删除',
        func: this.handleContextClickDelFile
      }, {
        text: '复制路径',
        func: this.handleMockClick
      }, {
        text: '下载文件',
        func: this.handleDownloadClick
      }]
    }
  },
  methods: {
    // 右键菜单点击打开
    handleContextClickOpenFile() {
      this.handleDbclickFile(this.curContextRow, this.curContextColumn, this.curContextEvent)
    },
    // 右键菜单拷贝路径
    handleContextCopyFilePath(text, event) {
      if (text !== '') {
        clip(text, event)
      } else {
        clip(`${this.pwd}`, event)
      }
    }
  }
}
