<template>
  <div class="msf-session-meterpreter-term">
    <vue-command
      ref="terminal"
      :commands="commands"
      :title.sync="termTitle"
      :prompt="termPrompt"
      :autocompletion-resolver="autocompleMsfCmd"
      :history.sync="termHistory"
      :stdin.sync="termStdin"
      :cursor.sync="termCursor"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// MsfSessionMeterpreterTermHistory
import { commandAutoComplete, commandExecute, historyAndPost } from '@/api/session'
import { track_sid_cmd_output_by_host, track_post_output } from '@/api/dbmsf'
import VueCommand from '@/components/vue-command/VueCommand'
import { createStdout } from '@/components/vue-command/library'
var jschardet = require('jschardet')
var iconv = require('iconv-lite')

export default {
  name: 'MsfSessionMeterpreterTerm',
  components: { VueCommand },
  props: {
    session: {
      type: Object,
      required: true
    },
    termTitle: {
      type: String,
      default: 'beacon:~'
    }
  },
  data: () => ({
    activeName: '',
    termPrompt: 'beacon>',
    commands: {},
    termStdin: '',
    termHistory: [],
    termCursor: 0,
    curStdin: ''
  }),
  computed: {
    ...mapGetters([
      'session_events',
      'console_events'
    ])
  },
  watch: {
    termStdin: function(val) {
      this.commands = { }
      this.commands[this.termStdin.split(' ')[0]] = this.executeCmd
    },
    session_events() {
      switch (this.session_events['action']) {
        case 'on_session_output':
          var buffer = Buffer.from(this.session_events.data['output'], 'base64')
          if (buffer.length > 0) { // 判断buf是否为空
            var encode_type = jschardet.detect(buffer)
            var content = iconv.decode(buffer, encode_type.encoding).replace(/\n/g, '<br/>').replace(/ /g, '&nbsp')
            // 只在当前sid的命令输出框输出
            if (this.session_events.data['sid'] === Number(this.session.id)) {
              this.termHistory.push({
                render: createElement => {
                  return createElement('span', { domProps: { innerHTML: content }})
                }
              })
            }
          }
          break
        case 'on_session_command':
          if (Number(this.session_events.data['sid']) === Number(this.session.id)) {
            const stdinX = this.session_events.data['command']
            this.termHistory.push({
              render: createElement => {
                return createElement('span', { attrs: {
                  style: 'color:#00ff00'
                },
                domProps: { innerHTML: '> ' + stdinX }})
              }
            })
          }
          break
        case 'on_module_complete':
          if (Number(this.session_events.data['session']) === Number(this.session.id)) {
            this.track_output(this.session_events.data)
          }
          break
        default:
          break
      }
    },
    console_events() {
      if (Number(this.console_events.session.id) === Number(this.session.id)) {
        const { type } = this.console_events.event || null
        const { shell } = this.console_events.event || []
        switch (type) {
          case 'shell':
            shell.forEach(element => {
              setTimeout(() => {
                this.termStdin = element
                this.$refs['terminal'].enter(element)
              }, 500)
            })
            break
          default:
            break
        }
      }
    }
  },
  created() {
    this.initdata()
  },
  mounted() {
  },
  methods: {
    async initdata() {
      if (this.session.local_id) {
        await track_sid_cmd_output_by_host(this.session.id).then(response => {
          this.push_history(response.data)
        })
      } else {
        await historyAndPost(this.session.id).then(response => {
          this.push_history(response.data)
        })
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
      this.push_history([post_output])
    },
    push_history(history_list) {
      history_list.forEach(element => {
        const exclude_list = ['load priv', 'load stdapi']
        switch (element.etype) {
          case 'command':
            if (exclude_list.indexOf(element.command) === -1) {
              this.termHistory.push({
                render: createElement => {
                  return createElement('span', { attrs: {
                    style: 'color:#00ff00'
                  },
                  domProps: { innerHTML: '> ' + element.command }})
                }
              })
            }
            break
          case 'output':
            this.termHistory.push({
              render: createElement => {
                return createElement('span', { domProps: { innerHTML: element.output.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp') }})
              }
            })
            break
          default:
            if (element.output) {
              this.termHistory.push({
                render: createElement => {
                  return createElement('span', { attrs: {
                    style: 'color:#ff0000'
                  },
                  domProps: { innerHTML: '> ' + element.fullname }})
                }
              })
              this.termHistory.push({
                render: createElement => {
                  return createElement('span', { domProps: { innerHTML: element.output.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp') }})
                }
              })
            }
            break
        }
      })
    },
    async autocompleMsfCmd() {
      if (!this.termStdin || this.termStdin === this.curStdin) {
        return
      }
      // Collect all autocompletion candidates
      const candidates = []
      const data = {
        'sid': this.session.id,
        'command': this.termStdin
      }
      await commandAutoComplete(data).then(response => {
        candidates.push(...response.data)
        if (candidates.length === 1) {
          this.termStdin = candidates[0]
          return
        }
        if (candidates.length > 0) {
          this.termHistory.push({
          // Build table programmatically
            render: createElement => {
              const columns = candidates.length < 5 ? candidates.length : 4
              const rows = candidates.length < 5 ? 1 : Math.ceil(candidates.length / columns)
              let index = 0
              const table = []
              for (let i = 0; i < rows; i++) {
                const row = []
                for (let j = 0; j < columns; j++) {
                  row.push(createElement('td', candidates[index]))
                  index++
                }
                table.push(createElement('tr', [row]))
              }
              return createElement('table', { style: { width: '100%' }}, [table])
            }
          })
          this.termHistory.push({
            render: createElement => {
              return createElement('hr', { domProps: { innerHTML: '' }})
            }
          })

          for (let i = 0; i < candidates[0].length - this.termStdin.length; i++) {
            const temp = candidates[0].substr(0, this.termStdin.length + 1)
            candidates.forEach(list => {
              list.startsWith(temp) ? this.termStdin = temp : this.termStdin = temp.substr(0, temp.length - 1)
              return
            })
          }
          this.curStdin = this.termStdin
        }
      })
    },
    executeCmd(cmd) {
      const data = {
        sid: this.session.id,
        command: this.termStdin
      }

      return new Promise((resolve, reject) => {
        commandExecute(data).then(response => {
        // const stdout = '<el-tag style="color:#00ff00" type="success">' + response.data + '</el-tag>'
          resolve(createStdout(''))
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .msf-session-meterpreter-term{
    height: calc((100vh - 84px) * 0.5 + 24px);
  }
</style>
