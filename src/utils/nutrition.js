/**
 * 获取年龄所属阶段
 * @param {number|null} age
 * @returns {string}
 */
export function getAgeGroup(age) {
  if (!age || age < 18) return '未知'
  if (age <= 25) return '成长期'
  if (age <= 35) return '青年'
  if (age <= 45) return '壮年'
  return '中老年'
}

/**
 * 根据用户身体数据计算每日建议摄入量
 * 使用 Mifflin-St Jeor 公式，默认年龄 25 岁（用户可自定义）
 * @param {Object} user - { gender, height, weight, goal, age }
 * @returns {{ cal: number, protein: number, carbs: number, fat: number }}
 */
export function calcRecommendedIntake(user) {
  if (!user || !user.weight) {
    return { cal: 1800, protein: 60, carbs: 225, fat: 50 }
  }

  const w = user.weight
  const h = user.height || 170
  const AGE = user.age || 25
  const PAL = 1.2 // 久坐/轻度活动系数

  // Mifflin-St Jeor BMR
  let bmr
  if (user.gender === 1) {
    bmr = 10 * w + 6.25 * h - 5 * AGE + 5       // 男
  } else if (user.gender === 2) {
    bmr = 10 * w + 6.25 * h - 5 * AGE - 161      // 女
  } else {
    // 未知性别，男女均值
    bmr = 10 * w + 6.25 * h - 5 * AGE - 78
  }

  const tdee = Math.round(bmr * PAL)

  // 目标调整
  const goalMap = { lose: -300, gain: 300, maintain: 0 }
  const cal = tdee + (goalMap[user.goal] || 0)

  // 蛋白质(g) = 体重 × 系数
  const proteinMap = { lose: 1.6, gain: 1.8, maintain: 1.2 }
  const protein = Math.round(w * (proteinMap[user.goal] || 1.2))

  // 碳水 50% / 脂肪 25%
  const carbs = Math.round((cal * 0.5) / 4)
  const fat = Math.round((cal * 0.25) / 9)

  return { cal: Math.max(1200, cal), protein, carbs, fat }
}
