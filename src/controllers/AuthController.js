const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { validationResult, matchedData } = require('express-validator');

const User = require('../models/User');
const State = require('../models/State');

module.exports = {

    signIn: async (req, res) => {

    },

    signUp: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }

        const data = matchedData(req);

        // Validando E-mail
        const user = await User.findOne({ email: data.email });
        if(user) {
            res.json({
                error: {
                    email: { msg: 'E-mail já cadastrado' }
                }
            });
            return;
        }

        // Validando o Estado
        if(mongoose.Types.ObjectId.isValid(data.state)) {
            const state = await State.findById(data.state);
            if(!state) {
                res.json({
                    error: {
                        state: { msg: 'Estado não encontrado' }
                    }
                });
                return;
            }
        } else {
            res.json({
                error: {
                    state: { msg: 'Valor não equivalente a um Id' }
                }
            });
            return;
        }

        // Password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Token
        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        // New User
        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash,
            token,
            state: data.state
        });
        await newUser.save();

        res.json({ token });
    }
};
