<template>
  <div>
    <el-tabs tab-position="left" style="height: 86vh;">
      <el-tab-pane label="系统设置"><System /> </el-tab-pane>
      <el-tab-pane label="进程高亮管理"><KeywordList /> </el-tab-pane>
      <el-tab-pane label="模块翻译管理"><ModuleManual /> </el-tab-pane>
      <el-tab-pane label="右键菜单管理"><ContextMenu /> </el-tab-pane>
      <el-tab-pane label="模块选项配置"><ModuleConfig /> </el-tab-pane>
      <!-- <el-tab-pane label="资源脚本管理"><RcScripts /> </el-tab-pane> -->
    </el-tabs>

  </div>
</template>
<script>
import KeywordList from './KeywordList'
import ModuleManual from './ModuleManual'
import System from './System'
import ContextMenu from './ContextMenu'
import ModuleConfig from './ModuleConfig'
// import RcScripts from './RcScripts'
export default {
  components: {
    KeywordList,
    ModuleManual,
    System,
    ContextMenu,
    ModuleConfig
    // RcScripts
  },
  data() {
    return {
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
