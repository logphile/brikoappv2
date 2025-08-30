import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => ({
    id: '' as string | null,
    email: '' as string | null
  }),
  actions: {
    setUser(id: string | null, email: string | null) { this.id = id; this.email = email }
  }
})
