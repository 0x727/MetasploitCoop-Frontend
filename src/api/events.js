import request from '@/utils/request'
export function events_fetch(query) {
  return request({
    url: '/logs/',
    method: 'get',
    params: query
  })
}

export function events_create(data) {
  return request({
    url: '/events',
    method: 'post',
    data: data
  })
}

export function events_modify(data) {
  return request({
    url: '/events',
    method: 'put',
    data: data
  })
}

export function events_delete(data) {
  return request({
    url: '/events',
    method: 'delete',
    data: data
  })
}
