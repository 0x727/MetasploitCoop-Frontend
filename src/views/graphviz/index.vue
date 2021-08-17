<template>
  <div class="graphviz">
    <div id="graphviz-hd" ref="graphviz-hd" class="echarts_css" style="height:100%;width:100%;" />
  </div>
</template>

<script>
var echarts = require('echarts')
import { get_host } from '@/api/dbmsf'
import { session_list } from '@/api/session'
import SvgHash from './svg_hash'
export default {
  mixins: [SvgHash],
  data() {
    return {
      unique_data: {},
      unique_links: {},
      x_y: { other: { total: 0, percent: 0 }, firewall: { total: 0, percent: 0 }, client: { total: 0, percent: 0 }, server: { total: 0, percent: 0 }},
      Graphviz: Object,
      option: {
        title: {
          text: '拓扑图'
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        tooltip: { },
        coordinateSystem: 'cartesian2d',
        series: [
          {
            type: 'graph',
            layout: 'none', // circular环形， force 力引导布局
            symbolSize: 25, // 节点大小
            edgeSymbol: ['none', 'arrow'],
            circular: { rotateLabel: true },
            animation: false,
            roam: true, // 是否开启鼠标缩放和平移漫游
            fixed: true,
            draggable: false, // 节点是否可拖拽
            label: {
              show: true
            },
            data: [],
            links: [],
            lineStyle: {
              opacity: 0.9,
              width: 5,
              curveness: 0
            }
          }
        ]
      }
    }
  },
  watch: {

  },
  mounted() {
    this.Graphviz = echarts.init(this.$refs['graphviz-hd'])
    this.Graphviz.setOption(this.option)
    window.addEventListener('resize', this.updatePosition)
    this.Graphviz.on('dataZoom', this.updatePosition)
    this.Graphviz.on('graphRoam', this.updatePosition)
  },
  created() {
    this.fetchData()
  },
  methods: {
    info_to_svg(session) {
      switch (session['purpose']) {
        case 'client':
          this.x_y.client.total++
          return (this.svg.client[session['os_family']])
        case 'firewall':
          this.x_y.firewall.total++
          return (this.svg.firewall)
        case 'server':
          this.x_y.server.total++
          return (this.svg.server)
        default:
          this.x_y.other.total++
          break
      }
    },
    info_to_xy(item) {
      const width = this.Graphviz.getWidth()
      const high = this.Graphviz.getHeight() / 4
      let xy = {}
      switch (item['category']) {
        case 'client':
          xy = { x: (width / this.x_y[item['category']].total) * [this.x_y[item['category']].percent], y: high * 3 }
          this.x_y[item['category']].percent++
          return (xy)
        case 'firewall':
          xy = { x: (width / this.x_y[item['category']].total) * [this.x_y[item['category']].percent], y: high }
          this.x_y[item['category']].percent++
          return (xy)
        case 'server':
          xy = { x: (width / this.x_y[item['category']].total) * [this.x_y[item['category']].percent], y: high * 2 }
          this.x_y[item['category']].percent++
          return (xy)
        default:
          xy = { x: (width / this.x_y.other.total) * [this.x_y.other.percent], y: high * 4 }
          this.x_y.other.percent++
          return (xy)
      }
    },
    append_node(session_data) {
      const that = this
      this.option.series[0]['data'] = session_data
      this.option['graphic'] =
          echarts.util.map(this.option.series[0].data, function(dataItem, dataIndex) {
          // 使用图形元素组件在节点上划出一个隐形的图形覆盖住节点
            var x_y = that.Graphviz.convertToPixel({ seriesIndex: 0 }, [dataItem.x, dataItem.y])
            return {
              type: 'circle',
              id: dataIndex,
              x: x_y[0],
              y: x_y[1],
              shape: {
                cx: 0,
                cy: 0,
                r: 20
              },
              // silent: true,
              invisible: true,
              draggable: true,
              ondrag: echarts.util.curry(that.onPointDragging, dataIndex),
              z: 100 // 使图层在最高层
            }
          })
      this.Graphviz.setOption(this.option)
      setTimeout(function() {
        that.updatePosition()
      }, 1000)
    },
    append_links(links_data) {
      this.option.series[0]['links'] = links_data
      this.Graphviz.setOption(this.option)
    },
    async fetchData() {
      await get_host().then(response => {
        response.data.results.forEach(session => {
          this.unique_data[session['address']] =
           {
             name: session['address'],
             tooltip: session['name'],
             symbol: this.info_to_svg(session),
             category: session['purpose'],
             label: { show: true, position: 'bottom' },
             x: parseInt(Math.random() * 1000),
             y: parseInt(Math.random() * 1000)
           }
        })
        this.relayout_Graphviz()
      })
      await session_list().then(response => {
        response.data.forEach(session => {
          this.unique_data[session['session_host']] = {
            name: session['session_host'],
            tooltip: session['info'],
            symbol: this.svg[session.platform],
            category: 'client',
            label: { show: true, position: 'bottom' },
            x: parseInt(Math.random() * 1000),
            y: parseInt(Math.random() * 1000)
          }
          this.unique_data[session['tunnel_peer'].split(':')[0]] = {
            name: session['tunnel_peer'].split(':')[0],
            tooltip: session['location'].join(':'),
            symbol: this.svg['firewall'],
            category: 'firewall',
            label: { show: true, position: 'bottom' },
            x: parseInt(Math.random() * 1000),
            y: parseInt(Math.random() * 1000)
          }
          this.unique_links[session['session_host'] + '-' + session['tunnel_peer'].split(':')[0]] = {
            source: session['session_host'],
            target: session['tunnel_peer'].split(':')[0]
          }
        })
        this.append_node(Object.values(this.unique_data))
        this.append_links(Object.values(this.unique_links))
        this.relayout_Graphviz()
      })
    },
    relayout_Graphviz() {
      const option = this.Graphviz.getOption().series[0].data.map(item => {
        return {
          ...item,
          ...this.info_to_xy(item)
        }
      })
      this.option.series[0].data = option
      this.Graphviz.setOption(this.option)
    },
    updatePosition() { // 更新节点定位的函数
      const that = this
      this.Graphviz.setOption({
        graphic: echarts.util.map(this.option.series[0].data, function(item, dataIndex) {
          var x_y = that.Graphviz.convertToPixel({ 'seriesIndex': 0 }, [item.x, item.y])
          return {
            x: x_y[0],
            y: x_y[1]
          }
        })
      })
    },
    onPointDragging(dataIndex, event) {
      var tmpPos = this.Graphviz.convertFromPixel({ 'seriesIndex': 0 }, [event.offsetX, event.offsetY])
      this.option.series[0].data[dataIndex].x = tmpPos[0]
      this.option.series[0].data[dataIndex].y = tmpPos[1]
      this.Graphviz.setOption(this.option)
      this.updatePosition()
    } }
}
</script>
<style>
.echarts_css {
  width: 100%;
  height: 100%;
}
.graphviz {
  height: calc((100vh - 84px));
}
</style>
