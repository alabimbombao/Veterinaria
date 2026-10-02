const { response, request } = require('express');
const Tratamiento = require('../models/Tratamiento');
const Visita = require('../models/Visita');

// Obtener todos los tratamientos activos
const getTratamientos = async (req = request, res = response) => {
    try {
        const { limite = 50, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, tratamientos] = await Promise.all([
            Tratamiento.countDocuments(query),
            Tratamiento.find(query)
                .populate({
                    path: 'idvisita',
                    select: 'fechavisita motivoconsulta diagnostico',
                    populate: [
                        { path: 'idmascota', select: 'nombre especie' },
                        { path: 'idveterinario', select: 'nombre especialidad' }
                    ]
                })
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            ok: true,
            total,
            tratamientos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Obtener tratamiento por ID
const getTratamientoById = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const tratamiento = await Tratamiento.findById(id)
            .populate({
                path: 'idvisita',
                select: 'fechavisita motivoconsulta diagnostico',
                populate: [
                    { path: 'idmascota', select: 'nombre especie' },
                    { path: 'idveterinario', select: 'nombre especialidad' }
                ]
            });

        if (!tratamiento || !tratamiento.estado) {
            return res.status(404).json({
                ok: false,
                msg: 'Tratamiento no encontrado'
            });
        }

        res.json({
            ok: true,
            tratamiento
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Crear nuevo tratamiento
const crearTratamiento = async (req = request, res = response) => {
    try {
        const { idvisita, tipo, descripcion, dosis_indicaciones, proxima_fecha } = req.body;

        // Verificar que la visita exista
        const visitaExiste = await Visita.findById(idvisita);
        if (!visitaExiste || !visitaExiste.estado) {
            return res.status(400).json({
                ok: false,
                msg: 'La visita especificada no existe o está inactiva'
            });
        }

        const tratamiento = new Tratamiento({
            idvisita,
            tipo,
            descripcion,
            dosis_indicaciones,
            proxima_fecha
        });

        await tratamiento.save();

        res.status(201).json({
            ok: true,
            msg: 'Tratamiento registrado exitosamente',
            tratamiento
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Actualizar tratamiento
const actualizarTratamiento = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { _id, estado, ...data } = req.body;

        if (data.idvisita) {
            const visitaExiste = await Visita.findById(data.idvisita);
            if (!visitaExiste || !visitaExiste.estado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La visita especificada no existe'
                });
            }
        }

        const tratamiento = await Tratamiento.findByIdAndUpdate(id, data, { new: true })
            .populate('idvisita');

        if (!tratamiento || !tratamiento.estado) {
            return res.status(404).json({
                ok: false,
                msg: 'Tratamiento no encontrado'
            });
        }

        res.json({
            ok: true,
            msg: 'Tratamiento actualizado exitosamente',
            tratamiento
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Eliminar tratamiento (borrado lógico)
const eliminarTratamiento = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const tratamiento = await Tratamiento.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!tratamiento) {
            return res.status(404).json({
                ok: false,
                msg: 'Tratamiento no encontrado'
            });
        }

        res.json({
            ok: true,
            msg: 'Tratamiento eliminado exitosamente',
            tratamiento
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
    getTratamientos,
    getTratamientoById,
    crearTratamiento,
    actualizarTratamiento,
    eliminarTratamiento
};
