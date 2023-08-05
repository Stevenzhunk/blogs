const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}, 100000);
test('there are two blogs', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(2);
});

test('the second blog is about one best game ever Dead Space', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body[1].title).toBe('Dead Space');
});
afterAll(() => {
  mongoose.connection.close();
});
