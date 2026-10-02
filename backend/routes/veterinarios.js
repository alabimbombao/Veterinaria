const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middelwares/ValidarCampos');
const {
    getVeterinarios,
    getVeterinarioById,
    crearVeterinario,
    actualizarVeterinario,
    eliminarVeterinario
} = require('../controllers/veterinarioController');

const router = Router();

// GET: Obtener todos los veterinarios
router.get('/', getVeterinarios);

// GET: Obtener veterinario por ID
router.get(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    getVeterinarioById
);

// POST: Crear nuevo veterinario
router.post(
    '/',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        validarCampos
    ],
    crearVeterinario
);

// PUT: Actualizar veterinario
router.put(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    actualizarVeterinario
);

// DELETE: Eliminar veterinario
router.delete(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    eliminarVeterinario
);

module.exports = router;
