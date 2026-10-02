const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middelwares/ValidarCampos');
const {
    getDuenos,
    getDuenoById,
    crearDueno,
    actualizarDueno,
    eliminarDueno
} = require('../controllers/dueñoController');

const router = Router();

// GET: Obtener todos los dueños
router.get('/', getDuenos);

// GET: Obtener dueño por ID
router.get(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    getDuenoById
);

// POST: Crear nuevo dueño
router.post(
    '/',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'El correo no es válido').isEmail(),
        validarCampos
    ],
    crearDueno
);

// PUT: Actualizar dueño
router.put(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    actualizarDueno
);

// DELETE: Eliminar dueño
router.delete(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    eliminarDueno
);

module.exports = router;
