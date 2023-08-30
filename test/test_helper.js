const Blogs = require('../models/blogs');
const User = require('../models/users');

const initialBlog = [
  {
    title: 'Dead Space',
    author: 'EA games',
    url: 'www.deadspace.com',
    likes: 7788956,
    user: '64eea4a8fe72984c81945a11',
  },
  {
    title: 'Half Life',
    author: 'Valve Corporation',
    url: 'www.steam.com',
    likes: 77889561414,
    user: '64eea4a8fe72984c81945a11',
  },
];

const nonExistingId = async () => {
  const blog = new Blogs({ content: 'willremovethissoon', date: new Date() });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blogs.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlog,
  blogsInDb,
  nonExistingId,
  usersInDb,
};
