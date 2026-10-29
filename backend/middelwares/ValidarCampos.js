const { validationResult } = require('express-validator');

/**
 * Middleware para validar los campos del request utilizando express-validator.
 */
const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorList = errors.array();
        return res.status(400).json({
            ok: false,
            msg: errorList[0]?.msg || 'Error de validación en los campos',
            errores: errors.mapped(),
            errors: errorList
        });
    }
    next();
};

module.exports = {
    validarCampos
};
