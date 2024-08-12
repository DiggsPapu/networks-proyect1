import React, { useState } from "react"
import FriendRequestDropDown from '../components/FriendRequestDropDown'
import { useNavigate } from 'react-router-dom'
import { add_contact, delete_account, logOut } from '../services/auth-service'

export default function Header(){
    const navigate = useNavigate();
    const [toggleChat, setToggleChat] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const addContact = async (event) => {
        event.preventDefault();
        const form = event.currentTarget; // Get the form element
        const data = new FormData(form); // Pass the form element to FormData
        let username = data.get('contactUsername');
        const success = await add_contact(username);
        if (success) {
        setIsFormVisible(false);
        }
    };

    const logout = async () => {
        const success = await logOut();
        if (success) {
        localStorage.clear();
        navigate('/login');
        }
    };

    const deleteAccount = async () => {
        const success = await delete_account();
        if (success) {
        localStorage.clear();
        navigate('/login');
        }
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
            <button type='button' onClick={logout}>Log out</button>
            <button type='button' onClick={deleteAccount}>Delete Account</button>
            <>
                <button onClick={toggleFormVisibility}>
                AddContact
                </button>
                {isFormVisible && (
                <form onSubmit={addContact}>
                    <div>
                    <label htmlFor="contactUsername">Add contact's user name:</label>
                    <input type="text" id="contactUsername" name="contactUsername" />
                    </div>
                    <button type="submit">Submit</button>
                </form>
                )}
            </>
            <FriendRequestDropDown />
        </header>
    )
}