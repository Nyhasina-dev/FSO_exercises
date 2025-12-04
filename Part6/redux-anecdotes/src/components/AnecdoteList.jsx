import { useSelector, useDispatch } from 'react-redux'
import { voteAnecdoteAsync } from '../reducers/anecdoteReducer'
import { setNotificationWithTimeout } from '../reducers/notificationSlice'

const AnecdoteList = () => {
  const dispatch = useDispatch()
  const anecdotes = useSelector((state) => {
    const filter = state.filter.toLowerCase() || ''
    return state.anecdotes.filter((a) =>
      a.content.toLowerCase().includes(filter)
    )
  })

  const sortedAnecdotes = [...anecdotes].sort((a, b) => b.votes - a.votes)

  const vote = (anecdote) => {
    dispatch(voteAnecdoteAsync(anecdote))
    dispatch(setNotificationWithTimeout(`you voted "${anecdote.content}"`, 10))
  }

  return (
    <div>
      {sortedAnecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnecdoteList
