export const keyPayloadType = 'payloadType'
export const keyPayloadConfig = 'payloadConfig'
export const keyPayloadWeight = 'payloadWeight'
export const keyPostWeight = 'postWeight'
export const keyPostType = 'postType'

/**
 * @param {String} key
 * @param {Object} value
 */
export function saveToLocalStorge(key, value) {
  localStorage[key] = JSON.stringify(value)
}

/**
 * @param {String} key
 * @param {Object} value the default value when the localStorge.key is empty
 */
export function getFromLocalStorge(key, value = null) {
  if (localStorage[key]) {
    return JSON.parse(localStorage[key])
  }
  return value
}
