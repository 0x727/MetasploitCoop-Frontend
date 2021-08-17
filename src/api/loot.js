import request from '@/utils/request'

// 中转文件
/**
 * @description 获取 msf loots 文件列表
 */
export function getMsfCoreLoots(path) {
  return request({
    url: '/loots/',
    method: 'get',
    params: path
  })
}

/**
 * @description 从 msf loots 目录下载一个文件
 * @param {String} path 文件名
 */
export function downloadMsfCoreLoot(path) {
  return request({
    url: `/loots/download/`,
    method: 'post',
    responseType: 'arraybuffer',
    data: { path },
    onDownloadProgress: progressEvent => {
      // const percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total)
    }
  })
}

/**
 * @description 从 msf loot 目录删除一个文件
 * @param {String} path 文件名
 */
export function delMsfCoreLoot(path) {
  return request({
    url: `/loots/delete/`,
    method: 'post',
    data: { path }
  })
}

/**
 * @description 上传一个文件到中转区
 * @param {Object} file 要上传的文件对象
 */
export function uploadMsfCoreLoot(file, dir) {
  const formdata = new FormData()
  formdata.append('file', file.file)
  formdata.append('dir', dir)
  return request({
    url: '/loots/',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formdata,
    timeout: 0
  })
}

/**
 * @description 从 msf loot 目录删除一个文件
 * @param {String} path 文件名
 */
export function previewMsfCoreLoot(data) {
  return request({
    url: `/loots/preview/`,
    method: 'post',
    data: data
  })
}

/**
 * @description 从 msf loot 直链下载一个文件
 * @param {String} path 文件名
 * @param {Number} expire 超时
 */
export function createDownloadLink(data) {
  return request({
    url: `/loots/createDownloadLink/`,
    method: 'post',
    data: data
  })
}
