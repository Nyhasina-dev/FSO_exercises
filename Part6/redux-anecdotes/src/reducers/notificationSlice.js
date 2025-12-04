import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: 'welcome to anecdote',
  reducers: {
    setNotification(state, action) {
      return action.payload
    },
    clearNotification() {
      return ''
    },
  },
})

export const { setNotification, clearNotification } = notificationSlice.actions

export const setNotificationWithTimeout = (message, seconds) => {
  return (dispatch) => {
    dispatch(setNotification(message))
    // if seconds is a positive number, clear after that timeout
    // if seconds is 0, null, undefined or not positive, keep the notification persistent
    if (typeof seconds === 'number' && seconds > 0) {
      setTimeout(() => {
        dispatch(clearNotification())
      }, seconds * 1000)
    }
  }
}

export default notificationSlice.reducer
