const { Schema, model } = require('mongoose');

const VeterinarioSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true
        },
        especialidad: {
            type: String,
            trim: true
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

VeterinarioSchema.methods.toJSON = function () {
    const { __v, _id, ...veterinario } = this.toObject();
    veterinario.idveterinario = _id;
    return veterinario;
};

module.exports = model('Veterinario', VeterinarioSchema);
