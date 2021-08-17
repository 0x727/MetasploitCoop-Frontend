<template>
  <div class="msf-post-event">
    <el-col :span="24" class="left">
      <el-card class="post_event_list">
        <ul ref="infinite_list" class="infinite_list" style="overflow:auto">
          <li v-for="(i,index) in post_event_list" ref="infinite_list_item" :key="index" class="infinite_list_item">
            <el-tag effect="dark">会话ID:{{ i['session'] }}</el-tag>
            <el-tag effect="dark" type="info">模块名称：{{ i['fullname'] }}</el-tag>
            <pre>{{ i['output'] }}</pre>
          </li>
        </ul>
      </el-card>
    </el-col>
  </div>
</template>

<script>
import { track_sid_post_output, track_post_output, track_sid_post_output_by_host } from '@/api/dbmsf'
import Events from './mixins/Events'
export default {
  name: 'MsfPostHistory',
  mixins: [Events],
  props: {
    session: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      count: 0,
      post_event_list: [],
      listLoading: true,
      scroll: {
        eventListener: undefined,
        // Determinates if scolled to bottom
        isBottom: true,
        resizeObserver: undefined
      }
    }
  },
  methods: {
    handleEventFunc(session_events) {
      if (session_events.data.session === this.session.id) {
        switch (session_events['action']) {
          case 'on_module_complete':
            this.track_output(session_events.data)
            break
          default:
            break
        }
      }
    },
    async track_output(event_data) {
      const { uuid, fullname, session } = event_data
      const post_output = { session: session, fullname: fullname, output: '' }
      await track_post_output(uuid).then(response => {
        response.data.forEach(element => {
          post_output.output += element.output
        })
      })
      this.post_event_list.push(post_output)
    },
    async handleSessionEventFunc(session) {
      if (session.local_id) {
        await track_sid_post_output_by_host(session.id).then(response => {
          response.data.forEach(element => {
            this.post_event_list.push(element)
          })
        })
      } else {
        await track_sid_post_output(session.id).then(response => {
          response.data.forEach(element => {
            this.post_event_list.push(element)
          })
        })
      }
    }
  }

}
</script>

<style lang="scss" scoped>
@import "./mixins/css";
</style>
