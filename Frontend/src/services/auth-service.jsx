import axios from 'axios'

export async function login(username, password) {
  const response = await axios.post('http://localhost:6363/auth/login', { "username":username, "password":password })
  console.log(response)
  localStorage.setItem("friendRequests", response["data"]["friend-requests"])
  if (response.status === 200){
    return true
  }
  return false
}
export async function logOut() {
  const response = await axios.get('http://localhost:6363/auth/logout', {})
  console.log(response)
  if (response.status === 205){
    console.log("prueba")
    return true
  }
  return false
}
export async function register(username, password) {
  const response = await axios.post('http://localhost:6363/auth/register', { "username":username, "password":password })
  console.log(response)
  if (response.status !== 409){
    return true
  }
  return false
}
export async function delete_account() {
  const response = await axios.get('http://localhost:6363/auth/deleteAccount')
  if (response.status === 205){
    console.log("prueba")
    return true
  }
  return false
}
export async function add_contact(username) {
  const response = await axios.post('http://localhost:6363/handleContacts/addContact', { "contact":username })
  console.log(response)
  if (response.status !== 401){
    return true
  }
  return false
}
