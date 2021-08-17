import request from '@/utils/request'
export function job_stop(job_id) {
  return request({
    url: `/jobs/${job_id}/`,
    method: 'delete'
  })
}

export function job_list() {
  return request({
    url: '/jobs/',
    method: 'get'
  })
}

export function job_info(job_id) {
  return request({
    url: '/jobs/',
    method: 'get'
  })
}
