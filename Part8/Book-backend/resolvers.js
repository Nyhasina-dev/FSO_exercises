const Book = require('./models/book')
const Author = require('./models/author')
const { GraphQLError } = require('graphql')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')

const JWT_SECRET = process.env.JWT_SECRET

const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {}

      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          return []
        }
        filter.author = author._id
      }

      if (args.genre) {
        filter.genres = { $in: [args.genre] }
      }

      return Book.find(filter).populate('author')
    },
    allAuthors: async () => {
      const authors = await Author.find({})

      const counts = await Book.aggregate([
        { $group: { _id: '$author', count: { $sum: 1 } } },
      ])

      const countsMap = {}
      counts.forEach((c) => {
        countsMap[c._id.toString()] = c.count
      })

      return authors.map((a) => ({
        ...a.toObject(),
        id: a._id.toString(),
        bookCount: countsMap[a._id.toString()] || 0,
      }))
    },
    me: (root, args, context) => {
      return context.currentUser || null
    },
  },
  Author: {
    bookCount: async (root) => {
      const authorId =
        root._id || (await Author.findOne({ name: root.name }))._id
      return Book.countDocuments({ author: authorId })
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }
      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          if (error.name === 'ValidationError') {
            throw new GraphQLError(error.message, {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
              },
            })
          }

          if (error.code === 11000) {
            throw new GraphQLError('Author must be unique', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
              },
            })
          }

          throw new GraphQLError('Failed to create author', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          })
        }
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      })

      try {
        const saved = await book.save()
        const populated = await saved.populate('author')

        // publish the newly added book to subscribers
        pubsub.publish('BOOK_ADDED', { bookAdded: populated })

        return populated
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError(error.message, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title,
            },
          })
        }

        if (error.code === 11000) {
          throw new GraphQLError('Book title must be unique', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title,
            },
          })
        }

        throw new GraphQLError('Failed to add book', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        })
      }
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })
      try {
        return await user.save()
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError(error.message, {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.username },
          })
        }
        if (error.code === 11000) {
          throw new GraphQLError('Username must be unique', {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.username },
          })
        }
        throw new GraphQLError('Failed to create user', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        })
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordCorrect = args.password === 'secret'

      if (!user || !passwordCorrect) {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) return null

      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError(error.message, {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name },
          })
        }

        throw new GraphQLError('Failed to edit author', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        })
      }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}

// Note: createUser and other resolvers remain defined above; to avoid
// accidental ordering issues we exported resolvers here.
module.exports = resolvers
