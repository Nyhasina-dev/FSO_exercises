const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'First blog',
    author: 'Author 1',
    url: 'http://example.com/1',
    likes: 5,
  },
  {
    title: 'Second blog',
    author: 'Author 2',
    url: 'http://example.com/2',
    likes: 10,
  },
]

let authToken
let testUserId

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const testUser = new User({ username: 'testuser', passwordHash })
  const savedUser = await testUser.save()
  testUserId = savedUser._id

  await Blog.deleteMany({})
  const initialBlogsWithUser = initialBlogs.map((blog) => ({
    ...blog,
    user: testUserId,
  }))
  await Blog.insertMany(initialBlogsWithUser)

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id,
  }
  authToken = jwt.sign(userForToken, process.env.SECRET)
})

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('unique identifier property of blogs is named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => {
      assert.strictEqual(Object.keys(blog).includes('id'), true)
      assert.strictEqual(Object.keys(blog).includes('_id'), false)
    })
  })
})

describe('POST /api/blogs', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'New blog post',
      author: 'Author 3',
      url: 'http://example.com/3',
      likes: 7,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)

    const savedBlog = response.body.find((b) => b.title === newBlog.title)
    assert.strictEqual(savedBlog.author, newBlog.author)
    assert.strictEqual(savedBlog.url, newBlog.url)
    assert.strictEqual(savedBlog.likes, newBlog.likes)
  })

  test('if likes property is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'Blog without likes',
      author: 'Author 4',
      url: 'http://example.com/4',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)
  })

  test('blog without title is not added', async () => {
    const newBlog = {
      author: 'Author 5',
      url: 'http://example.com/5',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('blog without url is not added', async () => {
    const newBlog = {
      title: 'Blog without URL',
      author: 'Author 6',
      likes: 4,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('adding a blog fails with 401 if token is not provided', async () => {
    const newBlog = {
      title: 'Unauthorized blog',
      author: 'Hacker',
      url: 'http://example.com/hack',
      likes: 5,
    }

    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
  })
})

describe('DELETE /api/blogs/:id', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)

    const titles = blogsAtEnd.map((b) => b.title)
    assert(!titles.includes(blogToDelete.title))
  })
})

describe('PUT /api/blogs/:id', () => {
  test('succeeds in updating likes of a blog', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const updatedData = { likes: blogToUpdate.likes + 10 }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
  })
})

describe('POST /api/blogs/:id/comments', () => {
  test('succeeds in adding a comment to a blog', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToComment = blogsAtStart[0]

    const response = await api
      .post(`/api/blogs/${blogToComment.id}/comments`)
      .send({ comment: 'nice article' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.comments.length, 1)
    assert.strictEqual(response.body.comments[0], 'nice article')
  })
})

after(async () => {
  await mongoose.connection.close()
})
