import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({
    id: null,
    username: '',
    age: null,
    height: null,
    weight: null,
    goal: '',
    gender: 0,
    avatar: '',
  })

  const avatarUrl = computed(() => userInfo.value.avatar || '')

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info) {
    userInfo.value = { ...userInfo.value, ...info }
  }

  function logout() {
    token.value = ''
    userInfo.value = {
      id: null,
      username: '',
      age: null,
      height: null,
      weight: null,
      goal: '',
      gender: 0,
      avatar: '',
    }
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    avatarUrl,
    isLoggedIn,
    setToken,
    setUserInfo,
    logout,
  }
})
