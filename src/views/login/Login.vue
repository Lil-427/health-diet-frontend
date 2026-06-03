<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Leaf, User, Lock, EyeOff, Eye, UserPlus } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import AppSidebar from '@/components/AppSidebar.vue'
import AuthPromo from './AuthPromo.vue'
import { appMenus } from '@/config/menus.js'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/auth'
import { useSidebarCollapse } from '@/composables/useSidebarCollapse'

defineOptions({ name: 'Login' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const menus = appMenus
const { isCollapse, handleToggle } = useSidebarCollapse()

const username = ref('')
const password = ref('')
const showPwd = ref(false)
const loading = ref(false)
const errors = reactive({ username: '', password: '' })

function clearError(field) {
  errors[field] = ''
}

function validateUsername() {
  errors.username = !username.value.trim() ? '请输入用户名' : ''
}

function validatePassword() {
  errors.password = !password.value.trim() ? '请输入密码' : ''
}

function handleNav(path) {
  router.push(path)
}

async function handleLogin() {
  validateUsername()
  validatePassword()

  if (errors.username || errors.password) return

  loading.value = true
  try {
    const res = await login({ username: username.value, password: password.value })
    userStore.setToken(res.token)
    userStore.setUserInfo({ id: res.userId, username: res.username })
    ElMessage.success('登录成功')
    let redirect = route.query.redirect
    if (!redirect || redirect === '/') redirect = '/app/dashboard'
    await router.replace(redirect)
  } catch (e) {
    const msg = e?.message || '登录失败'
    if (msg.includes('用户') || msg.includes('不存在')) {
      errors.username = msg
    } else if (msg.includes('密码')) {
      errors.password = msg
    } else {
      ElMessage.error(msg)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page flex h-screen bg-[#F8FAFC]">
    <AppSidebar :menu-items="menus" active-path="/" :collapsed="isCollapse" @nav="handleNav" @toggle="handleToggle" />

    <main class="flex-1 flex items-center justify-center pl-8 pr-20 overflow-y-auto">
      <div class="w-full max-w-6xl flex items-center gap-10">
        <AuthPromo />

        <div class="w-[400px] bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-8 border border-slate-50">
          <div class="mb-5">
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              欢迎回来 <Leaf class="text-[#3BB371]" :size="24" />
            </h2>
            <p class="text-slate-400 text-sm mt-1.5">登录 Nutri AI，开启健康饮食之旅</p>
          </div>

          <form class="space-y-4" @submit.prevent="handleLogin">
            <div class="relative group">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input
                v-model="username"
                type="text"
                placeholder="请输入用户名"
                :class="[
                  'w-full pl-12 pr-4 py-3.5 border rounded-2xl outline-none transition-all text-slate-600',
                  errors.username
                    ? 'bg-red-50 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-100 focus:border-[#3BB371] focus:bg-white'
                ]"
                @input="clearError('username')"
                @blur="validateUsername"
              />
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

            <button
              :disabled="loading"
              class="w-full py-3 bg-[#3BB371] hover:bg-[#329e63] text-white rounded-2xl font-semibold text-base shadow-lg shadow-green-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {{ loading ? '登录中...' : '登录' }}
            </button>

            <div class="relative flex items-center py-2">
              <div class="flex-grow border-t border-slate-100"></div>
              <span class="flex-shrink mx-4 text-slate-300 text-sm">或</span>
              <div class="flex-grow border-t border-slate-100"></div>
            </div>

            <button
              type="button"
              class="w-full py-2.5 border border-slate-100 hover:border-slate-200 text-slate-600 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors"
              @click="router.push('/register')"
            >
              <UserPlus class="text-slate-400" :size="16" />
              立即注册
            </button>
          </form>

        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  font-family: 'PingFang SC', 'HarmonyOS Sans', system-ui;
}
</style>
