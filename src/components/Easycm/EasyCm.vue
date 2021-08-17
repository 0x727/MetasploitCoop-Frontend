<template>
  <div v-if="show" class="cm-container" :style="axisComputed">
    <svg aria-hidden="true" style="position: absolute; width: 0px; height: 0px; overflow: hidden;"><symbol id="icon-youjiantou" viewBox="0 0 1024 1024"><path d="M288.791335 65.582671l446.41733 446.417329-446.41733 446.417329z" /></symbol></svg>
    <!--first-->
    <ul
      class="cm-ul cm-ul-1 easy-cm-ul"
      :class="underline?'cm-underline':''"
    >
      <li
        v-for="(item, index) in list"
        :key="index"
        :style="liStyle"
      >
        <div
          :class="firstLeft?'cm-left':''"
          @click.stop="callback([index])"
        >
          <!-- <i :class="item.icon" /> -->
          <svg-icon v-if="item.icon" :icon-class="item.icon" />
          <span>{{ item.text }}</span>
          <svg
            v-if="arrow && item.children && item.children.length > 0"
            class="icon"
            aria-hidden="true"
          >
            <use xlink:href="#icon-youjiantou" />
          </svg>
        </div>
        <!--second-->
        <ul
          v-if="item.children && item.children.length > 0"
          class="cm-ul cm-ul-2 easy-cm-ul"
          :style="secondBorderCheck(index)"
          :class="underline?'cm-underline':''"
        >
          <li
            v-for="(second, si) in item.children"
            :key="si"
            :style="liStyle"
          >
            <div
              :class="secondLeft?'cm-left':''"
              @click.stop="callback([index,si])"
            >
              <svg-icon v-if="second.icon" :icon-class="second.icon" />
              <span>{{ second.text }}</span>
              <svg
                v-if="arrow && second.children && second.children.length > 0"
                class="icon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-youjiantou" />
              </svg>
            </div>
            <!--third-->
            <ul
              v-if="second.children && second.children.length > 0"
              class="cm-ul cm-ul-3 easy-cm-ul"
              :style="thirdBorderCheck(index,si)"
              :class="underline?'cm-underline':''"
            >
              <li
                v-for="(third, ti) in second.children"
                :key="ti"
                :style="liStyle"
              >
                <div @click.stop="callback([index,si,ti])">
                  <svg-icon v-if="third.icon" :icon-class="third.icon" />
                  <span>{{ third.text }}</span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'EasyCm',
  props: {
    tag: {
      type: String,
      default: 'default'
    },
    list: {
      type: Array,
      required: true,
      default() { [] }
    },
    // 是否开启下划线
    underline: {
      type: Boolean,
      default: false
    },
    // 是否开启箭头
    arrow: {
      type: Boolean,
      default: false
    },
    // 是否开启边界检测
    border: {
      type: Boolean,
      default: true
    },
    // 列表项宽度
    itemWidth: {
      type: Number,
      default: 140
    },
    // 列表项高度
    itemHeight: {
      type: Number,
      default: 36
    },
    // 列表项字体
    itemSize: {
      type: Number,
      default: 14
    },
    // 显示点偏移量
    offset: {
      type: Object,
      default: () => {
        return {
          x: 6, y: 2
        }
      }
    },
    // 边界距离
    borderWidth: {
      type: Number,
      default: 6
    }
  },
  data() {
    return {
      // 是否显示
      show: false,
      // 触发点坐标
      axis: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    axisComputed() {
      return {
        top: this.axis.y + this.offset.y + 'px',
        left: this.axis.x + this.offset.x + 'px'
      }
    },
    liStyle() {
      return {
        width: this.itemWidth + 'px',
        height: this.itemHeight + 'px',
        lineHeight: this.itemHeight + 'px',
        fontSize: this.itemSize + 'px'
      }
    },
    firstLeft() {
      const bw = document.body.offsetWidth
      return this.axis.x + this.itemWidth * 2 >= bw
    },
    secondLeft() {
      const bw = document.body.offsetWidth
      return this.axis.x + this.itemWidth * 3 >= bw
    }
  },
  watch: {
    axis() {
      if (this.border) {
        const bw = document.body.offsetWidth; const bh = document.body.offsetHeight
        if (this.axis.x + this.offset.x + this.itemWidth >= bw) {
          this.axis.x = bw - this.itemWidth - this.borderWidth - this.offset.x
        }
        if (this.axis.y + this.offset.y + this.itemHeight * this.list.length >= bh) {
          this.axis.y = bh - this.itemHeight * this.list.length - this.borderWidth - this.offset.y
        }
      }
    }
  },
  mounted() {
    this.$root.$on('easyAxis', (axis) => {
      if (axis.tag === this.tag) {
        this.show = true
        this.axis = axis
      }
    })
    document.addEventListener('click', () => {
      this.show = false
    }, true)
  },
  methods: {
    callRightClickFunc(indexList, funcList) {
      if (indexList.length === 1) {
        const current = funcList[indexList[0]]
        if (Object.prototype.hasOwnProperty.call(current, 'func') && !Object.prototype.hasOwnProperty.call(current, 'children')) {
          current.func(current.addition)
        } else if (!Object.prototype.hasOwnProperty.call(current, 'children')) {
          this.$emit('extend', current.addition)
        }
      } else if (indexList.length === 2) {
        const current = funcList[indexList[0]].children[indexList[1]]
        if (Object.prototype.hasOwnProperty.call(current, 'func') && !Object.prototype.hasOwnProperty.call(current, 'children')) {
          current.func(current.addition)
        } else if (!Object.prototype.hasOwnProperty.call(current, 'children')) {
          this.$emit('extend', current.addition)
        }
      } else if (indexList.length === 3) {
        const current = funcList[indexList[0]].children[indexList[1]].children[indexList[2]]
        if (Object.prototype.hasOwnProperty.call(current, 'func') && !Object.prototype.hasOwnProperty.call(current, 'children')) {
          current.func(current.addition)
        } else if (!Object.prototype.hasOwnProperty.call(current, 'children')) {
          this.$emit('extend', current.addition)
        }
      } else {
        this.$message.error('菜单数组错了哦')
      }
    },
    secondBorderCheck(i) {
      const bw = document.body.offsetWidth; const bh = document.body.offsetHeight
      const cy = this.axis.y + (i + this.list[i].children.length) * this.itemHeight
      return {
        left: this.axis.x + this.itemWidth * 2 >= bw ? '-100%' : '100%',
        top: bh >= cy ? 0 : -(this.list[i].children.length - 1) * this.itemHeight + 'px'
      }
    },
    thirdBorderCheck(i, si) {
      const bw = document.body.offsetWidth; const bh = document.body.offsetHeight
      const cy = this.axis.y + this.list[i].children[si].children.length * this.itemHeight + (i + si) * this.itemHeight + parseInt(this.secondBorderCheck(i).top)
      return {
        left: this.axis.x + this.itemWidth * 3 >= bw ? '-100%' : '100%',
        top: cy > bh ? -(this.list[i].children[si].children.length - 1) * this.itemHeight + 'px' : 0
      }
    },
    // 嵌套菜单，最多支持三层
    callback(indexList) {
      this.callRightClickFunc(indexList, this.list)
    }
  }
}
</script>

<style scoped>
  .icon {
    width: 0.9em; height: 0.9em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
    position: absolute;
    right: 0%;
    top: 50%;
    transform: translateY(-50%);
  }
  .cm-container {
    position: fixed;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    z-index: 9999;
  }
  .cm-ul {
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    box-shadow: 0 0 1px #666;
    background-color: #ffffff;
    color: #2e2e2e;
  }

  .cm-ul li {
    width: 100%;
    box-sizing: border-box;
    text-align: left;
    position: relative;
    cursor: pointer;
  }
  .cm-ul li:hover>ul{
    display: block;
  }
  .cm-ul li div{
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0 0.8em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }
  .cm-ul li i {
    display: inline-block;
    width: 1em;
    font-size: 1.3em;
    text-align: center;
  }
  .cm-ul li div:hover{
    background-color: #666666;
    color: #fff;
  }
  .cm-ul-2,.cm-ul-3 {
    position: absolute;
    top: 0;
    display: none;
    z-index: 10000;
  }
  .cm-left svg{
    transform: translateY(-50%) rotate(180deg) ;
    left: 0;
  }
  .cm-underline li div:after{
    content: '';
    width: 90%;
    position: absolute;
    left: 5%;
    top: 0;
    height: 1px;
    background-color: #cccccc;
    z-index: 10001;
  }
  .cm-underline li div:hover:after,.cm-underline>li:first-child>div:after{
    display: none;
  }
</style>
