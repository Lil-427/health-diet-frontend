import axios from 'axios'
import { ElMessage } from 'element-plus'

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
  ElMessage.error('登录已过期，请重新登录')
}

request.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === 200) {
      return data.data
    }
    if (data.code === 401) {
      handleAuthExpired()
      return Promise.reject(new Error('未授权'))
    }
    ElMessage.error(data.msg || data.message || '请求失败')
    return Promise.reject(new Error(data.msg || data.message || '请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      handleAuthExpired()
      return Promise.reject(new Error('未授权'))
    }
    const msg = error.response?.data?.msg || error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request
