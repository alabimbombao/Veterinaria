<template>
  <CrudPage
    title="Tratamientos"
    subtitle="Tratamientos médicos asignados a las visitas"
    add-label="Nuevo Tratamiento"
    icon="medication"
    icon-gradient="linear-gradient(135deg,#fd9644,#e74c3c)"
    :rows="tratamientosStore.filtrados(searchTerm)"
    :columns="columns"
    :loading="tratamientosStore.loading"
    no-data-label="No hay tratamientos registrados"
    @add="openDialog()"
    @edit="openDialog($event)"
    @delete="confirmarEliminar($event)"
    @search="onSearch"
  >
    <!-- ── Dialog Formulario ───────────────────────────── -->
    <q-dialog v-model="dialog" class="vet-dialog">
      <q-card style="min-width:480px; background:#1a1d2e; border:1px solid rgba(255,255,255,0.1); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <q-icon name="medication" size="22px" style="color:#fd9644" class="q-mr-sm" />
            {{ selectedId ? 'Editar Tratamiento' : 'Nuevo Tratamiento' }}
          </div>
          <q-btn flat round dense icon="close" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />
        <q-card-section class="q-pa-lg q-gutter-sm">
          <q-select
            v-model="form.idvisita"
            :options="visitasOpts"
            label="Visita *"
            dark outlined dense class="vet-input"
            option-value="value" option-label="label"
            emit-value map-options
          />
          <q-input v-model="form.tipo"               label="Tipo de tratamiento *"  dark outlined dense class="vet-input" />
          <q-input v-model="form.descripcion"        label="Descripción"            dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input v-model="form.dosis_indicaciones" label="Dosis / Indicaciones"   dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input
            v-model="form.proxima_fecha"
            label="Próxima fecha"
            dark outlined dense class="vet-input"
            type="date"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn
            unelevated label="Guardar" icon="save"
            :loading="tratamientosStore.saving"
            style="background:linear-gradient(135deg,#fd9644,#e74c3c);color:white;border-radius:10px"
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
          <div style="font-size:18px;font-weight:700;color:#fff;margin-top:12px">¿Eliminar tratamiento?</div>
          <div style="color:rgba(255,255,255,0.5);margin-top:8px;font-size:14px">Esta acción no se puede deshacer.</div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="deleteDialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn unelevated label="Eliminar" icon="delete" color="red-7" :loading="tratamientosStore.deleting" @click="eliminar" style="border-radius:10px" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </CrudPage>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import CrudPage from '../components/CrudPage.vue'
import { useTratamientosStore } from '../stores/useTratamientosStore.js'
import { useVisitasStore }      from '../stores/useVisitasStore.js'
import { useMascotasStore }     from '../stores/useMascotasStore.js'

const $q = useQuasar()
const tratamientosStore = useTratamientosStore()
const visitasStore      = useVisitasStore()
const mascotasStore     = useMascotasStore()

const dialog       = ref(false)
const deleteDialog = ref(false)
const searchTerm   = ref('')
const selectedId   = ref(null)

const form = ref({ idvisita:'', tipo:'', descripcion:'', dosis_indicaciones:'', proxima_fecha:'' })

const visitasOpts = computed(() => visitasStore.visitas.map(v => {
  const mascota = mascotasStore.mascotas.find(m => (m.idmascota || m._id)?.toString() === v.idmascota?.toString())
  return {
    label: `Visita ${new Date(v.fechavisita).toLocaleDateString('es-ES')} - ${mascota?.nombre || 'Mascota'}`,
    value: v.idvisita || v._id
  }
}))

const columns = [
  { name:'idvisita',          label:'Visita',             field: r => labelVisita(r.idvisita), align:'left', sortable:true },
  { name:'tipo',              label:'Tipo',               field:'tipo',              align:'left', sortable:true },
  { name:'descripcion',       label:'Descripción',        field:'descripcion',       align:'left' },
  { name:'dosis_indicaciones',label:'Dosis/Indicaciones', field:'dosis_indicaciones',align:'left' },
  { name:'proxima_fecha',     label:'Próxima Fecha',      field: r => r.proxima_fecha ? new Date(r.proxima_fecha).toLocaleDateString('es-ES') : '—', align:'center' },
  { name:'estado',            label:'Estado',             field:'estado',            align:'center' },
  { name:'acciones',          label:'Acciones',           field:'acciones',          align:'center' },
]

function labelVisita(id) {
  const v = visitasStore.visitas.find(x => (x.idvisita || x._id)?.toString() === id?.toString())
  if (!v) return id
  return v.fechavisita ? new Date(v.fechavisita).toLocaleDateString('es-ES') : id
}

function openDialog(row = null) {
  if (row) {
    form.value = {
      idvisita: row.idvisita,
      tipo: row.tipo, descripcion: row.descripcion, dosis_indicaciones: row.dosis_indicaciones,
      proxima_fecha: row.proxima_fecha ? new Date(row.proxima_fecha).toISOString().slice(0,10) : ''
    }
    selectedId.value = row.idtratamiento || row._id
  } else {
    form.value = { idvisita:'', tipo:'', descripcion:'', dosis_indicaciones:'', proxima_fecha:'' }
    selectedId.value = null
  }
  dialog.value = true
}

async function guardar() {
  if (!form.value.idvisita || !form.value.tipo) {
    $q.notify({ type:'warning', message: 'Visita y tipo de tratamiento son obligatorios' })
    return
  }
  try {
    if (selectedId.value) {
      await tratamientosStore.actualizar(selectedId.value, form.value)
      $q.notify({ type:'positive', message:'Tratamiento actualizado' })
    } else {
      await tratamientosStore.crear(form.value)
      $q.notify({ type:'positive', message:'Tratamiento creado' })
    }
    dialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: tratamientosStore.error || e.message })
  }
}

function confirmarEliminar(row) {
  selectedId.value = row.idtratamiento || row._id
  deleteDialog.value = true
}

async function eliminar() {
  try {
    await tratamientosStore.eliminar(selectedId.value)
    $q.notify({ type:'positive', message:'Tratamiento eliminado' })
    deleteDialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: tratamientosStore.error || e.message })
  }
}

function onSearch(val) { searchTerm.value = val }

onMounted(async () => {
  await Promise.all([
    tratamientosStore.fetchAll(),
    visitasStore.fetchAll(),
    mascotasStore.fetchAll()
  ])
})
</script>
