import axios from 'axios'

// Crear instancia de Axios
// Usa variable de entorno o la ruta relativa /api para despliegue unificado
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar las respuestas y errores globalmente
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, devolvemos directamente los datos
    return response.data
  },
  (error) => {
    // Manejo de errores (por ejemplo, validaciones de express-validator)
    const errData = error.response?.data
    let msg = errData?.msg || errData?.errors?.[0]?.msg
    if (!msg && errData?.errores) {
      const primerError = Object.values(errData.errores)[0]
      msg = primerError?.msg || (typeof primerError === 'string' ? primerError : null)
    }
    return Promise.reject(new Error(msg || 'Error en la petición al servidor'))
  }
)

// ── Dueños ──────────────────────────────────────────
export const duenosAPI = {
  getAll: (params) => api.get('/duenos', { params }),
  getById: (id) => api.get(`/duenos/${id}`),
  create: (body) => api.post('/duenos', body),
  update: (id, body) => api.put(`/duenos/${id}`, body),
  delete: (id) => api.delete(`/duenos/${id}`)
}

// ── Veterinarios ─────────────────────────────────────
export const veterinariosAPI = {
  getAll: (params) => api.get('/veterinarios', { params }),
  getById: (id) => api.get(`/veterinarios/${id}`),
  create: (body) => api.post('/veterinarios', body),
  update: (id, body) => api.put(`/veterinarios/${id}`, body),
  delete: (id) => api.delete(`/veterinarios/${id}`)
}

// ── Mascotas ─────────────────────────────────────────
export const mascotasAPI = {
  getAll: () => api.get('/mascotas'),
  getById: (id) => api.get(`/mascotas/${id}`),
  create: (body) => api.post('/mascotas', body),
  update: (id, body) => api.put(`/mascotas/${id}`, body),
  delete: (id) => api.delete(`/mascotas/${id}`)
}

// ── Visitas ──────────────────────────────────────────
export const visitasAPI = {
  getAll: () => api.get('/visitas'),
  getById: (id) => api.get(`/visitas/${id}`),
  create: (body) => api.post('/visitas', body),
  update: (id, body) => api.put(`/visitas/${id}`, body),
  delete: (id) => api.delete(`/visitas/${id}`)
}

// ── Tratamientos ─────────────────────────────────────
export const tratamientosAPI = {
  getAll: () => api.get('/tratamientos'),
  getById: (id) => api.get(`/tratamientos/${id}`),
  create: (body) => api.post('/tratamientos', body),
  update: (id, body) => api.put(`/tratamientos/${id}`, body),
  delete: (id) => api.delete(`/tratamientos/${id}`)
}
