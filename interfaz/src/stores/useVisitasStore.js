import { defineStore } from 'pinia'
import { visitasAPI } from '../services/api.js'

export const useVisitasStore = defineStore('visitas', {
  // ─── Estado ────────────────────────────────────────────
  state: () => ({
    visitas:  [],
    loading:  false,
    saving:   false,
    deleting: false,
    error:    null,
  }),

  // ─── Getters ───────────────────────────────────────────
  getters: {
    total:   (state) => state.visitas.length,
    activas: (state) => state.visitas.filter(v => v.estado !== false),
    getById: (state) => (id) =>
      state.visitas.find(v => (v.idvisita || v._id)?.toString() === id?.toString()),
    /** Opciones para q-select en TratamientosView */
    opciones: (state) => state.visitas.map(v => ({
      label: `${v.fechavisita
        ? new Date(v.fechavisita).toLocaleDateString('es-ES')
        : '—'} — ${v.motivoconsulta || 'Sin motivo'}`,
      value: v.idvisita || v._id,
    })),
    /** Visitas de una mascota específica */
    porMascota: (state) => (idMascota) =>
      state.visitas.filter(
        v => v.idmascota?.toString() === idMascota?.toString()
      ),
    filtradas: (state) => (q) => {
      if (!q) return state.visitas
      const term = q.toLowerCase()
      return state.visitas.filter(v =>
        v.motivoconsulta?.toLowerCase().includes(term) ||
        v.diagnostico?.toLowerCase().includes(term)    ||
        v.observaciones?.toLowerCase().includes(term)
      )
    },
  },

  // ─── Actions ───────────────────────────────────────────
  actions: {
    async fetchAll() {
      this.loading = true
      this.error   = null
      try {
        const data = await visitasAPI.getAll()
        this.visitas = Array.isArray(data)
          ? data
          : (Object.values(data).find(v => Array.isArray(v)) || [])
      } catch (e) {
        this.error = e.message || 'Error al cargar visitas'
        throw e
      } finally {
        this.loading = false
      }
    },

    async crear(payload) {
      this.saving = true
      this.error  = null
      try {
        const nueva = await visitasAPI.create(payload)
        await this.fetchAll()
        return nueva
      } catch (e) {
        this.error = e.message || 'Error al crear visita'
        throw e
      } finally {
        this.saving = false
      }
    },

    async actualizar(id, payload) {
      this.saving = true
      this.error  = null
      try {
        const actualizada = await visitasAPI.update(id, payload)
        await this.fetchAll()
        return actualizada
      } catch (e) {
        this.error = e.message || 'Error al actualizar visita'
        throw e
      } finally {
        this.saving = false
      }
    },

    async eliminar(id) {
      this.deleting = true
      this.error    = null
      try {
        await visitasAPI.delete(id)
        this.visitas = this.visitas.filter(
          v => (v.idvisita || v._id)?.toString() !== id?.toString()
        )
      } catch (e) {
        this.error = e.message || 'Error al eliminar visita'
        throw e
      } finally {
        this.deleting = false
      }
    },

    clearError() { this.error = null },
  },
})
