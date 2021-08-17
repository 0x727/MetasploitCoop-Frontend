import { MsfSessionScreenshot } from '@/api/session'
import { route_create } from '@/api/route'
import { session_edit_desc } from '@/api/dbmsf'

export default {
  data() {
    return {
      screenshots_uuid: [],
      cmListBak: [{
        text: '命令终端',
        icon: 'terminal',
        func: this.handleContextClickOpenTerm,
        addition: []
      }, {
        text: '执行模块',
        icon: 'th-large',
        func: this.executePostModule
      }, {
        text: '查看',
        icon: 'binoculars',
        children: [{
          text: '文件管理',
          icon: 'folder',
          func: this.handleContextClickFileManage
        }, {
          text: '进程管理',
          icon: 'tasks',
          func: this.handleContextClickProcess
        }, {
          text: '截屏',
          icon: 'photo-video',
          func: this.handleContextClickScreenshot
        }, {
          text: '历史记录',
          icon: 'history',
          func: this.handleContextClickOpenHistory
        }]
      }, {
        text: '访问',
        icon: 'shield-alt',
        children: [{
          text: 'getsystem',
          icon: 'radiation-alt',
          func: this.handleContextClickFunction,
          addition: { type: 'shell', shell: ['getsystem'] }
        }, {
          text: 'hashdump',
          icon: 'user-secret',
          func: this.handleContextClickFunction,
          addition: { type: 'shell', shell: ['hashdump'] }
        }]
      }, {
        text: '路由/转发',
        icon: 'route',
        children: [{
          text: '添加路由',
          icon: 'plus',
          func: this.handleContextClickAddRouter
        }, {
          text: '端口转发',
          icon: 'plus',
          func: this.handleContextClickFunction,
          addition: { type: 'post', post: { module: 'windows/manage/portproxy', is_autorun: false }}
        }]
      }, {
        text: '会话管理',
        icon: 'tools',
        children: [{
          text: '修改备注',
          icon: 'edit',
          func: this.handleContextClickEditDesc
        }]
      }]
    }
  },
  methods: {
    // 右键菜单打开命令终端
    handleContextClickOpenTerm(addition) {
      this.$emit('onOpenSessionTerm', this.curContextRow)
    },
    // 右键菜单打开历史记录
    handleContextClickOpenHistory() {
      this.$emit('onOpenSessionHistory', this.curContextRow)
    },
    // 右键菜单打开文件管理
    handleContextClickFileManage() {
      this.callOpenSessionFileManage()
    },
    // 右键菜单打开进程管理
    handleContextClickProcess() {
      this.callOpenSessionProcess()
    },
    handleContextClickAddRouter() {
      this.$prompt('例如：10.20.1.0/24', '请输入子网', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$|^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\-([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
        inputErrorMessage: '子网格式不正确'
      }).then(({ value }) => {
        this.addRouter(value)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消添加'
        })
      })
    },
    handleContextClickEditDesc() {
      this.$prompt('例如：域控', '请输入备注', {
        confirmButtonText: '确定',
        inputValue: this.curContextRow.desc,
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.editDesc(value)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消添加'
        })
      })
    },
    async addRouter(address) {
      await route_create(this.curContextRow.id, address).then((response) => {
        this.$message({
          type: 'success',
          message: response.data.replace('Route added to subnet', '成功添加路由为：')
        })
      })
      this.fetchData()
    },
    async editDesc(address) {
      await session_edit_desc(this.curContextRow.db_id, address).then((response) => {
        this.$message({
          type: 'success',
          message: '成功修改会话备注：'
        })
      })
      this.fetchData()
    },
    async handleContextClickScreenshot() {
      await MsfSessionScreenshot(this.curContextRow.id).then(response => {
        if (response.data.data && response.data.uuid) {
          this.$notify({
            title: '截屏完成，等待图片返回',
            message: response.data.data,
            type: 'success',
            duration: 1500
          })
          this.screenshots_uuid.push(response.data.uuid)
        }
      })
    }
  }
}
