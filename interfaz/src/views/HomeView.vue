<template>
  <q-page class="vet-page">
    <!-- Hero -->
    <div class="hero-section">
      <div class="hero-bg-glow"></div>
      <div class="hero-content">
        <div class="hero-icon">
          <q-icon name="pets" size="48px" />
        </div>
        <h1 class="hero-title">Bienvenido a VetClinic</h1>
        <p class="hero-subtitle">Sistema integral de gestión veterinaria</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid q-pa-lg">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
        :style="{ '--accent': stat.color }"
        @click="$router.push(stat.route)"
      >
        <div class="stat-icon-wrap">
          <q-icon :name="stat.icon" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-count" v-if="!stat.loading">{{ stat.store.total }}</div>
          <q-spinner v-else color="white" size="20px" />
        </div>
        <q-icon name="arrow_forward_ios" size="14px" class="stat-arrow" />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="q-px-lg q-pb-lg">
      <div class="section-title q-mb-md">
        <q-icon name="bolt" size="20px" class="q-mr-xs" style="color:#6c63ff" />
        Acciones Rápidas
      </div>
      <div class="quick-actions-grid">
        <div
          v-for="action in quickActions"
          :key="action.label"
          class="quick-action-card"
          @click="$router.push(action.route)"
        >
          <div class="qa-icon" :style="{ background: action.gradient }">
            <q-icon :name="action.icon" size="22px" color="white" />
          </div>
          <div class="qa-text">
            <div class="qa-label">{{ action.label }}</div>
            <div class="qa-sub">{{ action.sub }}</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDuenosStore } from '../stores/useDuenosStore'
import { useVeterinariosStore } from '../stores/useVeterinariosStore'
import { useMascotasStore } from '../stores/useMascotasStore'
import { useVisitasStore } from '../stores/useVisitasStore'
import { useTratamientosStore } from '../stores/useTratamientosStore'

const duenosStore = useDuenosStore()
const veterinariosStore = useVeterinariosStore()
const mascotasStore = useMascotasStore()
const visitasStore = useVisitasStore()
const tratamientosStore = useTratamientosStore()

const stats = [
  { label: 'Dueños',       icon: 'person',           color: '#6c63ff', route: '/duenos',       store: duenosStore,       loading: duenosStore.loading },
  { label: 'Veterinarios', icon: 'medical_services',  color: '#48cae4', route: '/veterinarios', store: veterinariosStore, loading: veterinariosStore.loading },
  { label: 'Mascotas',     icon: 'pets',              color: '#f7b731', route: '/mascotas',     store: mascotasStore,     loading: mascotasStore.loading },
  { label: 'Visitas',      icon: 'event_note',        color: '#26de81', route: '/visitas',      store: visitasStore,      loading: visitasStore.loading },
  { label: 'Tratamientos', icon: 'medication',        color: '#fd9644', route: '/tratamientos', store: tratamientosStore, loading: tratamientosStore.loading },
]

const quickActions = [
  { label: 'Nuevo Dueño',       sub: 'Registrar propietario',      icon: 'person_add',     gradient: 'linear-gradient(135deg,#6c63ff,#a084ee)', route: '/duenos' },
  { label: 'Nueva Mascota',     sub: 'Agregar paciente',           icon: 'cruelty_free',   gradient: 'linear-gradient(135deg,#f7b731,#ffa502)', route: '/mascotas' },
  { label: 'Agendar Visita',    sub: 'Crear cita médica',          icon: 'add_circle',     gradient: 'linear-gradient(135deg,#26de81,#0be881)', route: '/visitas' },
  { label: 'Nuevo Tratamiento', sub: 'Registrar tratamiento',      icon: 'healing',        gradient: 'linear-gradient(135deg,#fd9644,#e74c3c)', route: '/tratamientos' },
]

onMounted(async () => {
  await Promise.all([
    duenosStore.fetchAll(),
    veterinariosStore.fetchAll(),
    mascotasStore.fetchAll(),
    visitasStore.fetchAll(),
    tratamientosStore.fetchAll()
  ])
})
</script>

<style scoped>
.vet-page {
  background: #0f1117;
  min-height: 100vh;
}

/* Hero */
.hero-section {
  position: relative;
  padding: 48px 32px 40px;
  overflow: hidden;
  text-align: center;
}

.hero-bg-glow {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(108,99,255,0.3) 0%, transparent 70%);
  pointer-events: none;
}

.hero-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #6c63ff, #48cae4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
  box-shadow: 0 0 40px rgba(108,99,255,0.4);
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.hero-subtitle {
  font-size: 15px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 16px 16px 0 0;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--accent);
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-count {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.stat-arrow {
  color: rgba(255,255,255,0.25);
}

/* Quick Actions */
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.quick-action-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-card:hover {
  background: rgba(108,99,255,0.1);
  border-color: rgba(108,99,255,0.3);
  transform: translateY(-2px);
}

.qa-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-label {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.qa-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
}
</style>
