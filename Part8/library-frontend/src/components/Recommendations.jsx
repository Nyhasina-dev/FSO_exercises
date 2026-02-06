import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'

const Recommendations = (props) => {
  const user = useQuery(ME)
  const books = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (user.loading || books.loading) {
    return <div>Loading...</div>
  }

  if (user.error) {
    return <div>Error loading user: {user.error.message}</div>
  }

  if (books.error) {
    return <div>Error loading books: {books.error.message}</div>
  }

  const currentUser = user.data?.me
  if (!currentUser) {
    return <div>Please log in to see recommendations</div>
  }

  const favoriteGenre = currentUser.favoriteGenre

  // Filter books by favorite genre
  const recommendedBooks = books.data.allBooks.filter((b) =>
    b.genres.includes(favoriteGenre),
  )

  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '10px',
    fontSize: '14px',
  }

  const thStyle = {
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #333',
    padding: '8px 5px',
  }

  const tdStyle = {
    padding: '8px 5px',
    borderBottom: '1px solid #eee',
  }

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>title</th>
            <th style={thStyle}>author</th>
            <th style={thStyle}>published</th>
          </tr>
        </thead>
        <tbody>
          {recommendedBooks.map((b) => (
            <tr key={b.id}>
              <td style={tdStyle}>{b.title}</td>
              <td style={tdStyle}>{b.author.name}</td>
              <td style={tdStyle}>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
