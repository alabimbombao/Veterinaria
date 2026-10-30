const { response, request } = require('express');
const Mascota = require('../models/Mascota');
const Dueno = require('../models/dueño');
const Veterinario = require('../models/Veterinario');

// Función auxiliar para autoincrementar el código con formato estándar MC-XXXX
const generarCodigoMascota = async () => {
    // Buscar todos los códigos con formato MC-NNNN (estándar actual)
    const mascotas = await Mascota.find({ codigo: { $regex: /^MC-\d+$/i } }, 'codigo');
    let maxNum = 0;
    for (const m of mascotas) {
        if (m.codigo) {
            const num = parseInt(m.codigo.replace(/^MC-/i, ''), 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    }
    const siguiente = maxNum + 1;
    return `MC-${String(siguiente).padStart(4, '0')}`;
};

// Obtener todas las mascotas activas
const getMascotas = async (req = request, res = response) => {
    try {
        const { limite = 10000, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, mascotas] = await Promise.all([
            Mascota.countDocuments(query),
            Mascota.find(query)
                .sort({ createdAt: -1, _id: -1 })
                .populate('iddueño', 'nombre email telefono cedula')
                .populate('idveterinario', 'nombre especialidad cedula')
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
            .populate('iddueño', 'nombre email telefono cedula')
            .populate('idveterinario', 'nombre especialidad cedula');

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

        // Generar código autoincrementado mt00, mt01... que solo el sistema puede asignar
        const codigoGenerado = await generarCodigoMascota();

        const mascota = new Mascota({
            codigo: codigoGenerado,
            iddueño,
            idveterinario,
            nombre,
            especie,
            raza,
            edad_aprox,
            peso_actual
        });

        await mascota.save();

        const mascotaPop = await Mascota.findById(mascota._id)
            .populate('iddueño', 'nombre email telefono cedula')
            .populate('idveterinario', 'nombre especialidad cedula');

        res.status(201).json({
            ok: true,
            msg: 'Mascota registrada exitosamente',
            mascota: mascotaPop
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
        // El campo codigo no podrá ser editado nunca: se excluye explícitamente
        const { _id, estado, codigo, ...data } = req.body;

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
            .populate('iddueño', 'nombre email telefono cedula')
            .populate('idveterinario', 'nombre especialidad cedula');

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
