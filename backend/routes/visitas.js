const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middelwares/ValidarCampos');
const {
    getVisitas,
    getVisitaById,
    crearVisita,
    actualizarVisita,
    eliminarVisita
} = require('../controllers/visitaController');

const router = Router();

// GET: Obtener todas las visitas
router.get('/', getVisitas);

// GET: Obtener visita por ID
router.get(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    getVisitaById
);

// POST: Crear nueva visita
router.post(
    '/',
    [
        check('idmascota', 'No es un ID de Mongo válido para la mascota').isMongoId(),
        check('idveterinario', 'No es un ID de Mongo válido para el veterinario').isMongoId(),
        check('motivoconsulta', 'El motivo de consulta es obligatorio').not().isEmpty(),
        validarCampos
    ],
    crearVisita
);

// PUT: Actualizar visita
router.put(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    actualizarVisita
);

// DELETE: Eliminar visita
router.delete(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    eliminarVisita
);

module.exports = router;
