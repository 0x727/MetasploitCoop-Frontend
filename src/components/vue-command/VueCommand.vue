<template>
  <div
    ref="vue-command"
    class="vue-command"
  >
    <slot name="bar">
      <div
        class="term-bar"
      >
        <span
          class="term-title"
        >
          {{ title }}
        </span>
      </div>
    </slot>

    <div
      ref="term-std"
      class="term-std"
    >
      <Search
        v-if="isSearch"
        ref="search"
        :executed="local.executed"
        :is-search.sync="isSearch"
        :stdin="stdin"
        @click="focus"
        @handle="handle"
      />

      <div
        v-show="!isSearch"
        ref="term-cont"
        :class="{ 'term-cont-fullscreen': local.isFullscreen }"
        class="term-cont"
        @click="focus"
      >
        <div v-if="showIntro">
          {{ intro }}
        </div>
        <div ref="up-stdout" class="up-stdout">
          <el-row ref="term-cont">
            <div
              v-for="(stdout, index) in local.history"
              :key="index"
              class="term-hist"
              :class="{ 'term-hist-fullscreen' : (local.isFullscreen && index === local.history.length - 1) }"
            >
              <stdout
                v-show="(!local.isFullscreen || index === local.history.length - 1)"
                :component="stdout"
                class="term-stdout"
              />
            </div>
          </el-row>
        </div>
        <el-divider class="std-el-divider" />
        <div class="down-stdin">
          <stdin
            ref="stdin"
            :bus="bus"
            :cursor="local.cursor"
            :hide-prompt="hidePrompt"
            :is-fullscreen="local.isFullscreen"
            :is-in-progress="local.isInProgress"
            :is-last="true"
            :prompt="prompt"
            :help-text="helpText"
            :help-timeout="helpTimeout"
            :show-help="showHelp"
            :stdin.sync="local.stdin"
            :uid="_uid"
            @handle="handle"
          >
            <template #prompt>
              <slot name="prompt" />
            </template>
          </stdin>
        </div>
        <!-- </el-row> -->
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

import Search from './Search'
import Stdin from './Stdin'
import Stdout from './Stdout'
import AutocompleteMixin from './mixins/autocomplete'
import HandleMixin from './mixins/handle'
import HistoryMixin from './mixins/history'
import SearchMixin from './mixins/search'
import UIMixin from './mixins/ui'
import { EVENT_LISTENERS } from './library'

// Event bus for communication
const EventBus = new Vue()

export default {
  components: { Search, Stdin, Stdout },
  mixins: [AutocompleteMixin, HandleMixin, HistoryMixin, SearchMixin, UIMixin],

  provide() {
    return {
      emitExecute: this.emitExecute,
      emitExecuted: this.emitExecuted,
      emitInput: this.emitInput,
      setStdin: this.setStdin
    }
  },

  props: {
    autocompletionResolver: {
      default: undefined,
      type: Function
    },

    builtIn: {
      default: undefined,
      type: Function
    },

    commands: {
      default: () => ({}),
      type: Object
    },

    cursor: {
      default: 0,
      type: Number
    },

    // Default event listeners
    eventListeners: {
      default: () => ([
        EVENT_LISTENERS.autocomplete,
        EVENT_LISTENERS.history,
        EVENT_LISTENERS.search
      ]),

      type: Array
    },

    // Non-empty executed commands
    executed: {
      default: () => new Set(),
      type: Set
    },

    helpTimeout: {
      default: 4000,
      type: Number
    },

    hideBar: {
      default: false,
      type: Boolean
    },

    hidePrompt: {
      default: false,
      type: Boolean
    },

    hideTitle: {
      default: false,
      type: Boolean
    },

    helpText: {
      default: 'Type help',
      type: String
    },

    // All executed commands
    history: {
      default: () => [],
      type: Array
    },

    intro: {
      default: 'Fasten your seatbelts!',
      type: String
    },

    isFullscreen: {
      default: false,
      type: Boolean
    },

    isInProgress: {
      default: false,
      type: Boolean
    },

    notFound: {
      default: 'command not found',
      type: String
    },

    // Options when parsing Stdin
    parserOptions: {
      default: () => ({}),
      type: Object
    },

    // History command pointer
    pointer: {
      default: 0,
      type: Number
    },

    prompt: {
      default: '~neil@moon:#/',
      type: String
    },

    showHelp: {
      default: false,
      type: Boolean
    },

    showIntro: {
      default: false,
      type: Boolean
    },

    // Current Stdin
    stdin: {
      default: '',
      type: String
    },

    title: {
      default: 'neil@moon: ~',
      type: String
    }
  },

  data: () => ({
    // Bus for communication
    bus: EventBus,

    // A local copy to allow the absence of properties
    local: {
      // Current Stdin
      stdin: ''
    },

    // Detect scroll and resize events
    scroll: {
      eventListener: undefined,
      // Determinates if scolled to bottom
      isBottom: true,
      resizeObserver: undefined
    }
  }),
  watch: {
    history() {
      // 当输出框变化时，滚动条到最下面,一定要在nextTick里
      this.$nextTick(() => {
        var stdout_scroll = this.$refs['up-stdout']
        if (stdout_scroll) { stdout_scroll.scrollTop = stdout_scroll.scrollHeight }
      })
    },
    stdin() {
      this.setStdin(this.stdin)
    },

    'local.stdin'() {
      // Emit the current Stdin as an event
      this.$emit('input', this.local.stdin)

      // Update given property
      this.$emit('update:stdin', this.local.stdin)

      // Make searching history work again
      if (this.local.stdin === '') {
        this.setPointer(this.local.executed.size)
      }
    }
  },
  mounted() {
    var stdout_scroll = document.getElementsByClassName('up-stdout')[0]
    this.scroll.resizeObserver = new ResizeObserver(async event => {
      await this.$nextTick()
      if (this.scroll.isBottom) {
        stdout_scroll.scrollTop = stdout_scroll.scrollHeight
      }
    })

    this.scroll.resizeObserver.observe(this.$refs['term-cont'])

    // Check if scrolled to bottom
    this.scroll.eventListener = () => {
      const terminal = stdout_scroll
      this.scroll.isBottom = (terminal.scrollHeight - terminal.scrollTop - terminal.clientHeight) === 0
    }

    stdout_scroll.addEventListener('scroll', this.scroll.eventListener)

    // Bind given event listeners
    this.eventListeners.forEach(eventListener => eventListener(this))
  },

  created() {
    // Observe "executed" changes since Vue.js can't watch a "Set". See: https://github.com/ndabAP/vue-command/issues/151
    this.executed.add = function(...x) {
      this.local.executed.add(...x)

      Object.getPrototypeOf(this).add.call(this, ...x)
    }
    this.executed.clear = function() {
      this.local.executed.clear()

      Object.getPrototypeOf(this).add.call(this)
    }
    this.executed.delete = function(...x) {
      this.local.executed.delete(...x)

      Object.getPrototypeOf(this).delete.call(this, ...x)
    }

    // Apply user given properties
    this.setCursor(this.cursor)
    this.setPointer(this.pointer)
    this.setStdin(this.stdin)
    this.setIsInProgress(this.isInProgress)
    this.setIsFullscreen(this.isFullscreen)

    const history = [...this.history]
    // If there is no entry push dummy Stdout to show Stdin
    if (history.length === 0) {
      // Push dummy Stdout without termination
      history.push({
        name: 'VueCommandDummyStdout',
        render: createElement => createElement('span', {}, '')
      })

      // Update the history property
      this.$emit('update:history', [...history])
    }

    this.setHistory([...history])
  },
  destroyed() {
    window.removeEventListener('scroll', this.scroll.eventListener)
  },
  methods: {
    emitInput(input) {
      this.$emit('input', input)
    },

    emitExecute() {
      this.$emit('execute')
    },

    emitExecuted() {
      this.$emit('executed')
    },

    // Focus on last Stdin or search
    focus() {
      // Check if search mode
      if (this.isSearch) {
        this.$refs['search'].focus()
        return
      }
      // Latest Stdin is latest history entry
      // Call component method
      // 输入框获取焦点
      // Latest Stdin is latest history entry
      this.$refs['stdin'].focus()
    },
    async enter(cmd) {
      await this.setStdin(cmd)
      this.$refs['stdin'].handle()
    },
    setStdin(stdin) {
      this.local.stdin = stdin
    }
  }
}
</script>

<style lang="scss">
@import "./scss/mixins";
.up-stdout {
  height: calc((100vh - 84px) * 0.5 - 15px);
  overflow-y: auto;
  font-family: Consolas, "Source Code Pro", Menlo, monospace;
  font-size: 1rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-bottom: 0.5rem;
  flex-direction: column;
  word-break: break-all;
  line-height:1.25;
  flex: 1;
  background: $background;
}
.down-stdin {
  background: $background;
}
.vue-command {
  .term-bar {
    background: $background;
    border-bottom: 0px solid $background;
    display: block;
    justify-content: center;
    top: 0;
    width: 100%;
    display: flex;
  }
  .std-el-divider{
    height:0px;
    margin: 1px 0;
  }
  .term-hist-container-fullscreen {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
  }
  .term-stdout {
    word-break: break-all;
    background: $background;
  }
}
</style>
