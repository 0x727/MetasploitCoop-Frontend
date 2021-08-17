import request from '@/utils/request'

export function user_login(data) {
  return request({
    url: '/auth/login/',
    method: 'post',
    data
  })
}

export function user_info(token) {
  return request({
    url: '/auth/info/',
    method: 'get'
    // params: { token }
  })
}

export function switch_register(isclosed) {
  return request({
    url: '/auth/switchRegister/',
    method: 'patch',
    data: { close: isclosed }
  })
}

export function user_logout() {
  return request({
    url: '/auth/logout/',
    method: 'delete'
  })
}

export function user_register(data) {
  return request({
    url: '/auth/register/',
    method: 'post',
    data
  })
}

export function user_list(data) {
  return request({
    url: '/auth/',
    method: 'get',
    data
  })
}

export function user_del(id) {
  return request({
    url: `/auth/${id}/`,
    method: 'delete'
  })
}

export function user_modify_password(id, value) {
  return request({
    url: `/auth/${id}/`,
    method: 'patch',
    data: { 'password': value, 'confirm_password': value }
  })
}
