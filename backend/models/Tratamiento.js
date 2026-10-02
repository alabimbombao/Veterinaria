const { Schema, model } = require('mongoose');

const TratamientoSchema = new Schema(
    {
        idvisita: {
            type: Schema.Types.ObjectId,
            ref: 'Visita',
            required: [true, 'El ID de la visita es obligatorio']
        },
        tipo: {
            type: String,
            required: [true, 'El tipo de tratamiento es obligatorio'],
            trim: true
        },
        descripcion: {
            type: String,
            trim: true
        },
        dosis_indicaciones: {
            type: String,
            trim: true
        },
        proxima_fecha: {
            type: Date
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

TratamientoSchema.methods.toJSON = function () {
    const { __v, _id, ...tratamiento } = this.toObject();
    tratamiento.idtratamiento = _id;
    return tratamiento;
};

module.exports = model('Tratamiento', TratamientoSchema);
