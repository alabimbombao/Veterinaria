<template>
  <q-page class="vet-page q-pa-lg">

    <!-- Page Header -->
    <div class="page-header q-mb-lg">
      <div class="page-header-left">
        <div class="page-icon" :style="{ background: iconGradient }">
          <q-icon :name="icon" size="24px" color="white" />
        </div>
        <div>
          <h2 class="page-title">{{ title }}</h2>
          <p class="page-sub">{{ subtitle }}</p>
        </div>
      </div>
      <q-btn
        unelevated
        :label="addLabel"
        icon="add"
        class="add-btn"
        @click="$emit('add')"
      />
    </div>

    <!-- Search + Filters -->
    <div class="search-bar q-mb-lg">
      <q-input
        v-model="search"
        placeholder="Buscar..."
        dense
        outlined
        dark
        class="vet-input search-input"
        @update:model-value="$emit('search', search)"
      >
        <template #prepend>
          <q-icon name="search" color="grey-6" />
        </template>
        <template #append v-if="search">
          <q-icon name="close" color="grey-6" class="cursor-pointer" @click="search = ''; $emit('search', '')" />
        </template>
      </q-input>
    </div>

    <!-- Table -->
    <q-card class="vet-card table-card">
      <q-table
        :rows="rows"
        :columns="columns"
        :loading="loading"
        row-key="_id"
        flat
        dark
        class="vet-table"
        :rows-per-page-options="[10, 25, 50]"
        :no-data-label="noDataLabel"
      >
        <template #loading>
          <q-inner-loading showing color="purple" />
        </template>

        <!-- Actions column -->
        <template #body-cell-acciones="props">
          <q-td :props="props" class="actions-cell">
            <q-btn
              flat round dense
              icon="edit"
              size="sm"
              class="action-btn edit-btn"
              @click="$emit('edit', props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat round dense
              icon="delete"
              size="sm"
              class="action-btn delete-btn q-ml-xs"
              @click="$emit('delete', props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Status badge -->
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :label="props.value ? 'Activo' : 'Inactivo'"
              :color="props.value ? 'green-8' : 'red-9'"
              class="status-badge"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Slot for dialog -->
    <slot />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title:        { type: String, default: 'Gestión' },
  subtitle:     { type: String, default: '' },
  addLabel:     { type: String, default: 'Agregar' },
  icon:         { type: String, default: 'list' },
  iconGradient: { type: String, default: 'linear-gradient(135deg,#6c63ff,#48cae4)' },
  rows:         { type: Array, default: () => [] },
  columns:      { type: Array, default: () => [] },
  loading:      { type: Boolean, default: false },
  noDataLabel:  { type: String, default: 'Sin registros' },
})

defineEmits(['add', 'edit', 'delete', 'search'])

const search = ref('')
</script>

<style scoped>
.vet-page { background: #0f1117; min-height: 100vh; }

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.page-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  margin: 2px 0 0;
}

.add-btn {
  background: linear-gradient(135deg, #6c63ff, #48cae4) !important;
  color: white !important;
  border-radius: 10px !important;
  font-weight: 600;
  padding: 8px 20px;
  transition: all 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(108,99,255,0.4);
}

/* Search */
.search-bar { display: flex; gap: 12px; }
.search-input { flex: 1; max-width: 400px; }

/* Table Card */
.table-card {
  background: #1a1d2e !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  border-radius: 16px !important;
  overflow: hidden;
}

/* Actions */
.actions-cell { white-space: nowrap; }

.action-btn { transition: all 0.15s ease; }
.edit-btn { color: #6c63ff !important; }
.edit-btn:hover { background: rgba(108,99,255,0.15) !important; }
.delete-btn { color: #ff6b6b !important; }
.delete-btn:hover { background: rgba(255,107,107,0.15) !important; }

.status-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; }
</style>
