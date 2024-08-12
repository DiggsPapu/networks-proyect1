import axios from 'axios'

export async function login(username, password) {
  const response = await axios.post('http://localhost:6363/auth/login', { "username":username, "password":password })
  console.log(response)
  if (response.status === 200){
    return true
  }
  return false
}
export async function get_friend_requests(){
  const response = await axios.get('http://localhost:6363/handleContacts/getFriendsRequests')
  console.log(response)
  if (response.status === 200){
    localStorage.setItem("requests", JSON.stringify(response.data["friend-request"]))
    return response.data["friend-request"]
  }
  return []
}
export async function get_contacts() {
  const response = await axios.get('http://localhost:6363/handleContacts/getContacts')
  if (response.status === 200){
    console.log(response)
    localStorage.setItem("contacts", response["data"]["contacts"])
    return true
  }
  // retry
  get_contacts()
}
export async function accept_friend_request(contact){
  const response = await axios.post('http://localhost:6363/handleContacts/acceptFriendRequest', { "contact":contact })
  if (response.status !== 200){
    console.error(response)
  }
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
