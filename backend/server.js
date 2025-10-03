import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import express from 'express'

// Sample data
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
]

// GraphQL schema definition
const typeDefs = `#graphql
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`

// Resolvers define how to fetch the types defined in your schema.
const resolvers = {
  Query: {
    books: () => books,
  },
}

// Required logic for integrating with Express
const app = express()
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// Note you must call `start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`.
await server.start()

// Specify the path where we'd like to mount our server
app.use('/graphql', cors(), express.json(), expressMiddleware(server))

const PORT = 4000
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
})
