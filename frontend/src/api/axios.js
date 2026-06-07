import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

function clearSession() {
  localStorage.clear()
  window.location.href = '/login'
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config

    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err)
    }

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      clearSession()
      return Promise.reject(err)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post('/api/auth/refresh', { refreshToken })
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`
      processQueue(null, data.token)
      original.headers.Authorization = `Bearer ${data.token}`
      return api(original)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      clearSession()
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
