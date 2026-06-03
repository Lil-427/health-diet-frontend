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
        <!-- AI 模型选择器 —— 浮于分析卡片右上角外侧，选择 DeepSeek-R1（深度推理）或 DeepSeek-V3（快速响应） -->
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
          <!-- 标签切换：手动输入分析 / 饮食记录分析 -->
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

          <!--
            标签内容区：使用 v-show 而非 v-if，保持两个子组件常驻内存，
            避免切标签后回来分析结果和缓存被清空。
            从历史点击跳转的逻辑由各子组件内部 watch(pendingHistoryItem) 处理。
          -->
          <div class="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            <ManualInput v-show="activeTab === '手动输入分析'" class="flex-1" :model="model" />
            <DietRecordAnalysis v-show="activeTab === '饮食记录分析'" class="flex-1" :model="model" />
          </div>

          <!-- 免责声明 -->
          <p class="text-center text-xs text-gray-400 pt-4 border-t border-gray-100 shrink-0">
            ⓘ AI 生成内容仅供参考，请结合自身情况合理搭配饮食
          </p>
        </div>
      </div>

      <!-- 右侧：分析历史边栏 -->
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

/*
 * 组件职责：AI 营养分析页面的容器，管理三个子组件的协同工作。
 *
 * 架构关系：
 *   AiAnalyze（本组件）—— 容器，管理模型选择、标签切换、历史跳转
 *     ├── ManualInput    —— "手动输入分析"标签，用户输入食物名，AI 分析营养
 *     ├── DietRecordAnalysis —— "饮食记录分析"标签，选择日期，AI 分析当天饮食
 *     └── AnalysisHistory —— 右侧边栏，展示历史分析记录列表
 *
 * 跨组件通信（provide / inject）：
 *   - refreshHistory：子组件分析完成后调用，通知 AnalysisHistory 刷新列表
 *     （目前仅 ManualInput 使用，DietRecordAnalysis 中已移除未使用的注入）
 *   - pendingHistoryItem：用户从历史列表点击某条记录时，将记录信息放入此处，
 *     目标子组件在 onMounted 中检测到后自动处理（加载对应日期/食物名并触发分析）
 */

// 当前选中的 AI 模型，透传给子组件调用 API 时使用
const model = ref('DeepSeek-R1')

// 切换模型时给出提示，让用户感知模型已更新
watch(model, (val) => {
  const names = { 'DeepSeek-R1': 'DeepSeek-R1（深度推理）', 'DeepSeek-V3': 'DeepSeek-V3（快速响应）' }
  ElMessage.success(`已切换至 ${names[val] || val}`)
})

const tabs = ['手动输入分析', '饮食记录分析']
const activeTab = ref('手动输入分析')
const historyRef = ref(null)
// 待处理的跨标签跳转数据：{ type: 'manual'|'diet', date?, foodName? }
// 子组件通过 watch 监听此值变化来触发自动分析
const pendingHistoryItem = ref(null)

/** 供子组件通过 inject 调用，刷新右侧历史列表 */
function refreshHistory() {
  historyRef.value?.fetchHistory()
}

/**
 * 用户点击分析历史中的某条记录时触发
 *
 * 根据记录类型决定跳转目标：
 * - 饮食分析记录（name 以"饮食分析"开头）→ 切换到"饮食记录分析"标签，
 *   通过 pendingHistoryItem 传递 { type: 'diet', date }
 * - 手动分析记录 → 切换到"手动输入分析"标签，递增 manualInputKey 强制组件重建，
 *   通过 pendingHistoryItem 传递 { type: 'manual', foodName }
 */
function onHistorySelect(item) {
  const name = item.name || ''
  if (name.startsWith('饮食分析')) {
    // 从 "饮食分析 - 2024-01-15" 中提取日期
    const dateStr = name.replace('饮食分析 - ', '').trim()
    pendingHistoryItem.value = { type: 'diet', date: dateStr }
    activeTab.value = '饮食记录分析'
  } else {
    pendingHistoryItem.value = { type: 'manual', foodName: name }
    activeTab.value = '手动输入分析'
  }
}

// 向所有子组件注入共享方法和数据
provide('refreshHistory', refreshHistory)
provide('pendingHistoryItem', pendingHistoryItem)
</script>

<style scoped lang="scss">
/* 标签样式：默认灰色，选中时绿色加粗 + 底部指示条 */
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

/* AI 模型选择器：透明背景，融入毛玻璃效果 */
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

/* 隐藏滚动条但保留滚动能力 */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<!-- 非 scoped 样式：用于覆盖 Element Plus 下拉面板（popper 挂在 body 下，scoped 无法穿透） -->
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
