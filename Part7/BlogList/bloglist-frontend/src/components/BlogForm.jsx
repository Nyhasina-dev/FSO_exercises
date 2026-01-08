import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    createBlog({
      title: newTitle,
      author: newAuthor,
      url: newUrl,
    })
    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
  }

  return (
    <div>
      <h3> Create new</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            title
            <input
              type="text"
              name="Title"
              value={newTitle}
              onChange={({ target }) => setNewTitle(target.value)}
              placeholder="Title"
            />
          </label>
        </div>
        <div>
          <label>
            Author
            <input
              type="text"
              name="Author"
              value={newAuthor}
              onChange={({ target }) => setNewAuthor(target.value)}
              placeholder="Author"
            />
          </label>
        </div>
        <div>
          <label>
            url
            <input
              type="text"
              name="Url"
              value={newUrl}
              onChange={({ target }) => setNewUrl(target.value)}
              placeholder="URL"
            />
          </label>
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm
