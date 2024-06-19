// src/models/userModel.js

let users = [];
let loggedInUsers = [];

const getAllUsers = () => users;

const addUser = (user) => {
  users.push(user);
};

const findUser = (username) => users.find(user => user.username === username);

const findUserByUsernameAndPassword = (username, password) =>
  users.find(user => user.username === username && user.password === password);

const removeUser = (username) => {
  users = users.filter(user => user.username !== username);
};

const addLoggedInUser = (username) => {
  loggedInUsers.push(username);
};

const removeLoggedInUser = (username) => {
  loggedInUsers = loggedInUsers.filter(user => user !== username);
};

module.exports = {
  getAllUsers,
  addUser,
  findUser,
  findUserByUsernameAndPassword,
  removeUser,
  addLoggedInUser,
  removeLoggedInUser,
};
