const { Schema, model } = require('mongoose');

const DuenoSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true
        },
        direccion: {
            type: String,
            trim: true
        },
        telefono: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            required: [true, 'El email es obligatorio'],
            unique: true,
            lowercase: true,
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

DuenoSchema.methods.toJSON = function () {
    const { __v, _id, ...dueno } = this.toObject();
    dueno.iddueño = _id;
    return dueno;
};

module.exports = model('Dueno', DuenoSchema);
