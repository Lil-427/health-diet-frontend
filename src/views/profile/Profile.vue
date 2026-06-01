<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { getUserInfo, updateUserInfo, updatePassword, uploadAvatar, deleteAccount } from '@/api/user'
import { getProfileTip } from '@/api/ai'
import WeatherCard from '@/components/WeatherCard.vue'
import AppPageBg from '@/components/AppPageBg.vue'
import { calcRecommendedIntake, getAgeGroup } from '@/utils/nutrition'

defineOptions({ name: 'Profile' })

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('info')
const formTab = ref('base')
const saveLoading = ref(false)
const pwdLoading = ref(false)
const avatarLoading = ref(false)
const joinTime = ref('')
const avatarInputRef = ref(null)

const form = reactive({
  age: '',
  height: '',
  weight: '',
  goal: 'lose',
  gender: 0,
  name: '',
  password: '',
  newPassword: '',
  confirmPassword: '',
})

function syncForm() {
  const u = userStore.userInfo
  form.age = u.age ?? ''
  form.height = u.height ?? ''
  form.weight = u.weight ?? ''
  form.goal = u.goal || 'lose'
  form.gender = u.gender ?? 0
  form.name = u.username || ''
}

const goalOptions = [
  { label: '减脂', value: 'lose' },
  { label: '保持', value: 'maintain' },
  { label: '增肌', value: 'gain' },
]

const genderLabels = { 0: '未知', 1: '男', 2: '女' }
const goalSubLabels = { lose: '减脂', maintain: '保持', gain: '增肌' }

const infoItems = computed(() => {
  const u = userStore.userInfo
  const g = u.goal
  return [
    { label: '账号名称', value: u.username || '--', unit: '', icon: 'Postcard' },
    { label: '性别', value: genderLabels[u.gender] ?? '未知', unit: '', icon: 'User' },
    { label: '年龄', value: u.age != null ? String(u.age) : '未知', unit: u.age != null ? '岁' : '', sub: u.age != null ? getAgeGroup(u.age) : '', icon: 'Sunny' },
    { label: '身高', value: u.height != null ? String(u.height) : '未知', unit: u.height != null ? 'cm' : '', icon: 'Monitor' },
    { label: '体重', value: u.weight != null ? String(u.weight) : '未知', unit: u.weight != null ? 'kg' : '', icon: 'Box' },
    { label: '健康目标', value: goalSubLabels[g] || '未知', unit: '', icon: 'Aim', highlight: true },
  ]
})

const recommendedIntake = computed(() => calcRecommendedIntake(userStore.userInfo))
const recommendedCal = computed(() => recommendedIntake.value.cal)

const hasCompleteProfile = computed(() => {
  const u = userStore.userInfo
  return u.height != null && u.weight != null && u.gender && u.gender !== 0
})

const nutrition = computed(() => {
  const rec = recommendedIntake.value
  return [
    { label: '蛋白质', value: String(rec.protein), unit: 'g', percent: '', dotColor: 'bg-[#58c193]' },
    { label: '碳水化合物', value: String(rec.carbs), unit: 'g', percent: '', dotColor: 'bg-[#ff9c27]' },
    { label: '脂肪', value: String(rec.fat), unit: 'g', percent: '', dotColor: 'bg-[#a78bfa]' },
  ]
})

const aiTip = ref('')
const aiTipLoading = ref(false)

async function fetchAiTip() {
  if (!userStore.userInfo.id) return
  aiTipLoading.value = true
  try {
    const text = await getProfileTip()
    aiTip.value = text || '根据您的身体状况，建议均衡饮食，保持适量运动。'
  } catch (e) {
    aiTip.value = '根据您的身体状况，建议均衡饮食，保持适量运动，定期关注健康指标变化。'
  } finally {
    aiTipLoading.value = false
  }
}

// 用户信息加载后自动获取 AI 建议
watch(() => userStore.userInfo.id, (id) => {
  if (id) fetchAiTip()
})

onMounted(() => {
  if (userStore.userInfo.id) fetchAiTip()
})

async function handleSaveProfile() {
  const h = Number(form.height)
  const w = Number(form.weight)
  const a = Number(form.age)

  if (!form.height || isNaN(h) || h < 50 || h > 250) {
    ElMessage.warning('请输入有效身高（50-250cm）')
    return
  }
  if (!form.weight || isNaN(w) || w < 20 || w > 300) {
    ElMessage.warning('请输入有效体重（20-300kg）')
    return
  }
  if (!form.age || isNaN(a) || a < 18 || a > 120) {
    ElMessage.warning('请输入有效年龄（18-120岁）')
    return
  }

  saveLoading.value = true
  try {
    const data = {
      age: form.age && !isNaN(Number(form.age)) ? Number(form.age) : null,
      height: form.height && !isNaN(Number(form.height)) ? Number(form.height) : null,
      weight: form.weight && !isNaN(Number(form.weight)) ? Number(form.weight) : null,
      goal: form.goal || null,
      gender: form.gender ?? 0,
      username: form.name || null,
    }
    await updateUserInfo(data)
    userStore.setUserInfo({ ...data, username: data.username || userStore.userInfo.username })
    ElMessage.success('保存成功')
    activeTab.value = 'info'
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saveLoading.value = false
  }
}

async function handleUpdatePassword() {
  if (!form.password) {
    ElMessage.warning('请输入当前密码')
    return
  }
  if (!form.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (form.newPassword.length < 8 || !/[a-zA-Z]/.test(form.newPassword) || !/[0-9]/.test(form.newPassword)) {
    ElMessage.warning('新密码需要至少8位，包含字母和数字')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }
  pwdLoading.value = true
  try {
    await updatePassword({
      oldPassword: form.password,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    })
    ElMessage.success('密码修改成功')
    form.password = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (e) {
    ElMessage.error(e?.message || '修改失败')
  } finally {
    pwdLoading.value = false
  }
}

const deleteLoading = ref(false)

async function handleDeleteAccount() {
  try {
    await ElMessageBox.confirm(
      '注销后所有数据将被永久删除，此操作不可撤销。确定要注销账号吗？',
      '注销账号确认',
      { confirmButtonText: '确认注销', cancelButtonText: '取消', type: 'warning' }
    )
  } catch (e) {
    return
  }
  deleteLoading.value = true
  try {
    await deleteAccount()
    ElMessage.success('账号已注销')
    userStore.logout()
    router.push('/login')
  } catch (e) {
    ElMessage.error(e?.message || '注销失败')
  } finally {
    deleteLoading.value = false
  }
}

async function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  avatarLoading.value = true
  try {
    const url = await uploadAvatar(file)
    userStore.userInfo.avatar = url
    ElMessage.success('头像更新成功')
  } catch (e) {
    ElMessage.error(e?.message || '头像上传失败')
  } finally {
    avatarLoading.value = false
  }
}

watch(activeTab, (val) => {
  if (val === 'edit') syncForm()
})

onMounted(async () => {
  try {
    const info = await getUserInfo()
    userStore.setUserInfo(info)
    if (info.createTime) {
      joinTime.value = new Date(info.createTime).toLocaleDateString('zh-CN')
    }
  } catch {}
  syncForm()
})
</script>

<template>
  <AppPageBg>
    <!-- 顶部 -->
    <header class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-[24px] font-bold text-[#1f2937] flex items-center gap-2">
          个人中心 <el-icon size="22" color="#00b96b"><User /></el-icon>
        </h1>
        <p class="text-[#9ca3af] text-[13px] mt-1">管理您的个人信息与健康目标</p>
      </div>
      <!-- 右上角账户操作 -->
      <div class="flex items-center gap-2">
        <el-button class="action-btn-sm-red" :loading="deleteLoading" @click="handleDeleteAccount">
          <el-icon size="14" class="mr-1"><Delete /></el-icon> 注销账号
        </el-button>
        <el-button class="action-btn-sm-gray" @click="userStore.logout(); router.push('/login')">
          <el-icon size="14" class="mr-1"><SwitchButton /></el-icon> 退出登录
        </el-button>
      </div>
    </header>

    <!-- 标签切换 -->
    <div class="flex gap-3 mb-6">
      <div
        v-for="tab in [{ label: '个人信息', value: 'info' }, { label: '编辑信息', value: 'edit' }]"
        :key="tab.value"
        class="filter-pill"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- ==================== 个人信息 ==================== -->
    <div v-if="activeTab === 'info'" class="w-full max-w-[900px] mx-auto animate-in">
      <div class="bg-white rounded-[24px] shadow-sm border border-white relative overflow-hidden">
        <!-- 右侧装饰叶子 -->
        <div class="absolute right-[-20px] top-[10%] w-[300px] h-[300px] opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#58c193" d="M140,20C140,20 100,60 100,100C100,140 140,180 140,180C140,180 180,140 180,100C180,60 140,20 140,20Z" opacity="0.3"/>
            <path fill="#58c193" d="M60,40C60,40 20,80 20,120C20,160 60,200 60,200C60,200 100,160 100,120C100,80 60,40 60,40Z" opacity="0.5"/>
          </svg>
        </div>

        <!-- 右上角编辑按钮 -->
        <div class="absolute top-6 right-8 z-20">
          <el-button link @click="activeTab = 'edit'" class="!text-gray-400 hover:!text-[#58c193] !text-sm">
            <el-icon size="16"><EditPen /></el-icon> 编辑资料
          </el-button>
        </div>

        <div class="p-8 relative z-10">
          <div class="flex items-start justify-center gap-12 pr-40">
            <!-- 左侧：头像区域 -->
            <div class="flex flex-col items-center shrink-0">
              <div class="w-[100px] h-[100px] rounded-full border-4 border-[#f8fafc] shadow-sm overflow-hidden mb-3">
                <img :src="userStore.avatarUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" class="w-full h-full object-cover" />
              </div>
              <div class="text-center">
                <div class="mb-0.5">
                  <span class="text-lg font-bold text-gray-800">{{ userStore.userInfo.username || '小清新' }}</span>
                </div>
                <p v-if="joinTime" class="text-[11px] text-gray-300">注册于 {{ joinTime }}</p>
                <p class="text-[11px] text-gray-300">ID: {{ userStore.userInfo.id || '--' }}</p>
              </div>
            </div>

            <!-- 右侧：详细信息列表 -->
            <div class="space-y-5 pt-2 max-w-[460px]">
              <div v-for="item in infoItems" :key="item.label" class="flex items-center justify-between border-b border-gray-50 pb-3.5">
                <div class="flex items-center gap-3 text-gray-400">
                  <el-icon size="16"><component :is="item.icon" /></el-icon>
                  <span class="text-sm">{{ item.label }}</span>
                </div>
                <div class="flex items-baseline gap-1 pl-28">
                  <span class="text-sm font-bold text-gray-700" :class="{ 'text-[#58c193]': item.highlight }">{{ item.value }}</span>
                  <span class="text-[11px] text-gray-400">{{ item.unit }}</span>
                  <span v-if="item.sub" class="text-[11px] text-gray-300 ml-1">({{ item.sub }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部：营养摄入通栏 -->
          <div class="mt-8 bg-[#f9fafb] rounded-[20px] p-6 flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="text-[12px] font-bold text-gray-700">推荐每日摄入</span>
                <el-tooltip placement="top" effect="light" raw-content>
                  <template #content>
                    <div class="text-xs leading-relaxed">
                      <div class="font-bold mb-1">Mifflin-St Jeor 公式</div>
                      <div>BMR = 10×体重 + 6.25×身高 - 5×年龄 + 性别系数</div>
                      <div>TDEE = BMR × 1.375（轻度活动）</div>
                      <div class="mt-1 text-gray-400">目标调整：减脂×0.8 / 保持×1.0 / 增肌×1.15</div>
                      <div v-if="!hasCompleteProfile" class="mt-1 text-[#f59e0b]">当前数据不完整，缺项已用默认值估算</div>
                    </div>
                  </template>
                  <el-icon size="14" class="text-gray-400 cursor-help hover:text-[#58c193]"><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-[26px] font-bold text-[#58c193]">{{ recommendedCal }}</span>
                <span class="text-[11px] text-[#58c193] font-medium">kcal</span>
              </div>
            </div>

            <div class="flex gap-12 mr-6">
              <div v-for="n in nutrition" :key="n.label" class="flex flex-col items-center">
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-2 h-2 rounded-full" :class="n.dotColor"></span>
                  <span class="text-[11px] text-gray-400">{{ n.label }}</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <span class="text-[18px] font-bold text-gray-800">{{ n.value }}</span>
                  <span class="text-[11px] text-gray-400">{{ n.unit }}</span>
                </div>
                <span class="text-[10px] text-gray-300 mt-0.5">{{ n.percent }}</span>
              </div>
            </div>
          </div>

          <!-- AI 智能提示 -->
          <div class="mt-6 bg-gradient-to-r from-[#f0fdf6] to-[#f8fafc] rounded-2xl p-4 border border-green-50">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-4 h-4 text-[#58c193]"><use href="#icon-gemini-spark"/></svg>
              <span class="text-xs font-bold text-[#58c193]">AI 营养师建议</span>
              <span class="text-[10px] text-gray-300 ml-auto">根据你的画像生成</span>
            </div>
            <p v-if="aiTipLoading" class="text-[13px] text-gray-400 leading-relaxed">AI 正在分析你的身体数据...</p>
            <p v-else class="text-[13px] text-gray-600 leading-relaxed">{{ aiTip || '完善个人信息后，AI 将为你生成个性化饮食建议。' }}</p>
          </div>

          <p class="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            ⓘ AI 生成内容仅供参考，请结合自身情况合理搭配饮食
          </p>

        </div>
      </div>
    </div>

    <!-- ==================== 编辑信息 ==================== -->
    <div v-if="activeTab === 'edit'" class="w-full max-w-[900px] mx-auto">
      <div class="bg-white rounded-[24px] shadow-sm border border-white relative overflow-hidden">
        <!-- 右上角返回 -->
        <div class="absolute top-6 right-8 z-20">
          <el-button link @click="activeTab = 'info'" class="!text-gray-400 hover:!text-[#58c193] !text-sm">
            <el-icon size="16"><ArrowLeft /></el-icon> 返回
          </el-button>
        </div>

        <div class="p-8 relative z-10">
          <div class="flex items-center gap-2 mb-6 text-[#34b57a] font-bold text-sm">
            <el-icon size="18"><EditPen /></el-icon> 编辑信息
          </div>

          <el-tabs v-model="formTab" class="custom-tabs mb-6">
            <el-tab-pane label="基本信息" name="base" />
            <el-tab-pane label="账号安全" name="safe" />
          </el-tabs>

          <!-- 基本信息 -->
          <div v-show="formTab === 'base'" class="flex gap-10">
            <!-- 左侧头像 -->
            <div class="flex flex-col items-center shrink-0">
              <div class="w-[90px] h-[90px] rounded-full border-2 border-[#f8fafc] shadow-sm overflow-hidden mb-3">
                <img :src="userStore.avatarUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" class="w-full h-full object-cover" />
              </div>
              <input ref="avatarInputRef" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
              <el-button class="!rounded-lg !text-xs !px-3" :loading="avatarLoading" @click="avatarInputRef?.click()">更换头像</el-button>
              <p class="text-[10px] text-gray-300 mt-1.5 text-center">JPG/PNG，≤2MB</p>
            </div>

            <!-- 右侧表单 -->
            <div class="flex-1 space-y-5 max-w-[480px]">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-20 shrink-0">年龄</span>
                <el-input v-model="form.age" type="number" :min="18" class="edit-input flex-1">
                  <template #suffix><span class="text-gray-300 text-xs">岁</span></template>
                </el-input>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-20 shrink-0">身高</span>
                <el-input v-model="form.height" type="number" class="edit-input flex-1">
                  <template #suffix><span class="text-gray-300 text-xs">cm</span></template>
                </el-input>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-20 shrink-0">体重</span>
                <el-input v-model="form.weight" type="number" class="edit-input flex-1">
                  <template #suffix><span class="text-gray-300 text-xs">kg</span></template>
                </el-input>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-20 shrink-0">健康目标</span>
                <div class="flex gap-3">
                  <div
                    v-for="g in goalOptions" :key="g.value"
                    class="goal-pill"
                    :class="{ active: form.goal === g.value }"
                    @click="form.goal = g.value"
                  >
                    {{ g.label }}
                  </div>
                </div>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-20 shrink-0">性别</span>
                <div class="flex gap-3">
                  <div
                    v-for="g in [{ label: '未知', value: 0 }, { label: '男', value: 1 }, { label: '女', value: 2 }]"
                    :key="g.value"
                    class="goal-pill"
                    :class="{ active: form.gender === g.value }"
                    @click="form.gender = g.value"
                  >
                    {{ g.label }}
                  </div>
                </div>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-20 shrink-0">账号名称</span>
                <el-input v-model="form.name" class="edit-input flex-1" />
              </div>
              <div class="pt-2 text-center">
                <el-button type="primary" class="save-btn-sm" :loading="saveLoading" @click="handleSaveProfile">保存修改</el-button>
              </div>
            </div>
          </div>

          <!-- 账号安全 -->
          <div v-show="formTab === 'safe'" class="max-w-[480px] mx-auto space-y-5">
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-20 shrink-0">当前密码</span>
              <el-input v-model="form.password" type="password" show-password placeholder="请输入当前密码" class="edit-input flex-1" />
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-20 shrink-0">新密码</span>
              <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码" class="edit-input flex-1" />
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-20 shrink-0">确认密码</span>
              <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" class="edit-input flex-1" />
            </div>
            <div class="pt-2 text-center">
              <el-button type="primary" class="save-btn-sm" :loading="pwdLoading" @click="handleUpdatePassword">更新安全信息</el-button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </AppPageBg>
</template>

<style scoped lang="scss">

.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-pill {
  padding: 8px 22px;
  border-radius: 20px;
  font-size: 13px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;

  &:hover { color: #58c193; }
  &.active {
    background: #58c193;
    color: #fff;
    font-weight: 600;
  }
}

.custom-tabs {
  :deep(.el-tabs__header) { margin-bottom: 0; }
  :deep(.el-tabs__nav-wrap::after) { height: 1px; background-color: #f1f5f9; }
  :deep(.el-tabs__active-bar) { background-color: #34b57a; height: 3px; border-radius: 3px; }
  :deep(.el-tabs__item) {
    color: #94a3b8; font-size: 15px; padding: 0 24px;
    &.is-active { color: #34b57a; font-weight: bold; }
  }
}

.edit-input {
  :deep(.el-input__wrapper) {
    background-color: #fcfdfe;
    box-shadow: none !important;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    height: 48px;
    padding: 0 16px;
    &.is-focus { border-color: #34b57a; }
  }
}

.goal-pill {
  padding: 10px 24px;
  background: #fcfdfe;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;

  &:hover { border-color: #34b57a; color: #34b57a; }
  &.active {
    background: #e6f7ef;
    border-color: #34b57a;
    color: #34b57a;
    font-weight: bold;
  }
}

.save-btn {
  width: 100%;
  height: 52px !important;
  background-color: #34b57a !important;
  border: none !important;
  border-radius: 14px !important;
  font-size: 16px !important;
  font-weight: bold !important;
  box-shadow: 0 10px 20px -5px rgba(52, 181, 122, 0.2);
  &:hover { background-color: #2da16d !important; transform: translateY(-1px); }
}

.save-btn-sm {
  height: 40px !important;
  padding: 0 32px !important;
  background-color: #34b57a !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  &:hover { background-color: #2da16d !important; }
}

.action-btn-sm-gray {
  height: 36px !important;
  border-radius: 10px !important;
  border: 1px solid #f1f5f9 !important;
  color: #64748b !important;
  background: #fafafa !important;
  font-size: 13px !important;
}

.action-btn-sm-red {
  height: 36px !important;
  border-radius: 10px !important;
  border: 1px solid #fee2e2 !important;
  background: #fff9f9 !important;
  color: #f87171 !important;
  font-size: 13px !important;
}

.shadow-sm {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03);
}
</style>
