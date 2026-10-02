import { createApp } from 'vue'
import App from './App.vue'

// Vue Router
import router from './router'

// Pinia
import { createPinia } from 'pinia'

// Pinia Plugin Persistedstate
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Quasar
import { Quasar } from 'quasar'

// Quasar - importar iconos de Material Design
import '@quasar/extras/material-icons/material-icons.css'

// Quasar - importar estilos CSS base
import 'quasar/src/css/index.sass'

// ----- Crear la instancia de la app -----
const app = createApp(App)

// ----- Configurar Pinia -----
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// ----- Configurar Vue Router -----
app.use(router)

// ----- Configurar Quasar -----
app.use(Quasar, {
  plugins: {}, // aquí se pueden agregar plugins de Quasar: Dialog, Notify, etc.
})

// ----- Montar la aplicación -----
app.mount('#app')
