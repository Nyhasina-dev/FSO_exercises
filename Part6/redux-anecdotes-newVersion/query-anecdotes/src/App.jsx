import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'
import { getAnecdotes, updateAnecdote } from './request'
import { useContext } from 'react'
import NotificationContext from './NotificationContext'
import setNotificationWithTimeout from './components/NotificationTimer'

const App = () => {
  const queryClient = useQueryClient()
  const { dispatch } = useContext(NotificationContext)

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: false,
  })
  const voteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: (updatedAnecdote) => {
      const anecdotes = queryClient.getQueryData(['anecdotes'])
      queryClient.setQueryData(
        ['anecdotes'],
        anecdotes.map((a) =>
          a.id === updatedAnecdote.id ? updatedAnecdote : a,
        ),
      )
    },
  })

  const handleVote = (anecdote) => {
    voteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 })
    setNotificationWithTimeout(
      dispatch,
      `anecdote '${anecdote.content}' voted!`,
      5,
    )
  }
  if (result.isLoading) {
    return <div>Loading...</div>
  }

  if (result.isError) {
    return <div> anecdote service not available due to problems in server</div>
  }

  const anecdotes = result.data

  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />
      <AnecdoteForm />

      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
