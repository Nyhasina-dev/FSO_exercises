import { createSlice } from '@reduxjs/toolkit'
import blogService from '../services/blogs'

const BlogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload
    },
    appendBlog(state, action) {
      state.push(action.payload)
    },
    updatedBlog(state, action) {
      const updatedBlog = action.payload
      return state.map((blog) =>
        blog.id === updatedBlog.id ? updatedBlog : blog
      )
    },
    removeBlog(state, action) {
      const id = action.payload
      return state.filter((blog) => blog.id !== id)
    },
  },
})

export const { setBlogs, appendBlog, updatedBlog, removeBlog } =
  BlogSlice.actions

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs))
  }
}

export const likeBlog = (blog) => {
  return async (dispatch) => {
    const blogToUpdate = { ...blog, likes: blog.likes + 1 }
    const returnedBlog = await blogService.update(blog.id, blogToUpdate)
    dispatch(updatedBlog(returnedBlog))
  }
}

export const deleteBlog = (blogId) => {
  return async (dispatch) => {
    await blogService.remove(blogId)
    dispatch(removeBlog(blogId))
  }
}

export default BlogSlice.reducer
