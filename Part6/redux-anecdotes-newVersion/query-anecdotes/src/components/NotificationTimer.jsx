const setNotificationWithTimeout = (dispatch, message, time = 5) => {
  dispatch({ type: 'SET_NOTIFICATION', payload: message })
  setTimeout(() => {
    dispatch({ type: 'CLEAR_NOTIFICATION' })
  }, time * 1000)
}

export default setNotificationWithTimeout
