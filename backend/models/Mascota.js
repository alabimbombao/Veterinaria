const { Schema, model } = require('mongoose');

const MascotaSchema = new Schema(
    {
        iddueño: {
            type: Schema.Types.ObjectId,
            ref: 'Dueno',
            required: [true, 'El ID del dueño es obligatorio']
        },
        idveterinario: {
            type: Schema.Types.ObjectId,
            ref: 'Veterinario'
        },
        nombre: {
            type: String,
            required: [true, 'El nombre de la mascota es obligatorio'],
            trim: true
        },
        especie: {
            type: String,
            required: [true, 'La especie es obligatoria'],
            trim: true
        },
        raza: {
            type: String,
            trim: true
        },
        edad_aprox: {
            type: String,
            trim: true
        },
        peso_actual: {
            type: Number
        },
        estado: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

MascotaSchema.methods.toJSON = function () {
    const { __v, _id, ...mascota } = this.toObject();
    mascota.idmascota = _id;
    return mascota;
};

module.exports = model('Mascota', MascotaSchema);
