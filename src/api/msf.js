import request from '@/utils/request'

export function msf_version() {
  return request({
    url: '/infos/version/',
    method: 'get'
    // data
  })
}
