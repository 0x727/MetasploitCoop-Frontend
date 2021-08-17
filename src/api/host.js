import request from '@/utils/request'
export function host_fetch(query) {
  return request({
    url: '/hosts',
    method: 'get'
  })
}

export function host_create(data) {
  return request({
    url: '/hosts',
    method: 'post',
    data: data
  })
}

export function host_modify(data) {
  return request({
    url: '/hosts',
    method: 'put',
    data: data
  })
}

export function host_delete(data) {
  return request({
    url: '/hosts',
    method: 'delete',
    data: data
  })
}
