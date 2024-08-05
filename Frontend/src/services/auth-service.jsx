import axios from 'axios'

export async function login(username, password) {
  const response = await axios.post('http://localhost:6363/login', { "username":username, "password":password })
  return response.data
}
export async function register(username, password) {
  const response = await axios.post('http://localhost:6363/register', { "username":username, "password":password })
  return response.data
}