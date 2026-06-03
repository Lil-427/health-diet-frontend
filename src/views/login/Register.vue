<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Leaf, User, Lock, EyeOff, Eye } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import AppSidebar from '@/components/AppSidebar.vue'
import AuthPromo from './AuthPromo.vue'
import { appMenus } from '@/config/menus.js'
import { register } from '@/api/auth'
import { useSidebarCollapse } from '@/composables/useSidebarCollapse'

defineOptions({ name: 'Register' })

const router = useRouter()
const menus = appMenus
const { isCollapse, handleToggle } = useSidebarCollapse()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPwd = ref(false)
const showConfirmPwd = ref(false)
const loading = ref(false)
const errors = reactive({ username: '', password: '', confirmPassword: '' })

function clearError(field) {
  errors[field] = ''
}

function validateUsername() {
  if (!username.value.trim()) {
    errors.username = '请输入用户名'
  } else if (username.value.trim().length > 10) {
    errors.username = '用户名不能超过10个字符'
  } else {
    errors.username = ''
  }
}

function validatePassword() {
  if (!password.value) {
    errors.password = '请输入密码'
  } else {
    const minLen = password.value.length >= 8
    const hasLetter = /[a-zA-Z]/.test(password.value)
    const hasNumber = /[0-9]/.test(password.value)
    errors.password = (minLen && hasLetter && hasNumber) ? '' : '密码需要至少8位，包含字母和数字'
  }
}

function validateConfirmPassword() {
  if (!confirmPassword.value) {
    errors.confirmPassword = '请再次输入密码'
  } else if (password.value !== confirmPassword.value) {
    errors.confirmPassword = '两次密码输入不一致'
  } else {
    errors.confirmPassword = ''
  }
}

function handleNav(path) {
  router.push(path)
}

async function handleRegister() {
  validateUsername()
  validatePassword()
  validateConfirmPassword()

  if (errors.username || errors.password || errors.confirmPassword) return

  loading.value = true
  try {
    await register({ username: username.value.trim(), password: password.value })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    const msg = e?.message || '注册失败'
    if (msg.includes('用户名') || msg.includes('已存在') || msg.includes('重复')) {
      errors.username = msg
    } else {
      ElMessage.error(msg)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page flex h-screen bg-[#F8FAFC]">
    <AppSidebar :menu-items="menus" active-path="/" :collapsed="isCollapse" @nav="handleNav" @toggle="handleToggle" />

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
                :class="[
                  'w-full pl-12 pr-14 py-3.5 border rounded-2xl outline-none transition-all text-slate-600',
                  errors.username
                    ? 'bg-red-50 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-100 focus:border-[#3BB371] focus:bg-white'
                ]"
                @input="clearError('username')"
                @blur="validateUsername"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">{{ username.length }}/10</span>
            </div>
            <p v-if="errors.username" class="text-red-500 text-xs pl-4 -mt-2">{{ errors.username }}</p>

            <div class="relative group">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="请输入密码"
                :class="[
                  'w-full pl-12 pr-12 py-3.5 border rounded-2xl outline-none transition-all text-slate-600',
                  errors.password
                    ? 'bg-red-50 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-100 focus:border-[#3BB371] focus:bg-white'
                ]"
                @input="clearError('password')"
                @blur="validatePassword"
              />
              <component
                :is="showPwd ? Eye : EyeOff"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-slate-400"
                :size="20"
                @click="showPwd = !showPwd"
              />
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs pl-4 -mt-2">{{ errors.password }}</p>

            <div class="relative group">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input
                v-model="confirmPassword"
                :type="showConfirmPwd ? 'text' : 'password'"
                placeholder="请再次输入密码"
                :class="[
                  'w-full pl-12 pr-12 py-3.5 border rounded-2xl outline-none transition-all text-slate-600',
                  errors.confirmPassword
                    ? 'bg-red-50 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-100 focus:border-[#3BB371] focus:bg-white'
                ]"
                @input="clearError('confirmPassword')"
                @blur="validateConfirmPassword"
              />
              <component
                :is="showConfirmPwd ? Eye : EyeOff"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-slate-400"
                :size="20"
                @click="showConfirmPwd = !showConfirmPwd"
              />
            </div>
            <p v-if="errors.confirmPassword" class="text-red-500 text-xs pl-4 -mt-2">{{ errors.confirmPassword }}</p>

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
