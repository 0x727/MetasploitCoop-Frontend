import request from '@/utils/request'

export function fetchRcScripts(id, opts) {
  return request({
    url: `/rcScripts/`,
    method: 'get'
  })
}

export function delRcScripts(id) {
  return request({
    url: `/rcScripts/${id}/`,
    method: 'delete'
  })
}

export function createRcScripts(opts) {
  return request({
    url: `/rcScripts/`,
    method: 'post',
    data: opts
  })
}

export function modifyRcScripts(id, opts) {
  return request({
    url: `/rcScripts/${id}/`,
    method: 'patch',
    data: opts
  })
}

export function fetchRcScriptsById(id, opts) {
  return request({
    url: `/rcScripts/${id}/`,
    method: 'get',
    data: opts
  })
}
