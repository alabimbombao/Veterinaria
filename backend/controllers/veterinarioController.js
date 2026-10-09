const { response, request } = require('express');
const Veterinario = require('../models/Veterinario');

// Obtener todos los veterinarios (activos o todos)
const getVeterinarios = async (req = request, res = response) => {
    try {
        const { limite = 10000, desde = 0, incluirInactivos, todos } = req.query;
        const query = (incluirInactivos === 'true' || todos === 'true' || incluirInactivos === true) ? {} : { estado: true };

        const [total, veterinarios] = await Promise.all([
            Veterinario.countDocuments(query),
            Veterinario.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            ok: true,
            total,
            veterinarios
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Obtener veterinario por ID
const getVeterinarioById = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const veterinario = await Veterinario.findById(id);

        if (!veterinario) {
            return res.status(404).json({
                ok: false,
                msg: 'Veterinario no encontrado'
            });
        }

        res.json({
            ok: true,
            veterinario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Crear nuevo veterinario
const crearVeterinario = async (req = request, res = response) => {
    try {
        const { nombre, especialidad, costo_consulta, estado } = req.body;

        const veterinario = new Veterinario({
            nombre,
            especialidad,
            costo_consulta,
            estado: estado !== undefined ? estado : true
        });
        await veterinario.save();

        res.status(201).json({
            ok: true,
            msg: 'Veterinario creado exitosamente',
            veterinario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Actualizar veterinario
const actualizarVeterinario = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { _id, idveterinario, ...data } = req.body;

        const veterinario = await Veterinario.findByIdAndUpdate(id, data, { new: true });

        if (!veterinario) {
            return res.status(404).json({
                ok: false,
                msg: 'Veterinario no encontrado'
            });
        }

        res.json({
            ok: true,
            msg: 'Veterinario actualizado exitosamente',
            veterinario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Eliminar veterinario (borrado lógico)
const eliminarVeterinario = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const veterinario = await Veterinario.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!veterinario) {
            return res.status(404).json({
                ok: false,
                msg: 'Veterinario no encontrado'
            });
        }

        res.json({
            ok: true,
            msg: 'Veterinario eliminado exitosamente',
            veterinario
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
    getVeterinarios,
    getVeterinarioById,
    crearVeterinario,
    actualizarVeterinario,
    eliminarVeterinario
};
