<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Leaf, User, Lock, EyeOff, Eye } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import AppSidebar from '@/components/AppSidebar.vue'
import AuthPromo from './AuthPromo.vue'
import { appMenus } from '@/config/menus.js'
import { register } from '@/api/auth'

defineOptions({ name: 'Register' })

const router = useRouter()
const menus = appMenus

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPwd = ref(false)
const showConfirmPwd = ref(false)
const loading = ref(false)

const passwordValid = computed(() => ({
  minLen: password.value.length >= 8,
  hasLetter: /[a-zA-Z]/.test(password.value),
  hasNumber: /[0-9]/.test(password.value),
}))

const passwordOk = computed(() =>
  passwordValid.value.minLen && passwordValid.value.hasLetter && passwordValid.value.hasNumber
)

function checkLabel(ok) {
  return ok ? 'text-green-500' : 'text-slate-400'
}

function handleNav(path) {
  router.push(path)
}

async function handleRegister() {
  if (!username.value.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (username.value.trim().length > 10) {
    ElMessage.warning('用户名不能超过10个字符')
    return
  }
  if (!password.value) {
    ElMessage.warning('请输入密码')
    return
  }
  if (!passwordOk.value) {
    ElMessage.warning('密码需要至少8位，包含字母和数字')
    return
  }
  if (password.value !== confirmPassword.value) {
    ElMessage.warning('两次密码输入不一致')
    return
  }
  loading.value = true
  try {
    await register({ username: username.value.trim(), password: password.value })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch {
    ElMessage.error('注册失败，用户名可能已存在')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page flex h-screen bg-[#F8FAFC]">
    <AppSidebar :menu-items="menus" active-path="/" @nav="handleNav" />

    <main class="flex-1 flex items-center justify-center pl-8 pr-20 overflow-y-auto">
      <div class="w-full max-w-6xl flex items-center gap-10">
        <AuthPromo />

        <div class="w-[400px] bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-8 border border-slate-50">
          <div class="mb-5">
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              创建账号 <Leaf class="text-[#3BB371]" :size="24" />
            </h2>
            <p class="text-slate-400 text-sm mt-1.5">注册 Nutri AI，开始健康饮食之旅</p>
          </div>

          <form class="space-y-4" @submit.prevent="handleRegister">
            <div class="relative group">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input
                v-model="username"
                type="text"
                placeholder="请输入用户名"
                maxlength="10"
                class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#3BB371] focus:bg-white transition-all text-slate-600"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">{{ username.length }}/10</span>
            </div>

            <div class="relative group">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="请输入密码"
                class="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#3BB371] focus:bg-white transition-all text-slate-600"
              />
              <component
                :is="showPwd ? Eye : EyeOff"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-slate-400"
                :size="20"
                @click="showPwd = !showPwd"
              />
            </div>

            <div
              v-if="password.length > 0"
              class="flex flex-wrap gap-x-4 gap-y-1 text-xs bg-slate-50 rounded-xl px-4 py-2.5"
            >
              <span :class="checkLabel(passwordValid.minLen)">✓ 至少8位</span>
              <span :class="checkLabel(passwordValid.hasLetter)">✓ 包含字母</span>
              <span :class="checkLabel(passwordValid.hasNumber)">✓ 包含数字</span>
            </div>

            <div class="relative group">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input
                v-model="confirmPassword"
                :type="showConfirmPwd ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#3BB371] focus:bg-white transition-all text-slate-600"
              />
              <component
                :is="showConfirmPwd ? Eye : EyeOff"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-slate-400"
                :size="20"
                @click="showConfirmPwd = !showConfirmPwd"
              />
            </div>

            <button
              :disabled="loading"
              class="w-full py-3 bg-[#3BB371] hover:bg-[#329e63] text-white rounded-2xl font-semibold text-base shadow-lg shadow-green-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {{ loading ? '注册中...' : '注册' }}
            </button>

            <div class="relative flex items-center py-2">
              <div class="flex-grow border-t border-slate-100"></div>
              <span class="flex-shrink mx-4 text-slate-300 text-sm">或</span>
              <div class="flex-grow border-t border-slate-100"></div>
            </div>

            <button
              type="button"
              class="w-full py-2.5 border border-slate-100 hover:border-slate-200 text-slate-600 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors"
              @click="router.push('/login')"
            >
              已有账号？立即登录
            </button>
          </form>

          <div class="mt-5 text-center">
            <p class="text-xs text-slate-400">注册即表示您同意我们的 用户协议 和 隐私政策</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.register-page {
  font-family: 'PingFang SC', 'HarmonyOS Sans', system-ui;
}
</style>
