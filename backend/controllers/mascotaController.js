const { response, request } = require('express');
const Mascota = require('../models/Mascota');
const Dueno = require('../models/Dueno');
const Veterinario = require('../models/Veterinario');

// Obtener todas las mascotas activas
const getMascotas = async (req = request, res = response) => {
    try {
        const { limite = 50, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, mascotas] = await Promise.all([
            Mascota.countDocuments(query),
            Mascota.find(query)
                .populate('iddueño', 'nombre email telefono')
                .populate('idveterinario', 'nombre especialidad')
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            ok: true,
            total,
            mascotas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Obtener mascota por ID
const getMascotaById = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const mascota = await Mascota.findById(id)
            .populate('iddueño', 'nombre email telefono')
            .populate('idveterinario', 'nombre especialidad');

        if (!mascota || !mascota.estado) {
            return res.status(404).json({
                ok: false,
                msg: 'Mascota no encontrada'
            });
        }

        res.json({
            ok: true,
            mascota
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Crear nueva mascota
const crearMascota = async (req = request, res = response) => {
    try {
        const { iddueño, idveterinario, nombre, especie, raza, edad_aprox, peso_actual } = req.body;

        // Verificar que el dueño exista
        const duenoExiste = await Dueno.findById(iddueño);
        if (!duenoExiste || !duenoExiste.estado) {
            return res.status(400).json({
                ok: false,
                msg: 'El dueño especificado no existe o está inactivo'
            });
        }

        // Si viene veterinario, verificar existencia
        if (idveterinario) {
            const vetExiste = await Veterinario.findById(idveterinario);
            if (!vetExiste || !vetExiste.estado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El veterinario especificado no existe o está inactivo'
                });
            }
        }

        const mascota = new Mascota({
            iddueño,
            idveterinario,
            nombre,
            especie,
            raza,
            edad_aprox,
            peso_actual
        });

        await mascota.save();

        res.status(201).json({
            ok: true,
            msg: 'Mascota registrada exitosamente',
            mascota
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Actualizar mascota
const actualizarMascota = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { _id, estado, ...data } = req.body;

        if (data.iddueño) {
            const duenoExiste = await Dueno.findById(data.iddueño);
            if (!duenoExiste || !duenoExiste.estado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El dueño especificado no existe'
                });
            }
        }

        if (data.idveterinario) {
            const vetExiste = await Veterinario.findById(data.idveterinario);
            if (!vetExiste || !vetExiste.estado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El veterinario especificado no existe'
                });
            }
        }

        const mascota = await Mascota.findByIdAndUpdate(id, data, { new: true })
            .populate('iddueño', 'nombre email telefono')
            .populate('idveterinario', 'nombre especialidad');

        if (!mascota || !mascota.estado) {
            return res.status(404).json({
                ok: false,
                msg: 'Mascota no encontrada'
            });
        }

        res.json({
            ok: true,
            msg: 'Mascota actualizada exitosamente',
            mascota
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Eliminar mascota (borrado lógico)
const eliminarMascota = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const mascota = await Mascota.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!mascota) {
            return res.status(404).json({
                ok: false,
                msg: 'Mascota no encontrada'
            });
        }

        res.json({
            ok: true,
            msg: 'Mascota eliminada exitosamente',
            mascota
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

module.exports = {
    getMascotas,
    getMascotaById,
    crearMascota,
    actualizarMascota,
    eliminarMascota
};
