<template>
  <div class="msf-task-event">
    <el-row type="flex" class="row-bg" justify="space-between">
      <el-col :span="4">
        <el-select v-model="filter_value" placeholder="日志类型" size="mini" @change="handleClickSearchKeyword">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="7">
        <el-input v-model="search_keyword" placeholder="请输入关键词" class="input-with-select" size="mini" @keyup.enter.native="handleClickSearchKeyword">
          <el-button slot="append" icon="el-icon-search" size="mini" @click="handleClickSearchKeyword" />
        </el-input>
      </el-col>

    </el-row>
    <el-col :span="24" class="left">
      <el-card class="post_event_list">
        <ul ref="infinite_list" class="infinite_list" style="overflow:auto">
          <li v-for="(i,index) in post_event_list" ref="infinite_list_item" :key="index" class="infinite_list_item">
            {{ i }}
          </li>
        </ul>
      </el-card>
    </el-col>
  </div>
</template>

<script>
import { track_post_output } from '@/api/dbmsf'
export default {
  name: 'TaskProgress',
  props: {
    row: {
      type: Object,
      default() { return ({}) }
    }
  },
  data() {
    return {
      count: 0,
      filter_value: '',
      options: [{
        value: '[+]',
        label: '成功'
      }, {
        value: '[-]',
        label: '错误'
      }, {
        value: '[*]',
        label: '状态'
      }, {
        value: '',
        label: '全部'
      }],
      post_event_list: [],
      post_event_list_sources: [],
      search_keyword: '',
      listLoading: true,
      scroll: {
        eventListener: undefined,
        // Determinates if scolled to bottom
        isBottom: true,
        resizeObserver: undefined
      }
    }
  },
  computed: {

  },
  watch: {
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
    this.track_output(this.row)
  },
  destroyed() {
    window.removeEventListener('scroll', this.scroll.eventListener)
  },
  methods: {
    // 搜索文件
    handleClickSearchKeyword() {
      let xreg = new RegExp('', 'i')
      try {
        xreg = new RegExp(this.search_keyword, 'i')
      } catch (e) {
        this.$notify.error({
          title: '错误',
          dangerouslyUseHTMLString: true,
          message: '<strong>正则搜索请在特殊字符添加 <i style="color:red">/</i> 转义</strong>',
          position: 'bottom-right'
        })
        return false
      }
      this.post_event_list = this.post_event_list_sources.filter(data => {
        if (this.filter_value !== '') { return data.startsWith(this.filter_value) && data.match(xreg) }
        return data.match(xreg)
      })
    },
    async track_output(event_data) {
      const { uuid } = event_data
      await track_post_output(uuid).then(response => {
        response.data.forEach(element => {
          this.post_event_list.push(element.output)
          this.post_event_list_sources.push(element.output)
        })
      })
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/Z/z.scss";
</style>
