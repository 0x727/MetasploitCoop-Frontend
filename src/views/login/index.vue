<template>
  <div class="login-container">
    <el-form v-show="!is_server_set" ref="settingForm" :model="settingForm" :rules="settingRules" auto-complete="on" label-position="left" class="login-form">
      <el-form-item prop="server_host">
        <span class="svg-container">
          <svg-icon icon-class="server" />
        </span>
        <el-input
          ref="server_host"
          v-model="settingForm.server_host"
          placeholder="后端服务器地址"
          name="server_host"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="settingForm.username"
          placeholder="基础认证用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="settingForm.password"
          :type="passwordType"
          placeholder="基础认证密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleSetServer"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleSetServer">验证并保存设置</el-button>
    </el-form>
    <el-button v-show="is_server_set" :loading="loading" type="info" style="width:100%;margin-bottom:30px;" @click="is_server_set = false">修改服务器地址</el-button>

    <el-tabs v-show="is_server_set" v-model="activeName" class="login-form" :stretch="true">
      <el-tab-pane name="login">
        <span slot="label"><i class="tab">登录</i> </span>
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" auto-complete="on" label-position="left">
          <el-form-item prop="username">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              ref="username"
              v-model="loginForm.username"
              placeholder="用户名"
              name="username"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>

          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="密码"
              name="password"
              tabindex="2"
              auto-complete="on"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="注册" name="fourth">
        <span slot="label"><i class="tab">注册</i> </span>
        <el-form ref="registerForm" :model="registerForm" :rules="loginRules" auto-complete="on" label-position="left">
          <el-form-item prop="username">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              ref="username"
              v-model="registerForm.username"
              placeholder="用户名"
              name="username"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>

          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="registerForm.password"
              :type="passwordType"
              placeholder="密码"
              name="password"
              tabindex="2"
              auto-complete="on"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="registerForm.confirm_password"
              :type="passwordType"
              placeholder="重复上一个密码"
              name="password"
              tabindex="3"
              auto-complete="on"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleRegister">注册</el-button>

        </el-form>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
// import { validUsername } from '@/utils/validate'
import { user_login, user_register } from '@/api/user'
import { showMsg } from '@/utils/util'
import { Message } from 'element-ui'
import axios from 'axios'
export default {
  name: 'Login',
  data() {
    return {
      is_server_set: false,
      activeName: 'login',
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: '',
        confirm_password: ''
      },
      settingForm: {
        server_host: localStorage.getItem('SERVER_HOST') || window.location.origin,
        username: '',
        password: ''
      },
      loginRules: {
        // username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        // password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      settingRules: {
        // username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        // password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    if (localStorage.getItem('SERVER_HOST', '') === null || localStorage.getItem('SERVER_HOST', '') === 'undefined') {
      this.activeName = 'setting'
      this.is_server_set = false
    } else {
      this.is_server_set = true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    async handleLogin() {
      await user_login(this.loginForm).then(response => {
        if (response.status === 403) {
          showMsg(this, response.data.message.detail)
          return false
        }
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.$store.dispatch('user/login', this.loginForm).then(() => {
              this.$router.push({ path: this.redirect || '/' })
              this.loading = false
            }).catch(() => {
              this.loading = false
            })
          } else {
            return false
          }
        })
      })
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true
          user_register(this.registerForm).then(response => {
            const { status, data } = response
            if (status === 400) {
              showMsg(this, data.data.username[0], 'error')
            } if (data['is_active']) {
              showMsg(this, '注册成功')
              this.activeName = 'login'
              this.loginForm.username = data['username']
            }
            this.loading = false
          }).catch(
            this.loading = false
          )
        } else {
          return false
        }
      })
    },
    handleSetServer() {
      const that = this
      var url = this.settingForm['server_host']
      if (url.endsWith('/')) { url = url.slice(0, -1) }
      axios({ method: 'post', url: url + '/api/v1/auth/login/',
        data: { username: '', password: '' },
        auth: {
          username: this.settingForm.username,
          password: this.settingForm.password
        }})
        .then(function(response) {
          if (response.data && response.message) {
            console.log(response.data)
          }
        })
        .catch(function(error) {
          if (error.message === 'Request failed with status code 403') {
            Message({
              message: '正在设置服务器地址为：' + that.settingForm['server_host'],
              type: 'success',
              duration: 3000
            })
            localStorage.setItem('SERVER_HOST', that.settingForm['server_host'])
            localStorage.setItem('TokenAuthorization', error.config.headers.Authorization)
            setTimeout(() => {
              that.$router.go(0)
            }, 1500)
          } else {
            Message({
              message: '请检查后端服务器地址和帐号密码是否正确！',
              type: 'error',
              duration: 3000
            })
          }
          console.log(error)
        })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;
.tab {
    font-size: 20px;
    color: #fff;
};
.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
