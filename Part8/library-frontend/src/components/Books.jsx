import { useQuery } from '@apollo/client/react'
import { useState } from 'react'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)

  // Get filtered books by selected genre
  const books = useQuery(ALL_BOOKS, {
    variables: {
      genre: selectedGenre,
    },
  })

  // Get all books (unfiltered) to extract all genres
  const allBooksQuery = useQuery(ALL_BOOKS, {
    variables: { genre: null },
  })

  if (!props.show) {
    return null
  }

  if (books.loading || allBooksQuery.loading) {
    return <div>Loading...</div>
  }

  if (books.error) {
    return <div>Error: {books.error.message}</div>
  }

  // Get all unique genres from all books
  const allGenres = allBooksQuery.data?.allBooks
    ? [...new Set(allBooksQuery.data.allBooks.flatMap((b) => b.genres))]
    : []

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

  const genreButtonStyle = {
    display: 'inline-block',
    marginRight: '8px',
    marginBottom: '8px',
    padding: '3px 8px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: '1px solid #999',
    borderRadius: '2px',
    fontSize: '12px',
    fontWeight: 'normal',
  }

  const genreButtonSelectedStyle = {
    ...genreButtonStyle,
    backgroundColor: '#333',
    color: 'white',
    fontWeight: 'bold',
  }

  return (
    <div>
      <h2>books</h2>

      {selectedGenre && (
        <p style={{ marginBottom: '10px' }}>
          in genre <strong>{selectedGenre}</strong>
        </p>
      )}

      {allGenres.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              style={
                selectedGenre === genre
                  ? genreButtonSelectedStyle
                  : genreButtonStyle
              }
            >
              {genre}
            </button>
          ))}
          <button
            onClick={() => setSelectedGenre(null)}
            style={
              selectedGenre === null
                ? genreButtonSelectedStyle
                : genreButtonStyle
            }
          >
            all genres
          </button>
        </div>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>title</th>
            <th style={thStyle}>author</th>
            <th style={thStyle}>published</th>
          </tr>
        </thead>
        <tbody>
          {books.data.allBooks.map((a) => (
            <tr key={a.id}>
              <td style={tdStyle}>{a.title}</td>
              <td style={tdStyle}>{a.author.name}</td>
              <td style={tdStyle}>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
