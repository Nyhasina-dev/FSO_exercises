import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, setBlogs, blogs, user }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = async () => {
    try {
      const updatedBlog = {
        ...blog,
        likes: blog.likes + 1,
        user: blog.user,
      }

      const returnedBlog = await blogService.update(blog.id, updatedBlog)

      setBlogs(
        blogs.map((b) =>
          b.id === blog.id ? { ...returnedBlog, user: blog.user } : b
        )
      )
    } catch (error) {
      console.error('Error liking blog:', error)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Remove blog "${blog.title}" by ${blog.author}`
    )
    if (!confirmDelete) return

    try {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter((b) => b.id !== blog.id))
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: '1px solid #ccc',
    marginBottom: 5,
  }

  const isOwner = blog.user?.username === user?.username

  return (
    <div style={blogStyle} className="blog-visible" key={blog.id}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleVisibility}>{visible ? 'hide' : 'view'}</button>
      </div>
      {visible && (
        <div className="blog-details">
          <p>{blog.url}</p>
          <div className="likes-count">
            likes {blog.likes}
            <button onClick={handleLike}>like </button>
          </div>
          <p>{blog.user?.name}</p>
          {console.log('Blog user:', blog.user)}
          {console.log('Logged in user:', user)}
          {isOwner && (
            <button onClick={handleDelete} className="delete-button">
              delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
