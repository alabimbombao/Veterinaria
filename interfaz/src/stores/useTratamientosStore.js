import { defineStore } from 'pinia'
import { tratamientosAPI } from '../services/api.js'

export const useTratamientosStore = defineStore('tratamientos', {
  // ─── Estado ────────────────────────────────────────────
  state: () => ({
    tratamientos: [],
    loading:      false,
    saving:       false,
    deleting:     false,
    error:        null,
  }),

  // ─── Getters ───────────────────────────────────────────
  getters: {
    total:   (state) => state.tratamientos.length,
    activos: (state) => state.tratamientos.filter(t => t.estado !== false),
    getById: (state) => (id) =>
      state.tratamientos.find(t => (t.idtratamiento || t._id)?.toString() === id?.toString()),
    /** Tratamientos de una visita específica */
    porVisita: (state) => (idVisita) =>
      state.tratamientos.filter(
        t => t.idvisita?.toString() === idVisita?.toString()
      ),
    /** Próximos tratamientos (proxima_fecha >= hoy) */
    proximos: (state) => {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      return state.tratamientos
        .filter(t => t.proxima_fecha && new Date(t.proxima_fecha) >= hoy)
        .sort((a, b) => new Date(a.proxima_fecha) - new Date(b.proxima_fecha))
    },
    filtrados: (state) => (q) => {
      if (!q) return state.tratamientos
      const term = q.toLowerCase()
      return state.tratamientos.filter(t =>
        t.tipo?.toLowerCase().includes(term) ||
        t.descripcion?.toLowerCase().includes(term) ||
        t.dosis_indicaciones?.toLowerCase().includes(term)
      )
    },
  },

  // ─── Actions ───────────────────────────────────────────
  actions: {
    async fetchAll() {
      this.loading = true
      this.error   = null
      try {
        const data = await tratamientosAPI.getAll()
        this.tratamientos = Array.isArray(data)
          ? data
          : (Object.values(data).find(v => Array.isArray(v)) || [])
      } catch (e) {
        this.error = e.message || 'Error al cargar tratamientos'
        throw e
      } finally {
        this.loading = false
      }
    },

    async crear(payload) {
      this.saving = true
      this.error  = null
      try {
        const nuevo = await tratamientosAPI.create(payload)
        await this.fetchAll()
        return nuevo
      } catch (e) {
        this.error = e.message || 'Error al crear tratamiento'
        throw e
      } finally {
        this.saving = false
      }
    },

    async actualizar(id, payload) {
      this.saving = true
      this.error  = null
      try {
        const actualizado = await tratamientosAPI.update(id, payload)
        await this.fetchAll()
        return actualizado
      } catch (e) {
        this.error = e.message || 'Error al actualizar tratamiento'
        throw e
      } finally {
        this.saving = false
      }
    },

    async eliminar(id) {
      this.deleting = true
      this.error    = null
      try {
        await tratamientosAPI.delete(id)
        this.tratamientos = this.tratamientos.filter(
          t => (t.idtratamiento || t._id)?.toString() !== id?.toString()
        )
      } catch (e) {
        this.error = e.message || 'Error al eliminar tratamiento'
        throw e
      } finally {
        this.deleting = false
      }
    },

    clearError() { this.error = null },
  },
})
