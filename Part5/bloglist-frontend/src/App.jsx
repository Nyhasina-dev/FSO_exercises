import { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Blog from './components/Blog'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [blogs, setBlogs] = useState([])

  // Notification
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  })

  useEffect(() => {
    if (user) {
      blogService.getAll().then((initialBlogs) => setBlogs(initialBlogs))
    }
  }, [user])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification({ message: null, type: null })
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      showNotification('Welcome to the Home page', 'success')
    } catch (error) {
      console.error(error)
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  //creation Blog function

  const blogFormRef = useRef()

  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      showNotification(
        `a new blog "${returnedBlog.title}" by ${returnedBlog.author} added`,
        'success'
      )
      blogFormRef.current.toggleVisibility()
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

  const blogList = () => (
    <div>
      <h2> Blogs </h2>
      <p>{user.name} logged in</p>{' '}
      <button onClick={handleLogout}>Logout</button>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
      <ul>
        {[...blogs]
          .sort((a, b) => b.likes - a.likes)
          .map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              blogs={blogs}
              setBlogs={setBlogs}
              user={user}
            />
          ))}
      </ul>
    </div>
  )

  return (
    <div>
      <Notification message={notification.message} type={notification.type} />
      {!user && loginForm()}
      {user && blogList()}
    </div>
  )
}
export default App
