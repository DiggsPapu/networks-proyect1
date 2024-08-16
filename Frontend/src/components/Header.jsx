import React, { useState } from "react"
import FriendRequestDropDown from '../components/FriendRequestDropDown'
import { useNavigate } from 'react-router-dom'
import { useClient } from "../context/xmppContext"

export default function Header({contacts, setContacts}){
    const navigate = useNavigate()
    const [isFormVisible, setIsFormVisible] = useState(false)
    const [loggedOut, setLoggedOut] = useState(false)
    const client = useClient()

    if (loggedOut) {
        navigate('/login')
    }
    const add_contact = async (event) => {
        event.preventDefault()
        const form = event.currentTarget
        const data = new FormData(form)
        let username = data.get('contactUsername')
        console.log(username)
        client.sendSubscriptionRequest(`${username}@alumchat.lol`)
        toggleFormVisibility()
    };

    const logout_ = async () => {
        await client.logOut()
        setLoggedOut(true)
    }

    const delete_account = async () => {
        // const success = await deleteAccount();
        // if (success) {
        // localStorage.clear();
        // navigate('/login');
        // }
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
    };
    return (
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
            
            <button style={{position:'fixed', top:'0', left:'0'}}>{localStorage.getItem("username")}</button>
            <button type='button' onClick={logout_}>Log out</button>
            <button type='button' onClick={delete_account}>Delete Account</button>
            <button type='button' onClick={()=>{navigate("/profile")}}>Change Profile</button>
            <>
                <button onClick={toggleFormVisibility}>
                AddContact
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