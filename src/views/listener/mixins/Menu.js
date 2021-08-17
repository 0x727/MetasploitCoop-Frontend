export default {
  data() {
    return {
      cmList: [{
        text: '生成木马',
        icon: 'sticker-mule',
        func: this.handleContextClickStagers
      }, {
        text: '任务进程',
        icon: 'tasks',
        func: this.handleContextClickTaskProgress
      }]
    }
  },
  methods: {

  }
}
