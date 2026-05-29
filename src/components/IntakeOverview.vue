<script setup>
defineOptions({ name: 'IntakeOverview' })

defineProps({
  currentCal: { type: Number, default: 1280 },
  targetCal: { type: Number, default: 1800 },
  progress: { type: Number, default: 71 },
  nutrients: {
    type: Array,
    default: () => [
      { name: '蛋白质', current: 68, target: 90, color: '#58c193' },
      { name: '碳水化合物', current: 152, target: 250, color: '#ff9c27' },
      { name: '脂肪', current: 38, target: 60, color: '#a78bfa' },
    ],
  },
  accentColor: { type: String, default: '#58c193' },
  bgColor: { type: String, default: '#f8fafc' },
})
</script>

<template>
  <div class="intake-panel" :style="{ backgroundColor: bgColor }">
    <div class="flex justify-between items-center mb-5">
      <h3 class="text-sm font-bold text-[#1f2937]">今日摄入总览</h3>
      <div class="p-1.5 rounded-lg" :style="{ backgroundColor: accentColor + '18' }">
        <el-icon :style="{ color: accentColor }" size="14"><Calendar /></el-icon>
      </div>
    </div>

    <div class="relative flex flex-col items-center mb-4">
      <svg width="130" height="130" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" stroke-width="12" />
        <circle
          cx="80" cy="80" r="70" fill="none" :stroke="accentColor" stroke-width="12"
          :stroke-dasharray="(progress / 100 * 440) + ' 440'" stroke-linecap="round" transform="rotate(-90 80 80)"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-[28px] font-bold text-[#1f2937] leading-none">{{ currentCal }}</span>
        <span class="text-[11px] text-gray-400">/ {{ targetCal }} kcal</span>
      </div>
    </div>
    <p class="text-center text-[11px] text-gray-400 mb-5">摄入进度 {{ progress }}%</p>

    <div class="space-y-4">
      <div v-for="n in nutrients" :key="n.name">
        <div class="flex justify-between items-center mb-1.5">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: n.color }"></span>
            <span class="text-[11px] font-bold text-gray-600">{{ n.name }}</span>
          </div>
          <span class="text-[11px] text-gray-400">{{ n.current }}g / {{ n.target }}g</span>
        </div>
        <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{
              width: (n.current / n.target * 100) + '%',
              backgroundColor: n.color,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.intake-panel {
  padding: 20px;
  border-radius: 18px;
}
</style>
