import { useSelector } from 'react-redux'

const Notification = () => {
  const notification = useSelector((state) => state.notification)
  if (notification.message === null) {
    return null
  }

  const notificationStyle = {
    color: notification.type === 'error' ? 'red' : 'green',
    background: '#f4f4f4',
    fontSize: 20,
    border: `2px solid ${notification.type === 'error' ? 'red' : 'green'}`,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  return (
    <div style={notificationStyle} className="error">
      {notification.message}
    </div>
  )
}

export default Notification
