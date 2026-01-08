import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import blogService from '../services/blogs'
import { likeBlog, deleteBlog } from '../reducers/blogReducer'
import { initializeBlogs } from '../reducers/blogReducer'

const BlogView = () => {
  const dispatch = useDispatch()
  const blogs = useSelector((state) => state.blogs)
  const { id } = useParams()
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!blogs || blogs.length === 0) {
      dispatch(initializeBlogs())
    }
  }, [dispatch, blogs])

  const blog = blogs.find((b) => b.id === id)

  if (!blog) return null

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

  const submitComment = async (e) => {
    e.preventDefault()
    if (!comment) return
    try {
      await blogService.addComment(blog.id, comment)
      setComment('')
      dispatch(initializeBlogs())
    } catch (error) {
      console.error('Error adding comment', error)
    }
  }

  return (
    <div className="blog-view">
      <h2>
        {blog.title} {blog.author}
      </h2>
      <a href={blog.url}>{blog.url}</a>
      <div>
        <span>likes {blog.likes}</span>
        <button onClick={handleLike}>like</button>
      </div>
      <div>added by {blog.user?.name}</div>
      <div>
        <button onClick={handleDelete}>delete</button>
      </div>

      <h3>comments</h3>
      <form onSubmit={submitComment}>
        <input
          type="text"
          value={comment}
          onChange={({ target }) => setComment(target.value)}
          placeholder="Add a comment"
        />
        <button type="submit">add comment</button>
      </form>

      <div className="comments">
        <ul>
          {(blog.comments || []).map((c, index) => (
            <li key={index}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default BlogView
