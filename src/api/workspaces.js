import request from '@/utils/request'

export function workspaces_fetch() {
  return request({
    url: '/workspaces',
    method: 'get'
  })
}
