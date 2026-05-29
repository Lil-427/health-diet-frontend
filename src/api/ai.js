import request from './request'

// 手动输入分析
export function analyzeManual(data) {
  return request.post('/ai/analyze/manual', data)
}

// 饮食记录分析
export function analyzeDiet(data) {
  return request.post('/ai/analyze/diet', data)
}

// 获取分析历史
export function getAnalysisHistory(params) {
  return request.get('/ai/analyze/history', { params })
}

// 删除单条分析记录
export function deleteAnalysis(id) {
  return request.delete(`/ai/analyze/${id}`)
}

// 清空分析历史
export function clearHistory() {
  return request.delete('/ai/analyze/history')
}

// 获取用户画像AI饮食建议
export function getProfileTip() {
  return request.get('/ai/profile-tip')
}
