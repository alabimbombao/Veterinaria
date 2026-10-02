const { Schema, model } = require('mongoose');

const DuenoSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true
        },
        dirección: {
            type: String,
            trim: true,
            alias: 'direccion'
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

// Sobrescribir toJSON para devolver exactamente las variables requeridas
DuenoSchema.methods.toJSON = function () {
    const { __v, _id, id, direccion, ...dueno } = this.toObject();
    dueno.iddueño = _id;
    dueno.dirección = this.dirección || direccion;
    return dueno;
};

// Registrar modelo Dueño y Dueno para compatibilidad completa
let DuenoModel;
try {
    DuenoModel = model('Dueño', DuenoSchema);
} catch (e) {
    DuenoModel = model('Dueño');
}
try {
    model('Dueno', DuenoSchema);
} catch (e) {}

module.exports = DuenoModel;
