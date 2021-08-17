import { cloneDeep } from 'lodash'
import { mapGetters } from 'vuex'
import { formatDate } from '@/utils/filters/date_format'

export default {
  data() {
    return {
      cm_module_options: {}
    }
  },
  computed: {
    ...mapGetters([
      'session_events',
      'console_events',
      'toolbar_events'
    ])
  },
  watch: {
    list() {
      this.$nextTick(() => {
        this.$refs.table.doLayout()
      })
    },
    session_events() {
      switch (this.session_events.action) {
        case 'on_session_open':case 'on_session_close':
          if (!this.listLoading) {
            this.initdata()
          }
          break
        case 'on_session_heartbeat':
          if (!this.visiblePost && this.expandedRows.length === 0) {
            this.list = this.list.map(item => {
              return {
                ...item,
                checkin: this.formatTime(this.session_events.data[item.id].checkin)
              }
            })
          }
          break
        case 'on_finished_screenshot':
          if (this.screenshots_uuid.includes(this.session_events.data.uuid)) {
            const uuid = this.session_events.data.uuid
            this.previewImg(this.session_events.data.path)
            this.screenshots_uuid = this.screenshots_uuid.filter(function(ele) {
              return ele !== uuid
            })
          }
          break
        default:
          break
      }
    },
    toolbar_events(action) {
      const { event } = action
      switch (event) {
        case 'contextmenu':
          // 深拷贝,加锁
          if (this.menu_loading) {
            this.menu_loading = false
            this.cmList = cloneDeep(this.cmListBak)
            this.add_context_menu()
            this.menu_loading = true
          }
          break
        default:
          break
      }
    },
    console_events() {
      const { type } = this.console_events.event || null
      const { post } = this.console_events.event || {}
      switch (type) {
        case 'post':
          this.module_path = post.module
          this.is_autorun = post.is_autorun
          this.cm_module_options = this.console_events.event.options
          this.visiblePost = true
          break
        default:
          break
      }
    }
  },
  methods: {
    formatTime(time) {
      if (time > 500) {
        return formatDate(new Date(new Date().getTime() - time * 1000))
      } else {
        return `${time}s`
      }
    },
    previewImg(path) {
      this.imgFilePath = path
      this.imgShow = true
    },
    executePostModule(row) {
      if (row) {
        this.curContextRow = row
      }
      this.$emit('onOpenPostTab', this.curContextRow)
    },
    callOpenSessionFileManage() {
      this.$emit('onOpenSessionFileManage', this.curContextRow)
    },
    callOpenSessionProcess() {
      this.$emit('onOpenSessionProcess', this.curContextRow)
    }
  }
}
