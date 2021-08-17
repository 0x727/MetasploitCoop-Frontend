<template>
  <div class="dashboard-container">
    <el-container direction="vertical" class="dashboard-main-container">
      <!-- 上面 -->
      <el-row class="up-container">
        <el-tabs v-model="activeName" type="border-card" style="height: 50px" class="tab_page" @tab-click="send_click_event">
          <el-tab-pane name="sessions" style="height: 50px">
            <span slot="label">
              <svg-icon icon-class="laptop-code" />
              会话管理
            </span>
            <!-- session表 -->
            <MsfSessionList
              ref="sessions"
              @onOpenSessionTerm="handleOpenTerm"
              @onOpenSessionFileManage="handleOpenFileManage"
              @onOpenSessionProcess="handleOpenProcess"
              @onOpenPostTab="handleOpenPostTab"
              @onOpenSessionHistory="handleOpenHistory"
              @activePostTab="handleactivePostTab"
            />
          </el-tab-pane>
          <el-tab-pane name="listener">
            <span slot="label">
              <svg-icon icon-class="tasks" />
              任务管理
            </span>
            <!-- 监听器表 -->
            <MsfListenerList ref="listener" />
          </el-tab-pane>
          <el-tab-pane label="主机列表" name="host">
            <span slot="label">
              <svg-icon icon-class="server" />
              主机列表
            </span>
            <!-- 主机列表 -->
            <MsfHostList @onOpenSessionTerm="handleOpenTerm" @onOpenSessionHistory="handleOpenHistory" />
          </el-tab-pane>
          <el-tab-pane label="凭证" name="cred">
            <span slot="label">
              <svg-icon icon-class="key" />
              凭证
            </span>
            <!-- 凭证列表 -->
            <MsfCredsList ref="host" />
          </el-tab-pane>
          <el-tab-pane label="战利品" name="loot">
            <span slot="label">
              <svg-icon icon-class="snowplow" />
              战利品
            </span>
            <!-- 战利品列表 -->
            <MsfLootList />
          </el-tab-pane>
          <el-tab-pane
            name="router_port"
            style="min-height: 100%;"
            :closable="false"
          >
            <span slot="label">
              <svg-icon icon-class="route" />
              路由/转发
            </span>
            <MsfRoutePort ref="router_port" />
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <!-- 下面 -->
      <el-row class="down-container">
        <MsfSessionOperation ref="sessionOp" />
      </el-row>
    </el-container>
    <!-- 创建监听器 -->
    <el-dialog
      v-if="addListenerVisible"
      title="创建监听器-选项"
      class="dialog"
      :visible="true"
      width="80vw"
      top="5vh"
      :lock-scroll="true"
      @close="addListenerVisible = false"
    >
      <ListenerStep
        ref="moduleOptionRef"
        page="exploit"
        fullname="exploit/multi/handler"
        @cancel="addListenerVisible = false"
      />
    </el-dialog>
    <ModuleStep
      v-if="visibleModule"
      @cancel="visibleModule = false"
    />
  </div>

</template>

<script>
import { mapGetters } from 'vuex'
import ListenerStep from '@/components/web/Module/ListenerStep'
import ModuleStep from '@/components/web/Module/ModuleStep'
import MsfSessionList from './MsfSessionList'
import MsfListenerList from '@/views/listener/MsfListenerList'
import MsfCredsList from '@/views/cred/CredList'
import MsfLootList from '@/views/loot'
import MsfHostList from '@/views/host/MsfHostList'
import MsfSessionOperation from './MsfSessionOperation'
import MsfRoutePort from '@/views/router/MsfRoutePort'

export default {
  name: 'Dashboard',
  components: {
    ListenerStep,
    MsfSessionList,
    MsfSessionOperation,
    MsfListenerList,
    MsfCredsList,
    MsfLootList,
    MsfHostList,
    MsfRoutePort,
    ModuleStep
  },
  data() {
    return {
      activeName: 'sessions',
      visibleModule: false,
      addListenerVisible: false,
      sessionTableData: [],
      sessionDefaultColumn: []
    }
  },
  computed: {
    ...mapGetters([
      'session_events', 'toolbar_events'
    ])
  },
  watch: {
    // 工具条事件
    toolbar_events(action) {
      const { event } = action
      switch (event) {
        case 'console':
          this.$refs.sessionOp.addTabSession('console', action)
          break
        case 'transit':
          this.$refs.sessionOp.addTabSession('transit', action)
          break
        case 'listener':
          this.addListenerVisible = true
          break
        case 'module':
          this.visibleModule = true
          break
        default:
          break
      }
    }
  },
  mounted() {
    if (process.env.IS_WEB) {
      window.addEventListener('beforeunload', e => {
        this.beforeunloadHandler(e)
      })
    }
  },
  created() {
    if (process.env.IS_ELECTRON) {
      window.api.receive('on-find', (data) => {
        console.log(`Received ${data} from main process`)
      })
      window.api.send('on-find', 'some data')
    }
  },
  destroyed() {
    if (process.env.IS_WEB) {
      window.removeEventListener('beforeunload', e => {
        e.preventDefault()
        this.beforeunloadHandler(e)
      })
    }
  },
  methods: {
    beforeunloadHandler(e) {
      e = e || window.event
      if (e) {
        e.returnValue = '您是否确认离开此页面?'
      }
      return '您是否确认离开此页面?'
    },
    // 激活post模块标签页
    handleactivePostTab() {
      this.$refs.sessionOp.activeTab('post_events')
    },
    send_click_event(tab, event) {
      // 当标签是监听器时，重画界面，修复错位
      switch (tab.name) {
        case 'listener':
          this.$refs.listener.fetchData()
          break
        case 'router_port':
          this.$refs.router_port.fetchData()
          break
        case 'sessions':
          this.$refs.sessions.fetchData()
          break
        case 'host':
          this.$refs.host.fetchData()
          break

        default:
          break
      }
    },
    // 处理打开命令终端tab
    handleOpenTerm(session) {
      this.$refs.sessionOp.addTabSession('cmd', session)
    },
    // 处理打开历史记录tab
    handleOpenHistory(session) {
      this.$refs.sessionOp.addTabSession('history', session)
    },
    // 处理打开文件管理tab
    handleOpenFileManage(session) {
      this.$refs.sessionOp.addTabSession('filemanage', session)
    },
    // 处理打开进程管理tab
    handleOpenProcess(session) {
      this.$refs.sessionOp.addTabSession('process', session)
    },
    // 处理打开进程管理tab
    handleOpenPostTab(session) {
      this.$refs.sessionOp.addTabSession('execpost', session)
    }
  }

}
</script>

<style>
.auto-column-size-table table {
  table-layout: auto;
}
.auto-column-size-table table colgroup col {
  display: none;
}

  .dashboard-container {
    height: calc(100vh - 84px);
  }
  .dashboard-main-container {
    height: calc(100vh - 84px);
  }
  .up-container {
    height: calc((100vh - 84px) * 0.5);
    border-bottom: 1px solid #EBEEF5;
  }
  .down-container {
    height: calc((100vh - 84px) * 0.5) - 24px;
  }
  .tab_page .el-tabs__item {
    height: 30px;
    font-size: 12px;
    line-height: 30px;
  }
  .tab_page .el-tabs__content {
   padding: 0px;
   height: calc((100vh - 84px) * 0.5);
   background-color: #fff!important;
  }
  .tab_page .el-tabs__header {
    background-color: #fff!important;
    margin-bottom: 0!important;
  }
</style>
