<template>
  <AppPageBg>
    <!-- 顶部标题区域 -->
    <header class="flex justify-between items-start mb-6 relative z-10">
      <div>
        <h1 class="text-[24px] font-bold text-[#1f2937] flex items-center gap-2">
          AI 营养分析 <svg class="w-6 h-6 text-[#00b96b]"><use href="#icon-gemini-spark"/></svg>
        </h1>
        <p class="text-[#9ca3af] text-[13px] mt-1">AI 智能识别食物营养，提供专业建议</p>
      </div>
      <WeatherCard />
    </header>

    <div class="flex gap-6 relative z-10">
      <!-- 左侧：主要分析区 -->
      <div class="flex-1 relative mt-6">
        <!-- AI 模型选择器 - 浮于卡片右上角外侧 -->
        <div class="absolute right-0 -top-11 flex items-center gap-3 bg-white/25 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/50 z-20">
          <svg class="w-3.5 h-3.5 text-[#00b96b] drop-shadow-sm"><use href="#icon-gemini-spark"/></svg>
          <span class="text-xs text-gray-500 font-medium">AI 模型:</span>
          <el-select v-model="model" size="small" variant="borderless" class="glass-select" style="width: 170px" popper-class="model-popper">
            <el-option label="DeepSeek-R1（深度推理）" value="DeepSeek-R1" />
            <el-option label="DeepSeek-V3（快速响应）" value="DeepSeek-V3" />
          </el-select>
        </div>

        <!-- 分析面板 -->
        <div class="bg-white rounded-[24px] p-8 shadow-sm relative overflow-hidden h-full flex flex-col" style="min-height: 600px;">
          <!-- 标签切换 -->
          <div class="tabs flex gap-8 mb-8">
            <div
              v-for="tab in tabs"
              :key="tab"
              class="tab-item pb-3 text-sm cursor-pointer relative"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab }}
              <div v-if="activeTab === tab" class="indicator"></div>
            </div>
          </div>

          <!-- 标签内容 -->
          <div class="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            <ManualInput v-if="activeTab === '手动输入分析'" :key="manualInputKey" class="flex-1" :model="model" />
            <DietRecordAnalysis v-else-if="activeTab === '饮食记录分析'" class="flex-1" :model="model" />
          </div>

          <!-- 免责声明 -->
          <p class="text-center text-xs text-gray-400 pt-4 border-t border-gray-100 shrink-0">
            ⓘ AI 生成内容仅供参考，请结合自身情况合理搭配饮食
          </p>
        </div>
      </div>

      <!-- 右侧：分析历史 -->
      <AnalysisHistory ref="historyRef" @select="onHistorySelect" />
    </div>
  </AppPageBg>
</template>

<script setup>
import { ref, provide, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ManualInput from './ManualInput.vue'
import DietRecordAnalysis from './DietRecordAnalysis.vue'
import AnalysisHistory from './AnalysisHistory.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import AppPageBg from '@/components/AppPageBg.vue'

defineOptions({ name: 'AiAnalyze' })

const model = ref('DeepSeek-R1')

watch(model, (val) => {
  const names = { 'DeepSeek-R1': 'DeepSeek-R1（深度推理）', 'DeepSeek-V3': 'DeepSeek-V3（快速响应）' }
  ElMessage.success(`已切换至 ${names[val] || val}`)
})
const tabs = ['手动输入分析', '饮食记录分析']
const activeTab = ref('手动输入分析')
const historyRef = ref(null)
const pendingHistoryItem = ref(null)
const manualInputKey = ref(0)

function refreshHistory() {
  historyRef.value?.fetchHistory()
}

function onHistorySelect(item) {
  const name = item.name || ''
  if (name.startsWith('饮食分析')) {
    const dateStr = name.replace('饮食分析 - ', '').trim()
    pendingHistoryItem.value = { type: 'diet', date: dateStr }
    activeTab.value = '饮食记录分析'
  } else {
    pendingHistoryItem.value = { type: 'manual', foodName: name }
    manualInputKey.value++
    activeTab.value = '手动输入分析'
  }
}

provide('refreshHistory', refreshHistory)
provide('pendingHistoryItem', pendingHistoryItem)
</script>

<style scoped lang="scss">
.tab-item {
  color: #94a3b8;
  font-weight: 500;
  cursor: pointer;
  &.active {
    color: #00b96b;
    font-weight: bold;
  }
  .indicator {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #00b96b;
    border-radius: 4px;
  }
}

.glass-select {
  :deep(.el-input__wrapper) {
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  :deep(.el-input__inner) {
    color: #333 !important;
    width: 100% !important;
    font-weight: 600;
    font-size: 13px;
  }
}

.shadow-sm {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<style lang="scss">
.model-popper {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06) !important;
  overflow: hidden;

  .el-select-dropdown__item {
    font-size: 13px;
    color: #444;
    transition: all 0.2s;

    &.is-selected {
      color: #00b96b;
      font-weight: 600;
      background: rgba(0, 185, 107, 0.06);
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
}
</style>
