<script>
// 模块级缓存：定义在普通 <script> 中，只执行一次，路由切换不丢失
const analysisCache = {}
// 上次选中的日期，路由切换回来时恢复
let lastAnalyzeDate = ''
</script>

<script setup>
import { ref, inject, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import IntakeOverview from '@/components/IntakeOverview.vue'
import { analyzeDiet } from '@/api/ai'
import { getFoodRecords } from '@/api/food'
import { getUserInfo } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { calcRecommendedIntake } from '@/utils/nutrition'
import { formatDateStr } from '@/utils/date'

defineOptions({ name: 'DietRecordAnalysis' })

/*
 * 组件职责：展示某一天的饮食记录，调用 AI 分析营养摄入情况。
 *
 * 核心流程：
 *   用户选择日期 → 加载该日饮食记录 → 点击"开始分析" → 调用后端 AI API
 *   → 解析结果（热量、三大营养素、优点、建议、评分）→ 展示 + 缓存
 *
 * 缓存策略（避免重复调用 AI）：
 *   对每天的饮食记录生成一个"指纹"（由所有记录的 id+食物名+热量+餐次拼接而成），
 *   分析完成后将指纹和结果一起缓存。下次切换到同一天时，如果指纹没变，
 *   直接复用缓存；如果用户修改了记录导致指纹变化，则清除旧缓存，需要重新分析。
 */

const router = useRouter()
const userStore = useUserStore()
// 从父组件 AiAnalyze.vue 注入的待处理历史记录项（用户从历史列表点击进入时携带）
// 如果存在，说明需要自动加载对应日期的数据并分析
const pendingHistoryItem = inject('pendingHistoryItem', ref(null))

// 根据用户的性别、身高、体重、年龄、目标（减脂/增肌等）计算每日推荐摄入量
// 返回 { cal, protein, carbs, fat }，单位：千卡 / 克
const dailyTarget = computed(() => calcRecommendedIntake(userStore.userInfo))

const props = defineProps({
  model: { type: String, default: 'DeepSeek-R1' },
})

// ==================== 日期范围 ====================
const today = new Date()
const todayStr = formatDateStr(today)
// 日期选择器的最小可选日期：用户注册日期往前推2天，允许查看注册前2天的记录
const minDate = ref(today)

/*
 * 监听从分析历史点击进入的场景。
 * 使用 watch 而非 onMounted 是因为父组件用 v-show 保持子组件常驻，
 * onMounted 只触发一次，后续点击历史需要 watch 来响应。
 */
watch(pendingHistoryItem, async (val) => {
  if (val && val.type === 'diet' && val.date) {
    analyzeDate.value = val.date
    pendingHistoryItem.value = null     // 消费掉，防止重复触发
    await nextTick()                    // 等待 DOM 更新确保日期选择器已切换
    handleAnalyze()
  }
})

onMounted(async () => {
  // ① 先获取用户完整信息，用于设定日期选择范围和推荐摄入量
  try {
    const info = await getUserInfo()
    userStore.setUserInfo(info)
    if (info.createTime) {
      const regDate = new Date(info.createTime)
      regDate.setDate(regDate.getDate() - 2)
      minDate.value = regDate
    }
  } catch { /* 获取失败不影响页面使用，minDate 保持为今天 */ }

  // ② 处理首次加载时的历史跳转（watch 在 onMounted 之前不会触发）
  const pending = pendingHistoryItem.value
  if (pending && pending.type === 'diet' && pending.date) {
    analyzeDate.value = pending.date
    pendingHistoryItem.value = null
    await nextTick()
    handleAnalyze()
    return
  }

  // ③ 正常进入页面：加载今天（或上次选中的日期）的饮食记录，尝试从缓存恢复分析结果
  await loadMealsForDate()
  analyzed.value = checkCacheForDate(analyzeDate.value, rawRecords.value)
})


// ==================== 页面状态 ====================
// 当前分析的日期（"YYYY-MM-DD" 格式），绑定日期选择器
// 优先恢复上次选择的日期（路由切换回来时不丢失），否则默认今天
const analyzeDate = ref(lastAnalyzeDate || todayStr)
lastAnalyzeDate = analyzeDate.value  // 首次加载时同步
// 是否已经完成分析（控制按钮状态和结果区域显示）
const analyzed = ref(false)
// AI 分析请求加载中
const loading = ref(false)
// 餐次数据加载中
const mealsLoading = ref(false)

// 按餐次分组后的食物列表，结构: [{ name: '早餐', mealType: 'breakfast', foods: [...] }, ...]
const meals = ref([])
// 后端返回的原始记录列表（未分组），用于指纹计算
const rawRecords = ref([])
const mealLabels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }

// 是否选中了今天
const isToday = computed(() => analyzeDate.value === todayStr)
// 当天是否有饮食记录
const hasRecords = computed(() => meals.value.length > 0)

// 三大营养素的当前值 vs 目标值，传给 IntakeOverview 组件渲染进度条
const nutritionBars = ref([
  { name: '蛋白质', current: 0, target: 90, color: '#58c193', percent: 0 },
  { name: '碳水化合物', current: 0, target: 250, color: '#ff9c27', percent: 0 },
  { name: '脂肪', current: 0, target: 60, color: '#a78bfa', percent: 0 },
])

// 监听用户信息变化（比如切换账号、更新个人信息），动态更新三大营养素的目标值
watch(dailyTarget, (t) => {
  nutritionBars.value[0].target = t.protein
  nutritionBars.value[1].target = t.carbs
  nutritionBars.value[2].target = t.fat
}, { immediate: true })

// AI 分析结果
const pros = ref([])         // 优点列表
const suggests = ref([])     // 改进建议
const score = ref('')        // 综合评分，如 "85"
const overallEval = ref('')  // 整体评价文字
const currentCal = ref(0)    // 当前已摄入热量（千卡）
const progress = ref(0)      // 摄入热量占目标热量的百分比（0-100）

// ==================== 分析结果缓存 ====================
// analysisCache 定义在顶部 <script> 块中，真正的模块级，路由切换不丢失
// 缓存结构: { [日期字符串]: { fingerprint: 'xxx', data: { currentCal, progress, ... } } }

/**
 * 生成当前饮食记录的"指纹"
 *
 * 指纹的作用：判断某一天的饮食记录自上次分析后是否发生了变化。
 * 每条记录取 id+食物名+热量+餐次 拼接，排序后以 | 连接。
 *
 * 举例：如果用户早餐吃了鸡蛋（200kcal），指纹包含 "123:鸡蛋:200:breakfast"。
 * 如果后来又加了一个包子，指纹字符串会变长，与缓存中的旧指纹不匹配，
 * 从而触发重新分析。
 *
 * @returns 当天空记录时返回 'empty'，否则返回拼接后的指纹字符串
 */
function getMealsFingerprint(records) {
  if (!records.length) return 'empty'
  return records.map(r => `${r.id}:${r.foodName}:${r.calories}:${r.mealType}`).sort().join('|')
}

/** 分析完成后调用，将当前分析结果连同指纹一并存入缓存 */
function saveAnalysisToCache(date, records) {
  analysisCache[date] = {
    fingerprint: getMealsFingerprint(records),
    data: {
      currentCal: currentCal.value,
      progress: progress.value,
      nutritionBars: nutritionBars.value.map(b => ({ ...b })),  // 深拷贝避免引用污染
      pros: [...pros.value],
      suggests: [...suggests.value],
      score: score.value,
      overallEval: overallEval.value,
    },
  }
}

/** 从缓存中恢复之前保存的分析结果到当前页面状态 */
function restoreFromCache(date) {
  const cached = analysisCache[date]
  if (!cached) return false
  currentCal.value = cached.data.currentCal
  progress.value = cached.data.progress
  nutritionBars.value = cached.data.nutritionBars.map(b => ({ ...b }))
  pros.value = [...cached.data.pros]
  suggests.value = [...cached.data.suggests]
  score.value = cached.data.score
  overallEval.value = cached.data.overallEval
  return true
}

/**
 * 检查某日期的缓存是否有效
 *
 * 比对当前记录指纹与缓存中的指纹：
 * - 指纹一致 → 记录没变，直接从缓存恢复分析结果，返回 true
 * - 指纹不一致 → 用户在这期间修改了记录（新增/删除/修改食物），
 *   旧缓存已过时，删除后返回 false，调用方会触发重新分析
 */
function checkCacheForDate(date, records) {
  const fingerprint = getMealsFingerprint(records)
  const cached = analysisCache[date]
  if (cached && cached.fingerprint === fingerprint) {
    restoreFromCache(date)
    return true
  }
  // 指纹不匹配：用户修改了该日期的饮食记录，旧分析结果不再有效，清除
  delete analysisCache[date]
  return false
}

// ==================== 餐次数据加载 ====================
/**
 * 根据当前选中的日期，从后端拉取饮食记录
 *
 * 后端返回的是平铺列表，这里按 mealType 分组成四餐：
 *   breakfast → 早餐  lunch → 午餐  dinner → 晚餐  snack → 加餐
 *
 * 同时保留 rawRecords（原始数据）用于指纹计算。
 */
async function loadMealsForDate() {
  mealsLoading.value = true
  try {
    const res = await getFoodRecords(analyzeDate.value)
    const records = res.records || []
    rawRecords.value = records
    // 按固定早餐→午餐→晚餐→加餐的顺序展示
    const order = ['breakfast', 'lunch', 'dinner', 'snack']
    const grouped = {}
    for (const r of records) {
      const mt = r.mealType || 'snack'
      if (!grouped[mt]) grouped[mt] = []
      grouped[mt].push(r)
    }
    meals.value = order.filter(mt => grouped[mt]).map(mt => ({
      name: mealLabels[mt] || mt,
      mealType: mt,
      foods: grouped[mt],
    }))
  } catch {
    meals.value = []
    rawRecords.value = []
  } finally {
    mealsLoading.value = false
  }
}

// 用户切换日期选择器时，自动加载新日期的餐次数据，并尝试从缓存恢复分析结果
watch(analyzeDate, (val) => {
  lastAnalyzeDate = val   // 同步到模块级缓存，路由切换回来时恢复
  loadMealsForDate().then(() => {
    analyzed.value = checkCacheForDate(analyzeDate.value, rawRecords.value)
  })
})

// ==================== AI 分析逻辑 ====================
/**
 * 调用后端 AI 接口分析当天饮食，并解析结果到页面状态
 *
 * 流程：
 *   1. 调 POST /api/ai/analyze/diet，传 { date, model }
 *   2. 后端将饮食记录汇总后发给 DeepSeek，返回结构化分析结果
 *   3. 前端解析 nutritionSummary（营养汇总）、pros（优点）、suggestions（建议）、
 *      score（评分）、overallEval（整体评价）
 *   4. 将结果存入缓存，之后切换日期再切回来时无需重新调用
 */
async function handleAnalyze() {
  if (!hasRecords.value) {
    if (isToday.value) {
      ElMessage.warning('今天还没有饮食记录，请先去添加')
    } else {
      ElMessage.warning('当天暂无饮食记录，无法分析')
    }
    return
  }
  loading.value = true
  try {
    const res = await analyzeDiet({ date: analyzeDate.value, model: props.model })

    // 解析 AI 返回的营养汇总数据
    if (res.nutritionSummary) {
      const s = res.nutritionSummary
      currentCal.value = s.totalCal ?? 0
      const t = dailyTarget.value
      // 热量进度百分比，上限 100%（防止超标后显示超过 100%）
      progress.value = Math.min(100, Math.round((s.totalCal ?? 0) / (t.cal || 1800) * 100))
      // 三大营养素：当前值保留一位小数，百分比上限 100%
      nutritionBars.value[0].current = Math.round((s.totalProtein ?? 0) * 10) / 10
      nutritionBars.value[0].percent = Math.min(100, Math.round((s.totalProtein ?? 0) / (t.protein || 90) * 100))
      nutritionBars.value[1].current = Math.round((s.totalCarbs ?? 0) * 10) / 10
      nutritionBars.value[1].percent = Math.min(100, Math.round((s.totalCarbs ?? 0) / (t.carbs || 250) * 100))
      nutritionBars.value[2].current = Math.round((s.totalFat ?? 0) * 10) / 10
      nutritionBars.value[2].percent = Math.min(100, Math.round((s.totalFat ?? 0) / (t.fat || 60) * 100))
    }

    // 解析 AI 评价文字（优点、建议、评分、整体评价）
    if (res.pros?.length) pros.value = res.pros
    if (res.suggestions?.length) suggests.value = res.suggestions
    if (res.score) score.value = res.score
    if (res.overallEval) overallEval.value = res.overallEval

    analyzed.value = true
    // 分析成功后立即缓存，方便用户切换日期再切回来时复用
    saveAnalysisToCache(analyzeDate.value, rawRecords.value)
  } catch (e) {
    ElMessage.error(e?.message || '分析失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="diet-wrapper">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400">选择分析日期</span>
        <el-date-picker
          v-model="analyzeDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          class="date-picker"
          :disabled-date="(d) => {
            const t = new Date(d).getTime()
            return t > Date.now() || t < minDate.getTime()
          }"
        />
      </div>
      <el-button class="analyze-btn" :loading="loading" :disabled="!hasRecords || analyzed" @click="handleAnalyze">
        <svg class="w-4 h-4 mr-2"><use href="#icon-gemini-spark"/></svg>
        {{ loading ? '分析中...' : analyzed ? '已分析' : !hasRecords ? '暂无记录可分析' : '开始分析' }}
      </el-button>
    </div>

    <!-- 餐次简报 — 选择日期即自动加载 -->
    <div class="grid grid-cols-4 gap-3 mb-6">
      <template v-if="mealsLoading">
        <div class="col-span-4 text-center text-gray-300 text-xs py-4">加载中...</div>
      </template>
      <template v-else-if="hasRecords">
        <div v-for="meal in meals" :key="meal.name" class="meal-card">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full" :class="{
                breakfast: 'bg-[#58c193]',
                lunch: 'bg-[#ff9c27]',
                dinner: 'bg-[#a78bfa]',
                snack: 'bg-[#3b82f6]',
              }[meal.mealType] || 'bg-[#58c193]'"></span>
              <span class="text-xs font-bold text-gray-600">{{ meal.name }}</span>
            </div>
            <span class="text-[10px] text-gray-300">{{ meal.foods.length }} 种</span>
          </div>
          <div class="space-y-1.5">
            <div v-for="food in meal.foods" :key="food.id" class="flex justify-between text-[11px]">
              <span class="text-gray-500">{{ food.foodName }}</span>
              <span class="text-gray-400">{{ food.calories ?? 0 }}kcal</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="isToday" class="col-span-4 flex flex-col items-center py-6">
          <p class="text-xs text-gray-400 mb-3">今天还没有饮食记录</p>
          <button
            class="text-xs font-medium text-[#58c193] hover:underline"
            @click="router.push('/app/food')"
          >
            去添加饮食记录 →
          </button>
        </div>
        <div v-else class="col-span-4 text-center text-gray-300 text-xs py-4">
          当天暂无饮食记录
        </div>
      </template>
    </div>

    <!-- 分析结果 -->
    <template v-if="analyzed">
      <div class="my-4 border-t border-gray-100"></div>

      <div class="grid grid-cols-5 gap-6">
        <div class="col-span-2">
          <IntakeOverview
            :current-cal="currentCal"
            :target-cal="dailyTarget.cal"
            :progress="progress"
            :nutrients="nutritionBars"
            accent-color="#58c193"
            bg-color="#f8fafc"
          />
        </div>

        <div class="col-span-3 relative">
          <div class="flex justify-between items-start mb-5">
            <h3 class="text-base font-bold text-[#1f2937] flex items-center gap-2">
              <svg class="w-4 h-4 text-[#58c193]"><use href="#icon-gemini-spark"/></svg> AI 营养评估
            </h3>
            <img src="@/assets/images/robot2.png" class="absolute -right-8 -top-14 w-40 h-40 object-contain" alt="AI Robot" />
          </div>

          <div class="bg-[#fcfdfe] rounded-2xl p-4 border border-gray-50 mb-4 flex justify-between items-center">
            <div class="flex-1">
              <h4 class="text-xs font-bold mb-1.5">整体评价</h4>
              <p class="text-[11px] text-gray-500 leading-relaxed">{{ overallEval }}</p>
            </div>
            <div class="bg-[#e6f7ef] text-[#58c193] px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-xs shrink-0 ml-3">
              <el-icon><CircleCheckFilled /></el-icon> {{ score }}
            </div>
          </div>

          <div class="bg-[#f0fdf6] rounded-2xl p-4 mb-4">
            <div class="flex items-center gap-2 text-[#58c193] mb-2 text-xs font-bold">
              <el-icon><SuccessFilled /></el-icon> 优点
            </div>
            <div class="space-y-1.5 ml-5">
              <p v-for="p in pros" :key="p" class="text-[11px] text-gray-600 flex items-center gap-2">
                <el-icon color="#58c193" size="14"><Check /></el-icon> {{ p }}
              </p>
            </div>
          </div>

          <div class="bg-[#fff9f2] rounded-2xl p-4 mb-5">
            <div class="flex items-center gap-2 text-[#ff9c27] mb-2 text-xs font-bold">
              <el-icon><WarningFilled /></el-icon> 建议
            </div>
            <div class="space-y-1.5 ml-5">
              <p v-for="s in suggests" :key="s" class="text-[11px] text-gray-600 flex items-center gap-2">
                <span class="w-1 h-1 bg-[#ff9c27] rounded-full shrink-0"></span> {{ s }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex flex-col items-center text-gray-300 pt-20">
      <svg class="w-12 h-12 mb-4 text-gray-300"><use href="#icon-gemini-spark"/></svg>
      <p class="text-sm">{{ isToday && !hasRecords ? '今天还没有饮食记录，请先去添加后再来分析' : !hasRecords ? '当天暂无饮食记录' : '点击"开始分析"，AI 将评估你的营养摄入' }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.diet-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.date-picker {
  width: 230px;
  :deep(.el-input__wrapper) {
    background-color: #fff;
    border: 1px solid #eef2f6;
    box-shadow: none !important;
    border-radius: 12px;
    height: 40px;
    &.is-focus { border-color: #58c193; }
  }
  :deep(.el-input__inner) {
    font-size: 16px !important;
    font-weight: 600;
    color: #475569;
  }
}

.analyze-btn {
  background-color: #58c193 !important;
  border: none !important;
  color: white !important;
  border-radius: 12px !important;
  height: 40px !important;
  padding: 0 24px !important;
  font-weight: 600;
  font-size: 14px;
  &:hover:not(:disabled) { background-color: #4aad83 !important; }
  &:disabled { background-color: #d1d5db !important; color: #9ca3af !important; }
}

.meal-card {
  background-color: #fcfdfe;
  border: 1px solid #f0f2f5;
  padding: 14px;
  border-radius: 14px;
}
</style>
