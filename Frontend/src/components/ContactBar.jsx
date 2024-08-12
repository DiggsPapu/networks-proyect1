import React, { useState } from "react";

export default function ContactBar() {
    const [contacts, setContacts] = useState(JSON.parse(localStorage.getItem("contacts") || "[]"));

    return (
        <div style={{
            width: '30%',
            backgroundColor: 'grey',
            height: 'calc(100% - 60px)', // Adjust height to account for the header
            position: 'fixed',
            top: '60px', // Start right after the header
            left: '0',
        }}>
            <ul>
                {
                    contacts && contacts.length > 0 ?
                    contacts.map((contact, index) => (
                        <li key={index}>{contact.jid}</li>
                    ))
                    : <>No Contacts</>
                }
            </ul>
        </div>
    );
}
