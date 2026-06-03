import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

function handleAuthExpired() {
  localStorage.removeItem('token')
  window.location.hash = '#/login'
}

request.interceptors.response.use(
  (response) => {
    const { data, config } = response
    if (data.code === 200) {
      return data.data
    }
    if (data.code === 401) {
      if (isAuthEndpoint(config.url)) {
        return Promise.reject(new Error(data.msg || data.message || '未授权'))
      }
      handleAuthExpired()
      return new Promise(() => {})
    }
    return Promise.reject(new Error(data.msg || data.message || '请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.response?.config?.url || ''
      if (isAuthEndpoint(url)) {
        const msg = error.response?.data?.msg || error.response?.data?.message || '未授权'
        return Promise.reject(new Error(msg))
      }
      handleAuthExpired()
      return new Promise(() => {})
    }
    const msg = error.response?.data?.msg || error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

function isAuthEndpoint(url) {
  return url && (url.includes('/auth/login') || url.includes('/auth/register'))
}

export default request
