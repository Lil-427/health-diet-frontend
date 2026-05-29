<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineOptions({ name: 'WeatherCard' })

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const dateStr = ref('')
const weekDay = ref('')
const timeStr = ref('')
let timer = null

function updateTime() {
  const now = new Date()
  dateStr.value = `${now.getMonth() + 1}月${now.getDate()}日`
  weekDay.value = weekDays[now.getDay()]
  timeStr.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="bg-white px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm border border-white shrink-0">
    <el-icon class="text-[#f59e0b] text-xl"><Sunny /></el-icon>
    <div class="text-right">
      <div class="text-lg font-bold text-gray-800 leading-none">{{ timeStr }}</div>
      <div class="text-[10px] text-gray-400 mt-1">{{ dateStr }} {{ weekDay }}</div>
    </div>
  </div>
</template>
