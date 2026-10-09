<template>
  <q-page class="vet-page q-pb-xl">
    <!-- Hero Banner -->
    <div class="hero-section">
      <div class="hero-bg-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <q-icon name="medical_services" size="18px" class="q-mr-xs" />
          VetClinic Pro Management
        </div>
        <h1 class="hero-title">Panel de Control & Dashboard</h1>
        <p class="hero-subtitle">
          Supervisión integral de dueños, pacientes, consultas médicas y tratamientos
        </p>

        <!-- Quick Summary Pills -->
        <div class="hero-stats-row q-mt-lg">
          <div class="hero-pill">
            <q-icon name="person" color="purple-3" size="16px" />
            <span>{{ duenosStore.totalActivos }} Dueños Activos</span>
          </div>
          <div class="hero-pill" v-if="duenosStore.totalInactivos > 0">
            <q-icon name="no_accounts" color="red-4" size="16px" />
            <span>{{ duenosStore.totalInactivos }} Dueños Inactivos</span>
          </div>
          <div class="hero-pill">
            <q-icon name="pets" color="amber-4" size="16px" />
            <span>{{ mascotasStore.total }} Mascotas Registradas</span>
          </div>
          <div class="hero-pill">
            <q-icon name="event_note" color="teal-3" size="16px" />
            <span>{{ visitasStore.total }} Visitas Médicas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Metric Cards Grid (Larger & Better Distributed) -->
    <div class="dashboard-container">
      <div class="section-header q-mb-md">
        <div class="section-title">
          <q-icon name="analytics" size="24px" class="q-mr-sm" style="color:#6c63ff" />
          Métricas Principales del Sistema
        </div>
        <div class="section-desc">Haga clic en cualquier tarjeta para gestionar el módulo correspondiente</div>
      </div>

      <div class="stats-grid">
        <!-- 1. Dueños Card -->
        <div
          class="stat-card"
          style="--accent:#6c63ff; --accent-glow:rgba(108,99,255,0.25)"
          @click="$router.push('/duenos')"
        >
          <div class="stat-card-top">
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,#6c63ff,#a084ee)">
              <q-icon name="person" size="30px" color="white" />
            </div>
            <div class="stat-badge-group">
              <q-badge color="positive" class="stat-status-badge">
                {{ duenosStore.totalActivos }} Activos
              </q-badge>
              <q-badge color="deep-orange-9" class="stat-status-badge" v-if="duenosStore.totalInactivos > 0">
                {{ duenosStore.totalInactivos }} Inactivos
              </q-badge>
            </div>
          </div>

          <div class="stat-body q-mt-md">
            <div class="stat-count" v-if="!duenosStore.loading">{{ duenosStore.total }}</div>
            <q-spinner v-else color="purple-4" size="28px" />
            <div class="stat-label">Propietarios / Dueños</div>
            <div class="stat-sub">Gestión de datos de contacto y estado activo/inactivo</div>
          </div>

          <div class="stat-footer">
            <span>Ver módulo de Dueños</span>
            <q-icon name="arrow_forward" size="16px" class="stat-arrow" />
          </div>
        </div>

        <!-- 2. Veterinarios Card -->
        <div
          class="stat-card"
          style="--accent:#48cae4; --accent-glow:rgba(72,202,228,0.25)"
          @click="$router.push('/veterinarios')"
        >
          <div class="stat-card-top">
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,#00b4d8,#48cae4)">
              <q-icon name="medical_services" size="30px" color="white" />
            </div>
            <q-badge color="cyan-9" class="q-px-sm">Personal Médico</q-badge>
          </div>

          <div class="stat-body q-mt-md">
            <div class="stat-count" v-if="!veterinariosStore.loading">{{ veterinariosStore.total }}</div>
            <q-spinner v-else color="cyan-4" size="28px" />
            <div class="stat-label">Veterinarios Especialistas</div>
            <div class="stat-sub">Médicos capacitados y tarifas de consulta</div>
          </div>

          <div class="stat-footer">
            <span>Ver Veterinarios</span>
            <q-icon name="arrow_forward" size="16px" class="stat-arrow" />
          </div>
        </div>

        <!-- 3. Mascotas Card -->
        <div
          class="stat-card"
          style="--accent:#f7b731; --accent-glow:rgba(247,183,49,0.25)"
          @click="$router.push('/mascotas')"
        >
          <div class="stat-card-top">
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,#f7b731,#ffa502)">
              <q-icon name="pets" size="30px" color="white" />
            </div>
            <q-badge color="amber-9" class="q-px-sm">Pacientes</q-badge>
          </div>

          <div class="stat-body q-mt-md">
            <div class="stat-count" v-if="!mascotasStore.loading">{{ mascotasStore.total }}</div>
            <q-spinner v-else color="amber-4" size="28px" />
            <div class="stat-label">Mascotas Registradas</div>
            <div class="stat-sub">Perros, gatos, aves y especies exóticas</div>
          </div>

          <div class="stat-footer">
            <span>Ver Mascotas</span>
            <q-icon name="arrow_forward" size="16px" class="stat-arrow" />
          </div>
        </div>

        <!-- 4. Visitas Card -->
        <div
          class="stat-card"
          style="--accent:#26de81; --accent-glow:rgba(38,222,129,0.25)"
          @click="$router.push('/visitas')"
        >
          <div class="stat-card-top">
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,#26de81,#20bf6b)">
              <q-icon name="event_note" size="30px" color="white" />
            </div>
            <q-badge color="teal-9" class="q-px-sm">Historial Clínico</q-badge>
          </div>

          <div class="stat-body q-mt-md">
            <div class="stat-count" v-if="!visitasStore.loading">{{ visitasStore.total }}</div>
            <q-spinner v-else color="teal-4" size="28px" />
            <div class="stat-label">Visitas Médicas</div>
            <div class="stat-sub">Consultas con estados de pago y diagnósticos</div>
          </div>

          <div class="stat-footer">
            <span>Ver Historial de Visitas</span>
            <q-icon name="arrow_forward" size="16px" class="stat-arrow" />
          </div>
        </div>

        <!-- 5. Tratamientos Card -->
        <div
          class="stat-card"
          style="--accent:#fd9644; --accent-glow:rgba(253,150,68,0.25)"
          @click="$router.push('/tratamientos')"
        >
          <div class="stat-card-top">
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,#fd9644,#fa8231)">
              <q-icon name="medication" size="30px" color="white" />
            </div>
            <q-badge color="orange-9" class="q-px-sm">Procedimientos</q-badge>
          </div>

          <div class="stat-body q-mt-md">
            <div class="stat-count" v-if="!tratamientosStore.loading">{{ tratamientosStore.total }}</div>
            <q-spinner v-else color="orange-4" size="28px" />
            <div class="stat-label">Tratamientos Médicos</div>
            <div class="stat-sub">Medicaciones, vacunas y controles agendados</div>
          </div>

          <div class="stat-footer">
            <span>Ver Tratamientos</span>
            <q-icon name="arrow_forward" size="16px" class="stat-arrow" />
          </div>
        </div>
      </div>

      <!-- Quick Actions & System Overview Split Section -->
      <div class="dashboard-split-row q-mt-xl">
        <!-- Acciones Rápidas -->
        <div class="split-col-left">
          <div class="section-title q-mb-md">
            <q-icon name="bolt" size="22px" class="q-mr-xs" style="color:#f7b731" />
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
                <q-icon :name="action.icon" size="24px" color="white" />
              </div>
              <div class="qa-text">
                <div class="qa-label">{{ action.label }}</div>
                <div class="qa-sub">{{ action.sub }}</div>
              </div>
              <q-icon name="chevron_right" size="20px" class="qa-arrow" />
            </div>
          </div>
        </div>

        <!-- Estado del Sistema -->
        <div class="split-col-right">
          <div class="section-title q-mb-md">
            <q-icon name="pie_chart" size="22px" class="q-mr-xs" style="color:#26de81" />
            Resumen Operativo
          </div>

          <div class="system-status-card">
            <div class="status-row">
              <div class="status-label-group">
                <q-icon name="people" color="purple-4" size="20px" class="q-mr-xs" />
                <span>Estado de Dueños</span>
              </div>
              <div class="status-val">
                {{ duenosStore.totalActivos }} activos / {{ duenosStore.totalInactivos }} inactivos
              </div>
            </div>
            <q-linear-progress
              :value="duenosStore.total > 0 ? (duenosStore.totalActivos / duenosStore.total) : 1"
              color="purple-5"
              track-color="red-9"
              class="q-mt-xs status-bar"
            />

            <div class="status-row q-mt-lg">
              <div class="status-label-group">
                <q-icon name="pets" color="amber-4" size="20px" class="q-mr-xs" />
                <span>Mascotas por Dueño</span>
              </div>
              <div class="status-val">
                ~{{ duenosStore.totalActivos > 0 ? (mascotasStore.total / duenosStore.totalActivos).toFixed(1) : 0 }} por propietario
              </div>
            </div>
            <q-linear-progress
              value="0.85"
              color="amber-5"
              track-color="grey-9"
              class="q-mt-xs status-bar"
            />

            <div class="status-row q-mt-lg">
              <div class="status-label-group">
                <q-icon name="health_and_safety" color="teal-4" size="20px" class="q-mr-xs" />
                <span>Atención Médica Activa</span>
              </div>
              <div class="status-val">100% operativo</div>
            </div>
            <q-linear-progress
              value="1"
              color="teal-4"
              track-color="grey-9"
              class="q-mt-xs status-bar"
            />
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

/* Hero Section */
.hero-section {
  position: relative;
  padding: 44px 32px 32px;
  overflow: hidden;
  text-align: center;
  background: linear-gradient(180deg, rgba(108,99,255,0.08) 0%, rgba(15,17,23,0) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.hero-bg-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 550px;
  height: 240px;
  background: radial-gradient(ellipse, rgba(108,99,255,0.35) 0%, transparent 70%);
  pointer-events: none;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(108,99,255,0.15);
  border: 1px solid rgba(108,99,255,0.3);
  color: #a084ee;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 10px;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 15px;
  color: rgba(255,255,255,0.55);
  margin: 0 auto;
  max-width: 600px;
}

.hero-stats-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.hero-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
}

/* Container */
.dashboard-container {
  max-width: 1340px;
  margin: 0 auto;
  padding: 24px 28px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
}

.section-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  margin-top: 2px;
}

/* Stats Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(145deg, rgba(26,29,46,0.9), rgba(19,22,34,0.9));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--accent);
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 12px 32px var(--accent-glow);
}

.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

.stat-badge-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  margin-left: auto;
}

.stat-status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.2px;
}

.stat-count {
  font-size: 34px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.stat-label {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  margin-top: 6px;
}

.stat-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  margin-top: 4px;
  line-height: 1.4;
}

.stat-footer {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  transition: all 0.2s ease;
}

.stat-card:hover .stat-footer {
  padding-left: 4px;
}

.stat-arrow {
  transition: transform 0.2s ease;
}

.stat-card:hover .stat-arrow {
  transform: translateX(4px);
}

/* Split Section */
.dashboard-split-row {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

@media (max-width: 960px) {
  .dashboard-split-row {
    grid-template-columns: 1fr;
  }
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.quick-action-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.quick-action-card:hover {
  background: rgba(108,99,255,0.12);
  border-color: rgba(108,99,255,0.35);
  transform: translateY(-2px);
}

.qa-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-text {
  flex: 1;
}

.qa-label {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.qa-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  margin-top: 2px;
}

.qa-arrow {
  color: rgba(255,255,255,0.3);
  transition: transform 0.2s ease;
}

.quick-action-card:hover .qa-arrow {
  color: #fff;
  transform: translateX(3px);
}

/* System Status Card */
.system-status-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 24px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
}

.status-label-group {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.status-val {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.status-bar {
  height: 6px;
  border-radius: 10px;
}
</style>
