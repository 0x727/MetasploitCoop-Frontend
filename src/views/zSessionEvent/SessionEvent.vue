<template>
  <div class="msf-session-event">
    <el-col :span="24" class="left">
      <el-card>
        <div>
          <ul ref="chat_room" v-infinite-scroll="load" class="infinite-list" style="overflow:auto">
            <li v-for="(i,index) in event_list" :key="index" class="infinite-list-item">
              <el-tag effect="plain">{{ i['created_at'] | timesFilter }}</el-tag>
              <el-tag effect="dark" type="info">{{ i['username'] }}</el-tag>
              {{ i['message'] }}
            </li>
          </ul>
          <el-input v-model="chat_input" size="mini" placeholder="请输入内容" class="input-with-select" @keyup.enter.native="sendChatMessage">
            <el-button slot="append" size="mini" icon="el-icon-s-promotion" @click="sendChatMessage" />
          </el-input>
        </div>
      </el-card>
    </el-col>
    <!-- <el-col :span="8" class="right">
      <el-card>
        <ul
          ref=""
          v-infinite-scroll="load_event"
          class="infinite-list-right"
          infinite-scroll-immediate
          style="overflow:auto"
        >
          <li v-for="(i,index) in rest_event_list['results']" :key="index" class="infinite-list-item">
            <el-tag effect="plain">{{ i['ltype'] }}</el-tag>
            <el-tag effect="plain" type="info">{{ i['info']['msg'] }}</el-tag>
            {{ i['data'] }}
          </li>
        </ul>
      </el-card>
    </el-col> -->
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { timestampFormat } from '@/utils/util'
import { events_fetch } from '@/api/events'
import { chatRecord } from '@/api/synergy'
import { timesFormat } from '@/utils/filters/date_format'
import Events from './mixins/Events'
export default {
  name: 'MsfSessionEvent',
  components: {
  },
  filters: {
    timesFilter(times) {
      return timesFormat(times).slice(5).slice(0, -3).replace('T', '-')
    },
    timestampFilter(timestamp) {
      return timestampFormat(timestamp)
    }
  },
  mixins: [Events],
  data() {
    return {
      chat_input: '',
      count: 0,
      event_list: [],
      rest_event_list: [],
      listLoading: true,
      event_websock: null,
      chat_websock: null,
      token: getToken()
    }
  },

  created() {
    this.initdata()
    this.initEventWebSocket()
    this.initChatWebSocket()
  },
  destroyed() {
    this.event_websock.close() // 离开路由之后断开websocket连接
    this.chat_websock.close()
  },
  mounted() {
  },
  methods: {
    async load_event() {
      await events_fetch({ 'ordering': '-id' }).then(response => {
        this.rest_event_list = response.data
      })
      await chatRecord({ 'ordering': '-id' }).then(response => {
        // this.rest_event_list = response.data
        this.event_list = response.data
      })
    },
    load() {
      if (this.count < 30) {
        this.count += 2
      }
    },
    sendChatMessage(text) {
      if (this.chat_input) {
        const message = JSON.stringify({ message: this.chat_input })
        this.chat_websock.send(message)
        this.chat_input = ''
      }
    },
    initEventWebSocket() { // 初始化weosocket
      var parser = document.createElement('a')
      parser.href = localStorage.getItem('SERVER_HOST')
      const socket_url = `${parser.protocol === 'https:' ? 'wss' : 'ws'}://${parser.host}`
      const event_wsuri = `${socket_url}/ws/msf/notify/?token=${this.token}`
      this.event_websock = new WebSocket(event_wsuri)
      this.event_websock.onmessage = this.event_websocketonmessage
      this.event_websock.onopen = this.websocketonopen
      this.event_websock.onerror = this.event_websocketonerror
      this.event_websock.onclose = this.websocketclose
    },
    initChatWebSocket() { // 初始化weosocket
      var parser = document.createElement('a')
      parser.href = localStorage.getItem('SERVER_HOST')
      const socket_url = `${parser.protocol === 'https:' ? 'wss' : 'ws'}://${parser.host}`
      const chat_wsuri = `${socket_url}/ws/chat/default/?token=${this.token}`
      this.chat_websock = new WebSocket(chat_wsuri)
      this.chat_websock.onmessage = this.chat_websocketonmessage
      this.chat_websock.onopen = this.websocketonopen
      this.chat_websock.onerror = this.chat_websocketonerror
      this.chat_websock.onclose = this.websocketclose
    },
    websocketonopen() { // 连接建立之后执行send方法发送数据
      // this.websocketsend(JSON.stringify(actions))
    },
    event_websocketonerror() { // 连接建立失败重连
      this.initEventWebSocket()
    },
    chat_websocketonerror() { // 连接建立失败重连
      this.initChatWebSocket()
    },
    event_websocketonmessage(e) { // 数据接收
      const redata = JSON.parse(e.data)
      const event = { 'times': new Date().toISOString(), 'action': redata.action, 'data': redata.data }
      this.handleEventFunc(event, redata)
    },
    chat_websocketonmessage(e) { // 数据接收
      const redata = JSON.parse(e.data)
      const event = { 'created_at': new Date().toISOString(), 'action': redata.action, 'message': redata.message, 'username': redata.username }
      this.event_list.push(event)
    },
    websocketsend(Data) { // 数据发送
      this.event_websock.send(Data)
      this.chat_websock.send(Data)
    },
    websocketclose(e) { // 关闭
    },
    initdata() {
      this.load_event()
    }

  }

}
</script>

<style lang="scss" scoped>
@import "./mixins/css";
</style>
