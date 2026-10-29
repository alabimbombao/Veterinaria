<template>
  <q-page class="vet-page q-pa-md q-pa-lg-lg">
    <!-- Header de la Página -->
    <div class="page-header q-mb-md">
      <div class="page-header-left">
        <div class="page-icon" style="background: linear-gradient(135deg,#26de81,#20bf6b)">
          <q-icon name="event_note" size="28px" color="white" />
        </div>
        <div>
          <h2 class="page-title">Visitas Médicas</h2>
          <p class="page-sub">Historial de consultas, diagnósticos y desgloses de costos en Pesos Colombianos (COP)</p>
        </div>
      </div>
      <q-btn
        unelevated
        label="Nueva Visita"
        icon="add"
        class="add-btn"
        @click="openDialog()"
      />
    </div>

    <!-- Barra de Búsqueda -->
    <div class="search-bar q-mb-md">
      <q-input
        v-model="searchTerm"
        placeholder="Buscar por mascota, motivo o diagnóstico..."
        dense
        outlined
        dark
        class="vet-input search-input"
      >
        <template #prepend>
          <q-icon name="search" color="grey-6" />
        </template>
        <template #append v-if="searchTerm">
          <q-icon name="close" color="grey-6" class="cursor-pointer" @click="searchTerm = ''" />
        </template>
      </q-input>
    </div>

    <!-- Spinner de Carga -->
    <div v-if="visitasStore.loading" class="text-center q-pa-xl">
      <q-spinner-dots color="green-4" size="50px" />
      <div style="color:rgba(255,255,255,0.6); margin-top:12px; font-weight:600">Cargando visitas médicas...</div>
    </div>

    <!-- Sin datos -->
    <div v-else-if="visitasFiltradas.length === 0" class="text-center q-pa-xl" style="background:#1a1d2e; border-radius:16px; border:1px solid rgba(255,255,255,0.08)">
      <q-icon name="event_busy" size="64px" color="grey-7" />
      <div style="font-size:18px; font-weight:700; color:#fff; margin-top:12px">No se encontraron visitas registradas</div>
      <div style="color:rgba(255,255,255,0.4); margin-top:4px">Intenta cambiar el término de búsqueda o crea una nueva visita.</div>
    </div>

    <!-- Grid de Cards (3 por fila en escritorio) -->
    <div v-else class="row q-col-gutter-md">
      <div
        v-for="visita in visitasFiltradas"
        :key="visita.idvisita || visita._id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="visita-card">
          <!-- Card Header -->
          <div class="visita-card-header">
            <div style="display:flex; align-items:center; justify-content:space-between">
              <!-- Mascota Badge -->
              <div style="display:flex; align-items:center; gap:10px">
                <div class="pet-avatar">
                  <q-icon name="pets" size="20px" color="white" />
                </div>
                <div>
                  <div class="pet-name">
                    <q-badge v-if="resolveCodigoMascota(visita.idmascota)" color="purple-9" text-color="white" class="q-mr-xs text-weight-bold" style="font-size:11px">
                      {{ resolveCodigoMascota(visita.idmascota) }}
                    </q-badge>
                    {{ resolveNombreMascota(visita.idmascota) }}
                  </div>
                  <div class="pet-sub">
                    {{ resolveEspecieRaza(visita.idmascota) }}
                  </div>
                </div>
              </div>

              <!-- Fecha -->
              <q-badge color="teal-9" class="fecha-badge">
                <q-icon name="event" size="14px" class="q-mr-xs" />
                {{ formatoFecha(visita.fechavisita) }}
              </q-badge>
            </div>

            <!-- Dueño Row -->
            <div class="dueno-row q-mt-sm">
              <q-icon name="person" size="14px" color="purple-3" />
              <span class="dueno-label">Dueño:</span>
              <span class="dueno-value">{{ resolveNombreDueno(visita.idmascota) }}</span>
            </div>
          </div>

          <!-- Card Content -->
          <q-card-section class="visita-card-body">
            <!-- Veterinario Atendió -->
            <div class="info-row q-mb-xs">
              <q-icon name="medical_services" size="16px" color="cyan-4" />
              <span class="info-label">Vet:</span>
              <span class="info-value text-cyan-3">{{ resolveNombreVet(visita.idveterinario) }}</span>
            </div>

            <!-- Motivo de Consulta -->
            <div class="motivo-box q-mt-sm">
              <div class="box-title">
                <q-icon name="help_outline" size="14px" color="amber-4" class="q-mr-xs" />
                Motivo de Consulta
              </div>
              <div class="box-content">{{ visita.motivoconsulta }}</div>
            </div>

            <!-- Diagnóstico -->
            <div v-if="visita.diagnostico" class="diagnostico-box q-mt-sm">
              <div class="box-title">
                <q-icon name="assignment" size="14px" color="green-4" class="q-mr-xs" />
                Diagnóstico
              </div>
              <div class="box-content">{{ visita.diagnostico }}</div>
            </div>

            <!-- Lista de Tratamientos Aplicados en esta visita -->
            <div class="tratamientos-section q-mt-md">
              <div style="font-size:12px; font-weight:700; color:rgba(255,255,255,0.6); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px">
                Tratamientos y Procedimientos ({{ obtenerTratamientosVisita(visita).length }})
              </div>
              <div v-if="obtenerTratamientosVisita(visita).length === 0" style="font-size:12px; color:rgba(255,255,255,0.4); font-style:italic">
                Sin tratamientos recetados
              </div>
              <div v-else style="display:flex; flex-direction:column; gap:4px">
                <div
                  v-for="trat in obtenerTratamientosVisita(visita)"
                  :key="trat.idtratamiento || trat._id"
                  class="trat-item"
                >
                  <span style="font-weight:600; color:#fff">{{ trat.tipo }}</span>
                  <span style="color:#a55eea; font-weight:700">{{ formatoCOP(trat.costo || 45000) }}</span>
                </div>
              </div>
            </div>

            <!-- Estado de Pago -->
            <div class="pago-section q-mt-md">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px">
                <div style="font-size:12px; font-weight:700; color:rgba(255,255,255,0.6); text-transform:uppercase; letter-spacing:0.5px">Estado de Pago</div>
                <q-badge
                  :class="estadoPagoBadgeClass(visita.estado_pago)"
                  class="pago-badge"
                >
                  <q-icon :name="estadoPagoIcon(visita.estado_pago)" size="12px" class="q-mr-xs" />
                  {{ estadoPagoLabel(visita.estado_pago) }}
                </q-badge>
              </div>
              <!-- Barra de progreso para abono -->
              <div v-if="visita.estado_pago === 'abono' && visita.monto_abono > 0">
                <div style="display:flex; justify-content:space-between; font-size:11px; color:rgba(255,255,255,0.5); margin-bottom:4px">
                  <span>Abonado: {{ formatoCOP(visita.monto_abono) }}</span>
                  <span>Pendiente: {{ formatoCOP(Math.max(0, calcularCostoTotalVisita(visita) - visita.monto_abono)) }}</span>
                </div>
                <q-linear-progress
                  :value="Math.min(1, visita.monto_abono / calcularCostoTotalVisita(visita))"
                  color="amber-6"
                  track-color="rgba(255,255,255,0.08)"
                  rounded
                  style="height:6px; border-radius:4px"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator color="rgba(255,255,255,0.08)" />

          <!-- Card Footer con Precio Total COP y Botones de Acción -->
          <div class="visita-card-footer">
            <div class="precio-box">
              <div style="font-size:11px; color:rgba(255,255,255,0.5); text-transform:uppercase">Costo Total</div>
              <div style="font-size:16px; font-weight:800; color:#26de81">
                {{ formatoCOP(calcularCostoTotalVisita(visita)) }}
              </div>
            </div>

            <div style="display:flex; gap:4px">
              <q-btn
                flat round dense
                icon="edit"
                size="sm"
                class="action-btn edit-btn"
                @click="openDialog(visita)"
              >
                <q-tooltip>Editar Visita</q-tooltip>
              </q-btn>
              <q-btn
                flat round dense
                icon="delete"
                size="sm"
                class="action-btn delete-btn"
                @click="confirmarEliminar(visita)"
              >
                <q-tooltip>Eliminar Visita</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- ── Dialog Formulario Crear/Editar Visita ───────────────────────────── -->
    <q-dialog v-model="dialog" class="vet-dialog">
      <q-card style="width:520px; max-width:95vw; background:#1a1d2e; border:1px solid rgba(255,255,255,0.1); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <q-icon name="event_note" size="22px" style="color:#26de81" class="q-mr-sm" />
            {{ selectedId ? 'Editar Visita Médica' : 'Nueva Visita Médica' }}
          </div>
          <q-btn flat round dense icon="close" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />
        <q-card-section class="q-pa-lg q-gutter-sm">
          <!-- Select Mascota con Búsqueda -->
          <q-select
            v-model="form.idmascota"
            :options="mascotasFiltradasOpts"
            use-input
            input-debounce="0"
            @filter="filterMascotas"
            label="Buscar Mascota *"
            dark outlined dense class="vet-input"
            popup-content-class="vet-select-popup"
            option-value="value" option-label="label"
            emit-value map-options
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey-5">No se encontraron mascotas</q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Select Veterinario con Búsqueda -->
          <q-select
            v-model="form.idveterinario"
            :options="vetsFiltradosOpts"
            use-input
            input-debounce="0"
            @filter="filterVets"
            label="Buscar Veterinario Atendió *"
            dark outlined dense class="vet-input"
            popup-content-class="vet-select-popup"
            option-value="value" option-label="label"
            emit-value map-options
            @update:model-value="onVetChange"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey-5">No se encontraron veterinarios</q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            :model-value="form.fechavisita"
            label="Fecha de la consulta (automática)"
            dark outlined dense class="vet-input"
            readonly
          >
            <template #prepend>
              <q-icon name="lock" color="grey-6" size="16px" />
            </template>
            <template #append>
              <q-icon name="event" color="grey-6" size="16px" />
            </template>
          </q-input>
          <q-input v-model="form.motivoconsulta" label="Motivo de consulta *" dark outlined dense class="vet-input" />
          <q-input v-model="form.diagnostico"    label="Diagnóstico médico"    dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input v-model="form.observaciones"  label="Observaciones adicionales" dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input v-model.number="form.pesoregistrado" label="Peso registrado (kg)" dark outlined dense class="vet-input" type="number" step="0.1" />

          <!-- Tarifa de Consulta y Costo Total en COP -->
          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-6">
              <q-input
                v-model.number="form.costo_consulta"
                label="Tarifa Consulta (COP)"
                dark outlined dense class="vet-input"
                type="number"
                prefix="$"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="form.costo_total"
                label="Costo Total Estimado (COP)"
                dark outlined dense class="vet-input"
                type="number"
                prefix="$"
              />
            </div>
          </div>

          <!-- Estado de Pago -->
          <div class="q-mt-sm">
            <div style="font-size:12px; color:rgba(255,255,255,0.5); margin-bottom:8px; font-weight:600">ESTADO DE PAGO</div>
            <div class="pago-opts-row">
              <div
                v-for="opt in opcionesPago"
                :key="opt.value"
                class="pago-opt-btn"
                :class="{ 'pago-opt-active': form.estado_pago === opt.value, ['pago-opt-' + opt.value]: true }"
                @click="form.estado_pago = opt.value; if(opt.value !== 'abono') form.monto_abono = 0"
              >
                <q-icon :name="opt.icon" size="16px" class="q-mr-xs" />
                {{ opt.label }}
              </div>
            </div>
          </div>

          <!-- Monto de Abono (solo cuando estado_pago === 'abono') -->
          <div v-if="form.estado_pago === 'abono'" class="q-mt-sm">
            <q-input
              v-model.number="form.monto_abono"
              label="Monto Abonado (COP)"
              dark outlined dense class="vet-input"
              type="number"
              prefix="$"
            >
              <template #hint>
                <span style="color:rgba(255,255,255,0.4)">Ingresa cuánto ha pagado el cliente hasta ahora</span>
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn
            unelevated label="Guardar Visita" icon="save"
            :loading="visitasStore.saving"
            style="background:linear-gradient(135deg,#26de81,#20bf6b);color:white;border-radius:10px"
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
          <div style="font-size:18px;font-weight:700;color:#fff;margin-top:12px">¿Eliminar visita?</div>
          <div style="color:rgba(255,255,255,0.5);margin-top:8px;font-size:14px">Esta acción no se puede deshacer.</div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="deleteDialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn unelevated label="Eliminar" icon="delete" color="red-7" :loading="visitasStore.deleting" @click="eliminar" style="border-radius:10px" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo Pregunta Tratamiento al terminar formulario de visita ─────────────── -->
    <q-dialog v-model="preguntaTratamientoDialog" persistent>
      <q-card style="width:480px; max-width:92vw; background:#161926; border:1px solid rgba(253,150,68,0.3); border-radius:20px; overflow:hidden">
        <q-card-section style="background:linear-gradient(135deg,rgba(253,150,68,0.15),rgba(231,76,60,0.05)); padding:24px 28px; text-align:center">
          <div style="width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg,#fd9644,#e74c3c); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; box-shadow:0 8px 24px rgba(253,150,68,0.35)">
            <q-icon name="medication" size="36px" color="white" />
          </div>
          <div style="font-size:20px; font-weight:800; color:#fff">
            ¿Deseas agregar un tratamiento para esta visita?
          </div>
          <div style="font-size:13px; color:rgba(255,255,255,0.65); margin-top:8px; line-height:1.5">
            La consulta médica para <strong class="text-amber-4">{{ resolveNombreMascota(visitaRecienCreada?.idmascota) }}</strong> ha sido guardada exitosamente. ¿Deseas recetar o asociar un tratamiento médico ahora mismo?
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-lg q-pt-md" style="gap:12px">
          <q-btn
            flat
            label="No, finalizar visita"
            style="color:rgba(255,255,255,0.6); border-radius:10px"
            @click="preguntaTratamientoDialog = false"
          />
          <q-btn
            unelevated
            label="Sí, agregar tratamiento"
            icon="medication"
            style="background:linear-gradient(135deg,#fd9644,#e74c3c); color:#fff; border-radius:10px; font-weight:700; padding:10px 20px"
            @click="abrirTratamientoRapido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo Formulario Tratamiento Rápido ─────────────── -->
    <q-dialog v-model="tratamientoRapidoDialog" class="vet-dialog">
      <q-card style="min-width:480px; max-width:92vw; background:#1a1d2e; border:1px solid rgba(253,150,68,0.3); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <q-icon name="medication" size="22px" style="color:#fd9644" class="q-mr-sm" />
            Nuevo Tratamiento para Consulta
          </div>
          <q-btn flat round dense icon="close" @click="tratamientoRapidoDialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />

        <q-card-section class="q-pa-lg q-gutter-sm">
          <q-input v-model="formTratamiento.tipo" label="Tipo de tratamiento *" dark outlined dense class="vet-input" placeholder="Ej. Antibiótico, Vacunación, Desparasitación" />
          <q-input v-model.number="formTratamiento.costo" label="Costo en COP ($)" dark outlined dense class="vet-input" type="number" prefix="$" />
          <q-input v-model="formTratamiento.descripcion" label="Descripción" dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input v-model="formTratamiento.dosis_indicaciones" label="Dosis / Indicaciones" dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input v-model="formTratamiento.proxima_fecha" label="Próxima fecha de control" dark outlined dense class="vet-input" type="date" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="tratamientoRapidoDialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn
            unelevated
            label="Guardar Tratamiento"
            icon="save"
            :loading="tratamientosStore.saving"
            style="background:linear-gradient(135deg,#fd9644,#e74c3c);color:white;border-radius:10px"
            @click="guardarTratamientoRapido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useVisitasStore }      from '../stores/useVisitasStore.js'
import { useMascotasStore }     from '../stores/useMascotasStore.js'
import { useVeterinariosStore } from '../stores/useVeterinariosStore.js'
import { useTratamientosStore } from '../stores/useTratamientosStore.js'
import { useDuenosStore }       from '../stores/useDuenosStore.js'

const $q = useQuasar()
const visitasStore      = useVisitasStore()
const mascotasStore     = useMascotasStore()
const veterinariosStore = useVeterinariosStore()
const tratamientosStore = useTratamientosStore()
const duenosStore       = useDuenosStore()

const dialog       = ref(false)
const deleteDialog = ref(false)
const searchTerm   = ref('')
const selectedId   = ref(null)

// ── Variables para flujo de tratamiento al terminar visita ──
const preguntaTratamientoDialog = ref(false)
const tratamientoRapidoDialog   = ref(false)
const visitaRecienCreada        = ref(null)

const formTratamiento = ref({
  idvisita: '',
  tipo: '',
  descripcion: '',
  dosis_indicaciones: '',
  costo: 45000,
  proxima_fecha: ''
})

const mascotasFiltradasOpts = ref([])
const vetsFiltradosOpts     = ref([])

const opcionesPago = [
  { value: 'pagado',   label: 'Pagado',   icon: 'check_circle' },
  { value: 'abono',    label: 'Abono',    icon: 'payments' },
  { value: 'pendiente', label: 'Pendiente', icon: 'pending' },
]

const form = ref({
  idmascota:'', idveterinario:'',
  fechavisita: new Date().toISOString().slice(0,10),
  motivoconsulta:'', diagnostico:'', observaciones:'', pesoregistrado: null,
  costo_consulta: 70000, costo_total: 70000,
  estado_pago: 'pendiente', monto_abono: 0
})

function extractId(val) {
  if (!val) return null
  if (typeof val === 'object') return (val._id || val.idmascota || val.idveterinario || val.idvisita || '').toString()
  return val.toString()
}

const opcionesMascotas = computed(() => {
  return mascotasStore.mascotas.map(m => ({
    label: `${m.codigo ? '[' + m.codigo + '] ' : ''}${m.nombre} (${m.especie || 'N/D'})`,
    value: m.idmascota || m._id
  }))
})

const opcionesVets = computed(() => {
  const currentSelectedId = extractId(form.value.idveterinario)
  return veterinariosStore.veterinarios
    .filter(v => v.estado !== false || extractId(v.idveterinario || v._id) === currentSelectedId)
    .map(v => {
      const isInactivo = v.estado === false
      const ced = v.cedula ? `C.C. ${v.cedula} — ` : ''
      return {
        label: isInactivo ? `${v.nombre} (INACTIVO — No disponible)` : `${v.nombre} (${ced}${formatoCOP(v.costo_consulta || 70000)})`,
        value: v.idveterinario || v._id,
        costo: v.costo_consulta || 70000,
        disable: isInactivo
      }
    })
})

function filterMascotas(val, update) {
  if (val === '') {
    update(() => { mascotasFiltradasOpts.value = opcionesMascotas.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    mascotasFiltradasOpts.value = opcionesMascotas.value.filter(
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

const visitasFiltradas = computed(() => {
  if (!searchTerm.value) return visitasStore.visitas
  const q = searchTerm.value.toLowerCase()
  return visitasStore.visitas.filter(v => {
    const nombreMascota = resolveNombreMascota(v.idmascota).toLowerCase()
    const codigoMascota = resolveCodigoMascota(v.idmascota).toLowerCase()
    const nombreVet     = resolveNombreVet(v.idveterinario).toLowerCase()
    const nombreDueno   = resolveNombreDueno(v.idmascota).toLowerCase()
    const motivo        = (v.motivoconsulta || '').toLowerCase()
    const diag          = (v.diagnostico || '').toLowerCase()
    return nombreMascota.includes(q) || codigoMascota.includes(q) || nombreVet.includes(q) || nombreDueno.includes(q) || motivo.includes(q) || diag.includes(q)
  })
})

function resolveCodigoMascota(val) {
  if (!val) return ''
  if (typeof val === 'object' && val.codigo) return val.codigo
  const idStr = extractId(val)
  const m = mascotasStore.mascotas.find(item => extractId(item.idmascota || item._id) === idStr)
  return m?.codigo || ''
}

function resolveNombreMascota(val) {
  if (!val) return 'Mascota'
  if (typeof val === 'object' && val.nombre) return val.nombre
  const idStr = extractId(val)
  const m = mascotasStore.mascotas.find(item => extractId(item.idmascota || item._id) === idStr)
  return m ? m.nombre : 'Mascota'
}

function resolveEspecieRaza(val) {
  if (!val) return ''
  if (typeof val === 'object' && val.especie) return `${val.especie} ${val.raza ? '• ' + val.raza : ''}`
  const idStr = extractId(val)
  const m = mascotasStore.mascotas.find(item => extractId(item.idmascota || item._id) === idStr)
  return m ? `${m.especie} ${m.raza ? '• ' + m.raza : ''}` : ''
}

function resolveNombreVet(val) {
  if (!val) return 'Veterinario'
  if (typeof val === 'object' && val.nombre) return val.nombre
  const idStr = extractId(val)
  const v = veterinariosStore.veterinarios.find(item => extractId(item.idveterinario || item._id) === idStr)
  return v ? v.nombre : 'Veterinario'
}

function resolveNombreDueno(mascotaVal) {
  if (!mascotaVal) return 'Sin dueño'

  if (typeof mascotaVal === 'object') {
    const duenoPop = mascotaVal['iddueño'] || mascotaVal.iddueño
    if (duenoPop && typeof duenoPop === 'object' && duenoPop.nombre) {
      const ced = duenoPop.cedula ? ` (C.C. ${duenoPop.cedula})` : ''
      return duenoPop.nombre + ced
    }
    if (duenoPop) {
      const idStr = typeof duenoPop === 'object'
        ? (duenoPop._id || '').toString()
        : duenoPop.toString()
      const d = duenosStore.duenos.find(item => (item['iddueño'] || item._id)?.toString() === idStr)
      return d ? (d.cedula ? `${d.nombre} (C.C. ${d.cedula})` : d.nombre) : 'Sin dueño'
    }
  }

  const idStr = extractId(mascotaVal)
  const m = mascotasStore.mascotas.find(item => extractId(item.idmascota || item._id) === idStr)
  if (!m) return 'Sin dueño'
  const duenoPop = m['iddueño'] || m.iddueño
  if (!duenoPop) return 'Sin dueño'
  const duenIdStr = typeof duenoPop === 'object'
    ? (duenoPop._id || '').toString()
    : duenoPop.toString()
  const d = duenosStore.duenos.find(item => (item['iddueño'] || item._id)?.toString() === duenIdStr)
  return d ? (d.cedula ? `${d.nombre} (C.C. ${d.cedula})` : d.nombre) : 'Sin dueño'
}

function estadoPagoBadgeClass(estado) {
  if (estado === 'pagado')   return 'badge-pagado'
  if (estado === 'abono')    return 'badge-abono'
  return 'badge-pendiente'
}

function estadoPagoIcon(estado) {
  if (estado === 'pagado')   return 'check_circle'
  if (estado === 'abono')    return 'payments'
  return 'pending'
}

function estadoPagoLabel(estado) {
  if (estado === 'pagado')   return 'Pagado'
  if (estado === 'abono')    return 'Abono'
  return 'Pendiente'
}

function obtenerTratamientosVisita(visita) {
  const visitId = extractId(visita.idvisita || visita._id)
  return tratamientosStore.tratamientos.filter(t => extractId(t.idvisita) === visitId)
}

function calcularCostoTotalVisita(visita) {
  if (visita.costo_total && visita.costo_total > 0) return visita.costo_total
  const costoBase = visita.costo_consulta || 70000
  const trats = obtenerTratamientosVisita(visita)
  const sumaTrat = trats.reduce((acc, curr) => acc + (curr.costo || 45000), 0)
  return costoBase + sumaTrat
}

function onVetChange(vetId) {
  const vetObj = opcionesVets.value.find(v => v.value === vetId)
  if (vetObj) {
    form.value.costo_consulta = vetObj.costo
    form.value.costo_total = vetObj.costo
  }
}

function openDialog(row = null) {
  mascotasFiltradasOpts.value = opcionesMascotas.value
  vetsFiltradosOpts.value     = opcionesVets.value

  if (row) {
    form.value = {
      idmascota: extractId(row.idmascota),
      idveterinario: extractId(row.idveterinario),
      fechavisita: new Date().toISOString().slice(0,10),
      motivoconsulta: row.motivoconsulta,
      diagnostico: row.diagnostico,
      observaciones: row.observaciones,
      pesoregistrado: row.pesoregistrado,
      costo_consulta: row.costo_consulta || 70000,
      costo_total: row.costo_total || 70000,
      estado_pago: row.estado_pago || 'pendiente',
      monto_abono: row.monto_abono || 0
    }
    selectedId.value = row.idvisita || row._id
  } else {
    form.value = {
      idmascota:'', idveterinario:'',
      fechavisita: new Date().toISOString().slice(0,10),
      motivoconsulta:'', diagnostico:'', observaciones:'', pesoregistrado: null,
      costo_consulta: 70000, costo_total: 70000,
      estado_pago: 'pendiente', monto_abono: 0
    }
    selectedId.value = null
  }
  dialog.value = true
}

async function guardar() {
  if (!form.value.idmascota || !form.value.idveterinario || !form.value.motivoconsulta) {
    $q.notify({ type:'warning', message: 'Mascota, veterinario y motivo son obligatorios' })
    return
  }

  // Validación extra: Verificar que el veterinario no esté inactivo
  const vetObj = veterinariosStore.getById(form.value.idveterinario)
  if (vetObj && vetObj.estado === false) {
    $q.notify({
      type: 'negative',
      message: `El veterinario "${vetObj.nombre}" está inactivo y no se le pueden asignar visitas.`,
      icon: 'pause_circle_filled'
    })
    return
  }

  try {
    if (selectedId.value) {
      await visitasStore.actualizar(selectedId.value, form.value)
      $q.notify({ type:'positive', message:'Visita actualizada' })
      dialog.value = false
    } else {
      const res = await visitasStore.crear(form.value)
      dialog.value = false
      visitaRecienCreada.value = res?.visita || res
      $q.notify({ type:'positive', message:'Visita registrada exitosamente' })
      // Preguntar si se va a agregar tratamiento a esta visita: ¡solo saldrá al terminar el formulario!
      preguntaTratamientoDialog.value = true
    }
  } catch (e) {
    $q.notify({ type:'negative', message: visitasStore.error || e.message })
  }
}

// ── Flujo Tratamiento Rápido ──
function abrirTratamientoRapido() {
  preguntaTratamientoDialog.value = false
  const v = visitaRecienCreada.value
  formTratamiento.value = {
    idvisita: extractId(v?._id || v?.idvisita),
    tipo: 'Medicación / Control',
    descripcion: `Tratamiento recetado durante la consulta de ${resolveNombreMascota(v?.idmascota)}`,
    dosis_indicaciones: 'Seguir indicaciones médicas adjuntas',
    costo: 45000,
    proxima_fecha: ''
  }
  tratamientoRapidoDialog.value = true
}

async function guardarTratamientoRapido() {
  if (!formTratamiento.value.tipo) {
    $q.notify({ type: 'warning', message: 'El tipo de tratamiento es obligatorio' })
    return
  }
  try {
    await tratamientosStore.crear(formTratamiento.value)
    $q.notify({ type: 'positive', message: 'Tratamiento registrado exitosamente' })
    tratamientoRapidoDialog.value = false
    await visitasStore.fetchAll()
  } catch (e) {
    $q.notify({ type: 'negative', message: tratamientosStore.error || e.message })
  }
}

function confirmarEliminar(row) {
  selectedId.value = row.idvisita || row._id
  deleteDialog.value = true
}

async function eliminar() {
  try {
    await visitasStore.eliminar(selectedId.value)
    $q.notify({ type:'positive', message:'Visita eliminada' })
    deleteDialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: visitasStore.error || e.message })
  }
}

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
    visitasStore.fetchAll(),
    mascotasStore.fetchAll(),
    veterinariosStore.fetchAll(),
    tratamientosStore.fetchAll(),
    duenosStore.fetchAll()
  ])
  mascotasFiltradasOpts.value = opcionesMascotas.value
  vetsFiltradosOpts.value     = opcionesVets.value
})
</script>

<style scoped>
.vet-page { background: #0f1117; min-height: 100vh; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.page-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1 1 0;
  min-width: 0;
}
.page-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.page-title { font-size: 20px; font-weight: 700; color: #fff; margin: 0; line-height: 1.2; }
.page-sub {
  font-size: 12px; color: rgba(255,255,255,0.45); margin: 3px 0 0;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

.add-btn {
  background: linear-gradient(135deg, #26de81, #20bf6b) !important;
  color: white !important; border-radius: 10px !important; font-weight: 600;
  padding: 8px 16px; transition: all 0.2s ease; white-space: nowrap; flex-shrink: 0;
}
.add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(38,222,129,0.4); }

.search-bar { display: flex; gap: 12px; }
.search-input { flex: 1; }

/* pago options responsive */
.pago-opts-row {
  display: flex; gap: 8px; flex-wrap: wrap;
}

/* Visita Card */
.visita-card {
  background: #1a1d2e !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 16px !important;
  overflow: hidden;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.visita-card:hover {
  transform: translateY(-3px);
  border-color: rgba(38,222,129,0.4) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.visita-card-header {
  background: rgba(255,255,255,0.03);
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.pet-avatar {
  width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg,#f7b731,#ffa502);
  display: flex; align-items: center; justify-content: center;
}
.pet-name { font-size: 16px; font-weight: 700; color: #fff; line-height: 1.2; }
.pet-sub { font-size: 12px; color: rgba(255,255,255,0.5); }
.fecha-badge { font-size: 11px; padding: 4px 8px; border-radius: 8px; }

.visita-card-body { padding: 16px 18px; flex: 1; }
.info-row { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.info-label { color: rgba(255,255,255,0.5); font-weight: 500; }
.info-value { font-weight: 600; }

.motivo-box, .diagnostico-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 10px 12px;
}
.box-title { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); display: flex; align-items: center; }
.box-content { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 3px; line-height: 1.4; }

.tratamientos-section {
  background: rgba(165,94,234,0.06);
  border: 1px solid rgba(165,94,234,0.15);
  border-radius: 10px;
  padding: 10px 12px;
}
.trat-item {
  display: flex; align-items: center; justify-content: space-between; font-size: 12px; padding: 2px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.06);
}
.trat-item:last-child { border-bottom: none; }

.visita-card-footer {
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0,0,0,0.15);
}

.action-btn { transition: all 0.15s ease; }
.edit-btn { color: #26de81 !important; }
.edit-btn:hover { background: rgba(38,222,129,0.15) !important; }
.delete-btn { color: #ff6b6b !important; }
.delete-btn:hover { background: rgba(255,107,107,0.15) !important; }

/* Dueño row */
.dueno-row {
  display: flex; align-items: center; gap: 6px; font-size: 12px;
  border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 4px;
}
.dueno-label { color: rgba(255,255,255,0.45); font-weight: 500; }
.dueno-value { color: #d4a0ff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }

/* Pago section */
.pago-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 10px 12px;
}
.pago-badge { font-size: 11px; padding: 4px 8px; border-radius: 8px; font-weight: 700; }
.badge-pagado  { background: rgba(38,222,129,0.2) !important; color: #26de81 !important; border: 1px solid rgba(38,222,129,0.35) !important; }
.badge-abono   { background: rgba(252,196,25,0.2) !important; color: #fcc419 !important; border: 1px solid rgba(252,196,25,0.35) !important; }
.badge-pendiente { background: rgba(255,107,107,0.2) !important; color: #ff6b6b !important; border: 1px solid rgba(255,107,107,0.35) !important; }

/* Payment option buttons in form */
.pago-opt-btn {
  display: flex; align-items: center; padding: 8px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  transition: all 0.2s ease;
  user-select: none;
}
.pago-opt-btn:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
.pago-opt-active.pago-opt-pagado   { background: rgba(38,222,129,0.15); border-color: #26de81; color: #26de81; }
.pago-opt-active.pago-opt-abono    { background: rgba(252,196,25,0.15); border-color: #fcc419; color: #fcc419; }
.pago-opt-active.pago-opt-pendiente { background: rgba(255,107,107,0.15); border-color: #ff6b6b; color: #ff6b6b; }

</style>
