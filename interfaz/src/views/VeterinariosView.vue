<template>
  <CrudPage
    title="Veterinarios"
    subtitle="Personal médico registrado y tarifas de consulta en Pesos Colombianos (COP)"
    add-label="Nuevo Veterinario"
    icon="medical_services"
    icon-gradient="linear-gradient(135deg,#48cae4,#0077b6)"
    :rows="store.filtrados(searchTerm, filtroEstado)"
    :columns="columns"
    :loading="store.loading"
    :show-delete="false"
    no-data-label="No hay veterinarios registrados para este filtro"
    @add="openDialog()"
    @edit="openDialog($event)"
    @search="onSearch"
  >
    <!-- ── Header Extra: Botón Veterinarios Inactivos ─────────── -->
    <template #header-extra>
      <q-btn
        unelevated
        class="btn-inactivos"
        icon="medical_services"
        label="Veterinarios inactivos"
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

    <!-- Template para costo_consulta -->
    <template #body-cell-costo_consulta="props">
      <q-td :props="props" class="text-center font-weight-bold text-cyan-3">
        {{ formatoCOP(props.row.costo_consulta || 70000) }}
      </q-td>
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

    <!-- ── Custom Actions Column (Editar / Cambiar Estado) ──────────── -->
    <template #body-cell-acciones="props">
      <q-td :props="props" class="actions-cell">
        <q-btn
          flat round dense
          icon="edit"
          size="sm"
          class="action-btn edit-btn"
          @click="openDialog(props.row)"
        >
          <q-tooltip>Editar veterinario</q-tooltip>
        </q-btn>
        <q-btn
          flat round dense
          :icon="props.row.estado !== false ? 'pause' : 'play_arrow'"
          size="sm"
          :class="['action-btn', props.row.estado !== false ? 'toggle-inactivo-btn' : 'toggle-activo-btn']"
          @click="toggleEstadoRow(props.row)"
        >
          <q-tooltip>{{ props.row.estado !== false ? 'Marcar como Inactivo' : 'Reactivar Veterinario' }}</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <!-- ── Dialog Formulario ───────────────────────────── -->
    <q-dialog v-model="dialog" class="vet-dialog">
      <q-card style="min-width:400px; background:#1a1d2e; border:1px solid rgba(255,255,255,0.1); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <q-icon name="medical_services" size="22px" style="color:#48cae4" class="q-mr-sm" />
            {{ selectedId ? 'Editar Veterinario' : 'Nuevo Veterinario' }}
          </div>
          <q-btn flat round dense icon="close" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />
        <q-card-section class="q-pa-lg q-gutter-sm">
          <q-input v-model="form.nombre" label="Nombre *" dark outlined dense class="vet-input" />
          <q-input v-model="form.especialidad" label="Especialidad" dark outlined dense class="vet-input" />
          <q-input v-model.number="form.costo_consulta" label="Tarifa Consulta (COP)" dark outlined dense class="vet-input" type="number" prefix="$" />

          <!-- Switch para Estado en Formulario (solo en modo edición) -->
          <div v-if="selectedId" class="estado-selector-box q-mt-md">
            <div>
              <div style="font-size:13px; font-weight:700; color:#fff">Estado del Veterinario</div>
              <div style="font-size:11px; color:rgba(255,255,255,0.5)">{{ form.estado !== false ? 'Disponible para atender consultas' : 'Inactivo (No asignable a visitas)' }}</div>
            </div>
            <q-toggle
              v-model="form.estado"
              color="positive"
              keep-color
            />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn
            unelevated label="Guardar" icon="save"
            :loading="store.saving"
            style="background:linear-gradient(135deg,#48cae4,#0077b6);color:white;border-radius:10px"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Dialog Vista "Veterinarios Inactivos" ─────────────── -->
    <q-dialog v-model="inactivosDialog">
      <q-card style="width:700px; max-width:90vw; background:#1a1d2e; border:1px solid rgba(255,107,107,0.25); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <div class="inactivos-icon-badge q-mr-md">
              <q-icon name="medical_services" size="24px" color="white" />
            </div>
            <div>
              <div>Veterinarios Inactivos</div>
              <div style="font-size:12px; font-weight:400; color:rgba(255,255,255,0.5)">
                Médicos fuera de servicio o suspendidos temporalmente
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="inactivosDialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>

        <q-separator color="rgba(255,255,255,0.08)" />

        <q-card-section class="q-pa-md">
          <div v-if="store.inactivos.length === 0" class="text-center q-pa-xl">
            <q-icon name="check_circle" size="48px" color="positive" />
            <div class="text-h6 text-white q-mt-md">No hay veterinarios inactivos</div>
            <div style="color:rgba(255,255,255,0.5); font-size:13px" class="q-mt-xs">Todos los profesionales registrados están activos.</div>
          </div>

          <div v-else class="inactivos-grid">
            <div
              v-for="v in store.inactivos"
              :key="v.idveterinario || v._id"
              class="inactivo-card"
            >
              <div class="inactivo-info">
                <div class="inactivo-name">
                  <q-icon name="medical_services" size="16px" color="red-4" class="q-mr-xs" />
                  {{ v.nombre }}
                </div>
                <div class="inactivo-detail">
                  <q-icon name="star" size="13px" class="q-mr-xs" />
                  {{ v.especialidad || 'Sin especialidad registrada' }}
                </div>
                <div class="inactivo-detail">
                  <q-icon name="attach_money" size="13px" class="q-mr-xs" />
                  {{ formatoCOP(v.costo_consulta || 70000) }}
                </div>
              </div>

              <div class="inactivo-actions">
                <q-btn
                  unelevated
                  dense
                  size="sm"
                  color="positive"
                  icon="play_arrow"
                  label="Reactivar"
                  class="q-px-sm"
                  style="border-radius:8px"
                  @click="toggleEstadoRow(v)"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
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
import { useVeterinariosStore } from '../stores/useVeterinariosStore.js'

const $q    = useQuasar()
const store = useVeterinariosStore()

const dialog          = ref(false)
const inactivosDialog = ref(false)
const searchTerm      = ref('')
const filtroEstado    = ref('activos')
const selectedId      = ref(null)

const form = ref({ nombre:'', especialidad:'', costo_consulta: 70000, estado: true })

const columns = [
  { name:'nombre',         label:'Nombre',            field:'nombre',         align:'left', sortable:true },
  { name:'especialidad',   label:'Especialidad',      field:'especialidad',   align:'left', sortable:true },
  { name:'costo_consulta', label:'Tarifa Consulta',   field:'costo_consulta', align:'center', sortable:true },
  { name:'estado',         label:'Estado',            field:'estado',         align:'center', sortable:true },
  { name:'acciones',       label:'Acciones',          field:'acciones',       align:'center' },
]

function openDialog(row = null) {
  if (row) {
    form.value = {
      nombre: row.nombre,
      especialidad: row.especialidad,
      costo_consulta: row.costo_consulta || 70000,
      estado: row.estado !== false
    }
    selectedId.value = row.idveterinario || row._id
  } else {
    form.value = { nombre:'', especialidad:'', costo_consulta: 70000, estado: true }
    selectedId.value = null
  }
  dialog.value = true
}

async function guardar() {
  if (!form.value.nombre) {
    $q.notify({ type:'warning', message:'El nombre es obligatorio' })
    return
  }
  try {
    if (selectedId.value) {
      await store.actualizar(selectedId.value, form.value)
      $q.notify({ type:'positive', message:'Veterinario actualizado exitosamente' })
    } else {
      await store.crear(form.value)
      $q.notify({ type:'positive', message:'Veterinario creado exitosamente' })
    }
    dialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: store.error || e.message })
  }
}

async function toggleEstadoRow(row) {
  const id = row.idveterinario || row._id
  const nuevoEstado = row.estado === false
  try {
    await store.actualizar(id, { estado: nuevoEstado })
    $q.notify({
      type: 'positive',
      message: nuevoEstado
        ? `Veterinario "${row.nombre}" reactivado exitosamente`
        : `Veterinario "${row.nombre}" marcado como inactivo`,
      icon: nuevoEstado ? 'check_circle' : 'pause_circle_filled'
    })
  } catch (e) {
    $q.notify({ type: 'negative', message: store.error || e.message })
  }
}

function onSearch(val) { searchTerm.value = val }

function formatoCOP(valor) {
  if (!valor && valor !== 0) return '$ 0 COP'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor) + ' COP'
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
  color: #48cae4 !important;
}
.edit-btn:hover {
  background: rgba(72, 202, 228, 0.15) !important;
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
