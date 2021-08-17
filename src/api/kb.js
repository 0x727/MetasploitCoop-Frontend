import request from '@/utils/request'

export function kb_modules_fetch(query) {
  return request({
    url: '/kb/msfModuleManuals/',
    method: 'get',
    params: Object.assign({}, query)
  })
}

export function kb_modules_edit(data) {
  return request({
    url: `/kb/msfModuleManuals/${data.id}/`,
    method: 'get',
    data: Object.assign({}, data)
  })
}

export function kb_focus_keywords_all(query) {
  return request({
    url: '/kb/focusKeywords/all/',
    method: 'get',
    params: Object.assign({}, query)
  })
}
export function kb_focus_keywords(query) {
  return request({
    url: '/kb/focusKeywords/',
    method: 'get',
    params: Object.assign({}, query)
  })
}
export function edit_keywords(data) {
  return request({
    url: `/kb/focusKeywords/${data.id}/`,
    method: 'patch',
    data: Object.assign({}, data)
  })
}
export function del_keywords(data) {
  return request({
    url: `/kb/focusKeywords/${data.id}/`,
    method: 'delete'
  })
}
// 创建关键词
export function create_keywords(data) {
  return request({
    url: '/kb/focusKeywords/',
    method: 'post',
    data: Object.assign({}, data)
  })
}
export function kb_focus_keywords_categories(query) {
  return request({
    url: '/kb/focusKeywords/categories/',
    method: 'get',
    params: Object.assign({}, query)
  })
}

// 返回模块的option
export function module_options(ref_name) {
  return request({
    url: '/modules/options/',
    method: 'get',
    params: { ref_name: ref_name }
  })
}

// 执行一个模块
// #  opts = { 'LHOST' => '0.0.0.0', 'LPORT'=> 6669, 'PAYLOAD'=> 'windows/meterpreter/reverse_tcp' }
// #  rpc.call('module.execute', 'exploit', 'multi/handler', opts)
export function module_execute(opts) {
  return request({
    url: '/jobs/',
    method: 'post',
    data: opts
  })
}

// 生成木马
export function gen_stagers(id, opts) {
  return request({
    url: `/jobs/${id}/genStagers/`,
    method: 'post',
    responseType: 'arraybuffer',
    data: opts
  })
}

// 执行post
// 模块id
export function call_post(id, opts) {
  return request({
    url: `/modules/${id}/execute/`,
    method: 'post',
    data: opts
  })
}

// 获取菜单
export function kb_context_menu(query) {
  return request({
    url: `/kb/contextMenu/`,
    method: 'get',
    params: Object.assign({}, query)
  })
}

// 创建菜单
export function edit_context_menu(data) {
  return request({
    url: `/kb/contextMenu/${data.id}/`,
    method: 'patch',
    data: Object.assign({}, data)
  })
}
export function del_context_menu(data) {
  return request({
    url: `/kb/contextMenu/${data.id}/`,
    method: 'delete'
  })
}
// 创建右键菜单
export function create_context_menu(data) {
  return request({
    url: '/kb/contextMenu/',
    method: 'post',
    data: Object.assign({}, data)
  })
}

// 获取右键菜单树
export function tree_context_menu(data) {
  return request({
    url: '/kb/contextMenu/tree/',
    method: 'get'
  })
}
