<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import WeatherCard from '@/components/WeatherCard.vue'
import IntakeOverview from '@/components/IntakeOverview.vue'
import { getFoodRecords, addFoodRecord, updateFoodRecord, deleteFoodRecord } from '@/api/food'
import { analyzeManual } from '@/api/ai'
import { getUserInfo } from '@/api/user'
import { useUserStore } from '@/stores/user'
import {
  Plus, Calendar, ChevronLeft, ChevronRight,
  Sun, Moon, Coffee, LayoutGrid,
  Target, Sparkles, ChevronRight as ChevronRightIcon,
  Edit, Delete, Loader2,
} from 'lucide-vue-next'
import { calcRecommendedIntake } from '@/utils/nutrition'
import { getFoodEmoji } from '@/utils/foodEmoji'

defineOptions({ name: 'FoodRecord' })

const router = useRouter()
const userStore = useUserStore()

// ==================== 日期与筛选 ====================
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const today = new Date()
const todayStr = toDateStr(today)
const minDate = ref(today) // 最早可查看日期，默认今天（注册时间-2天后会更新）
const selectedDate = ref(new Date())

const activeTab = ref('全部')
const tabs = [
  { label: '全部', icon: LayoutGrid, mealType: '' },
  { label: '早餐', icon: Coffee, mealType: 'breakfast' },
  { label: '午餐', icon: Sun, mealType: 'lunch' },
  { label: '晚餐', icon: Moon, mealType: 'dinner' },
  { label: '加餐', icon: Target, mealType: 'snack' },
]

const mealTypeLabels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }
const mealTypeIcons = { breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Target }
const mealIconColors = { breakfast: 'text-green-500', lunch: 'text-orange-400', dinner: 'text-purple-400', snack: 'text-blue-400' }

function formatDate(d) {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const w = weekDays[d.getDay()]
  return `${y}年${m}月${day}日 ${w}`
}

function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const canGoPrev = computed(() => toDateStr(selectedDate.value) > toDateStr(minDate.value))
const canGoNext = computed(() => toDateStr(selectedDate.value) < todayStr)
const isToday = computed(() => toDateStr(selectedDate.value) === todayStr)

function prevDay() {
  if (!canGoPrev.value) return
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 1)
  selectedDate.value = d
}

function nextDay() {
  if (!canGoNext.value) return
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 1)
  selectedDate.value = d
}

function disabledDate(time) {
  const min = new Date(minDate.value)
  min.setHours(0, 0, 0, 0)
  return time.getTime() > Date.now() || time.getTime() < min.getTime()
}

// ==================== 获取用户注册时间，计算最早可查看日期 ====================
onMounted(async () => {
  try {
    const info = await getUserInfo()
    userStore.setUserInfo(info)
    if (info.createTime) {
      const regDate = new Date(info.createTime)
      regDate.setDate(regDate.getDate() - 2)
      minDate.value = regDate
      // 如果当前选中的日期早于最早日期，自动跳回最早日期
      if (toDateStr(selectedDate.value) < toDateStr(minDate.value)) {
        selectedDate.value = new Date(minDate.value)
      }
    }
  } catch { /* ignore */ }
})

// ==================== 数据加载 ====================
const records = ref([])
const nutritionSummary = ref({ totalCal: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 })
const loading = ref(false)

async function fetchRecords() {
  loading.value = true
  try {
    const res = await getFoodRecords(toDateStr(selectedDate.value))
    records.value = res.records || []
    if (res.nutritionSummary) {
      nutritionSummary.value = res.nutritionSummary
    }
  } catch {
    records.value = []
    nutritionSummary.value = { totalCal: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  } finally {
    loading.value = false
  }
}

watch(selectedDate, fetchRecords)

// ==================== 按餐次分组 ====================
const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack']

const filteredRecords = computed(() => {
  const active = tabs.find(t => t.label === activeTab.value)
  if (!active || !active.mealType) return records.value
  return records.value.filter(r => r.mealType === active.mealType)
})

const groupedMeals = computed(() => {
  const groups = []
  for (const mt of mealOrder) {
    const items = filteredRecords.value.filter(r => r.mealType === mt)
    if (items.length > 0) {
      groups.push({ mealType: mt, items })
    }
  }
  return groups
})

// ==================== 营养摄入数据 ====================
const targetCal = computed(() => calcRecommendedIntake(userStore.userInfo).cal)
const currentCal = computed(() => nutritionSummary.value.totalCal || 0)
const progress = computed(() => Math.min(100, Math.round(currentCal.value / (targetCal.value || 1800) * 100)))

const intakeNutrients = computed(() => {
  const rec = calcRecommendedIntake(userStore.userInfo)
  return [
    { name: '蛋白质', current: Math.round((nutritionSummary.value.totalProtein || 0) * 10) / 10, target: rec.protein, color: '#3BB371' },
    { name: '碳水化合物', current: Math.round((nutritionSummary.value.totalCarbs || 0) * 10) / 10, target: rec.carbs, color: '#f59e0b' },
    { name: '脂肪', current: Math.round((nutritionSummary.value.totalFat || 0) * 10) / 10, target: rec.fat, color: '#8b5cf6' },
  ]
})

// ==================== 添加/编辑弹窗 ====================
const dialogVisible = ref(false)
const dialogTitle = ref('添加饮食记录')
const isEditing = ref(false)
const editingId = ref(null)
const saveLoading = ref(false)
const aiAnalyzing = ref(false)

const defaultForm = () => ({
  foodName: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  mealType: 'lunch',
})

const form = ref(defaultForm())

function openAdd() {
  isEditing.value = false
  dialogTitle.value = '添加饮食记录'
  form.value = defaultForm()
  dialogVisible.value = true
}

function openEdit(record) {
  isEditing.value = true
  editingId.value = record.id
  dialogTitle.value = '编辑饮食记录'
  form.value = {
    foodName: record.foodName || '',
    calories: record.calories ?? '',
    protein: record.protein ?? '',
    carbs: record.carbs ?? '',
    fat: record.fat ?? '',
    mealType: record.mealType || 'lunch',
  }
  dialogVisible.value = true
}

async function handleAiAnalyze() {
  if (!form.value.foodName.trim()) {
    ElMessage.warning('请先输入食物名称')
    return
  }
  aiAnalyzing.value = true
  try {
    const res = await analyzeManual({ foodName: form.value.foodName, model: 'DeepSeek-V3' })
    if (res.isFood === false) {
      ElMessage.warning(res.message || '无法识别该食物，请手动输入营养信息')
      return
    }
    form.value.calories = res.calories ?? ''
    form.value.protein = res.protein ?? ''
    form.value.carbs = res.carbs ?? ''
    form.value.fat = res.fat ?? ''
    if (res.foodName) {
      form.value.foodName = res.foodName
    }
    ElMessage.success('AI 已自动填充营养数据')
  } catch {
    ElMessage.error('AI 分析失败，请手动输入')
  } finally {
    aiAnalyzing.value = false
  }
}

async function handleSave() {
  if (!form.value.foodName.trim()) {
    ElMessage.warning('请输入食物名称')
    return
  }
  saveLoading.value = true
  try {
    // 如果热量字段为空（非0），自动AI分析补全营养数据
    if (form.value.calories === '' || form.value.calories === null) {
      try {
        const res = await analyzeManual({ foodName: form.value.foodName, model: 'DeepSeek-V3' })
        if (res.isFood !== false) {
          form.value.calories = res.calories ?? ''
          form.value.protein = res.protein ?? ''
          form.value.carbs = res.carbs ?? ''
          form.value.fat = res.fat ?? ''
          if (res.foodName) form.value.foodName = res.foodName
        }
      } catch { /* AI失败不阻塞，继续保存 */ }
    }
    const data = {
      foodName: form.value.foodName,
      calories: Number(form.value.calories) || 0,
      protein: Number(form.value.protein) || 0,
      carbs: Number(form.value.carbs) || 0,
      fat: Number(form.value.fat) || 0,
      mealType: form.value.mealType,
      recordDate: todayStr,
    }
    if (isEditing.value) {
      await updateFoodRecord(editingId.value, data)
      ElMessage.success('修改成功')
    } else {
      await addFoodRecord(data)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchRecords()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

async function handleDelete(record) {
  try {
    await ElMessageBox.confirm(`确定要删除「${record.foodName}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteFoodRecord(record.id)
    ElMessage.success('删除成功')
    fetchRecords()
  } catch {
    ElMessage.error('删除失败')
  }
}

// ==================== 初始化 ====================
fetchRecords()
</script>

<template>
  <div class="flex-1 h-full flex flex-col text-slate-700 overflow-hidden relative" style="background: linear-gradient(135deg, #f6f8fb 0%, #edf1f7 50%, #f0f4f8 100%);">
    <div class="absolute top-[-8%] right-[-3%] w-[400px] h-[400px] bg-green-200/20 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-[5%] left-[5%] w-[350px] h-[350px] bg-blue-100/25 rounded-full blur-[100px] pointer-events-none"></div>
    <!-- 顶部标题 -->
    <header class="relative z-10 flex justify-between items-start mb-6 px-10 pt-8 shrink-0">
      <div>
        <h1 class="text-[24px] font-bold text-[#1f2937] flex items-center gap-2">
          饮食记录 <Calendar :size="22" color="#00b96b" />
        </h1>
        <p class="text-[#9ca3af] text-[13px] mt-1">记录每日饮食，追踪营养摄入</p>
      </div>
      <WeatherCard />
    </header>

    <!-- 主体内容区 -->
    <div class="relative z-10 flex-1 flex gap-6 px-10 pb-6 overflow-hidden">
      <!-- 左侧主记录区 -->
      <div class="flex-[2.6] bg-white rounded-[30px] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col">
        <!-- 日期和筛选器 -->
        <div class="flex items-center gap-5 mb-8">
          <div class="flex items-center bg-slate-50/80 border border-slate-100 rounded-full px-2 py-1.5">
            <button
              class="p-1 transition-colors"
              :class="canGoPrev ? 'hover:text-[#3BB371]' : 'opacity-30 cursor-not-allowed'"
              :disabled="!canGoPrev"
              @click="prevDay"
            >
              <ChevronLeft :size="16" />
            </button>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              :disabled-date="disabledDate"
              :clearable="false"
              class="food-date-picker"
            />
            <button
              class="p-1 transition-colors"
              :class="canGoNext ? 'hover:text-[#3BB371]' : 'opacity-30 cursor-not-allowed'"
              :disabled="!canGoNext"
              @click="nextDay"
            >
              <ChevronRight :size="16" />
            </button>
          </div>

          <div class="flex items-center gap-2 ml-auto">
            <!-- 餐次筛选 -->
            <div
              v-for="tab in tabs"
              :key="tab.label"
              @click="activeTab = tab.label"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all border',
                activeTab === tab.label
                  ? 'bg-[#f0fdf4] text-[#3BB371] border-[#3BB371]'
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200',
              ]"
            >
              {{ tab.label }}
            </div>

            <!-- 添加一餐按钮（仅今天可用） -->
            <button
              v-if="isToday"
              class="bg-[#3BB371] hover:bg-[#329e63] text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-sm transition-all font-semibold text-sm ml-2"
              @click="openAdd"
            >
              <Plus :size="16" />
              添加一餐
            </button>
          </div>
        </div>

        <!-- 列表容器 -->
        <div v-if="loading" class="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3">
          <Loader2 :size="32" class="animate-spin text-[#3BB371]" />
          <p class="text-sm">加载中...</p>
        </div>

        <div v-else-if="!groupedMeals.length" class="flex-1 flex flex-col items-center justify-center text-gray-300">
          <Calendar :size="48" class="mb-4 text-gray-200" />
          <p class="text-sm">{{ activeTab === '全部' ? '暂无饮食记录' : `暂无${activeTab}记录` }}</p>
          <button
            v-if="isToday"
            class="mt-4 text-[#3BB371] text-sm font-medium hover:underline"
            @click="openAdd"
          >
            {{ activeTab === '全部' ? '添加今天第一餐' : `添加${activeTab}` }}
          </button>
        </div>

        <div v-else class="flex-1 overflow-y-auto space-y-5 pr-1 no-scrollbar">
          <div
            v-for="group in groupedMeals"
            :key="group.mealType"
            class="border border-slate-100 rounded-[22px] overflow-hidden bg-[#f4f6f9] shadow-sm"
          >
            <div class="bg-slate-50/60 px-6 py-3.5 flex justify-between items-center border-b border-slate-200">
              <div class="flex items-center gap-3">
                <div class="bg-white p-1.5 rounded-lg shadow-sm">
                  <component :is="mealTypeIcons[group.mealType]" :class="mealIconColors[group.mealType]" :size="16" />
                </div>
                <span class="font-bold text-slate-800 text-[15px]">{{ mealTypeLabels[group.mealType] }}</span>
                <span class="text-slate-400 text-xs font-medium">{{ group.items.length }} 种食物</span>
              </div>
              <span class="font-bold text-slate-800">
                {{ Math.round(group.items.reduce((sum, f) => sum + (f.calories || 0), 0)) }}
                <span class="text-xs font-normal text-slate-400 ml-0.5">kcal</span>
              </span>
            </div>
            <div class="p-2 space-y-1">
              <div
                v-for="food in group.items"
                :key="food.id"
                class="flex items-center gap-4 p-4 hover:bg-slate-50/40 transition-colors rounded-2xl group"
              >
                <div class="w-14 h-14 bg-slate-100/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                  {{ getFoodEmoji(food.foodName) }}
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-slate-800 text-[15px]">{{ food.foodName }}</h4>
                </div>
                <div class="flex gap-12 text-center">
                  <div class="w-14">
                    <div class="font-bold text-slate-800 text-sm mb-1">{{ food.calories ?? '--' }}</div>
                    <div class="text-slate-400 text-[10px] whitespace-nowrap">kcal</div>
                  </div>
                  <div class="w-14">
                    <div class="font-bold text-slate-800 text-sm mb-1">{{ food.protein ?? '--' }}</div>
                    <div class="text-slate-400 text-[10px] whitespace-nowrap">蛋白质(g)</div>
                  </div>
                  <div class="w-14">
                    <div class="font-bold text-slate-800 text-sm mb-1">{{ food.carbs ?? '--' }}</div>
                    <div class="text-slate-400 text-[10px] whitespace-nowrap">碳水(g)</div>
                  </div>
                  <div class="w-14">
                    <div class="font-bold text-slate-800 text-sm mb-1">{{ food.fat ?? '--' }}</div>
                    <div class="text-slate-400 text-[10px] whitespace-nowrap">脂肪(g)</div>
                  </div>
                </div>
                <!-- 编辑/删除按钮 — 仅今天可操作 -->
                <div v-if="isToday" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#3BB371] hover:bg-green-50 transition-all"
                    @click="openEdit(food)"
                  >
                    <Edit :size="14" />
                  </button>
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 transition-all"
                    @click="handleDelete(food)"
                  >
                    <Delete :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="flex-1 flex flex-col gap-5">
        <div class="shrink-0">
          <IntakeOverview
            :current-cal="currentCal"
            :target-cal="targetCal"
            :progress="progress"
            :nutrients="intakeNutrients"
            accent-color="#3BB371"
            bg-color="#f0f9f4"
          />
        </div>

        <div
          @click="router.push('/app/analyze')"
          class="flex-1 bg-[#f0f9f4]/50 backdrop-blur-md rounded-[30px] p-6 relative overflow-hidden border border-green-100/30 shadow-[0_4px_16px_rgba(0,0,0,0.03)] cursor-pointer hover:bg-[#e8f5ee]/60 transition-all group flex flex-col justify-center"
        >
          <div class="flex items-center gap-2 mb-3">
            <div class="p-1.5 bg-white/60 rounded-lg">
              <Sparkles class="w-4 h-4 text-blue-400" />
            </div>
            <h3 class="font-bold text-slate-800 text-[15px]">AI 营养分析</h3>
            <ChevronRightIcon class="ml-auto w-4 h-4 text-slate-400 group-hover:text-[#3BB371] group-hover:translate-x-0.5 transition-all" />
          </div>
          <p class="text-sm text-slate-500 leading-relaxed">
            {{ currentCal > 0 ? '点击查看 AI 对今日饮食的详细分析和个性化建议' : '今日暂无饮食记录，添加记录后可获取 AI 营养分析' }}
          </p>
        </div>
      </div>
    </div>

    <!-- ==================== 添加/编辑弹窗 ==================== -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close center>
      <div class="dialog-body">
        <!-- 食物名称 + AI 分析按钮 -->
        <div class="mb-5">
          <label class="text-sm font-medium text-slate-600 mb-2 block">食物名称 <span class="text-red-400">*</span></label>
          <div class="flex gap-3">
            <el-input
              v-model="form.foodName"
              placeholder="输入食物名称，如：鸡胸肉 150g"
              class="flex-1 food-input"
              size="large"
            />
            <el-button
              class="ai-btn"
              :loading="aiAnalyzing"
              :disabled="!form.foodName.trim()"
              @click="handleAiAnalyze"
            >
              <svg v-if="!aiAnalyzing" class="w-4 h-4 mr-1.5"><use href="#icon-gemini-spark"/></svg>
              {{ aiAnalyzing ? '分析中…' : 'AI 分析' }}
            </el-button>
          </div>
        </div>

        <!-- 营养信息四宫格 -->
        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="field-item">
            <label class="text-xs text-slate-400 mb-1.5 block">热量 (kcal)</label>
            <el-input v-model="form.calories" type="number" placeholder="0" size="large" />
          </div>
          <div class="field-item">
            <label class="text-xs text-slate-400 mb-1.5 block">蛋白质 (g)</label>
            <el-input v-model="form.protein" type="number" placeholder="0" size="large" />
          </div>
          <div class="field-item">
            <label class="text-xs text-slate-400 mb-1.5 block">碳水化合物 (g)</label>
            <el-input v-model="form.carbs" type="number" placeholder="0" size="large" />
          </div>
          <div class="field-item">
            <label class="text-xs text-slate-400 mb-1.5 block">脂肪 (g)</label>
            <el-input v-model="form.fat" type="number" placeholder="0" size="large" />
          </div>
        </div>

        <!-- 餐次选择 -->
        <div class="mb-5">
          <label class="text-sm font-medium text-slate-600 mb-2 block">餐次 <span class="text-red-400">*</span></label>
          <div class="flex gap-3">
            <div
              v-for="m in [
                { v: 'breakfast', l: '早餐', i: Coffee },
                { v: 'lunch', l: '午餐', i: Sun },
                { v: 'dinner', l: '晚餐', i: Moon },
                { v: 'snack', l: '加餐', i: Target },
              ]"
              :key="m.v"
              @click="form.mealType = m.v"
              :class="[
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all border',
                form.mealType === m.v
                  ? 'bg-[#f0fdf4] text-[#3BB371] border-[#3BB371]'
                  : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100',
              ]"
            >
              <component :is="m.i" :size="16" />
              {{ m.l }}
            </div>
          </div>
        </div>

        <!-- 提示：日期锁定为今天 -->
        <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl text-xs text-slate-400">
          <Calendar :size="14" />
          记录日期固定为今天（{{ formatDate(today) }}）
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false" size="large">取消</el-button>
        <el-button type="primary" :loading="saveLoading" @click="handleSave" size="large" class="save-btn-dialog">
          {{ isEditing ? '保存修改' : '添加记录' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.food-date-picker {
  width: 240px;
}
.food-date-picker :deep(.el-input__wrapper) {
  background: transparent;
  border: none;
  box-shadow: none !important;
  padding: 0 6px;
  height: auto;
}
.food-date-picker :deep(.el-input__inner) {
  text-align: center;
  font-size: 18px !important;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.dialog-body {
  padding: 0 4px;
}

.food-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: none !important;
  border: 1px solid #eef2f6;
  transition: border-color 0.2s;
}
.food-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3BB371;
}

.ai-btn {
  height: 48px !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  padding: 0 20px !important;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%) !important;
  border: none !important;
  color: white !important;
  white-space: nowrap !important;
  flex-shrink: 0;
}
.ai-btn:hover {
  background: linear-gradient(135deg, #9b7cf0 0%, #7c4ef0 100%) !important;
}
.ai-btn.is-disabled {
  background: #e5e7eb !important;
  color: #9ca3af !important;
}

.field-item :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: none !important;
  border: 1px solid #eef2f6;
}
.field-item :deep(.el-input__wrapper.is-focus) {
  border-color: #3BB371;
}

.save-btn-dialog {
  border-radius: 12px !important;
  font-weight: 600 !important;
  background: #3BB371 !important;
  border: none !important;
}
.save-btn-dialog:hover {
  background: #329e63 !important;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
