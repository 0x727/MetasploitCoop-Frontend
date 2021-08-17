import { mapGetters } from 'vuex'
import store from '@/store'
import { showNotify } from '@/utils/util'

export default {
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters([
      'session_events'
    ])
  },
  watch: {
    event_list() {
      // 当输出框变化时，滚动条到最下面,一定要在nextTick里
      this.$nextTick(() => {
        var chat_scroll = this.$refs['chat_room']
        if (chat_scroll) { chat_scroll.scrollTop = chat_scroll.scrollHeight }
      })
    }
  },
  methods: {
    handleEventFunc(event, redata) {
      switch (event['action']) {
        case 'on_session_open':
          store.dispatch('session_events/change_events', event)
          showNotify(this, '有主机上线：', redata.data['tunnel_peer'])
          break
        case 'on_session_close':
          store.dispatch('session_events/change_events', event)
          showNotify(this, '有主机下线：', redata.data['tunnel_peer'], 'warning')
          break
        case 'on_session_output':
          store.dispatch('session_events/change_events', event)
          break
        case 'on_module_complete':
          store.dispatch('session_events/change_events', event)
          break
        case 'log':
          store.dispatch('session_events/change_events', event)
          break
        case 'on_session_heartbeat':
          store.dispatch('session_events/change_events', event)
          break
        case 'on_finished_download':
          showNotify(this, `${redata.data['sid']}文件下载完成：`, redata.data['filepath'])
          break
        default:
          store.dispatch('session_events/change_events', event)
          break
      }
      // this.event_list.push(event)
    }
  }
}
