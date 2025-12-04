import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnecdote } from '../request'
import { useContext } from 'react'
import NotificationContext from '../NotificationContext'
import setNotificationWithTimeout from './NotificationTimer'

const AnecdoteForm = () => {
  const queryClient = useQueryClient()
  const { dispatch } = useContext(NotificationContext)

  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      const anecdotes = queryClient.getQueryData(['anecdotes'])
      queryClient.setQueryData(['anecdotes'], anecdotes.concat(newAnecdote))
      const contentText =
        newAnecdote && newAnecdote.content
          ? newAnecdote.content
          : String(newAnecdote)
      setNotificationWithTimeout(
        dispatch,
        `Anecdote '${contentText}' created!`,
        5,
      )
    },
    onError: (error) => {
      const message =
        (error &&
          error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        'An error occurred'
      setNotificationWithTimeout(dispatch, message, 5)
    },
  })
  const onCreate = (event) => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''

    newAnecdoteMutation.mutate(content)
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
