import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { initializeUsers } from '../reducers/usersReducer'

const User = () => {
  const dispatch = useDispatch()
  const users = useSelector((state) => state.users)
  const { id } = useParams()

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(initializeUsers())
    }
  }, [dispatch, users])

  const user = users.find((u) => u.id === id)

  if (!user) {
    return null
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      <ul>
        {user.blogs.map((blog) => (
          <li key={blog.id}>{blog.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default User
