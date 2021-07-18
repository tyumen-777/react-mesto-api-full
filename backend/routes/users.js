const usersRouter = require('express').Router();
const {
  getUsers, getUserById, updateUser, updateUserAvatar, getMe,
} = require('../controllers/users');

usersRouter.get('/users/me', getMe);

usersRouter.get('/users', getUsers);

usersRouter.get('/users/:id', getUserById);

usersRouter.patch('/users/me', updateUser);

usersRouter.patch('/users/me/avatar', updateUserAvatar);

module.exports = usersRouter;
