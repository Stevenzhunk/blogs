const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const helper = require('./test_helper');
const Blogs = require('../models/blogs');
const bcrypt = require('bcrypt');
const User = require('../models/users');

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
  test('a new blog can be added', async () => {
    //first get a one user and his id (first this case) in data base because data base user always get deleted
    const testUsers = await helper.usersInDb();
    const testUser = testUsers[0];
    console.log(testUser); //first user getted
    const newBlog = {
      title: 'Testing',
      author: 'testingLocal',
      url: 'www.localpost.com',
      likes: 8888888,
      userId: testUser.id, // Used ID de testUser
    };

    console.log('Sending New Blog test:', newBlog);
    const usersTest = await helper.usersInDb();
    console.log('users in test', usersTest);

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlog.length + 1);

    const titles = blogsAtEnd.map((r) => r.title);
    expect(titles).toContain('Testing');
  });

  test('a specific blog is within the returned blogs', async () => {
    const blogsAtEnd = await helper.blogsInDb();

    const authors = blogsAtEnd.map((r) => r.author);
    expect(authors).toContain('Valve Corporation');
  });
});
describe('when blogs not complete', () => {
  test('blog without likes defaults to 0', async () => {
    const testUsers = await helper.usersInDb();
    const testUser = testUsers[0];
    console.log(testUser);
    const newBlogNolikes = {
      title: 'Test',
      author: 'testing Local',
      url: 'www.localpost.com',
      userId: testUser.id,
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
describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash, name: 'root' });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
