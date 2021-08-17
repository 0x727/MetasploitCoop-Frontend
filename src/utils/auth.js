import Cookies from 'js-cookie'
const TokenKey = 'XAuthorization'

export function getToken() {
  return Cookies.get(TokenKey) || localStorage.getItem(TokenKey)
}

export function setToken(token) {
  localStorage.setItem(TokenKey, token)
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  localStorage.removeItem(TokenKey)
  return Cookies.remove(TokenKey)
}

export function getServerHost() {
  localStorage.getItem('SERVER_HOST')
  return Cookies.get('SERVER_HOST')
}
