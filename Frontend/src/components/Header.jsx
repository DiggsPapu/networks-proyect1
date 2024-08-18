import React, { useState } from "react"
import FriendRequestDropDown from '../components/FriendRequestDropDown'
import { useNavigate } from 'react-router-dom'
import { useClient } from "../context/xmppContext"

export default function Header({ contacts, setContacts }) {
    const navigate = useNavigate() // Hook to navigate between routes
    const [isFormVisible, setIsFormVisible] = useState(false) // State to toggle the visibility of the add contact form
    const [loggedOut, setLoggedOut] = useState(false) // State to handle logging out
    const client = useClient() // Retrieve the XMPP client from context

    // Redirect to login page if logged out
    if (loggedOut) {
        navigate('/login')
    }

    // Function to handle adding a new contact
    const add_contact = async (event) => {
        event.preventDefault() // Prevent the form from refreshing the page
        const form = event.currentTarget
        const data = new FormData(form) // Create a FormData object to extract input values
        let username = data.get('contactUsername') // Get the username from the form
        console.log(username)
        client.enviarSubscripcion(`${username}@alumchat.lol`) // Send a subscription request using the client's method
        toggleFormVisibility() // Hide the form after submission
    };

    // Function to handle logging out
    const salir_ = async () => {
        await client.salir() // Call the client's logout method
        setLoggedOut(true) // Update state to trigger navigation to the login page
    }

    // Function to handle account deletion
    const delete_account = async () => {
        client.borrarCuenta(() => { navigate('/login') }) // Call the client's delete account method and navigate to login
    }

    // Toggle the visibility of the add contact form
    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible)
    };

    return (
        // The return section and styles remain unchanged, so they are not commented
        <header style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '60px',
            backgroundColor: '#333',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000',
        }}>
            <div style={{position:'fixed', top:'0', left:'0'}}>{client.jid}</div>
            <button type='button' onClick={salir_}>Log out</button>
            <button type='button' onClick={delete_account}>Delete Account</button>
            <button type='button' onClick={() => {navigate("/profile")}}>Change Profile</button>
            <>
                <button onClick={toggleFormVisibility}>
                Add Contact
                </button>
                {isFormVisible && (
                <form onSubmit={add_contact}>
                    <div>
                    <label htmlFor="contactUsername">Add contact's user name:</label>
                    <input type="text" id="contactUsername" name="contactUsername" />
                    </div>
                    <button type="submit">Submit</button>
                </form>
                )}
            </>
            <FriendRequestDropDown contacts={contacts} setContacts={setContacts}/>
        </header>
    )
}
