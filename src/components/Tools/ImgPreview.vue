<template>
  <transition name="fade">
    <div
      v-if="show"
      id="hevue-wrap"
      ref="heImg"
      class="hevue-wrap"
      :style="'background:' + mainBackground"
      @mouseup="removeMove"
    >
      <div class="he-img-wrap">
        <div class="he-loading">
          <i v-show="imgState === 1" class="el-icon-loading" />
        </div>
        <img
          v-show="imgState === 2"
          ref="heImView"
          :src="imgurl"
          class="he-img-view"
          :style="'transform: scale('+imgScale+') rotate('+imgRotate+'deg);margin-top:'+imgTop+'px;margin-left:'+imgLeft+'px;' + maxWH"
          @mousedown="addMove"
        >
        <div v-show="imgState === 3" class="iconfont hevue-img-error"><i class="el-icon-arrow-right" /></div>
        <div class="iconfont he-close-icon" :style="'color:'+closeColor" @click="close"><i class="el-icon-close" /></div>
        <div
          v-if="multiple"
          class="arrow arrow-left iconfont"
          :style="'color:' + controlColor + ';background: '+controlBackground"
          @click="toogleImg(false)"
        ><i class="el-icon-arrow-left" /></div>
        <div
          v-if="multiple"
          class="arrow arrow-right iconfont"
          :style="'color:' + controlColor + ';background: '+controlBackground"
          @click="toogleImg(true)"
        ><i class="el-icon-arrow-right" /></div>
        <div
          class="he-control-bar"
          :style="'color:' + controlColor + ';background: '+controlBackground"
        >
          <div class="he-control-btn iconfont" @click="scaleFunc(-0.15)"><i class="el-icon-minus" /></div>
          <div class="he-control-btn iconfont" @click="scaleFunc(0.15)"><i class="el-icon-plus" /></div>
          <div v-show="isFull" class="he-control-btn iconfont" @click="imgToggle"><i class="el-icon-rank" /></div>
          <div v-show="!isFull" class="he-control-btn iconfont" @click="imgToggle"><i class="el-icon-full-screen" /></div>
          <div class="he-control-btn iconfont" @click="rotateFunc(-90)"><i class="el-icon-refresh-left" /></div>
          <div class="he-control-btn iconfont" @click="rotateFunc(90)"><i class="el-icon-refresh-right" /></div>
        </div>
        <div
          v-if="multiple"
          class="he-control-num"
          :style="'color:' + controlColor + ';background: '+controlBackground"
        >{{ imgIndex + 1 }} / {{ imgList.length }}</div>
      </div>
    </div>
  </transition>
</template>

<script>
import { previewMsfCoreLoot } from '@/api/loot'
export default {
  name: 'HevueImgPreview',
  props: {
    url: {
      type: String,
      default: ''
    },
    mainBackground: {
      type: String,
      default: ''
    }, // 整体背景颜色
    controlColor: {
      type: String,
      default: '#000'
    }, // 控制条字体颜色
    controlBackground: {
      type: String,
      default: '#434343'
    }, // 控制条背景颜色
    closeColor: {
      type: String,
      default: ''
    }, // 关闭图标的颜色
    multiple: {
      type: Boolean,
      default: false
    },
    keyboard: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: false
    },
    nowImgIndex: {
      type: Number,
      default: 0
    },
    imgList: { type: Array, default() { [] } }
  },
  data() {
    return {
      imgScale: 1,
      imgTop: 0,
      imgLeft: 0,
      imgRotate: 0,
      isFull: false,
      maxWH: 'max-width:80%;max-height:80%;',
      clientX: 0,
      clientY: 0,
      imgIndex: 0,
      canRun: true,
      imgurl: '',
      imgState: 2
    }
  },
  watch: {
    url() {
      this.initImg()
    },
    show(newV) {
      if (newV) {
        this.$nextTick(_ => {
          const _dom = document.getElementById('hevue-wrap')
          _dom.onmousewheel = this.scrollFunc
          // 火狐浏览器没有onmousewheel事件，用DOMMouseScroll代替
          document.body.addEventListener('DOMMouseScroll', this.scrollFunc)
          // 禁止火狐浏览器下拖拽图片的默认事件
          document.ondragstart = function() { return false }
          // 判断是否多选
          if (this.multiple) {
            if (Array.isArray(this.imgList) && this.imgList.length > 0) {
              this.imgIndex = Number(this.nowImgIndex) || 0
              // this.url = this.imgList[this.imgIndex]
              this.changeUrl(this.imgList[this.imgIndex], this.imgIndex)
            } else {
              console.error('imgList 为空或格式不正确')
            }
          } else {
            this.changeUrl(this.url)
          }
          // 判断是否开启键盘事件
          if (this.keyboard) {
            document.addEventListener('keydown', this.keyHandleDebounce)
          }
        })
      }
    }
  },
  mounted() {
    this.initImg()
  },
  methods: {
    close() {
      this.initImg()
      this.maxWH = 'max-width:80%;max-height:80%;'
      this.isFull = false
      // 移除火狐浏览器下的鼠标滚动事件
      document.body.removeEventListener('DOMMouseScroll', this.scrollFunc)
      // 恢复火狐及Safari浏览器下的图片拖拽
      document.ondragstart = null
      // 移除键盘事件
      if (this.keyboard) {
        document.removeEventListener('keydown', this.keyHandleDebounce)
      }
      this.$emit('close')
    },
    initImg() {
      this.imgScale = 1
      this.imgRotate = 0
      this.imgTop = 0
      this.imgLeft = 0
    },
    /**
     * 切换图片
     * true 下一张
     * false 上一张
     */
    toogleImg(bool) {
      if (bool) {
        this.imgIndex++
        if (this.imgIndex > this.imgList.length - 1) {
          this.imgIndex = 0
        }
      } else {
        this.imgIndex--
        if (this.imgIndex < 0) {
          this.imgIndex = this.imgList.length - 1
        }
      }
      // this.url = this.imgList[this.imgIndex]
      this.changeUrl(this.imgList[this.imgIndex], this.imgIndex)
    },
    // 改变图片地址
    async changeUrl(url, index) {
      this.imgState = 1
      const img = new Image()
      const data = {
        path: url
      }
      await previewMsfCoreLoot(data).then(response => {
        const ext = response.data.ftype.split('/')[0]
        if (ext === 'image') {
          this.imgShow = true
          img.src = 'data:' + response.data.ftype + ';base64,' + response.data.content
          img.onload = () => {
            if (index !== undefined && index === this.imgIndex) {
              this.imgState = 2
              this.imgurl = img.src
            } else if (index === undefined) {
              this.imgState = 2
              this.imgurl = img.src
            }
          }
          img.onerror = () => {
            if (index !== undefined && index === this.imgIndex) {
              this.imgState = 3
            } else if (index === undefined) {
              this.imgState = 3
            }
          }
        }
      })
    },
    // 旋转图片
    rotateFunc(deg) {
      this.imgRotate += deg
    },
    // 图片缩放
    scaleFunc(num) {
      if (this.imgScale <= 0.2 && num < 0) return
      this.imgScale += num
    },
    // 图片原尺寸切换
    imgToggle() {
      this.initImg()
      if (this.isFull) {
        this.maxWH = 'max-width:100%;max-height:100%;'
      } else {
        this.maxWH = ''
      }
      this.isFull = !this.isFull
    },
    scrollFunc(e) {
      e = e || window.event
      // e.returnValue = false // ie
      // 火狐下没有wheelDelta，用detail代替，由于detail值的正负和wheelDelta相反，所以取反
      e.delta = e.wheelDelta || -e.detail
      e.preventDefault()
      if (e.delta > 0) { // 当滑轮向上滚动时
        this.scaleFunc(0.015)
      }
      if (e.delta < 0) { // 当滑轮向下滚动时
        this.scaleFunc(-0.015)
      }
    },
    addMove(e) {
      e = e || window.event
      this.clientX = e.clientX
      this.clientY = e.clientY
      this.$refs.heImg.onmousemove = this.moveFunc
    },
    removeMove() {
      this.$refs.heImg.onmousemove = null
    },
    moveFunc(e) {
      e = e || window.event
      e.preventDefault()
      const movementX = e.clientX - this.clientX
      const movementY = e.clientY - this.clientY
      event.clientY
      this.imgLeft += movementX
      this.imgTop += movementY
      this.clientX = e.clientX
      this.clientY = e.clientY
    },
    keyHandleDebounce(e) {
      if (this.canRun) {
        // 如果this.canRun为true证明当前可以执行函数
        this.keyHandle(e)
        this.canRun = false // 执行函数后一段时间内不可再次执行
        setTimeout(() => {
          this.canRun = true // 等到了我们设定的时间之后，把this.canRun改为true，可以再次执行函数
        }, 300)
      }
    },
    // 键盘事件
    keyHandle(e) {
      e = window.event || e
      var key = e.keyCode || e.which || e.charCode
      switch (key) {
        case 27: // esc
          this.close()
          break
        case 65: // a键-上一张
          if (this.multiple) {
            this.toogleImg(false)
          }
          break
        case 68: // d键-下一张
          if (this.multiple) {
            this.toogleImg(true)
          }
          break
        case 87: // w键-放大
          this.scaleFunc(0.15)
          break
        case 83: // s键-缩小
          this.scaleFunc(-0.15)
          break
        case 81: // q键-逆时针旋转
          this.rotateFunc(-90)
          break
        case 69: // e键-顺时针旋转
          this.rotateFunc(90)
          break
        case 82: // r键-复位键
          this.initImg()
          break
        default:
          break
      }
    }
  }
}
</script>

<style scoped>
.hevue-wrap {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  z-index: 999999;
}
.he-loading{
    font-size: 90px;
    color: #000000;
}
.he-img-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}
.he-img-view {
  transition: transform 0.3s;
}
.he-close-icon {
  position: absolute;
  right: 50px;
  top: 50px;
  font-size: 46px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.arrow {
  width: 50px;
  height: 50px;
  text-align: center;
  line-height: 50px;
  position: absolute;
  top: 50%;
  border-radius: 50%;
  transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  font-size: 28px;
  opacity: 0.6;
  cursor: pointer;
  transition: all 0.2s;
}
.arrow:hover {
  opacity: 0.8;
  font-size: 32px;
}
.arrow-left {
  left: 150px;
}
.arrow-right {
  right: 150px;
}
.he-close-icon:hover {
  transform: rotate(90deg);
}
.he-control-bar {
  width: 300px;
  height: 44px;
  bottom: 10%;
  left: 50%;
  padding: 0 22px;
  margin-left: -139px;
  position: absolute;
  border-radius: 22px;
  /* display: flex;
  justify-content: space-between; */
}
.he-control-num {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  padding: 0 22px;
  font-size: 16px;
  border-radius: 15px;
}
.he-control-btn {
  line-height: 44px;
  font-size: 24px;
  cursor: pointer;
  padding: 0 9px;
  display: inline-block;
  transition: all 0.2s;
}
.he-control-btn:hover {
  transform: scale(1.2);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.hevue-img-error {
  font-size: 56px;
  color: #ccc;
}
</style>
