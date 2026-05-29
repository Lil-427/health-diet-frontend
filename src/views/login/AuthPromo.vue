<script setup>
import { Leaf, LineChart, Sparkles, PieChart } from 'lucide-vue-next'

defineOptions({ name: 'AuthPromo' })
</script>

<template>
  <div class="flex-1 max-w-xl -mt-8">
    <div class="mb-6">
      <h1 class="text-4xl font-bold text-slate-800 mb-4 flex items-center gap-3">
        记录每一餐，遇见<span class="text-[#3BB371]">更好的自己</span>
        <Leaf class="text-[#3BB371]" :size="32" />
      </h1>
      <p class="text-slate-400 text-lg">AI 助你科学饮食，轻松管理健康</p>
    </div>

    <div class="space-y-6">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-green-50 rounded-xl">
          <LineChart class="text-[#3BB371]" :size="24" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-700">智能记录</h3>
          <p class="text-slate-400 text-sm mt-1">轻松记录每日饮食，营养数据一目了然</p>
        </div>
      </div>

      <div class="flex items-start gap-4">
        <div class="p-3 bg-purple-50 rounded-xl">
          <Sparkles class="text-purple-400" :size="24" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-700">AI 营养分析</h3>
          <p class="text-slate-400 text-sm mt-1">AI 智能分析食物营养，提供专业建议</p>
        </div>
      </div>

      <div class="flex items-start gap-4">
        <div class="p-3 bg-orange-50 rounded-xl">
          <PieChart class="text-orange-400" :size="24" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-700">数据可视化</h3>
          <p class="text-slate-400 text-sm mt-1">多维度数据统计，掌握健康趋势</p>
        </div>
      </div>
    </div>
  </div>
</template>
