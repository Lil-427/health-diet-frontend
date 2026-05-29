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

defineOptions({ name: 'DietRecordAnalysis' })

const router = useRouter()
const userStore = useUserStore()
const refreshHistory = inject('refreshHistory', () => {})
const pendingHistoryItem = inject('pendingHistoryItem', ref(null))

const dailyTarget = computed(() => calcRecommendedIntake(userStore.userInfo))

const props = defineProps({
  model: { type: String, default: 'DeepSeek-R1' },
})

// ==================== 日期范围 ====================
const today = new Date()
const todayStr = formatDateStr(today)
const minDate = ref(today)

onMounted(async () => {
  // 加载用户信息以确定最小日期和推荐摄入量
  try {
    const info = await getUserInfo()
    userStore.setUserInfo(info)
    if (info.createTime) {
      const regDate = new Date(info.createTime)
      regDate.setDate(regDate.getDate() - 2)
      minDate.value = regDate
    }
  } catch { /* ignore */ }

  // 处理从分析历史点击进入的场景
  const pending = pendingHistoryItem.value
  if (pending && pending.type === 'diet' && pending.date) {
    analyzeDate.value = pending.date
    pendingHistoryItem.value = null
    await nextTick()
    handleAnalyze()
    return
  }

  // 正常加载：检查缓存
  await loadMealsForDate()
  analyzed.value = checkCacheForDate(analyzeDate.value, rawRecords.value)
})

function formatDateStr(d) {
  return d.toISOString().split('T')[0]
}

// ==================== 状态 ====================
const analyzeDate = ref(todayStr)
const analyzed = ref(false)
const loading = ref(false)
const mealsLoading = ref(false)

const meals = ref([])
const rawRecords = ref([])
const mealLabels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }

const isToday = computed(() => analyzeDate.value === todayStr)
const hasRecords = computed(() => meals.value.length > 0)

const nutritionBars = ref([
  { name: '蛋白质', current: 0, target: 90, color: '#58c193', percent: 0 },
  { name: '碳水化合物', current: 0, target: 250, color: '#ff9c27', percent: 0 },
  { name: '脂肪', current: 0, target: 60, color: '#a78bfa', percent: 0 },
])

watch(dailyTarget, (t) => {
  nutritionBars.value[0].target = t.protein
  nutritionBars.value[1].target = t.carbs
  nutritionBars.value[2].target = t.fat
}, { immediate: true })

const pros = ref([])
const suggests = ref([])
const score = ref('')
const overallEval = ref('')
const currentCal = ref(0)
const progress = ref(0)

// ==================== 分析缓存 ====================
const analysisCache = ref({})

function getMealsFingerprint(records) {
  if (!records.length) return 'empty'
  return records.map(r => `${r.id}:${r.foodName}:${r.calories}:${r.mealType}`).sort().join('|')
}

function saveAnalysisToCache(date, records) {
  analysisCache.value[date] = {
    fingerprint: getMealsFingerprint(records),
    data: {
      currentCal: currentCal.value,
      progress: progress.value,
      nutritionBars: nutritionBars.value.map(b => ({ ...b })),
      pros: [...pros.value],
      suggests: [...suggests.value],
      score: score.value,
      overallEval: overallEval.value,
    },
  }
}

function restoreFromCache(date) {
  const cached = analysisCache.value[date]
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

function checkCacheForDate(date, records) {
  const fingerprint = getMealsFingerprint(records)
  const cached = analysisCache.value[date]
  if (cached && cached.fingerprint === fingerprint) {
    restoreFromCache(date)
    return true
  }
  // 指纹不匹配，清除该日期的旧缓存
  delete analysisCache.value[date]
  return false
}

// ==================== 餐次数据加载 ====================
async function loadMealsForDate() {
  mealsLoading.value = true
  try {
    const res = await getFoodRecords(analyzeDate.value)
    const records = res.records || []
    rawRecords.value = records
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

// 切换日期时自动重新加载餐次数据，检查缓存决定是否保留分析结果
watch(analyzeDate, () => {
  loadMealsForDate().then(() => {
    analyzed.value = checkCacheForDate(analyzeDate.value, rawRecords.value)
  })
})

// ==================== 分析逻辑 ====================
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
    if (res.nutritionSummary) {
      const s = res.nutritionSummary
      currentCal.value = s.totalCal ?? 0
      const t = dailyTarget.value
      progress.value = Math.min(100, Math.round((s.totalCal ?? 0) / (t.cal || 1800) * 100))
      nutritionBars.value[0].current = Math.round((s.totalProtein ?? 0) * 10) / 10
      nutritionBars.value[0].percent = Math.min(100, Math.round((s.totalProtein ?? 0) / (t.protein || 90) * 100))
      nutritionBars.value[1].current = Math.round((s.totalCarbs ?? 0) * 10) / 10
      nutritionBars.value[1].percent = Math.min(100, Math.round((s.totalCarbs ?? 0) / (t.carbs || 250) * 100))
      nutritionBars.value[2].current = Math.round((s.totalFat ?? 0) * 10) / 10
      nutritionBars.value[2].percent = Math.min(100, Math.round((s.totalFat ?? 0) / (t.fat || 60) * 100))
    }
    if (res.pros?.length) pros.value = res.pros
    if (res.suggestions?.length) suggests.value = res.suggestions
    if (res.score) score.value = res.score
    if (res.overallEval) overallEval.value = res.overallEval
    analyzed.value = true
    saveAnalysisToCache(analyzeDate.value, rawRecords.value)
  } catch {
    ElMessage.error('分析失败，请稍后重试')
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
