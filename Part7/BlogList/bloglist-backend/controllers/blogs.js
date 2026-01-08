const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')
//GET REQUEST
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

//POST REQUEST
blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  })

  const savedBlog = await blog.save()

  const populatedBlog = await Blog.findById(savedBlog._id).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(populatedBlog)
})

//DELETE REQUEST
blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (!blog.user) {
    return response.status(400).json({ error: 'blog has no user field' })
  }

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  // comparing the Token user with the blog creator

  if (blog.user.toString() !== user._id.toString()) {
    return response
      .status(401)
      .json({ error: 'only the creator can delete this blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

//PUT REQUEST
blogsRouter.put('/:id', userExtractor, async (request, response) => {
  const { likes } = request.body

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  }

  blog.likes = likes
  const updatedBlog = await blog.save()

  const populatedBlog = await Blog.findById(updatedBlog._id).populate('user', {
    username: 1,
    name: 1,
  })

  response.json(updatedBlog)
})

// POST a comment to a blog (anonymous)
blogsRouter.post('/:id/comments', async (request, response) => {
  console.log(
    'Received comment POST for blog',
    request.params.id,
    'body:',
    request.body
  )
  const { comment } = request.body

  if (!comment) {
    return response.status(400).json({ error: 'comment missing' })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  blog.comments = blog.comments ? blog.comments.concat(comment) : [comment]
  const savedBlog = await blog.save()
  const populatedBlog = await Blog.findById(savedBlog._id).populate('user', {
    username: 1,
    name: 1,
  })

  response.status(201).json(populatedBlog)
})

module.exports = blogsRouter
