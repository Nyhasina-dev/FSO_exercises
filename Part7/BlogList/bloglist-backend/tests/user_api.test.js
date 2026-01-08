const mongoose = require('mongoose')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
})

describe('when there is initially one user in db', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails if username already taken', async () => {
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    assert.strictEqual(result.body.error, 'username must be unique')
  })

  test('creation fails if username is missing', async () => {
    const newUser = {
      name: 'No Username',
      password: 'salainen',
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    assert.strictEqual(result.body.error, 'username and password are required')
  })

  test('creation fails if password is missing', async () => {
    const newUser = {
      username: 'nopass',
      name: 'No Password',
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    assert.strictEqual(result.body.error, 'username and password are required')
  })

  test('creation fails if username shorter than 3 chars', async () => {
    const newUser = {
      username: 'ab',
      name: 'Short Username',
      password: 'salainen',
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    assert.strictEqual(
      result.body.error,
      'username and password must be at least 3 characters long'
    )
  })

  test('creation fails if password shorter than 3 chars', async () => {
    const newUser = {
      username: 'validname',
      name: 'Short Password',
      password: 'pw',
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    assert.strictEqual(
      result.body.error,
      'username and password must be at least 3 characters long'
    )
  })
})

after(async () => {
  await mongoose.connection.close()
})
