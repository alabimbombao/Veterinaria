import { defineStore } from 'pinia'
import { duenosAPI } from '../services/api.js'

export const useDuenosStore = defineStore('duenos', {
  // ─── Estado ────────────────────────────────────────────
  state: () => ({
    duenos:   [],
    loading:  false,
    saving:   false,
    deleting: false,
    error:    null,
  }),

  // ─── Getters ───────────────────────────────────────────
  getters: {
    total:      (state) => state.duenos.length,
    activos:    (state) => state.duenos.filter(d => d.estado !== false),
    getById:    (state) => (id) =>
      state.duenos.find(d => (d.iddueño || d._id)?.toString() === id?.toString()),
    filtrados:  (state) => (q) => {
      if (!q) return state.duenos
      const term = q.toLowerCase()
      return state.duenos.filter(d =>
        d.nombre?.toLowerCase().includes(term) ||
        d.email?.toLowerCase().includes(term)  ||
        d.telefono?.toLowerCase().includes(term)
      )
    },
  },

  // ─── Actions ───────────────────────────────────────────
  actions: {
    async fetchAll() {
      this.loading = true
      this.error   = null
      try {
        const data = await duenosAPI.getAll()
        this.duenos = Array.isArray(data)
          ? data
          : (Object.values(data).find(v => Array.isArray(v)) || [])
      } catch (e) {
        this.error = e.message || 'Error al cargar dueños'
        throw e
      } finally {
        this.loading = false
      }
    },

    async crear(payload) {
      this.saving = true
      this.error  = null
      try {
        const nuevo = await duenosAPI.create(payload)
        await this.fetchAll()
        return nuevo
      } catch (e) {
        this.error = e.message || 'Error al crear dueño'
        throw e
      } finally {
        this.saving = false
      }
    },

    async actualizar(id, payload) {
      this.saving = true
      this.error  = null
      try {
        const actualizado = await duenosAPI.update(id, payload)
        await this.fetchAll()
        return actualizado
      } catch (e) {
        this.error = e.message || 'Error al actualizar dueño'
        throw e
      } finally {
        this.saving = false
      }
    },

    async eliminar(id) {
      this.deleting = true
      this.error    = null
      try {
        await duenosAPI.delete(id)
        this.duenos = this.duenos.filter(
          d => (d.iddueño || d._id)?.toString() !== id?.toString()
        )
      } catch (e) {
        this.error = e.message || 'Error al eliminar dueño'
        throw e
      } finally {
        this.deleting = false
      }
    },

    clearError() { this.error = null },
  },
})
