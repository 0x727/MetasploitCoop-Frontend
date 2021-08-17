export const formatDate = (str) => {
  if (!str) return ''
  var date = new Date(str)
  var time = new Date().getTime() - date.getTime() // 现在的时间-传入的时间 = 相差的时间（单位 = 毫秒）
  if (time < 0) {
    return ''
  } else if ((time / 1000 < 30)) {
    return '刚刚'
  } else if (time / 1000 < 60) {
    return parseInt((time / 1000)) + 's'
  } else if ((time / 60000) < 60) {
    return parseInt((time / 60000)) + 'm'
  } else if ((time / 3600000) < 24) {
    return parseInt(time / 3600000) + 'h'
  } else if ((time / 86400000) < 31) {
    return parseInt(time / 86400000) + 'd'
  } else if ((time / 2592000000) < 12) {
    return parseInt(time / 2592000000) + 'M'
  } else {
    return parseInt(time / 31536000000) + 'y'
  }
}

/**
 * @description 时间简化
 * @param {String} 长字符串
 */
export function timesFormat(Times) {
  if (!Times) {
    return ''
  }
  if (Times.includes('.')) {
    return Times.split('.')[0]
  }
  return Times
}
