const express = require('express');
const route = express.Router();

const AdsController = require('./controllers/AdsController');
const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');

route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

// Login
route.post('/user/signin', AuthController.signIn);
route.post('/user/signup', AuthController.signUp);

// State List
route.get('/states', UserController.getStates);

// User Data
route.get('/user/me', UserController.info);
route.put('/user/me', UserController.editAction);

// Ads Data
route.get('/categories', AdsController.getCategories);
route.post('/ad/add', AdsController.addAction);
route.get('/ad/list', AdsController.getList);
route.get('/ad/item', AdsController.getItem);
route.post('/add/:id', AdsController.editAction);

module.exports = route;
