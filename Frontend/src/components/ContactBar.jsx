import React, { useState } from "react";

export default function ContactBar({setContact, contacts}) {

    return (
        <div style={{
            width: '30%',
            backgroundColor: 'grey',
            height: 'calc(100% - 60px)',
            position: 'fixed',
            top: '60px',
            left: '0',
        }}>
            <ul>
            {Object.keys(contacts).length === 0 ? (
                <p>No contacts added</p>
            ) : (
            <>
                {Object.entries(contacts).map(([jid, contact]) => (
                <button onClick={()=>{
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
