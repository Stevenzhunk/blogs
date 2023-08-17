const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const helper = require('./test_helper');
const blogs = require('../models/blogs');

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

beforeEach(async () => {
  await blogs.deleteMany({});
  let blogObject = new blogs(initialBlogs[0]);
  await blogObject.save();
  blogObject = new blogs(initialBlogs[1]);
  await blogObject.save();
});

describe('when blogs are created', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  }, 100000);
  test('there are two blogs', async () => {
    const res = await api.get('/api/blogs');

    expect(res.body).toHaveLength(2);
  });

  test('the second blog is about one best game ever Half Life', async () => {
    const res = await api.get('/api/blogs');

    expect(res.body[1].title).toBe('Half Life');
  });

  test('getting correct number of blogs', async () => {
    const res = await api.get('/api/blogs');

    expect(res.body).toHaveLength(initialBlogs.length);
  });
});
describe('then blogs can be', () => {
  test('one blog can be added', async () => {
    const newBlog = {
      title: 'test async',
      author: 'local',
      url: 'www.example.com',
      likes: 200,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const res = await api.get('/api/blogs');
    const titles = res.body.map((r) => r.title);
    expect(res.body).toHaveLength(initialBlogs.length + 1);
    expect(titles).toContain('test async');
  });
  test('a specific blog is within the returned blogs', async () => {
    const res = await api.get('/api/blogs');

    const authors = res.body.map((r) => r.author);
    expect(authors).toContain('Valve Corporation');
  });
});
describe('when blogs not complete', () => {
  test('blog without likes defaults to 0', async () => {
    const newBlogNolikes = {
      title: 'test async',
      author: 'local',
      url: 'www.example.com',
    };

    await api
      .post('/api/blogs')
      .send(newBlogNolikes)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const res = await api.get('/api/blogs');
    const createdBlog = res.body.find(
      (blog) => blog.title === newBlogNolikes.title
    );

    expect(createdBlog.likes).toBe(0);
  });
  test('blog without url or title get response 400 bad request', async () => {
    const newBlog = {
      author: 'test',
      likes: 4,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect((res) => {
        expect(res.body.error).toContain('Title and URL are required');
      });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
