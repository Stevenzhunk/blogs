const Blogs = require('../models/blogs');

const initialBlogs = [
  {
    title: 'Dead Space',
    author: 'EA games',
    url: 'www.deadspace.com',
    likes: 7788956,
  },
  {
    title: 'Half Life',
    author: 'Valve Corporation',
    url: 'www.steam.com',
    likes: 77889561414,
  },
];

const blogsInDb = async () => {
  const blogs = await Blogs.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.export = {
  initialBlogs,
  blogsInDb,
};
