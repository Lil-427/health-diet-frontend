import request from './request'

// 查询某天的饮食记录
export function getFoodRecords(date) {
  return request.get('/food/record/list', { params: { date } })
}

// 添加饮食记录
export function addFoodRecord(data) {
  return request.post('/food/record', data)
}

// 更新饮食记录
export function updateFoodRecord(id, data) {
  return request.put(`/food/record/${id}`, data)
}

// 删除饮食记录
export function deleteFoodRecord(id) {
  return request.delete(`/food/record/${id}`)
}
