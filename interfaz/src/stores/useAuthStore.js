import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token
  },

  actions: {
    setUser(userData) {
      this.user = userData
      this.isAuthenticated = true
    },
    setToken(token) {
      this.token = token
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
    }
  },

  // Configuración de pinia-plugin-persistedstate
  persist: true
})
