<template>
  <CrudPage
    title="Visitas"
    subtitle="Consultas y citas médicas registradas"
    add-label="Nueva Visita"
    icon="event_note"
    icon-gradient="linear-gradient(135deg,#26de81,#20bf6b)"
    :rows="visitasStore.filtradas(searchTerm)"
    :columns="columns"
    :loading="visitasStore.loading"
    no-data-label="No hay visitas registradas"
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
            <q-icon name="event_note" size="22px" style="color:#26de81" class="q-mr-sm" />
            {{ selectedId ? 'Editar Visita' : 'Nueva Visita' }}
          </div>
          <q-btn flat round dense icon="close" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />
        <q-card-section class="q-pa-lg q-gutter-sm">
          <q-select
            v-model="form.idmascota"
            :options="mascotasStore.opciones"
            label="Mascota *"
            dark outlined dense class="vet-input"
            option-value="value" option-label="label"
            emit-value map-options
          />
          <q-select
            v-model="form.idveterinario"
            :options="veterinariosStore.opciones"
            label="Veterinario *"
            dark outlined dense class="vet-input"
            option-value="value" option-label="label"
            emit-value map-options
          />
          <q-input
            v-model="form.fechavisita"
            label="Fecha de visita"
            dark outlined dense class="vet-input"
            type="date"
          />
          <q-input v-model="form.motivoconsulta" label="Motivo de consulta *" dark outlined dense class="vet-input" />
          <q-input v-model="form.diagnostico"    label="Diagnóstico"           dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input v-model="form.observaciones"  label="Observaciones"         dark outlined dense class="vet-input" type="textarea" autogrow />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn
            unelevated label="Guardar" icon="save"
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
  </CrudPage>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import CrudPage from '../components/CrudPage.vue'
import { useVisitasStore }      from '../stores/useVisitasStore.js'
import { useMascotasStore }     from '../stores/useMascotasStore.js'
import { useVeterinariosStore } from '../stores/useVeterinariosStore.js'

const $q = useQuasar()
const visitasStore      = useVisitasStore()
const mascotasStore     = useMascotasStore()
const veterinariosStore = useVeterinariosStore()

const dialog       = ref(false)
const deleteDialog = ref(false)
const searchTerm   = ref('')
const selectedId   = ref(null)

const form = ref({
  idmascota:'', idveterinario:'',
  fechavisita: new Date().toISOString().slice(0,10),
  motivoconsulta:'', diagnostico:'', observaciones:''
})

const columns = [
  { name:'idmascota',     label:'Mascota',    field: r => resolveNombre(r.idmascota, mascotasStore.mascotas, 'idmascota','nombre'), align:'left', sortable:true },
  { name:'idveterinario', label:'Veterinario',field: r => resolveNombre(r.idveterinario, veterinariosStore.veterinarios,'idveterinario','nombre'), align:'left' },
  { name:'fechavisita',   label:'Fecha',      field: r => r.fechavisita ? new Date(r.fechavisita).toLocaleDateString('es-ES') : '—', align:'center', sortable:true },
  { name:'motivoconsulta',label:'Motivo',     field:'motivoconsulta', align:'left' },
  { name:'diagnostico',   label:'Diagnóstico',field:'diagnostico',    align:'left' },
  { name:'estado',        label:'Estado',     field:'estado',         align:'center' },
  { name:'acciones',      label:'Acciones',   field:'acciones',       align:'center' },
]

function resolveNombre(id, lista, campo, campoNombre) {
  const item = lista?.find(i => (i[campo] || i._id)?.toString() === id?.toString())
  return item ? item[campoNombre] : id
}

function openDialog(row = null) {
  if (row) {
    form.value = {
      idmascota: row.idmascota, idveterinario: row.idveterinario,
      fechavisita: row.fechavisita ? new Date(row.fechavisita).toISOString().slice(0,10) : '',
      motivoconsulta: row.motivoconsulta, diagnostico: row.diagnostico, observaciones: row.observaciones
    }
    selectedId.value = row.idvisita || row._id
  } else {
    form.value = { idmascota:'', idveterinario:'', fechavisita: new Date().toISOString().slice(0,10), motivoconsulta:'', diagnostico:'', observaciones:'' }
    selectedId.value = null
  }
  dialog.value = true
}

async function guardar() {
  if (!form.value.idmascota || !form.value.idveterinario || !form.value.motivoconsulta) {
    $q.notify({ type:'warning', message: 'Mascota, veterinario y motivo son obligatorios' })
    return
  }
  try {
    if (selectedId.value) {
      await visitasStore.actualizar(selectedId.value, form.value)
      $q.notify({ type:'positive', message:'Visita actualizada' })
    } else {
      await visitasStore.crear(form.value)
      $q.notify({ type:'positive', message:'Visita creada' })
    }
    dialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: visitasStore.error || e.message })
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

function onSearch(val) { searchTerm.value = val }

onMounted(async () => {
  await Promise.all([
    visitasStore.fetchAll(),
    mascotasStore.fetchAll(),
    veterinariosStore.fetchAll()
  ])
})
</script>
