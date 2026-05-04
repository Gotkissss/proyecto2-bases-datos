export function getToken() {
  return localStorage.getItem('token')
}

export function getUser() {
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

export function saveSession(token, username, rol) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify({ username, rol }))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function isAuthenticated() {
  return !!getToken()
}