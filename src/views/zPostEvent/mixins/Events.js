import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'session_events'
    ])
  },
  watch: {
    session_events() {
      this.handleEventFunc(this.session_events)
    },
    post_event_list() {
      this.$nextTick(() => {
        var post_output_scroll = this.$refs['infinite_list']
        if (post_output_scroll) { post_output_scroll.scrollTop = post_output_scroll.scrollHeight }
      })
    }
  },
  mounted() {
    var post_output_scroll = document.getElementsByClassName('infinite_list')[0]
    this.scroll.resizeObserver = new ResizeObserver(async event => {
      await this.$nextTick()
      if (this.scroll.isBottom) {
        post_output_scroll.scrollTop = post_output_scroll.scrollHeight
      }
    })
    // Check if scrolled to bottom
    this.scroll.eventListener = () => {
      const post_text = post_output_scroll
      this.scroll.isBottom = (post_text.scrollHeight - post_text.scrollTop - post_text.clientHeight) === 0
    }
    post_output_scroll.addEventListener('scroll', this.scroll.eventListener)
    // Bind given event listeners
  },
  created() {
  },
  destroyed() {
    window.removeEventListener('scroll', this.scroll.eventListener)
  }
}
