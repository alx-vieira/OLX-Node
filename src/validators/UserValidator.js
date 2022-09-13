const { checkSchema } = require('express-validator');

module.exports = {

    editAction: checkSchema({
        token: {
            notEmpty: true
        },
        name: {
            optional: true,
            trim: true,
            notEmpty: true,
            isLength: {
                options: { min: 3 }
            },
            errorMessage: 'Nome precisa ter no mínimo 3 caracteres'
        },
        email: {
            optional: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'Email inválido'
        },
        password: {
            optional: true,
            notEmpty: true,
            isLength: {
                options: { min: 4 }
            },
            errorMessage: 'Senha precisa ter pelo menos 4 caracteres'
        },
        state: {
            optional: true,
            notEmpty: true,
            isLength: {
                options: { min: 4, }
            },
            errorMessage: 'Estado precisa ter pelo menos 4 caracteres'
        }
    }),

    signIn: checkSchema({
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
        }
    })

};