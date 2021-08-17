/**
 * @description convert ArrayBuffer to String
 * @param {ArrayBuffer} buf the buffer which you want to convert it to String
 */
export function Uint8ArrayToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

export function arrayBufferToBinary(buffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[ i ])
  }
  return (binary)
}
/**
 * @description convert ArrayBuffer to json Object
 * @param {ArrayBuffer} buf the buffer which you want to convert it to json Object
 */
export function Uint8ArrayToObject(buf) {
  return JSON.parse(arrayBufferToBinary(buf))
}

/**
 * @description download blob to file
 * @param {ArrayBuffer} data
 * @param {String} filename
 */
export function downloadBlob(data, filename) {
  const link = document.createElement('a')
  const blob = new Blob([data], { type: 'application/x-msdownload' })
  const objectUrl = URL.createObjectURL(blob) // 创建URL
  link.href = objectUrl
  link.download = filename // 自定义文件名
  link.click() // 下载文件
  URL.revokeObjectURL(objectUrl) // 释放内存
}

/**
 * @description validate ref and call the callback function
 * @param {Object} ref
 * @param {Object} callback
 */
export function validateRef(ref, callback) {
  ref.validate(valid => {
    if (valid) {
      callback()
    }
  })
}

/**
 * @description convert json map to list for v-for
 * @param {Object} data json map
 * @returns {Array} [{ k: 'xx', v: 'xx' }]
 */
export function convertJson2List(data) {
  var datalist = []
  for (var k in data) {
    datalist.push({
      k: k,
      v: data[k]
    })
  }
  return datalist
}

/**
 * @description convert file size from byte to human-readable format
 * @param {Number} bytes file size byte
 * @returns {String}
 */
export function fileSizeFormat(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  // toPrecision(3) 后面保留一位小数，如1.0GB
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

function genTreeChild(data, idKey, pidKey, nodeList) {
  nodeList.forEach(element => {
    element.children = data.filter(item => {
      return item[pidKey] === element[idKey]
    })
    if (element.children.length > 0) {
      genTreeChild(data, idKey, pidKey, element.children)
    }
  })
}

function getRootNodes(data, idKey, pidKey) {
  let rootNodes = []
  const rootIds = new Map()
  data.forEach(item => {
    // id和pid值不一样的纳入map
    if (item[idKey] !== item[pidKey]) {
      rootIds.set(item[idKey], true)
    }
  })
  rootNodes = data.filter(item => {
    // 没有父节点并且id和pid值不一样
    return !rootIds.has(item[pidKey]) && item[idKey] !== item[pidKey]
  })
  return rootNodes
}

/**
 * @description convert array list to tree data
 * @param {Array} data the array list which you want to convert to tree
 * @param {String} idKey the key that represents the ID
 * @param {String} pidKey the key that represents the parent ID
 */
export function genTree(data, idKey, pidKey) {
  const resultTree = []
  const baseNodes = getRootNodes(data, idKey, pidKey)
  resultTree.push(...baseNodes)
  genTreeChild(data, idKey, pidKey, resultTree)
  return resultTree
}

/**
 * @description 一连串路径转化为树
 */
export function pathToTree(data, sort = {}) {
  const root = []
  for (let i = 0; i < data.length; i++) {
    const chain = data[i].split('/')
    let currentHierarchy = root
    for (let j = 0; j < chain.length; j++) {
      const wantedNode = chain[j]
      if (wantedNode === '') {
        continue
      }
      const lastHierarchy = currentHierarchy

      // 遍历root是否已有该层级
      for (let k = 0; k < currentHierarchy.length; k++) {
        if (currentHierarchy[k].title === wantedNode) {
          currentHierarchy = currentHierarchy[k].children
          break
        }
      }

      if (lastHierarchy === currentHierarchy) {
        let key
        if (j === chain.length - 1) {
          key = data[i]
        } else {
          key = chain.slice(0, j + 1).join('/') + '/'
        }
        const newNode = {
          weight: sort[wantedNode] || 0,
          key: key,
          title: wantedNode,
          children: []
        }
        // 叶子，最后一个字符不是"/"符号
        if (j === chain.length - 1) {
          delete newNode.children
        }
        currentHierarchy.push(newNode)
        currentHierarchy = newNode.children
      }
    }
  }
  return root
}

/**
 * @description 时间戳转化为人类可读字符串
 * @param {Number} secTimestamp 以秒表示的时间戳
 */
export function timestampFormat(secTimestamp) {
  const d = new Date(parseInt(secTimestamp) * 1000)
  return d.toLocaleString()
}

/**
 * @description 显示提示消息
 * @param {String} message 要显示的消息
 * @param {String} type 消息类型
 * @param {Number} duration 显示的毫秒数
 */
export function showMsg(self, message, type = 'success', duration = 1500) {
  self.$message({
    message: message,
    type: type,
    duration: duration
  })
}

/**
 * @description 显示提示消息
 * @param {String} message 要显示的消息
 * @param {String} type 消息类型
 * @param {Number} duration 显示的毫秒数
 */
export function showNotify(self, title, message, type = 'success') {
  self.$notify({
    title: title,
    message: message,
    type: type
  })
}
