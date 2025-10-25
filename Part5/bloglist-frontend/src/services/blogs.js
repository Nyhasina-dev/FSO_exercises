import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const create = async (newBlog) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newBlog, config)
  return response.data
}

const update = async (id, updateBlog) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.put(`${baseUrl}/${id}`, updateBlog, config)
  return response.data
}

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`, {
    headers: { Authorization: token },
  })
  return response.data
}

export default { getAll, create, setToken, update, remove }
