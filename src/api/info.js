import request from '@/utils/request'

/**
 * @description 获取msf版本信息
 */
export function getMsfVersion() {
  return request({
    url: '/infos/version/',
    method: 'get'
  })
}

/**
 * @description 获取msf模块数量信息
 */
export function getMsfModuleStats() {
  return request({
    url: '/modules/types/',
    method: 'get'
  })
}

/**
 * @description 获取msf后台线程信息
 */
export function getMsfBgThreads() {
  return request({
    url: '/infos/threadList/',
    method: 'get'
  })
}

/**
 * @description 获取 msf loots 文件列表
 */
export function getMsfCoreLoots() {
  return request({
    url: '/loots/',
    method: 'get'
  })
}

/**
 * @description 从 msf loots 目录下载一个文件
 * @param {String} filename 文件名
 */
export function downloadMsfCoreLoot(filename) {
  return request({
    url: `/loots/${filename}`,
    method: 'get',
    responseType: 'arraybuffer',
    params: { filename },
    onDownloadProgress: progressEvent => {
      // const percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total)
    }
  })
}

/**
 * @description 从 msf loot 目录删除一个文件
 * @param {String} filename 文件名
 */
export function delMsfCoreLoot(filename) {
  return request({
    url: `/loots/${filename}`,
    method: 'delete'
  })
}

/**
 * @description 上传一个文件到中转区
 * @param {Object} file 要上传的文件对象
 */
export function uploadMsfCoreLoot(file) {
  const formdata = new FormData()
  formdata.append('file', file.file)
  return request({
    url: '/loots/',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formdata,
    timeout: 0
  })
}

/**
 * @description 列编码器
 */
export function listEncoders() {
  return request({
    url: '/infos/encoders/',
    method: 'get'
  })
}

/**
 * @description 列平台系统
 */
export function listPlatforms() {
  return request({
    url: '/infos/platforms/',
    method: 'get'
  })
}

/**
 * @description 列编码器
 */
export function listEncodeFormats() {
  return request({
    url: '/infos/encodeformats/',
    method: 'get'
  })
}
