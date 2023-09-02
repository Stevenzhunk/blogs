const blogRouter = require('express').Router();
const Blog = require('../models/blogs');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

blogRouter.get('/api/blogs', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  res.json(blogs);
});

blogRouter.get('/api/blogs/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('user', {
    username: 1,
    name: 1,
  });

  if (blog) {
    res.json(blog);
  } else {
    res.status(404).end();
  }
});

blogRouter.post('/api/blogs', async (req, res) => {
  try {
    const body = req.body;

    //console.log('New Blog Data:', body);
    if (!body.title || !body.url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }
    //console.log('Blog received by controller', body.userId);
    //const usersController = await User.find({});
    //console.log('users in controller', usersController);
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!req.token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }
    const user = await User.findById(decodedToken.id);
    const findedUser = await User.findById(decodedToken.id);
    if (!findedUser) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    //console.log(findedUser);

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id,
    });
    const savedBlog = await blog.save();
    findedUser.blogs = findedUser.blogs.concat(savedBlog._id);
    //console.log(findedUser.blogs);
    await findedUser.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error in post request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

blogRouter.put('/api/blogs/:id', async (req, res) => {
  const body = req.body;

  const blog = {
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
    new: true,
  });
  res.json(updatedBlog);
});

blogRouter.delete('/api/blogs/:id', async (req, res) => {
  await Blog.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

module.exports = blogRouter;
