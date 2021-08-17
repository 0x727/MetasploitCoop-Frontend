import request from '@/utils/request'

export function session_list() {
  return request({
    url: '/sessions/',
    method: 'get'
  })
}
/**
 * @description migrate the server to another process
 * @param {Object} data
 */
export function processMigrate(data) {
  const { sid, pid } = data
  const command = `migrate ${pid}`
  const reqData = {
    sid: sid,
    command: command
  }
  return commandExecute(reqData)
}

/**
 * @description execute application
 * @param {Object} data
 */
export function executeApplication(sid, path, args) {
  let command = `execute -f "${path}"`
  if (args === '-H') { command = command + ' -H' }
  if (args !== null && args !== '-H') { command = command + ` -a "${args}"` }
  const reqData = {
    sid: sid,
    command: command
  }
  return commandExecute(reqData)
}

/**
 * @description execute command
 * @param {Object} data
 */
export function commandExecute(data) {
  const { sid, command } = data
  return request({
    url: `/sessions/${sid}/executeCmd/`,
    method: 'post',
    data: { command }
  })
}
/**
 * @description kill a process
 * @param {Object} data
 */
export function processKill(data) {
  const { sid, pid } = data
  const command = `kill ${pid}`
  const reqData = {
    sid: sid,
    command: command
  }
  return commandExecute(reqData)
}

/**
 * @description steal_token
 * @param {Object} data session { sid, pid }
 */
export function processStealToken(data) {
  const { sid, pid } = data
  const command = `steal_token ${pid}`
  const reqData = {
    sid: sid,
    command: command
  }
  return commandExecute(reqData)
}

/**
 * @description call RevertToSelf on remote machine
 * @param {Object} data
 */
export function processRev2self(data) {
  const { sid } = data
  const command = `rev2self`
  const reqData = {
    sid: sid,
    command: command
  }
  return commandExecute(reqData)
}
/**
 * @description get session process list
 * @param {Object} data
 */
export function processList(data) {
  const { sid } = data
  return request({
    url: `/sessions/${sid}/procList/`,
    method: 'get'
  })
}

/**
 * @description auto complete command form msf
 * @param {Object} data
 */
export function commandAutoComplete(data) {
  const { sid, command } = data
  return request({
    url: `/sessions/${sid}/cmdAutocomplete/`,
    method: 'get',
    params: { command }
  })
}

/**
 * @description list dir of session
 * @param {Object} data
 */
export function dirList(data) {
  const { sid, dirpath } = data
  return request({
    url: `/sessions/${sid}/dirList/`,
    method: 'get',
    params: { dirpath }
  })
}

/**
 * @description get file content
 * @param {Object} data
 */
export function catFile(data) {
  const { sid, filepath } = data
  return request({
    url: `/sessions/${sid}/catFile/`,
    method: 'get',
    params: { filepath }
  })
}

/**
 * @description edit file
 * @param {Object} data
 */
export function editFile(data) {
  const { sid, filepath, filetext } = data
  return request({
    url: `/sessions/${sid}/editFile/`,
    method: 'patch',
    data: { filepath, filetext }
  })
}

/**
 * @description 上传文件到目标机
 * @param {Object} data 参数数据
 */
export function uploadFileToTarget(data) {
  const { sid, src, dest } = data
  return request({
    url: `sessions/${sid}/uploadFile/`,
    method: 'post',
    data: { src, dest }
  })
}

/**
 * @description make directory
 * @param {Object} data
 */
export function mkdir(data) {
  const { sid, dirpath } = data
  const command = `mkdir ${dirpath}`
  const reqData = {
    sid: sid,
    command: command
  }
  return commandExecute(reqData)
}

/**
 * @description del file or dir
 * @param {Object} data
 */
export function delFile(data) {
  const { sid, paths } = data
  return request({
    url: `sessions/${sid}/delFile/`,
    method: 'delete',
    data: { paths: paths }
  })
}

/**
 * @description stop a session from msf sessions
 * @param {Number} sid session id
 */
export function stopMsfSession(sid) {
  return request({
    url: `/sessions/${sid}/`,
    method: 'delete'
  })
}

/**
 * @description stop a session from msf sessions
 * @param {Number} sid session id
 */
export function MsfSessionScreenshot(sid) {
  return request({
    url: `/sessions/${sid}/screenshot/`,
    method: 'get'
  })
}

/**
 * @description stop a session from msf sessions
 * @param {Number} sid session id
 */
export function MsfSessionMeterpreterTermHistory(sid) {
  return request({
    url: `/sessions/${sid}/events/`,
    method: 'get'
  })
}

/**
 * @description get session process list
 * @param {Object} data
 */
export function downloadFile(sid, src) {
  return request({
    url: `/sessions/${sid}/downloadFile/`,
    method: 'get',
    params: { src: src }
  })
}

/**
 * @description get session history
 * @param {Object} data
 */
export function historyAndPost(sid) {
  return request({
    url: `/sessions/${sid}/history/`,
    method: 'get'
  })
}
