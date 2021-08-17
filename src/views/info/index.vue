<template>
  <div class="app-container">
    <el-divider />
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>版本信息</span>
      </div>
      <div class="text item">
        {{ 'msf版本: ' + versionInfo.version }}
      </div>
      <div class="text item">
        {{ 'ruby版本: ' + versionInfo.ruby }}
      </div>
      <div class="text item">
        {{ 'api版本: ' + versionInfo.api }}
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getMsfVersion,
  getMsfModuleStats,
  getMsfBgThreads
} from '@/api/info'

export default {
  name: 'MsfInfo',
  data() {
    return {
      activeNames: 0,
      versionInfo: {
        version: '',
        ruby: '',
        api: ''
      },
      moduleStas: [
        { name: 'exploits', count: 2006 },
        { name: 'auxiliary', count: 1096 },
        { name: 'post', count: 343 },
        { name: 'encoders', count: 45 },
        { name: 'nops', count: 10 },
        { name: 'payloads', count: 562 }
      ],
      threadList: []
    }
  },
  created() {
    this.initdata()
  },
  methods: {
    async initdata() {
      await getMsfVersion().then(response => {
        this.versionInfo = response.data
      })
      await getMsfModuleStats().then(response => {
        this.moduleStas = response.data
      })
      await getMsfBgThreads().then(response => {
        this.threadList = response.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    margin-left: 15%;
    width: 70%;
  }
</style>
