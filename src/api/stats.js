import request from './request'

/** 热量趋势 */
export function getCalorieTrend(range = 7) {
  return request.get('/stats/calorie-trend', { params: { range } })
}

/** 营养素占比 */
export function getNutrientRatio(date) {
  return request.get('/stats/nutrient-ratio', { params: date ? { date } : {} })
}
