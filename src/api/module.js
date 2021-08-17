import request from '@/utils/request'

export function modules_fetch(query) {
  return request({
    url: '/modules/usable/fullnames/',
    method: 'get',
    params: Object.assign({}, query)
  })
}

export function modules_ref_names(query) {
  return request({
    url: '/modules/ref_names/',
    method: 'get',
    params: Object.assign({}, query)
  })
}

export function module_exploits(ref_name) {
  return request({
    url: '/modules/compatible-payloads/',
    method: 'get',
    params: { ref_name: ref_name }
  })
}

// 返回指定exploit可用的payload
export function module_compatible_payloads(ref_name, target) {
  return request({
    url: '/modules/compatible-payloads/',
    method: 'get',
    params: { ref_name: ref_name, target: target }
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

// 生产木马
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

export function fetch_mod_config(id, opts) {
  return request({
    url: `/modConfig/`,
    method: 'get'
  })
}

export function del_mod_config(id) {
  return request({
    url: `/modConfig/${id}/`,
    method: 'delete'
  })
}

export function create_mod_config(opts) {
  return request({
    url: `/modConfig/`,
    method: 'post',
    data: opts
  })
}

export function modify_config(id, opts) {
  return request({
    url: `/modConfig/${id}/`,
    method: 'patch',
    data: opts
  })
}

export function fetch_mod_config_by_id(id, opts) {
  return request({
    url: `/modConfig/${id}/`,
    method: 'get',
    data: opts
  })
}

// 返回模块的option
export function module_info(fullname) {
  return request({
    url: `/modules/info/?fullname=${fullname}`,
    method: 'get'
  })
}

export function refresh_module_cache() {
  return request({
    url: `/modules/refreshModuleCache/`,
    method: 'post'
  })
}
