<template>
  <q-layout view="lHh Lpf lFf" class="vet-layout">

    <!-- SIDEBAR DRAWER -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="260"
      :breakpoint="768"
      class="vet-drawer"
    >
      <!-- Logo / Brand -->
      <div class="drawer-brand q-pa-lg">
        <div class="brand-icon">
          <q-icon name="pets" size="32px" />
        </div>
        <div class="brand-text">
          <div class="brand-name">VetClinic</div>
          <div class="brand-sub">Sistema de Gestión</div>
        </div>
      </div>

      <q-separator color="white" opacity="0.12" />

      <!-- Navigation -->
      <q-list class="nav-list q-pt-md">
        <q-item
          v-for="item in navItems"
          :key="item.route"
          clickable
          :to="item.route"
          active-class="nav-item-active"
          class="nav-item q-mb-xs"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="22px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="nav-label">{{ item.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Footer -->
      <div class="drawer-footer">
        <q-separator color="white" opacity="0.12" />
        <div class="footer-content q-pa-md">
          <q-icon name="favorite" color="red-4" size="16px" />
          <span class="footer-text q-ml-sm">Clínica Veterinaria</span>
        </div>
      </div>
    </q-drawer>

    <!-- HEADER -->
    <q-header class="vet-header">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          :icon="drawer ? 'menu_open' : 'menu'"
          @click="drawer = !drawer"
          class="menu-btn"
        />
        <q-toolbar-title class="header-title">
          {{ currentPageTitle }}
        </q-toolbar-title>
        <div class="header-actions">
          <q-chip
            icon="circle"
            color="green-5"
            text-color="white"
            size="sm"
            label="En línea"
            class="status-chip"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- MAIN CONTENT -->
    <q-page-container class="vet-page-container">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const drawer = ref(true)
const route = useRoute()

const navItems = [
  { label: 'Dashboard',     icon: 'dashboard',       route: '/' },
  { label: 'Dueños',        icon: 'person',          route: '/duenos' },
  { label: 'Veterinarios',  icon: 'medical_services', route: '/veterinarios' },
  { label: 'Mascotas',      icon: 'pets',            route: '/mascotas' },
  { label: 'Visitas',       icon: 'event_note',      route: '/visitas' },
  { label: 'Tratamientos',  icon: 'medication',      route: '/tratamientos' },
]

const pageTitles = {
  '/':               'Dashboard',
  '/duenos':         'Gestión de Dueños',
  '/veterinarios':   'Gestión de Veterinarios',
  '/mascotas':       'Gestión de Mascotas',
  '/visitas':        'Gestión de Visitas',
  '/tratamientos':   'Gestión de Tratamientos',
}

const currentPageTitle = computed(() => pageTitles[route.path] || 'VetClinic')
</script>

<style>
/* ── Google Fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, .q-body--prevent-scroll {
  font-family: 'Inter', sans-serif !important;
}

/* ── Layout ── */
.vet-layout {
  background: #0f1117 !important;
}

/* ── Drawer ── */
.vet-drawer {
  background: linear-gradient(180deg, #1a1d2e 0%, #151824 100%) !important;
  border-right: 1px solid rgba(255,255,255,0.06) !important;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 20px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6c63ff, #48cae4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.3px;
}

.brand-sub {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  margin-top: 1px;
}

/* ── Nav Items ── */
.nav-list {
  padding: 8px 12px;
}

.nav-item {
  border-radius: 12px;
  color: rgba(255,255,255,0.6) !important;
  transition: all 0.2s ease;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: rgba(108, 99, 255, 0.12) !important;
  color: rgba(255,255,255,0.9) !important;
}

.nav-item-active {
  background: linear-gradient(135deg, rgba(108,99,255,0.25), rgba(72,202,228,0.15)) !important;
  color: #ffffff !important;
  border: 1px solid rgba(108,99,255,0.3);
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

/* ── Header ── */
.vet-header {
  background: rgba(21, 24, 36, 0.95) !important;
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
  backdrop-filter: blur(20px);
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.menu-btn {
  color: rgba(255,255,255,0.7) !important;
}

.status-chip {
  font-size: 11px;
}

/* ── Page Container ── */
.vet-page-container {
  background: #0f1117;
}

/* ── Transitions ── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ── Drawer footer ── */
.drawer-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}
.footer-content {
  display: flex;
  align-items: center;
}
.footer-text {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
}

/* ── Global Card ── */
.vet-card {
  background: #1a1d2e !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  border-radius: 16px !important;
  color: #fff !important;
}

/* ── Table ── */
.vet-table {
  background: transparent !important;
  color: #fff !important;
}

.vet-table .q-table__top,
.vet-table thead tr th {
  background: #1a1d2e !important;
  color: rgba(255,255,255,0.5) !important;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.vet-table tbody tr td {
  background: #1a1d2e !important;
  color: rgba(255,255,255,0.85) !important;
  border-color: rgba(255,255,255,0.06) !important;
}

.vet-table tbody tr:hover td {
  background: rgba(108,99,255,0.1) !important;
}

.vet-table .q-table__bottom {
  background: #1a1d2e !important;
  color: rgba(255,255,255,0.5) !important;
}

/* ── Dialog ── */
.vet-dialog .q-card {
  background: #1a1d2e !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: 16px !important;
  color: #fff !important;
}

.vet-dialog .q-card__section--vert {
  color: rgba(255,255,255,0.85) !important;
}

/* ── Input ── */
.vet-input .q-field__control {
  background: rgba(255,255,255,0.05) !important;
  border-radius: 10px !important;
}

.vet-input .q-field__label {
  color: rgba(255,255,255,0.5) !important;
}

.vet-input .q-field__native {
  color: #fff !important;
}

.vet-input.q-field--focused .q-field__control {
  border: 1px solid #6c63ff !important;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0f1117; }
::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.4); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(108,99,255,0.7); }
</style>
