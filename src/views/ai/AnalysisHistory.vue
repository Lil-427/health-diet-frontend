<script setup>
import { ref, computed, onMounted } from 'vue'
import { Clock, ArrowRight, ArrowLeft, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnalysisHistory, deleteAnalysis, clearHistory as clearHistoryApi } from '@/api/ai'
import { getFoodEmoji } from '@/utils/foodEmoji'

defineOptions({ name: 'AnalysisHistory' })

const emit = defineEmits(['select'])
function onItemClick(item) { emit('select', item) }

// ==================== 分页状态 ====================
const historyPage = ref(1)
const pageSize = 6
const total = ref(0)
const history = ref([])
const loading = ref(false)

// 用 total 判断是否还有下一页，避免总数恰好是 6 的倍数时误判
const hasMore = computed(() => historyPage.value * pageSize < total.value)

// ==================== 工具函数 ====================
function foodEmoji(name) {
  if ((name || '').startsWith('饮食分析')) return '📊'
  return getFoodEmoji(name)
}

function formatTime(createTime) {
  if (!createTime) return ''
  const d = new Date(createTime)
  const now = new Date()
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  const t = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `今天 ${t}`
  if (diffDays === 1) return `昨天 ${t}`
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')} ${t}`
}

// ==================== 数据请求 ====================
let fetchSeq = 0

/**
 * @param {number} page 要加载的页码，默认当前页
 * 先请求数据，成功后再更新页码和列表，防止 API 失败导致页码与实际数据错位
 */
async function fetchHistory(page = historyPage.value) {
  const seq = ++fetchSeq
  loading.value = true
  try {
    const res = await getAnalysisHistory({ page, pageSize })
    if (seq !== fetchSeq) return
    history.value = (res.list || []).map(item => ({
      id: item.id,
      name: item.foodName,
      cal: item.calories ?? '--',
      time: formatTime(item.createTime),
    }))
    total.value = res.total ?? 0
    historyPage.value = page
  } catch (e) {
    ElMessage.error(e?.message || '加载历史失败，请稍后重试')
  } finally {
    if (seq === fetchSeq) loading.value = false
  }
}

function refreshHistory() {
  fetchHistory(1)
}

// ==================== 删除操作 ====================
async function removeHistoryItem(id) {
  try {
    await deleteAnalysis(id)
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
    return
  }
  if (history.value.length === 1 && historyPage.value > 1) {
    fetchHistory(historyPage.value - 1)
  } else {
    fetchHistory()
  }
}

async function clearHistory() {
  try {
    await ElMessageBox.confirm('确定要清空所有分析历史吗？', '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await clearHistoryApi()
    history.value = []
    total.value = 0
    historyPage.value = 1
  } catch (e) {
    ElMessage.error(e?.message || '清空失败')
  }
}

// ==================== 分页导航 ====================
function prevPage() {
  if (historyPage.value > 1) fetchHistory(historyPage.value - 1)
}
function nextPage() {
  if (hasMore.value) fetchHistory(historyPage.value + 1)
}

onMounted(() => { fetchHistory() })
defineExpose({ fetchHistory: refreshHistory })
</script>

<template>
  <aside class="w-[340px]" style="margin-top: 24px; height: 664px">
    <div class="bg-white rounded-[24px] p-8 shadow-sm h-full flex flex-col">
      <div class="flex items-center gap-2 mb-4">
        <el-icon size="18" class="text-gray-400"><Clock /></el-icon>
        <span class="font-bold text-base">分析历史</span>
        <span v-if="loading" class="text-[10px] text-[#58c193] animate-pulse ml-1">刷新中…</span>
        <span class="ml-auto text-xs text-gray-300">{{ total }} 条</span>
        <button
          v-if="history.length"
          class="text-[11px] text-gray-300 hover:text-red-400 transition-colors ml-1"
          @click="clearHistory"
        >清空</button>
      </div>

      <div class="flex-1 space-y-3" style="min-height: 456px">
        <div v-if="!history.length && !loading" class="text-center text-gray-300 py-12 text-xs">暂无分析记录</div>
        <div
          v-for="item in history"
          :key="item.id"
          class="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          @click="onItemClick(item)"
        >
          <div class="rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-2xl" style="width: 50px; height: 50px; background: #f8fafc;">
            {{ foodEmoji(item.name) }}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold truncate">{{ item.name }}</h4>
            <span class="text-sm font-bold text-gray-700">{{ item.cal }} <span class="text-xs font-normal text-gray-400">kcal</span></span>
            <p class="text-[11px] text-gray-400">{{ item.time }}</p>
          </div>
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
            @click.stop="removeHistoryItem(item.id)"
          >
            <el-icon size="14"><Close /></el-icon>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-gray-50 mt-3">
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="historyPage === 1"
          @click="prevPage"
        >
          <el-icon size="15"><ArrowLeft /></el-icon>
        </button>
        <span class="text-xs text-gray-400">{{ historyPage }} / {{ Math.ceil(total / pageSize) || 1 }}</span>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="!hasMore"
          @click="nextPage"
        >
          <el-icon size="16"><ArrowRight /></el-icon>
        </button>
      </div>
    </div>
  </aside>
</template>
