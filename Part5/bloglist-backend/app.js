const mongoose = require('mongoose')
const express = require('express')
const app = express()
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const testingRouter = require('./controllers/testing')
const {
  errorHandler,
  tokenExtractor,
  userExtractor,
} = require('./utils/middleware')
const loginRouter = require('./controllers/login')
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
  })

app.use(express.json())

app.use(tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(errorHandler)

module.exports = app
