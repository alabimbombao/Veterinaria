import { defineStore } from 'pinia'
import { veterinariosAPI } from '../services/api.js'

export const useVeterinariosStore = defineStore('veterinarios', {
  // ─── Estado ────────────────────────────────────────────
  state: () => ({
    veterinarios: [],
    loading:      false,
    saving:       false,
    deleting:     false,
    error:        null,
  }),

  // ─── Getters ───────────────────────────────────────────
  getters: {
    total:          (state) => state.veterinarios.length,
    activos:        (state) => state.veterinarios.filter(v => v.estado !== false),
    inactivos:      (state) => state.veterinarios.filter(v => v.estado === false),
    totalActivos:   (state) => state.veterinarios.filter(v => v.estado !== false).length,
    totalInactivos: (state) => state.veterinarios.filter(v => v.estado === false).length,
    getById:        (state) => (id) =>
      state.veterinarios.find(v => (v.idveterinario || v._id)?.toString() === id?.toString()),
    /** Opciones para q-select (solo activos) */
    opciones: (state) => state.veterinarios
      .filter(v => v.estado !== false)
      .map(v => ({
        label: v.especialidad ? `${v.nombre} — ${v.especialidad}` : v.nombre,
        value: v.idveterinario || v._id,
      })),
    filtrados: (state) => (q, filtroEstado = 'activos') => {
      let lista = state.veterinarios
      if (filtroEstado === 'activos') {
        lista = lista.filter(v => v.estado !== false)
      } else if (filtroEstado === 'inactivos') {
        lista = lista.filter(v => v.estado === false)
      }
      if (!q) return lista
      const term = q.toLowerCase()
      return lista.filter(v =>
        v.nombre?.toLowerCase().includes(term) ||
        v.especialidad?.toLowerCase().includes(term)
      )
    },
  },

  // ─── Actions ───────────────────────────────────────────
  actions: {
    async fetchAll() {
      this.loading = true
      this.error   = null
      try {
        const data = await veterinariosAPI.getAll({ incluirInactivos: true })
        this.veterinarios = Array.isArray(data)
          ? data
          : (Object.values(data).find(v => Array.isArray(v)) || [])
      } catch (e) {
        this.error = e.message || 'Error al cargar veterinarios'
        throw e
      } finally {
        this.loading = false
      }
    },

    async crear(payload) {
      this.saving = true
      this.error  = null
      try {
        const nuevo = await veterinariosAPI.create(payload)
        await this.fetchAll()
        return nuevo
      } catch (e) {
        this.error = e.message || 'Error al crear veterinario'
        throw e
      } finally {
        this.saving = false
      }
    },

    async actualizar(id, payload) {
      this.saving = true
      this.error  = null
      try {
        const actualizado = await veterinariosAPI.update(id, payload)
        await this.fetchAll()
        return actualizado
      } catch (e) {
        this.error = e.message || 'Error al actualizar veterinario'
        throw e
      } finally {
        this.saving = false
      }
    },

    async eliminar(id) {
      this.deleting = true
      this.error    = null
      try {
        await veterinariosAPI.delete(id)
        this.veterinarios = this.veterinarios.filter(
          v => (v.idveterinario || v._id)?.toString() !== id?.toString()
        )
      } catch (e) {
        this.error = e.message || 'Error al eliminar veterinario'
        throw e
      } finally {
        this.deleting = false
      }
    },

    clearError() { this.error = null },
  },
})
