<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppSidebar from '@/components/AppSidebar.vue'
import { appMenus } from '@/config/menus.js'
import { getFoodRecords } from '@/api/food'
import { getUserInfo } from '@/api/user'
import { calcRecommendedIntake } from '@/utils/nutrition'
import { formatDateFull } from '@/utils/date'
import { useSidebarCollapse } from '@/composables/useSidebarCollapse'

defineOptions({ name: 'Home' })

const router = useRouter()
const userStore = useUserStore()
const { isCollapse, handleToggle } = useSidebarCollapse()
const menus = appMenus

// ==================== 问候语 & 时间 ====================
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const dateDisplay = computed(() => formatDateFull(new Date()))

const username = computed(() => userStore.userInfo.username || '用户')

// ==================== 数据加载 ====================
const nutritionSummary = ref({ totalCal: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 })
const hasRecords = ref(false)
const profileIncomplete = computed(() => {
  const u = userStore.userInfo
  return !u.height || !u.weight || !u.gender || u.gender === 0 || !u.goal
})

const recommended = computed(() => calcRecommendedIntake(userStore.userInfo))

const nutritionData = computed(() => {
  const rec = recommended.value
  const s = nutritionSummary.value
  const items = [
    { label: '蛋白质', value: Math.round((s.totalProtein || 0) * 10) / 10, color: '#42b883', target: rec.protein },
    { label: '碳水', value: Math.round((s.totalCarbs || 0) * 10) / 10, color: '#f39c12', target: rec.carbs },
    { label: '脂肪', value: Math.round((s.totalFat || 0) * 10) / 10, color: '#9b59b6', target: rec.fat },
  ]
  return items.map(item => ({
    ...item,
    percent: Math.min(100, Math.round((item.value / (item.target || 1)) * 100)),
  }))
})

const currentCal = computed(() => Math.round(nutritionSummary.value.totalCal || 0))
const targetCal = computed(() => recommended.value.cal)
const calPercent = computed(() => Math.min(100, Math.round(currentCal.value / (targetCal.value || 1800) * 100)))

// 环形图 offset: 总周长 282.6
const dashOffset = computed(() => {
  const pct = calPercent.value / 100
  return 282.6 * (1 - pct)
})

onMounted(async () => {
  try {
    const info = await getUserInfo()
    userStore.setUserInfo(info)
  } catch { /* ignore */ }
  try {
    const today = new Date().toISOString().split('T')[0]
    const res = await getFoodRecords(today)
    if (res.nutritionSummary) {
      nutritionSummary.value = res.nutritionSummary
    }
    hasRecords.value = (res.records && res.records.length > 0)
  } catch { /* ignore */ }
})

function handleNav(path) {
  router.push(path)
}
</script>

<template>
  <div class="home-wrapper h-screen flex bg-[#f2f6f5] text-[#3d4a4d] overflow-hidden relative">
    <!-- 左侧导航 -->
    <AppSidebar
      :menu-items="menus"
      active-path="/"
      :collapsed="isCollapse"
      @nav="handleNav"
      @toggle="handleToggle"
    />

    <!-- 背景光晕 -->
    <div
      class="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] bg-green-200/30 rounded-full blur-[100px] pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[5%] left-[10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"
    ></div>

    <!-- 主内容 -->
    <main class="flex-1 px-14 py-8 flex flex-col relative z-10 max-w-[1200px] mx-auto w-full">
      <!-- Header -->
      <header class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
            {{ greeting }}，{{ username }} <span class="text-green-500 drop-shadow-sm">🍃</span>
          </h1>
          <p class="text-gray-400 text-sm mt-1">记录每一餐，遇见更好的自己</p>
        </div>
        <div
          class="flex items-center gap-2 bg-white/30 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/60 shadow-sm"
        >
          <el-icon size="18" class="text-orange-400"><Sunny /></el-icon>
          <span class="text-sm font-bold text-gray-600">{{ dateDisplay }}</span>
        </div>
      </header>

      <!-- 核心玻璃看板 -->
      <div
        class="glass-main-card flex-1 max-h-[380px] relative bg-white/20 backdrop-blur-[40px] rounded-[48px] p-10 border border-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden mb-8 flex flex-col"
      >
        <p class="text-xs font-medium text-gray-400 mb-4 ml-1">今日摄入总览</p>
        <div class="flex-1 flex items-center relative z-10">
        <!-- 背景流线 -->
        <div class="absolute bottom-0 left-0 w-full px-12 py-8 opacity-20 pointer-events-none">
          <svg viewBox="0 0 1000 100" class="w-full">
            <path
              d="M0,75 Q250,20 500,75 T1000,75"
              stroke="#42b883"
              stroke-width="1.5"
              fill="none"
            />
          </svg>
        </div>

        <!-- 无记录时：引导添加 -->
        <div v-if="!hasRecords" class="flex flex-col items-center justify-center w-full relative z-10 gap-4">
          <el-icon size="48" class="text-green-400/50"><Calendar /></el-icon>
          <p class="text-gray-500 text-sm">今天还没有饮食记录</p>
          <button
            class="px-6 py-2 bg-green-400/80 hover:bg-green-500/80 text-white rounded-full text-sm font-medium transition-all"
            @click="$router.push('/app/food')"
          >
            去添加饮食记录
          </button>
          <p v-if="profileIncomplete" class="text-gray-400 text-xs mt-1">
            完善
            <span class="text-green-500 cursor-pointer hover:underline" @click="$router.push('/app/profile')">个人信息</span>
            可以获取更精准的营养建议
          </p>
        </div>

        <!-- 有记录时：真实数据 -->
        <div v-else class="flex items-center justify-between w-full relative z-10">
          <!-- 核心热量环 -->
          <div class="relative w-52 h-52 flex-shrink-0">
            <div class="absolute inset-0 bg-green-400/10 blur-[40px] rounded-full scale-90"></div>
            <svg
              class="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(66,184,131,0.1)]"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50" cy="50" r="45"
                stroke="rgba(255,255,255,0.3)"
                stroke-width="4"
                fill="none"
              />
              <circle
                cx="50" cy="50" r="45"
                stroke="url(#grad)"
                stroke-width="6"
                fill="none"
                stroke-dasharray="282.6"
                :stroke-dashoffset="dashOffset"
                stroke-linecap="round"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#42b883" />
                  <stop offset="100%" stop-color="#a7f3d0" />
                </linearGradient>
              </defs>
            </svg>

            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-gray-400 text-[10px] tracking-widest uppercase font-bold">Today</span>
              <span class="text-5xl font-black text-gray-700 my-0.5 tracking-tighter">{{ currentCal }}</span>
              <span class="text-gray-400/60 text-[12px] font-medium">/ {{ targetCal }} kcal</span>
            </div>
          </div>

          <!-- 营养指标 -->
          <div class="flex-1 grid grid-cols-3 gap-8 ml-16">
            <div
              v-for="(item, idx) in nutritionData"
              :key="idx"
              class="relative group p-4 rounded-3xl hover:bg-white/10 transition-all duration-500"
            >
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="w-2 h-2 rounded-full"
                  :style="{ background: item.color, boxShadow: `0 0 8px ${item.color}88` }"
                ></span>
                <span class="text-gray-500 font-bold text-sm">{{ item.label }}</span>
              </div>
              <div class="text-3xl font-black text-gray-700 leading-none">
                {{ item.value }}<span class="text-sm font-normal text-gray-300 ml-1">g</span>
              </div>
              <div
                class="w-full h-1 bg-white/40 rounded-full mt-4 overflow-hidden border border-white/10"
              >
                <div
                  class="h-full rounded-full transition-all duration-1000"
                  :style="{ background: item.color, width: item.percent + '%' }"
                ></div>
              </div>
              <div class="text-gray-400 text-[10px] mt-2 font-medium">推荐 {{ item.target }}g</div>
            </div>
          </div>
        </div>

        <!-- 个人信息不完整提示 -->
        <div v-if="hasRecords && profileIncomplete" class="absolute top-10 right-10">
          <span
            class="text-[#f59e0b] text-[10px] cursor-pointer hover:underline"
            @click="$router.push('/app/profile')"
          >完善个人信息，获取精准建议 →</span>
        </div>
      </div>
      </div>

      <!-- 底部入口卡片 -->
      <div class="grid grid-cols-3 gap-8 h-32">
        <div
          v-for="(btn, idx) in [
            { name: '饮食记录', desc: '记录今日三餐', icon: 'Calendar', color: '#00b96b', route: '/app/food' },
            { name: 'AI 营养分析', desc: '智能识别 · 精准建议', icon: 'AiGemini', color: '#00b96b', route: '/app/analyze' },
            { name: '数据统计', desc: '近期多维趋势', icon: 'Histogram', color: '#00b96b', route: '/app/dashboard' },
          ]"
          :key="idx"
          @click="$router.push(btn.route)"
          class="action-card group relative bg-white/20 backdrop-blur-2xl border border-white/60 p-5 rounded-[32px] flex items-center justify-between hover:bg-white/40 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-lg"
        >
          <div class="flex items-center gap-4">
            <div
              :class="[
                'w-14 h-14 flex items-center justify-center transition-all duration-500 group-hover:scale-110',
                btn.icon === 'AiGemini' ? 'rounded-full bg-green-100/30' : 'rounded-2xl bg-white/20',
              ]"
            >
              <svg v-if="btn.icon === 'AiGemini'" class="w-8 h-8" style="color: #00b96b">
                <use xlink:href="#icon-gemini-spark" />
              </svg>
              <el-icon v-else size="28" color="#00b96b"><component :is="btn.icon" /></el-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-700 leading-tight">{{ btn.name }}</h3>
              <p class="text-gray-400 text-[11px] mt-0.5 tracking-wide">{{ btn.desc }}</p>
            </div>
          </div>

          <div
            class="arrow-btn w-10 h-10 rounded-full border border-white/50 bg-white/10 flex items-center justify-center text-gray-300 transition-all duration-300 group-hover:bg-white group-hover:text-[#00b96b] group-hover:shadow-md"
          >
            <el-icon size="16"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.home-wrapper {
  font-family: 'PingFang SC', 'HarmonyOS Sans', system-ui;
}

.glass-main-card {
  box-shadow:
    inset 0 0 40px rgba(255, 255, 255, 0.5),
    0 15px 40px rgba(0, 0, 0, 0.01);
}

.action-card {
  .arrow-btn {
    backdrop-filter: blur(5px);
  }
}

@keyframes reveal {
  from { opacity: 0; transform: scale(0.99) translateY(15px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

main > * {
  animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

:deep(.el-icon) {
  --color: inherit;
}
</style>
