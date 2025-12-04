import { createContext, useReducer } from 'react'

const NotificationContext = createContext()

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      return action.payload
    case 'CLEAR_NOTIFICATION':
      return ''
    default:
      return state
  }
}

export const NotificationContextProvider = (props) => {
  const [notification, dispatch] = useReducer(notificationReducer, '')

  return (
    <NotificationContext.Provider value={{ notification, dispatch }}>
      {props.children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
