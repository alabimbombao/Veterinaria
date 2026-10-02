const { response, request } = require('express');
const Dueno = require('../models/Dueno');

// Obtener todos los dueños activos
const getDuenos = async (req = request, res = response) => {
    try {
        const { limite = 50, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, duenos] = await Promise.all([
            Dueno.countDocuments(query),
            Dueno.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            ok: true,
            total,
            duenos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Obtener un dueño por ID
const getDuenoById = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const dueno = await Dueno.findById(id);

        if (!dueno || !dueno.estado) {
            return res.status(404).json({
                ok: false,
                msg: 'Dueño no encontrado'
            });
        }

        res.json({
            ok: true,
            dueno
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Crear un nuevo dueño
const crearDueno = async (req = request, res = response) => {
    try {
        const { nombre, direccion, telefono, email } = req.body;

        // Verificar si el email ya está registrado
        const duenoExiste = await Dueno.findOne({ email });
        if (duenoExiste) {
            return res.status(400).json({
                ok: false,
                msg: `El correo ${email} ya está registrado`
            });
        }

        const dueno = new Dueno({ nombre, direccion, telefono, email });
        await dueno.save();

        res.status(201).json({
            ok: true,
            msg: 'Dueño registrado exitosamente',
            dueno
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Actualizar información de un dueño
const actualizarDueno = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { _id, estado, ...data } = req.body;

        // Si se actualiza el email, verificar que no pertenezca a otro dueño
        if (data.email) {
            const emailExiste = await Dueno.findOne({ email: data.email, _id: { $ne: id } });
            if (emailExiste) {
                return res.status(400).json({
                    ok: false,
                    msg: `El correo ${data.email} ya pertenece a otro usuario`
                });
            }
        }

        const dueno = await Dueno.findByIdAndUpdate(id, data, { new: true });

        if (!dueno || !dueno.estado) {
            return res.status(404).json({
                ok: false,
                msg: 'Dueño no encontrado'
            });
        }

        res.json({
            ok: true,
            msg: 'Dueño actualizado exitosamente',
            dueno
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Eliminar un dueño (borrado lógico)
const eliminarDueno = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const dueno = await Dueno.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!dueno) {
            return res.status(404).json({
                ok: false,
                msg: 'Dueño no encontrado'
            });
        }

        res.json({
            ok: true,
            msg: 'Dueño eliminado exitosamente',
            dueno
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
    getDuenos,
    getDuenoById,
    crearDueno,
    actualizarDueno,
    eliminarDueno
};
