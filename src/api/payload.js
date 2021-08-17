import request from '@/utils/request'

export function get_payload() {
  return request({
    url: '/payload/',
    method: 'get'
    // data
  })
}
export function generate_payload(plugin, data) {
  return request({
    url: `/payload/${plugin}/generate/`,
    method: 'post',
    responseType: 'arraybuffer',
    data: data
  })
}
