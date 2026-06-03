<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppSidebar from '@/components/AppSidebar.vue'
import { appMenus } from '@/config/menus.js'
import { getUserInfo } from '@/api/user'
import { useSidebarCollapse } from '@/composables/useSidebarCollapse'

defineOptions({ name: 'MainLayout' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { isCollapse, handleToggle } = useSidebarCollapse()

const menuItems = appMenus

function handleSelect(path) {
  router.push(path)
}

onMounted(async () => {
  if (userStore.token && !userStore.userInfo.username) {
    try {
      const info = await getUserInfo()
      userStore.setUserInfo(info)
    } catch { /* token失效 */ }
  }
})
</script>

<template>
  <div class="main-layout">
    <!-- 左侧导航 -->
    <AppSidebar
      :menu-items="menuItems"
      :active-path="route.path"
      :collapsed="isCollapse"
      @nav="handleSelect"
      @toggle="handleToggle"
    />

    <!-- 右侧内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-layout {
  display: flex;
  height: 100vh;
  font-family: 'PingFang SC', 'HarmonyOS Sans', system-ui;
}

.main-content {
  flex: 1;
  padding: 0 $spacing-base $spacing-base;
  overflow-y: auto;
}
</style>
