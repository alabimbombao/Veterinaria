<template>
  <CrudPage
    title="Mascotas"
    subtitle="Pacientes registrados en el sistema"
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
    <!-- ── Dialog Formulario ───────────────────────────── -->
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
          <q-input v-model="form.edad_aprox"   label="Edad aproximada"    dark outlined dense class="vet-input" />
          <q-input v-model="form.peso_actual"  label="Peso actual (kg)"   dark outlined dense class="vet-input" type="number" />
          <!-- Select Dueño — usa opciones del store de dueños -->
          <q-select
            v-model="form['iddueño']"
            :options="duenosStore.duenos.map(d => ({ label: d.nombre, value: d.iddueño || d._id }))"
            label="Dueño *"
            dark outlined dense class="vet-input"
            option-value="value" option-label="label"
            emit-value map-options
          />
          <!-- Select Veterinario — usa getter opciones del store de veterinarios -->
          <q-select
            v-model="form.idveterinario"
            :options="veterinariosStore.opciones"
            label="Veterinario asignado"
            dark outlined dense class="vet-input"
            option-value="value" option-label="label"
            emit-value map-options clearable
          />
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import CrudPage from '../components/CrudPage.vue'
import { useMascotasStore }     from '../stores/useMascotasStore.js'
import { useDuenosStore }       from '../stores/useDuenosStore.js'
import { useVeterinariosStore } from '../stores/useVeterinariosStore.js'

const $q = useQuasar()
const mascotasStore     = useMascotasStore()
const duenosStore       = useDuenosStore()
const veterinariosStore = useVeterinariosStore()

const dialog       = ref(false)
const deleteDialog = ref(false)
const searchTerm   = ref('')
const selectedId   = ref(null)

const form = ref({
  nombre:'', especie:'', raza:'', edad_aprox:'',
  peso_actual:'', 'iddueño': null, idveterinario: null
})

const columns = [
  { name:'nombre',     label:'Nombre',    field:'nombre',     align:'left', sortable:true },
  { name:'especie',    label:'Especie',   field:'especie',    align:'left', sortable:true },
  { name:'raza',       label:'Raza',      field:'raza',       align:'left' },
  { name:'edad_aprox', label:'Edad',      field:'edad_aprox', align:'left' },
  { name:'peso_actual',label:'Peso (kg)', field:'peso_actual',align:'center' },
  { name:'estado',     label:'Estado',    field:'estado',     align:'center' },
  { name:'acciones',   label:'Acciones',  field:'acciones',   align:'center' },
]

function openDialog(row = null) {
  if (row) {
    form.value = {
      nombre: row.nombre, especie: row.especie, raza: row.raza,
      edad_aprox: row.edad_aprox, peso_actual: row.peso_actual,
      'iddueño': row['iddueño'], idveterinario: row.idveterinario
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

onMounted(async () => {
  // Cargar los tres stores en paralelo (dueños y vets para los selects)
  await Promise.all([
    mascotasStore.fetchAll(),
    duenosStore.fetchAll(),
    veterinariosStore.fetchAll(),
  ])
})
</script>
