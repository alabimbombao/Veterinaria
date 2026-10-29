<template>
  <CrudPage
    title="Mascotas"
    subtitle="Pacientes registrados — Haz clic en una mascota para ver su expediente"
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
    <!-- Slot para renderizado del ID autoincrementado mt00, mt01... -->
    <template #body-cell-codigo="props">
      <q-td :props="props" class="text-center cursor-pointer" @click="verDetalle(props.row)">
        <q-badge color="purple-9" text-color="white" class="text-weight-bolder q-px-sm" style="font-size:12px; letter-spacing:0.5px; border-radius:6px">
          <q-icon name="tag" size="12px" class="q-mr-xs" />
          {{ props.row.codigo || '—' }}
        </q-badge>
      </q-td>
    </template>

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
                  <q-badge color="purple-9" style="font-size:13px; font-weight:700; padding:4px 10px; border-radius:12px">
                    ID: {{ mascotaSeleccionada.codigo || '—' }}
                  </q-badge>
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
      <q-card style="width:480px; max-width:95vw; background:#1a1d2e; border:1px solid rgba(255,255,255,0.1); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <q-icon name="pets" size="22px" style="color:#f7b731" class="q-mr-sm" />
            {{ selectedId ? 'Editar Mascota' : 'Nueva Mascota' }}
          </div>
          <q-btn flat round dense icon="close" @click="dialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />
        <q-card-section class="q-pa-lg q-gutter-sm">
          <!-- ID Autoincrementado: Solo el sistema lo genera y no se puede editar -->
          <div v-if="selectedId" class="q-mb-xs">
            <q-input
              :model-value="form.codigo"
              label="ID Mascota (Asignado por el sistema — No editable)"
              dark outlined dense class="vet-input"
              readonly
            >
              <template #prepend>
                <q-icon name="tag" color="purple-4" size="18px" />
              </template>
              <template #append>
                <q-icon name="lock" color="amber-4" size="16px">
                  <q-tooltip>El ID de la mascota es autoincrementado y no editable</q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div v-else class="q-pa-sm q-mb-xs" style="background:rgba(108,99,255,0.08); border:1px solid rgba(108,99,255,0.25); border-radius:10px; font-size:12px; color:rgba(255,255,255,0.7); display:flex; align-items:center; gap:8px">
            <q-icon name="auto_awesome" color="amber-4" size="18px" />
            <span>El sistema asignará automáticamente el ID autoincrementado (<strong>mt00, mt01...</strong>). <strong>¡No podrá ser editado!</strong></span>
          </div>

          <q-input v-model="form.nombre"       label="Nombre *"          dark outlined dense class="vet-input" />

          <!-- Select Especie -->
          <q-select
            v-model="form.especie"
            :options="opcionesEspecie"
            label="Especie *"
            dark outlined dense class="vet-input"
            popup-content-class="vet-select-popup"
            emit-value map-options
            @update:model-value="onEspecieChange"
          />
          <!-- Input personalizado si especie = Otros -->
          <q-input
            v-if="form.especie === '__otros__'"
            v-model="form.especieOtros"
            label="Especificar especie *"
            dark outlined dense class="vet-input"
            placeholder="Escribe la especie..."
          >
            <template #prepend>
              <q-icon name="edit" color="amber-4" size="18px" />
            </template>
          </q-input>

          <!-- Select Raza (dinámico según especie) -->
          <q-select
            v-model="form.raza"
            :options="opcionesRaza"
            label="Raza"
            dark outlined dense class="vet-input"
            popup-content-class="vet-select-popup"
            emit-value map-options
          />
          <!-- Input personalizado si raza = Otros -->
          <q-input
            v-if="form.raza === '__otros__'"
            v-model="form.razaOtros"
            label="Especificar raza *"
            dark outlined dense class="vet-input"
            placeholder="Escribe la raza..."
          >
            <template #prepend>
              <q-icon name="edit" color="amber-4" size="18px" />
            </template>
          </q-input>

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

    <!-- ── Diálogo de Pregunta al terminar el formulario de mascota ─────────────── -->
    <q-dialog v-model="preguntaVisitaDialog" persistent>
      <q-card style="width:480px; max-width:92vw; background:#161926; border:1px solid rgba(38,222,129,0.3); border-radius:20px; overflow:hidden">
        <q-card-section style="background:linear-gradient(135deg,rgba(38,222,129,0.15),rgba(32,191,107,0.05)); padding:24px 28px; text-align:center">
          <div style="width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg,#26de81,#20bf6b); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; box-shadow:0 8px 24px rgba(38,222,129,0.35)">
            <q-icon name="event_available" size="36px" color="white" />
          </div>
          <div style="font-size:20px; font-weight:800; color:#fff">
            ¿Deseas realizar una visita médica ahora?
          </div>
          <div style="font-size:13px; color:rgba(255,255,255,0.65); margin-top:8px; line-height:1.5">
            La mascota <strong>{{ mascotaRecienCreada?.nombre }}</strong> ha sido registrada con éxito con el ID <strong class="text-amber-4">{{ mascotaRecienCreada?.codigo }}</strong>. ¿Deseas abrir de inmediato una visita médica para este paciente?
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-lg q-pt-md" style="gap:12px">
          <q-btn
            flat
            label="No, solo registrar mascota"
            style="color:rgba(255,255,255,0.6); border-radius:10px"
            @click="preguntaVisitaDialog = false"
          />
          <q-btn
            unelevated
            label="Sí, registrar visita"
            icon="event_note"
            style="background:linear-gradient(135deg,#26de81,#20bf6b); color:#fff; border-radius:10px; font-weight:700; padding:10px 20px"
            @click="abrirVisitaRapida"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo Formulario Visita Rápida para Mascota ─────────────── -->
    <q-dialog v-model="visitaRapidaDialog" class="vet-dialog">
      <q-card style="min-width:500px; max-width:92vw; background:#1a1d2e; border:1px solid rgba(38,222,129,0.3); border-radius:16px;">
        <q-card-section style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px">
          <div style="display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff">
            <q-icon name="event_note" size="22px" style="color:#26de81" class="q-mr-sm" />
            Nueva Visita para: {{ mascotaRecienCreada?.nombre }} ({{ mascotaRecienCreada?.codigo }})
          </div>
          <q-btn flat round dense icon="close" @click="visitaRapidaDialog = false" style="color:rgba(255,255,255,0.5)" />
        </q-card-section>
        <q-separator color="rgba(255,255,255,0.08)" />

        <q-card-section class="q-pa-lg q-gutter-sm">
          <!-- Select Veterinario -->
          <q-select
            v-model="formVisita.idveterinario"
            :options="vetsFiltradosOpts"
            use-input
            input-debounce="0"
            @filter="filterVets"
            label="Veterinario que atiende *"
            dark outlined dense class="vet-input"
            popup-content-class="vet-select-popup"
            option-value="value" option-label="label"
            emit-value map-options
            @update:model-value="onVetVisitaChange"
          />

          <q-input v-model="formVisita.motivoconsulta" label="Motivo de consulta *" dark outlined dense class="vet-input" placeholder="Ej. Control inicial, chequeo general" />
          <q-input v-model="formVisita.diagnostico" label="Diagnóstico médico" dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input v-model="formVisita.observaciones" label="Observaciones adicionales" dark outlined dense class="vet-input" type="textarea" autogrow />
          <q-input v-model.number="formVisita.pesoregistrado" label="Peso registrado (kg)" dark outlined dense class="vet-input" type="number" step="0.1" />

          <div class="row q-col-gutter-sm q-mt-xs">
            <div class="col-6">
              <q-input v-model.number="formVisita.costo_consulta" label="Tarifa Consulta (COP)" dark outlined dense class="vet-input" type="number" prefix="$" />
            </div>
            <div class="col-6">
              <q-input v-model.number="formVisita.costo_total" label="Costo Total (COP)" dark outlined dense class="vet-input" type="number" prefix="$" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" @click="visitaRapidaDialog = false" style="color:rgba(255,255,255,0.5)" />
          <q-btn
            unelevated
            label="Guardar Visita"
            icon="save"
            :loading="visitasStore.saving"
            style="background:linear-gradient(135deg,#26de81,#20bf6b);color:white;border-radius:10px"
            @click="guardarVisitaRapida"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo Pregunta Tratamiento tras Visita en Mascota ─────────────── -->
    <q-dialog v-model="preguntaTratamientoDialog" persistent>
      <q-card style="width:480px; max-width:92vw; background:#161926; border:1px solid rgba(253,150,68,0.3); border-radius:20px; overflow:hidden">
        <q-card-section style="background:linear-gradient(135deg,rgba(253,150,68,0.15),rgba(231,76,60,0.05)); padding:24px 28px; text-align:center">
          <div style="width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg,#fd9644,#e74c3c); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; box-shadow:0 8px 24px rgba(253,150,68,0.35)">
            <q-icon name="medication" size="36px" color="white" />
          </div>
          <div style="font-size:20px; font-weight:800; color:#fff">
            ¿Deseas recetar un tratamiento médico?
          </div>
          <div style="font-size:13px; color:rgba(255,255,255,0.65); margin-top:8px; line-height:1.5">
            La visita médica se ha registrado exitosamente. ¿Deseas agregar un tratamiento para esta consulta?
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-lg q-pt-md" style="gap:12px">
          <q-btn
            flat
            label="No, finalizar"
            style="color:rgba(255,255,255,0.6); border-radius:10px"
            @click="preguntaTratamientoDialog = false"
          />
          <q-btn
            unelevated
            label="Sí, recetar tratamiento"
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
            Nuevo Tratamiento Médico
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

// ── Variables para flujo interactivo post-formulario ──
const preguntaVisitaDialog       = ref(false)
const visitaRapidaDialog         = ref(false)
const mascotaRecienCreada        = ref(null)

const preguntaTratamientoDialog  = ref(false)
const tratamientoRapidoDialog    = ref(false)
const visitaRecienCreada         = ref(null)

const formVisita = ref({
  idmascota: '',
  idveterinario: '',
  fechavisita: new Date().toISOString().slice(0, 10),
  motivoconsulta: '',
  diagnostico: '',
  observaciones: '',
  pesoregistrado: null,
  costo_consulta: 70000,
  costo_total: 70000,
  estado_pago: 'pendiente',
  monto_abono: 0
})

const formTratamiento = ref({
  idvisita: '',
  tipo: '',
  descripcion: '',
  dosis_indicaciones: '',
  costo: 45000,
  proxima_fecha: ''
})

const duenosFiltradosOpts = ref([])
const vetsFiltradosOpts   = ref([])

const form = ref({
  codigo: '', nombre:'', especie:'', raza:'', edad_aprox:'',
  peso_actual:'', 'iddueño': null, idveterinario: null,
  especieOtros: '', razaOtros: ''
})

// ─── Catálogo de Especies y Razas ─────────────────────
const catalogoEspecies = [
  'Perro', 'Gato', 'Conejo', 'Hámster', 'Cobaya / Curí', 'Hurón',
  'Aves', 'Tortuga de tierra', 'Iguana', 'Erizo de tierra',
  'Rata doméstica', 'Ratón doméstico', 'Chinchilla', 'Cerdo vietnamita / Minipig'
]

const catalogoRazas = {
  'Perro': ['Labrador Retriever', 'Pastor Alemán', 'Golden Retriever', 'Bulldog Francés', 'Poodle / Caniche', 'Beagle', 'Husky Siberiano', 'Chihuahua', 'Boxer', 'Border Collie'],
  'Gato': ['Persa', 'Maine Coon', 'Siamés', 'British Shorthair', 'Ragdoll', 'Bengalí', 'Esfinge (Sphynx)', 'Angora Turco', 'Azul Ruso', 'American Shorthair'],
  'Conejo': ['Cabeza de León', 'Belier / Lop', 'Angora', 'Mini Lop', 'Netherland Dwarf / Enano Holandés', 'Rex', 'Californiano', 'Nueva Zelanda'],
  'Hámster': ['Sirio / Dorado', 'Ruso / Campbell', 'Winter White / Blanco de Invierno', 'Roborovski', 'Chino'],
  'Cobaya / Curí': ['Abisinia', 'Americana / Inglesa', 'Peruana', 'Teddy', 'Sheltie / Silkie', 'Skinny'],
  'Hurón': ['Sable', 'Albino', 'Blanco de ojos oscuros (DEW)', 'Champán / Canela', 'Silver / Plateado', 'Blaze'],
  'Aves': ['Periquito', 'Canario'],
  'Tortuga de tierra': ['Tortuga rusa', 'Tortuga de espolones africana', 'Tortuga mediterránea', 'Tortuga mora', 'Tortuga gigante de Oregón'],
  'Iguana': ['Iguana verde', 'Iguana del Caribe', 'Iguana rinoceronte', 'Iguana de Chuckwalla'],
  'Erizo de tierra': ['Erizo pigmeo africano', 'Erizo moruno', 'Erizo orejuno', 'Erizo europeo'],
  'Rata doméstica': ['Standard', 'Rex', 'Dumbo', 'Hairless (Sin pelo)', 'Manx (Sin cola)'],
  'Ratón doméstico': ['Standard', 'Satin', 'Longhair (Pelo largo)', 'Hairless (Sin pelo)'],
  'Chinchilla': ['Standard (Gris estándar)', 'Black Velvet', 'Beige', 'Albina / Blanca', 'Violeta'],
  'Cerdo vietnamita / Minipig': ['Minipig Gottingen', 'Juliani', 'Kunekune', 'Yucatan Micro Pig']
}

const opcionesEspecie = computed(() => {
  const opts = catalogoEspecies.map(e => ({ label: e, value: e }))
  opts.push({ label: '── Otros ──', value: '__otros__' })
  return opts
})

const opcionesRaza = computed(() => {
  const especie = form.value.especie
  const razas = (especie && especie !== '__otros__') ? (catalogoRazas[especie] || []) : []
  const opts = razas.map(r => ({ label: r, value: r }))
  opts.push({ label: '── Otros ──', value: '__otros__' })
  return opts
})

function onEspecieChange() {
  form.value.raza = ''
  form.value.razaOtros = ''
  form.value.especieOtros = ''
}

function extractId(val) {
  if (!val) return null
  if (typeof val === 'object') return (val._id || val.iddueño || val.idveterinario || val.idmascota || '').toString()
  return val.toString()
}

const opcionesDuenos = computed(() => {
  return duenosStore.duenos.map(d => ({
    label: d.cedula ? `${d.nombre} (C.C. ${d.cedula})` : d.nombre,
    value: d.iddueño || d._id
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
        label: isInactivo ? `${v.nombre} (INACTIVO)` : `${v.nombre} (${ced}${v.especialidad || 'Medicina General'})`,
        value: v.idveterinario || v._id,
        costo: v.costo_consulta || 70000,
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
  { name:'codigo',      label:'ID Mascota',  field: r => r.codigo || '—',                         align:'center', sortable:true },
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

function resolveEspecieForForm(especie) {
  if (!especie) return { especie: '', especieOtros: '' }
  if (catalogoEspecies.includes(especie)) return { especie, especieOtros: '' }
  return { especie: '__otros__', especieOtros: especie }
}

function resolveRazaForForm(raza, especie) {
  if (!raza) return { raza: '', razaOtros: '' }
  const razasDeEspecie = catalogoRazas[especie] || []
  if (razasDeEspecie.includes(raza)) return { raza, razaOtros: '' }
  return { raza: '__otros__', razaOtros: raza }
}

function openDialog(row = null) {
  duenosFiltradosOpts.value = opcionesDuenos.value
  vetsFiltradosOpts.value   = opcionesVets.value

  if (row) {
    const especieRes = resolveEspecieForForm(row.especie)
    const razaRes = resolveRazaForForm(row.raza, row.especie)
    form.value = {
      codigo: row.codigo || '',
      nombre: row.nombre,
      especie: especieRes.especie,
      especieOtros: especieRes.especieOtros,
      raza: razaRes.raza,
      razaOtros: razaRes.razaOtros,
      edad_aprox: row.edad_aprox,
      peso_actual: row.peso_actual,
      'iddueño': extractId(row['iddueño']),
      idveterinario: extractId(row.idveterinario)
    }
    selectedId.value = row.idmascota || row._id
  } else {
    form.value = { codigo: '', nombre:'', especie:'', raza:'', edad_aprox:'', peso_actual:'', 'iddueño': null, idveterinario: null, especieOtros: '', razaOtros: '' }
    selectedId.value = null
  }
  dialog.value = true
}

async function guardar() {
  const especieFinal = form.value.especie === '__otros__' ? form.value.especieOtros : form.value.especie
  const razaFinal = form.value.raza === '__otros__' ? form.value.razaOtros : form.value.raza

  if (!form.value.nombre || !especieFinal || !form.value['iddueño']) {
    $q.notify({ type:'warning', message:'Nombre, especie y dueño son obligatorios' })
    return
  }

  const payload = {
    nombre: form.value.nombre,
    especie: especieFinal,
    raza: razaFinal,
    edad_aprox: form.value.edad_aprox,
    peso_actual: form.value.peso_actual,
    'iddueño': form.value['iddueño'],
    idveterinario: form.value.idveterinario
  }

  try {
    if (selectedId.value) {
      await mascotasStore.actualizar(selectedId.value, payload)
      $q.notify({ type:'positive', message:'Mascota actualizada' })
      dialog.value = false
    } else {
      const res = await mascotasStore.crear(payload)
      dialog.value = false
      mascotaRecienCreada.value = res?.mascota || res
      $q.notify({
        type:'positive',
        message: `Mascota creada con ID: ${mascotaRecienCreada.value?.codigo || 'mtXX'}`
      })
      // Opcion para elegir si se va a hacer visita: solo sale al terminar el formulario de agregar mascota
      preguntaVisitaDialog.value = true
    }
  } catch (e) {
    $q.notify({ type:'negative', message: mascotasStore.error || e.message })
  }
}

// ── Flujo Visita Rápida ──
function abrirVisitaRapida() {
  preguntaVisitaDialog.value = false
  const pet = mascotaRecienCreada.value
  const vetId = extractId(pet?.idveterinario) || (veterinariosStore.activos[0]?.idveterinario || veterinariosStore.activos[0]?._id || '')
  const vetObj = veterinariosStore.getById(vetId)
  const tarifa = vetObj?.costo_consulta || 70000

  formVisita.value = {
    idmascota: extractId(pet?._id || pet?.idmascota),
    idveterinario: vetId,
    fechavisita: new Date().toISOString().slice(0, 10),
    motivoconsulta: 'Control y chequeo inicial de ingreso',
    diagnostico: 'Paciente en buen estado general tras registro',
    observaciones: `Registro inicial de paciente ${pet?.nombre || ''}`,
    pesoregistrado: pet?.peso_actual || null,
    costo_consulta: tarifa,
    costo_total: tarifa,
    estado_pago: 'pendiente',
    monto_abono: 0
  }
  vetsFiltradosOpts.value = opcionesVets.value
  visitaRapidaDialog.value = true
}

function onVetVisitaChange(vetId) {
  const vetObj = veterinariosStore.getById(vetId)
  if (vetObj) {
    formVisita.value.costo_consulta = vetObj.costo_consulta || 70000
    formVisita.value.costo_total = vetObj.costo_consulta || 70000
  }
}

async function guardarVisitaRapida() {
  if (!formVisita.value.idveterinario || !formVisita.value.motivoconsulta) {
    $q.notify({ type: 'warning', message: 'Veterinario y motivo son obligatorios' })
    return
  }
  try {
    const res = await visitasStore.crear(formVisita.value)
    $q.notify({ type: 'positive', message: 'Visita médica registrada con éxito' })
    visitaRapidaDialog.value = false
    visitaRecienCreada.value = res?.visita || res
    // Preguntar si desea agregar tratamiento para esta visita
    preguntaTratamientoDialog.value = true
  } catch (e) {
    $q.notify({ type: 'negative', message: visitasStore.error || e.message })
  }
}

// ── Flujo Tratamiento Rápido ──
function abrirTratamientoRapido() {
  preguntaTratamientoDialog.value = false
  const v = visitaRecienCreada.value
  formTratamiento.value = {
    idvisita: extractId(v?._id || v?.idvisita),
    tipo: 'Desparasitación y Vitaminas',
    descripcion: `Tratamiento preventivo para ${mascotaRecienCreada.value?.nombre || 'paciente'}`,
    dosis_indicaciones: 'Administrar vía oral según prescripción',
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
    $q.notify({ type: 'positive', message: 'Tratamiento médico registrado con éxito' })
    tratamientoRapidoDialog.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: tratamientosStore.error || e.message })
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
