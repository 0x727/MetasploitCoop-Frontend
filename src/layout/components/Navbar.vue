<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />
    <div class="navbar-left-menu">
      <!-- margin-top: 36px; -->
      <!-- icon按钮工具条 -->
      <el-divider direction="vertical" />
      <el-col :span="2" />
      <div v-for="(item, index) in iconBtns" :key="index" style="display:inline; margin-top: 36px;">
        <el-tooltip effect="dark" :content="item.name" placement="bottom">
          <el-button
            :icon="item.iconClass"
            size="mini"
            @click="item.action"
          >{{ item.name }}</el-button>
        </el-tooltip>
        <el-divider v-if="index !== iconBtns.length - 1" direction="vertical" />
      </div>
    </div>
    <div class="navbar-right-menu">
      <div class="navbar-right-menu-item">
        <el-switch
          v-model="isEnableProxy"
          name="代理开关"
          style="display: block"
          inactive-text="代理开关"
          active-color="#13ce66"
          inactive-color="#ff4949"
          @change="switchEnabled"
        />
      </div>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              个人中心
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { msf_version } from '@/api/msf'
import clip from '@/utils/clipboard' // use clipboard directly
import clipboard from '@/directive/clipboard/index.js' // use clipboard by v-directive
import { getToken } from '@/utils/auth'
import store from '@/store'
import { fetch_mod_config, modify_config } from '@/api/module'

export default {
  directives: {
    clipboard
  },
  components: {
    Breadcrumb,
    Hamburger
    // WorkspaceSelect
  },
  data() {
    return {
      isEnableProxy: true,
      iconBtns: [
        {
          iconClass: 'el-icon-folder',
          name: '文件中转区',
          action: this.handleOpenTransit
        },
        {
          iconClass: 'el-icon-circle-plus',
          name: '添加监听',
          action: this.handleAddListener
        },
        {
          iconClass: 'el-icon-s-platform',
          name: '终端',
          action: this.handleOpenConsole
        },
        {
          iconClass: 'el-icon-box',
          name: '执行模块',
          action: this.handleOpenModuleTab
        }
      ],
      token: getToken()
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'toolbar_events'
    ])
  },
  watch: {
    // 工具条事件
    toolbar_events(action) {
      const { event } = action
      switch (event) {
        case 'switch_change':
          this.fetchMsfVersion()
          break
        default:
          break
      }
    }
  },
  created() {
    this.fetchMsfVersion()
  },
  methods: {
    async switchEnabled(value) {
      localStorage.setItem('isEnableProxy', value)
      await fetch_mod_config().then(response => {
        response.data.forEach(list => {
          if (list.config['PROXIES']) {
            list['is_enabled'] = value
            modify_config(list.id, list)
            this.$notify({
              title: `${value ? '开启' : '关闭'}全局代理`,
              message: `模块选项的PROXIES将${value ? '会' : '不会'}设置为：` + list.config['PROXIES'],
              type: 'success',
              position: 'bottom-right'
            })
          }
        })
      })
    },
    // 打开文件中转区
    handleOpenTransit() {
      const event = {
        event: 'transit',
        id: 0,
        times: new Date().toISOString()
      }
      store.dispatch('toolbar_events/change_events', event)
    },
    handleOpenConsole() {
      const event = {
        event: 'console',
        times: new Date().toISOString(),
        id: 0
      }
      store.dispatch('toolbar_events/change_events', event)
    },
    handleOpenModuleTab() {
      const event = {
        event: 'module',
        times: new Date().toISOString(),
        id: 0
      }
      store.dispatch('toolbar_events/change_events', event)
    },
    handleAddListener() {
      const event = {
        event: 'listener',
        times: new Date().toISOString(),
        id: 0
      }
      store.dispatch('toolbar_events/change_events', event)
    },
    handleCopy(text, event) {
      clip(text, event)
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async fetchMsfVersion() {
      await msf_version().then(
        response => {
          const { data } = response
          this.msfversion = data.metasploit_version
        }
      ).catch(() => {
        console.log('error')
      })
      await fetch_mod_config().then(response => {
        response.data.forEach(list => {
          if (list.config['PROXIES']) {
            this.isEnableProxy = list['is_enabled']
          }
        })
      })
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .navbar-right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .navbar-right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 20px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
    .navbar-left-menu {
    float: left;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .navbar-left-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 20px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }

}
</style>
