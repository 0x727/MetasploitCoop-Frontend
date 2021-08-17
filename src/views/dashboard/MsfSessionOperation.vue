<template>
  <div class="msf-session-operation">
    <!-- 下 -->
    <el-tabs v-model="editableTabsValue" type="card" :closable="false" style="height: 100%" class="tab_page_d" @edit="handleTabsEdit">
      <el-tab-pane
        name="events"
        style="min-height: 100%;"
        :closable="false"
      >
        <span slot="label">
          <svg-icon icon-class="comment-alt" />
          事件列表
        </span>
        <MsfSessionEvent />
      </el-tab-pane>
      <el-tab-pane
        name="post_events"
        style="min-height: 100%;"
        :closable="false"
      >
        <span slot="label">
          <svg-icon icon-class="comment-alt" />
          模块事件
        </span>
        <MsfPostEvent />
      </el-tab-pane>
      <el-tab-pane
        v-for="(item, index) in editableTabs"
        :key="item.name+index"
        :label="item.title + '['+item.session.id+']'"
        :name="item.name"
        :stretch="true"
        style="height: 100%"
        :closable="true"
      >
        <!-- 添加图标 -->
        <span slot="label">
          <svg-icon :icon-class="item.icon" />
          {{ '|@' + item.title + '['+item.session.id+']' }}
        </span>
        <MsfSessionMeterpreterTerm
          v-if="item.tabType === tabFlag.cmd.tabType"
          :term-title="item['session_host'] +' '+ item['info']"
          :session="item.session"
        />
        <MsfSessionConsole v-if="item.tabType === tabFlag.console.tabType" />
        <MsfSessionFilemanage v-if="item.tabType === tabFlag.filemanage.tabType" :session="item.session" />
        <MsfSessionProcess v-if="item.tabType === tabFlag.process.tabType" :session="item.session" />
        <MsfCoreFileTransit v-if="item.tabType === tabFlag.transit.tabType" />
        <PostTab v-if="item.tabType === tabFlag.execpost.tabType" :id="Number(item.session.id)" :platform="item.platform" />
        <MsfPostEventHistory v-if="item.tabType === tabFlag.history.tabType" :session="item.session" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import MsfSessionMeterpreterTerm from '@/views/zSessionMeterpreterTerm/SessionMeterpreterTerm'
import MsfSessionFilemanage from '@/views/zSessionFilemanage/SessionFilemanage'
import MsfSessionProcess from '@/views/zSessionProcess/SessionProcess'
import MsfCoreFileTransit from '@/views/zFileTransit'
import MsfSessionEvent from '@/views/zSessionEvent/SessionEvent'
import MsfSessionConsole from '@/views/zSessionConsole'
import MsfPostEvent from '@/views/zPostEvent'
import PostTab from '@/components/web/Module/PostTab'
import MsfPostEventHistory from '@/views/zPostEventHistory'
import key from 'keymaster'

const cmdTabType = 'cmd'
const filemanageTabType = 'filemanage'
const processTabType = 'process'
const transitTabType = 'transit'
const eventsTabType = 'events'
const consoleTabType = 'console'
const execpostTabType = 'execpost'
const historyTabType = 'history'

export default {
  name: 'MsfSessionOperation',
  components: {
    MsfSessionMeterpreterTerm,
    MsfSessionFilemanage,
    MsfSessionProcess,
    MsfCoreFileTransit,
    MsfSessionEvent,
    MsfSessionConsole,
    MsfPostEvent,
    MsfPostEventHistory,
    PostTab
  },
  data() {
    return {
      editableTabsValue: 'events', // 当前tab页
      editableTabs: [],
      tabFlag: {
        'cmd': { title: '命令终端', tabType: cmdTabType, icon: 'terminal' },
        'filemanage': { title: '文件管理', tabType: filemanageTabType, icon: 'file' },
        'process': { title: '进程管理', tabType: processTabType, icon: 'tasks' },
        'transit': { title: '文件中转', tabType: transitTabType, icon: 'sync' },
        'events': { title: '事件列表', tabType: eventsTabType, icon: 'terminal' },
        'console': { title: '交互命令行', tabType: consoleTabType, icon: 'terminal' },
        'execpost': { title: '执行模块', tabType: execpostTabType, icon: 'cubes' },
        'history': { title: '历史记录', tabType: historyTabType, icon: 'tasks' }
      }
    }
  },
  created() {

  },
  mounted() {
    const that = this
    key('ctrl+w', function() { that.closeTab() })
  },
  methods: {
    closeTab() {
      this.editableTabs = this.editableTabs.filter(item => {
        return item.name !== this.editableTabsValue
      })
      this.editableTabsValue = 'events'
    },
    activeTab(tabName) {
      this.editableTabsValue = tabName
    },
    addTabSession(tabFlagKey, session) {
      // 判断tab是否已添加
      for (const item of this.editableTabs) {
        if (item.name === tabFlagKey + session.id && tabFlagKey !== execpostTabType) {
          this.editableTabsValue = tabFlagKey + session.id
          return
        }
      }
      let tabName = tabFlagKey + session.id
      if (tabFlagKey === execpostTabType) {
        tabName = tabFlagKey + session.id + Date()
      }
      this.editableTabs.push({
        title: this.tabFlag[tabFlagKey].title,
        tabType: this.tabFlag[tabFlagKey].tabType,
        session: session,
        name: tabName,
        session_host: session.session_host || '历史记录',
        info: session.info || '@',
        platform: session.platform,
        icon: this.tabFlag[tabFlagKey].icon
      })
      this.editableTabsValue = tabName
    },
    handleTabsEdit(targetName, action) {
      if (action === 'remove') {
        const tabs = this.editableTabs
        let activeName = this.editableTabsValue
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (activeName === targetName) {
              const nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.name
              }
            }
          })
        }
        this.editableTabsValue = activeName
        this.editableTabs = tabs.filter(tab => tab.name !== targetName)
        if (this.editableTabs.length === 0) {
          this.editableTabsValue = 'events'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .msf-session-operation {
    height: calc((100vh - 84px) * 0.5) - 24px;
  }
  .tab_page_d >>> .el-tabs__item {
    height: 30px;
    font-size: 12px;
    line-height: 30px;
  }
  .tab_page_d >>> .el-tabs__content {
   padding: 0px;
   height: 100%;
  }
  .tab_page_d >>> .el-tabs__header {
    background-color: #fff!important;
    margin-bottom: 0!important;
  }
  .tab_page_d >>>.el-tabs__content{
    background-color: #fff!important;
  }
</style>
