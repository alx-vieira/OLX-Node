const { checkSchema } = require('express-validator');

module.exports = {

    signUp: checkSchema({
        name: {
            trim: true,
            notEmpty: true,
            isLength: {
                options: { min: 3 }
            },
            errorMessage: 'Nome precisa ter no mínimo 3 caracteres'
        },
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'Email inválido'
        },
        password: {
            notEmpty: true,
            isLength: {
                options: { min: 4 }
            },
            errorMessage: 'Senha precisa ter pelo menos 4 caracteres'
        },
        state: {
            notEmpty: true,
            isLength: {
                options: { min: 4, }
            },
            errorMessage: 'Estado precisa ter pelo menos 4 caracteres'
        }
    })

};