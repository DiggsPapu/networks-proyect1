import React, { useState } from "react"

// ContactBar functional component for displaying contacts and selecting a specific contact
export default function ContactBar({ setContact, contacts }) {
    const [contactoEspecifico, setContactoEspecifico] = useState('') // State to manage input for a specific contact's JID

    return (
        // The return section remains unchanged, so it is not commented
        <div style={{
            width: '30%',
            backgroundColor: 'grey',
            height: 'calc(100% - 60px)',
            position: 'fixed',
            top: '60px',
            left: '0',
        }}>
            <label>To message someone that is not in your roaster enter the username@alumchat.lol:</label>
            <input onChange={(e) => setContactoEspecifico(e.target.value)}></input>
            <br/>
            <button onClick={() => {
                setContact({ jid: contactoEspecifico, status: "Desconocido no es de tu roaster", statusMessage: "Desconocido no es de tu roaster" })}
            }>enter</button>
            <ul>
                Roaster<br/>
            {Object.keys(contacts).length === 0 ? (
                <p>No contacts added</p>
            ) : (
            <>
                {Object.entries(contacts).map(([jid, contact]) => (
                <button onClick={() => {
                    setContact(contact)}
                    }>
                    contact:{contact.jid}<br/>
                    status:{contact.status}<br/>
                    status message:{contact.statusMessage || "No status message"}<br/>
                </button>
                ))}
            </>
            )}
            </ul>
        </div>
    );
}
