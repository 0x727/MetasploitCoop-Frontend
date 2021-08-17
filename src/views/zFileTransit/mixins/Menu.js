export default {
  data() {
    return {
      cmList: [{
        text: '下载',
        func: this.handleContextClickDownloadFile
      }, {
        text: '删除',
        func: this.handleContextClickDelFile
      }]
    }
  },
  methods: {

  }
}
