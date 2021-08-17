import request from '@/utils/request'

export function credentials_fetch(query) {
  return request({
    url: '/credentials',
    method: 'get'
  })
}

export function credentials_create(data) {
  return request({
    url: '/credentials',
    method: 'post',
    data: data
  })
}

export function credentials_modify(data) {
  return request({
    url: '/credentials',
    method: 'put',
    data: data
  })
}

export function credentials_delete(data) {
  return request({
    url: '/credentials',
    method: 'delete',
    data: data
  })
}
