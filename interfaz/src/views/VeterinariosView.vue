<template>
  <CrudPage
    title="Veterinarios"
    subtitle="Personal médico registrado"
    add-label="Nuevo Veterinario"
    icon="medical_services"
    icon-gradient="linear-gradient(135deg,#48cae4,#0077b6)"
    :rows="store.filtrados(searchTerm)"
    :columns="columns"
    :loading="store.loading"
    no-data-label="No hay veterinarios registrados"
    @add="openDialog()"
    @edit="openDialog($event)"
    @delete="confirmarEliminar($event)"
    @search="onSearch"
  >
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
          <q-input v-model="form.nombre"       label="Nombre *"      dark outlined dense class="vet-input" />
          <q-input v-model="form.especialidad" label="Especialidad"  dark outlined dense class="vet-input" />
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

    <!-- ── Confirm Delete ─────────────────────────────── -->
    <q-dialog v-model="deleteDialog">
      <q-card style="min-width:340px; background:#1a1d2e; border:1px solid rgba(255,107,107,0.2); border-radius:16px;">
        <q-card-section class="text-center q-pa-lg">
          <q-icon name="warning" size="48px" color="red-4" />
          <div style="font-size:18px;font-weight:700;color:#fff;margin-top:12px">¿Eliminar veterinario?</div>
          <div style="color:rgba(255,255,255,0.5);margin-top:8px;font-size:14px">Esta acción no se puede deshacer.</div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="deleteDialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn unelevated label="Eliminar" icon="delete" color="red-7" :loading="store.deleting" @click="eliminar" style="border-radius:10px" />
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

const dialog       = ref(false)
const deleteDialog = ref(false)
const searchTerm   = ref('')
const selectedId   = ref(null)
const form = ref({ nombre:'', especialidad:'' })

const columns = [
  { name:'nombre',       label:'Nombre',       field:'nombre',       align:'left', sortable:true },
  { name:'especialidad', label:'Especialidad',  field:'especialidad', align:'left', sortable:true },
  { name:'estado',       label:'Estado',        field:'estado',       align:'center' },
  { name:'acciones',     label:'Acciones',      field:'acciones',     align:'center' },
]

function openDialog(row = null) {
  if (row) {
    form.value   = { nombre: row.nombre, especialidad: row.especialidad }
    selectedId.value = row.idveterinario || row._id
  } else {
    form.value   = { nombre:'', especialidad:'' }
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
      $q.notify({ type:'positive', message:'Veterinario actualizado' })
    } else {
      await store.crear(form.value)
      $q.notify({ type:'positive', message:'Veterinario creado' })
    }
    dialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: store.error || e.message })
  }
}

function confirmarEliminar(row) {
  selectedId.value   = row.idveterinario || row._id
  deleteDialog.value = true
}

async function eliminar() {
  try {
    await store.eliminar(selectedId.value)
    $q.notify({ type:'positive', message:'Veterinario eliminado' })
    deleteDialog.value = false
  } catch (e) {
    $q.notify({ type:'negative', message: store.error || e.message })
  }
}

function onSearch(val) { searchTerm.value = val }

onMounted(() => store.fetchAll())
</script>
