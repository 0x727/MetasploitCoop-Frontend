<template>
  <div class="msf-session-console-term">
    <div id="terminal-container" ref="terminal-container" />
  </div>
</template>

<script>
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { getToken } from '@/utils/auth'
import { FitAddon } from 'xterm-addon-fit'

export default {
  data() {
    return {
      token: getToken(),
      terminalSocket: '', // ws实例
      terminal: '' // 保存terminal实例
    }
  },
  mounted() {
    const rows = Math.floor((document.documentElement.clientHeight * 0.5) / 19.8)
    this.terminal = new Terminal({ lineHeight: 1, rows: rows })
    var parser = document.createElement('a')
    parser.href = localStorage.getItem('SERVER_HOST')
    const socket_url = `${parser.protocol === 'https:' ? 'wss' : 'ws'}://${parser.host}`
    this.terminalSocket = new WebSocket(`${socket_url}/ws/msf/console/?token=${this.token}`)
    this.terminalSocket.onopen = this.runRealTerminal // 当连接成功触发此函数
    this.terminalSocket.onclose = this.closeRealTerminal // 当断开连接调用此函数
    this.terminalSocket.onerror = this.errorRealTerminal // 当发生错误调用此函数
    this.terminalSocket.onmessage = this.messageRealTerminal // 当收到信息调用此函数
    const fitAddon = new FitAddon()
    this.terminal.loadAddon(fitAddon)
    const terminalContainer = document.getElementById('terminal-container')
    this.terminal.open(terminalContainer)
    fitAddon.fit()
    this.terminal.onData(this.onRealTerminal)
    this.terminal._initialized = true

    window.onresize = () => {
      const rows = Math.floor((document.documentElement.clientHeight * 0.5) / 20)
      this.terminal.resize(100, rows)
    }
  },
  beforeDestroy() {
    this.terminalSocket.close()
    this.terminal.dispose()
  },
  created() {
  },
  methods: {
    runRealTerminal() {
    },
    errorRealTerminal() {
    },
    closeRealTerminal() {
      this.terminalSocket.close()
      this.terminal.dispose()
    },
    messageRealTerminal(MessageEvent) {
      const content = JSON.parse(MessageEvent.data)
      this.terminal.write(content.data)
    },
    onRealTerminal(data) {
      this.terminalSocket.send(JSON.stringify({ data: data }))
    }
  }
}
</script>

<style scoped>
.msf-session-console-term {
  height: calc((100vh - 84px) * 0.5 + 24px);
}
</style>
