<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'

defineOptions({ name: 'AppSidebar' })

defineProps({
  menuItems: { type: Array, default: () => [] },
  activePath: { type: String, default: '' },
  collapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['nav', 'toggle'])
const router = useRouter()
const userStore = useUserStore()
const popVisible = ref(false)

function handleAction(action) {
  popVisible.value = false
  if (action === 'login') {
    router.push('/login')
  } else if (action === 'logout') {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<template>
  <!-- Gemini 菱形图标 SVG symbol -->
  <svg style="display: none">
    <symbol id="icon-gemini-spark" viewBox="0 0 24 24">
      <path
        d="M12 2.5C12 2.5 13.2 8.5 16.5 11.5C19.8 14.5 23 14.5 23 14.5C23 14.5 17 15.5 14 18.5C11 21.5 11 24.5 11 24.5C11 24.5 10 18.5 7 15.5C4 12.5 1 12.5 1 12.5C1 12.5 7 11.5 10 8.5C13 5.5 12 2.5 12 2.5Z"
        fill="currentColor"
      />
      <path
        d="M19 3.5C19 3.5 19.5 5.5 21 6.5C22.5 7.5 24 7.5 24 7.5C24 7.5 22.5 8 21.5 9.5C20.5 11 20.5 12.5 20.5 12.5C20.5 12.5 20 10.5 18.5 9.5C17 8.5 15.5 8.5 15.5 8.5C15.5 8.5 17 8 18 6.5C19 5 19 3.5 19 3.5Z"
        fill="currentColor"
        opacity="0.6"
      />
    </symbol>
  </svg>

  <aside
    :style="{ width: collapsed ? '64px' : '240px' }"
    class="sidebar bg-white flex flex-col z-20 shadow-[2px_0_24px_rgba(0,0,0,0.04)] transition-all duration-300 overflow-hidden h-full p-6 relative"
    :class="{ 'px-2': collapsed }"
  >
    <!-- Logo -->
    <div :class="['flex items-center gap-3 mb-10 px-2', collapsed ? 'justify-center' : '']">
      <img src="@/assets/images/logo.png" alt="Logo" class="w-10 h-10 object-contain flex-shrink-0" />
      <span v-if="!collapsed" class="text-lg font-bold tracking-tight text-gray-700 whitespace-nowrap">Nutri AI</span>
    </div>

    <!-- 菜单项 -->
    <nav class="flex-1 space-y-2.5 px-2">
      <div
        v-for="item in menuItems"
        :key="item.path"
        :class="[
          'flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer text-[15px]',
          collapsed ? 'justify-center px-0' : '',
          activePath === item.path
            ? 'bg-white shadow-md shadow-black/[0.06] text-[#42b883] font-bold'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50',
        ]"
        @click="emit('nav', item.path)"
      >
        <svg v-if="item.icon === 'AiGemini'" class="w-[22px] h-[22px] flex-shrink-0">
          <use xlink:href="#icon-gemini-spark" />
        </svg>
        <el-icon v-else size="20"><component :is="item.icon" /></el-icon>
        <span v-if="!collapsed" class="whitespace-nowrap">{{ item.title }}</span>
      </div>
    </nav>

    <!-- 用户区 -->
    <el-popover
      v-model:visible="popVisible"
      placement="right-start"
      :width="140"
      trigger="hover"
      :show-arrow="false"
      popper-class="user-popover"
    >
      <template #reference>
        <div
          :class="[
            'flex items-center gap-3 p-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all mx-2 mb-3',
            collapsed ? 'justify-center' : '',
          ]"
        >
          <el-avatar
            :size="28"
            :src="userStore.isLoggedIn ? (userStore.avatarUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png') : ''"
            class="border border-gray-100 flex-shrink-0"
          >
            <el-icon v-if="!userStore.isLoggedIn" size="16"><User /></el-icon>
          </el-avatar>
          <template v-if="!collapsed">
            <span class="text-xs font-bold flex-1 truncate">{{ userStore.isLoggedIn ? userStore.userInfo.username : '未登录' }}</span>
            <el-icon size="10" class="text-gray-400"><ArrowRight /></el-icon>
          </template>
        </div>
      </template>
      <template v-if="userStore.isLoggedIn">
        <div class="flex flex-col gap-1">
          <div class="px-3 py-2 text-xs text-gray-400">你好，{{ userStore.userInfo.username }}</div>
          <div class="border-t border-gray-100"></div>
          <div class="px-3 py-2 text-sm text-red-400 cursor-pointer hover:bg-red-50 rounded-lg transition-colors" @click="handleAction('logout')">
            退出登录
          </div>
        </div>
      </template>
      <template v-else>
        <div class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded-lg transition-colors text-gray-600" @click="handleAction('login')">
          去登录
        </div>
      </template>
    </el-popover>

    <!-- 收放按钮 - 顶部 -->
    <div :class="['absolute top-1 flex', collapsed ? 'left-1/2 -translate-x-1/2' : 'right-2']">
      <button
        class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-800 hover:text-black hover:bg-gray-200/70 transition-all cursor-pointer border-none bg-transparent"
        @click="emit('toggle')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="collapsed">
            <polyline points="9 18 15 12 9 6" />
            <polyline points="15 18 21 12 15 6" />
          </template>
          <template v-else>
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 3 12 9 6" />
          </template>
        </svg>
      </button>
    </div>
  </aside>
</template>
