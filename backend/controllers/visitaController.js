const { response, request } = require('express');
const Visita = require('../models/Visita');
const Mascota = require('../models/Mascota');
const Veterinario = require('../models/Veterinario');

// Obtener todas las visitas activas
const getVisitas = async (req = request, res = response) => {
    try {
        const { limite = 50, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, visitas] = await Promise.all([
            Visita.countDocuments(query),
            Visita.find(query)
                .populate('idmascota', 'nombre especie raza')
                .populate('idveterinario', 'nombre especialidad')
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            ok: true,
            total,
            visitas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Obtener visita por ID
const getVisitaById = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const visita = await Visita.findById(id)
            .populate('idmascota', 'nombre especie raza')
            .populate('idveterinario', 'nombre especialidad');

        if (!visita || !visita.estado) {
            return res.status(404).json({
                ok: false,
                msg: 'Visita no encontrada'
            });
        }

        res.json({
            ok: true,
            visita
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Crear nueva visita
const crearVisita = async (req = request, res = response) => {
    try {
        const { idmascota, idveterinario, fechavisita, motivoconsulta, diagnostico, observaciones, pesoregistrado } = req.body;

        // Verificar que la mascota exista
        const mascotaExiste = await Mascota.findById(idmascota);
        if (!mascotaExiste || !mascotaExiste.estado) {
            return res.status(400).json({
                ok: false,
                msg: 'La mascota especificada no existe o está inactiva'
            });
        }

        // Verificar que el veterinario exista
        const vetExiste = await Veterinario.findById(idveterinario);
        if (!vetExiste || !vetExiste.estado) {
            return res.status(400).json({
                ok: false,
                msg: 'El veterinario especificado no existe o está inactivo'
            });
        }

        const visita = new Visita({
            idmascota,
            idveterinario,
            fechavisita: fechavisita || Date.now(),
            motivoconsulta,
            diagnostico,
            observaciones,
            pesoregistrado
        });

        await visita.save();

        res.status(201).json({
            ok: true,
            msg: 'Visita registrada exitosamente',
            visita
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Actualizar visita
const actualizarVisita = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { _id, estado, ...data } = req.body;

        if (data.idmascota) {
            const mascotaExiste = await Mascota.findById(data.idmascota);
            if (!mascotaExiste || !mascotaExiste.estado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La mascota especificada no existe'
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

        const visita = await Visita.findByIdAndUpdate(id, data, { new: true })
            .populate('idmascota', 'nombre especie raza')
            .populate('idveterinario', 'nombre especialidad');

        if (!visita || !visita.estado) {
            return res.status(404).json({
                ok: false,
                msg: 'Visita no encontrada'
            });
        }

        res.json({
            ok: true,
            msg: 'Visita actualizada exitosamente',
            visita
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Eliminar visita (borrado lógico)
const eliminarVisita = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const visita = await Visita.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!visita) {
            return res.status(404).json({
                ok: false,
                msg: 'Visita no encontrada'
            });
        }

        res.json({
            ok: true,
            msg: 'Visita eliminada exitosamente',
            visita
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
    getVisitas,
    getVisitaById,
    crearVisita,
    actualizarVisita,
    eliminarVisita
};
