const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const NotAuthError = require('../errors/not-auth-error');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const isAuthorized = require('../helpers/isAuthorized');

const { NODE_ENV, JWT_SECRET } = process.env;

// const getCurrentUser = (req, res, next) => {
//
//   const id = req.user._id;
//   User.findById(id)
//     .then((user) => {
//       if (!user) {
//         throw new NotFoundError('Нет пользователя с таким id');
//       }
//       return res.status(200).send({ data: user });
//     })
//     .catch(next);
// };
const getCurrentUser = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(req.user._id);
  if (!isAuthorized(token)) {
    throw new NotFoundError('Доступ запрещен');
  }

  return User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send({ data: user });
    })
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError(err.message);
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
    }))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(err.message);
      }
      if (err.code === 11000 && err.code === 'MongoError') {
        throw new ConflictError('Пользователь с таким email уже существует');
      }
    })
    .catch(next);
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const owner = req.user._id;
  return User.findByIdAndUpdate(owner, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(err.message);
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const owner = req.user._id;
  return User.findOneAndUpdate(owner, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(err.message);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' });
      return res.send({ token });
    })
    .catch((err) => {
      throw new NotAuthError(err.message);
    })
    .catch(next);
};

module.exports = {
  getCurrentUser,
  getUsers,
  getUserById,
  createUser,
  updateUserAvatar,
  updateUser,
  login,
};
