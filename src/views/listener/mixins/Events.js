import { mapGetters } from 'vuex'

export default {
  data() {
    return {

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
    listenerData() {
      this.$nextTick(() => {
        this.$refs.table.doLayout()
      })
    },
    session_events() {
      switch (this.session_events.action) {
        case 'on_session_open':case 'on_session_close':case 'log':
          this.fetchData()
          break
        default:
          break
      }
    }
  }
}
