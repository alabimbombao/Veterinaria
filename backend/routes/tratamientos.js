const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middelwares/ValidarCampos');
const {
    getTratamientos,
    getTratamientoById,
    crearTratamiento,
    actualizarTratamiento,
    eliminarTratamiento
} = require('../controllers/tratamientoController');

const router = Router();

// GET: Obtener todos los tratamientos
router.get('/', getTratamientos);

// GET: Obtener tratamiento por ID
router.get(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    getTratamientoById
);

// POST: Crear nuevo tratamiento
router.post(
    '/',
    [
        check('idvisita', 'No es un ID de Mongo válido para la visita').isMongoId(),
        check('tipo', 'El tipo de tratamiento es obligatorio').not().isEmpty(),
        validarCampos
    ],
    crearTratamiento
);

// PUT: Actualizar tratamiento
router.put(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    actualizarTratamiento
);

// DELETE: Eliminar tratamiento
router.delete(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    eliminarTratamiento
);

module.exports = router;
