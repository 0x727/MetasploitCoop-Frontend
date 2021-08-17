/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * @param {string} ip
 * @returns {Boolean}
 */
export function isIpv4(ip) {
  return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(ip)
}

/**
 * @param {string} ip
 * @returns {Boolean}
 */
export function isIpv4Range(ip) {
  return /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$|^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\-([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(ip)
}

const validateIpv4Range = (rule, value, callback) => {
  if (!isIpv4Range(value) && !isIpv4(value)) {
    callback(new Error('请输入IP地址或者一个范围'))
  } else {
    callback()
  }
}
const validateIpv4 = (rule, value, callback) => {
  if (!isIpv4(value)) {
    callback(new Error('请输入IP地址'))
  } else {
    callback()
  }
}
// 写成对象才能定义调用
const validator = {
  validateIpv4: validateIpv4,
  validateIpv4Range: validateIpv4Range
}
export default validator
