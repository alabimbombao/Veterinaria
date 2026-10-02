const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middelwares/ValidarCampos');
const {
    getMascotas,
    getMascotaById,
    crearMascota,
    actualizarMascota,
    eliminarMascota
} = require('../controllers/mascotaController');

const router = Router();

// GET: Obtener todas las mascotas
router.get('/', getMascotas);

// GET: Obtener mascota por ID
router.get(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    getMascotaById
);

// POST: Crear nueva mascota
router.post(
    '/',
    [
        check('nombre', 'El nombre de la mascota es obligatorio').not().isEmpty(),
        check('especie', 'La especie es obligatoria').not().isEmpty(),
        check('iddueño', 'No es un ID de Mongo válido para el dueño').isMongoId(),
        validarCampos
    ],
    crearMascota
);

// PUT: Actualizar mascota
router.put(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    actualizarMascota
);

// DELETE: Eliminar mascota
router.delete(
    '/:id',
    [
        check('id', 'No es un ID de Mongo válido').isMongoId(),
        validarCampos
    ],
    eliminarMascota
);

module.exports = router;
