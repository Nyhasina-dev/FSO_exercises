import { Routes, Route, Link } from 'react-router-dom'
import Users from './components/Users'
import { useNavigate } from 'react-router-dom'

import { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import {
  clearNotification,
  setNotification,
} from './reducers/notificationReducer'
import { useDispatch, useSelector } from 'react-redux'
import { initializeBlogs } from './reducers/blogReducer'
import { setUser, clearUser } from './reducers/userReducer'
import BlogList from './components/BlogList'
import User from './components/User'
import BlogView from './components/BlogView'

const App = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const user = useSelector((state) => state.user)

  const blogs = useSelector((state) => state.blogs)
  // Notification
  // const [notification, setNotification] = useState({
  //   message: null,
  //   type: null,
  // })

  useEffect(() => {
    dispatch(initializeBlogs())
  }, [dispatch])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(setUser(user))
      blogService.setToken(user.token)
    }
  }, [dispatch])

  const showNotification = (message, type = 'success') => {
    dispatch(setNotification({ message, type }))
    setTimeout(() => {
      dispatch(clearNotification())
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      dispatch(setUser(user))
      setUsername('')
      setPassword('')
      showNotification('Welcome to the Home page', 'success')
      navigate('/')
    } catch (error) {
      console.error(error)
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    dispatch(clearUser())
  }

  //creation Blog function

  const blogFormRef = useRef()

  const addBlog = async (blogObject) => {
    try {
      await blogService.create(blogObject)
      showNotification(
        `a new blog "${returnedBlog.title}" by ${returnedBlog.author} added`,
        'success'
      )
      blogFormRef.current.toggleVisibility()
      dispatch(initializeBlogs())
    } catch {
      showNotification('Error adding blog', 'error')
    }
  }

  // --- LOGIN FORM ---

  const loginForm = () => (
    <div>
      <h2> Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Username
            <input
              type="text"
              name="Username"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Password
            <input
              type="password"
              name="Password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  if (!user) {
    return (
      <div>
        <Notification />
        <h2>Log in to application</h2>
        {loginForm()}
      </div>
    )
  }

  return (
    <div>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/">blogs</Link>
        <Link to="/users" style={{ marginLeft: '1rem' }}>
          users
        </Link>
        <span style={{ float: 'right' }}>
          {user.name} logged in
          <button onClick={handleLogout} style={{ marginLeft: '0.5rem' }}>
            logout
          </button>
        </span>
      </nav>

      <Notification />

      <Routes>
        <Route
          path="/"
          element={
            <BlogList
              blogs={blogs}
              user={user}
              addBlog={addBlog}
              handleLogout={handleLogout}
            />
          }
        />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="/blogs/:id" element={<BlogView />} />
      </Routes>
    </div>
  )
}
export default App
