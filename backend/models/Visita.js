const { Schema, model } = require('mongoose');

const VisitaSchema = new Schema(
    {
        idmascota: {
            type: Schema.Types.ObjectId,
            ref: 'Mascota',
            required: [true, 'El ID de la mascota es obligatorio']
        },
        idveterinario: {
            type: Schema.Types.ObjectId,
            ref: 'Veterinario',
            required: [true, 'El ID del veterinario es obligatorio']
        },
        fechavisita: {
            type: Date,
            default: Date.now
        },
        motivoconsulta: {
            type: String,
            required: [true, 'El motivo de consulta es obligatorio'],
            trim: true
        },
        diagnostico: {
            type: String,
            trim: true
        },
        observaciones: {
            type: String,
            trim: true
        },
        pesoregistrado: {
            type: Number
        },
        costo_consulta: {
            type: Number,
            default: 70000
        },
        costo_total: {
            type: Number,
            default: 70000
        },
        estado_pago: {
            type: String,
            enum: ['pagado', 'abono', 'pendiente'],
            default: 'pendiente'
        },
        monto_abono: {
            type: Number,
            default: 0
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

VisitaSchema.methods.toJSON = function () {
    const { __v, _id, ...visita } = this.toObject();
    visita.idvisita = _id;
    return visita;
};

module.exports = model('Visita', VisitaSchema);
