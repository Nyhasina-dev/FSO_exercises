const { ApolloServer } = require('@apollo/server')
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@as-integrations/express5')
const cors = require('cors')
const express = require('express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const http = require('http')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const jwt = require('jsonwebtoken')
const User = require('./models/user')

const JWT_SECRET = process.env.JWT_SECRET

const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    return null
  }

  try {
    const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
    return await User.findById(decodedToken.id)
  } catch (error) {
    return null
  }
}

const startServer = async (port = 4000) => {
  const app = express()
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // Setup WebSocket server for handling GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, msg, args) => {
        // connectionParams may contain auth token for websocket connections
        const auth = ctx.connectionParams
          ? ctx.connectionParams.authorization
          : null
        const currentUser = await getUserFromAuthHeader(auth)
        return { currentUser }
      },
    },
    wsServer,
  )

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        const currentUser = await getUserFromAuthHeader(auth)
        return { currentUser }
      },
    }),
  )

  await new Promise((resolve) => httpServer.listen(port, resolve))
  console.log(`Server ready at http://localhost:${port}/`)
}

module.exports = startServer
