import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { Uint8ArrayToObject } from '@/utils/util'

let service
// create an axios instance
let service_host = localStorage.getItem('SERVER_HOST')
if (service_host && service_host.startsWith('app://')) { window.location.reload() }
if (service_host && service_host.endsWith('/')) { service_host = service_host.slice(0, -1) }
if (service_host) {
  service = axios.create({
    baseURL: service_host + process.env.VUE_APP_BASE_API, // url = base url + request url
    // url: process.env.VUE_APP_BASE_API,
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 0 // request timeout
  })
} else {
  service = axios.create({
    baseURL: service_host + process.env.VUE_APP_BASE_API, // url = base url + request url
    // url: process.env.VUE_APP_BASE_API,
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 0 // request timeout
  })
  // window.location.reload()
}

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    config.headers['Authorization'] = localStorage.getItem('TokenAuthorization')
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    // Message({
    //   message: config || 'Error',
    //   type: 'error',
    //   duration: 30 * 1000
    // })
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  function(response) {
    var res = null
    if (response.request.responseType === 'arraybuffer') {
      if (response.headers['content-type'].toLowerCase().includes('application/json')) {
        res = Uint8ArrayToObject(response.data)
      } else {
        return response.data
      }
    } else {
      res = response.data
    }
    // console.log(response)
    if (response.status === 204) {
      return response.status
    }
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 30 * 1000
      })
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  function(error) {
    Message(error.response.statusText)
    return error.response
  }
)

export default service
