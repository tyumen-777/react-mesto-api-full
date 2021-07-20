const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, updateUser, updateUserAvatar, getMe,
} = require('../controllers/users');

usersRouter.get('/users/me', getMe);

usersRouter.get('/users', getUsers);

usersRouter.get('/users/:id', getUserById);

usersRouter.patch('/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }), updateUser);

usersRouter.patch('/users/me/avatar', updateUserAvatar);

module.exports = usersRouter;
