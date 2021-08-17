import request from '@/utils/request'

export function chatRecord() {
  return request({
    url: '/synergy/chatRecord/',
    method: 'get'
    // data
  })
}
