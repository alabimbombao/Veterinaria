import { defineStore } from 'pinia'
import { mascotasAPI } from '../services/api.js'

export const useMascotasStore = defineStore('mascotas', {
  // ─── Estado ────────────────────────────────────────────
  state: () => ({
    mascotas: [],
    loading:  false,
    saving:   false,
    deleting: false,
    error:    null,
  }),

  // ─── Getters ───────────────────────────────────────────
  getters: {
    total:   (state) => state.mascotas.length,
    activas: (state) => state.mascotas.filter(m => m.estado !== false),
    getById: (state) => (id) =>
      state.mascotas.find(m => (m.idmascota || m._id)?.toString() === id?.toString()),
    /** Opciones para q-select (incluye especie para identificar) */
    opciones: (state) => state.mascotas.map(m => ({
      label: `${m.nombre} (${m.especie || 'N/D'})`,
      value: m.idmascota || m._id,
    })),
    /** Mascotas de un dueño específico */
    porDueno: (state) => (idDueno) =>
      state.mascotas.filter(
        m => m['iddueño']?.toString() === idDueno?.toString()
      ),
    filtradas: (state) => (q) => {
      if (!q) return state.mascotas
      const term = q.toLowerCase()
      return state.mascotas.filter(m =>
        m.nombre?.toLowerCase().includes(term) ||
        m.especie?.toLowerCase().includes(term) ||
        m.raza?.toLowerCase().includes(term)
      )
    },
  },

  // ─── Actions ───────────────────────────────────────────
  actions: {
    async fetchAll() {
      this.loading = true
      this.error   = null
      try {
        const data = await mascotasAPI.getAll()
        this.mascotas = Array.isArray(data)
          ? data
          : (Object.values(data).find(v => Array.isArray(v)) || [])
      } catch (e) {
        this.error = e.message || 'Error al cargar mascotas'
        throw e
      } finally {
        this.loading = false
      }
    },

    async crear(payload) {
      this.saving = true
      this.error  = null
      try {
        const nueva = await mascotasAPI.create(payload)
        await this.fetchAll()
        return nueva
      } catch (e) {
        this.error = e.message || 'Error al crear mascota'
        throw e
      } finally {
        this.saving = false
      }
    },

    async actualizar(id, payload) {
      this.saving = true
      this.error  = null
      try {
        const actualizada = await mascotasAPI.update(id, payload)
        await this.fetchAll()
        return actualizada
      } catch (e) {
        this.error = e.message || 'Error al actualizar mascota'
        throw e
      } finally {
        this.saving = false
      }
    },

    async eliminar(id) {
      this.deleting = true
      this.error    = null
      try {
        await mascotasAPI.delete(id)
        this.mascotas = this.mascotas.filter(
          m => (m.idmascota || m._id)?.toString() !== id?.toString()
        )
      } catch (e) {
        this.error = e.message || 'Error al eliminar mascota'
        throw e
      } finally {
        this.deleting = false
      }
    },

    clearError() { this.error = null },
  },
})
