import { ref, watch } from 'vue'

const STORAGE_KEY = 'sidebar-collapsed'

export function useSidebarCollapse() {
  const isCollapse = ref(localStorage.getItem(STORAGE_KEY) === 'true')

  watch(isCollapse, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
  })

  function handleToggle() {
    isCollapse.value = !isCollapse.value
  }

  return { isCollapse, handleToggle }
}
