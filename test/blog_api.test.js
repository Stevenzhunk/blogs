const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const helper = require('./test_helper');
const Blogs = require('../models/blogs');

beforeEach(async () => {
  await Blogs.deleteMany({});

  for (let blog of helper.initialBlog) {
    let noteObject = new Blogs(blog);
    await noteObject.save();
  }
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

    expect(res.body).toHaveLength(helper.initialBlog.length);
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

    const blogsAtEnd = await helper.blogsInDb(); // Corrección: Llama a blogsInDb como función
    expect(blogsAtEnd).toHaveLength(helper.initialBlog.length + 1);

    const titles = blogsAtEnd.map((r) => r.title);
    expect(titles).toContain('test async');
  });

  test('a specific blog is within the returned blogs', async () => {
    const blogsAtEnd = await helper.blogsInDb();

    const authors = blogsAtEnd.map((r) => r.author);
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
    const blogsStart = await helper.blogsInDb();
    const createdBlog = blogsStart.find(
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
describe('one blog can be deleted', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogStart = await helper.blogsInDb();
    const blogToDelete = blogStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlog.length - 1);

    const titles = blogsAtEnd.map((r) => r.title);

    expect(titles).not.toContain(blogToDelete.title);
  });
});
describe('succedes with a blog exist and can be udapted (status 200)', () => {
  test('likes one blog can be udapted', async () => {
    const blogStart = await helper.blogsInDb();
    const blogtoUpdateById = blogStart[0];
    const newLikes = 85;
    await api
      .put(`/api/blogs/${blogtoUpdateById.id}`)
      .send({ likes: newLikes })
      .expect(200);

    const updatedBlogResponse = await api.get(
      `/api/blogs/${blogtoUpdateById.id}`
    );
    const updatedBlog = updatedBlogResponse.body;

    expect(updatedBlog.likes).toBe(newLikes);
  });
});
afterAll(() => {
  mongoose.connection.close();
});
