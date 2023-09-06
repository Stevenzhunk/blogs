const logger = require('./logger');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  } else if (error.name === 'BadRequestError') {
    return res.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(400).json({ error: error.message });
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token expired',
    });
  }
  next(error);
};

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);
  } else {
    req.token = null;
  }
  next();
};

const userExtractor = async (req, res, next) => {
  const authorizationHeader = req.get('authorization');

  if (
    authorizationHeader &&
    authorizationHeader.toLowerCase().startsWith('bearer ')
  ) {
    const token = authorizationHeader.substring(7);

    try {
      const decodedToken = jwt.verify(token, process.env.SECRET);
      if (decodedToken && decodedToken.id) {
        const user = await User.findById(decodedToken.id);
        req.user = user;
      }
    } catch (error) {
      console.log(error);
    }
  }
  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
