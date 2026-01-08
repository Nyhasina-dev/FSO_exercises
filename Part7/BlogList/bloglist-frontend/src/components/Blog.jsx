import { useState } from 'react'
import blogService from '../services/blogs'
import { useDispatch } from 'react-redux'
import { likeBlog, deleteBlog } from '../reducers/blogReducer'

const Blog = ({ blog, setBlogs, blogs, user }) => {
  const [visible, setVisible] = useState(false)
  const dispatch = useDispatch()

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = () => {
    dispatch(likeBlog(blog))
  }

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `Remove blog "${blog.title}" by ${blog.author}?`
    )
    if (confirmDelete) {
      dispatch(deleteBlog(blog.id))
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
