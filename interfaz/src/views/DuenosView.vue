<template>
  <CrudPage
    title="Dueños"
    subtitle="Propietarios registrados en el sistema"
    add-label="Nuevo Dueño"
    icon="person"
    icon-gradient="linear-gradient(135deg,#6c63ff,#a084ee)"
    :rows="store.filtrados(searchTerm, filtroEstado)"
    :columns="columns"
    :loading="store.loading"
    :show-delete="false"
    no-data-label="No hay dueños registrados para este filtro"
    @add="openDialog()"
    @edit="openDialog($event)"
    @search="onSearch"
  >
    <!-- ── Header Extra: Botón Dueños Inactivos ─────────── -->
    <template #header-extra>
      <q-btn
        unelevated
        class="btn-inactivos"
        icon="no_accounts"
        label="Dueños inactivos"
        @click="inactivosDialog = true"
      >
        <q-badge color="red-6" floating rounded v-if="store.totalInactivos > 0">
          {{ store.totalInactivos }}
        </q-badge>
      </q-btn>
    </template>

    <!-- ── Search Extra: Filtro de Estado ────────────── -->
    <template #search-extra>
      <div class="filter-btn-group">
        <q-btn-toggle
          v-model="filtroEstado"
          toggle-color="primary"
          toggle-text-color="white"
          text-color="grey-4"
          dark
          dense
          unelevated
          class="vet-toggle-group"
          :options="[
            { label: `Activos (${store.totalActivos})`, value: 'activos' },
            { label: `Inactivos (${store.totalInactivos})`, value: 'inactivos' },
            { label: `Todos (${store.total})`, value: 'todos' }
          ]"
        />
      </div>
    </template>

    <!-- ── Custom Estado Column (Toggle rápido) ────────── -->
    <template #body-cell-estado="props">
      <q-td :props="props">
        <q-chip
          clickable
          dense
          @click="toggleEstadoRow(props.row)"
          :color="props.row.estado !== false ? 'positive' : 'deep-orange-9'"
          text-color="white"
          class="cursor-pointer status-chip"
        >
          <q-icon :name="props.row.estado !== false ? 'check_circle' : 'pause_circle_filled'" size="14px" class="q-mr-xs" />
          {{ props.row.estado !== false ? 'Activo' : 'Inactivo' }}
        </q-chip>
      </q-td>
    </template>

    <!-- ── Custom Actions Column (Solo Editar) ──────────── -->
    <template #body-cell-acciones="props">
      <q-td :props="props" class="actions-cell">
        <q-btn
          flat round dense
          icon="edit"
          size="sm"
          class="action-btn edit-btn"
          @click="openDialog(props.row)"
        >
          <q-tooltip>Editar dueño</q-tooltip>
        </q-btn>
        <q-btn
          flat round dense
          :icon="props.row.estado !== false ? 'pause' : 'play_arrow'"
          size="sm"
          :class="['action-btn', props.row.estado !== false ? 'toggle-inactivo-btn' : 'toggle-activo-btn']"
          @click="toggleEstadoRow(props.row)"
        >
          <q-tooltip>{{ props.row.estado !== false ? 'Marcar como Inactivo' : 'Reactivar Dueño' }}</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <!-- ── Dialog Formulario (Crear / Editar) ──────────── -->
    <q-dialog v-model="dialog" class="vet-dialog">
      <q-card style="min-width:440px; background:#1a1d2e; border:1px solid rgba(255,255,255,0.1); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <q-icon name="person" size="22px" style="color:#6c63ff" class="q-mr-sm" />
            {{ selectedId ? 'Editar Dueño' : 'Nuevo Dueño' }}
          </div>
          <q-btn flat round dense icon="close" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />
        <q-card-section class="q-pa-lg q-gutter-sm">
          <q-input v-model="form.nombre"    label="Nombre *"   dark outlined dense class="vet-input" />
          <q-input v-model="form.email"     label="Email *"    dark outlined dense class="vet-input" type="email" />
          <q-input v-model="form.telefono"  label="Teléfono"   dark outlined dense class="vet-input" />
          <q-input v-model="form.direccion" label="Dirección"  dark outlined dense class="vet-input" />
          
          <!-- Selección Activo / Inactivo (solo en modo edición) -->
          <div v-if="selectedId" class="estado-selector-box q-mt-md">
            <div class="text-subtitle2 text-grey-4 flex items-center">
              <q-icon :name="form.estado ? 'check_circle' : 'pause_circle'" :color="form.estado ? 'positive' : 'amber-8'" class="q-mr-xs" size="18px" />
              Estado del Dueño
            </div>
            <q-toggle
              v-model="form.estado"
              :label="form.estado ? 'Activo' : 'Inactivo'"
              :color="form.estado ? 'positive' : 'red-6'"
              dark
            />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn
            unelevated label="Guardar" icon="save"
            :loading="store.saving"
            style="background:linear-gradient(135deg,#6c63ff,#48cae4);color:white;border-radius:10px"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Dialog Vista "Dueños Inactivos" ─────────────── -->
    <q-dialog v-model="inactivosDialog">
      <q-card style="width:720px; max-width:90vw; background:#131622; border:1px solid rgba(255,107,107,0.3); border-radius:20px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px; background:rgba(255,107,107,0.06)">
          <div style="display:flex;align-items:center;font-size:18px;font-weight:700;color:#fff">
            <div class="inactivos-icon-badge q-mr-md">
              <q-icon name="no_accounts" size="24px" color="white" />
            </div>
            <div>
              <div>Dueños Inactivos</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);font-weight:400">
                Lista de propietarios actualmente deshabilitados en la veterinaria
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="inactivosDialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />

        <q-card-section class="q-pa-md">
          <div v-if="store.inactivos.length === 0" class="text-center q-pa-xl">
            <q-icon name="sentiment_satisfied_alt" size="56px" color="teal-4" />
            <div class="text-h6 text-white q-mt-md">No hay dueños inactivos</div>
            <div class="text-grey-5 text-body2">Todos los dueños registrados se encuentran actualmente activos.</div>
          </div>

          <div v-else class="inactivos-grid">
            <div
              v-for="d in store.inactivos"
              :key="d._id || d.iddueño"
              class="inactivo-card"
            >
              <div class="inactivo-info">
                <div class="inactivo-name">
                  <q-icon name="person" size="18px" color="red-4" class="q-mr-xs" />
                  {{ d.nombre }}
                </div>
                <div class="inactivo-detail">
                  <q-icon name="email" size="13px" class="q-mr-xs" />
                  {{ d.email || 'Sin correo' }}
                </div>
                <div class="inactivo-detail" v-if="d.telefono">
                  <q-icon name="phone" size="13px" class="q-mr-xs" />
                  {{ d.telefono }}
                </div>
              </div>

              <div class="inactivo-actions">
                <q-btn
                  unelevated
                  dense
                  size="sm"
                  color="teal-7"
                  icon="check_circle"
                  label="Reactivar"
                  class="q-px-sm"
                  style="border-radius:8px"
                  @click="reactivar(d)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  size="sm"
                  style="color:#6c63ff"
                  @click="openDialog(d); inactivosDialog = false"
                >
                  <q-tooltip>Editar datos</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator color="rgba(255,255,255,0.08)" />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" @click="inactivosDialog = false" style="color:rgba(255,255,255,0.6)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </CrudPage>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import CrudPage from '../components/CrudPage.vue'
import { useDuenosStore } from '../stores/useDuenosStore.js'

const $q = useQuasar()
const store = useDuenosStore()

const dialog = ref(false)
const inactivosDialog = ref(false)
const searchTerm = ref('')
const filtroEstado = ref('activos')
const selectedId = ref(null)
const form = ref({ nombre: '', email: '', telefono: '', direccion: '', estado: true })

const columns = [
  { name: 'nombre',    label: 'Nombre',    field: 'nombre',                                align: 'left',   sortable: true },
  { name: 'email',     label: 'Email',     field: 'email',                                 align: 'left',   sortable: true },
  { name: 'telefono',  label: 'Teléfono',  field: r => r.telefono || '—',                 align: 'left'   },
  { name: 'direccion', label: 'Dirección', field: r => r.direccion || r.dirección || '—', align: 'left'   },
  { name: 'estado',    label: 'Estado',    field: 'estado',                                align: 'center' },
  { name: 'acciones',  label: 'Acciones',  field: 'acciones',                              align: 'center' },
]

function openDialog(row = null) {
  if (row) {
    form.value = {
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      direccion: row.direccion || row.dirección || '',
      estado: row.estado !== false
    }
    selectedId.value = row.iddueño || row._id
  } else {
    form.value = { nombre: '', email: '', telefono: '', direccion: '', estado: true }
    selectedId.value = null
  }
  dialog.value = true
}

async function guardar() {
  if (!form.value.nombre || !form.value.email) {
    $q.notify({ type: 'warning', message: 'Nombre y email son obligatorios' })
    return
  }
  try {
    if (selectedId.value) {
      await store.actualizar(selectedId.value, form.value)
      $q.notify({ type: 'positive', message: 'Dueño actualizado correctamente' })
    } else {
      await store.crear(form.value)
      $q.notify({ type: 'positive', message: 'Dueño creado correctamente' })
    }
    dialog.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: store.error || e.message })
  }
}

async function toggleEstadoRow(row) {
  const targetId = row.iddueño || row._id
  const nuevoEstado = !(row.estado !== false)
  try {
    await store.actualizar(targetId, { ...row, estado: nuevoEstado })
    $q.notify({
      type: 'positive',
      message: `Dueño "${row.nombre}" marcado como ${nuevoEstado ? 'Activo' : 'Inactivo'}`,
      icon: nuevoEstado ? 'check_circle' : 'pause_circle'
    })
  } catch (e) {
    $q.notify({ type: 'negative', message: store.error || e.message })
  }
}

async function reactivar(row) {
  const targetId = row.iddueño || row._id
  try {
    await store.actualizar(targetId, { ...row, estado: true })
    $q.notify({
      type: 'positive',
      message: `Dueño "${row.nombre}" reactivado exitosamente`,
      icon: 'check_circle'
    })
  } catch (e) {
    $q.notify({ type: 'negative', message: store.error || e.message })
  }
}

function onSearch(val) {
  searchTerm.value = val
}

onMounted(() => store.fetchAll())
</script>

<style scoped>
.btn-inactivos {
  background: rgba(255, 107, 107, 0.15) !important;
  color: #ff6b6b !important;
  border: 1px solid rgba(255, 107, 107, 0.3) !important;
  border-radius: 10px !important;
  font-weight: 600;
  padding: 8px 16px;
  transition: all 0.2s ease;
}
.btn-inactivos:hover {
  background: rgba(255, 107, 107, 0.25) !important;
  transform: translateY(-1px);
}

.vet-toggle-group {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  overflow: hidden;
  padding: 2px;
}

.vet-toggle-group :deep(.q-btn) {
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.3px;
  padding: 6px 14px;
  color: rgba(255, 255, 255, 0.75) !important;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.vet-toggle-group :deep(.q-btn:hover) {
  background: rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;
}

.vet-toggle-group :deep(.q-btn.bg-primary) {
  background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
}

.status-chip {
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
}
.status-chip:hover {
  filter: brightness(1.15);
  transform: scale(1.03);
}

.actions-cell {
  white-space: nowrap;
}

.action-btn {
  transition: all 0.15s ease;
}
.edit-btn {
  color: #6c63ff !important;
}
.edit-btn:hover {
  background: rgba(108, 99, 255, 0.15) !important;
}
.toggle-inactivo-btn {
  color: #ff9f43 !important;
}
.toggle-inactivo-btn:hover {
  background: rgba(255, 159, 67, 0.15) !important;
}
.toggle-activo-btn {
  color: #26de81 !important;
}
.toggle-activo-btn:hover {
  background: rgba(38, 222, 129, 0.15) !important;
}

.estado-selector-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.inactivos-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ee5253);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.inactivos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  max-height: 440px;
  overflow-y: auto;
  padding-right: 4px;
}

.inactivo-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 107, 107, 0.15);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}
.inactivo-card:hover {
  background: rgba(255, 107, 107, 0.06);
  border-color: rgba(255, 107, 107, 0.3);
}

.inactivo-name {
  font-weight: 700;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.inactivo-detail {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  display: flex;
  align-items: center;
}

.inactivo-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
