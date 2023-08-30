const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/users');

usersRouter.post('/api/users', async (req, response) => {
  const body = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.json(savedUser);
});

usersRouter.get('/api/users', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    likes: 1,
    url: 1,
  });
  response.json(users);
});
usersRouter.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).populate('blogs', {
    title: 1,
    author: 1,
    likes: 1,
    url: 1,
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});
module.exports = usersRouter;
