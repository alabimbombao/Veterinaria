<template>
  <CrudPage
    title="Mascotas"
    subtitle="Pacientes registrados en el sistema — Haz clic en una mascota para ver su expediente completo"
    add-label="Nueva Mascota"
    icon="pets"
    icon-gradient="linear-gradient(135deg,#f7b731,#ffa502)"
    :rows="mascotasStore.filtradas(searchTerm)"
    :columns="columns"
    :loading="mascotasStore.loading"
    no-data-label="No hay mascotas registradas"
    @add="openDialog()"
    @edit="openDialog($event)"
    @delete="confirmarEliminar($event)"
    @search="onSearch"
  >
    <!-- Slot para renderizado personalizado de filas con evento de clic en detalle -->
    <template #body-cell-nombre="props">
      <q-td :props="props" class="cursor-pointer text-weight-bold text-amber-5" @click="verDetalle(props.row)">
        <q-icon name="pets" size="18px" class="q-mr-xs text-amber-5" />
        {{ props.row.nombre }}
        <q-tooltip class="bg-dark text-amber">Haz clic para ver el expediente completo</q-tooltip>
      </q-td>
    </template>

    <template #body-cell-dueño="props">
      <q-td :props="props" class="cursor-pointer" @click="verDetalle(props.row)">
        <div class="text-white text-weight-medium">
          {{ resolveNombreDueño(props.row.iddueño) }}
        </div>
      </q-td>
    </template>

    <template #body-cell-veterinario="props">
      <q-td :props="props" class="cursor-pointer" @click="verDetalle(props.row)">
        <div style="color: #48cae4">
          {{ resolveNombreVet(props.row.idveterinario) }}
        </div>
      </q-td>
    </template>

    <template #body-cell-acciones="props">
      <q-td :props="props" class="actions-cell">
        <q-btn
          flat round dense
          icon="visibility"
          size="sm"
          style="color: #f7b731"
          class="q-mr-xs"
          @click.stop="verDetalle(props.row)"
        >
          <q-tooltip>Ver Expediente</q-tooltip>
        </q-btn>
        <q-btn
          flat round dense
          icon="edit"
          size="sm"
          class="action-btn edit-btn"
          @click.stop="openDialog(props.row)"
        >
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn
          flat round dense
          icon="delete"
          size="sm"
          class="action-btn delete-btn q-ml-xs"
          @click.stop="confirmarEliminar(props.row)"
        >
          <q-tooltip>Eliminar</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <!-- ── Modal Detalle de Mascota (Expediente) ───────────────────────── -->
    <q-dialog v-model="detalleDialog" class="vet-dialog" max-width="800px">
      <q-card v-if="mascotaSeleccionada" style="width:750px; max-width:95vw; background:#161926; border:1px solid rgba(247,183,49,0.3); border-radius:20px; overflow:hidden;">
        <!-- Header Banner -->
        <q-card-section style="background:linear-gradient(135deg,#1f2438,#161926); padding:24px 28px; position:relative; border-bottom:1px solid rgba(255,255,255,0.08)">
          <div style="display:flex; align-items:center; justify-content:space-between">
            <div style="display:flex; align-items:center; gap:16px">
              <div style="width:64px; height:64px; border-radius:18px; background:linear-gradient(135deg,#f7b731,#ffa502); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(247,183,49,0.3)">
                <q-icon name="pets" size="36px" color="white" />
              </div>
              <div>
                <div style="font-size:24px; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px">
                  {{ mascotaSeleccionada.nombre }}
                  <q-badge color="amber-9" style="font-size:12px; font-weight:600; padding:4px 10px; border-radius:12px">
                    {{ mascotaSeleccionada.especie }}
                  </q-badge>
                </div>
                <div style="font-size:14px; color:rgba(255,255,255,0.6); margin-top:2px">
                  Raza: <strong class="text-white">{{ mascotaSeleccionada.raza || 'Mestizo' }}</strong> • 
                  Edad: <strong class="text-white">{{ mascotaSeleccionada.edad_aprox ? mascotaSeleccionada.edad_aprox + ' años' : 'N/D' }}</strong> • 
                  Peso: <strong class="text-amber-4">{{ mascotaSeleccionada.peso_actual ? mascotaSeleccionada.peso_actual + ' kg' : 'N/D' }}</strong>
                </div>
              </div>
            </div>
            <q-btn flat round dense icon="close" @click="detalleDialog = false" style="color:rgba(255,255,255,0.5)" />
          </div>
        </q-card-section>

        <!-- Body Tabs / Context -->
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md q-mb-lg">
            <!-- Dueño Info Card -->
            <div class="col-12 col-md-6">
              <div style="background:#1e2336; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px">
                <div style="display:flex; align-items:center; gap:8px; font-weight:700; color:#26de81; font-size:15px; margin-bottom:10px">
                  <q-icon name="person" size="20px" />
                  Información del Dueño
                </div>
                <template v-if="obtenerDatosDueño(mascotaSeleccionada.iddueño)">
                  <div style="font-size:15px; font-weight:700; color:#fff; margin-bottom:4px">
                    {{ obtenerDatosDueño(mascotaSeleccionada.iddueño).nombre }}
                  </div>
                  <div style="font-size:13px; color:rgba(255,255,255,0.6); display:flex; align-items:center; gap:6px; margin-bottom:2px">
                    <q-icon name="phone" size="14px" color="teal-3" />
                    {{ obtenerDatosDueño(mascotaSeleccionada.iddueño).telefono || 'Sin teléfono' }}
                  </div>
                  <div style="font-size:13px; color:rgba(255,255,255,0.6); display:flex; align-items:center; gap:6px; margin-bottom:2px">
                    <q-icon name="email" size="14px" color="teal-3" />
                    {{ obtenerDatosDueño(mascotaSeleccionada.iddueño).email || 'Sin email' }}
                  </div>
                  <div style="font-size:13px; color:rgba(255,255,255,0.6); display:flex; align-items:center; gap:6px">
                    <q-icon name="place" size="14px" color="teal-3" />
                    {{ obtenerDatosDueño(mascotaSeleccionada.iddueño).direccion || obtenerDatosDueño(mascotaSeleccionada.iddueño).dirección || 'Sin dirección' }}
                  </div>
                </template>
                <div v-else style="color:rgba(255,255,255,0.4); font-size:13px">Sin dueño registrado</div>
              </div>
            </div>

            <!-- Veterinario Info Card -->
            <div class="col-12 col-md-6">
              <div style="background:#1e2336; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px">
                <div style="display:flex; align-items:center; gap:8px; font-weight:700; color:#48cae4; font-size:15px; margin-bottom:10px">
                  <q-icon name="medical_services" size="20px" />
                  Veterinario Asignado
                </div>
                <template v-if="obtenerDatosVet(mascotaSeleccionada.idveterinario)">
                  <div style="font-size:15px; font-weight:700; color:#fff; margin-bottom:4px">
                    {{ obtenerDatosVet(mascotaSeleccionada.idveterinario).nombre }}
                  </div>
                  <div style="font-size:13px; color:rgba(255,255,255,0.6); display:flex; align-items:center; gap:6px; margin-bottom:4px">
                    <q-icon name="star" size="14px" color="amber" />
                    {{ obtenerDatosVet(mascotaSeleccionada.idveterinario).especialidad || 'Medicina General' }}
                  </div>
                  <div style="font-size:13px; color:#48cae4; font-weight:600">
                    Tarifa de Consulta: {{ formatoCOP(obtenerDatosVet(mascotaSeleccionada.idveterinario).costo_consulta || 70000) }}
                  </div>
                </template>
                <div v-else style="color:rgba(255,255,255,0.4); font-size:13px">No tiene veterinario fijo asignado</div>
              </div>
            </div>
          </div>

          <!-- Historial de Visitas Médicas -->
          <div style="margin-bottom:20px">
            <div style="font-size:16px; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px; margin-bottom:12px">
              <q-icon name="event_note" color="green-4" size="22px" />
              Historial de Visitas Médicas ({{ visitasDeMascota.length }})
            </div>

            <div v-if="visitasDeMascota.length === 0" style="background:#1a1d2e; border-radius:12px; padding:20px; text-align:center; color:rgba(255,255,255,0.4)">
              No registra visitas médicas hasta la fecha.
            </div>

            <div v-else style="display:flex; flex-direction:column; gap:10px; max-height:240px; overflow-y:auto; padding-right:4px">
              <div
                v-for="visita in visitasDeMascota"
                :key="visita.idvisita || visita._id"
                style="background:#1e2336; border-left:4px solid #26de81; border-radius:10px; padding:12px 16px"
              >
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px">
                  <div style="font-weight:700; color:#26de81; font-size:14px">
                    {{ formatoFecha(visita.fechavisita) }} — {{ visita.motivoconsulta }}
                  </div>
                  <q-chip dense color="amber-10" text-color="white" font-weight="700" style="font-size:12px">
                    Total: {{ formatoCOP(visita.costo_total || visita.costo_consulta || 70000) }}
                  </q-chip>
                </div>
                <div style="font-size:13px; color:rgba(255,255,255,0.8); margin-bottom:4px">
                  <strong>Diagnóstico:</strong> {{ visita.diagnostico || 'Evaluación normal' }}
                </div>
                <div style="font-size:12px; color:rgba(255,255,255,0.5)">
                  Atendido por: {{ resolveNombreVet(visita.idveterinario) }} | Peso registrado: {{ visita.pesoregistrado ? visita.pesoregistrado + ' kg' : 'N/D' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tratamientos Asignados -->
          <div>
            <div style="font-size:16px; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px; margin-bottom:12px">
              <q-icon name="medication" color="purple-4" size="22px" />
              Tratamientos Recetados ({{ tratamientosDeMascota.length }})
            </div>

            <div v-if="tratamientosDeMascota.length === 0" style="background:#1a1d2e; border-radius:12px; padding:20px; text-align:center; color:rgba(255,255,255,0.4)">
              No registra tratamientos asociados.
            </div>

            <div v-else style="display:flex; flex-direction:column; gap:10px; max-height:200px; overflow-y:auto; padding-right:4px">
              <div
                v-for="trat in tratamientosDeMascota"
                :key="trat.idtratamiento || trat._id"
                style="background:#1e2336; border-left:4px solid #a55eea; border-radius:10px; padding:12px 16px"
              >
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px">
                  <div style="font-weight:700; color:#a55eea; font-size:14px">
                    {{ trat.tipo }}
                  </div>
                  <q-badge color="purple-9" style="font-weight:700; font-size:12px">
                    {{ formatoCOP(trat.costo || 45000) }}
                  </q-badge>
                </div>
                <div style="font-size:13px; color:rgba(255,255,255,0.85); margin-bottom:2px">
                  {{ trat.descripcion }}
                </div>
                <div style="font-size:12px; color:rgba(255,255,255,0.5)">
                  Indicaciones: {{ trat.dosis_indicaciones }} | Próximo control: {{ trat.proxima_fecha ? formatoFecha(trat.proxima_fecha) : 'N/D' }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ── Dialog Formulario Crear / Editar ───────────────────────────── -->
    <q-dialog v-model="dialog" class="vet-dialog">
      <q-card style="min-width:460px; background:#1a1d2e; border:1px solid rgba(255,255,255,0.1); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <q-icon name="pets" size="22px" style="color:#f7b731" class="q-mr-sm" />
            {{ selectedId ? 'Editar Mascota' : 'Nueva Mascota' }}
          </div>
          <q-btn flat round dense icon="close" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />
        <q-card-section class="q-pa-lg q-gutter-sm">
          <q-input v-model="form.nombre"       label="Nombre *"          dark outlined dense class="vet-input" />
          <q-input v-model="form.especie"      label="Especie *"          dark outlined dense class="vet-input" />
          <q-input v-model="form.raza"         label="Raza"               dark outlined dense class="vet-input" />
          <q-input v-model="form.edad_aprox"   label="Edad aproximada (años)" dark outlined dense class="vet-input" type="number" />
          <q-input v-model="form.peso_actual"  label="Peso actual (kg)"   dark outlined dense class="vet-input" type="number" step="0.1" />
          
          <!-- Select Dueño Búsqueda Funcional -->
          <q-select
            v-model="form['iddueño']"
            :options="duenosFiltradosOpts"
            use-input
            input-debounce="0"
            @filter="filterDuenos"
            label="Buscar Dueño *"
            dark outlined dense class="vet-input"
            popup-content-class="vet-select-popup"
            option-value="value" option-label="label"
            emit-value map-options
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey-5">No se encontraron dueños</q-item-section>
              </q-item>
            </template>
          </q-select>
          
          <!-- Select Veterinario Búsqueda Funcional -->
          <q-select
            v-model="form.idveterinario"
            :options="vetsFiltradosOpts"
            use-input
            input-debounce="0"
            @filter="filterVets"
            label="Buscar Veterinario asignado"
            dark outlined dense class="vet-input"
            popup-content-class="vet-select-popup"
            option-value="value" option-label="label"
            emit-value map-options clearable
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey-5">No se encontraron veterinarios</q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn
            unelevated label="Guardar" icon="save"
            :loading="mascotasStore.saving"
            style="background:linear-gradient(135deg,#f7b731,#ffa502);color:white;border-radius:10px"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Confirm Delete ─────────────────────────────── -->
    <q-dialog v-model="deleteDialog">
      <q-card style="min-width:340px; background:#1a1d2e; border:1px solid rgba(255,107,107,0.2); border-radius:16px;">
        <q-card-section class="text-center q-pa-lg">
          <q-icon name="warning" size="48px" color="red-4" />
          <div style="font-size:18px;font-weight:700;color:#fff;margin-top:12px">¿Eliminar mascota?</div>
          <div style="color:rgba(255,255,255,0.5);margin-top:8px;font-size:14px">Esta acción no se puede deshacer.</div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="deleteDialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn unelevated label="Eliminar" icon="delete" color="red-7" :loading="mascotasStore.deleting" @click="eliminar" style="border-radius:10px" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </CrudPage>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import CrudPage from '../components/CrudPage.vue'
import { useMascotasStore }     from '../stores/useMascotasStore.js'
import { useDuenosStore }       from '../stores/useDuenosStore.js'
import { useVeterinariosStore } from '../stores/useVeterinariosStore.js'
import { useVisitasStore }      from '../stores/useVisitasStore.js'
import { useTratamientosStore } from '../stores/useTratamientosStore.js'

const $q = useQuasar()
const mascotasStore     = useMascotasStore()
const duenosStore       = useDuenosStore()
const veterinariosStore = useVeterinariosStore()
const visitasStore      = useVisitasStore()
const tratamientosStore = useTratamientosStore()

const dialog              = ref(false)
const deleteDialog        = ref(false)
const detalleDialog       = ref(false)
const searchTerm          = ref('')
const selectedId          = ref(null)
const mascotaSeleccionada = ref(null)

const duenosFiltradosOpts = ref([])
const vetsFiltradosOpts   = ref([])

const form = ref({
  nombre:'', especie:'', raza:'', edad_aprox:'',
  peso_actual:'', 'iddueño': null, idveterinario: null
})

function extractId(val) {
  if (!val) return null
  if (typeof val === 'object') return (val._id || val.iddueño || val.idveterinario || val.idmascota || '').toString()
  return val.toString()
}

const opcionesDuenos = computed(() => {
  return duenosStore.duenos.map(d => ({
    label: d.nombre,
    value: d.iddueño || d._id
  }))
})

const opcionesVets = computed(() => {
  const currentSelectedId = extractId(form.value.idveterinario)
  return veterinariosStore.veterinarios
    .filter(v => v.estado !== false || extractId(v.idveterinario || v._id) === currentSelectedId)
    .map(v => {
      const isInactivo = v.estado === false
      return {
        label: isInactivo ? `${v.nombre} (INACTIVO)` : `${v.nombre} (${v.especialidad || 'Medicina General'})`,
        value: v.idveterinario || v._id,
        disable: isInactivo
      }
    })
})

function filterDuenos(val, update) {
  if (val === '') {
    update(() => { duenosFiltradosOpts.value = opcionesDuenos.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    duenosFiltradosOpts.value = opcionesDuenos.value.filter(
      v => v.label.toLowerCase().includes(needle)
    )
  })
}

function filterVets(val, update) {
  if (val === '') {
    update(() => { vetsFiltradosOpts.value = opcionesVets.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    vetsFiltradosOpts.value = opcionesVets.value.filter(
      v => v.label.toLowerCase().includes(needle)
    )
  })
}

const columns = [
  { name:'nombre',      label:'Mascota',     field:'nombre',                                      align:'left', sortable:true },
  { name:'especie',     label:'Especie',     field:'especie',                                     align:'left', sortable:true },
  { name:'raza',        label:'Raza',        field:'raza',                                        align:'left' },
  { name:'dueño',       label:'Dueño',       field: r => resolveNombreDueño(r.iddueño),           align:'left' },
  { name:'veterinario', label:'Veterinario', field: r => resolveNombreVet(r.idveterinario),       align:'left' },
  { name:'edad_aprox',  label:'Edad',        field: r => r.edad_aprox ? r.edad_aprox + ' años' : 'N/D', align:'left' },
  { name:'peso_actual', label:'Peso (kg)',   field: r => r.peso_actual ? r.peso_actual + ' kg' : 'N/D', align:'center' },
  { name:'acciones',    label:'Acciones',    field:'acciones',                                    align:'center' },
]

function resolveNombreDueño(val) {
  if (!val) return 'Sin dueño'
  if (typeof val === 'object' && val.nombre) return val.nombre
  const idStr = extractId(val)
  const d = duenosStore.duenos.find(item => extractId(item.iddueño || item._id) === idStr)
  return d ? d.nombre : 'Sin dueño'
}

function resolveNombreVet(val) {
  if (!val) return 'No asignado'
  if (typeof val === 'object' && val.nombre) return val.nombre
  const idStr = extractId(val)
  const v = veterinariosStore.veterinarios.find(item => extractId(item.idveterinario || item._id) === idStr)
  return v ? v.nombre : 'No asignado'
}

function obtenerDatosDueño(val) {
  if (!val) return null
  if (typeof val === 'object' && val.nombre) return val
  const idStr = extractId(val)
  return duenosStore.duenos.find(item => extractId(item.iddueño || item._id) === idStr) || null
}

function obtenerDatosVet(val) {
  if (!val) return null
  if (typeof val === 'object' && val.nombre) return val
  const idStr = extractId(val)
  return veterinariosStore.veterinarios.find(item => extractId(item.idveterinario || item._id) === idStr) || null
}

const visitasDeMascota = computed(() => {
  if (!mascotaSeleccionada.value) return []
  const petId = extractId(mascotaSeleccionada.value.idmascota || mascotaSeleccionada.value._id)
  return visitasStore.visitas.filter(v => extractId(v.idmascota) === petId)
})

const tratamientosDeMascota = computed(() => {
  if (!mascotaSeleccionada.value) return []
  const visitIds = visitasDeMascota.value.map(v => extractId(v.idvisita || v._id))
  return tratamientosStore.tratamientos.filter(t => visitIds.includes(extractId(t.idvisita)))
})

function verDetalle(row) {
  mascotaSeleccionada.value = row
  detalleDialog.value = true
}

function openDialog(row = null) {
  duenosFiltradosOpts.value = opcionesDuenos.value
  vetsFiltradosOpts.value   = opcionesVets.value

  if (row) {
    form.value = {
      nombre: row.nombre,
      especie: row.especie,
      raza: row.raza,
      edad_aprox: row.edad_aprox,
      peso_actual: row.peso_actual,
      'iddueño': extractId(row['iddueño']),
      idveterinario: extractId(row.idveterinario)
    }
    selectedId.value = row.idmascota || row._id
  } else {
    form.value = { nombre:'', especie:'', raza:'', edad_aprox:'', peso_actual:'', 'iddueño': null, idveterinario: null }
    selectedId.value = null
  }
  dialog.value = true
}

async function guardar() {
  if (!form.value.nombre || !form.value.especie || !form.value['iddueño']) {
    $q.notify({ type:'warning', message:'Nombre, especie y dueño son obligatorios' })
    return
  }
  try {
    if (selectedId.value) {
      await mascotasStore.actualizar(selectedId.value, form.value)
      $q.notify({ type:'positive', message:'Mascota actualizada' })
    } else {
      await mascotasStore.crear(form.value)
      $q.notify({ type:'positive', message:'Mascota creada' })
    }
    dialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: mascotasStore.error || e.message })
  }
}

function confirmarEliminar(row) {
  selectedId.value   = row.idmascota || row._id
  deleteDialog.value = true
}

async function eliminar() {
  try {
    await mascotasStore.eliminar(selectedId.value)
    $q.notify({ type:'positive', message:'Mascota eliminada' })
    deleteDialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: mascotasStore.error || e.message })
  }
}

function onSearch(val) { searchTerm.value = val }

function formatoCOP(valor) {
  if (!valor && valor !== 0) return '$ 0 COP'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor) + ' COP'
}

function formatoFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  await Promise.all([
    mascotasStore.fetchAll(),
    duenosStore.fetchAll(),
    veterinariosStore.fetchAll(),
    visitasStore.fetchAll(),
    tratamientosStore.fetchAll()
  ])
  duenosFiltradosOpts.value = opcionesDuenos.value
  vetsFiltradosOpts.value   = opcionesVets.value
})
</script>
