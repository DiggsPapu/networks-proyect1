import React, { useState } from "react"
import FriendRequestDropDown from '../components/FriendRequestDropDown'
import { useNavigate } from 'react-router-dom'
import { useClient } from "../context/xmppContext";
// import { addContact, deleteAccount, getContacts, logout } from '../services/services'

export default function Header({contacts, setContacts, friendRequests, setFriendRequests}){
    const navigate = useNavigate();
    const [toggleChat, setToggleChat] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const client = useClient()
    const add_contact = async (event) => {
        event.preventDefault();
        const form = event.currentTarget; // Get the form element
        const data = new FormData(form); // Pass the form element to FormData
        let username = data.get('contactUsername');
        // const success = await addContact(username);
        // if (success) {
        //     // await getContacts();
        //     setIsFormVisible(false);
        // }
    };

    const logout_ = async () => {
        // const success = await logout();
        // if (success) {
        // localStorage.clear();
        // navigate('/login');
        // }
    };

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