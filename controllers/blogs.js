const blogRouter = require('express').Router();
const Blog = require('../models/blogs.js');

blogRouter.get('/api/blogs', async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
});

blogRouter.post('/api/blogs', async (req, res) => {
  const body = req.body;
  if (!body.title || !body.url) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  });
  const result = blog.save();
  res.status(201).json(result);
});

module.exports = blogRouter;
