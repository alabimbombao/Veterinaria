require('dotenv').config();
const { dbConnection } = require('./backend/database/config');

const Dueno = require('./backend/models/dueño');
const Veterinario = require('./backend/models/Veterinario');
const Mascota = require('./backend/models/Mascota');
const Visita = require('./backend/models/Visita');
const Tratamiento = require('./backend/models/Tratamiento');

const datosVeterinarios = [
    { nombre: 'Dra. María Fernanda Gómez', especialidad: 'Cirugía General y Traumatología', costo_consulta: 95000 },
    { nombre: 'Dr. Carlos Alberto Mendoza', especialidad: 'Dermatología Veterinaria', costo_consulta: 85000 },
    { nombre: 'Dra. Laura Camila Pérez', especialidad: 'Cardiología y Neumología', costo_consulta: 90000 },
    { nombre: 'Dr. Alejandro Silva Ríos', especialidad: 'Neurología y Medicina Interna', costo_consulta: 100000 },
    { nombre: 'Dra. Sofía Martínez Ruiz', especialidad: 'Oftalmología Veterinaria', costo_consulta: 85000 },
    { nombre: 'Dr. Javier Eduardo Torres', especialidad: 'Odontología Veterinaria', costo_consulta: 80000 },
    { nombre: 'Dra. Valentina Castro Delgado', especialidad: 'Nutrición y Dietética', costo_consulta: 70000 },
    { nombre: 'Dr. Andrés Felipe Morales', especialidad: 'Medicina General y Preventiva', costo_consulta: 60000 },
    { nombre: 'Dra. Camila Andrea Rojas', especialidad: 'Oncología y Cuidados Paliativos', costo_consulta: 110000 },
    { nombre: 'Dr. Gabriel Esteban Vargas', especialidad: 'Animales Exóticos y de Compañía', costo_consulta: 85000 },
    { nombre: 'Dra. Daniela Paola Rincón', especialidad: 'Fisioterapia y Rehabilitación', costo_consulta: 75000 },
    { nombre: 'Dr. Ricardo José Navarrete', especialidad: 'Gastroenterología Veterinaria', costo_consulta: 90000 },
    { nombre: 'Dra. Juliana María Suaza', especialidad: 'Endocrinología y Metabólicas', costo_consulta: 95000 },
    { nombre: 'Dr. Mateo Alejandro Beltrán', especialidad: 'Etología y Conducta Animal', costo_consulta: 70000 },
    { nombre: 'Dra. Natalia Andrea Quintero', especialidad: 'Imagenología y Ecografía', costo_consulta: 85000 }
];

const datosDuenos = [
    { nombre: 'Juan Carlos Rodríguez', dirección: 'Calle 45 # 12-34, Bogotá', telefono: '3104567890', email: 'juan.rodriguez@email.com' },
    { nombre: 'Ana Isabel Gutiérrez', dirección: 'Carrera 15 # 88-20, Medellín', telefono: '3115678901', email: 'ana.gutierrez@email.com' },
    { nombre: 'Luis Fernando Martínez', dirección: 'Avenida 6N # 22-45, Cali', telefono: '3126789012', email: 'luis.martinez@email.com' },
    { nombre: 'Diana Marcela López', dirección: 'Calle 72 # 10-15, Barranquilla', telefono: '3137890123', email: 'diana.lopez@email.com' },
    { nombre: 'Roberto Carlos Gómez', dirección: 'Transversal 31 # 45-67, Bucaramanga', telefono: '3148901234', email: 'roberto.gomez@email.com' },
    { nombre: 'Claudia Patricia Hernández', dirección: 'Carrera 9 # 115-30, Pereira', telefono: '3159012345', email: 'claudia.hernandez@email.com' },
    { nombre: 'Jorge Enrique Ramírez', dirección: 'Calle 100 # 19-45, Manizales', telefono: '3160123456', email: 'jorge.ramirez@email.com' },
    { nombre: 'Esperanza Morales Cruz', dirección: 'Diagonal 40 # 25-10, Cartagena', telefono: '3171234567', email: 'esperanza.morales@email.com' },
    { nombre: 'Felipe Andrés Castro', dirección: 'Calle 13 # 68D-21, Santa Marta', telefono: '3182345678', email: 'felipe.castro@email.com' },
    { nombre: 'Sandra Milena Ospina', dirección: 'Carrera 43A # 1-50, Ibagué', telefono: '3193456789', email: 'sandra.ospina@email.com' },
    { nombre: 'Oscar Mauricio Vargas', dirección: 'Calle 50 # 33-12, Villavicencio', telefono: '3004567891', email: 'oscar.vargas@email.com' },
    { nombre: 'Paula Andrea Benítez', dirección: 'Avenida El Dorado # 68B-85, Pasto', telefono: '3015678902', email: 'paula.benitez@email.com' },
    { nombre: 'Santiago Moreno Rios', dirección: 'Carrera 7 # 127-10, Cucuta', telefono: '3026789013', email: 'santiago.moreno@email.com' },
    { nombre: 'Carolina Salazar Duque', dirección: 'Calle 26 # 59-51, Armenia', telefono: '3037890124', email: 'carolina.salazar@email.com' },
    { nombre: 'Hector Fabio Valencia', dirección: 'Transversal 93 # 51-24, Neiva', telefono: '3048901235', email: 'hector.valencia@email.com' },
    { nombre: 'Mónica Alexandra Parra', dirección: 'Calle 134 # 19-20, Bogotá', telefono: '3109876543', email: 'monica.parra@email.com' },
    { nombre: 'Diego Fernando Pinzón', dirección: 'Carrera 80 # 32-14, Medellín', telefono: '3118765432', email: 'diego.pinzon@email.com' },
    { nombre: 'Adriana Lucía Villamizar', dirección: 'Calle 9 # 4-12, Cali', telefono: '3127654321', email: 'adriana.villamizar@email.com' },
    { nombre: 'Gustavo Adolfo Buitrago', dirección: 'Carrera 54 # 75-80, Barranquilla', telefono: '3136543210', email: 'gustavo.buitrago@email.com' },
    { nombre: 'Gloria Inés Cardona', dirección: 'Calle 36 # 28-05, Bucaramanga', telefono: '3145432109', email: 'gloria.cardona@email.com' },
    { nombre: 'Camilo Ernesto Lozano', dirección: 'Transversal 15 # 10-40, Tunja', telefono: '3154321098', email: 'camilo.lozano@email.com' },
    { nombre: 'Patricia Elena Santamaría', dirección: 'Carrera 27 # 45-12, Manizales', telefono: '3163210987', email: 'patricia.santamaria@email.com' },
    { nombre: 'Jaime Alberto Montañéz', dirección: 'Calle 15 # 8-33, Montería', telefono: '3172109876', email: 'jaime.montanez@email.com' },
    { nombre: 'Verónica María Agudelo', dirección: 'Diagonal 25 # 50-10, Envigado', telefono: '3181098765', email: 'veronica.agudelo@email.com' },
    { nombre: 'Esteban José Caicedo', dirección: 'Avenida 4N # 10-15, Popayán', telefono: '3190987654', email: 'esteban.caicedo@email.com' },
    { nombre: 'Liliana Patricia Forero', dirección: 'Calle 170 # 15-40, Bogotá', telefono: '3001239876', email: 'liliana.forero@email.com' },
    { nombre: 'Mauricio Andrés Granados', dirección: 'Carrera 65 # 48-12, Medellín', telefono: '3012348765', email: 'mauricio.granados@email.com' },
    { nombre: 'Beatriz Eugenia Holguín', dirección: 'Calle 5 # 38-20, Cali', telefono: '3023457654', email: 'beatriz.holguin@email.com' },
    { nombre: 'Raúl Emilio Samper', dirección: 'Carrera 46 # 84-15, Barranquilla', telefono: '3034566543', email: 'raul.samper@email.com' },
    { nombre: 'Tatiana Marcela Zuleta', dirección: 'Calle 48 # 32-08, Bucaramanga', telefono: '3045675432', email: 'tatiana.zuleta@email.com' }
];

const plantillasMascotas = [
    { nombre: 'Toby', especie: 'Perro', raza: 'Golden Retriever', edad_aprox: 4, peso_actual: 31.5 },
    { nombre: 'Luna', especie: 'Gato', raza: 'Siamés', edad_aprox: 2, peso_actual: 4.2 },
    { nombre: 'Max', especie: 'Perro', raza: 'Pastor Alemán', edad_aprox: 6, peso_actual: 35.0 },
    { nombre: 'Bella', especie: 'Perro', raza: 'French Poodle', edad_aprox: 3, peso_actual: 8.4 },
    { nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog Inglés', edad_aprox: 5, peso_actual: 24.1 },
    { nombre: 'Mia', especie: 'Gato', raza: 'Persa', edad_aprox: 1, peso_actual: 3.8 },
    { nombre: 'Thor', especie: 'Perro', raza: 'Rottweiler', edad_aprox: 3, peso_actual: 42.0 },
    { nombre: 'Nala', especie: 'Gato', raza: 'Maine Coon', edad_aprox: 4, peso_actual: 7.1 },
    { nombre: 'Coco', especie: 'Perro', raza: 'Beagle', edad_aprox: 2, peso_actual: 12.3 },
    { nombre: 'Simba', especie: 'Gato', raza: 'Mestizo', edad_aprox: 3, peso_actual: 5.0 },
    { nombre: 'Bruno', especie: 'Perro', raza: 'Labrador Retriever', edad_aprox: 5, peso_actual: 33.2 },
    { nombre: 'Kira', especie: 'Perro', raza: 'Siberian Husky', edad_aprox: 2, peso_actual: 21.0 },
    { nombre: 'Zeus', especie: 'Perro', raza: 'Doberman', edad_aprox: 4, peso_actual: 38.5 },
    { nombre: 'Pelusa', especie: 'Gato', raza: 'Angora', edad_aprox: 5, peso_actual: 4.6 },
    { nombre: 'Luigi', especie: 'Conejo', raza: 'Belier Holandés', edad_aprox: 1, peso_actual: 1.8 },
    { nombre: 'Oreo', especie: 'Gato', raza: 'Mestizo', edad_aprox: 2, peso_actual: 4.0 },
    { nombre: 'Jack', especie: 'Perro', raza: 'Jack Russell Terrier', edad_aprox: 3, peso_actual: 7.5 },
    { nombre: 'Sasha', especie: 'Perro', raza: 'Boxer', edad_aprox: 4, peso_actual: 27.8 },
    { nombre: 'Cleo', especie: 'Gato', raza: 'Bengalí', edad_aprox: 2, peso_actual: 4.9 },
    { nombre: 'Paco', especie: 'Ave', raza: 'Loro Amazónico', edad_aprox: 8, peso_actual: 0.45 },
    { nombre: 'Chester', especie: 'Perro', raza: 'Shih Tzu', edad_aprox: 5, peso_actual: 6.2 },
    { nombre: 'Maya', especie: 'Perro', raza: 'Border Collie', edad_aprox: 3, peso_actual: 18.4 },
    { nombre: 'Garfield', especie: 'Gato', raza: 'Exótico de Pelo Corto', edad_aprox: 6, peso_actual: 6.5 },
    { nombre: 'Milo', especie: 'Perro', raza: 'Dachshund (Teckel)', edad_aprox: 2, peso_actual: 9.1 },
    { nombre: 'Kiko', especie: 'Hámster', raza: 'Sirio', edad_aprox: 1, peso_actual: 0.12 },
    { nombre: 'Boby', especie: 'Perro', raza: 'Cocker Spaniel', edad_aprox: 4, peso_actual: 14.2 },
    { nombre: 'Michi', especie: 'Gato', raza: 'Sphynx (Sin pelo)', edad_aprox: 2, peso_actual: 3.5 },
    { nombre: 'Titan', especie: 'Perro', raza: 'Gran Danés', edad_aprox: 3, peso_actual: 54.0 },
    { nombre: 'Lola', especie: 'Perro', raza: 'Chihuahua', edad_aprox: 2, peso_actual: 2.3 },
    { nombre: 'Tom', especie: 'Gato', raza: 'Azul Ruso', edad_aprox: 3, peso_actual: 4.8 },
    { nombre: 'Mora', especie: 'Perro', raza: 'Schnauzer Miniatura', edad_aprox: 5, peso_actual: 7.8 },
    { nombre: 'Copito', especie: 'Conejo', raza: 'Cabeza de León', edad_aprox: 2, peso_actual: 1.5 },
    { nombre: 'Bambi', especie: 'Perro', raza: 'Pomerania', edad_aprox: 1, peso_actual: 2.1 },
    { nombre: 'Oliver', especie: 'Gato', raza: 'British Shorthair', edad_aprox: 4, peso_actual: 5.4 },
    { nombre: 'Pancho', especie: 'Perro', raza: 'Pug', edad_aprox: 3, peso_actual: 8.9 },
    { nombre: 'Katy', especie: 'Gato', raza: 'Ragdoll', edad_aprox: 2, peso_actual: 4.5 },
    { nombre: 'Sammy', especie: 'Perro', raza: 'Samoyedo', edad_aprox: 3, peso_actual: 23.0 },
    { nombre: 'Loki', especie: 'Perro', raza: 'Akita Inu', edad_aprox: 4, peso_actual: 32.1 },
    { nombre: 'Tigre', especie: 'Gato', raza: 'Abisinio', edad_aprox: 2, peso_actual: 4.1 },
    { nombre: 'Pichi', especie: 'Ave', raza: 'Calopsita (Ninfa)', edad_aprox: 3, peso_actual: 0.09 },
    { nombre: 'Rocco', especie: 'Perro', raza: 'Bull Terrier', edad_aprox: 4, peso_actual: 26.5 },
    { nombre: 'Daphne', especie: 'Perro', raza: 'Dalmata', edad_aprox: 3, peso_actual: 22.4 },
    { nombre: 'Masha', especie: 'Gato', raza: 'Bosque de Noruega', edad_aprox: 5, peso_actual: 6.8 },
    { nombre: 'Chip', especie: 'Hámster', raza: 'Ruso', edad_aprox: 1, peso_actual: 0.05 },
    { nombre: 'Tyson', especie: 'Perro', raza: 'American Pitbull Terrier', edad_aprox: 4, peso_actual: 29.0 },
    { nombre: 'Fifi', especie: 'Perro', raza: 'Bichon Frisé', edad_aprox: 2, peso_actual: 5.1 },
    { nombre: 'Kiwi', especie: 'Ave', raza: 'Perico Australiano', edad_aprox: 2, peso_actual: 0.04 },
    { nombre: 'Samba', especie: 'Perro', raza: 'Weimaraner', edad_aprox: 3, peso_actual: 30.2 },
    { nombre: 'Manchas', especie: 'Gato', raza: 'Mestizo Calicó', edad_aprox: 2, peso_actual: 4.3 },
    { nombre: 'Toby Jr.', especie: 'Perro', raza: 'Basset Hound', edad_aprox: 4, peso_actual: 25.4 }
];

const motivosYDiagnosticos = [
    { motivo: 'Vacunación anual y chequeo general', diagnostico: 'Paciente en excelente estado de salud general. Vacunación pentavalente aplicada.', obs: 'Refuerzo programado en 1 año.' },
    { motivo: 'Desparasitación periódica y control de peso', diagnostico: 'Parásitos gastrointestinales leves observados en coprológico.', obs: 'Tratamiento desparasitante oral administrado.' },
    { motivo: 'Inapetencia y letargo desde hace 2 días', diagnostico: 'Gastritis aguda secundaria a ingesta de cuerpo extraño inerte.', obs: 'Se recomienda dieta blanda e hidratación suplementaria.' },
    { motivo: 'Cojera en pata posterior derecha', diagnostico: 'Esguince articular de grado I en articulación femorotibiorrotuliana.', obs: 'Reposo absoluto por 7 días y antiinflamatorios.' },
    { motivo: 'Prurito intenso y pérdida de pelo en dorso', diagnostico: 'Dermatitis alérgica por picadura de pulga (DAPP).', obs: 'Baño medicado y antipulgas sistémico recetado.' },
    { motivo: 'Limpieza dental y valoración halitosis', diagnostico: 'Enfermedad periodontal estadio 2 con sarro acumulado.', obs: 'Profilaxis ultrasonica realizada bajo sedación ligera.' },
    { motivo: 'Secreción ocular bilateral y estornudos', diagnostico: 'Conjuntivitis bacteriana primaria.', obs: 'Gotas oftálmicas administradas cada 8 horas.' },
    { motivo: 'Chequeo cardíaco preventivo', diagnostico: 'Soplo cardíaco leve grado II/VI en válvula mitral.', obs: 'Se sugiere ecocardiograma de seguimiento.' },
    { motivo: 'Control posquirúrgico de esterilización', diagnostico: 'Herida quirúrgica limpia, bien afrontada y sin signos de infección.', obs: 'Retiro de puntos programado para la próxima semana.' },
    { motivo: 'Molestia al masticar e inflamación gingival', diagnostico: 'Gingivostomatitis felina moderada.', obs: 'Analgésicos y pasta oral antiséptica.' },
    { motivo: 'Valoración dermatológica por alopecias circulares', diagnostico: 'Dermatofitosis (tiña fúngica) superficial.', obs: 'Tratamiento antimicótico tópico e higiene de entorno.' },
    { motivo: 'Otitis externa con secreción oscura y mal olor', diagnostico: 'Otitis externa alérgica complicada con levaduras Malassezia.', obs: 'Limpieza ótica profunda y gotas antibióticas/antimicóticas.' },
    { motivo: 'Control de glucemia e insulina', diagnostico: 'Diabetes mellitus canina normoglicémica controlada.', obs: 'Mantener dosis habitual de insulina NPH.' },
    { motivo: 'Diarrea recurrente y flatulencias', diagnostico: 'Intolerancia alimentaria / Síndrome de intestino irritable.', obs: 'Cambio estricto a proteína hidrolizada.' },
    { motivo: 'Evaluación pos-trauma por caída ligera', diagnostico: 'Contusión muscular leve sin evidencia de fracturas óseas.', obs: 'Analgésicos orales durante 4 días.' }
];

const tiposTratamiento = [
    { tipo: 'Vacunación Pentavalente', desc: 'Aplicación de vacuna Triple Felina / Pentavalente Canina', dosis: '1 dosis subcutánea en zona interescapular', costo: 65000 },
    { tipo: 'Desparasitación Interna', desc: 'Antiparasitario de amplio espectro (Fenbendazol / Milbemicina)', dosis: '1 tableta vía oral según peso exacto', costo: 35000 },
    { tipo: 'Tratamiento Antiinflamatorio', desc: 'Meloxicam suspensión oral 1.5mg/ml', dosis: '0.1mg/kg vía oral cada 24 horas por 5 días', costo: 45000 },
    { tipo: 'Terapia Antibiótica', desc: 'Amoxicilina + Ácido Clavulánico 250mg', dosis: '1 tableta cada 12 horas por 7 días con alimento', costo: 55000 },
    { tipo: 'Tratamiento Antipulgas y Garrapatas', desc: 'Pipeta antiparasitaria externa e interna', dosis: 'Aplicación tópica dorsal única', costo: 60000 },
    { tipo: 'Tratamiento Oftálmico', desc: 'Tobramicina 0.3% solución oftálmica', dosis: '1 gota en cada ojo afectado cada 8 horas por 7 días', costo: 40000 },
    { tipo: 'Profilaxis Dental Ultrasónica', desc: 'Limpieza con ultrasonido y pulido con pasta fluorada', dosis: 'Sesión única con control antiséptico posterior', costo: 160000 },
    { tipo: 'Plan de Nutrición Médica', desc: 'Alimento medicado Gastrointestinal / Renal / Allergy Control', dosis: 'Ración diaria de 180g dividida en 3 tomas', costo: 120000 },
    { tipo: 'Manejo del Dolor (Analgésico)', desc: 'Tramadol gotas 100mg/ml', dosis: '2 gotas por cada 5kg cada 12 horas si hay dolor', costo: 35000 },
    { tipo: 'Curación Antiséptica de Herida', desc: 'Limpieza antiséptica con Clorhexidina y gel cicatrizante', dosis: 'Curación 2 veces al día previa a colocación de collar isabelino', costo: 85000 },
    { tipo: 'Tratamiento Ótico Antimicótico', desc: 'Posaconazol + Otomax gotas óticas', dosis: '4 gotas en oído afectado cada 12 horas por 10 días', costo: 50000 },
    { tipo: 'Tratamiento Antimicótico Dermatológico', desc: 'Itraconazol suspensión oral 10mg/ml', dosis: '5mg/kg vía oral 1 vez al día con alimento graso', costo: 75000 }
];

async function seedDB() {
    try {
        console.log('🌱 Conectando a la base de datos para poblar un gran volumen de datos...');
        await dbConnection();

        console.log('🧹 Limpiando colecciones anteriores...');
        await Promise.all([
            Tratamiento.deleteMany({}),
            Visita.deleteMany({}),
            Mascota.deleteMany({}),
            Dueno.deleteMany({}),
            Veterinario.deleteMany({})
        ]);
        console.log('✨ Colecciones limpiadas exitosamente.');

        // 1. Insertar Veterinarios
        console.log('👨‍⚕️ Insertando veterinarios...');
        const veterinariosInsertados = await Veterinario.insertMany(datosVeterinarios);
        console.log(`✅ ${veterinariosInsertados.length} veterinarios insertados.`);

        // 2. Insertar Dueños
        console.log('👤 Insertando dueños...');
        const duenosInsertados = await Dueno.insertMany(datosDuenos);
        console.log(`✅ ${duenosInsertados.length} dueños insertados.`);

        // 3. Insertar Mascotas asignando dueños y veterinarios
        console.log('🐾 Insertando mascotas...');
        const mascotasAInsertar = plantillasMascotas.map((m, idx) => {
            const duenoAsignado = duenosInsertados[idx % duenosInsertados.length];
            const vetAsignado = veterinariosInsertados[idx % veterinariosInsertados.length];
            return {
                ...m,
                iddueño: duenoAsignado._id,
                idveterinario: vetAsignado._id
            };
        });

        const mascotasInsertadas = await Mascota.insertMany(mascotasAInsertar);
        console.log(`✅ ${mascotasInsertadas.length} mascotas insertadas.`);

        // 4. Insertar Visitas y Tratamientos vinculados con cálculo de precios reales en COP
        console.log('🩺 Insertando historial de visitas médicas y tratamientos...');
        let totalVisitas = 0;
        let totalTratamientos = 0;
        const hoy = new Date();

        for (let index = 0; index < mascotasInsertadas.length; index++) {
            const mascota = mascotasInsertadas[index];
            const numVisitas = 2 + (index % 3); // 2, 3 o 4 visitas por mascota

            for (let v = 0; v < numVisitas; v++) {
                const vet = veterinariosInsertados[(index + v) % veterinariosInsertados.length];
                const comboMD = motivosYDiagnosticos[(index + v * 3) % motivosYDiagnosticos.length];
                
                const diasAtras = (numVisitas - v) * 35 + (index % 5);
                const fechaVisita = new Date(hoy.getTime() - diasAtras * 24 * 60 * 60 * 1000);
                const pesoReg = Number((mascota.peso_actual + (v * 0.2 - 0.3)).toFixed(1));

                const tarifaConsulta = vet.costo_consulta || 70000;

                const nuevaVisita = new Visita({
                    idmascota: mascota._id,
                    idveterinario: vet._id,
                    fechavisita: fechaVisita,
                    motivoconsulta: comboMD.motivo,
                    diagnostico: comboMD.diagnostico,
                    observaciones: comboMD.obs,
                    pesoregistrado: pesoReg > 0 ? pesoReg : mascota.peso_actual,
                    costo_consulta: tarifaConsulta,
                    costo_total: tarifaConsulta
                });

                await nuevaVisita.save();
                totalVisitas++;

                // Generar 1 o 2 tratamientos asociados a esta visita
                const numTratamientos = 1 + ((index + v) % 2);
                let costoTratamientosVisita = 0;

                for (let t = 0; t < numTratamientos; t++) {
                    const infoTrat = tiposTratamiento[(index + v * 2 + t) % tiposTratamiento.length];
                    const diasProxima = 15 + ((index + v + t) % 30);
                    const proximaFecha = new Date(fechaVisita.getTime() + diasProxima * 24 * 60 * 60 * 1000);

                    const nuevoTratamiento = new Tratamiento({
                        idvisita: nuevaVisita._id,
                        tipo: infoTrat.tipo,
                        descripcion: infoTrat.desc,
                        dosis_indicaciones: infoTrat.dosis,
                        costo: infoTrat.costo,
                        proxima_fecha: proximaFecha
                    });

                    await nuevoTratamiento.save();
                    costoTratamientosVisita += infoTrat.costo;
                    totalTratamientos++;
                }

                nuevaVisita.costo_total = tarifaConsulta + costoTratamientosVisita;
                await nuevaVisita.save();
            }
        }

        console.log(`✅ ${totalVisitas} visitas médicas insertadas.`);
        console.log(`✅ ${totalTratamientos} tratamientos insertados.`);

        console.log('\n===============================================================');
        console.log('🎉 BASE DE DATOS POBLADA EXITOSAMENTE CON UN GRAN VOLUMEN DE DATOS (COP):');
        console.log(` - Veterinarios: ${veterinariosInsertados.length}`);
        console.log(` - Dueños:       ${duenosInsertados.length}`);
        console.log(` - Mascotas:     ${mascotasInsertadas.length}`);
        console.log(` - Visitas:      ${totalVisitas}`);
        console.log(` - Tratamientos: ${totalTratamientos}`);
        console.log('===============================================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al poblar la base de datos:', error);
        process.exit(1);
    }
}

seedDB();
