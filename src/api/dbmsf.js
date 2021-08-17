import request from '@/utils/request'

// 执行获取post模块执行结果， 执行成功返回的uuid
export function track_post_output(uuid) {
  return request({
    url: `/dbmsf/moduleResults/${uuid}/`,
    method: 'get'
  })
}

// 执行获取session的所有post模块执行结果
export function track_sid_post_output(sid) {
  return request({
    url: `sessions/${sid}/moduleResults/`,
    method: 'get'
  })
}

// 执行获取session的所有命令执行结果
export function track_sid_cmd_output_by_host(sid) {
  return request({
    url: `dbmsf/sessions/${sid}/history/`,
    method: 'get'
  })
}

// 执行获取session的所有post模块执行结果
export function track_sid_post_output_by_host(sid) {
  return request({
    url: `dbmsf/sessions/${sid}/modResults/`,
    method: 'get'
  })
}

// 执行获取creds结果
export function get_creds(params) {
  return request({
    url: `/dbmsf/creds/`,
    method: 'get',
    params: params
  })
}

export function get_loot(query) {
  return request({
    url: `/dbmsf/loots/`,
    method: 'get',
    params: query
  })
}
export function del_loot(row) {
  return request({
    url: `/dbmsf/loots/${row.id}`,
    method: 'delete'
  })
}
// 执行获取host列表
export function get_host(query) {
  return request({
    url: `/dbmsf/hosts/`,
    method: 'get',
    params: query
  })
}

// 执行获取host对应的session
export function getSessionByHostId(query) {
  return request({
    url: `/dbmsf/hosts/${query.sid}/sessions/`,
    method: 'get'
  })
}

export function del_host(id) {
  return request({
    url: `/dbmsf/hosts/${id}`,
    method: 'delete'
  })
}

export function session_edit_desc(db_id, desc) {
  return request({
    url: `/dbmsf/sessions/${db_id}/`,
    method: 'patch',
    data: { desc: desc }
  })
}
