import request from '@/utils/request'

export function route_stop(route_id, data) {
  return request({
    url: `/route/${route_id}/`,
    method: 'delete',
    data: data
  })
}

export function route_list() {
  return request({
    url: '/route/',
    method: 'get'
  })
}

export function route_create(sid, address) {
  return request({
    url: '/route/',
    method: 'post',
    data: { sid: sid, address: address }
  })
}
