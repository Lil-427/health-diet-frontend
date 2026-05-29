import request from './request'

// 获取用户信息
export function getUserInfo() {
  return request.get('/user/profile')
}

// 更新用户信息
export function updateUserInfo(data) {
  return request.put('/user/profile', data)
}

// 修改密码
export function updatePassword(data) {
  return request.put('/user/password', data)
}

// 上传头像（base64 + JSON）
export function uploadAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      request.post('/user/avatar/base64', { file: base64, filename: file.name })
        .then(resolve)
        .catch(reject)
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}
