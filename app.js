const express = require('express');

const app = express();
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const morgan = require('morgan');
const logger = require('./utils/logger');
const blogRouter = require('./controllers/blogs.js');
const middleware = require('./utils/middleware');

morgan.token('type', (req) => {
  if (req.method !== 'POST') {
    return '';
  }
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :response-time ms :type'));

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected with MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting with MongoDB: ' + error.message);
  });

app.use(cors());
app.use(express.json());
app.use('/', blogRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
