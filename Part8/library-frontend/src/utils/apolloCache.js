import { ALL_BOOKS } from '../queries'

export const addBookToCache = (cache, addedBook) => {
  const uniqById = (books) => {
    const seen = new Set()
    return books.filter((b) => {
      if (seen.has(b.id)) return false
      seen.add(b.id)
      return true
    })
  }

  cache.updateQuery(
    { query: ALL_BOOKS, variables: { genre: null } },
    (data) => {
      if (!data) return { allBooks: [addedBook] }

      return {
        allBooks: uniqById(data.allBooks.concat(addedBook)),
      }
    },
  )

  addedBook.genres.forEach((genre) => {
    cache.updateQuery({ query: ALL_BOOKS, variables: { genre } }, (data) => {
      if (!data) return

      return {
        allBooks: uniqById(data.allBooks.concat(addedBook)),
      }
    })
  })
}
