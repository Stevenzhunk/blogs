const blogRouter = require('express').Router();
const Blog = require('../models/blogs.js');

blogRouter.get('/api/blogs', async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
});

blogRouter.get('/api/blogs/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then((blog) => {
      if (blog) {
        response.json(blog);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
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

blogRouter.put('/api/blogs/:id', (req, res, next) => {
  const body = req.body;

  const blog = {
    likes: body.likes,
  };

  Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
    .then((updatedBlog) => {
      res.json(updatedBlog);
    })
    .catch((error) => next(error));
});

blogRouter.delete('/api/blogs/:id', (req, res, next) => {
  Blog.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

module.exports = blogRouter;
