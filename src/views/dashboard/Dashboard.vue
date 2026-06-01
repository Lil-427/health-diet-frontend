<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import WeatherCard from '@/components/WeatherCard.vue'
import AppPageBg from '@/components/AppPageBg.vue'
import { getCalorieTrend, getNutrientRatio } from '@/api/stats'
import { getUserInfo } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { calcRecommendedIntake } from '@/utils/nutrition'

defineOptions({ name: 'Dashboard' })

const userStore = useUserStore()

// ==================== 时间范围 ====================
const activeTime = ref('近7天')
const rangeMap = { '近7天': 7, '近30天': 30, '近90天': 90 }

// ==================== 数据 ====================
const trendData = ref({ days: [], values: [], avgCal: 0, trend: '平稳' })
const ratioData = ref({ protein: { percent: 0, calories: 0 }, carbs: { percent: 0, calories: 0 }, fat: { percent: 0, calories: 0 }, totalCal: 0 })
const todayRatioData = ref({ protein: { percent: 0, calories: 0 }, carbs: { percent: 0, calories: 0 }, fat: { percent: 0, calories: 0 }, totalCal: 0 })
const loading = ref(false)
const pieMode = ref('range') // 'today' | 'range'

const pieRatioData = computed(() => pieMode.value === 'today' ? todayRatioData.value : ratioData.value)

const recommended = computed(() => calcRecommendedIntake(userStore.userInfo))
const targetCal = computed(() => recommended.value.cal)

// ==================== 概览卡片 ====================
const summaryCards = computed(() => {
  const td = trendData.value
  const rd = ratioData.value
  const avg = td.avgCal || 0
  const total = (td.values || []).reduce((s, v) => s + v, 0)
  const compliantDays = (td.values || []).filter(v => v > 0 && v <= targetCal.value * 1.1 && v >= targetCal.value * 0.7).length
  const score = rd.totalCal > 0
    ? (Math.abs(rd.protein?.percent - 25) < 10 && Math.abs(rd.carbs?.percent - 50) < 15 ? '良好' : '一般')
    : '--'

  return [
    { title: '平均每日热量', value: avg, unit: 'kcal', icon: 'TrendCharts', color: '#58c193', bg: '#f0fdf4' },
    { title: '总摄入热量', value: total, unit: 'kcal', icon: 'Timer', color: '#ff9c27', bg: '#fffbeb' },
    { title: '达标天数', value: compliantDays, unit: '天', icon: 'Star', color: '#10b981', bg: '#ecfdf5' },
    { title: '营养均衡度', value: score, unit: '', icon: 'PieChart', color: '#8b5cf6', bg: '#f5f3ff' },
  ]
})

// ==================== 图表 refs ====================
const barChartRef = ref(null)
const pieChartRef = ref(null)
let barChart = null
let pieChart = null

function initBarChart() {
  if (!barChartRef.value) return
  if (barChart) barChart.dispose()
  barChart = echarts.init(barChartRef.value)
  const td = trendData.value
  const target = targetCal.value || 2000
  barChart.setOption({
    grid: { left: '3%', right: '6%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: td.days,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: td.values,
      barWidth: '40%',
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#58c193' },
          { offset: 1, color: 'rgba(88, 193, 147, 0.1)' },
        ]),
      },
      markLine: {
        symbol: 'none',
        label: { position: 'insideEnd', formatter: `目标 ${target} kcal`, color: '#58c193', fontSize: 10, offset: [0, -12] },
        lineStyle: { type: 'dashed', color: '#58c193', opacity: 0.6 },
        data: [{ yAxis: target }],
      },
    }],
  })
}

function initPieChart() {
  if (!pieChartRef.value) return
  if (pieChart) pieChart.dispose()
  pieChart = echarts.init(pieChartRef.value)
  const rd = pieRatioData.value
  const data = [
    { value: rd.protein?.percent || 0, name: '蛋白质', cal: rd.protein?.calories || 0 },
    { value: rd.carbs?.percent || 0, name: '碳水化合物', cal: rd.carbs?.calories || 0 },
    { value: rd.fat?.percent || 0, name: '脂肪', cal: rd.fat?.calories || 0 },
  ]
  const legendData = {}
  data.forEach(d => {
    legendData[d.name] = [`${d.value}%`, `${d.cal} kcal`]
  })

  pieChart.setOption({
    color: ['#10b981', '#ff9c27', '#a78bfa'],
    legend: {
      orient: 'vertical',
      right: '0%',
      top: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemGap: 20,
      formatter: (name) => {
        const [pct, cal] = legendData[name] || ['0%', '0 kcal']
        return `{title|${name}}\n{val|${pct}} {sub|(${cal})}`
      },
      textStyle: {
        rich: {
          title: { color: '#9ca3af', fontSize: 12, padding: [0, 0, 4, 0] },
          val: { color: '#1f2937', fontSize: 13, fontWeight: 'bold' },
          sub: { color: '#9ca3af', fontSize: 11 },
        },
      },
    },
    series: [{
      type: 'pie',
      radius: ['55%', '85%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, position: 'inside', formatter: rd.totalCal > 0 ? '{d}%' : '', color: '#fff', fontSize: 10, fontWeight: 'bold' },
      data,
    }],
    graphic: {
      type: 'text',
      left: '28%',
      top: '42%',
      style: {
        text: rd.totalCal > 0 ? `总热量\n${rd.totalCal}\nkcal` : '暂无\n数据',
        textAlign: 'center',
        fill: '#1f2937',
        font: 'bold 16px sans-serif',
        lineHeight: 20,
      },
    },
  })
}

// ==================== 饮食日历 ====================
const calMonth = ref(new Date().getMonth() + 1)
const calYear = ref(new Date().getFullYear())
const calendarDays = ref([])

function buildCalendar(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date()
  const days = []
  // 填充前置空白
  for (let i = 0; i < firstDay; i++) days.push({ date: null, status: [] })
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d
    const isFuture = new Date(year, month - 1, d) > today
    days.push({ date: d, status: [], current: isToday, future: isFuture })
  }
  calendarDays.value = days
}

function prevMonth() {
  if (calMonth.value === 1) { calMonth.value = 12; calYear.value-- }
  else calMonth.value--
  buildCalendar(calYear.value, calMonth.value)
  loadCalendarStatus()
}
function nextMonth() {
  if (calMonth.value === 12) { calMonth.value = 1; calYear.value++ }
  else calMonth.value++
  buildCalendar(calYear.value, calMonth.value)
  loadCalendarStatus()
}

// 从趋势数据填充日历状态（近90天）
async function loadCalendarStatus() {
  try {
    const res = await getCalorieTrend(90)
    const target = targetCal.value || 2000
    const days = res.days || []
    const values = res.values || []
    const statusMap = {}
    days.forEach((dayStr, i) => {
      const [m, d] = dayStr.split('-').map(Number)
      const key = `${m}-${d}`
      const v = values[i] || 0
      if (v === 0) statusMap[key] = []
      else if (v > target * 1.1) statusMap[key] = ['high']
      else if (v < target * 0.5) statusMap[key] = ['low']
      else statusMap[key] = ['good']
    })
    // 更新 calendarDays
    calendarDays.value.forEach(d => {
      if (d.date) {
        const key = `${calMonth.value}-${d.date}`
        d.status = statusMap[key] || []
      }
    })
  } catch { /* ignore */ }
}

// ==================== 数据加载 ====================
async function loadData() {
  loading.value = true
  const range = rangeMap[activeTime.value] || 7
  try {
    const [trendRes, ratioRes, todayRatioRes] = await Promise.all([
      getCalorieTrend(range),
      getNutrientRatio({ range }),
      getNutrientRatio({}),
    ])
    trendData.value = trendRes
    ratioData.value = ratioRes
    todayRatioData.value = todayRatioRes
  } catch (e) {
    ElMessage.error(e?.message || '加载统计数据失败')
  }
  loading.value = false
  await nextTick()
  initBarChart()
  initPieChart()
}

watch(activeTime, () => loadData())

// 饼图模式切换
watch(pieMode, () => {
  nextTick(() => initPieChart())
})

onMounted(async () => {
  try {
    const info = await getUserInfo()
    userStore.setUserInfo(info)
  } catch { /* ignore */ }
  buildCalendar(calYear.value, calMonth.value)
  await loadData()
  await loadCalendarStatus()
})

onMounted(() => {
  window.addEventListener('resize', () => {
    if (barChart) barChart.resize()
    if (pieChart) pieChart.resize()
  })
})
onUnmounted(() => {
  if (barChart) barChart.dispose()
  if (pieChart) pieChart.dispose()
})
</script>

<template>
  <AppPageBg>
    <!-- 顶部标题区域 -->
    <header class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-[24px] font-bold text-[#1f2937] flex items-center gap-2">
          数据统计 <el-icon size="22" color="#00b96b"><Histogram /></el-icon>
        </h1>
        <p class="text-[#9ca3af] text-[13px] mt-1">多维度分析饮食数据，掌握健康趋势</p>
      </div>
      <WeatherCard />
    </header>

    <!-- 时间筛选 -->
    <div class="flex gap-3 mb-6">
      <div
        v-for="t in ['近7天', '近30天', '近90天']" :key="t"
        class="filter-pill"
        :class="{ active: activeTime === t }"
        @click="activeTime = t"
      >
        {{ t }}
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="grid grid-cols-4 gap-6 mb-6">
      <div v-for="item in summaryCards" :key="item.title" class="summary-card">
        <div class="icon-box" :style="{ backgroundColor: item.bg }">
          <el-icon :style="{ color: item.color }"><component :is="item.icon" /></el-icon>
        </div>
        <div class="flex-1">
          <div class="text-[11px] text-[#9ca3af] mb-1">{{ item.title }}</div>
          <div class="flex items-baseline gap-1">
            <span class="text-[20px] font-bold text-[#1f2937]">{{ item.value }}</span>
            <span class="text-[11px] text-[#9ca3af]">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表展示区 -->
    <div class="grid grid-cols-12 gap-6">
      <!-- 每日热量统计 -->
      <div class="col-span-5 chart-container">
        <div class="flex justify-between items-center mb-6">
          <span class="text-[14px] font-bold text-[#374151]">每日热量统计 (kcal)</span>
          <span class="text-[11px] text-[#58c193] font-medium">目标 {{ targetCal }} kcal</span>
        </div>
        <div v-if="loading" class="w-full h-[260px] flex items-center justify-center text-gray-300 text-sm">加载中...</div>
        <div ref="barChartRef" class="w-full h-[260px]"></div>
      </div>

      <!-- 营养占比分析 -->
      <div class="col-span-4 chart-container">
        <div class="flex justify-between items-center mb-6">
          <span class="text-[14px] font-bold text-[#374151] flex items-center gap-2">
            营养占比分析
            <span class="text-[#9ca3af] font-normal">({{ pieMode === 'today' ? '今日' : activeTime }})</span>
          </span>
          <div class="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <span
              class="px-2.5 py-1 text-xs rounded-md cursor-pointer transition-colors"
              :class="pieMode === 'today' ? 'bg-white text-[#374151] font-medium shadow-sm' : 'text-[#9ca3af]'"
              @click="pieMode = 'today'"
            >今日</span>
            <span
              class="px-2.5 py-1 text-xs rounded-md cursor-pointer transition-colors"
              :class="pieMode === 'range' ? 'bg-white text-[#374151] font-medium shadow-sm' : 'text-[#9ca3af]'"
              @click="pieMode = 'range'"
            >{{ activeTime }}</span>
          </div>
        </div>
        <div v-if="loading" class="w-full h-[260px] flex items-center justify-center text-gray-300 text-sm">加载中...</div>
        <div v-else-if="pieRatioData.totalCal <= 0" class="w-full h-[260px] flex flex-col items-center justify-center">
          <el-icon size="40" class="text-gray-200 mb-3"><PieChart /></el-icon>
          <p class="text-sm text-gray-400">{{ pieMode === 'today' ? '今日暂无饮食数据' : '该时间段暂无饮食数据' }}</p>
          <p class="text-xs text-gray-300 mt-1">添加饮食记录后自动生成分析</p>
        </div>
        <div v-else ref="pieChartRef" class="w-full h-[260px]"></div>
      </div>

      <!-- 饮食日历 -->
      <div class="col-span-3 chart-container flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-6">
            <div class="text-[14px] font-bold text-[#374151]">
              饮食日历 <span class="text-[#9ca3af] font-normal ml-1">({{ calYear }}年{{ calMonth }}月)</span>
            </div>
            <div class="flex gap-2">
              <el-icon class="cursor-pointer hover:text-[#58c193]" @click="prevMonth"><ArrowLeft /></el-icon>
              <el-icon class="cursor-pointer hover:text-[#58c193]" @click="nextMonth"><ArrowRight /></el-icon>
            </div>
          </div>

          <div class="calendar-grid">
            <div v-for="w in ['日','一','二','三','四','五','六']" :key="w" class="weekday">{{ w }}</div>
            <div v-for="(d, i) in calendarDays" :key="i" class="day-cell" :class="{ active: d.current, empty: !d.date }">
              <span v-if="d.date" class="num">{{ d.date }}</span>
              <div v-if="d.date && !d.future" class="dots">
                <template v-if="d.status.length">
                  <span v-for="(s, j) in d.status" :key="j" :class="s"></span>
                </template>
                <span v-else class="empty"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="legend-group flex justify-between pt-6 border-t border-gray-50">
          <div class="legend-item">
            <span class="dot bg-[#58c193]"></span>
            <span class="label">记录良好</span>
          </div>
          <div class="legend-item">
            <span class="dot bg-[#ff9c27]"></span>
            <span class="label">摄入偏高</span>
          </div>
          <div class="legend-item">
            <span class="dot bg-[#a78bfa]"></span>
            <span class="label">摄入偏低</span>
          </div>
          <div class="legend-item">
            <span class="dot bg-[#d1d5db]"></span>
            <span class="label">无记录</span>
          </div>
        </div>
      </div>
    </div>
  </AppPageBg>
</template>

<style scoped lang="scss">

.filter-pill {
  background: white;
  color: #9ca3af;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;

  &.active {
    background: #f0fdf4;
    color: #58c193;
    border-color: #58c193;
    font-weight: bold;
  }
}

.summary-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid white;

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
}

.chart-container {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;

  .weekday {
    text-align: center;
    font-size: 12px;
    color: #d1d5db;
    padding-bottom: 12px;
  }

  .day-cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #4b5563;
    border-radius: 50%;
    cursor: default;
    position: relative;

    &.empty { cursor: default; }

    &.active {
      background: #58c193;
      color: white;
      .dots span { background: white !important; }
    }

    .dots {
      display: flex;
      gap: 2.5px;
      position: absolute;
      bottom: 6px;

      span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        &.good { background: #58c193; }
        &.high { background: #ff9c27; }
        &.low { background: #a78bfa; }
        &.empty { background: #d1d5db; }
      }
    }
  }
}

.legend-group {
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .label {
      font-size: 10px;
      color: #9ca3af;
    }
  }
}
</style>
