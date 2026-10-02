import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/duenos',
    name: 'duenos',
    component: () => import('../views/DuenosView.vue')
  },
  {
    path: '/veterinarios',
    name: 'veterinarios',
    component: () => import('../views/VeterinariosView.vue')
  },
  {
    path: '/mascotas',
    name: 'mascotas',
    component: () => import('../views/MascotasView.vue')
  },
  {
    path: '/visitas',
    name: 'visitas',
    component: () => import('../views/VisitasView.vue')
  },
  {
    path: '/tratamientos',
    name: 'tratamientos',
    component: () => import('../views/TratamientosView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
