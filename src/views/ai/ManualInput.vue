<script setup>
import { ref, computed, inject, onMounted, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { analyzeManual } from '@/api/ai'
import { getFoodEmoji } from '@/utils/foodEmoji'

defineOptions({ name: 'ManualInput' })

const refreshHistory = inject('refreshHistory', () => {})
const pendingHistoryItem = inject('pendingHistoryItem', ref(null))

onMounted(async () => {
  const pending = pendingHistoryItem.value
  if (pending && pending.type === 'manual' && pending.foodName) {
    query.value = pending.foodName
    pendingHistoryItem.value = null
    await nextTick()
    handleAnalyze()
  }
})

const props = defineProps({
  model: { type: String, default: 'DeepSeek-R1' },
})

const query = ref('')
const analyzed = ref(false)
const loading = ref(false)
const adviceText = ref('')
const analyzedFoodName = ref('')

const stats = ref([
  { label: '热量', value: '165', unit: 'kcal', rec: '500 kcal', icon: 'Opportunity', color: '#00b96b', bg: '#f0fdf4' },
  { label: '蛋白质', value: '31.0', unit: 'g', rec: '60 g', icon: 'Histogram', color: '#10b981', bg: '#ecfdf5' },
  { label: '碳水化合物', value: '0', unit: 'g', rec: '200 g', icon: 'HotWater', color: '#f59e0b', bg: '#fffbeb' },
  { label: '脂肪', value: '3.6', unit: 'g', rec: '50 g', icon: 'CoffeeCup', color: '#8b5cf6', bg: '#f5f3ff' },
])

const details = ref([
  { name: '胆固醇', val: '85', unit: 'mg' },
  { name: '维生素B6', val: '0.6', unit: 'mg' },
  { name: '钠', val: '74', unit: 'mg' },
  { name: '烟酸', val: '13.7', unit: 'mg' },
  { name: '钾', val: '256', unit: 'mg' },
  { name: '磷', val: '214', unit: 'mg' },
])

const foodEmoji = computed(() => getFoodEmoji(analyzedFoodName.value))
const foodBgColor = computed(() => {
  const colors = ['#e8f5e9', '#fff3e0', '#e3f2fd', '#fce4ec', '#f3e5f5', '#e0f7fa', '#fff8e1', '#f1f8e9']
  let hash = 0
  const name = analyzedFoodName.value || ''
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
})

async function handleAnalyze() {
  if (!query.value.trim()) return
  loading.value = true
  try {
    const res = await analyzeManual({ foodName: query.value, model: props.model })
    if (res.isFood === false) {
      ElMessage.warning(res.message || '请输入有效的食物名称')
      return
    }
    analyzedFoodName.value = res.foodName || query.value
    // 先重置为占位值，再填充实际数据
    stats.value[0].value = '--'
    stats.value[1].value = '--'
    stats.value[2].value = '--'
    stats.value[3].value = '--'
    details.value = []
    stats.value[0].value = String(res.calories ?? '--')
    stats.value[1].value = String(res.protein ?? '--')
    stats.value[2].value = String(res.carbs ?? '--')
    stats.value[3].value = String(res.fat ?? '--')
    if (res.details?.length) {
      details.value = res.details.map(d => ({ name: d.name, val: d.val, unit: d.unit }))
    }
    adviceText.value = res.advice || ''
    analyzed.value = true
    refreshHistory()
  } catch (e) {
    ElMessage.error(e?.message || '分析失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="manual-input-wrapper">
    <!-- 输入区（固定顶部） -->
    <div class="flex gap-4">
      <div class="flex-1 relative">
        <el-input
          v-model="query"
          placeholder="输入食物名称和重量，如：鸡胸肉 100g"
          class="analysis-input"
        >
          <template #prefix>
            <el-icon class="text-gray-400 ml-2"><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-button class="analyze-btn" :loading="loading" @click="handleAnalyze">
        <svg class="w-4 h-4 mr-2"><use href="#icon-gemini-spark" /></svg> {{ loading ? '分析中...' : '开始分析' }}
      </el-button>
    </div>
    <div class="mt-4 flex items-center gap-2 text-xs text-gray-400">
      <span>示例:</span>
      <span class="hover:text-[#00b96b] cursor-pointer" @click="query = '鸡胸肉 100g'"
        >鸡胸肉、</span
      >
      <span class="hover:text-[#00b96b] cursor-pointer" @click="query = '牛奶 250ml'">牛奶、</span>
      <span class="hover:text-[#00b96b] cursor-pointer" @click="query = '苹果 200g'">苹果、</span>
      <span class="hover:text-[#00b96b] cursor-pointer" @click="query = '燕麦 50g'">燕麦、</span>
      <span class="hover:text-[#00b96b] cursor-pointer" @click="query = '香蕉 100g'">香蕉等</span>
    </div>

    <!-- 结果展示 -->
    <template v-if="analyzed">
      <div class="my-3 border-t border-gray-100"></div>

      <div class="flex-1 flex flex-col">
        <div class="flex items-start mb-3">
          <div class="flex gap-4">
            <div class="w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 flex items-center justify-center" :style="{ backgroundColor: foodBgColor }">
              <span class="text-4xl">{{ foodEmoji }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-base font-bold">{{ analyzedFoodName || query || '鸡胸肉 (100g)' }}</h2>
                <span
                  class="bg-[#e6f7ef] text-[#00b96b] text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  >分析完成</span
                >
              </div>
              <p class="text-[11px] text-gray-400">分析时间：{{ new Date().toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- 四个核心指标 -->
        <div class="grid grid-cols-4 gap-4 mb-3">
          <div v-for="item in stats" :key="item.label" class="metric-box">
            <div class="icon-circle" :style="{ backgroundColor: item.bg }">
              <el-icon :style="{ color: item.color }"><component :is="item.icon" /></el-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] text-gray-400 mb-0.5">{{ item.label }}</span>
              <div class="flex items-baseline">
                <span class="text-lg font-bold mr-0.5">{{ item.value }}</span>
                <span class="text-[10px] text-gray-400">{{ item.unit }}</span>
              </div>
              <span class="text-[10px] text-gray-300 mt-0.5">推荐 {{ item.rec }}</span>
            </div>
          </div>
        </div>

        <!-- 底部详情与建议  拉伸靠近分割线 -->
        <div class="flex-1 grid grid-cols-5 gap-4">
          <div class="flex flex-col col-span-2 pt-6">
            <div class="flex items-center gap-1 mb-5">
              <span class="font-bold text-sm">营养成分详情</span>
            </div>
            <div class="flex-1 grid grid-cols-2 gap-x-4 gap-y-4 content-start">
              <div
                v-for="detail in details"
                :key="detail.name"
                class="flex justify-between text-xs pb-2 border-b border-gray-50"
              >
                <span class="text-gray-400">{{ detail.name }}</span>
                <span class="font-bold text-gray-600">{{ detail.val }} {{ detail.unit }}</span>
              </div>
            </div>
          </div>

          <div class="ai-advice-card col-span-3">
            <div class="advice-content">
              <div class="advice-header">
                <svg class="sparkle-icon"><use href="#icon-gemini-spark" /></svg>
                <span class="title">AI 健康建议</span>
              </div>
              <div class="text-body">
                <p v-if="adviceText">{{ adviceText }}</p>
                <template v-else>
                  <p>鸡胸肉是优质高蛋白、低脂肪的食物，</p>
                  <p>非常适合健身增肌和减脂人群。</p>
                  <p>建议搭配蔬菜和优质碳水，营养更均衡。</p>
                </template>
              </div>
            </div>
            <img src="@/assets/images/robot1.png" class="robot-image" alt="AI Robot" />
          </div>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex flex-col items-center text-gray-300 pt-32">
      <el-icon size="48" class="mb-4"><Search /></el-icon>
      <p class="text-sm">输入食物名称，AI 将为你分析营养信息</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.analysis-input {
  :deep(.el-input__wrapper) {
    background-color: #fff;
    border: 1px solid #eef2f6;
    box-shadow: none !important;
    border-radius: 16px;
    height: 52px;
    padding-left: 12px;
    &.is-focus {
      border-color: #00b96b;
    }
  }
  :deep(.el-input__inner) {
    font-size: 14px;
    color: #333;
    &::placeholder {
      color: #cbd5e1;
    }
  }
}

.analyze-btn {
  background-color: #00b96b !important;
  border: none !important;
  color: white !important;
  border-radius: 16px !important;
  height: 52px !important;
  padding: 0 32px !important;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
  &:hover {
    background-color: #00a05b !important;
    transform: translateY(-1px);
  }
}

.metric-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background-color: #fcfdfe;
  border: 1px solid #f8fafc;
  border-radius: 16px;

  .icon-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
  }
}

.ai-advice-card {
  position: relative;
  width: 100%;
  min-height: 160px;
  background: linear-gradient(135deg, #f8fdfc 0%, #f5f9ff 100%);
  border: 1px solid #fff;
  border-radius: 24px;
  padding: 24px 30px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: flex-start;
}

.advice-content {
  position: relative;
  z-index: 2;
  flex: 1;
  max-width: 65%;
}

.advice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;

  .sparkle-icon {
    width: 20px;
    height: 20px;
    color: #4cd5a0;
  }

  .title {
    font-size: 15px;
    font-weight: 700;
    color: #2c3e50;
    letter-spacing: 0.5px;
  }
}

.text-body p {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 2;
  margin: 0;
  letter-spacing: 0.3px;
}

.robot-image {
  position: absolute;
  right: -50px;
  bottom: -15px;
  width: 300px;
  height: auto;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  opacity: 0.9;
  filter: drop-shadow(0 0 10px rgba(76, 213, 160, 0.1));
}
</style>
