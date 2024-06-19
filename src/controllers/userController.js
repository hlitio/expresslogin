// src/controllers/userController.js

const userModel = require('../models/userModel');

const registerUser = (req, res) => {
  const { username, password } = req.body;

  if (userModel.findUser(username)) {
    return res.status(400).json({ message: 'Usuario ya existe' });
  }

  userModel.addUser({ username, password });
  res.status(201).json({ message: 'Usuario creado' });
};

const validateUser = (req, res) => {
  const { username } = req.body;

  if (userModel.findUser(username)) {
    return res.status(200).json({ message: 'Usuario válido' });
  }

  res.status(404).json({ message: 'Usuario no encontrado' });
};

const loginUser = (req, res) => {
  const { username, password } = req.body;

  const user = userModel.findUserByUsernameAndPassword(username, password);

  if (user) {
    userModel.addLoggedInUser(username);
    return res.status(200).json({ message: 'Login exitoso' });
  }

  res.status(401).json({ message: 'Credenciales inválidas' });
};

const logoutUser = (req, res) => {
  const { username } = req.body;

  userModel.removeLoggedInUser(username);

  res.status(200).json({ message: 'Logout exitoso' });
};

const deleteUser = (req, res) => {
  const { username } = req.body;

  userModel.removeUser(username);
  userModel.removeLoggedInUser(username);

  res.status(200).json({ message: 'Usuario eliminado' });
};

module.exports = {
  registerUser,
  validateUser,
  loginUser,
  logoutUser,
  deleteUser,
};
