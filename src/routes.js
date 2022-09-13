const express = require('express');
const route = express.Router();

const AdsController = require('./controllers/AdsController');
const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');

const Auth = require('./middlewares/Auth');

const AuthValidator = require('./validators/AuthValidator');
const UserValidator = require('./validators/UserValidator');

route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

// State List
route.get('/states', Auth.private, UserController.getStates);

// Login
route.post('/user/signin', AuthValidator.signIn, AuthController.signIn);
route.post('/user/signup', AuthValidator.signUp, AuthController.signUp);

// User Data
route.get('/user/me', Auth.private, UserController.info);
route.put('/user/me', UserValidator.editAction, Auth.private, UserController.editAction); 

// Ads Data
route.get('/categories', AdsController.getCategories);
route.post('/ad/add', Auth.private, AdsController.addAction);
route.get('/ad/list', AdsController.getList);
route.get('/ad/item', AdsController.getItem);
route.post('/add/:id', Auth.private, AdsController.editAction);

module.exports = route;
