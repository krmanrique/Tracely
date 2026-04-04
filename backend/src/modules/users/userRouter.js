const express = require('express');
const userController = require('./userController');
const route = express.Router();

route.post('/register', userController.registerUser);
route.post('/login', userController.loginUser);
route.get('/', userController.getAllUsers);
route.get('/:id', userController.getOneUser);
route.put('/:id', userController.updateUser);
route.delete('/:id', userController.deleteUser);

module.exports = route;